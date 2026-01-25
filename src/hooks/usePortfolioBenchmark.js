import { useState, useCallback } from 'react';
import { PortfolioBenchmark } from '../benchmarks/PortfolioBenchmark';

export const usePortfolioBenchmark = () => {
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState("");
    const [logs, setLogs] = useState([]); // NEW: Logs State

    const runPortfolioTest = useCallback(async (walletAddress, chainId) => {
        setIsRunning(true);
        setResults(null);
        setLogs([]); // Reset logs
        setProgress("Initializing Builder's Impact Framework...");

        try {
            // NEW: Pass a callback to capture logs from the class
            const engine = new PortfolioBenchmark(walletAddress, chainId, (msg) => {
                const timestamp = new Date().toLocaleTimeString().split(' ')[0];
                setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
            });
            
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

    return { results, isRunning, progress, runPortfolioTest, logs }; // Return logs
};