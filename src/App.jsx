import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [nftNumber, setNftNumber] = useState("");
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simple in-memory cache for NFT pages
  const nftCache = {};
  let lastRequestTime = 0;
  const RATE_LIMIT_MS = 1200; // 1.2 seconds between requests
  const PAGE_SIZE = 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const num = parseInt(nftNumber);
    if (isNaN(num) || num < 1 || num > 4477) {
      setError("Please enter a number between 1 and 4477.");
      return;
    }
    setLoading(true);
    try {
      // Directly fetch individual NFT by mint address (assuming user enters mint address)
      // If user enters a number, convert to mint address using a lookup (not implemented here)
      // For demo, treat input as mint address
      const mintAddress = nftNumber.trim();
      if (!mintAddress || mintAddress.length < 32) {
        setError("Please enter a valid mint address.");
        setLoading(false);
        return;
      }
      const detailsUrl = `http://localhost:5174/api/token/${mintAddress}`;
      const detailsRes = await fetch(detailsUrl);
      if (!detailsRes.ok) throw new Error("Failed to fetch NFT details");
      const details = await detailsRes.json();
      setNftData({
        image: details.image,
        traits: (details.attributes || []).map(t => ({ name: t.trait_type || t.name, value: t.value, rarity: t.rarity || "" })),
        price: details.listPrice ? details.listPrice / 1e9 : null,
        rank: details.rarityRank || null,
      });
    } catch (err) {
      setError("Error fetching NFT data.");
    }
    setLoading(false);
  };

  const handleNewSearch = () => {
    setNftData(null);
    setNftNumber("");
    setError("");
  };

  return (
    <div className="eight-bit-bg">
      <h1 className="eight-bit-title">Trench Warrior NFT Viewer</h1>
      {!nftData ? (
        <form className="eight-bit-form" onSubmit={handleSubmit}>
          <label htmlFor="nftNumber" className="eight-bit-label">
            Enter NFT Number (1-4477):
          </label>
          <input
            id="nftNumber"
            type="number"
            min="1"
            max="4477"
            value={nftNumber}
            onChange={e => setNftNumber(e.target.value)}
            className="eight-bit-input"
            required
          />
          <button type="submit" className="eight-bit-btn">Enter</button>
          {error && <div className="eight-bit-error">{error}</div>}
        </form>
      ) : (
        <div className="eight-bit-result">
          <img src={nftData.image} alt="Trench Warrior NFT" className="eight-bit-img" />
          <h2 className="eight-bit-subtitle">Traits</h2>
          <ul className="eight-bit-traits">
            {nftData.traits.map((trait, idx) => (
              <li key={idx}>
                <span className="eight-bit-trait-name">{trait.name}:</span> <span className="eight-bit-trait-value">{trait.value}</span> <span className="eight-bit-trait-rarity">({trait.rarity})</span>
              </li>
            ))}
          </ul>
          <div className="eight-bit-info">
            <span>List Price: <span className="eight-bit-sol">◎ {nftData.price} SOL</span></span>
            <span>Overall Rarity Rank: <span className="eight-bit-rank">{nftData.rank}</span></span>
          </div>
          <form className="eight-bit-form" onSubmit={e => { e.preventDefault(); handleNewSearch(); }}>
            <button type="submit" className="eight-bit-btn">Search Another NFT</button>
          </form>
        </div>
      )}
      {loading && <div className="eight-bit-loading">Loading...</div>}
    </div>
  );
}

export default App
