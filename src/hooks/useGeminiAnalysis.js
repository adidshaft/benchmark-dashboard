import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Note: In production, API calls should go through your own backend to hide the key.
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// List of models to try in order of preference (Newest -> Oldest/Stable)
const FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash" // Keep for legacy if supported, but prioritize 2.0
];

export const useGeminiAnalysis = () => {
    const [analysis, setAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const analyzeData = async (benchmarkData, portfolioData, context = "General Benchmark") => {
        setIsAnalyzing(true);
        setError(null);
        setAnalysis('');

        try {
            // 1. Filter Data to save tokens
            const cleanBenchmark = benchmarkData.map(p => ({
                provider: p.name,
                latency: p.latency,
                consistency: p.history ? "Variable" : "Stable",
                errorRate: 100 - p.uptime,
                cost: p.calculatedCost
            }));

            const cleanPortfolio = portfolioData ? Object.values(portfolioData).map(p => ({
                provider: p.provider,
                rating: p.metrics.builder_impact_rating,
                requests: p.metrics.requests_sent,
                time: p.metrics.time_to_interactive_ms
            })) : "No Portfolio Scenario Run";

            // 2. Construct Prompt
            const prompt = `
        You are a Senior Web3 DevOps Engineer. Analyze the following RPC Provider Benchmark data.
        
        **Context:** ${context}
        **Benchmark Data:** ${JSON.stringify(cleanBenchmark)}
        **Builder Impact Data:** ${JSON.stringify(cleanPortfolio)}

        **Your Task:**
        1. **The "Why":** Explain WHY specific providers performed better.
        2. **Consequences:** What is the business impact?
        3. **Recommendation:** Which technology fits which use-case?
        
        Keep it concise, professional, and use Bullet points.
      `;

            // 3. Robust Model Selection Loop
            let result = null;
            let usedModel = '';

            for (const modelName of FALLBACK_MODELS) {
                try {
                    console.log(`[Gemini] Attempting with model: ${modelName}...`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    result = await model.generateContent(prompt);
                    usedModel = modelName;
                    break; // Success! Exit loop.
                } catch (e) {
                    console.warn(`[Gemini] Failed with ${modelName}:`, e.message);
                    // Continue to next model
                }
            }

            if (!result) {
                throw new Error("All available Gemini models failed. Please check your API Key and Region support.");
            }

            console.log(`[Gemini] Success using: ${usedModel}`);
            const response = await result.response;
            setAnalysis(response.text());

        } catch (err) {
            console.error("Gemini Critical Error:", err);
            setError(`Analysis Failed: ${err.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return { analysis, isAnalyzing, error, analyzeData, clearAnalysis: () => setAnalysis('') };
};