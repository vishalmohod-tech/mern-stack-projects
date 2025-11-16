const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const messages = JSON.parse(fs.readFileSync("messages.json", "utf8"));

app.get("/message", (req, res) => {
  const random = messages[Math.floor(Math.random() * messages.length)];
  res.json({ message: random });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/dmsg.html");
});


app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

