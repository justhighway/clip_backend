const bcrypt = require("bcrypt");
const db = require("../db/db");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const generateUid = require("../utils/uid");
const checkDuplicateEmail = require("../utils/checkDuplicateEmail");
require("dotenv").config();

const signUp = async (req, res) => {
  try {
    const { userEmail, userPassword, userName } = req.body;

    // req.body를 확인하여 올바른 값이 전달되었는지 확인합니다.
    if (!userEmail || !userPassword || !userName) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // 중복된 이메일인지 확인
    const isDuplicateEmail = await checkDuplicateEmail(userEmail);
    if (isDuplicateEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 10);
    const uid = generateUid();

    // SQL 쿼리 실행 시 바인드할 값이 모두 제대로 전달되었는지 확인합니다.
    await db.execute(
      "INSERT INTO users (uid, userEmail, userPassword, userName) VALUES (?, ?, ?, ?)",
      [uid, userEmail, hashedPassword, userName]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signIn = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    const [rows] = await db.execute("SELECT * FROM users WHERE userEmail = ?", [
      userEmail,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(userPassword, user.userPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.uid);
    const refreshToken = generateRefreshToken(user.uid);

    res.status(200).json({ accessToken, refreshToken, uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const setUserProfile = async (req, res) => {
  try {
    // Verify access token
    const accessToken = req.headers.authorization.split(" ")[1];
    const { uid } = verifyToken(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );

    // Update user profile in the database
    const { userName } = req.body;
    await db.execute("UPDATE users SET userName = ? WHERE uid = ?", [
      userName,
      uid,
    ]);

    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Set User Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const [rows] = await db.execute("SELECT * FROM users WHERE uid = ?", [uid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "user not found" });
    }

    const user = rows[0];
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { signUp, signIn, setUserProfile, getUser };
