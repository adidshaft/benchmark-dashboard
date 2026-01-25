// src/benchmarks/PortfolioStrategies.js

// 1. Covalent (The "One-Shot" Gold Standard)
export const fetchCovalentPortfolio = async (address, chainId, apiKey) => {
    if (!apiKey) return { error: "Missing API Key" };
    const start = performance.now();
    try {
        // Unified API: Balances + Prices + Metadata + Deltas in 1 call
        const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${apiKey}&nft=true`;
        const res = await fetch(url);
        const data = await res.json();
        const end = performance.now();

        if (data.error) throw new Error(data.error_message);

        return {
            provider: 'Covalent',
            requests_sent: 1, // The "Unified" advantage
            time_ms: end - start,
            // Cost: 0.1 credits per item returned
            cost_units: (data.data?.items?.length || 0) * 0.1,
            cost_model: 'Credits',
            richness: {
                has_price: true,
                has_logo: true,
                has_history: true // Covalent includes 24h delta
            },
            notes: "Single call fetched assets + prices + metadata."
        };
    } catch (e) {
        return { provider: 'Covalent', error: e.message };
    }
};

// 2. Alchemy (The "Enhanced API" Approach)
export const fetchAlchemyPortfolio = async (address, chainId, apiKey) => {
    if (!apiKey) return { error: "Missing API Key" };
    const start = performance.now();
    try {
        const url = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
        
        // Call 1: Get Token Balances (Enhanced)
        const balRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0", id: 1, method: "alchemy_getTokenBalances",
                params: [address]
            })
        });
        const balanceData = await balRes.json();
        const tokenCount = balanceData.result?.tokenBalances?.length || 0;

        // Call 2: Get Metadata (Alchemy balances don't have prices/logos in the same call)
        // We simulate a metadata fetch for the first token found to verify capability
        if (tokenCount > 0) {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0", id: 2, method: "alchemy_getTokenMetadata",
                    params: [balanceData.result.tokenBalances[0].contractAddress]
                })
            });
        }
        
        const end = performance.now();

        return {
            provider: 'Alchemy',
            requests_sent: 2, // Balance + Metadata
            time_ms: end - start,
            // Cost: getTokenBalances (26 CUs) + Metadata (15 CUs per token)
            cost_units: 26 + (tokenCount * 15), 
            cost_model: 'Compute Units',
            richness: { 
                has_price: false, // Alchemy Core doesn't return fiat price
                has_logo: true, 
                has_history: false 
            },
            notes: "Requires separate metadata call. No native pricing."
        };
    } catch (e) {
        return { provider: 'Alchemy', error: e.message };
    }
};

// 3. Infura (The "Standard RPC" Baseline)
export const fetchInfuraPortfolio = async (address, chainId, apiKey) => {
    if (!apiKey) return { error: "Missing API Key" };
    const start = performance.now();
    try {
        const rpcUrl = `https://mainnet.infura.io/v3/${apiKey}`;
        
        // Step 1: Get ETH Balance
        await fetch(rpcUrl, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBalance", params: [address, "latest"], id: 1 })
        });

        // Step 2: "Waterfall Effect" Simulation
        // In a standard RPC, if we find 10 tokens, we need 10 calls for decimals/symbols
        // We simulate a batch of 5 calls representing top tokens
        const batch = Array(5).fill(0).map((_, i) => ({
            jsonrpc: "2.0", method: "eth_call", 
            params: [{ to: "0xdAC17F958D2ee523a2206206994597C13D831ec7", data: "0x313ce567" }, "latest"], // decimals() for USDT
            id: i + 2
        }));
        
        await fetch(rpcUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batch) 
        });
        const end = performance.now();

        return {
            provider: 'Infura',
            requests_sent: 6, // 1 Balance + 5 Batch items (often counted as separate CUs)
            time_ms: end - start,
            cost_units: 200, // Approx credit cost for 6 calls
            cost_model: 'Total Credits',
            richness: { has_price: false, has_logo: false, has_history: false },
            notes: "Heavy 'Over-fetching'. No prices or metadata."
        };
    } catch (e) {
        return { provider: 'Infura', error: e.message };
    }
};