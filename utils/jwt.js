// utils/jwt.js
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = "secret";
const REFRESH_TOKEN_SECRET = "secret";

const generateAccessToken = (uid) => {
  return jwt.sign({ uid }, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};

const generateRefreshToken = (uid) => {
  return jwt.sign({ uid }, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
