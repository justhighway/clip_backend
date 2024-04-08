const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.headers;

    // Verify refresh token
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    // Generate new access token
    const accessToken = generateAccessToken(decoded.uid);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, refreshAccessToken };
