import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Activity, Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Cpu, Info, AlertTriangle } from 'lucide-react';
import { useBenchmark } from './hooks/useBenchmark';

const INITIAL_DATA = [
  { name: 'Alchemy', latency: 0, uptime: 99.99, coverage: 8, consistency: 99.9, color: '#3b82f6' },
  { name: 'Covalent', latency: 0, uptime: 99.95, coverage: 100, consistency: 98.5, color: '#f59e0b' },
  { name: 'Mobula', latency: 0, uptime: 99.50, coverage: 45, consistency: 99.2, color: '#8b5cf6' },
  { name: 'Codex', latency: 0, uptime: 99.90, coverage: 30, consistency: 99.8, color: '#10b981' }
];

// --- TOOLTIP COMPONENT ---
const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center">
    {children}
    <div className="absolute bottom-full mb-3 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-56 text-center shadow-xl z-50 transform translate-y-2 group-hover:translate-y-0">
      {content}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
    </div>
  </div>
);

// --- REUSABLE COMPONENTS ---
const GlassCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-2xl ${className}`}>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  );
};

const BenchmarkChart = ({ data, activeMetric }) => {
  const getMetricKey = () => {
    switch(activeMetric) {
      case 'speed': return 'latency';
      case 'reliability': return 'uptime';
      default: return 'latency';
    }
  };

  return (
    <div className="w-full mt-4 h-[320px] min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" stroke="#f8fafc" width={80} fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
          <RechartsTooltip 
            cursor={{ fill: '#ffffff', opacity: 0.05 }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
          />
          <Bar dataKey={getMetricKey()} radius={[0, 6, 6, 0]} barSize={28} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('speed');
  const [network, setNetwork] = useState('ethereum'); 
  const { benchmarkData, isRunning, runBenchmark } = useBenchmark(INITIAL_DATA, network);

  const getWinner = () => {
    const activeProviders = benchmarkData.filter(p => p.latency > 0 && p.latency !== 999);
    if (activeProviders.length === 0) return { name: 'Waiting...', latency: 0, coverage: 0, uptime: 0 };
    if (activeTab === 'speed') return activeProviders.reduce((prev, curr) => prev.latency < curr.latency ? prev : curr);
    return activeProviders[0];
  };

  const winner = getWinner();

  // --- DEFINITIONS FOR TOOLTIPS ---
  const METRIC_DESCRIPTIONS = {
    speed: "Time to First Byte (TTFB). Measures how fast the provider acknowledges your request. Critical for HFT and real-time apps.",
    scale: "The number of distinct blockchains supported. Important for multi-chain aggregators and wallets.",
    reliability: "Historical uptime percentage over the last 30 days. <99.9% is considered unstable for production."
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* HEADER */}
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">NodeMetric<span className="text-indigo-400">.io</span></span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center p-1 bg-white/5 rounded-lg border border-white/5">
              {['ethereum', 'polygon', 'arbitrum'].map((net) => (
                <button
                  key={net}
                  onClick={() => setNetwork(net)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                    network === net 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>

            <button 
              onClick={runBenchmark}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isRunning 
                  ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                  : 'bg-white text-slate-900 hover:bg-slate-200 shadow-lg shadow-white/10'
              }`}
            >
              {isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline">Run Benchmark</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* HERO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
             <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 mb-3">
              Infrastructure Intelligence
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Live telemetry for Web3 data providers on <span className="text-indigo-400 font-semibold capitalize">{network}</span>.
            </p>
          </div>
          
          {/* WINNER CARD */}
          <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl">
             <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Fastest Provider</span>
                <span className="text-2xl font-bold text-white">{winner.name}</span>
             </div>
             <div className="h-10 w-px bg-indigo-500/30 mx-2"></div>
             <div className="text-right">
                <div className="text-xs text-indigo-300">Latency</div>
                <div className="text-xl font-mono font-bold text-white">{winner.latency}ms</div>
             </div>
          </div>
        </div>

        {/* TABS WITH TOOLTIPS */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
           {[
              { id: 'speed', label: 'Latency & Speed', icon: Zap },
              { id: 'scale', label: 'Chain Support', icon: Globe },
              { id: 'reliability', label: 'Uptime (SLA)', icon: CheckCircle2 },
            ].map((tab) => (
              <Tooltip key={tab.id} content={METRIC_DESCRIPTIONS[tab.id]}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border ${
                    activeTab === tab.id 
                      ? 'bg-white/10 border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <Info className="w-3 h-3 opacity-40 ml-1" />
                </button>
              </Tooltip>
            ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <GlassCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Layers className="w-5 h-5 text-indigo-400" />
                 Performance Metrics
               </h3>
               <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                 <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400'}`}></div>
                 {isRunning ? 'Updating...' : 'Live'}
               </div>
            </div>
            <BenchmarkChart data={benchmarkData} activeMetric={activeTab} />
          </GlassCard>

          <div className="space-y-6">
            {benchmarkData.map((p) => (
              <GlassCard key={p.name} className="p-4 flex items-center justify-between group hover:border-white/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-xl font-bold text-slate-300">
                    {p.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{p.name}</h4>
                    <span className="text-xs text-slate-500">{p.lag === 0 ? 'Synced' : 'Lag detected'}</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-lg font-mono font-bold text-white group-hover:text-indigo-400 transition-colors">
                     {p.latency === 0 ? '-' : p.latency}<span className="text-xs text-slate-500 ml-1">ms</span>
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* DETAILED TABLE */}
        <GlassCard className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
               <Cpu className="w-5 h-5 text-slate-400" />
               <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Technical Deep Dive</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Latency</th>
                    <th className="px-6 py-4">
                        <div className="flex items-center gap-1">
                            Block Status
                            <Tooltip content="Difference between the provider's latest block and the network chain tip.">
                                <Info className="w-3 h-3 cursor-help text-slate-600" />
                            </Tooltip>
                        </div>
                    </th>
                    <th className="px-6 py-4 text-right">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {benchmarkData.map((provider) => (
                    <tr key={provider.name} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shadow-[0_0_10px]" style={{ backgroundColor: provider.color, boxShadow: `0 0 12px ${provider.color}` }}></div>
                        {provider.name}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {provider.latency > 0 && provider.latency !== 999 ? `${provider.latency} ms` : <span className="text-slate-600">-</span>}
                      </td>
                      <td className="px-6 py-4">
                         {provider.lag === 0 ? <Badge color="emerald">Synced</Badge> 
                          : provider.lag === 'N/A' ? <span className="text-xs text-slate-600">N/A</span>
                          : typeof provider.lag === 'string' ? <Badge color="red">{provider.lag}</Badge>
                          : <Badge color="amber">-{provider.lag} Blocks</Badge>
                         }
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end">
                            {provider.latency > 0 && provider.latency < 999 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500/50" />}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </GlassCard>

      </main>
    </div>
  );
}