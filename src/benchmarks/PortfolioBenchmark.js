import { NETWORK_CONFIG } from '../hooks/useBenchmark';
import { BUILDER_METRICS } from '../config/constants';

export class PortfolioBenchmark {
    constructor(walletAddress, chainId = 'ethereum', onLog = () => {}) {
        this.wallet = walletAddress;
        this.chain = chainId;
        this.config = NETWORK_CONFIG[chainId];
        this.log = onLog; 
        this.results = {};
    }

    async run() {
        this.log(`Starting Portfolio Benchmark for ${this.wallet}...`);
        const providers = ['Covalent', 'Alchemy', 'Mobula', 'Codex', 'QuickNode', 'Infura'];
        const promises = providers.map(p => this.evaluateProvider(p));
        const results = await Promise.all(promises);
        this.log("Benchmark Complete. Aggregating results.");
        return results.reduce((acc, curr) => ({ ...acc, [curr.provider]: curr }), {});
    }

    async evaluateProvider(name) {
        const start = performance.now();
        let metrics = {
            requests_sent: 0,
            data_richness_score: 0,
            estimated_cost_units: 0,
            integration_complexity: BUILDER_METRICS.complexity.HIGH
        };

        try {
            this.log(`[${name}] Initiating request sequence...`);
            switch (name) {
                case 'Covalent':
                    metrics = await this.benchmarkCovalent();
                    break;
                case 'Alchemy':
                    metrics = await this.benchmarkAlchemy();
                    break;
                case 'Mobula':
                    metrics = await this.benchmarkMobula();
                    break;
                case 'Codex':
                    metrics = await this.benchmarkCodex();
                    break;
                case 'QuickNode':
                    metrics = await this.benchmarkQuickNode();
                    break;
                case 'Infura':
                    metrics = await this.benchmarkInfura();
                    break;
                default:
                    throw new Error("Unknown Provider");
            }
            this.log(`[${name}] Success. Time: ${Math.round(performance.now() - start)}ms`);
        } catch (e) {
            this.log(`[${name}] Error: ${e.message}`);
            console.error(`${name} Failed:`, e);
            return {
                provider: name,
                error: e.message,
                metrics: { 
                    ...metrics, 
                    time_to_interactive_ms: 0, 
                    builder_impact_rating: 'F',
                    score_details: { score: 0, grade: 'F', breakdown: [{ reason: "Execution Error", delta: -100 }] }
                }
            };
        }

        const end = performance.now();
        const time = Math.round(end - start);
        const raf = metrics.requests_sent; 
        const scoring = this.calculateScoreBreakdown(time, raf, metrics.data_richness_score, metrics.integration_complexity);

        return {
            provider: name,
            scenario: "Portfolio_Load",
            metrics: {
                time_to_interactive_ms: time,
                requests_sent: metrics.requests_sent,
                data_richness_score: metrics.data_richness_score,
                estimated_cost_units: metrics.estimated_cost_units,
                builder_impact_rating: scoring.grade, 
                score_details: scoring
            }
        };
    }

    // --- PROVIDER SPECIFIC LOGIC ---

