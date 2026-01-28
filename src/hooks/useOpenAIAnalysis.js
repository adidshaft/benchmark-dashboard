import { useState } from 'react';
import { COVAL_SCORE_DOCS, USE_CASE_PRESETS } from '../config/constants';

export const useOpenAIAnalysis = () => {
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const analyzeData = async (benchmarkData, portfolioData, context = "Web3 RPC Provider Benchmark") => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis('');

        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
            setError("Missing OpenAI API Key. Please add VITE_OPENAI_API_KEY to your .env.local file.");
            setIsAnalyzing(false);
            return;
        }

        try {
            // 1. Filter Data to save tokens & focus attention
            const cleanBenchmark = benchmarkData.map(p => ({
                provider: p.name,
                latency_p50: p.latency,
                latency_p99: p.p99,
                batch_throughput: p.batchLatency,
                reliability: p.uptime < 100 ? `${p.uptime}%` : "Perfect",
                coval_score: p.score,
                cost_estimate: p.calculatedCost || "N/A"
            }));

            const cleanPortfolio = portfolioData ? Object.values(portfolioData).map(p => ({
                provider: p.provider,
                score_grade: p.metrics.builder_impact_rating,
                total_requests: p.metrics.requests_sent,
                time_to_interactive: p.metrics.time_to_interactive_ms,
                score_breakdown: p.metrics.score_details?.breakdown?.map(b => `${b.reason}: ${b.delta > 0 ? '+' : ''}${b.delta}`)
            })) : "No Portfolio Scenario Data Available";

            // 2. Construct Prompt
            const systemPrompt = `You are a Senior Web3 DevOps Engineer & Data Scientist.
Your goal is to analyze RPC Benchmark data (Standard & Builder's Framework) and explain the "CovalScore".

**The CovalScore Formula:**
${COVAL_SCORE_DOCS.formula}
Where:
- x: Raw Metric (e.g., Latency)
- mu: Industry Mean (e.g., 300ms)
- k: Slope (Sensitivity, typically 0.01)
- We use **Sigmoid Normalization** to penalize outliers without destroying the scale.

**Output Structure:**
1. **Executive Summary**: Verdict on the best provider.
2. **Benchmark Report Analysis**: comments on P50/P99 latency and Covalent's specific performance (explain high latency vs richness if applicable).
3. **Builder's Impact Analysis**: "Waterfall" vs "Unified" API comparison based on the Portfolio data.
4. **CovalScore Deep Dive**: Pick one provider and explain how their score was derived using the Sigmoid logic (e.g., "Because Latency was X, the Sigmoid output was Y...").
5. **Anomalies & Fixes**: Why are some values high? How to fix?`;

            const userPrompt = `Context: ${context}

Benchmark Report (Main):
${JSON.stringify(cleanBenchmark, null, 2)}

Builder's Impact Framework (Portfolio/Swap):
${JSON.stringify(cleanPortfolio, null, 2)}

Please strictly follow the structure above.`;

            // 3. Call OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o", // Default to 4o, fallbacks can be handled if needed
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (content) {
                setAnalysis(content);
            } else {
                throw new Error("No analysis received from OpenAI.");
            }

        } catch (err) {
            console.error("OpenAI Analysis Error:", err);
            setError(`Analysis Failed: ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return { analysis, isAnalyzing, error, analyzeData, clearAnalysis: () => setAnalysis('') };
};
