const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
// Simple in-memory rate limiter
let lastRequestTime = 0;
const RATE_LIMIT_MS = 500; // 0.5 seconds between requests (2 QPS)
const PORT = 5174;

app.use(cors());

// Proxy for Magic Eden NFT tokens
app.get('/api/tokens', async (req, res) => {
  const { offset = 0, limit = 100 } = req.query;
  try {
    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      await new Promise(res => setTimeout(res, RATE_LIMIT_MS - (now - lastRequestTime)));
    }
    lastRequestTime = Date.now();
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

// Endpoint to map NFT number to mint address
app.get('/api/number-to-mint/:number', (req, res) => {
  const number = req.params.number;
  const mappingPath = path.join(__dirname, 'nft-number-to-mint.json');
  try {
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const mint = mapping[number];
    if (mint) {
      res.json({ mint });
    } else {
      res.status(404).json({ error: 'Mint address not found for this number.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read mapping file.' });
  }
});
