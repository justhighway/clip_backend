const express = require("express");
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/users", usersRouter);
app.use("/items", itemsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
