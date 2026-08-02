import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const dataDir = path.resolve(__dirname, 'data');
const saveFilePath = path.join(dataDir, 'savegame.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// Get saved game state from hard drive file
app.get('/api/state', (req, res) => {
  if (fs.existsSync(saveFilePath)) {
    try {
      const data = fs.readFileSync(saveFilePath, 'utf-8');
      return res.json(JSON.parse(data));
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read savegame file' });
    }
  }
  return res.json({ exists: false });
});

// Save game state to hard drive file
app.post('/api/state', (req, res) => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(saveFilePath, JSON.stringify(req.body, null, 2), 'utf-8');
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to write savegame file to disk' });
  }
});

// Reset savegame file
app.delete('/api/state', (req, res) => {
  if (fs.existsSync(saveFilePath)) {
    fs.unlinkSync(saveFilePath);
  }
  return res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Stock Game Server running on http://localhost:${PORT}`);
});
