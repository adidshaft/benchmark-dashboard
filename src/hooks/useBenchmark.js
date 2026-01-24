import { useState, useCallback } from 'react';

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
    Infura: { url: null, type: 'RPC' }, 
    Covalent: { url: `https://api.covalenthq.com/v1/8453/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Base', type: 'REST', authHeader: true },
  },
  bsc: {
    id: 56,
    Alchemy: { url: `https://bnb-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`, type: 'RPC' },
    Infura: { url: null, type: 'RPC' }, 
    Covalent: { url: `https://api.covalenthq.com/v1/56/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=BNB', type: 'REST', authHeader: true },
  },
  avalanche: {
    id: 43114,
    Alchemy: { url: null, type: 'RPC' },
    Infura: { url: `https://avalanche-mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_KEY}`, type: 'RPC' },
    Covalent: { url: `https://api.covalenthq.com/v1/43114/block_v2/latest/?key=${import.meta.env.VITE_COVALENT_KEY}`, type: 'REST' },
    Mobula: { url: 'https://api.mobula.io/api/1/market/data?asset=Avalanche', type: 'REST', authHeader: true },
  }
};

const performRequest = async (config, payload) => {
    try {
        let response;
        if (config.type === 'RPC') {
            response = await fetch(config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            const headers = config.authHeader ? { 'Authorization': import.meta.env.VITE_MOBULA_KEY } : {};
            response = await fetch(config.url, { method: 'GET', headers });
        }
        if (!response.ok) return { error: `HTTP ${response.status}` };
        return await response.json();
    } catch (e) {
        return { error: 'Timeout/Network' };
    }
};

const pingProvider = async (config, requestType) => {
    if (!config || !config.url) return { latency: 0, error: 'Config Missing' };
    
    // 1. LATENCY CHECK
    const start = performance.now();
    const payload = requestType === 'heavy' 
        ? { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] }
        : { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] };

    const json = await performRequest(config, payload);
    const end = performance.now();
    const latency = Math.round(end - start);
    
    if (json.error) return { latency: 0, error: json.error };

    // PARSE BLOCK
    let blockHeight = 0;
    if (json.result) {
        if (typeof json.result === 'object' && json.result.number) blockHeight = parseInt(json.result.number, 16);
        else if (typeof json.result === 'string') blockHeight = parseInt(json.result, 16);
    } else if (json.data?.items?.[0]?.height) {
        blockHeight = json.data.items[0].height;
    }

    // 2. REAL-TIME ARCHIVE CHECK (Try fetching Block #1)
    let isArchive = null;
    if (config.type === 'RPC') {
        const archivePayload = { jsonrpc: "2.0", id: 2, method: "eth_getBalance", params: ["0x0000000000000000000000000000000000000000", "0x1"] }; // Block 1
        const archiveJson = await performRequest(config, archivePayload);
        // If we get a result, it supports archive. If error (missing trie node), it doesn't.
        isArchive = archiveJson.result ? true : false;
    }

    // 3. REAL-TIME GAS CHECK (For Consistency)
    let gasPrice = 0;
    if (config.type === 'RPC') {
        const gasPayload = { jsonrpc: "2.0", id: 3, method: "eth_gasPrice", params: [] };
        const gasJson = await performRequest(config, gasPayload);
        if (gasJson.result) gasPrice = parseInt(gasJson.result, 16) / 1e9; // Convert to Gwei
    }

    return { latency, blockHeight, isArchive, gasPrice, error: null };
};

export const useBenchmark = (initialData, activeNetwork, precisionMode, requestType) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ ...d, history: [] })));
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]); // NEW: Execution Logs

  const addLog = (msg) => setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setLogs([]); // Clear logs
    addLog(`Initializing benchmark for ${activeNetwork}...`);
    
    const iterations = precisionMode === 'robust' ? 5 : 2;
    const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
    
    // Create a copy to update incrementally
    let currentData = [...benchmarkData];

    // Process providers sequentially to update logs nicely (or use Promise.all for speed, but logs are fun)
    const updates = await Promise.all(currentData.map(async (provider) => {
      const config = networkConfig[provider.name];

      if (!config || !config.url) {
          addLog(`Skipping ${provider.name} (Not supported on ${activeNetwork})`);
          return { ...provider, latency: 0, p99: 0, uptime: 0, lag: 'N/A', blockHeight: 0, archive: false, gas: 0 };
      }

      addLog(`Probing ${provider.name} (${iterations}x)...`);

      let latencies = [];
      let successCount = 0;
      let lastBlockHeight = 0;
      let detectedArchive = false;
      let lastGas = 0;
      let lastError = null;

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config, requestType);
        
        if (!result.error) {
            latencies.push(result.latency);
            if (result.blockHeight > 0) lastBlockHeight = result.blockHeight;
            if (result.isArchive === true) detectedArchive = true;
            if (result.gasPrice > 0) lastGas = result.gasPrice;
            successCount++;
        } else {
            latencies.push(0);
            lastError = result.error;
        }
        await new Promise(r => setTimeout(r, 100));
      }

      // Stats Calculation
      const validLatencies = latencies.filter(l => l > 0).sort((a, b) => a - b);
      const p50 = validLatencies.length > 0 ? validLatencies[Math.floor(validLatencies.length / 2)] : 0;
      const p99 = validLatencies.length > 0 ? validLatencies[validLatencies.length - 1] : 0;
      const reliability = Math.round((successCount / iterations) * 100);
      const updatedHistory = [...(provider.history || []), ...latencies].slice(-20);

      // Override static "archive" with real detected value if RPC
      const finalArchive = config.type === 'RPC' ? detectedArchive : provider.archive;

      return { 
        ...provider, 
        latency: p50, 
        p99: p99, 
        uptime: reliability, 
        blockHeight: lastBlockHeight, 
        lag: lastError && p50 === 0 ? lastError : 0,
        history: updatedHistory,
        archive: finalArchive, // Real-time value
        gas: lastGas // Real-time value
      };
    }));

    // Post-Processing for Lag & Logs
    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.uptime > 0 ? 'Synced' : (u.lag || 'N/A'))
    }));

    setData(finalData);
    addLog(`Benchmark Complete. Highest Block: ${maxHeight}`);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode, requestType]);

  return { benchmarkData, isRunning, runBenchmark, logs };
};