import { useState, useCallback } from 'react';

// --- CONFIGURATION ---
const NETWORK_CONFIG = {
  ethereum: {
    id: 1,
    Alchemy: { url: `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    QuickNode: { url: `https://shiny-long-dew.quiknode.pro/${import.meta.env.VITE_QUICKNODE_KEY}/`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/1/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Ethereum', type: 'REST', authHeader: true },
    Codex: { url: null, type: 'REST' }
  },
  polygon: {
    id: 137,
    Alchemy: { url: `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://polygon-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/137/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Polygon', type: 'REST', authHeader: true },
  },
  arbitrum: {
    id: 42161,
    Alchemy: { url: `https://arb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://arbitrum-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/42161/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Arbitrum', type: 'REST', authHeader: true },
  },
  optimism: {
    id: 10,
    Alchemy: { url: `https://opt-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: `https://optimism-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/10/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Optimism', type: 'REST', authHeader: true },
  },
  base: {
    id: 8453,
    Alchemy: { url: `https://base-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: null, type: 'RPC' }, // Infura Base support varies by plan
    Covalent: { url: `https://api.covalenthq.com/v1/8453/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Base', type: 'REST', authHeader: true },
  },
  bsc: {
    id: 56,
    Alchemy: { url: `https://bnb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: null, type: 'RPC' }, // Infura requires addon for BSC
    Covalent: { url: `https://api.covalenthq.com/v1/56/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=BNB', type: 'REST', authHeader: true },
  },
  avalanche: {
    id: 43114,
    Alchemy: { url: null, type: 'RPC' }, // Alchemy Avax is usually separate
    Infura: { url: `https://avalanche-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/43114/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Avalanche', type: 'REST', authHeader: true },
  }
};

const pingProvider = async (config, requestType) => {
    if (!config || !config.url || config.url.includes('undefined') || config.url.includes('your_')) {
      return { latency: 0, error: 'Config Missing' };
    }
    
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
      
      let blockHeight = 0;
      if (json.result) {
         if (typeof json.result === 'object' && json.result.number) blockHeight = parseInt(json.result.number, 16);
         else if (typeof json.result === 'string') blockHeight = parseInt(json.result, 16);
      } 
      else if (json.data?.items?.[0]?.height) blockHeight = json.data.items[0].height;
      else if (json.data && (json.data.price || json.data.market_cap)) blockHeight = 0; 
      
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
    
    const iterations = precisionMode === 'robust' ? 10 : 3;
    
    const updates = await Promise.all(benchmarkData.map(async (provider) => {
      const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
      const config = networkConfig[provider.name];

      // Important: If config is null (provider doesn't support chain), return defaults
      if (!config || !config.url) {
          return { 
              ...provider, 
              latency: 0, p99: 0, uptime: 0, lag: 'N/A', blockHeight: 0,
              history: [...(provider.history || []), 0].slice(-20)
          };
      }

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
            latencies.push(0);
            lastError = result.error;
        }
        await new Promise(r => setTimeout(r, 150));
      }

      const validLatencies = latencies.filter(l => l > 0).sort((a, b) => a - b);
      const p50 = validLatencies.length > 0 ? validLatencies[Math.floor(validLatencies.length / 2)] : 0;
      const p99 = validLatencies.length > 0 ? validLatencies[validLatencies.length - 1] : 0;
      const reliability = Math.round((successCount / iterations) * 100);
      const updatedHistory = [...(provider.history || []), ...latencies].slice(-20);

      return { 
        ...provider, 
        latency: p50, 
        p99: p99, 
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