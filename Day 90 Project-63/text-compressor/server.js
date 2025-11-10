const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");

function sendFile(res, file, type) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("File not found");
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function getBody(req, callback) {
  let data = [];
  req.on("data", chunk => data.push(chunk));
  req.on("end", () => callback(Buffer.concat(data)));
}

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    let filePath = path.join(
      PUBLIC,
      req.url === "/" ? "textc.html" : req.url
    );
    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
    };
    const type = types[ext] || "text/plain";
    return sendFile(res, filePath, type);
  }

  if (req.method === "POST" && req.url === "/compress") {
    getBody(req, (body) => {
      const text = body.toString();
      zlib.gzip(text, (err, result) => {
        if (err) {
          res.writeHead(500);
          return res.end("Error compressing text");
        }
        res.writeHead(200, {
          "Content-Type": "application/gzip",
          "Content-Disposition": "attachment; filename=compressed.gz",
        });
        res.end(result);
      });
    });
    return;
  }

  if (req.method === "POST" && req.url === "/decompress") {
    getBody(req, (body) => {
      zlib.gunzip(body, (err, result) => {
        if (err) {
          res.writeHead(500);
          return res.end("Error decompressing file");
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(result);
      });
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => console.log("Server running on port", PORT));
