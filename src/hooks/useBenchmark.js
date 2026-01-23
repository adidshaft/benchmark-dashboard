import { useState, useCallback } from 'react';

// ... (Keep your existing NETWORK_CONFIG and pingProvider function exactly as they are) ...
// Just ensure NETWORK_CONFIG and pingProvider are defined above this hook.

const NETWORK_CONFIG = {
  ethereum: {
    Alchemy: { url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    QuickNode: { url: `https://shiny-long-dew.quiknode.pro/${import.meta.env.VITE_QUICKNODE_KEY}/`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', type: 'REST' },
    Codex: { url: null, type: 'REST' }
  },
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
      
      let blockHeight = 0;
      if (json.result) blockHeight = parseInt(json.result, 16); 
      else if (json.data?.items?.[0]?.height) blockHeight = json.data.items[0].height;
      
      return { latency: Math.round(end - start), blockHeight, error: null };
    } catch (e) {
      return { latency: 0, error: 'Timeout' };
    }
};

export const useBenchmark = (initialData, activeNetwork, precisionMode) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ ...d, history: [] }))); // Add history array
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    
    const iterations = precisionMode === 'robust' ? 5 : 1;
    
    // We process providers sequentially or effectively parallel but update state at the end
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      if (!config) return { ...provider, latency: 0, lag: 'N/A', blockHeight: 0 };

      let totalLatency = 0;
      let successCount = 0;
      let lastBlockHeight = 0;
      let lastError = null;
      let newHistoryPoints = [];

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config);
        
        // Store point for sparkline (limit to last 20 points across multiple runs if we wanted)
        if (!result.error) {
            newHistoryPoints.push(result.latency);
            totalLatency += result.latency;
            lastBlockHeight = result.blockHeight;
            successCount++;
        } else {
            newHistoryPoints.push(0); // 0 indicates error/timeout in sparkline
            lastError = result.error;
        }
        
        if (iterations > 1) await new Promise(r => setTimeout(r, 150));
      }

      const avgLatency = successCount > 0 ? Math.round(totalLatency / successCount) : 0;
      const reliability = Math.round((successCount / iterations) * 100);

      // Append new history to existing history, keep last 15
      const updatedHistory = [...(provider.history || []), ...newHistoryPoints].slice(-15);

      return { 
        ...provider, 
        latency: avgLatency, 
        uptime: reliability, 
        blockHeight: lastBlockHeight, 
        lag: lastError && avgLatency === 0 ? lastError : 0,
        history: updatedHistory
      };
    }));

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