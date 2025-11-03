const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

function shiftText(s, shift) {
  const MIN = 32, MAX = 126, RANGE = MAX - MIN + 1;
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code >= MIN && code <= MAX) {
      const n = ((code - MIN + shift) % RANGE + RANGE) % RANGE;
      out += String.fromCharCode(MIN + n);
    } else {
      out += s[i];
    }
  }
  return out;
}

function parseJSONBody(req, cb) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const json = JSON.parse(body || '{}');
      cb(null, json);
    } catch (err) {
      cb(err);
    }
  });
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === '/api/encode' && method === 'POST') {
    return parseJSONBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      }
      const text = typeof data.text === 'string' ? data.text : '';
      const shift = Number.isFinite(data.shift) ? Number(data.shift) : 3;
      const encoded = shiftText(text, shift);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, result: encoded }));
    });
  }

  if (url === '/api/decode' && method === 'POST') {
    return parseJSONBody(req, (err, data) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      }
      const text = typeof data.text === 'string' ? data.text : '';
      const shift = Number.isFinite(data.shift) ? Number(data.shift) : 3;
      const decoded = shiftText(text, -shift);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, result: decoded }));
    });
  }
  let pathname = url === '/' ? '/coder.html' : url;
  const filePath = path.join(__dirname, 'public', pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  }[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
