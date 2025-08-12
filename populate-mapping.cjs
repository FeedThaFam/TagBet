const fs = require('fs');

const PAGE_SIZE = 100;
const TOTAL_NFTS = 4477;
const API_URL = 'https://api-mainnet.magiceden.dev/v2/collections/trench_warriors_/tokens';

(async () => {
  let mapping = {};
  for (let offset = 0; offset < TOTAL_NFTS; offset += PAGE_SIZE) {
    const url = `${API_URL}?offset=${offset}&limit=${PAGE_SIZE}`;
    console.log('Fetching', url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Failed to fetch:', url);
      continue;
    }
    const nfts = await res.json();
    nfts.forEach(nft => {
      // Extract number from name (e.g., "Trench Warrior #123")
      const match = nft.name && nft.name.match(/#(\d+)$/);
      if (match) {
        mapping[match[1]] = nft.mintAddress;
      }
    });
    // Rate limit to avoid API bans
    await new Promise(res => setTimeout(res, 1200));
  }
  fs.writeFileSync('nft-number-to-mint.json', JSON.stringify(mapping, null, 2));
  console.log('Mapping file written.');
})();
