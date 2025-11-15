const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// --- Config ---
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// --- Simple middleware: logger ---
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// --- Serve static test file (optional) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Helpers ---
function readJsonFile(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading JSON file', fullPath, err);
    return null;
  }
}

function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// --- Load data into memory once (simple & fast for small JSON) ---
const jokes = readJsonFile('jokes.json') || [];
const memes = readJsonFile('memes.json') || [];

// --- Routes ---

// Health / index
app.get('/', (req, res) => {
  res.json({
    name: 'Jokes & Memes API',
    routes: [
      '/random/joke',
      '/random/meme',
      '/category/:type  (type = "joke" | "meme" | categoryName)'
    ]
  });
});

// Random joke
app.get('/random/joke', (req, res) => {
  const item = pickRandom(jokes);
  if (!item) return res.status(404).json({ error: 'No jokes available' });
  res.json({ type: 'joke', data: item });
});

// Random meme
app.get('/random/meme', (req, res) => {
  const item = pickRandom(memes);
  if (!item) return res.status(404).json({ error: 'No memes available' });
  res.json({ type: 'meme', data: item });
});

// Category route: returns items matching category or type
// Examples:
//   /category/joke       => returns all jokes
//   /category/meme       => returns all memes
//   /category/tech       => returns jokes + memes with category === 'tech'
app.get('/category/:type', (req, res) => {
  const type = req.params.type.toLowerCase();

  if (type === 'joke') {
    return res.json({ category: 'joke', count: jokes.length, items: jokes });
  }
  if (type === 'meme') {
    return res.json({ category: 'meme', count: memes.length, items: memes });
  }

  // generic category search across both lists
  const matches = [];
  jokes.forEach(j => {
    if (j.category && j.category.toLowerCase() === type) matches.push({ kind: 'joke', data: j });
  });
  memes.forEach(m => {
    if (m.category && m.category.toLowerCase() === type) matches.push({ kind: 'meme', data: m });
  });

  if (matches.length === 0) {
    return res.status(404).json({ error: `No items found for category '${type}'` });
  }
  res.json({ category: type, count: matches.length, items: matches });
});

// Fallback 404 JSON
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
