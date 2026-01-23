import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Info, 
  Settings2, Signal, Hexagon, DollarSign, Filter, Activity
} from 'lucide-react';
import { useBenchmark } from './hooks/useBenchmark';

// --- INITIAL DATA ---
const INITIAL_DATA = [
  { name: 'Alchemy', latency: 0, uptime: 100, cost: 25, coverage: 8, color: '#3b82f6', history: [0,0] },
  { name: 'Infura', latency: 0, uptime: 100, cost: 20, coverage: 12, color: '#ff5e57', history: [0,0] },
  { name: 'QuickNode', latency: 0, uptime: 100, cost: 35, coverage: 35, color: '#34e7e4', history: [0,0] },
  { name: 'Covalent', latency: 0, uptime: 100, cost: 15, coverage: 100, color: '#f59e0b', history: [0,0] },
  { name: 'Mobula', latency: 0, uptime: 100, cost: 10, coverage: 45, color: '#8b5cf6', history: [0,0] },
  { name: 'Codex', latency: 0, uptime: 100, cost: 5, coverage: 30, color: '#10b981', history: [0,0] }
];

// --- DEFINITIONS FOR TOOLTIPS ---
const METRIC_DEFINITIONS = {
  speed: {
    title: "Latency (Speed)",
    calc: "Time to First Byte (TTFB). We measure the round-trip time for a standard request.",
    meaning: "Lower is better. High latency causes laggy UIs."
  },
  cost: {
    title: "Cost Efficiency",
    calc: "Estimated cost per 1 Million Requests based on standard enterprise pricing.",
    meaning: "Lower is better. Vital for scaling apps."
  },
  scale: {
    title: "Chain Coverage",
    calc: "Number of unique blockchains supported by this provider.",
    meaning: "Higher is better. Essential for multi-chain apps."
  },
  reliability: {
    title: "Session Reliability",
    calc: "Percentage of successful pings during this session.",
    meaning: "Higher is better. <99% indicates instability."
  }
};

// --- COMPONENTS ---

// 1. Tooltip Wrapper (FIXED: Made opaque for readability)
const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center z-[100]">
    {children}
    {/* CHANGED: bg-slate-800 -> bg-slate-800/80 and added backdrop-blur-sm for readability */}
    <div className="absolute bottom-full mb-3 px-4 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700 text-left rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-64 shadow-2xl transform translate-y-2 group-hover:translate-y-0 z-[110]">
      {content}
      {/* Arrow: Also updated to match opacity */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800/80"></div>
    </div>
  </div>
);

// 2. Metric Definition Card
const MetricExplanation = ({ type }) => {
  const def = METRIC_DEFINITIONS[type];
  if (!def) return null;
  return (
    <div>
      <div className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        {def.title}
      </div>
      <p className="text-xs text-slate-300 mb-2 leading-relaxed opacity-80">{def.calc}</p>
      <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 inline-block">
        {def.meaning}
      </div>
    </div>
  );
};

