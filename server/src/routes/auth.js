const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authenticate } = require("../middleware/auth");
const { loginSchema, changePasswordSchema } = require("../validation/schemas");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  // 1️⃣ Validate request body
  const { error, value } = loginSchema.validate(req.body || {});
  if (error || !value) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  const { username, password } = value;

  try {
    // 2️⃣ Find user
    const [rows] = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username = ?",
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // 3️⃣ Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // 5️⃣ Respond
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/change-password
router.post("/change-password", authenticate, async (req, res) => {
  const { error, value } = changePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const { oldPassword, newPassword } = value;
  const userId = req.user.userId;

  try {
    // 1. Get current user
    const [rows] = await pool.query("SELECT password_hash FROM users WHERE id = ?", [userId]);
    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = rows[0];

    // 2. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // 4. Update password
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;