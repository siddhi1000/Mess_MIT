const express = require("express");
const pool = require("../db");
const { authenticate, authorize } = require("../middleware/auth");
const { createStudentSchema, menuSchema, feedbackSchema } = require("../validation/schemas");

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN", "ADMIN"]));

router.get("/dashboard-summary", async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) AS totalStudents FROM students");
    const [[{ totalAttendanceToday }]] = await pool.query(
      "SELECT COUNT(*) AS totalAttendanceToday FROM attendance WHERE date = CURDATE()"
    );
    const [[{ totalUnpaid }]] = await pool.query(
      "SELECT COUNT(*) AS totalUnpaid FROM billing WHERE status = 'UNPAID'"
    );
    res.json({
      totalStudents,
      totalAttendanceToday,
      totalUnpaid,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/students", async (req, res) => {
  const search = req.query.search || "";
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE name LIKE ? OR roll_number LIKE ? ORDER BY name",
      [`%${search}%`, `%${search}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const bcrypt = require("bcryptjs");

// ... existing imports

router.post("/students", async (req, res) => {
  const { error, value } = createStudentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const { name, email, rollNumber, roomNumber, active } = value;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Create User account (username = rollNumber, default password = rollNumber)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rollNumber, salt); // Default password is rollNumber

    const [userResult] = await connection.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'STUDENT')",
      [rollNumber, hash]
    );
    const userId = userResult.insertId;

    // 2. Create Student record linked to User
    const [result] = await connection.query(
      "INSERT INTO students (user_id, name, email, roll_number, room_number, active) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, email, rollNumber, roomNumber, active]
    );

    await connection.commit();
    res.status(201).json({ id: result.insertId, userId: userId });
  } catch (err) {
    await connection.rollback();
    // Handle duplicate entry errors (e.g. username/email/roll_number already exists)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Student with this Email or Roll Number already exists." });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
});

router.put("/students/:id", async (req, res) => {
  const { error, value } = createStudentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const { id } = req.params;
  const { name, email, rollNumber, roomNumber, active } = value;
  try {
    await pool.query(
      "UPDATE students SET name = ?, email = ?, roll_number = ?, room_number = ?, active = ? WHERE id = ?",
      [name, email, rollNumber, roomNumber, active, id]
    );
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM students WHERE id = ?", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/menus", async (req, res) => {
  const date = req.query.date;
  try {
    if (date) {
      const [rows] = await pool.query("SELECT * FROM menus WHERE date = ?", [date]);
      return res.json(rows[0] || null);
    }
    const [rows] = await pool.query("SELECT * FROM menus ORDER BY date DESC LIMIT 30");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/menus", async (req, res) => {
  const { error, value } = menuSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  const { date, breakfast, lunch, dinner } = value;
  try {
    await pool.query(
      "INSERT INTO menus (date, breakfast, lunch, dinner) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE breakfast = VALUES(breakfast), lunch = VALUES(lunch), dinner = VALUES(dinner)",
      [date, breakfast, lunch, dinner]
    );
    res.status(201).json({ message: "Saved" });
  } catch (err) {
    console.error("Menu save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/attendance", async (req, res) => {
  const date = req.query.date;
  try {
    const [rows] = await pool.query(
      "SELECT a.id, a.date, s.name, s.roll_number, a.present FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.date = ? ORDER BY s.roll_number",
      [date || new Date().toISOString().slice(0, 10)]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/billing", async (req, res) => {
  const month = req.query.month;
  try {
    const [rows] = await pool.query(
      "SELECT b.id, b.student_id, s.name, s.roll_number, b.month, b.amount, b.status FROM billing b JOIN students s ON b.student_id = s.id WHERE b.month = ? ORDER BY s.roll_number",
      [month]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/billing/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["PAID", "UNPAID"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    await pool.query("UPDATE billing SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/feedback", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT f.id, f.message, f.status, f.created_at, s.name, s.roll_number FROM feedback f JOIN students s ON f.student_id = s.id ORDER BY f.created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/feedback/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["NEW", "REVIEWED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    await pool.query("UPDATE feedback SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
