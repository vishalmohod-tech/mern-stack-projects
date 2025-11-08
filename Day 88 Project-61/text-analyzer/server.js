const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

function serveStaticFile(res, filePath, contentType, responseCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Error");
    } else {
      res.writeHead(responseCode, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

// Create server
const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      serveStaticFile(res, "./public/textal.html", "text/html");
    } else if (req.url === "/textal.css") {
      serveStaticFile(res, "./public/textal.css", "text/css");
    } else if (req.url === "/textal.js") {
      serveStaticFile(res, "./public/textal.js", "application/javascript");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  }

  if (req.method === "POST" && req.url === "/analyze") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      const { text } = JSON.parse(body);

      const words = text.trim().split(/\s+/);
      const wordCount = words.length;
      const charCount = text.replace(/\s/g, "").length;
      const sentenceCount = text.split(/[.!?]+/).filter(Boolean).length;
      const longestWord = words.reduce((a, b) => (b.length > a.length ? b : a), "");

     
      const frequency = {};
      let mostRepeated = "";
      let maxCount = 0;

      for (let w of words) {
        const word = w.toLowerCase().replace(/[^a-z]/g, "");
        if (!word) continue;
        frequency[word] = (frequency[word] || 0) + 1;
        if (frequency[word] > maxCount) {
          maxCount = frequency[word];
          mostRepeated = word;
        }
      }

      const result = {
        wordCount,
        charCount,
        sentenceCount,
        longestWord,
        mostRepeated,
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
