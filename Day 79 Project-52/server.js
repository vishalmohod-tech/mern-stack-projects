const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
      let filePath = "";
  let contentType = "text/html";

  if (req.url === "/" || req.url === "/visitor.html") {
    filePath = path.join(__dirname, "visitor.html");
      } else if (req.url === "/visitor.css") {
        filePath = path.join(__dirname, "visitor.css");
    contentType = "text/css";
      } else if (req.url === "/visitor.js") {
    filePath = path.join(__dirname, "visitor.js");
    contentType = "text/javascript";
      } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    return;
  }

      fs.readFile(filePath, (err, data) => {
        if (err) {
      console.error("File read error:", err); 
          res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
          return;
    }
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
