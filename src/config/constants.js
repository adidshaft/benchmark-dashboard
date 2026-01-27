import { Zap, Activity, Gauge, DollarSign, Sparkles, Terminal } from 'lucide-react';

// ... (Keep INITIAL_DATA, SUPPORTED_CHAINS, USE_CASE_PRESETS, METRIC_DEFINITIONS, DEFINITIONS_DATA, TRANSPARENCY_DATA, BUILDER_METRICS as they are) ...
export const INITIAL_DATA = [
    { name: 'Alchemy', latency: 0, p99: 0, uptime: 100, baseCost: 15, coverage: 8, color: '#3b82f6', history: [0, 0], freeTier: '300M CUs', archive: false, trace: true, certs: ['SOC2', 'GDPR'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
    { name: 'Infura', latency: 0, p99: 0, uptime: 100, baseCost: 20, coverage: 12, color: '#ff5e57', history: [0, 0], freeTier: '100k/day', archive: false, trace: true, certs: ['SOC2', 'HIPAA'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
    { name: 'QuickNode', latency: 0, p99: 0, uptime: 100, baseCost: 25, coverage: 35, color: '#34e7e4', history: [0, 0], freeTier: '10M Credits', archive: false, trace: true, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
    { name: 'Covalent', latency: 0, p99: 0, uptime: 100, baseCost: 12, coverage: 225, color: '#f59e0b', history: [0, 0], freeTier: 'Premium Trial', archive: true, trace: false, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
    { name: 'Mobula', latency: 0, p99: 0, uptime: 100, baseCost: 10, coverage: 45, color: '#8b5cf6', history: [0, 0], freeTier: 'Freemium', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
    { name: 'Codex', latency: 0, p99: 0, uptime: 100, baseCost: 5, coverage: 30, color: '#10b981', history: [0, 0], freeTier: 'Free', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] }
];

export const SUPPORTED_CHAINS = [
    { id: 'ethereum', label: 'Ethereum', color: 'bg-indigo-500' },
    { id: 'polygon', label: 'Polygon', color: 'bg-purple-500' },
    { id: 'arbitrum', label: 'Arbitrum', color: 'bg-blue-400' },
    { id: 'optimism', label: 'Optimism', color: 'bg-red-500' },
    { id: 'base', label: 'Base', color: 'bg-blue-600' },
    { id: 'bsc', label: 'BSC', color: 'bg-amber-400' },
    { id: 'avalanche', label: 'Avalanche', color: 'bg-red-600' },
];

export const USE_CASE_PRESETS = {
    general: { label: "General Purpose", desc: "Balanced mix of speed, reliability, and cost.", weights: { latency: 0.3, batch: 0.1, reliability: 0.3, cost: 0.2, integrity: 0.1 } },
    dex: { label: "DEX / Trading", desc: "Prioritizes raw execution speed & P99 stability.", weights: { latency: 0.5, batch: 0.0, reliability: 0.4, cost: 0.0, integrity: 0.1 } },
    wallet: { label: "Wallet / Portfolio", desc: "Prioritizes Batch Throughput (loading many tokens).", weights: { latency: 0.1, batch: 0.5, reliability: 0.2, cost: 0.1, integrity: 0.1 } },
    indexer: { label: "Indexer / Data", desc: "Prioritizes Data Integrity, Archive Access & Uptime.", weights: { latency: 0.1, batch: 0.1, reliability: 0.3, cost: 0.1, integrity: 0.4 } },
    mint: { label: "NFT Mint", desc: "Prioritizes P99 Stress Handling to avoid drops.", weights: { latency: 0.2, batch: 0.0, reliability: 0.7, cost: 0.0, integrity: 0.1 } }
};

export const METRIC_DEFINITIONS = {
    score: { title: "CovalScore™", calc: "Dynamic Weighted Average based on selected Use Case.", meaning: "Best fit for your specific needs.", icon: Activity },
    speed: { title: "P50 Latency", calc: "Median response time.", meaning: "Lower is better.", icon: Zap },
    p99: { title: "P99 Stress", calc: "Peak response time.", meaning: "Lower is better.", icon: Gauge },
    cost: { title: "Est. Cost", calc: "Volume based projection.", meaning: "Lower is better.", icon: DollarSign },
    reliability: { title: "Session Uptime", calc: "% of successful pings.", meaning: "Higher is better.", icon: Activity }
};

export const DEFINITIONS_DATA = [
    { param: "Batch Throughput", unit: "ms/10 reqs", source: "Time to process a batch of 10 RPC calls.", relevance: "Simulates high-load dashboard performance." },
    { param: "P50 Latency", unit: "ms", source: "Median ping from client.", relevance: "General responsiveness." },
    { param: "Security Score", unit: "0-100", source: "HTTPS & Header Leak analysis.", relevance: "Infrastructure hardening level." },
    { param: "Archive Access", unit: "Boolean", source: "Live fetch of Genesis Block (#1).", relevance: "Verifies deep history access." },
    { param: "Execution Audit", unit: "State Check", source: "Verifies eth_call on ERC20/721/1155.", relevance: "Ensures provider can read actual smart contract state." },
    { param: "P99 Latency (Stress)", unit: "ms", source: "Response time during 10k RPS burst load.", relevance: "Vital for high-traffic dApps; indicates choking points." },
];

export const TRANSPARENCY_DATA = [
    { metric: "Latency & Lag", type: "Real-Time", reason: "Measured live from your session via browser fetch." },
    { metric: "Security/Header Leaks", type: "Real-Time", reason: "We analyze response headers for 'Server' or 'X-Powered-By' leakage." },
    { metric: "Unified API (Covalent/Mobula)", type: "Real-Time", reason: "Live calls to 'GoldRush' and 'Wallet' APIs." },
    { metric: "Codex (Defined.fi)", type: "Real-Time", reason: "Live GraphQL query for Balances & Metadata." },
    { metric: "Smart Contract Read", type: "Real-Time", reason: "Performs actual eth_call to verified Token Contracts on-chain." },
];

export const BUILDER_METRICS = {
    complexity: {
        LOW: 1,      // SDK/Unified API (1-2 lines of code)
        MEDIUM: 3,   // RPC with some helper methods
        HIGH: 5      // Raw RPC, manual ABI decoding, multiple loops
    },
    costs: {
        transaction_item: 10,   // Covalent (~$0.00001 per item)
        compute_unit: 0.2,      // Alchemy (~$0.20 per 1M CUs -> 0.0002 per CU)
        credit_mobula: 50,      // Mobula (Approx proxy)
        request_flat: 350,      // Codex/Defined ($350/1M -> 0.00035 per req)
        credit_qn: 0.1,         // QuickNode
        credit_infura: 0.15     // Infura
    }
};

export const BUILDER_IMPACT_DOCS = {
    title: "The Builder's Impact Framework",
    subtitle: "Benchmarking the 'Total Developer Experience' rather than just node latency.",
    ideology: {
        title: "The Ideology",
        content: "Traditional benchmarks measure how fast a single `eth_blockNumber` returns. This is irrelevant for modern dApps. We believe performance should be measured by the **Total Efficiency** of building a feature. If a provider is fast but forces you to make 50 requests to display one page, the User Experience suffers."
    },
    // NEW: Detailed Scenarios
    scenarios: {
        title: "Test Scenarios",
        portfolio: "Simulates a user connecting their wallet to a portfolio tracker. It fetches: 1) Full list of ERC20 balances, 2) USD Prices for each, 3) Logos/Metadata. A 'Perfect' provider does this in 1 call.",
        swap: "Simulates a DEX frontend preparing a trade. 1) Fetches Pool Reserves (Liquidity), 2) Calculates Price Impact (Client CPU), 3) Estimates Gas for the transaction."
    },
    specs: {
        title: "Simulation Specifications",
        target: "Wallet Portfolio (Balances + Prices + Metadata)",
        address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 (Vitalik.eth)",
        calls: [
            "1. Fetch ERC-20 Token Balances",
            "2. Fetch Token Decimals, Symbols, and Logos",
            "3. Fetch Real-time USD Spot Prices"
        ]
    },
    // NEW: Detailed Assumptions & Variations
    assumptions: [
        { label: "Covalent", detail: "Uses 'GoldRush' Unified API. Returns Balances + Price + Metadata in 1 call. 95% data richness." },
        { label: "Mobula", detail: "Uses '/wallet/portfolio' endpoint. Similar to Covalent but specialized for DeFi prices. 90% richness." },
        { label: "Codex", detail: "Uses GraphQL. Allows precise data fetching (No over-fetching). Requires schema knowledge. 85% richness." },
        { label: "Alchemy", detail: "Uses Enhanced APIs ('getAssetTransfers' + 'getNFTs'). Requires 2 calls. Metadata is often partial." },
        { label: "Infura/QuickNode", detail: "Standard RPC. Requires 'Waterfall' approach: 1 call for list, then Loop N calls for metadata. High R.A.F. (Request Amplification)." }
    ],
    metrics: [
        {
            title: "Request Amplification Factor",
            subtitle: "Metric 1: Efficiency",
            desc: "The ratio of HTTP requests needed to complete the task vs. the logical task count (1). A Unified API has an RAF of 1. A standard RPC often has an RAF of 10+ (Waterfall Effect).",
            color: "purple"
        },
        {
            title: "Data Richness Score",
            subtitle: "Metric 2: Completeness",
            desc: "Does the provider return application-ready data (Images, CSS-friendly decimals, Prices) or just raw blockchain hex? Higher score means less client-side processing code.",
            color: "emerald"
        },
        {
            title: "Time-to-Interactive",
            subtitle: "Metric 3: Speed",
            desc: "Measures the total time from the first request start to the final UI render. This accounts for the cumulative latency of sequential requests.",
            color: "amber"
        }
    ]
};

export const COVAL_SCORE_DOCS = {
    title: "Algorithmic Transparency: The CovalScore™",
    subtitle: "We do not use a generic average. The score is dynamically calculated based on your selected 'Builder Profile'.",
    formula: "Score = (S_Lat × W_L) + (S_Batch × W_B) + (S_Rel × W_R) + (S_Cost × W_C) + (S_Int × W_I)",
    legend: [
        { label: "S_Lat", desc: "Latency Score (Normalized)" },
        { label: "W_L", desc: "Weight (Variable)" }
    ],
    matrix: [
        { profile: "General Purpose", weights: { L: "30%", B: "10%", R: "30%", C: "20%", I: "10%" }, focus: "Balanced Mix" },
        { profile: "DEX / Trading", weights: { L: "50%", B: "0%", R: "40%", C: "0%", I: "10%" }, focus: "Speed Is King" },
        { profile: "Wallet / Portfolio", weights: { L: "10%", B: "50%", R: "20%", C: "10%", I: "10%" }, focus: "Throughput Is King" },
        { profile: "Indexer / Data", weights: { L: "10%", B: "10%", R: "30%", C: "10%", I: "40%" }, focus: "Accuracy Is King" },
        { profile: "NFT Mint", weights: { L: "20%", B: "0%", R: "70%", C: "0%", I: "10%" }, focus: "Uptime Is King" }
    ]
};