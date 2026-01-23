import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Info, 
  Settings2, Signal, Hexagon, DollarSign, Filter, Activity, Server, ArrowUpDown, Search
} from 'lucide-react';
import { useBenchmark } from './hooks/useBenchmark';

// --- INITIAL DATA ---
const INITIAL_DATA = [
  { name: 'Alchemy', latency: 0, uptime: 100, baseCost: 15, coverage: 8, color: '#3b82f6', history: [0,0] },
  { name: 'Infura', latency: 0, uptime: 100, baseCost: 20, coverage: 12, color: '#ff5e57', history: [0,0] },
  { name: 'QuickNode', latency: 0, uptime: 100, baseCost: 25, coverage: 35, color: '#34e7e4', history: [0,0] },
  { name: 'Covalent', latency: 0, uptime: 100, baseCost: 12, coverage: 100, color: '#f59e0b', history: [0,0] },
  { name: 'Mobula', latency: 0, uptime: 100, baseCost: 10, coverage: 45, color: '#8b5cf6', history: [0,0] },
  { name: 'Codex', latency: 0, uptime: 100, baseCost: 5, coverage: 30, color: '#10b981', history: [0,0] }
];

// --- METRIC DEFINITIONS ---
const METRIC_DEFINITIONS = {
  score: {
    title: "CovalScore™",
    calc: "Proprietary composite index (0-100) weighting Latency (40%), Uptime (40%), and Block Lag (20%).",
    meaning: "Higher is better. The single best metric for overall quality."
  },
  speed: {
    title: "Latency (Speed)",
    calc: "Time to First Byte (TTFB). Measures the round-trip time for the selected request type.",
    meaning: "Lower is better. High latency causes laggy dApp interfaces."
  },
  cost: {
    title: "Est. Monthly Cost",
    calc: "Projected monthly bill based on your selected volume (slider) and enterprise rate cards.",
    meaning: "Lower is better. Optimization is key for scale."
  },
  reliability: {
    title: "Session Reliability",
    calc: "Percentage of successful pings during this active session.",
    meaning: "Higher is better. <99% indicates critical instability."
  }
};

// --- COMPONENTS ---

