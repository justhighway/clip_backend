const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  setUserProfile,
  getUserProfile,
} = require("../controllers/usersController");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/setUserProfile", setUserProfile);
router.post("/getUserProfile", getUserProfile);

module.exports = router;
