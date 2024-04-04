const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

port = 3000;

app.use(cors());
app.use(express.json());

// router, callback - 해당 루트로 접속 시 보낼 거
app.get("/", (req, res) => {
  res.send(`<h1>hello world!</h1>`);
});

app.listen(port, () => {
  console.log(`server on port ${port}!`);
});
