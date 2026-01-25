import { Zap, Activity, Gauge, DollarSign } from 'lucide-react';

export const INITIAL_DATA = [
  { name: 'Alchemy', latency: 0, p99: 0, uptime: 100, baseCost: 15, coverage: 8, color: '#3b82f6', history: [0,0], freeTier: '300M CUs', archive: false, trace: true, certs: ['SOC2', 'GDPR'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Infura', latency: 0, p99: 0, uptime: 100, baseCost: 20, coverage: 12, color: '#ff5e57', history: [0,0], freeTier: '100k/day', archive: false, trace: true, certs: ['SOC2', 'HIPAA'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'QuickNode', latency: 0, p99: 0, uptime: 100, baseCost: 25, coverage: 35, color: '#34e7e4', history: [0,0], freeTier: '10M Credits', archive: false, trace: true, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Covalent', latency: 0, p99: 0, uptime: 100, baseCost: 12, coverage: 225, color: '#f59e0b', history: [0,0], freeTier: 'Premium Trial', archive: true, trace: false, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Mobula', latency: 0, p99: 0, uptime: 100, baseCost: 10, coverage: 45, color: '#8b5cf6', history: [0,0], freeTier: 'Freemium', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Codex', latency: 0, p99: 0, uptime: 100, baseCost: 5, coverage: 30, color: '#10b981', history: [0,0], freeTier: 'Free', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] }
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
    { metric: "Latency & Lag", type: "Real-Time", reason: "Measured live from your session." },
    { metric: "Security/Header Leaks", type: "Real-Time", reason: "We analyze response headers for 'Server' or 'X-Powered-By' leakage." },
    { metric: "Smart Contract Read", type: "Real-Time", reason: "Performs actual eth_call to verified Token Contracts on-chain." },
    { metric: "Chain Coverage", type: "Static", reason: "Hardcoded from documentation." },
];

export const BUILDER_METRICS = {
    complexity: {
        LOW: 1,      // SDK/Unified API (1-2 lines of code)
        MEDIUM: 3,   // RPC with some helper methods
        HIGH: 5      // Raw RPC, manual ABI decoding, multiple loops
    },
    costs: {
        // Standardized to Micro-USD per request/unit for comparison
        transaction_item: 10,   // Covalent (~$0.00001 per item)
        compute_unit: 0.2,      // Alchemy (~$0.20 per 1M CUs -> 0.0002 per CU)
        credit_mobula: 50,      // Mobula (Approx proxy)
        request_flat: 350,      // Codex/Defined ($350/1M -> 0.00035 per req)
        credit_qn: 0.1,         // QuickNode
        credit_infura: 0.15     // Infura
    }
};

// Top 20 Token Contracts for "Waterfall" simulation (Ethereum)
export const SIMULATION_TOKENS = [
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", // BNB
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    // ... (In a real app, this list would be longer. We use these for the loop)
];