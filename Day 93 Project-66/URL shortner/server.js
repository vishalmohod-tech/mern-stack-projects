const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "urls.json");

if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));

function generateShortCode() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const server = http.createServer((req, res) => {

  if (req.url === "/" && req.method === "GET") {
    fs.readFile(path.join(PUBLIC, "urlsh.html"), (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  }

  else if (req.url.match(/\.(css|js)$/)) {
    const filePath = path.join(PUBLIC, req.url);
    const ext = path.extname(filePath);
    const type = ext === ".css" ? "text/css" : "application/javascript";
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not Found");
      } else {
        res.writeHead(200, { "Content-Type": type });
        res.end(data);
      }
    });
  }

  else if (req.url === "/shorten" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      const { longUrl } = JSON.parse(body);
      const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

      const existing = Object.entries(data).find(([key, value]) => value === longUrl);
      if (existing) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ shortCode: existing[0] }));
        return;
      }

      const shortCode = generateShortCode();
      data[shortCode] = longUrl;
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ shortCode }));
    });
  }

  else if (req.url.length === 7 && req.method === "GET") {
    const code = req.url.slice(1);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    const longUrl = data[code];

    if (longUrl) {
      res.writeHead(301, { Location: longUrl });
      res.end();
    } else {
      res.writeHead(404);
      res.end("Short URL not found.");
    }
  }
  else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🔗 URL Shortener running at http://localhost:${PORT}`);
});