// 1. Solid Opaque Tooltip Wrapper
const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center z-[100]">
    {children}
    {/* CHANGED: Removed /90 opacity and backdrop-blur. Now solid slate-900. */}
    <div className="absolute bottom-full mb-3 px-4 py-3 bg-slate-900 border border-slate-700 text-left rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-64 shadow-2xl transform translate-y-2 group-hover:translate-y-0 z-[110]">
      {content}
      {/* Arrow: Matched to solid slate-900 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
    </div>
  </div>
);

// 2. Metric Explanation Card
const MetricExplanation = ({ type }) => {
  const def = METRIC_DEFINITIONS[type];
  if (!def) return null;
  return (
    <div>
      <div className="text-sm font-bold text-white mb-1 flex items-center gap-2">
        {def.title}
      </div>
      <p className="text-xs text-slate-300 mb-2 leading-relaxed opacity-90">{def.calc}</p>
      <div className="text-[10px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 inline-block">
        {def.meaning}
      </div>
    </div>
  );
};

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
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function App() {
  const [activeTab, setActiveTab] = useState('score');
  const [network, setNetwork] = useState('ethereum'); 
  const [precision, setPrecision] = useState('standard');
  const [requestType, setRequestType] = useState('light'); 
  const [requestVolume, setRequestVolume] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleProviders, setVisibleProviders] = useState(INITIAL_DATA.map(d => d.name));

  const { benchmarkData, isRunning, runBenchmark } = useBenchmark(INITIAL_DATA, network, precision, requestType);

  const processedData = useMemo(() => {
    return benchmarkData.map(p => {
      const calculatedCost = Math.round(p.baseCost * requestVolume);
      const latencyScore = Math.max(0, 100 - (p.latency > 0 ? p.latency / 4 : 100));
      const uptimeScore = p.uptime;
      const lagVal = typeof p.lag === 'number' ? p.lag : 0;
      const lagScore = Math.max(0, 100 - (lagVal * 10));
      const score = Math.round((latencyScore * 0.4) + (uptimeScore * 0.4) + (lagScore * 0.2));
      return { ...p, calculatedCost, score };
    });
  }, [benchmarkData, requestVolume]);

  const sortedAndFilteredData = useMemo(() => {
    let data = processedData.filter(d => 
      visibleProviders.includes(d.name) && 
      d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [processedData, sortConfig, searchQuery, visibleProviders]);

  const getWinner = () => {
    const active = sortedAndFilteredData.filter(p => p.latency > 0 && p.latency !== 999);
    if (active.length === 0) return { name: 'Ready', score: 0 };
    return active.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
  };

  const winner = getWinner();

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const toggleProvider = (name) => {
    setVisibleProviders(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
               <Hexagon className="w-8 h-8 text-indigo-500 fill-indigo-500/10" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">Covalboard</h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold">Enterprise Edition</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2">
                 <Search className="w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search Providers..." 
                    className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none w-32 placeholder:text-slate-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium text-slate-500 border border-white/5 px-3 py-1.5 rounded-full bg-white/[0.02]`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                  {isRunning ? 'Benchmarking...' : 'System Operational'}
              </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           
           <div className="lg:col-span-3 space-y-4">
              <GlassCard className="p-5 space-y-6 border-t-4 border-t-indigo-500/50">
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

                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2">
                       <Server className="w-3 h-3" /> Workload Type
                    </label>
                    <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                        <button onClick={() => setRequestType('light')} className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${requestType === 'light' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}>
                           Light (Ping)
                        </button>
                        <button onClick={() => setRequestType('heavy')} className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${requestType === 'heavy' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500'}`}>
                           Heavy (Txns)
                        </button>
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2">
                       <DollarSign className="w-3 h-3" /> Volume: <span className="text-white">{requestVolume}M</span> /mo
                    </label>
                    <input 
                      type="range" 
                      min="1" max="100" step="1" 
                      value={requestVolume} 
                      onChange={(e) => setRequestVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                        <span>1M</span>
                        <span>50M</span>
                        <span>100M</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>

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
                    {isRunning ? 'Testing...' : 'Run Analysis'}
                  </button>
              </GlassCard>
           </div>

           <div className="lg:col-span-9 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-5 md:col-span-2 flex items-center justify-between">
                     <div className="absolute inset-0 bg-indigo-500/5"></div>
                     <div className="relative z-10">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Highest Rated Provider</p>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                           {winner.name}
                           {winner.score > 0 && <span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                               Score: {winner.score}/100
                           </span>}
                        </h2>
                        <div className="mt-2 text-xs text-slate-500 flex gap-4">
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {winner.latency}ms</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${winner.calculatedCost}/mo</span>
                        </div>
                     </div>
                     <div className="relative z-10">
                         <Signal className="w-10 h-10 text-indigo-500/20" />
                     </div>
                  </div>

                  <GlassCard className="p-5 flex flex-col justify-center">
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Monthly Estimate</p>
                      <div className="text-2xl font-bold text-white">${(winner.calculatedCost || 0).toLocaleString()}</div>
                      <p className="text-[10px] text-slate-500 mt-1">Based on {requestVolume}M requests</p>
                  </GlassCard>
              </div>

              <GlassCard className="flex-1 min-h-[400px]">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {[
                          { id: 'score', label: 'CovalScore', icon: Activity },
                          { id: 'speed', label: 'Latency', icon: Zap },
                          { id: 'cost', label: 'Est. Cost', icon: DollarSign },
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
                 
                 <div className="w-full mt-4 h-[350px] min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedAndFilteredData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        {sortedAndFilteredData.map((entry, index) => (
                            <linearGradient key={index} id={`grad${index}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={entry.color} stopOpacity={0.4}/>
                              <stop offset="100%" stopColor={entry.color} stopOpacity={0.9}/>
                            </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'auto']} hide />
                      <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={90} fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: '#ffffff', opacity: 0.03 }} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }} />
                      <Bar 
                        dataKey={activeTab === 'score' ? 'score' : activeTab === 'speed' ? 'latency' : activeTab === 'cost' ? 'calculatedCost' : 'uptime'} 
                        radius={[0, 6, 6, 0]} barSize={36} animationDuration={800}
                      >
                        {sortedAndFilteredData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#grad${index})`} stroke={entry.color} strokeWidth={1} strokeOpacity={0.5} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
           </div>
        </div>

        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-2">
                   <Layers className="w-4 h-4 text-slate-400" />
                   <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Performance Matrix</h3>
               </div>
               
               <div className="flex gap-2">
                  {INITIAL_DATA.map(p => (
                      <button 
                        key={p.name} 
                        onClick={() => toggleProvider(p.name)}
                        className={`w-2 h-2 rounded-full transition-all ${visibleProviders.includes(p.name) ? 'opacity-100 scale-110' : 'opacity-30'}`}
                        style={{ backgroundColor: p.color }}
                        title={p.name}
                      />
                  ))}
               </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Provider <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('score')}>CovalScore <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>Latency <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                        <th className="px-6 py-4">Stability (Last 15)</th>
                        <th className="px-6 py-4">Lag</th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('calculatedCost')}>Est. Cost <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                        <th className="px-6 py-4 text-right">Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedAndFilteredData.map((provider) => (
                        <tr key={provider.name} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}></div>
                            {provider.name}
                          </td>
                          <td className="px-6 py-4">
                             {provider.score > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${provider.score}%` }}></div>
                                    </div>
                                    <span className="text-white font-bold text-xs">{provider.score}</span>
                                </div>
                             ) : <span className="text-slate-600">-</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-mono">
                            {provider.latency > 0 ? (
                                <span className={provider.latency < 100 ? 'text-emerald-400' : 'text-slate-200'}>{provider.latency} ms</span>
                            ) : <span className="text-slate-600">-</span>}
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
                             ${provider.calculatedCost.toLocaleString()} <span className="opacity-50">/mo</span>
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