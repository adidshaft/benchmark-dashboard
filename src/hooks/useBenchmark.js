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
      authHeader: true 
    },
    Codex: { url: null, type: 'REST' }
  },
  polygon: {
    Alchemy: { url: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/137/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Polygon', type: 'REST', authHeader: true },
  },
  arbitrum: {
    Alchemy: { url: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/42161/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Arbitrum', type: 'REST', authHeader: true },
  }
};

const pingProvider = async (config, requestType) => {
    if (!config || !config.url || config.url.includes('undefined') || config.url.includes('your_')) {
      return { latency: 0, error: 'Config Missing' };
    }
    
    // DEFINE PAYLOADS (Light = Block Height, Heavy = Full Block with Txns)
    const payloads = {
        light: { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] },
        heavy: { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] } 
    };

    const start = performance.now();
    try {
      let response;
      if (config.type === 'RPC') {
        response = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloads[requestType] || payloads.light)
        });
      } else {
        const headers = {};
        if (config.authHeader) headers['Authorization'] = import.meta.env.VITE_MOBULA_KEY;
        response = await fetch(config.url, { method: 'GET', headers: headers });
      }
      
      if (!response.ok) return { latency: 0, error: `Error ${response.status}` };
      
      const json = await response.json();
      const end = performance.now();
      
      // PARSE BLOCK HEIGHT
      let blockHeight = 0;
      if (json.result) {
         if (typeof json.result === 'object' && json.result.number) blockHeight = parseInt(json.result.number, 16);
         else if (typeof json.result === 'string') blockHeight = parseInt(json.result, 16);
      } 
      else if (json.data?.items?.[0]?.height) blockHeight = json.data.items[0].height;
      else if (json.data && (json.data.price || json.data.market_cap)) blockHeight = 0; // Mobula Market Data check
      
      return { latency: Math.round(end - start), blockHeight, error: null };
    } catch (e) {
      return { latency: 0, error: 'Timeout' };
    }
};

export const useBenchmark = (initialData, activeNetwork, precisionMode, requestType) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ ...d, history: [] })));
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    
    // Robust mode increases iterations for better P99 stats
    const iterations = precisionMode === 'robust' ? 10 : 3;
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      if (!config) return { ...provider, latency: 0, p99: 0, lag: 'N/A', blockHeight: 0 };

      let latencies = [];
      let successCount = 0;
      let lastBlockHeight = 0;
      let lastError = null;

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config, requestType);
        
        if (!result.error) {
            latencies.push(result.latency);
            if (result.blockHeight > 0) lastBlockHeight = result.blockHeight;
            successCount++;
        } else {
            latencies.push(0); // 0 signifies error in history
            lastError = result.error;
        }
        
        // Dynamic backoff to prevent rate limits during "Stress" testing
        await new Promise(r => setTimeout(r, 150));
      }

      // CALCULATE STATS
      const validLatencies = latencies.filter(l => l > 0).sort((a, b) => a - b);
      
      // P50 (Median)
      const p50 = validLatencies.length > 0 
        ? validLatencies[Math.floor(validLatencies.length / 2)] 
        : 0;
        
      // P99 (Peak/Max for small sample size)
      const p99 = validLatencies.length > 0 
        ? validLatencies[validLatencies.length - 1] 
        : 0;

      const reliability = Math.round((successCount / iterations) * 100);
      const updatedHistory = [...(provider.history || []), ...latencies].slice(-20);

      return { 
        ...provider, 
        latency: p50,  // Display P50 as main latency
        p99: p99,      // New Metric
        uptime: reliability, 
        blockHeight: lastBlockHeight, 
        lag: lastError && p50 === 0 ? lastError : 0,
        history: updatedHistory
      };
    }));

    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.uptime > 0 ? 'Synced' : (u.lag || 'N/A'))
    }));

    setData(finalData);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode, requestType]);

  return { benchmarkData, isRunning, runBenchmark };
};