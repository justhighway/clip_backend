// routes/users.js
const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.post("/signup", userController.signup); // Updated reference to the signup function
router.post("/signin", userController.signin); // Updated reference to the signin function

module.exports = router;
