import { useState, useCallback } from 'react';

// Configuration for multiple chains
// We map "Network ID" to specific endpoints
const NETWORK_CONFIG = {
  ethereum: {
    Alchemy: { url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', type: 'REST' },
    Codex: { url: null, type: 'REST' } // Add your Codex Eth endpoint
  },
  polygon: {
    Alchemy: { url: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/137/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Polygon', type: 'REST' },
    Codex: { url: null, type: 'REST' }
  },
  arbitrum: {
    Alchemy: { url: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/42161/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Arbitrum', type: 'REST' },
    Codex: { url: null, type: 'REST' }
  }
};

export const useBenchmark = (initialData, activeNetwork) => {
  const [benchmarkData, setData] = useState(initialData);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      // 1. Get config for the SELECTED network
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];
      
      if (!config || !config.url || config.url.includes('undefined')) {
        return { ...provider, latency: 0, lag: 'Config Missing', blockHeight: 0 };
      }

      const start = performance.now();
      try {
        let response;
        if (config.type === 'RPC') {
          response = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] })
          });
        } else {
          response = await fetch(config.url);
        }

        if (response.status === 401 || response.status === 403) {
            return { ...provider, latency: 0, lag: 'Auth Failed', blockHeight: 0 };
        }
        
        const json = await response.json();
        const end = performance.now();
        const latency = Math.round(end - start);

        let blockHeight = 0;
        if (provider.name === 'Alchemy') blockHeight = parseInt(json.result, 16); 
        else if (provider.name === 'Covalent') blockHeight = json.data?.items?.[0]?.height || 0;

        return { ...provider, latency, blockHeight, lag: 0 };

      } catch (e) {
        return { ...provider, latency: 0, lag: 'Offline', blockHeight: 0 }; 
      }
    }));

    // Calculate Lag
    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.lag || 'N/A')
    }));

    setData(finalData);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork]); // Re-create function when network changes

  return { benchmarkData, isRunning, runBenchmark };
};