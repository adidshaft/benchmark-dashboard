import { useState, useCallback } from 'react';

const NETWORK_CONFIG = {
  ethereum: {
    Alchemy: { url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    QuickNode: { url: `https://shiny-long-dew.quiknode.pro/${import.meta.env.VITE_QUICKNODE_KEY}/`, type: 'RPC' }, // Replace with your exact QN endpoint
    Covalent: { url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', type: 'REST' },
    Codex: { url: null, type: 'REST' }
  },
  // Add Polygon/Arbitrum endpoints for Infura/QuickNode if you have them, 
  // otherwise they will show as "Offline" on those networks.
  polygon: {
    Alchemy: { url: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/137/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Polygon', type: 'REST' },
  },
  arbitrum: {
    Alchemy: { url: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/42161/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Arbitrum', type: 'REST' },
  }
};

const pingProvider = async (config) => {
  if (!config || !config.url || config.url.includes('undefined') || config.url.includes('your_')) {
    return { latency: 0, error: 'Config Missing' };
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
    
    if (!response.ok) return { latency: 0, error: `Error ${response.status}` };
    
    const json = await response.json();
    const end = performance.now();
    
    // Extract Block Height
    let blockHeight = 0;
    if (json.result) blockHeight = parseInt(json.result, 16); 
    else if (json.data?.items?.[0]?.height) blockHeight = json.data.items[0].height;
    
    return { latency: Math.round(end - start), blockHeight, error: null };
  } catch (e) {
    return { latency: 0, error: 'Timeout' };
  }
};

export const useBenchmark = (initialData, activeNetwork, precisionMode) => {
  const [benchmarkData, setData] = useState(initialData);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    
    const iterations = precisionMode === 'robust' ? 5 : 1;
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      // If provider not supported on this chain, return N/A
      if (!config) return { ...provider, latency: 0, lag: 'N/A', blockHeight: 0 };

      let totalLatency = 0;
      let successCount = 0;
      let lastBlockHeight = 0;
      let lastError = null;

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config);
        
        if (!result.error) {
          totalLatency += result.latency;
          lastBlockHeight = result.blockHeight;
          successCount++;
        } else {
          lastError = result.error;
        }
        
        if (iterations > 1) await new Promise(r => setTimeout(r, 150));
      }

      const avgLatency = successCount > 0 ? Math.round(totalLatency / successCount) : 0;
      const reliability = Math.round((successCount / iterations) * 100);

      return { 
        ...provider, 
        latency: avgLatency, 
        uptime: reliability, 
        blockHeight: lastBlockHeight, 
        lag: lastError && avgLatency === 0 ? lastError : 0 
      };
    }));

    // Calculate Lag against the leader (Highest Block)
    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.lag || 'N/A')
    }));

    setData(finalData);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode]);

  return { benchmarkData, isRunning, runBenchmark };
};