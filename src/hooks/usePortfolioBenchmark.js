import { useState, useCallback } from 'react';
import * as Strategies from '../benchmarks/PortfolioStrategies';

// Helper: Calculate "Builder Impact Rating" (A+ to F) based on DX metrics
const calculateRating = (metrics) => {
    let score = 100;
    
    // 1. Efficiency Penalty (RAF)
    if (metrics.requests_sent > 1) score -= (metrics.requests_sent * 5); // -5 per extra request
    
    // 2. Data Penalty
    if (!metrics.richness?.has_price) score -= 25; // Critical for wallets
    if (!metrics.richness?.has_logo) score -= 10;
    
    // 3. Speed Penalty
    if (metrics.time_ms > 800) score -= 10;
    if (metrics.time_ms > 1500) score -= 20;

    if (score >= 95) return { grade: "A+", color: "text-emerald-400" };
    if (score >= 85) return { grade: "A", color: "text-emerald-500" };
    if (score >= 70) return { grade: "B", color: "text-blue-400" };
    if (score >= 50) return { grade: "C", color: "text-amber-400" };
    return { grade: "D", color: "text-red-400" };
};

export const usePortfolioBenchmark = () => {
    const [results, setResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const runScenario = useCallback(async (walletAddress) => {
        setIsRunning(true);
        setResults([]);

        // Get keys from env
        const keys = {
            covalent: import.meta.env.VITE_COVALENT_KEY,
            alchemy: import.meta.env.VITE_ALCHEMY_KEY,
            infura: import.meta.env.VITE_INFURA_KEY,
        };

        const tasks = [
            Strategies.fetchCovalentPortfolio(walletAddress, 1, keys.covalent),
            Strategies.fetchAlchemyPortfolio(walletAddress, 1, keys.alchemy),
            Strategies.fetchInfuraPortfolio(walletAddress, 1, keys.infura),
            // Add Codex/Mobula calls here similarly
        ];

        const rawResults = await Promise.allSettled(tasks);

        const processed = rawResults
            .map(res => {
                if (res.status === 'rejected' || res.value.error) return null;
                
                const r = res.value;
                // RAF: Request Amplification Factor = Actual Requests / 1 Logical Task
                const raf = r.requests_sent; 

                return {
                    provider: r.provider,
                    metrics: {
                        time_ms: Math.round(r.time_ms),
                        requests_sent: r.requests_sent,
                        raf: `${raf}x`, 
                        cost: `${Math.round(r.cost_units)} ${r.cost_model}`,
                        richness: r.richness,
                        rating: calculateRating(r),
                        notes: r.notes
                    }
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.metrics.time_ms - b.metrics.time_ms); // Sort by speed

        setResults(processed);
        setIsRunning(false);
    }, []);

    return { runScenario, results, isRunning };
};