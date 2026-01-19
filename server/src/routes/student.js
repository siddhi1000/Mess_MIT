const express = require("express");
const pool = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize(["STUDENT"]));

// -----------------------------
// Student dashboard
// -----------------------------
router.get("/dashboard", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Map logged-in user → student
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.userId]
    );

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    const studentId = student.id;

    // Today's menu
    const [[menu]] = await pool.query(
      "SELECT * FROM menus WHERE date = ?",
      [today]
    );

    // Today's attendance
    const [[attendance]] = await pool.query(
      "SELECT id, present FROM attendance WHERE student_id = ? AND date = ?",
      [studentId, today]
    );

    // Latest billing
    const [billingRows] = await pool.query(
      "SELECT * FROM billing WHERE student_id = ? ORDER BY month DESC LIMIT 1",
      [studentId]
    );

    res.json({
      todayMenu: menu || null,
      todayAttendance: attendance || null,
      latestBill: billingRows[0] || null,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Student billing history
// -----------------------------
router.get("/billing", async (req, res) => {
  try {
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.userId]
    );

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    const studentId = student.id;

    const [rows] = await pool.query(
      "SELECT month, amount, status FROM billing WHERE student_id = ? ORDER BY month DESC",
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Billing error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Student attendance history
// -----------------------------
router.get("/attendance-history", async (req, res) => {
  try {
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.userId]
    );

    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }

    const studentId = student.id;

    const [rows] = await pool.query(
      "SELECT date, present FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 60",
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Attendance history error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------------
// Student feedback submission
// -----------------------------
router.post("/feedback", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: "Feedback message is required" });
  }

  try {
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.userId]
    );

    if (!student) {
      return res.status(400).json({ message: "Student record not found" });
    }

    await pool.query(
      "INSERT INTO feedback (student_id, message, status) VALUES (?, ?, 'NEW')",
      [student.id, message]
    );

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
