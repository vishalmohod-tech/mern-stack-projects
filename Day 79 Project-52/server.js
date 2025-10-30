// server.js - tiny Node server that serves files and a counter endpoint
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const COUNTER_FILE = path.join(__dirname, 'counter.txt'); // stores a single number

// ensure counter file exists with "0"
if (!fs.existsSync(COUNTER_FILE)) fs.writeFileSync(COUNTER_FILE, '0', 'utf8');

function sendFile(res, filepath, contentType) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url;

  // serve index
  if (url === '/' || url === '/visitor.html') {
    return sendFile(res, path.join(PUBLIC, 'visitor.html'), 'text/html');
  }

  // serve static files (css, js)
  if (url.endsWith('.css')) return sendFile(res, path.join(PUBLIC, url), 'text/css');
  if (url.endsWith('.js')) return sendFile(res, path.join(PUBLIC, url), 'text/javascript');

  // API: GET /api/counter -> returns current count
  if (req.method === 'GET' && url === '/api/counter') {
    const val = fs.readFileSync(COUNTER_FILE, 'utf8').trim() || '0';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ count: Number(val) }));
  }

  // API: POST /api/counter -> increments counter and returns new value
  if (req.method === 'POST' && url === '/api/counter') {
    // simple safe read-modify-write
    try {
      const current = Number(fs.readFileSync(COUNTER_FILE, 'utf8').trim() || '0');
      const next = current + 1;
      fs.writeFileSync(COUNTER_FILE, String(next), 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ count: next }));
    } catch (e) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: 'Could not update counter' }));
    }
  }

  // fallback
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

