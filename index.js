// index.js
const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/users");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Routes
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
