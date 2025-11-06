import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { IncomingForm } from "formidable";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const mergedDir = path.join(__dirname, "merged");
if (!fs.existsSync(mergedDir)) fs.mkdirSync(mergedDir);

function serveStaticFile(res, filepath, contentType) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("File not found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    serveStaticFile(res, path.join(__dirname, "public", "file-mergeut.html"), "text/html");
  } else if (req.url === "/file-mergeut.css") {
    serveStaticFile(res, path.join(__dirname, "public", "file-mergeut.css"), "text/css");
  } else if (req.url === "/file-mergeut.js") {
    serveStaticFile(res, path.join(__dirname, "public", "file-mergeut.js"), "text/javascript");
  } else if (req.url === "/merge" && req.method === "POST") {
    const form = new IncomingForm({ multiples: true, uploadDir: mergedDir });
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500);
        res.end("File upload error");
        return;
      }

      const file1 = fs.readFileSync(files.file1[0].filepath, "utf8");
      const file2 = fs.readFileSync(files.file2[0].filepath, "utf8");

      const mergedContent = file1 + "\n\n" + file2;
      const mergedPath = path.join(mergedDir, "merged.txt");
      fs.writeFileSync(mergedPath, mergedContent);

      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify({ downloadUrl: "/download" }));
    });
  } else if (req.url === "/download" && req.method === "GET") {
    const filePath = path.join(mergedDir, "merged.txt");
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Disposition": "attachment; filename=merged.txt",
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
