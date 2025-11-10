const http = require("http");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const UPLOADS = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS);

function sendFile(res, file, type) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("File not found");
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function organizeFiles() {
  const files = fs.readdirSync(UPLOADS);
  const summary = {
    Documents: 0,
    Images: 0,
    Videos: 0,
    Others: 0
  };

  const types = {
    Documents: [".pdf", ".doc", ".docx", ".txt", ".xlsx"],
    Images: [".jpg", ".jpeg", ".png", ".gif"],
    Videos: [".mp4", ".mkv", ".avi"]
  };

  const today = new Date().toISOString().split("T")[0]; 

  for (const file of files) {
    const filePath = path.join(UPLOADS, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    let category = "Others";

    for (const [type, extensions] of Object.entries(types)) {
      if (extensions.includes(ext)) {
        category = type;
        break;
      }
    }

    const targetDir = path.join(UPLOADS, category, today);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const newPath = path.join(targetDir, file);
    fs.renameSync(filePath, newPath);
    summary[category]++;
  }

  return summary;
}

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    const filePath = path.join(PUBLIC, req.url === "/" ? "fileorgn.html" : req.url);
    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript"
    };
    return sendFile(res, filePath, types[ext] || "text/plain");
  }

  if (req.method === "POST" && req.url === "/upload") {
    const filename = req.headers["filename"] || "file_" + Date.now();
    const savePath = path.join(UPLOADS, filename);
    const fileStream = fs.createWriteStream(savePath);

    pipeline(req, fileStream, (err) => {
      if (err) {
        res.writeHead(500);
        return res.end("Upload error");
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Uploaded");
    });
    return;
  }

  if (req.method === "POST" && req.url === "/organize") {
    const summary = organizeFiles();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(summary));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => console.log("Server running on port", PORT));
