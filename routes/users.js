const express = require("express");
const router = express.Router();
const {
  signUp,
  signIn,
  setUserProfile,
} = require("../controllers/usersController");

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/setUserProfile", setUserProfile);

module.exports = router;
