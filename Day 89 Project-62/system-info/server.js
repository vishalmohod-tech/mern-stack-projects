const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = 3000;

function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpuModel: os.cpus()[0].model,
    cpuCores: os.cpus().length,
    totalMem: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
    freeMem: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
    uptime: (os.uptime() / 3600).toFixed(2) + " hours",
    homeDir: os.homedir(),
    hostname: os.hostname(),
  };
}

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    const html = fs.readFileSync("./public/systeminf.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else if (req.url === "/systeminf.css") {
    const css = fs.readFileSync("./public/systeminf.css");
    res.writeHead(200, { "Content-Type": "text/css" });
    res.end(css);
  } else if (req.url === "/systeminf.js") {
    const js = fs.readFileSync("./public/systeminf.js");
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(js);
  } else if (req.url === "/api/system-info") {
    const info = getSystemInfo();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(info));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
