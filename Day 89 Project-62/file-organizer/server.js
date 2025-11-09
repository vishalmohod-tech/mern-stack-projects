const http = require("http");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");

const PORT = 3000;

const organizeFiles = (uploadDir) => {
  const organizedDir = path.join(uploadDir, "organized");
  if (!fs.existsSync(organizedDir)) fs.mkdirSync(organizedDir);

  const categories = {
    Images: [".jpg", ".jpeg", ".png", ".gif"],
    Documents: [".pdf", ".docx", ".txt"],
    Videos: [".mp4", ".mov", ".avi"],
    Audios: [".mp3", ".wav"],
  };

  const files = fs.readdirSync(uploadDir);
  for (const file of files) {
    const filePath = path.join(uploadDir, file);
    if (fs.lstatSync(filePath).isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    let folderName = "Others";

    for (const [key, exts] of Object.entries(categories)) {
      if (exts.includes(ext)) {
        folderName = key;
        break;
      }
    }

    const destDir = path.join(organizedDir, folderName);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

    fs.renameSync(filePath, path.join(destDir, file));
  }
};

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    fs.readFile("./public/fileorgn.html", (err, data) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(data);
    });
  } else if (req.url === "/organize" && req.method === "POST") {
    const form = formidable({ multiples: true, uploadDir: "./uploads", keepExtensions: true });

    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Error organizing files." }));
        return;
      }

      organizeFiles("./uploads");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "✅ Files organized successfully!" }));
    });
  } else {
    const filePath = path.join("./public", req.url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      const type = ext === ".css" ? "text/css" : "application/javascript";
      res.writeHead(200, { "Content-Type": type });
      res.end(fs.readFileSync(filePath));
    }
  }
});

server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
