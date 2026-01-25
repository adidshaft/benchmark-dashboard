import { useState, useEffect } from 'react';

// Official Atlassian Statuspage API endpoints
const STATUS_ENDPOINTS = {
    Alchemy: 'https://status.alchemy.com/api/v2/summary.json',
    Infura: 'https://status.infura.io/api/v2/summary.json',
    QuickNode: 'https://status.quicknode.com/api/v2/summary.json',
    // Covalent/Mobula/Codex don't expose public JSON feeds in this standard format yet.
};

export const useStatusPage = () => {
    const [statuses, setStatuses] = useState({});

    useEffect(() => {
        const fetchStatuses = async () => {
            const results = {};
            
            const promises = Object.entries(STATUS_ENDPOINTS).map(async ([name, url]) => {
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    // Normalize the data (Atlassian format)
                    results[name] = {
                        indicator: data.status.indicator, // 'none', 'minor', 'major', 'critical'
                        description: data.status.description
                    };
                } catch (e) {
                    console.warn(`Failed to fetch status for ${name}`, e);
                    results[name] = { indicator: 'unknown', description: 'Status info unavailable' };
                }
            });

            await Promise.all(promises);
            setStatuses(results);
        };

        fetchStatuses();
        // Poll every 5 minutes
        const interval = setInterval(fetchStatuses, 300000);
        return () => clearInterval(interval);
    }, []);

    return statuses;
};