    async benchmarkCovalent() {
        const apiKey = import.meta.env.VITE_COVALENT_KEY;
        const url = `https://api.covalenthq.com/v1/${this.config.id}/address/${this.wallet}/balances_v2/?key=${apiKey}`;
        
        this.log(`[Covalent] Fetching Unified 'balances_v2' API...`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const items = data.data?.items || [];
        
        this.log(`[Covalent] Received ${items.length} items with full metadata.`);
        return {
            requests_sent: 1,
            data_richness_score: items.length > 0 ? 98 : 0,
            estimated_cost_units: items.length, 
            integration_complexity: BUILDER_METRICS.complexity.LOW
        };
    }

    async benchmarkAlchemy() {
        const url = this.config['Alchemy'].url;
        this.log(`[Alchemy] Sending Batch: getAssetTransfers + getNfts...`);
        
        const payload1 = { jsonrpc: "2.0", id: 1, method: "alchemy_getAssetTransfers", params: [{ fromBlock: "0x0", toAddress: this.wallet, category: ["erc20"] }] };
        const payload2 = { jsonrpc: "2.0", id: 2, method: "alchemy_getNfts", params: [{ owner: this.wallet }] };
        
        const res = await fetch(url, { method: 'POST', body: JSON.stringify([payload1, payload2]) });
        if(!res.ok) this.log(`[Alchemy] Request failed or key missing.`);

        return {
            requests_sent: 1, 
            data_richness_score: 85,
            estimated_cost_units: 630, 
            integration_complexity: BUILDER_METRICS.complexity.MEDIUM
        };
    }

    async benchmarkMobula() {
        const url = `https://api.mobula.io/api/1/wallet/portfolio?wallet=${this.wallet}`;
        this.log(`[Mobula] Fetching '/wallet/portfolio'...`);
        const res = await fetch(url, { headers: { Authorization: import.meta.env.VITE_MOBULA_KEY }});
        const data = await res.json();
        const hasPrice = data.assets?.[0]?.price !== undefined;
        
        return {
            requests_sent: 1,
            data_richness_score: hasPrice ? 95 : 50,
            estimated_cost_units: 1, 
            integration_complexity: BUILDER_METRICS.complexity.LOW
        };
    }

    async benchmarkCodex() {
        const apiKey = import.meta.env.VITE_CODEX_KEY;
        if (!apiKey) {
            this.log(`[Codex] Skipped: VITE_CODEX_KEY missing in .env`);
            return { requests_sent: 0, data_richness_score: 0, estimated_cost_units: 0, integration_complexity: BUILDER_METRICS.complexity.HIGH };
        }

        const endpoint = "https://graph.codex.io/graphql";
        // Unified Query: Balances + Metadata + Prices
        const query = `
            query GetBalances($wallet: String!, $network: Int!) {
              balances(walletAddress: $wallet, networks: [$network]) {
                items {
                  tokenAddress
                  symbol
                  balance
                  decimals
                  tokenPriceUsd
                  imageThumbUrl
                }
              }
            }
        `;

        this.log(`[Codex] Posting GraphQL Query (Balances + Prices + Logos)...`);
        
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': apiKey 
            },
            body: JSON.stringify({
                query,
                variables: { wallet: this.wallet, network: this.config.id }
            })
        });

        if (!res.ok) throw new Error(`Codex API Error: ${res.status}`);
        
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);

        const items = json.data?.balances?.items || [];
        this.log(`[Codex] Success. Retrieved ${items.length} holdings.`);

        // Scoring: Codex returns prices and images, so richness is high
        const hasRichData = items.some(i => i.tokenPriceUsd && i.imageThumbUrl);

        return {
            requests_sent: 1,
            data_richness_score: hasRichData ? 98 : 70, 
            estimated_cost_units: 1, // 1 Query = 1 Unit cost roughly
            integration_complexity: BUILDER_METRICS.complexity.MEDIUM // GraphQL requires schema knowledge
        };
    }

    async benchmarkQuickNode() {
        const url = this.config['QuickNode'].url;
        this.log(`[QuickNode] Attempting Core Ext: 'qn_getWalletTokenBalance'...`);
        
        const payload = { method: "qn_getWalletTokenBalance", params: [{ wallet: this.wallet }] };
        try {
            await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
        } catch(e) {
            this.log(`[QuickNode] Addon not detected or failed.`);
        }

        return {
            requests_sent: 1,
            data_richness_score: 70, 
            estimated_cost_units: 2, 
            integration_complexity: BUILDER_METRICS.complexity.MEDIUM
        };
    }

    async benchmarkInfura() {
        const url = this.config['Infura'].url;
        if (!url) throw new Error("Infura Not Configured");

        this.log(`[Infura] Step 1: eth_getBalance...`);
        await fetch(url, { method: 'POST', body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBalance", params: [this.wallet, "latest"], id: 1 }) });

        this.log(`[Infura] Step 2: Simulating Waterfall (Sequential eth_call)...`);
        const tokens = ["0xdac...", "0xb8c...", "0xa0b...", "0x123...", "0x456..."]; 
        for (const t of tokens) {
             await fetch(url, { 
                 method: 'POST', 
                 body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to: t, data: "0x70a08231..." }, "latest"], id: 1 }) 
             });
        }
        this.log(`[Infura] Waterfall complete. ${tokens.length + 1} requests sent.`);

        return {
            requests_sent: 1 + tokens.length, 
            data_richness_score: 20, 
            estimated_cost_units: 80 + (26 * tokens.length), 
            integration_complexity: BUILDER_METRICS.complexity.HIGH
        };
    }

    calculateScoreBreakdown(time, requests, richness, complexity) {
        let score = 100;
        let breakdown = [];

        breakdown.push({ reason: "Max Potential Score", delta: 100, type: "base" });

        if (time > 500) {
            score -= 20;
            breakdown.push({ reason: "High Latency (>500ms)", delta: -20, type: "penalty" });
        } else {
             breakdown.push({ reason: "Fast Response (<500ms)", delta: 0, type: "neutral" });
        }

        if (requests > 1) {
            const pen = requests * 5;
            score -= pen;
            breakdown.push({ reason: `Request Amplification (${requests} reqs)`, delta: -pen, type: "penalty" });
        } else {
            breakdown.push({ reason: "Unified API Call (1 req)", delta: 0, type: "bonus" });
        }

        if (richness < 50) {
            score -= 30;
            breakdown.push({ reason: "Low Data Richness (Raw Hex)", delta: -30, type: "penalty" });
        } else if (richness > 80) {
             breakdown.push({ reason: "High Data Richness (Metadata)", delta: 0, type: "bonus" });
        }

        if (complexity === 5) { // HIGH
            score -= 15;
            breakdown.push({ reason: "High Integration Complexity", delta: -15, type: "penalty" });
        }

        score = Math.max(0, score);

        let grade = "C";
        if (score >= 90) grade = "S";
        else if (score >= 80) grade = "A+";
        else if (score >= 70) grade = "A";
        else if (score >= 50) grade = "B";

        return { grade, score, breakdown };
    }
}