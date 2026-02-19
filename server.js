const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 4000;
const DIST = path.join(__dirname, 'dist', 'ba-project-tracker', 'browser');

// Serve static build output
app.use(express.static(DIST, { maxAge: '1d' }));

// Angular SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✦ BA Project Tracker running on http://localhost:${PORT}`);
});

