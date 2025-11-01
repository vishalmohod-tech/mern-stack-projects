const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'visitors.json');

// Ensure file exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count: 0 }, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }

      const visitorData = JSON.parse(data);
      visitorData.count++;
      fs.writeFile(DATA_FILE, JSON.stringify(visitorData), (err) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<h1>Visitor Count: ${visitorData.count}</h1>`);
      });
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
