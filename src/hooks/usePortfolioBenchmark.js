import { useState, useCallback } from 'react';
import { PortfolioBenchmark } from '../benchmarks/PortfolioBenchmark';

export const usePortfolioBenchmark = () => {
    const [results, setResults] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState("");
    const [logs, setLogs] = useState([]);

    // Added 'scenario' argument
    const runPortfolioTest = useCallback(async (walletAddress, chainId, scenario = "Portfolio_Load") => {
        setIsRunning(true);
        setResults(null);
        setLogs([]);
        setProgress(`Initializing ${scenario} Framework...`);

        try {
            const engine = new PortfolioBenchmark(walletAddress, chainId, (msg) => {
                const timestamp = new Date().toLocaleTimeString().split(' ')[0];
                setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
            });

            setProgress("Executing Benchmark Scenarios...");
            // Pass scenario to run()
            const data = await engine.run(scenario);

            setResults(data);
            setProgress("Complete");
        } catch (e) {
            console.error(e);
            setProgress("Error during execution");
        } finally {
            setIsRunning(false);
        }
    }, []);

    return { results, isRunning, progress, runPortfolioTest, logs };
};