// controllers/usersController.js
const db = require("../db/mysql");
const jwtUtil = require("../utils/jwt");
const uidUtil = require("../utils/uid");
const bcrypt = require("bcrypt");

const signup = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;
    console.log("sign up req.body:", req.body);

    // Hashing user password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Generating UID
    const uid = uidUtil.generateUid();

    // Inserting user into database
    await db.query(
      "INSERT INTO users (uid, userEmail, userPassword) VALUES (?, ?, ?)",
      [uid, userEmail, hashedPassword]
    );

    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signin = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    // Fetching user from database
    const [user] = await db.query("SELECT * FROM users WHERE userEmail = ?", [
      userEmail,
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validating user password
    const isValidPassword = await bcrypt.compare(
      userPassword,
      user.userPassword
    );

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generating JWT tokens
    const accessToken = jwtUtil.generateAccessToken(user.uid);
    const refreshToken = jwtUtil.generateRefreshToken(user.uid);

    res.json({ accessToken, refreshToken, uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, signin };
