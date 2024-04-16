const express = require("express");

const { getUserItems, addUserItem } = require("../controllers/itemsController");
const router = express.Router();

router.get("/get-user-items", getUserItems);
router.post("/add-user-item", addUserItem);

module.exports = router;
