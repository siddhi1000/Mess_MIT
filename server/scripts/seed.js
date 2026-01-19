const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

async function seed() {
  console.log("🌱 Starting seed process...");
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log("✅ Connected to MySQL server");

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' checked/created`);

    // Switch to database
    await connection.changeUser({ database: process.env.DB_NAME });

    // Define tables based on schema.sql
    // We use IF NOT EXISTS to avoid errors
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'STUDENT') NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        room_number VARCHAR(50) NOT NULL,
        active TINYINT(1) NOT NULL DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        breakfast TEXT NOT NULL,
        lunch TEXT NOT NULL,
        dinner TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        present TINYINT(1) NOT NULL DEFAULT 1,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_attendance_student_date (student_id, date)
      )`,
      `CREATE TABLE IF NOT EXISTS billing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        month CHAR(7) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_billing_student_month (student_id, month)
      )`,
      `CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        message TEXT NOT NULL,
        status ENUM('NEW', 'REVIEWED') NOT NULL DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )`
    ];

    for (const query of queries) {
      await connection.query(query);
    }
    console.log("✅ All tables checked/created");

    // Check if superadmin exists
    const [rows] = await connection.query("SELECT * FROM users WHERE username = 'superadmin'");
    
    if (rows.length === 0) {
      const password = "superadmin123";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await connection.query(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
        ["superadmin", hash, "SUPER_ADMIN"]
      );
      console.log("✅ Super Admin user created (username: superadmin, password: superadmin123)");
    } else {
      console.log("ℹ️ Super Admin user already exists");
      // Update password to be sure
      const password = "superadmin123";
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await connection.query("UPDATE users SET password_hash = ? WHERE username = 'superadmin'", [hash]);
      console.log("✅ Super Admin password reset to 'superadmin123'");
    }

  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    if (connection) await connection.end();
    console.log("👋 Seed process finished");
  }
}

seed();
