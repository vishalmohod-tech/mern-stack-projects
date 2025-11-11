const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const BLOGS_FILE = path.join(__dirname, "blogs.json");

if (!fs.existsSync(BLOGS_FILE)) fs.writeFileSync(BLOGS_FILE, "[]", "utf8");

function getBlogs() {
  return JSON.parse(fs.readFileSync(BLOGS_FILE, "utf8"));
}
function saveBlogs(blogs) {
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf8");
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

  // ✅ API Routes first
  if (method === "GET" && url === "/blogs") {
    const blogs = getBlogs();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(blogs));
  }

  if (method === "POST" && url === "/add-blog") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const newBlog = JSON.parse(body);
        const blogs = getBlogs();
        newBlog.id = Date.now();
        newBlog.date = new Date().toLocaleString();
        blogs.push(newBlog);
        saveBlogs(blogs);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Blog added successfully" }));
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }

  if (method === "DELETE" && url.startsWith("/delete-blog")) {
    const id = Number(new URL(req.url, `http://${req.headers.host}`).searchParams.get("id"));
    let blogs = getBlogs();
    blogs = blogs.filter(b => b.id !== id);
    saveBlogs(blogs);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Blog deleted" }));
  }

  // ✅ Static files (after API)
  const filePath = path.join(PUBLIC, url === "/" ? "logpb.html" : url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
    } else {
      const ext = path.extname(filePath);
      const mime = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript"
      }[ext] || "text/plain";
      res.writeHead(200, { "Content-Type": mime });
      res.end(data);
    }
  });
});

server.listen(PORT, () =>
  console.log(`🚀 Local Blog Publisher running at http://localhost:${PORT}`)
);
