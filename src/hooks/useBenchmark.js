import { useState, useCallback } from 'react';

// --- CONFIGURATION ---
const NETWORK_CONFIG = {
  ethereum: {
    Alchemy: { 
      url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, 
      type: 'RPC' 
    },
    Infura: { 
      url: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, 
      type: 'RPC' 
    },
    QuickNode: { 
      url: `https://shiny-long-dew.quiknode.pro/${import.meta.env.VITE_QUICKNODE_KEY}/`, 
      type: 'RPC' 
    },
    Covalent: { 
      url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, 
      type: 'REST' 
    },
    Mobula: { 
      url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', 
      type: 'REST',
      authHeader: true // Signals pingProvider to inject the header
    },
    Codex: { url: null, type: 'REST' }
  },
  polygon: {
    Alchemy: { 
      url: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, 
      type: 'RPC' 
    },
    Covalent: { 
      url: `https://api.covalenthq.com/v1/137/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, 
      type: 'REST' 
    },
    Mobula: { 
      url: 'https://api.mobula.io/api/1/market/data?asset=Polygon', // Dynamic Asset
      type: 'REST',
      authHeader: true
    },
  },
  arbitrum: {
    Alchemy: { 
      url: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, 
      type: 'RPC' 
    },
    Covalent: { 
      url: `https://api.covalenthq.com/v1/42161/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, 
      type: 'REST' 
    },
    Mobula: { 
      url: 'https://api.mobula.io/api/1/market/data?asset=Arbitrum', // Dynamic Asset
      type: 'REST',
      authHeader: true
    },
  }
};

const pingProvider = async (config, requestType) => {
    if (!config || !config.url || config.url.includes('undefined') || config.url.includes('your_')) {
      return { latency: 0, error: 'Config Missing' };
    }
    
    // DEFINE PAYLOADS
    const payloads = {
        light: { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] },
        heavy: { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] } 
    };

    const start = performance.now();
    try {
      let response;
      
      // 1. RPC CALLS (Alchemy, Infura, QuickNode)
      if (config.type === 'RPC') {
        response = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloads[requestType] || payloads.light)
        });
      } 
      // 2. REST CALLS (Mobula, Covalent)
      else {
        // Prepare headers if authHeader flag is true (Mobula)
        const headers = {};
        if (config.authHeader) {
            headers['Authorization'] = import.meta.env.VITE_MOBULA_KEY;
        }

        response = await fetch(config.url, {
            method: 'GET',
            headers: headers
        });
      }
      
      if (!response.ok) return { latency: 0, error: `Error ${response.status}` };
      
      const json = await response.json();
      const end = performance.now();
      
      // PARSE BLOCK HEIGHT (Handle various API formats)
      let blockHeight = 0;
      
      // Standard RPC
      if (json.result) {
         if (typeof json.result === 'object' && json.result.number) blockHeight = parseInt(json.result.number, 16);
         else if (typeof json.result === 'string') blockHeight = parseInt(json.result, 16);
      } 
      // Covalent Structure
      else if (json.data?.items?.[0]?.height) {
          blockHeight = json.data.items[0].height;
      }
      // Mobula Structure (Mobula returns market data, not block height usually, so we default to 0 lag or check timestamp)
      // Since Mobula is a Data API, we count a successful ping as "Synced" (0 lag) for now.
      else if (json.data && (json.data.price || json.data.market_cap)) {
          // If we got price data, the API is healthy. 
          // We can't strictly measure block lag on market endpoints, so we assume 0.
          blockHeight = 0; 
      }
      
      return { latency: Math.round(end - start), blockHeight, error: null };
    } catch (e) {
      console.error(e);
      return { latency: 0, error: 'Timeout' };
    }
};

export const useBenchmark = (initialData, activeNetwork, precisionMode, requestType) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ ...d, history: [] })));
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    
    const iterations = precisionMode === 'robust' ? 5 : 1;
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      // If provider not configured for this network, return offline status
      if (!config) return { ...provider, latency: 0, lag: 'N/A', blockHeight: 0 };

      let totalLatency = 0;
      let successCount = 0;
      let lastBlockHeight = 0;
      let lastError = null;
      let newHistoryPoints = [];

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config, requestType);
        
        if (!result.error) {
            newHistoryPoints.push(result.latency);
            totalLatency += result.latency;
            // Only update block height if we actually found one (don't overwrite with 0 from Mobula)
            if (result.blockHeight > 0) lastBlockHeight = result.blockHeight;
            successCount++;
        } else {
            newHistoryPoints.push(0);
            lastError = result.error;
        }
        
        if (iterations > 1) await new Promise(r => setTimeout(r, 200));
      }

      const avgLatency = successCount > 0 ? Math.round(totalLatency / successCount) : 0;
      const reliability = Math.round((successCount / iterations) * 100);
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

    // Calculate Lag (Compare only providers that actually returned a Block Height)
    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    
    const finalData = updates.map(u => ({
      ...u,
      // If Mobula (blockHeight 0 but online), don't show "Behind", show "Synced" or "N/A"
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.uptime > 0 ? 'Synced' : (u.lag || 'N/A'))
    }));

    setData(finalData);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode, requestType]);

  return { benchmarkData, isRunning, runBenchmark };
};