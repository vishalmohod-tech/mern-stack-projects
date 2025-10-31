// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'feedbacks.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// helper functions
function readFeedbacks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveFeedbacks(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// serve static files
function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
  };

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method.toUpperCase();

  // GET feedback list
  if (url === '/api/feedbacks' && method === 'GET') {
    const data = readFeedbacks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // POST new feedback
  if (url === '/api/feedbacks' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { name, message } = JSON.parse(body);
        const feedbacks = readFeedbacks();
        feedbacks.push({ name, message, time: new Date().toLocaleString() });
        saveFeedbacks(feedbacks);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid Data' }));
      }
    });
    return;
  }

  // serve static files
  const filePath = path.join(PUBLIC_DIR, url === '/' ? '/feedback.html' : url);
  serveFile(filePath, res);
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
