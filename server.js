const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5407;

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌌 Everything Upgrade Tree running at http://localhost:${PORT}`);
});
