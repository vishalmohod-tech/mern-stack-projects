const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;

const PUBLIC = path.join(__dirname, "public");
const CONTENT = path.join(__dirname, "content");

if (!fs.existsSync(CONTENT)) fs.mkdirSync(CONTENT);

function sendFile(res, filePath, type) {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
}

const server = http.createServer((req, res) => {

    if (req.url.startsWith("/post")) {
        return sendFile(res, path.join(PUBLIC, "post.html"), "text/html");
    }

    // Serve static files
    if (req.url.startsWith("/")) {
        let filePath = path.join(PUBLIC, req.url === "/" ? "lastf.html" : req.url);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const type = {
                ".html": "text/html",
                ".css": "text/css",
                ".js": "text/javascript"
            }[ext] || "text/plain";

            return sendFile(res, filePath, type);
        }
    }

    if (req.url === "/api/all") {
        const files = fs.readdirSync(CONTENT);
        const posts = files.map(f => {
            const id = f.replace(".txt", "");
            const raw = fs.readFileSync(path.join(CONTENT, f), "utf-8");
            const [category, content] = raw.split("||");

            return { id, category, content };
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(posts));
    }

    if (req.url.startsWith("/api/get")) {
        const id = req.url.split("=")[1];
        const file = path.join(CONTENT, id + ".txt");

        if (!fs.existsSync(file)) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: "Not found" }));
        }

        const raw = fs.readFileSync(file, "utf-8");
        const [category, content] = raw.split("||");

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ id, category, content }));
    }

    if (req.url === "/api/create" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const { category, content } = JSON.parse(body);
            const id = Date.now().toString();

            fs.writeFileSync(path.join(CONTENT, id + ".txt"), category + "||" + content);

            res.writeHead(200);
            res.end(JSON.stringify({ success: true, id }));
        });
        return;
    }

    if (req.url === "/api/update" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", () => {
            const { id, category, content } = JSON.parse(body);

            fs.writeFileSync(path.join(CONTENT, id + ".txt"), category + "||" + content);

            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
        });
        return;
    }

    if (req.url.startsWith("/api/delete")) {
        const id = req.url.split("=")[1];
        fs.unlinkSync(path.join(CONTENT, id + ".txt"));

        res.writeHead(200);
        return res.end(JSON.stringify({ success: true }));
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(PORT, () => console.log("Server running on PORT " + PORT));
