const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const contentDir = path.join(__dirname, "content");

if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir);

function serveStatic(req, res) {
    let filePath = path.join(__dirname, "public", req.url === "/" ? "lastf.html" : req.url);
    let ext = path.extname(filePath);

    const types = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript"
    };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end("404 - Not Found");
        } else {
            res.writeHead(200, { "Content-Type": types[ext] || "text/plain" });
            res.end(content);
        }
    });
}

function handleAPI(req, res) {
    const parsed = url.parse(req.url, true);

    if (req.method === "GET" && parsed.pathname === "/api/content") {
        const files = fs.readdirSync(contentDir).filter(f => f.endsWith(".json"));
        const data = files.map(f => {
            const d = JSON.parse(fs.readFileSync(path.join(contentDir, f)));
            return d;
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
    }

    // POST: Create Content
    if (req.method === "POST" && parsed.pathname === "/api/create") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const obj = JSON.parse(body);
            const fileName = obj.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";

            fs.writeFileSync(path.join(contentDir, fileName), JSON.stringify(obj, null, 2));

            res.writeHead(200);
            res.end("Created");
        });
        return;
    }

    if (req.method === "PUT" && parsed.pathname === "/api/update") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const obj = JSON.parse(body);
            const fileName = obj.oldTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";
            const newFileName = obj.title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";

            fs.unlinkSync(path.join(contentDir, fileName));
            fs.writeFileSync(path.join(contentDir, newFileName), JSON.stringify(obj, null, 2));

            res.writeHead(200);
            res.end("Updated");
        });
        return;
    }

    if (req.method === "DELETE" && parsed.pathname === "/api/delete") {
        const title = parsed.query.title;
        const fileName = title.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".json";

        fs.unlinkSync(path.join(contentDir, fileName));

        res.writeHead(200);
        res.end("Deleted");
        return;
    }
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith("/api")) return handleAPI(req, res);
    serveStatic(req, res);
});

server.listen(PORT, () => console.log(`CMS running on port ${PORT}`));
