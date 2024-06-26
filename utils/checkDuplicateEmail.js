// backend/utils/checkDuplicateEmail.js
const db = require("../db/db");

const checkDuplicateEmail = async (userEmail) => {
  const [rows] = await db.execute("SELECT * FROM USERS WHERE USER_EMAIL = ?", [
    userEmail,
  ]);
  return rows.length > 0;
};

module.exports = checkDuplicateEmail;
