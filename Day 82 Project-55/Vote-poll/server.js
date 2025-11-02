const http = require("http");
const fs = require("fs");
const path = require("path");

let votes = { html: 0, css: 0, js: 0 };

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname;

  if (pathname === "/") {
    // Serve HTML
    fs.readFile("./public/vote.html", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (pathname === "/vote.css") {
    // Serve CSS
    fs.readFile("./public/style.css", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
  } else if (pathname === "/vote") {
    // Handle voting
    const lang = requestUrl.searchParams.get("lang");
    if (votes[lang] !== undefined) {
      votes[lang]++;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(votes));
  } else if (pathname.endsWith("/results")) {

    // Send results
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(votes));
  } else {
    // 404
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(3000, () => console.log("Server running at http://localhost:3000"));
