const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const PORT = process.env.PORT || 3000;


function serveStaticFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Server error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const uploadedFilePath = path.join(__dirname, "uploaded.txt");

if (!fs.existsSync(uploadedFilePath)) {
  fs.writeFileSync(uploadedFilePath, "", "utf8");
  console.log("✅ Created empty uploaded.txt file to prevent startup crash");
}

const server = http.createServer((req, res) => {
  if (req.method === "GET") {
    if (req.url === "/") {
      serveStaticFile(res, "./public/textc.html", "text/html");
    } else if (req.url === "/textc.css") {
      serveStaticFile(res, "./public/textc.css", "text/css");
    } else if (req.url === "/textc.js") {
      serveStaticFile(res, "./public/textc.js", "application/javascript");
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  }

  else if (req.url === "/compress" && req.method === "POST") {
    const filePath = path.join(__dirname, "uploaded.txt");
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);
    req.on("end", () => {
       if (!fs.existsSync(filePath)) {
        console.log("⚠️ No uploaded file found yet — waiting for first upload");
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("No file uploaded yet.");
      }
      const gzip = zlib.createGzip();
      const source = fs.createReadStream(filePath);
      const destination = fs.createWriteStream("compressed.gz");

      source
        .pipe(gzip)
        .pipe(destination)
        .on("finish", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ file: "compressed.gz" }));
        });
    });
  }

  else if (req.url === "/extract" && req.method === "POST") {
    const filePath = path.join(__dirname, "uploaded.gz");
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);
    req.on("end", () => {
       if (!fs.existsSync(filePath)) {
        console.log("⚠️ No uploaded .gz file found yet — waiting for first upload");
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("No compressed file uploaded yet.");
      }
      const gunzip = zlib.createGunzip();
      const source = fs.createReadStream(filePath);
      const destination = fs.createWriteStream("extracted.txt");

      source
        .pipe(gunzip)
        .pipe(destination)
        .on("finish", () => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ file: "extracted.txt" }));
        });
    });
  }

  else if (req.url.startsWith("/download/") && req.method === "GET") {
    const fileName = req.url.split("/download/")[1];
    const filePath = path.join(__dirname, fileName);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("File not found");
      }
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });
      res.end(data);
    });
  }
});

server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


