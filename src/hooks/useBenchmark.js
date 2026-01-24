import { useState, useCallback } from 'react';

export const NETWORK_CONFIG = {
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

const performRequest = async (config, payload, method = 'POST') => {
    try {
        const isRPC = config.type === 'RPC';
        const headers = config.authHeader ? { 'Authorization': import.meta.env.VITE_MOBULA_KEY } : {};
        if (isRPC) headers['Content-Type'] = 'application/json';

        const options = { method, headers };
        if (isRPC && method === 'POST') options.body = JSON.stringify(payload);

        const response = await fetch(config.url, options);
        return { 
            ok: response.ok, 
            status: response.status, 
            headers: response.headers,
            json: await response.json().catch(() => ({})) 
        };
    } catch (e) {
        return { error: 'Network/Timeout' };
    }
};

const checkSecurity = (config, headers) => {
    let score = 100;
    let issues = [];
    if (!config || !config.url) return { score: 0, issues: ['Config Missing'] }; // Safety Check

    if (!config.url.startsWith('https')) { score -= 50; issues.push("Insecure HTTP detected"); }
    
    if (headers) {
        if (headers.get('x-powered-by')) { score -= 10; issues.push(`Leaked 'X-Powered-By'`); }
        if (headers.get('server')) { score -= 10; issues.push(`Leaked 'Server' header`); }
    }
    return { score, issues };
};

export const useBenchmark = (initialData, activeNetwork, precisionMode, requestType) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ 
      ...d, 
      history: [], 
      securityIssues: d.securityIssues || [] // Ensure Array initialization
  })));
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]); 

  const addLog = (msg) => setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setLogs([]); 
    addLog(`Initializing Intelligence Suite for ${activeNetwork}...`);
    
    const iterations = precisionMode === 'robust' ? 5 : 2;
    const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
    
    // Copy current state to preserve existing data while updating
    let currentData = [...benchmarkData];

    const updates = await Promise.all(currentData.map(async (provider) => {
      const config = networkConfig[provider.name];

      // Handle unsupported networks safely
      if (!config || !config.url) {
          return { 
              ...provider, 
              latency: 0, batchLatency: 0, p99: 0, uptime: 0, lag: 'N/A', 
              blockHeight: 0, archive: false, gas: 0, 
              securityScore: 0, 
              securityIssues: [], // Explicitly return empty array
              lastResponse: null 
          };
      }

      addLog(`Auditing ${provider.name}...`);

      let latencies = [];
      let batchLatencies = [];
      let successCount = 0;
      let lastBlockHeight = 0;
      let detectedArchive = false;
      let lastGas = 0;
      let lastHeaders = null;
      let lastRawResponse = null;

      for (let i = 0; i < iterations; i++) {
        const payload = requestType === 'heavy' 
            ? { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] }
            : { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] };
        
        const start = performance.now();
        const res = await performRequest(config, payload, config.type === 'RPC' ? 'POST' : 'GET');
        const end = performance.now();

        if (res.ok && !res.error) {
            latencies.push(Math.round(end - start));
            if (res.json.result) {
                const val = typeof res.json.result === 'object' ? res.json.result.number : res.json.result;
                lastBlockHeight = parseInt(val, 16) || lastBlockHeight;
            }
            lastHeaders = res.headers;
            lastRawResponse = res.json;
            successCount++;
        } else {
            latencies.push(0);
        }

        // Batch Ping
        if (config.type === 'RPC' && requestType === 'light') {
            const batchPayload = Array(10).fill(null).map((_, idx) => ({ jsonrpc: "2.0", id: idx, method: "eth_blockNumber", params: [] }));
            const bStart = performance.now();
            const bRes = await performRequest(config, batchPayload, 'POST');
            const bEnd = performance.now();
            if (bRes.ok) batchLatencies.push(Math.round(bEnd - bStart));
        }

        await new Promise(r => setTimeout(r, 100));
      }

      // Security Checks
      let secScore = 100, secIssues = [];
      if (config.type === 'RPC') {
          // Archive
          const archivePayload = { jsonrpc: "2.0", id: 2, method: "eth_getBalance", params: ["0x0000000000000000000000000000000000000000", "0x1"] };
          const archiveRes = await performRequest(config, archivePayload);
          if (archiveRes.json?.result) detectedArchive = true;

          // Gas
          const gasPayload = { jsonrpc: "2.0", id: 3, method: "eth_gasPrice", params: [] };
          const gasRes = await performRequest(config, gasPayload);
          if (gasRes.json?.result) lastGas = parseInt(gasRes.json.result, 16) / 1e9;

          // Security
          const sec = checkSecurity(config, lastHeaders);
          secScore = sec.score;
          secIssues = sec.issues || [];
      }

      const validLatencies = latencies.filter(l => l > 0).sort((a,b)=>a-b);
      const p50 = validLatencies.length > 0 ? validLatencies[Math.floor(validLatencies.length / 2)] : 0;
      const p99 = validLatencies.length > 0 ? validLatencies[validLatencies.length - 1] : 0;
      const batchAvg = batchLatencies.length ? Math.round(batchLatencies.reduce((a,b)=>a+b,0)/batchLatencies.length) : 0;
      
      return { 
        ...provider, 
        latency: p50, 
        batchLatency: batchAvg,
        p99, 
        uptime: Math.round((successCount / iterations) * 100), 
        blockHeight: lastBlockHeight, 
        lag: p50 === 0 ? 'Error' : 0,
        history: [...(provider.history || []), ...latencies].slice(-20),
        archive: config.type === 'RPC' ? detectedArchive : provider.archive,
        gas: lastGas,
        securityScore: secScore,
        securityIssues: secIssues, // Guaranteed Array
        lastResponse: lastRawResponse
      };
    }));

    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.uptime > 0 ? 'Synced' : 'N/A')
    }));

    setData(finalData);
    addLog(`Cycle Complete.`);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode, requestType]);

  return { benchmarkData, isRunning, runBenchmark, logs };
};