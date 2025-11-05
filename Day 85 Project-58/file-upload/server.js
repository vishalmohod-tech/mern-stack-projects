const http = require("http");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

 
  if (method === "GET") {
    if (url === "/") {
      return serveFile(res, "./public/file.html", "text/html");
    } else if (url.endsWith(".css")) {
      return serveFile(res, path.join(__dirname, "public", url), "text/css");
    } else if (url.endsWith(".js")) {
      return serveFile(res, path.join(__dirname, "public", url), "text/javascript");
    } else if (url.startsWith("/uploads/")) {
      return serveFile(res, `.${url}`, "application/octet-stream");
    }
  }


  if (url === "/upload" && method === "POST") {
    let data = Buffer.alloc(0);

    req.on("data", (chunk) => {
      data = Buffer.concat([data, chunk]);
    });

    req.on("end", () => {
      const contentType = req.headers["content-type"];
      const boundary = contentType.split("boundary=")[1];
      const parts = data.toString().split(`--${boundary}`);

      for (const part of parts) {
        if (part.includes("filename=")) {
          const filenameMatch = part.match(/filename="(.+?)"/);
          const filename = filenameMatch ? filenameMatch[1] : "file";
          const fileStart = part.indexOf("\r\n\r\n") + 4;
          const fileEnd = part.lastIndexOf("\r\n");
          const fileData = part.slice(fileStart, fileEnd);

          fs.writeFileSync(path.join(uploadDir, filename), fileData, "binary");

          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            success: true,
            filename,
            url: `/uploads/${filename}`
          }));
        }
      }

      res.writeHead(400);
      res.end("No file uploaded");
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const PORT = 3000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

