const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    let filePath = "";
  let contentType = "text/html";
  if (req.url === "/" || req.url === "/visitor.html") {
    fs.readFile(path.join(__dirname, "visitor.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.url === "/visitor.css") {
    fs.readFile(path.join(__dirname, "visitor.css"), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
  } else if (req.url === "/visitor.js") {
    fs.readFile(path.join(__dirname, "visitor.js"), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.end(data);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

