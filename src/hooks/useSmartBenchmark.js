import { useState, useCallback } from 'react';
import { CONTRACT_REGISTRY } from '../config/contracts';
import { encodeFunctionCall } from '../utils/abiEncoder';

const performRpcCall = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await response.json();
        return { ok: response.ok, result: json.result, error: json.error };
    } catch (e) {
        return { ok: false, error: e.message };
    }
};

export const useSmartBenchmark = (initialData, activeNetwork) => {
    const [contractData, setContractData] = useState([]);
    const [isTestingContracts, setIsTestingContracts] = useState(false);

    // Calculate the most common result (The "Truth")
    const getConsensus = (results) => {
        if (!results || results.length === 0) return null;
        const counts = {};
        results.forEach(r => { 
            if (r.success && r.result) counts[r.result] = (counts[r.result] || 0) + 1; 
        });
        // Returns the result with the highest count
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
    };

    const runContractTest = useCallback(async (providers, type = 'erc20') => {
        setIsTestingContracts(true);
        setContractData([]); 
        
        const targetContract = CONTRACT_REGISTRY[activeNetwork]?.[type];

        if (!targetContract) {
            console.warn(`No ${type} contract configured for ${activeNetwork}`);
            setIsTestingContracts(false);
            return;
        }

        const encodedData = encodeFunctionCall(targetContract.testMethod, targetContract.testParams);
        const payload = {
            jsonrpc: "2.0", id: 1, method: "eth_call",
            params: [{ to: targetContract.address, data: encodedData }, "latest"]
        };

        const rawResults = await Promise.all(providers.map(async (provider) => {
            if (!provider.url || !provider.url.startsWith('http')) {
                return { name: provider.name, success: false, time: 0, result: null };
            }

            const start = performance.now();
            const res = await performRpcCall(provider.url, payload);
            const end = performance.now();

            let formattedResult = null;
            if (res.result && res.result !== '0x') {
                try {
                    // Normalize BigInts to strings for comparison
                    if (targetContract.testMethod === 'uri' || targetContract.testMethod === 'name') {
                        formattedResult = "Data Found"; 
                    } else {
                        formattedResult = BigInt(res.result).toString();
                    }
                } catch (e) {
                    formattedResult = "Decode Error";
                }
            }

            return {
                name: provider.name,
                success: res.ok && !res.error && formattedResult !== null,
                time: Math.round(end - start),
                result: formattedResult,
                target: targetContract.name
            };
        }));

        // Analyze Consensus
        const consensusValue = getConsensus(rawResults);
        
        const auditedResults = rawResults.map(r => ({
            ...r,
            // It is a mismatch if it succeeded, we have a consensus, and this result differs from consensus
            isMismatch: r.success && consensusValue && r.result !== consensusValue
        }));

        setContractData(auditedResults);
        setIsTestingContracts(false);
    }, [activeNetwork]);

    return { contractData, isTestingContracts, runContractTest };
};