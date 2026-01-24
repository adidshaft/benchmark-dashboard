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

// Generic Fetch Wrapper
const performRequest = async (config, payload, method = 'POST') => {
    try {
        const isRPC = config.type === 'RPC';
        const headers = config.authHeader ? { 'Authorization': import.meta.env.VITE_MOBULA_KEY } : {};
        if (isRPC) headers['Content-Type'] = 'application/json';

        const options = { method, headers };
        if (isRPC && method === 'POST') options.body = JSON.stringify(payload);

        const response = await fetch(config.url, options);
        
        // Return response object to inspect headers
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

// 1. LATENCY & DATA CHECK
const pingProvider = async (config, requestType) => {
    if (!config || !config.url) return { latency: 0, error: 'Config Missing' };
    
    const start = performance.now();
    const payload = requestType === 'heavy' 
        ? { jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] }
        : { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] };

    const res = await performRequest(config, payload, config.type === 'RPC' ? 'POST' : 'GET');
    const end = performance.now();
    
    if (res.error || !res.ok) return { latency: 0, error: res.error || `HTTP ${res.status}` };

    // Parse Block
    let blockHeight = 0;
    if (res.json.result) {
        blockHeight = typeof res.json.result === 'object' 
            ? parseInt(res.json.result.number, 16) 
            : parseInt(res.json.result, 16);
    } else if (res.json.data?.items?.[0]?.height) {
        blockHeight = res.json.data.items[0].height;
    }

    return { latency: Math.round(end - start), blockHeight, error: null, raw: res.json, headers: res.headers };
};

// 2. SECURITY CHECK (New)
const checkSecurity = (config, headers) => {
    let score = 100;
    let issues = [];

    // Check 1: HTTPS Enforcement
    if (!config.url.startsWith('https')) {
        score -= 50;
        issues.push("Insecure HTTP detected (Major Risk)");
    }

    // Check 2: Header Leaks (Server / X-Powered-By)
    // Note: Browser CORS often hides these, but if they show up, it's a definite leak.
    if (headers) {
        if (headers.get('x-powered-by')) {
            score -= 10;
            issues.push(`Leaked 'X-Powered-By': ${headers.get('x-powered-by')}`);
        }
        if (headers.get('server')) {
            score -= 10;
            issues.push(`Leaked 'Server' version: ${headers.get('server')}`);
        }
    }

    return { score, issues };
};

export const useBenchmark = (initialData, activeNetwork, precisionMode, requestType) => {
  const [benchmarkData, setData] = useState(initialData.map(d => ({ ...d, history: [] })));
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]); 

  const addLog = (msg) => setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString().split(' ')[0]}] ${msg}`]);

  const runBenchmark = useCallback(async () => {
    setIsRunning(true);
    setLogs([]); 
    addLog(`Initializing Security & Perf Benchmark for ${activeNetwork}...`);
    
    const iterations = precisionMode === 'robust' ? 5 : 2;
    const networkConfig = NETWORK_CONFIG[activeNetwork] || NETWORK_CONFIG.ethereum;
    let currentData = [...benchmarkData];

    const updates = await Promise.all(currentData.map(async (provider) => {
      const config = networkConfig[provider.name];

      if (!config || !config.url) {
          return { ...provider, latency: 0, p99: 0, uptime: 0, lag: 'N/A', blockHeight: 0, archive: false, gas: 0, securityScore: 0, securityIssues: [] };
      }

      addLog(`Auditing ${provider.name}...`);

      let latencies = [];
      let successCount = 0;
      let lastBlockHeight = 0;
      let lastHeaders = null;
      let lastRawResponse = null;

      for (let i = 0; i < iterations; i++) {
        const result = await pingProvider(config, requestType);
        if (!result.error) {
            latencies.push(result.latency);
            if (result.blockHeight > 0) lastBlockHeight = result.blockHeight;
            lastHeaders = result.headers;
            lastRawResponse = result.raw;
            successCount++;
        } else {
            latencies.push(0);
        }
        await new Promise(r => setTimeout(r, 100));
      }

      // Calc Performance
      const validLatencies = latencies.filter(l => l > 0).sort((a, b) => a - b);
      const p50 = validLatencies.length > 0 ? validLatencies[Math.floor(validLatencies.length / 2)] : 0;
      const p99 = validLatencies.length > 0 ? validLatencies[validLatencies.length - 1] : 0;
      const reliability = Math.round((successCount / iterations) * 100);
      const updatedHistory = [...(provider.history || []), ...latencies].slice(-20);

      // Calc Security
      const { score: secScore, issues: secIssues } = checkSecurity(config, lastHeaders);

      return { 
        ...provider, 
        latency: p50, p99, uptime: reliability, blockHeight: lastBlockHeight, 
        lag: p50 === 0 ? 'Error' : 0,
        history: updatedHistory,
        securityScore: secScore,
        securityIssues: secIssues,
        lastResponse: lastRawResponse
      };
    }));

    // Post-Process Lag
    const validResults = updates.filter(u => u.blockHeight > 0);
    const maxHeight = validResults.length > 0 ? Math.max(...validResults.map(u => u.blockHeight)) : 0;
    const finalData = updates.map(u => ({
      ...u,
      lag: (u.blockHeight > 0 && maxHeight > 0) ? (maxHeight - u.blockHeight) : (u.uptime > 0 ? 'Synced' : 'N/A')
    }));

    setData(finalData);
    addLog(`Audit Complete. Max Block: ${maxHeight}`);
    setIsRunning(false);
  }, [benchmarkData, activeNetwork, precisionMode, requestType]);

  return { benchmarkData, isRunning, runBenchmark, logs };
};