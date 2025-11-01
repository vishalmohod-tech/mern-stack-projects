// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'contacts.json');

function readContacts() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content || '[]');
  } catch (err) {
    return [];
  }
}

function writeContacts(arr) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });
  res.end(body);
}

function serveStatic(req, res) {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'contact.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml'
  };
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const content = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
  res.end(content);
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // API routes
  if (url === '/api/contacts' && method === 'GET') {
    const contacts = readContacts();
    return sendJson(res, 200, contacts);
  }

  if (url === '/api/contacts' && method === 'POST') {
    // create new contact
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { name, phone, email } = payload;
        if (!name || !phone) return sendJson(res, 400, { error: 'Name and phone are required' });

        const contacts = readContacts();
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2,8);
        const newContact = { id, name, phone, email: email || '' };
        contacts.push(newContact);
        writeContacts(contacts);
        return sendJson(res, 201, newContact);
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // update contact
  if (url.startsWith('/api/contacts/') && method === 'PUT') {
    const id = url.split('/').pop();
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const contacts = readContacts();
        const idx = contacts.findIndex(c => c.id === id);
        if (idx === -1) return sendJson(res, 404, { error: 'Contact not found' });
        contacts[idx] = { ...contacts[idx], name: payload.name || contacts[idx].name, phone: payload.phone || contacts[idx].phone, email: payload.email || contacts[idx].email };
        writeContacts(contacts);
        return sendJson(res, 200, contacts[idx]);
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // delete contact
  if (url.startsWith('/api/contacts/') && method === 'DELETE') {
    const id = url.split('/').pop();
    const contacts = readContacts();
    const filtered = contacts.filter(c => c.id !== id);
    if (filtered.length === contacts.length) return sendJson(res, 404, { error: 'Contact not found' });
    writeContacts(filtered);
    return sendJson(res, 200, { success: true });
  }

  // import JSON (replace all contacts)
  if (url === '/api/import' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const arr = JSON.parse(body || '[]');
        if (!Array.isArray(arr)) return sendJson(res, 400, { error: 'Expected an array' });
        const valid = arr.every(it => typeof it.name === 'string' && it.name.trim() !== '' && typeof it.phone === 'string' && it.phone.trim() !== '');
        if (!valid) return sendJson(res, 400, { error: 'Each contact must have name and phone' });
        const normalized = arr.map(it => ({
          id: it.id || (Date.now().toString(36) + Math.random().toString(36).slice(2,8)),
          name: it.name,
          phone: it.phone,
          email: it.email || ''
        }));
        writeContacts(normalized);
        return sendJson(res, 200, { imported: normalized.length });
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  if (url.startsWith('/')) {
    return serveStatic(req, res);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
