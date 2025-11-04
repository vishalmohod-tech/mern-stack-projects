const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const LOG_FILE = path.join(__dirname, 'activity.txt');

try {
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '', 'utf8');
} catch (err) {
  console.error('Error ensuring log file:', err);
}

function logActivity(action) {
  const time = new Date().toLocaleString(); 
  const entry = `[${time}] ${action}\n`;
  fs.appendFile(LOG_FILE, entry, (err) => {
    if (err) console.error('Failed to write to log:', err);
  });
}

function parseJSONBody(req, cb) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    if (!body) return cb(null, {});
    try {
      const json = JSON.parse(body);
      cb(null, json);
    } catch (err) {
      cb(err);
    }
  });
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === '/' && method === 'GET') {
    logActivity('Page visited');
  }

  if (url === '/api/log' && method === 'POST') {
    parseJSONBody(req, (err, body) => {
      if (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
      }
      const actionText = body && body.action ? body.action : 'Button clicked';
      logActivity(actionText);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, message: 'Logged' }));
    });
    return;
  }

  let reqPath = url === '/' ? '/activity.html' : url;
  reqPath = reqPath.replace(/\.\./g, '');
  const filePath = path.join(__dirname, 'public', reqPath);
  const ext = path.extname(filePath).toLowerCase();

  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json'
  };
  const contentType = contentTypes[ext] || 'text/plain';

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
  console.log(`Activity Logger running: http://localhost:${PORT}`);
});
