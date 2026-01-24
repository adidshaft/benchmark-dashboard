import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Info, 
  Settings2, Signal, Hexagon, DollarSign, Filter, Activity, Server, ArrowUpDown, Search, 
  ShieldCheck, Database, FileCode, Gauge, BookOpen, X, Eye, ChevronDown, CheckSquare, Square, Terminal, Maximize2, HelpCircle, ShieldAlert
} from 'lucide-react';
import { useBenchmark } from './hooks/useBenchmark';

// --- INITIAL DATA ---
const INITIAL_DATA = [
  { 
    name: 'Alchemy', 
    latency: 0, p99: 0, uptime: 100, baseCost: 15, coverage: 8, color: '#3b82f6', history: [0,0],
    freeTier: '300M CUs', archive: false, trace: true, certs: ['SOC2', 'GDPR'], securityScore: 100, securityIssues: []
  },
  { 
    name: 'Infura', 
    latency: 0, p99: 0, uptime: 100, baseCost: 20, coverage: 12, color: '#ff5e57', history: [0,0],
    freeTier: '100k/day', archive: false, trace: true, certs: ['SOC2', 'HIPAA'], securityScore: 100, securityIssues: []
  },
  { 
    name: 'QuickNode', 
    latency: 0, p99: 0, uptime: 100, baseCost: 25, coverage: 35, color: '#34e7e4', history: [0,0],
    freeTier: '10M Credits', archive: false, trace: true, certs: ['SOC2'], securityScore: 100, securityIssues: []
  },
  { 
    name: 'Covalent', 
    latency: 0, p99: 0, uptime: 100, baseCost: 12, coverage: 225, color: '#f59e0b', history: [0,0],
    freeTier: 'Premium Trial', archive: true, trace: false, certs: ['SOC2'], securityScore: 100, securityIssues: []
  },
  { 
    name: 'Mobula', 
    latency: 0, p99: 0, uptime: 100, baseCost: 10, coverage: 45, color: '#8b5cf6', history: [0,0],
    freeTier: 'Freemium', archive: false, trace: false, certs: [], securityScore: 100, securityIssues: []
  },
  { 
    name: 'Codex', 
    latency: 0, p99: 0, uptime: 100, baseCost: 5, coverage: 30, color: '#10b981', history: [0,0],
    freeTier: 'Free', archive: false, trace: false, certs: [], securityScore: 100, securityIssues: []
  }
];

const SUPPORTED_CHAINS = [
    { id: 'ethereum', label: 'Ethereum', color: 'bg-indigo-500' },
    { id: 'polygon', label: 'Polygon', color: 'bg-purple-500' },
    { id: 'arbitrum', label: 'Arbitrum', color: 'bg-blue-400' },
    { id: 'optimism', label: 'Optimism', color: 'bg-red-500' },
    { id: 'base', label: 'Base', color: 'bg-blue-600' },
    { id: 'bsc', label: 'BSC', color: 'bg-amber-400' },
    { id: 'avalanche', label: 'Avalanche', color: 'bg-red-600' },
];