// 3. Sparkline
const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>;
  
  const height = 32;
  const width = 100;
  const max = Math.max(...data, 1);
  const min = Math.min(...data.filter(d => d > 0)); 
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const normalizedY = val === 0 ? height : height - ((val - min) / ((max - min) || 1)) * (height - 5); 
    return `${x},${normalizedY}`;
  }).join(' ');

  return (
    <div className="h-8 w-24 opacity-80">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-[#0f172a]/40 border border-white/5 rounded-2xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  );
};

const BenchmarkChart = ({ data, activeMetric }) => {
  const getMetricKey = () => {
    switch(activeMetric) {
      case 'speed': return 'latency';
      case 'cost': return 'cost';
      case 'scale': return 'coverage';
      default: return 'uptime';
    }
  };

  const metricKey = getMetricKey();

  return (
    <div className="w-full mt-4 h-[350px] min-h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <defs>
             {data.map((entry, index) => (
                <linearGradient key={index} id={`grad${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.9}/>
                </linearGradient>
             ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'auto']} hide />
          <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={90} fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            cursor={{ fill: '#ffffff', opacity: 0.03 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Bar dataKey={metricKey} radius={[0, 6, 6, 0]} barSize={36} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#grad${index})`} stroke={entry.color} strokeWidth={1} strokeOpacity={0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('speed');
  const [network, setNetwork] = useState('ethereum'); 
  const [precision, setPrecision] = useState('standard'); 
  const [visibleProviders, setVisibleProviders] = useState(INITIAL_DATA.map(d => d.name));

  const { benchmarkData, isRunning, runBenchmark } = useBenchmark(INITIAL_DATA, network, precision);

  const filteredData = useMemo(() => {
    return benchmarkData.filter(d => visibleProviders.includes(d.name));
  }, [benchmarkData, visibleProviders]);

  const getWinner = () => {
    const active = filteredData.filter(p => p.latency > 0 && p.latency !== 999);
    if (active.length === 0) return { name: 'Ready', latency: 0 };
    if (activeTab === 'speed') return active.reduce((prev, curr) => prev.latency < curr.latency ? prev : curr);
    if (activeTab === 'cost') return active.reduce((prev, curr) => prev.cost < curr.cost ? prev : curr);
    return active[0];
  };

  const winner = getWinner();

  const toggleProvider = (name) => {
    setVisibleProviders(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* AMBIENT GLOW */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
               <Hexagon className="w-8 h-8 text-indigo-500 fill-indigo-500/10" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">Covalboard</h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold">Intelligence Platform</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 border border-white/5 px-3 py-1.5 rounded-full bg-white/[0.02]">
                <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                {isRunning ? 'Benchmarking...' : 'System Operational'}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* CONTROL DECK */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
           {/* LEFT: CONTROLS */}
           <div className="lg:col-span-1 space-y-4">
              <GlassCard className="p-5 space-y-6 border-t-4 border-t-indigo-500/50">
                  {/* NETWORK */}
                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2">
                       <Globe className="w-3 h-3" /> Target Network
                    </label>
                    <div className="flex flex-col gap-1">
                      {['ethereum', 'polygon', 'arbitrum'].map((net) => (
                        <button
                          key={net}
                          onClick={() => setNetwork(net)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            network === net 
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' 
                              : 'text-slate-400 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <span className="capitalize">{net}</span>
                          {network === net && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  {/* COMPETITOR FILTER */}
                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2">
                       <Filter className="w-3 h-3" /> Competitors
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {INITIAL_DATA.map((p) => (
                            <button 
                                key={p.name}
                                onClick={() => toggleProvider(p.name)}
                                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                    visibleProviders.includes(p.name) 
                                    ? 'bg-slate-700 border-slate-600 text-white' 
                                    : 'border-slate-800 text-slate-600 opacity-50'
                                }`}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  {/* PRECISION */}
                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2">
                       <Settings2 className="w-3 h-3" /> Precision Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setPrecision('standard')} className={`text-xs py-2 rounded border ${precision === 'standard' ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-800 text-slate-500'}`}>
                           Fast (1x)
                        </button>
                        <Tooltip content={<div className="p-2 text-xs">Pings 5x for average. Robust but slower.</div>}>
                            <button onClick={() => setPrecision('robust')} className={`w-full text-xs py-2 rounded border ${precision === 'robust' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-slate-800 text-slate-500'}`}>
                               Robust (5x)
                            </button>
                        </Tooltip>
                    </div>
                  </div>

                  <button 
                    onClick={runBenchmark}
                    disabled={isRunning}
                    className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      isRunning 
                        ? 'bg-slate-800 text-slate-500' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                    }`}
                  >
                    {isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Start Benchmark
                  </button>
              </GlassCard>
           </div>

           {/* RIGHT: CHART & WINNER */}
           <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* WINNER BANNER */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900 border border-white/10 p-6 flex items-center justify-between">
                 <div className="absolute inset-0 bg-indigo-500/5"></div>
                 <div className="relative z-10">
                    <p className="text-slate-400 text-sm mb-1 font-medium">
                        {activeTab === 'speed' ? 'Fastest' : activeTab === 'cost' ? 'Cheapest' : 'Best'} Provider ({network})
                    </p>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                       {winner.name}
                       {winner.latency > 0 && <span className="text-lg font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                           {activeTab === 'speed' ? `${winner.latency}ms` : activeTab === 'cost' ? `$${winner.cost}` : `${winner.uptime}%`}
                       </span>}
                    </h2>
                 </div>
                 <div className="relative z-10 hidden sm:block">
                     <Signal className="w-12 h-12 text-slate-800" />
                 </div>
              </div>

              {/* MAIN CHART */}
              <GlassCard className="flex-1 min-h-[400px]">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {[
                          { id: 'speed', label: 'Latency', icon: Zap },
                          { id: 'cost', label: 'Cost ($)', icon: DollarSign },
                          { id: 'scale', label: 'Coverage', icon: Globe },
                          { id: 'reliability', label: 'Reliability', icon: CheckCircle2 },
                        ].map((tab) => (
                          <Tooltip key={tab.id} content={<MetricExplanation type={tab.id} />}>
                              <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                                  activeTab === tab.id 
                                    ? 'bg-white/10 border-white/20 text-white' 
                                    : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                              </button>
                          </Tooltip>
                        ))}
                    </div>
                 </div>
                 <BenchmarkChart data={filteredData} activeMetric={activeTab} />
              </GlassCard>
           </div>
        </div>

        {/* DETAILED DATA TABLE */}
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4 px-2">
               <Layers className="w-4 h-4 text-slate-400" />
               <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Telemetry Matrix</h3>
            </div>
            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4">Provider</th>
                        <th className="px-6 py-4">Latency</th>
                        <th className="px-6 py-4">Stability Trend</th>
                        <th className="px-6 py-4">
                            <div className="flex items-center gap-1">
                                Block Lag
                                <Tooltip content={<div className="p-2 text-xs">Difference between provider's block height and the highest reported block.</div>}>
                                    <Info className="w-3 h-3 cursor-help text-slate-600" />
                                </Tooltip>
                            </div>
                        </th>
                        <th className="px-6 py-4">Cost / 1M</th>
                        <th className="px-6 py-4 text-right">Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredData.map((provider) => (
                        <tr key={provider.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}></div>
                            {provider.name}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-mono">
                            {provider.latency > 0 ? (
                                <span className={provider.latency < 100 ? 'text-emerald-400' : 'text-slate-200'}>{provider.latency} ms</span>
                            ) : (
                                <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                              <Sparkline data={provider.history} color={provider.color} />
                          </td>
                          <td className="px-6 py-4">
                             {provider.lag === 0 ? <Badge color="emerald">Synced</Badge> 
                              : provider.lag === 'N/A' ? <span className="text-xs text-slate-600">N/A</span>
                              : typeof provider.lag === 'string' ? <Badge color="red">{provider.lag}</Badge>
                              : <Badge color="amber">-{provider.lag} Blocks</Badge>
                             }
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                             ${provider.cost}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end items-center gap-2">
                                <Activity className={`w-4 h-4 ${provider.uptime === 100 ? 'text-emerald-500' : 'text-red-500'}`} />
                                <span className="text-xs font-mono text-slate-400">{provider.uptime}%</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </GlassCard>
        </div>
      </main>
    </div>
  );
}