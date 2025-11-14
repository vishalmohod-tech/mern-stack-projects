const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const screenshotDir = path.join(__dirname, "screenshots");
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}
function serveStatic(req, res) {
    let filePath = path.join(__dirname, "public", req.url === "/" ? "screensh.html" : req.url);

    const ext = path.extname(filePath);
    const mimeTypes = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".png": "image/png",
        ".jpg": "image/jpeg"
    };

    const contentType = mimeTypes[ext] || "text/plain";

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("Not Found");
        } else {
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
}
const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/upload") {
        let body = [];

        req.on("data", chunk => body.push(chunk));

        req.on("end", () => {
            const buffer = Buffer.concat(body);

            const fileName = `screenshot_${Date.now()}.png`;
            const filePath = path.join(screenshotDir, fileName);

            fs.writeFile(filePath, buffer, () => {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Saved", file: fileName }));
            });
        });

        return;
    }

    serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