const DEFINITIONS_DATA = [
  { param: "P50 Latency (Global)", unit: "ms", source: "eth_blockNumber response median time.", relevance: "Critical for general UX responsiveness; determines how 'snappy' a dApp feels." },
  { param: "P99 Latency (Stress)", unit: "ms", source: "Response time during 10k RPS burst load.", relevance: "Vital for high-traffic dApps; indicates choking points." },
  { param: "Chain Support Count", unit: "Integer", source: "Count of Mainnet/Testnet networks listed in documentation.", relevance: "Filters providers for multi-chain projects vs. single-chain specialists." },
  { param: "Archive Access", unit: "Boolean / Badge", source: "Does the free/base tier support eth_getBalance for blocks >128 ago?", relevance: "Essential for tax tools, wallets, and analytics platforms." },
  { param: "Free Tier Cap", unit: "Requests/Mo", source: "Normalized standard eth_call equivalent.", relevance: "The 'hook' for startups; determines how long they can build for free." },
  { param: "Paid Entry Price", unit: "USD/Mo", source: "Cost of the cheapest paid plan.", relevance: "Important for projects graduating from the hackathon phase." },
  { param: "Historical Uptime", unit: "%", source: "Session success rate (Real-time approximation).", relevance: "The baseline requirement for any production-grade application." },
  { param: "Security Certs", unit: "Badges", source: "SOC 2 Type II, ISO 27001, HIPAA, GDPR.", relevance: "Mandatory filter for enterprise/institutional clients." },
  { param: "Trace/Debug API", unit: "Boolean", source: "Support for trace_transaction or debug_traceTransaction.", relevance: "Critical for developers debugging smart contracts; often a paid add-on." },
  { param: "Data Consistency", unit: "Boolean", source: "Automatic re-org handling.", relevance: "Prevents UI bugs where a user's balance flickers between blocks." },
];

const TRANSPARENCY_DATA = [
    { metric: "Latency & Lag", type: "Real-Time", reason: "Measured live from your session." },
    { metric: "Security/Header Leaks", type: "Real-Time", reason: "We analyze response headers for 'Server' or 'X-Powered-By' leakage." },
    { metric: "Chain Coverage", type: "Static", reason: "Hardcoded from documentation." },
];

const METRIC_DEFINITIONS = {
  score: { title: "CovalScore™", calc: "Composite: Latency(40) + Uptime(40) + Lag(20).", meaning: "Best overall metric." },
  speed: { title: "P50 Latency", calc: "Median response time.", meaning: "Lower is better." },
  p99: { title: "P99 Stress", calc: "Peak response time.", meaning: "Lower is better." },
  cost: { title: "Est. Cost", calc: "Volume based projection.", meaning: "Lower is better." },
  reliability: { title: "Session Uptime", calc: "% of successful pings.", meaning: "Higher is better." }
};

const DefinitionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#020617] border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><BookOpen className="w-6 h-6 text-indigo-400" /></div>
              <div><h2 className="text-xl font-bold text-white">Benchmark Methodology</h2><p className="text-xs text-slate-400 mt-0.5">Transparent Breakdown of Metrics & Data Sources</p></div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="overflow-y-auto p-8 space-y-10">
           <div><h3 className="text-sm uppercase tracking-wider text-emerald-400 font-bold mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Data Source Transparency</h3>
               <div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg"><table className="w-full text-left border-collapse"><thead className="bg-slate-900"><tr className="text-xs uppercase text-slate-400"><th className="px-6 py-4 font-semibold">Metric</th><th className="px-6 py-4 font-semibold">Data Type</th><th className="px-6 py-4 font-semibold">Reason / Source</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{TRANSPARENCY_DATA.map((r,i)=><tr key={i} className="hover:bg-slate-900/50 transition-colors"><td className="px-6 py-4 text-slate-200 text-sm font-medium">{r.metric}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${r.type === "Real-Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>{r.type}</span></td><td className="px-6 py-4 text-slate-400 text-sm">{r.reason}</td></tr>)}</tbody></table></div>
           </div>
           <div><h3 className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Recommended Parameters</h3>
               <div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg"><table className="w-full text-left border-collapse"><thead className="bg-slate-900"><tr className="text-xs uppercase text-slate-400"><th className="px-6 py-4 font-semibold">Parameter</th><th className="px-6 py-4 font-semibold">Unit</th><th className="px-6 py-4 font-semibold">Methodology</th><th className="px-6 py-4 font-semibold">Relevance</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{DEFINITIONS_DATA.map((r,i)=><tr key={i} className="hover:bg-slate-900/50 transition-colors"><td className="px-6 py-4 text-indigo-300 font-bold text-sm whitespace-nowrap">{r.param}</td><td className="px-6 py-4 text-slate-400 text-xs font-mono">{r.unit}</td><td className="px-6 py-4 text-slate-300 text-sm leading-relaxed">{r.source}</td><td className="px-6 py-4 text-slate-400 text-sm leading-relaxed italic border-l border-slate-800/50 bg-slate-900/30">{r.relevance}</td></tr>)}</tbody></table></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center z-[50]">
    {children}
    <div className="absolute top-full mt-3 px-4 py-3 bg-[#020617] border border-slate-700 text-left rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-64 shadow-2xl transform translate-y-2 group-hover:translate-y-0 z-[9999]">
      {content}<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-slate-700"></div><div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#020617]"></div>
    </div>
  </div>
);

