import { useState, useCallback } from 'react';

const NETWORK_CONFIG = {
  ethereum: {
    Alchemy: { url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', type: 'REST' },
    Codex: { url: null, type: 'REST' }
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

const pingProvider = async (config) => {
  if (!config || !config.url || config.url.includes('undefined')) return { latency: 0, error: 'Config Missing' };
  
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
    
    if (!response.ok) return { latency: 0, error: `Status ${response.status}` };
    
    const json = await response.json();
    const end = performance.now();
    
    let blockHeight = 0;
    // Extract block height based on provider format
    if (json.result) blockHeight = parseInt(json.result, 16); // RPC standard
    else if (json.data?.items?.[0]?.height) blockHeight = json.data.items[0].height; // Covalent
    
    return { latency: Math.round(end - start), blockHeight, error: null };
  } catch (e) {
    return { latency: 0, error: 'Network Error' };
  }
};

export const useBenchmark = (initialData, activeNetwork, precisionMode) => {
  const [benchmarkData, setData] = useState(initialData);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Determine iterations: 1 for Standard, 3 for Robust
    const iterations = precisionMode === 'robust' ? 3 : 1;
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      let totalLatency = 0;
      let successfulPings = 0;
      let lastBlockHeight = 0;
      let lastError = null;

      // Loop for precision averaging
      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config);
        if (!result.error) {
          totalLatency += result.latency;
          lastBlockHeight = result.blockHeight;
          successfulPings++;
        } else {
          lastError = result.error;
        }
        // Small delay between pings to prevent rate limiting
        if (iterations > 1) await new Promise(r => setTimeout(r, 200));
      }

      // Calculate Average
      const avgLatency = successfulPings > 0 ? Math.round(totalLatency / successfulPings) : 0;
      
      return { 
        ...provider, 
        latency: avgLatency, 
        blockHeight: lastBlockHeight, 
        lag: lastError && avgLatency === 0 ? lastError : 0 
      };
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
    setProgress(100);
  }, [benchmarkData, activeNetwork, precisionMode]);

  return { benchmarkData, isRunning, runBenchmark, progress };
};