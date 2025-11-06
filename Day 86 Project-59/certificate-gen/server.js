const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const certDir = path.join(__dirname, 'certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

function pdfEscape(text){
  return String(text).replace(/\\/g, '\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
}

function createCertificatePDF({name, course, date}) {
  const w = 595;
  const h = 842;

  const title = pdfEscape('Certificate of Completion');
  const recipient = pdfEscape(name || 'Participant Name');
  const body = pdfEscape(`has successfully completed the course: ${course || 'Course Name'}`);
  const dateText = pdfEscape(`Date: ${date || new Date().toLocaleDateString()}`);

  const streamLines = [];
  streamLines.push('q'); 
  streamLines.push('0.9 0.9 0.95 rg'); 
  streamLines.push(`${w - 120} ${h - 120} ${- (w - 240)} ${- (h - 240)} re f`);
  streamLines.push('Q');
  streamLines.push('BT');
  streamLines.push('/F1 28 Tf');       
  streamLines.push('80 640 Td');
  streamLines.push(`(${title}) Tj`);
  streamLines.push('ET');

  streamLines.push('BT');
  streamLines.push('/F1 36 Tf');
  streamLines.push('80 560 Td');
  streamLines.push(`(${recipient}) Tj`);
  streamLines.push('ET');

  streamLines.push('BT');
  streamLines.push('/F1 16 Tf');
  streamLines.push('80 520 Td');
  streamLines.push(`(${body}) Tj`);
  streamLines.push('ET');

  streamLines.push('BT');
  streamLines.push('/F1 12 Tf');
  streamLines.push('80 80 Td');
  streamLines.push(`(${dateText}) Tj`);
  streamLines.push('ET');

  const streamData = streamLines.join('\n');

  const objects = [];
  function addObj(content) {
    objects.push(content);
  }

  addObj(`<< /Type /Catalog /Pages 2 0 R >>`);
  addObj(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
  addObj(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`);
  addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  const streamHeader = `<< /Length ${Buffer.byteLength(streamData, 'utf8')} >>\nstream\n`;
  const streamFooter = `\nendstream`;
  addObj(streamHeader + streamData + streamFooter);

  let out = '%PDF-1.3\n%âãÏÓ\n';
  const offsets = [];
  for (let i = 0; i < objects.length; i++) {
    const idx = i + 1;
    offsets.push(Buffer.byteLength(out, 'binary'));
    out += `${idx} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(out, 'binary');
  
  out += 'xref\n';
  out += `0 ${objects.length + 1}\n`;

  out += '0000000000 65535 f \n';
  for (let off of offsets) {
    const offStr = String(off).padStart(10, '0');
    out += `${offStr} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(out, 'binary');
}

function parseMultipart(buffer, boundary) {
  const result = {};
  const parts = buffer.toString('binary').split('--' + boundary);
  parts.forEach(part => {
    if (!part || part === '--\r\n' || part === '--') return;
    const matchName = part.match(/name="([^"]+)"/);
    if (!matchName) return;
    const name = matchName[1];
    const filenameMatch = part.match(/filename="([^"]+)"/);
    const idx = part.indexOf('\r\n\r\n');
    if (idx === -1) return;
    const content = part.slice(idx + 4, part.lastIndexOf('\r\n'));
    if (filenameMatch) {
      const filename = path.basename(filenameMatch[1]);
      result[name] = { filename, content: Buffer.from(content, 'binary') };
    } else {
      result[name] = content.toString();
    }
  });
  return result;
}

function serveStatic(res, filepath) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filepath).toLowerCase();
    const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.pdf':'application/pdf' };
    res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream'});
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const { method, url } = req;
  if (method === 'GET') {
    if (url === '/' || url === '/certificate.html') return serveStatic(res, path.join(__dirname, 'public', 'certificate.html'));
    if (url.startsWith('/public/')) return serveStatic(res, path.join(__dirname, url));
    if (url.startsWith('/certificates/')) {
      return serveStatic(res, path.join(__dirname, url));
    }
    const publicPath = path.join(__dirname, 'public', url === '/' ? 'certificate.html' : url);
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      return serveStatic(res, publicPath);
    }
    res.writeHead(404);
    return res.end('Not Found');
  }

  if (method === 'POST' && url === '/generate') {
    const contentType = req.headers['content-type'] || '';
    const m = contentType.match(/boundary=(.+)$/);
    if (!m) {
      res.writeHead(400);
      res.end('Missing boundary in Content-Type');
      return;
    }
    const boundary = m[1].replace(/"/g, '');
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parsed = parseMultipart(buffer, boundary);
      const name = (parsed.name || '').trim();
      const course = (parsed.course || '').trim();
      const date = (parsed.date || '').trim();

      const pdfBuf = createCertificatePDF({ name, course, date });
      const filename = `certificate-${Date.now()}.pdf`;
      const filepath = path.join(certDir, filename);
      fs.writeFile(filepath, pdfBuf, (err) => {
        if (err) {
          res.writeHead(500);
          return res.end('Failed to write PDF');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: `/certificates/${filename}`, filename }));
      });
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
