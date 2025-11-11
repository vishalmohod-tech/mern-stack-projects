const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, "public");
const BLOGS_FILE = path.join(__dirname, "blogs.json");

if (!fs.existsSync(BLOGS_FILE)) fs.writeFileSync(BLOGS_FILE, "[]", "utf8");

    function sendFile(res, file, type) {
    fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

    function getBlogs() {
     return JSON.parse(fs.readFileSync(BLOGS_FILE, "utf8"));
}

    function saveBlogs(blogs) {
     fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf8");
}

const server = http.createServer((req, res) => {

  if (req.method === "GET") {
     const filePath = path.join(PUBLIC, req.url === "/" ? "logpb.html" : req.url);
    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript"
    };
      return sendFile(res, filePath, types[ext] || "text/plain");
  }

  if (req.method === "GET" && req.url === "/blogs") {
    const blogs = getBlogs();
     res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(blogs));
  }

  if (req.method === "POST" && req.url === "/add-blog") {
    let body = "";
     req.on("data", chunk => body += chunk);
     req.on("end", () => {
         const newBlog = JSON.parse(body);
         const blogs = getBlogs();
         newBlog.id = Date.now();
         newBlog.date = new Date().toLocaleString();
         blogs.push(newBlog);
         saveBlogs(blogs);
         res.writeHead(200, { "Content-Type": "application/json" });
         res.end(JSON.stringify({ message: "Blog added successfully!" }));
    });
    return;
  }

  if (req.method === "DELETE" && req.url.startsWith("/delete-blog")) {
     const id = Number(new URL(req.url, `http://${req.headers.host}`).searchParams.get("id"));
      let blogs = getBlogs();
      blogs = blogs.filter(b => b.id !== id);
     saveBlogs(blogs);
     res.writeHead(200, { "Content-Type": "application/json" });
     res.end(JSON.stringify({ message: "Blog deleted!" }));
     return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
