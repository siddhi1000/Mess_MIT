const express = require("express");
const pool = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// ------------------------------
// Mark attendance for today
// ------------------------------
router.post("/mark", authenticate, authorize(["STUDENT"]), async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );

    if (!student) {
      return res.status(400).json({ message: "Student record not found" });
    }

    const studentId = student.id;

    const [[existing]] = await pool.query(
      "SELECT id FROM attendance WHERE student_id = ? AND date = ?",
      [studentId, today]
    );

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    await pool.query(
      "INSERT INTO attendance (student_id, date, present) VALUES (?, ?, 1)",
      [studentId, today]
    );

    res.status(201).json({ message: "Attendance marked for today" });
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ------------------------------
// Generate QR payload for student
// ------------------------------
router.get("/qr/:studentId", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), async (req, res) => {
  const { studentId } = req.params;

  try {
    const token = Buffer.from(JSON.stringify({ studentId })).toString("base64url");
    res.json({ qrPayload: token });
  } catch (err) {
    console.error("QR generation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------------
// Mark attendance via QR scan
// ------------------------------
router.post("/mark-by-qr", authenticate, authorize(["STUDENT"]), async (req, res) => {
  const { payload } = req.body;

  if (!payload) {
    return res.status(400).json({ message: "Missing payload" });
  }

  try {
    // Decode QR payload
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

    // Map logged-in user → student
    const [[student]] = await pool.query(
      "SELECT id FROM students WHERE user_id = ?",
      [req.user.userId]
    );

    if (!student || decoded.studentId !== student_id) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Check if attendance is already marked
    const [[existing]] = await pool.query(
      "SELECT id FROM attendance WHERE student_id = ? AND date = ?",
      [student_id, today]
    );

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked" });
    }

    // Insert attendance
    await pool.query(
      "INSERT INTO attendance (student_id, date, present) VALUES (?, ?, 1)",
      [student_id, today]
    );

    res.status(201).json({ message: "Attendance marked via QR" });
  } catch (err) {
    console.error("QR attendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
