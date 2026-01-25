import { useState, useCallback } from 'react';
import { PortfolioBenchmark } from '../benchmarks/PortfolioBenchmark';

export const usePortfolioBenchmark = () => {
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState("");

    const runPortfolioTest = useCallback(async (walletAddress, chainId) => {
        setIsRunning(true);
        setResults(null);
        setProgress("Initializing Builder's Impact Framework...");

        try {
            const engine = new PortfolioBenchmark(walletAddress, chainId);
            
            // In a real scenario we might emit events, for now we just wait
            setProgress("Simulating Wallet Load & Fetching Data...");
            const data = await engine.run();
            
            setResults(data);
            setProgress("Complete");
        } catch (e) {
            console.error(e);
            setProgress("Error during execution");
        } finally {
            setIsRunning(false);
        }
    }, []);

    return { results, isRunning, progress, runPortfolioTest };
};