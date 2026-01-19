const express = require("express");
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize(["SUPER_ADMIN"]));

router.get("/admins", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, role FROM users WHERE role = 'ADMIN' ORDER BY username"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/admins", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'ADMIN')",
      [username, hash]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/admins/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ? AND role = 'ADMIN'", [
      hash,
      id,
    ]);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/admins/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ? AND role = 'ADMIN'", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

