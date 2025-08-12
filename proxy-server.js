const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 5174;

app.use(cors());

// Proxy for Magic Eden NFT tokens
app.get('/api/tokens', async (req, res) => {
  const { offset = 0, limit = 100 } = req.query;
  try {
    const apiUrl = `https://api-mainnet.magiceden.dev/v2/collections/trench_warriors_/tokens?offset=${offset}&limit=${limit}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from Magic Eden' });
  }
});

// Proxy for Magic Eden NFT details
app.get('/api/token/:mint', async (req, res) => {
  const { mint } = req.params;
  try {
    const apiUrl = `https://api-mainnet.magiceden.dev/v2/tokens/${mint}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
