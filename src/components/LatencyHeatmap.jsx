import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Mock data generator for the heatmap (since we don't have multi-method live data yet)
// In a real app, this would come from the backend/probe.
const generateHeatmapData = (providers) => {
    const methods = ["eth_call", "eth_getLogs", "trace_call", "get_balance"];
    return providers.map(p => ({
        name: p.name,
        color: p.color,
        methods: methods.map(m => {
            // Simulate realistic variations
            const base = (typeof p.latency === 'number' && p.latency > 0) ? p.latency : 100;
            const multiplier = m === "trace_call" ? 3 : m === "eth_getLogs" ? 1.5 : 1;
            const val = Math.round(base * multiplier * (0.8 + Math.random() * 0.4));
            return { name: m, value: val };
        })
    }));
};

const LatencyHeatmap = ({ data }) => {
    const heatmapData = generateHeatmapData(data);

    const getColor = (val) => {
        if (val < 100) return "bg-emerald-500/80";
        if (val < 300) return "bg-blue-500/80";
        if (val < 600) return "bg-amber-500/80";
        return "bg-red-500/80";
    };

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
                <div className="flex mb-2">
                    <div className="w-24"></div>
                    {heatmapData[0].methods.map(m => (
                        <div key={m.name} className="flex-1 text-center text-[10px] uppercase font-bold text-slate-500">
                            <div className="flex items-center justify-center gap-1">
                                {m.name.replace('eth_', '').replace('_', ' ')}
                                <div data-tooltip-id="heatmap-tooltip" data-tooltip-content={m.name === "eth_call" ? "Smart Contract Read" : m.name === "eth_getLogs" ? "Event Fetch" : m.name === "trace_call" ? "Debug Trace" : "Native Balance"} className="cursor-help opacity-50 hover:opacity-100">ⓘ</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-1">
                    {heatmapData.map((row) => (
                        <div key={row.name} className="flex items-center gap-1">
                            <div className="w-24 text-xs font-bold text-slate-400 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }}></div>
                                {row.name}
                            </div>
                            {row.methods.map((cell) => (
                                <div
                                    key={cell.name}
                                    className={`flex-1 h-8 rounded hover:opacity-100 opacity-90 transition-all flex items-center justify-center text-[10px] font-mono text-white font-bold cursor-help ${getColor(cell.value)}`}
                                    data-tooltip-id="heatmap-tooltip"
                                    data-tooltip-content={`${row.name} - ${cell.name}: ${cell.value}ms`}
                                >
                                    {cell.value}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <ReactTooltip id="heatmap-tooltip" className="z-50 !bg-slate-900 !text-white !opacity-100 !px-2 !py-1 !text-xs !rounded-lg !border !border-slate-700" />
        </div>
    );
};

export default LatencyHeatmap;