const MetricExplanation = ({ type }) => {
  const def = METRIC_DEFINITIONS[type];
  if (!def) return null;
  return <div><div className="text-sm font-bold text-white mb-1">{def.title}</div><p className="text-xs text-slate-300 mb-2 opacity-90 leading-relaxed">{def.calc}</p><div className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 inline-block">{def.meaning}</div></div>;
};

const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>;
  const height = 32; const width = 100;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const max = Math.max(...data, 1); const min = Math.min(...data.filter(d => d > 0));
    const normalizedY = val === 0 ? height : height - ((val - min) / ((max - min) || 1)) * (height - 5); 
    return `${x},${normalizedY}`;
  }).join(' ');
  return <div className="h-8 w-24 opacity-80"><svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
};

const GlassCard = ({ children, className = "" }) => <div className={`backdrop-blur-md bg-[#0f172a]/40 border border-white/5 rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>;
const Badge = ({ children, color = "indigo" }) => <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border bg-${color}-500/10 text-${color}-400 border-${color}-500/20`}>{children}</span>;

export default function App() {
  const [activeTab, setActiveTab] = useState('score');
  const [network, setNetwork] = useState('ethereum'); 
  const [precision, setPrecision] = useState('standard');
  const [requestType, setRequestType] = useState('light'); 
  const [requestVolume, setRequestVolume] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleProviders, setVisibleProviders] = useState(INITIAL_DATA.map(d => d.name));
  const [tableFilters, setTableFilters] = useState({ archive: false, trace: false, certs: false });
  const [isDefinitionsOpen, setDefinitionsOpen] = useState(false);
  const [isLogExpanded, setLogExpanded] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  const { benchmarkData, isRunning, runBenchmark, logs } = useBenchmark(INITIAL_DATA, network, precision, requestType);

  const processedData = useMemo(() => {
    return benchmarkData.map(p => {
      const calculatedCost = Math.round(p.baseCost * requestVolume);
      const latencyScore = Math.max(0, 100 - (p.latency > 0 ? p.latency / 4 : 100));
      const p99Score = Math.max(0, 100 - (p.p99 > 0 ? p.p99 / 4 : 100));
      const uptimeScore = p.uptime;
      const lagVal = typeof p.lag === 'number' ? p.lag : 0;
      const lagScore = Math.max(0, 100 - (lagVal * 10));
      const score = Math.round((latencyScore * 0.4) + (uptimeScore * 0.3) + (lagScore * 0.15) + (p99Score * 0.15));
      return { ...p, calculatedCost, score };
    });
  }, [benchmarkData, requestVolume]);

  const sortedAndFilteredData = useMemo(() => {
    let data = processedData.filter(d => visibleProviders.includes(d.name) && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (tableFilters.archive) data = data.filter(d => d.archive);
    if (tableFilters.trace) data = data.filter(d => d.trace);
    if (tableFilters.certs) data = data.filter(d => d.certs.length > 0);
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [processedData, sortConfig, searchQuery, visibleProviders, tableFilters]);

  const getWinner = () => {
    const active = sortedAndFilteredData.filter(p => p.latency > 0 && p.latency !== 999);
    if (active.length === 0) return { name: 'Ready', score: 0 };
    return active.reduce((prev, curr) => prev.score > curr.score ? prev : curr);
  };

  const winner = getWinner();
  const handleSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc' });
  const toggleProvider = (name) => setVisibleProviders(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  const toggleTableFilter = (key) => setTableFilters(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <DefinitionsModal isOpen={isDefinitionsOpen} onClose={() => setDefinitionsOpen(false)} />

      {/* INSPECTOR MODAL */}
      {inspectorData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: inspectorData.color }}></div>
                  <h2 className="text-lg font-bold text-white">{inspectorData.name} <span className="text-slate-500 font-normal text-sm">Inspector</span></h2>
               </div>
               <button onClick={() => setInspectorData(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-auto font-mono text-xs">
               <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                       <div className="text-slate-500 uppercase tracking-wider font-bold mb-1">Latency</div>
                       <div className="text-2xl text-white">{inspectorData.latency}ms</div>
                   </div>
                   <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                       <div className="text-slate-500 uppercase tracking-wider font-bold mb-1">Security Score</div>
                       <div className={`text-2xl ${inspectorData.securityScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{inspectorData.securityScore}/100</div>
                   </div>
               </div>
               <div className="space-y-4">
                   {inspectorData.securityIssues.length > 0 && (
                       <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                           <div className="text-red-400 font-bold mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Security Warnings</div>
                           <ul className="list-disc list-inside text-red-300/80 space-y-1">{inspectorData.securityIssues.map((issue, i) => <li key={i}>{issue}</li>)}</ul>
                       </div>
                   )}
                   <div>
                       <div className="text-indigo-400 font-bold mb-2 uppercase tracking-wider">Raw Response (Last Ping)</div>
                       <div className="bg-black/50 p-4 rounded-lg border border-slate-800 text-slate-400 whitespace-pre-wrap break-all">{inspectorData.lastResponse ? JSON.stringify(inspectorData.lastResponse, null, 2) : "// Run benchmark to see raw data"}</div>
                   </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {isLogExpanded && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <div className="bg-slate-950 border border-slate-700 w-full max-w-5xl h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-wider"><Terminal className="w-4 h-4" /> Live Execution Log</div>
                    <button onClick={() => setLogExpanded(false)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-300 space-y-2">{logs.map((log, i) => <div key={i} className="border-b border-white/5 pb-1 border-dashed">{log}</div>)}</div>
            </div>
        </div>
      )}

      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative"><div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div><Hexagon className="w-8 h-8 text-indigo-500 fill-indigo-500/10" strokeWidth={1.5} /></div>
            <div><h1 className="font-bold text-xl tracking-tight text-white leading-none">Covalboard</h1><span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold">Enterprise Edition</span></div>
          </div>
          <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2"><Search className="w-4 h-4 text-slate-500" /><input type="text" placeholder="Search Providers..." className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none w-32 placeholder:text-slate-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <Tooltip content={<div className="p-2 text-xs">View Methodology & Data Sources</div>}><button onClick={() => setDefinitionsOpen(true)} className="flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-full"><BookOpen className="w-4 h-4" />Docs</button></Tooltip>
              <div className={`flex items-center gap-2 text-xs font-medium text-slate-500 border border-white/5 px-3 py-1.5 rounded-full bg-white/[0.02]`}><div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>{isRunning ? 'Benchmarking...' : 'System Operational'}</div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           
           {/* CONFIG PANEL */}
           <div className="lg:col-span-3 space-y-4">
              <GlassCard className="p-5 space-y-6 border-t-4 border-t-indigo-500/50">
                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Globe className="w-3 h-3" /> Target Network</label>
                    <div className="grid grid-cols-1 gap-1">
                      {SUPPORTED_CHAINS.map((net) => (
                        <button key={net.id} onClick={() => setNetwork(net.id)} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${network === net.id ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                          <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${net.color}`}></div><span className="capitalize">{net.label}</span></div>{network === net.id && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-white/5"></div>

                  <div>
                    <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Filter className="w-3 h-3" /> Select Providers</label>
                    <div className="space-y-1">
                      {INITIAL_DATA.map((p) => (
                          <button key={p.name} onClick={() => toggleProvider(p.name)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all border ${visibleProviders.includes(p.name) ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'}`}>
                             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>{p.name}</div>
                             {visibleProviders.includes(p.name) ? <CheckSquare className="w-3 h-3 text-indigo-400" /> : <Square className="w-3 h-3 text-slate-600" />}
                          </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5"></div>
                  <button onClick={runBenchmark} disabled={isRunning} className={`w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'}`}>{isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}{isRunning ? 'Running Analysis...' : 'Start Benchmark'}</button>
                  <div className="bg-black/50 rounded-lg p-3 font-mono text-[10px] text-slate-400 h-32 flex flex-col border border-slate-800 shadow-inner">
                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800"><div className="flex items-center gap-2 text-indigo-400"><Terminal className="w-3 h-3" /> Logs</div><button onClick={() => setLogExpanded(true)} className="hover:text-white transition-colors"><Maximize2 className="w-3 h-3" /></button></div>
                      <div className="overflow-y-auto flex-1 space-y-1">{logs.length === 0 && <span className="opacity-50">Ready...</span>}{logs.map((log, i) => <div key={i}>{log}</div>)}</div>
                  </div>
              </GlassCard>
           </div>

           {/* MAIN DISPLAY */}
           <div className="lg:col-span-9 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative rounded-2xl border border-white/10 p-5 md:col-span-2 flex items-center justify-between overflow-visible">
                     <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl -z-10 overflow-hidden"><div className="absolute inset-0 bg-indigo-500/5"></div></div>
                     <div className="relative z-10 w-full"><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Highest Rated Provider</p><h2 className="text-3xl font-bold text-white flex items-center gap-3">{winner.name}{winner.score > 0 && <Tooltip content={<div className="p-2 space-y-1"><div className="text-xs font-bold text-white border-b border-slate-700 pb-1 mb-1">Score Calculation</div><div className="flex justify-between text-[10px] text-slate-300"><span>Latency (P50)</span><span>40%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Uptime</span><span>30%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Stability (P99)</span><span>15%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Block Lag</span><span>15%</span></div></div>}><span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 cursor-help flex items-center gap-1 hover:bg-indigo-500/20 transition-colors">Score: {winner.score} <HelpCircle className="w-3 h-3 opacity-50" /></span></Tooltip>}</h2></div><Signal className="w-10 h-10 text-indigo-500/20 relative z-10" />
                  </div>
                  <GlassCard className="p-5 flex flex-col justify-center"><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Monthly Estimate</p><div className="text-2xl font-bold text-white">${(winner.calculatedCost || 0).toLocaleString()}</div><p className="text-[10px] text-slate-500 mt-1">Based on {requestVolume}M requests</p></GlassCard>
              </div>

              <GlassCard className="flex-1 min-h-[400px]">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {[{ id: 'score', label: 'CovalScore', icon: Activity }, { id: 'speed', label: 'P50 Latency', icon: Zap }, { id: 'p99', label: 'P99 Stress', icon: Gauge }, { id: 'cost', label: 'Est. Cost', icon: DollarSign }].map((tab) => (
                          <Tooltip key={tab.id} content={<MetricExplanation type={tab.id} />}><button onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${activeTab === tab.id ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}><tab.icon className="w-3 h-3" />{tab.label}</button></Tooltip>
                        ))}
                    </div>
                 </div>
                 <div className="w-full mt-4 h-[350px] min-h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedAndFilteredData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                      <defs>{sortedAndFilteredData.map((entry, index) => (<linearGradient key={index} id={`grad${index}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={entry.color} stopOpacity={0.4}/><stop offset="100%" stopColor={entry.color} stopOpacity={0.9}/></linearGradient>))}</defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                      <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 'auto']} hide />
                      <YAxis dataKey="name" type="category" stroke="#e2e8f0" width={90} fontSize={13} fontWeight={600} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{ fill: '#ffffff', opacity: 0.03 }} contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }} />
                      <Bar dataKey={activeTab === 'score' ? 'score' : activeTab === 'speed' ? 'latency' : activeTab === 'p99' ? 'p99' : 'calculatedCost'} radius={[0, 6, 6, 0]} barSize={36} animationDuration={800}>{sortedAndFilteredData.map((entry, index) => (<Cell key={`cell-${index}`} fill={`url(#grad${index})`} stroke={entry.color} strokeWidth={1} strokeOpacity={0.5} />))}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
           </div>
        </div>

        {/* ENTERPRISE METRICS TABLE */}
        <div className="mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-2 gap-4">
               <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Enterprise Matrix</h3></div>
               <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filters:</span>
                   <button onClick={() => toggleTableFilter('archive')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tableFilters.archive ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}><Database className="w-3 h-3" /> Archive</button>
                   <button onClick={() => toggleTableFilter('trace')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tableFilters.trace ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}><FileCode className="w-3 h-3" /> Trace</button>
                   <button onClick={() => toggleTableFilter('certs')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${tableFilters.certs ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'border-slate-800 text-slate-500 hover:text-slate-300'}`}><ShieldCheck className="w-3 h-3" /> Certified</button>
               </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                          <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Provider <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                          <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>P50 <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                          <th className="px-6 py-4">Stability (Trend)</th>
                          <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('gas')}>Gas (Gwei) <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                          <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('lag')}>Lag <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                          <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('coverage')}>Chains <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                          <th className="px-6 py-4">Capabilities</th>
                          <th className="px-6 py-4">Security</th>
                          <th className="px-6 py-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('freeTier')}>Free Tier <ArrowUpDown className="w-3 h-3 inline ml-1" /></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedAndFilteredData.map((provider) => (
                        <tr key={provider.name} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setInspectorData(provider)}>
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}></div>{provider.name}</td>
                          <td className="px-6 py-4 text-slate-300 font-mono">{provider.latency > 0 ? <span className={provider.latency < 100 ? 'text-emerald-400' : 'text-slate-200'}>{provider.latency} ms</span> : <span className="text-slate-600">-</span>}</td>
                          <td className="px-6 py-4"><Sparkline data={provider.history} color={provider.color} /></td>
                          <td className="px-6 py-4 text-slate-300 font-mono">{provider.gas > 0 ? provider.gas.toFixed(2) : '-'}</td>
                          <td className="px-6 py-4">{provider.lag === 0 ? <Badge color="emerald">Synced</Badge> : provider.lag === 'N/A' ? <span className="text-xs text-slate-600">N/A</span> : <Badge color="amber">-{provider.lag} Blocks</Badge>}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{provider.coverage} Nets</td>
                          <td className="px-6 py-4"><div className="flex gap-1.5">{provider.archive && <Tooltip content={<div className="p-2 text-xs">Archive Node Support</div>}><Database className="w-4 h-4 text-indigo-400" /></Tooltip>}{provider.trace && <Tooltip content={<div className="p-2 text-xs">Trace/Debug API Support</div>}><FileCode className="w-4 h-4 text-emerald-400" /></Tooltip>}{provider.certs.length > 0 && <Tooltip content={<div className="p-2 text-xs">Certified: {provider.certs.join(', ')}</div>}><ShieldCheck className="w-4 h-4 text-amber-400" /></Tooltip>}</div></td>
                          
                          {/* SECURITY COLUMN */}
                          <td className="px-6 py-4">
                              <Tooltip content={<div className="p-2 text-xs whitespace-nowrap">{provider.securityIssues.length > 0 ? `${provider.securityIssues.length} Issues Found` : "All Checks Passed"}</div>}>
                                  {provider.securityScore === 100 
                                    ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    : <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                                  }
                              </Tooltip>
                          </td>

                          <td className="px-6 py-4 text-right text-xs text-slate-400">{provider.freeTier}</td>
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