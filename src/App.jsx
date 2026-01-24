import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RadarShape
} from 'recharts';
import { 
  Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Info, 
  Settings2, Signal, Hexagon, DollarSign, Filter, Activity, Server, ArrowUpDown, Search, 
  ShieldCheck, Database, FileCode, Gauge, BookOpen, X, Eye, ChevronDown, CheckSquare, Square, Terminal, Maximize2, HelpCircle, ShieldAlert, Target, Download, Box, AlertTriangle, Check
} from 'lucide-react';

import { useBenchmark, NETWORK_CONFIG } from './hooks/useBenchmark';
import { useSmartBenchmark } from './hooks/useSmartBenchmark';

// --- DATA & CONFIG ---
const INITIAL_DATA = [
  { name: 'Alchemy', latency: 0, p99: 0, uptime: 100, baseCost: 15, coverage: 8, color: '#3b82f6', history: [0,0], freeTier: '300M CUs', archive: false, trace: true, certs: ['SOC2', 'GDPR'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Infura', latency: 0, p99: 0, uptime: 100, baseCost: 20, coverage: 12, color: '#ff5e57', history: [0,0], freeTier: '100k/day', archive: false, trace: true, certs: ['SOC2', 'HIPAA'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'QuickNode', latency: 0, p99: 0, uptime: 100, baseCost: 25, coverage: 35, color: '#34e7e4', history: [0,0], freeTier: '10M Credits', archive: false, trace: true, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Covalent', latency: 0, p99: 0, uptime: 100, baseCost: 12, coverage: 225, color: '#f59e0b', history: [0,0], freeTier: 'Premium Trial', archive: true, trace: false, certs: ['SOC2'], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Mobula', latency: 0, p99: 0, uptime: 100, baseCost: 10, coverage: 45, color: '#8b5cf6', history: [0,0], freeTier: 'Freemium', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] },
  { name: 'Codex', latency: 0, p99: 0, uptime: 100, baseCost: 5, coverage: 30, color: '#10b981', history: [0,0], freeTier: 'Free', archive: false, trace: false, certs: [], gas: 0, batchLatency: 0, securityScore: 100, securityIssues: [] }
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

const STRATEGIES = {
    balanced: { label: "Balanced", weights: { speed: 0.3, uptime: 0.3, cost: 0.2, lag: 0.2 } },
    speed: { label: "Performance First", weights: { speed: 0.6, uptime: 0.2, cost: 0.1, lag: 0.1 } },
    cost: { label: "Cost Efficiency", weights: { speed: 0.1, uptime: 0.2, cost: 0.6, lag: 0.1 } },
    reliability: { label: "Maximum Reliability", weights: { speed: 0.1, uptime: 0.6, cost: 0.1, lag: 0.2 } }
};

const DEFINITIONS_DATA = [
  { param: "Batch Throughput", unit: "ms/10 reqs", source: "Time to process a batch of 10 RPC calls.", relevance: "Simulates high-load dashboard performance." },
  { param: "P50 Latency", unit: "ms", source: "Median ping from client.", relevance: "General responsiveness." },
  { param: "Security Score", unit: "0-100", source: "HTTPS & Header Leak analysis.", relevance: "Infrastructure hardening level." },
  { param: "Archive Access", unit: "Boolean", source: "Live fetch of Genesis Block (#1).", relevance: "Verifies deep history access." },
  { param: "Execution Audit", unit: "State Check", source: "Verifies eth_call on ERC20/721/1155.", relevance: "Ensures provider can read actual smart contract state." },
];

const TRANSPARENCY_DATA = [
    { metric: "Latency & Lag", type: "Real-Time", reason: "Measured live from your session." },
    { metric: "Security/Header Leaks", type: "Real-Time", reason: "We analyze response headers for 'Server' or 'X-Powered-By' leakage." },
    { metric: "Smart Contract Read", type: "Real-Time", reason: "Performs actual eth_call to verified Token Contracts on-chain." },
    { metric: "Chain Coverage", type: "Static", reason: "Hardcoded from documentation." },
];

const METRIC_DEFINITIONS = {
  score: { title: "CovalScore™", calc: "Composite: Latency(40) + Uptime(40) + Lag(20).", meaning: "Best overall metric." },
  speed: { title: "P50 Latency", calc: "Median response time.", meaning: "Lower is better." },
  p99: { title: "P99 Stress", calc: "Peak response time.", meaning: "Lower is better." },
  cost: { title: "Est. Cost", calc: "Volume based projection.", meaning: "Lower is better." },
  reliability: { title: "Session Uptime", calc: "% of successful pings.", meaning: "Higher is better." }
};

// --- COMPONENTS ---
const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center z-[50]">
    {children}
    <div className="absolute top-full mt-3 px-4 py-3 bg-[#020617] border border-slate-700 text-left rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-64 shadow-2xl transform translate-y-2 group-hover:translate-y-0 z-[9999]">
      {content}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-slate-700"></div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#020617]"></div>
    </div>
  </div>
);

const DefinitionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-[#020617] border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-4"><div className="p-2 bg-indigo-500/10 rounded-lg"><BookOpen className="w-6 h-6 text-indigo-400" /></div><div><h2 className="text-xl font-bold text-white">Benchmark Methodology</h2><p className="text-xs text-slate-400 mt-0.5">Intelligence Suite Documentation</p></div></div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="overflow-y-auto p-8 space-y-10">
           <div><h3 className="text-sm uppercase tracking-wider text-emerald-400 font-bold mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Data Source Transparency</h3><div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg"><table className="w-full text-left border-collapse"><thead className="bg-slate-900"><tr className="text-xs uppercase text-slate-400"><th className="px-6 py-4 font-semibold">Metric</th><th className="px-6 py-4 font-semibold">Data Type</th><th className="px-6 py-4 font-semibold">Reason / Source</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{TRANSPARENCY_DATA.map((r,i)=><tr key={i} className="hover:bg-slate-900/50 transition-colors"><td className="px-6 py-4 text-slate-200 text-sm font-medium">{r.metric}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${r.type === "Real-Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>{r.type}</span></td><td className="px-6 py-4 text-slate-400 text-sm">{r.reason}</td></tr>)}</tbody></table></div></div>
           <div><h3 className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-4 flex items-center gap-2"><Info className="w-4 h-4" /> Competitive Benchmarking Parameters</h3><div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg"><table className="w-full text-left border-collapse"><thead className="bg-slate-900"><tr className="text-xs uppercase text-slate-400"><th className="px-6 py-4 font-semibold">Parameter</th><th className="px-6 py-4 font-semibold">Unit</th><th className="px-6 py-4 font-semibold">Data Source / Methodology</th><th className="px-6 py-4 font-semibold">Relevance to User</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{DEFINITIONS_DATA.map((r,i)=><tr key={i} className="hover:bg-slate-900/50 transition-colors"><td className="px-6 py-4 text-indigo-300 font-bold text-sm whitespace-nowrap">{r.param}</td><td className="px-6 py-4 text-slate-400 text-xs font-mono">{r.unit}</td><td className="px-6 py-4 text-slate-300 text-sm leading-relaxed">{r.source}</td><td className="px-6 py-4 text-slate-400 text-sm leading-relaxed italic border-l border-slate-800/50 bg-slate-900/30">{r.relevance}</td></tr>)}</tbody></table></div></div>
        </div>
      </div>
    </div>
  );
};

const InspectorModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
        <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
             <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div><h2 className="text-lg font-bold text-white">{data.name} Inspector</h2></div>
             <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-auto font-mono text-xs text-slate-300">
             <div className="mb-4 space-y-2">
                 <div><strong>Batch Latency (10 reqs):</strong> {data.batchLatency > 0 ? `${data.batchLatency}ms` : 'N/A'}</div>
                 <div><strong>Security Score:</strong> {data.securityScore}/100</div>
             </div>
             <div className="bg-black/50 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap break-all">{data.lastResponse ? JSON.stringify(data.lastResponse, null, 2) : "// No Data"}</div>
          </div>
        </div>
      </div>
    );
};

const MetricExplanation = ({ type }) => {
  const def = METRIC_DEFINITIONS[type];
  if (!def) return null;
  return <div><div className="text-sm font-bold text-white mb-1">{def.title}</div><p className="text-xs text-slate-300 mb-2 opacity-90 leading-relaxed">{def.calc}</p><div className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 inline-block">{def.meaning}</div></div>;
};

const Sparkline = ({ data = [], color }) => { 
  if (!data || data.length < 2) return <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>;
  const validData = data.filter(d => typeof d === 'number');
  const max = Math.max(...validData, 1);
  const min = validData.length > 0 ? Math.min(...validData) : 0;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const normalizedY = val === 0 ? 32 : 32 - ((val - min) / range) * 28; 
    return `${x},${normalizedY}`;
  }).join(' ');
  return <div className="h-8 w-24 opacity-80"><svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={color} strokeWidth="2" /></svg></div>;
};

const GlassCard = ({ children, className = "" }) => <div className={`backdrop-blur-md bg-[#0f172a]/40 border border-white/5 rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>;
const Badge = ({ children, color = "indigo" }) => <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border bg-${color}-500/10 text-${color}-400 border-${color}-500/20`}>{children}</span>;

const formatBigNumber = (valueStr) => {
    if (!valueStr || valueStr === 'Error') return 'N/A';
    if (valueStr.length > 12) return valueStr.substring(0, 4) + '...'; 
    return valueStr;
};

const getConsensus = (results) => {
    if (!results || results.length === 0) return null;
    const counts = {};
    results.forEach(r => { if (r.success && r.result) counts[r.result] = (counts[r.result] || 0) + 1; });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('score');
  const [network, setNetwork] = useState('ethereum'); 
  const [precision, setPrecision] = useState('standard');
  const [requestType, setRequestType] = useState('light'); 
  const [requestVolume, setRequestVolume] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [strategy, setStrategy] = useState('balanced');
  
  // NEW: State to pick Standard
  const [auditStandard, setAuditStandard] = useState('erc20');

  const [visibleProviders, setVisibleProviders] = useState(INITIAL_DATA.map(d => d.name));
  const [tableFilters, setTableFilters] = useState({ archive: false, trace: false, certs: false });
  const [isDefinitionsOpen, setDefinitionsOpen] = useState(false);
  const [isLogExpanded, setLogExpanded] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  const { benchmarkData, isRunning, runBenchmark, logs } = useBenchmark(INITIAL_DATA, network, precision, requestType);
  const { contractData, isTestingContracts, runContractTest } = useSmartBenchmark(INITIAL_DATA, network);

  const consensusValue = useMemo(() => getConsensus(contractData), [contractData]);

  const handleSmartTest = () => {
      const netConfig = NETWORK_CONFIG[network] || NETWORK_CONFIG.ethereum;
      const providersWithUrls = INITIAL_DATA.map(p => ({ name: p.name, url: netConfig[p.name]?.url })).filter(p => p.url); 
      runContractTest(providersWithUrls, auditStandard); // Pass selected standard
  };

  const processedData = useMemo(() => {
    return benchmarkData.map(p => {
      const calculatedCost = Math.round(p.baseCost * requestVolume);
      const latencyScore = Math.max(0, 100 - (p.latency > 0 ? p.latency / 3 : 100));
      const costScore = Math.max(0, 100 - (calculatedCost / 5)); 
      const stabilityScore = p.uptime;
      const featureScore = (p.coverage / 2.25) + ((p.certs || []).length * 10);
      const w = STRATEGIES[strategy].weights;
      const lagScore = Math.max(0, 100 - ((typeof p.lag === 'number' ? p.lag : 0) * 10));
      const score = Math.round((latencyScore * w.speed) + (stabilityScore * w.uptime) + (Math.max(0, 100 - p.p99/5) * 0.1) + (costScore * w.cost) + (lagScore * w.lag));
      return { ...p, calculatedCost, score, radar: { A: latencyScore, B: stabilityScore, C: costScore, D: featureScore, E: p.securityScore } };
    });
  }, [benchmarkData, requestVolume, strategy]);

  const sortedAndFilteredData = useMemo(() => {
    let data = processedData.filter(d => visibleProviders.includes(d.name) && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (tableFilters.archive) data = data.filter(d => d.archive);
    if (tableFilters.trace) data = data.filter(d => d.trace);
    if (tableFilters.certs) data = data.filter(d => (d.certs || []).length > 0);
    if (sortConfig.key) data.sort((a, b) => (a[sortConfig.key] < b[sortConfig.key] ? 1 : -1) * (sortConfig.direction === 'asc' ? -1 : 1));
    return data;
  }, [processedData, sortConfig, searchQuery, visibleProviders, tableFilters]);

  const getWinner = () => {
    const active = sortedAndFilteredData.filter(p => p.latency > 0);
    return active.length > 0 ? active.reduce((prev, curr) => prev.score > curr.score ? prev : curr) : { name: 'Ready', score: 0, radar: {A:0,B:0,C:0,D:0,E:0}, calculatedCost: 0, latency: 0, batchLatency: 0 };
  };

  const winner = getWinner();
  const handleSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc' });
  const toggleProvider = (name) => setVisibleProviders(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  const toggleTableFilter = (key) => setTableFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const handleExport = () => { 
      const headers = ["Provider", "P50 Latency", "P99 Latency", "Uptime", "Lag", "Gas", "Est. Cost"];
      const rows = sortedAndFilteredData.map(d => [d.name, d.latency, d.p99, d.uptime, d.lag, d.gas, d.calculatedCost].join(","));
      const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `benchmark_report_${network}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      {/* Background/Modals/Nav unchanged... */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"><div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" /><div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" /></div>
      <DefinitionsModal isOpen={isDefinitionsOpen} onClose={() => setDefinitionsOpen(false)} />
      <InspectorModal isOpen={!!inspectorData} onClose={() => setInspectorData(null)} data={inspectorData} />
      {isLogExpanded && <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"><div className="bg-slate-950 border border-slate-700 w-full max-w-5xl h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"><div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-wider"><Terminal className="w-4 h-4" /> Live Execution Log</div><button onClick={() => setLogExpanded(false)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><X className="w-5 h-5"/></button></div><div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-300 space-y-2">{logs.map((log, i) => <div key={i} className="border-b border-white/5 pb-1 border-dashed">{log}</div>)}</div></div></div>}
      
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4"><div className="flex items-center gap-3"><div className="relative"><div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div><Hexagon className="w-8 h-8 text-indigo-500 fill-indigo-500/10" strokeWidth={1.5} /></div><div><h1 className="font-bold text-xl tracking-tight text-white leading-none">Covalboard</h1><span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400/80 font-semibold">Enterprise Edition</span></div></div><div className="hidden md:flex items-center gap-6"><div className="flex items-center bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 gap-2"><Search className="w-4 h-4 text-slate-500" /><input type="text" placeholder="Search Providers..." className="bg-transparent border-none text-xs text-white focus:ring-0 outline-none w-32 placeholder:text-slate-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div><Tooltip content={<div className="p-2 text-xs">View Methodology & Data Sources</div>}><button onClick={() => setDefinitionsOpen(true)} className="flex items-center gap-2 text-xs font-bold text-indigo-300 hover:text-white transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1.5 rounded-full"><BookOpen className="w-4 h-4" />Docs</button></Tooltip><div className={`flex items-center gap-2 text-xs font-medium text-slate-500 border border-white/5 px-3 py-1.5 rounded-full bg-white/[0.02]`}><div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>{isRunning ? 'Benchmarking...' : 'System Operational'}</div></div></div></nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           {/* LEFT COLUMN: Controls */}
           <div className="lg:col-span-3 space-y-4">
              <GlassCard className="p-5 space-y-6 border-t-4 border-t-indigo-500/50">
                  <div><label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Target className="w-3 h-3" /> Optimization Strategy</label><div className="relative"><select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 appearance-none">{Object.entries(STRATEGIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}</select><ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-500 pointer-events-none" /></div></div>
                  <div className="h-px bg-white/5"></div>
                  <div><label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Globe className="w-3 h-3" /> Target Network</label><div className="grid grid-cols-1 gap-1">{SUPPORTED_CHAINS.map((net) => (<button key={net.id} onClick={() => setNetwork(net.id)} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${network === net.id ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${net.color}`}></div><span className="capitalize">{net.label}</span></div>{network === net.id && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}</button>))}</div></div>
                  <div className="h-px bg-white/5"></div>
                  <div className="grid grid-cols-4 gap-2"><button onClick={runBenchmark} disabled={isRunning} className={`col-span-3 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'}`}>{isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}{isRunning ? 'Running...' : 'Start'}</button><Tooltip content={<div className="p-2 text-xs">Download CSV Report</div>}><button onClick={handleExport} className="flex items-center justify-center rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button></Tooltip></div>
                  <div className="bg-black/50 rounded-lg p-3 font-mono text-[10px] text-slate-400 h-32 flex flex-col border border-slate-800 shadow-inner"><div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800"><div className="flex items-center gap-2 text-indigo-400"><Terminal className="w-3 h-3" /> Logs</div><button onClick={() => setLogExpanded(true)} className="hover:text-white transition-colors"><Maximize2 className="w-3 h-3" /></button></div><div className="overflow-y-auto flex-1 space-y-1">{logs.length === 0 && <span className="opacity-50">Ready...</span>}{logs.map((log, i) => <div key={i}>{log}</div>)}</div></div>
              </GlassCard>
           </div>

           {/* RIGHT COLUMN */}
           <div className="lg:col-span-9 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative rounded-2xl border border-white/10 p-5 md:col-span-2 flex items-center justify-between overflow-visible bg-gradient-to-br from-slate-900 to-slate-950">
                     <div className="relative z-10 flex-1"><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Top Performer ({STRATEGIES[strategy].label})</p><h2 className="text-3xl font-bold text-white flex items-center gap-3">{winner.name}{winner.score > 0 && <Tooltip content={<div className="p-2 space-y-1"><div className="text-xs font-bold text-white border-b border-slate-700 pb-1 mb-1">Score Breakdown</div><div className="flex justify-between text-[10px] text-slate-300"><span>Latency</span><span>40%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Uptime</span><span>30%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Lag</span><span>20%</span></div></div>}><span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 cursor-help flex items-center gap-1 hover:bg-indigo-500/20 transition-colors">Score: {winner.score} <HelpCircle className="w-3 h-3 opacity-50" /></span></Tooltip>}</h2><div className="mt-4 flex gap-4 text-xs text-slate-400"><div><span className="block text-white font-bold text-lg">{winner.latency}ms</span>Latency</div><div><span className="block text-white font-bold text-lg">{winner.batchLatency}ms</span>Batch (10x)</div><div><span className="block text-white font-bold text-lg">{winner.score}</span>CovalScore</div></div></div>
                     <div className="w-40 h-40 relative"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{ subject: 'Speed', A: winner.radar.A, fullMark: 100 }, { subject: 'Stab', A: winner.radar.B, fullMark: 100 }, { subject: 'Cost', A: winner.radar.C, fullMark: 100 }, { subject: 'Feat', A: winner.radar.D, fullMark: 100 }, { subject: 'Sec', A: winner.radar.E, fullMark: 100 }]}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} /><RadarShape name="Winner" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} /></RadarChart></ResponsiveContainer></div>
                  </div>
                  <GlassCard className="p-5 flex flex-col justify-center"><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Est. Cost</p><div className="text-2xl font-bold text-white">${(winner.calculatedCost || 0).toLocaleString()}</div><p className="text-[10px] text-slate-500 mt-1">Based on {requestVolume}M requests</p></GlassCard>
              </div>

              <GlassCard className="flex-1 min-h-[400px]">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {[{ id: 'score', label: 'CovalScore', icon: Activity }, { id: 'speed', label: 'P50 Latency', icon: Zap }, { id: 'p99', label: 'P99 Stress', icon: Gauge }, { id: 'cost', label: 'Est. Cost', icon: DollarSign }].map((tab) => (<Tooltip key={tab.id} content={<MetricExplanation type={tab.id} />}><button onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${activeTab === tab.id ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}><tab.icon className="w-3 h-3" />{tab.label}</button></Tooltip>))}
                    </div>
                 </div>
                 <div className="w-full mt-4 h-[350px] min-h-[350px]">
                  <ResponsiveContainer width="100%" height={300}>
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
        <div className="mt-8"><GlassCard className="p-0 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider"><th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Provider <ArrowUpDown className="w-3 h-3 inline ml-1" /></th><th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>P50 <ArrowUpDown className="w-3 h-3 inline ml-1" /></th><th className="px-6 py-4">Stability</th><th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('batchLatency')}>Batch (10x) <ArrowUpDown className="w-3 h-3 inline ml-1" /></th><th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('gas')}>Gas (Gwei) <ArrowUpDown className="w-3 h-3 inline ml-1" /></th><th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('coverage')}>Chains <ArrowUpDown className="w-3 h-3 inline ml-1" /></th><th className="px-6 py-4">Capabilities</th><th className="px-6 py-4">Security</th><th className="px-6 py-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('freeTier')}>Free Tier <ArrowUpDown className="w-3 h-3 inline ml-1" /></th></tr></thead><tbody className="divide-y divide-white/5">{sortedAndFilteredData.map((provider) => (<tr key={provider.name} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setInspectorData(provider)}><td className="px-6 py-4 font-medium text-white flex items-center gap-3"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}></div>{provider.name}</td><td className="px-6 py-4 text-slate-300 font-mono">{provider.latency > 0 ? <span className={provider.latency < 100 ? 'text-emerald-400' : 'text-slate-200'}>{provider.latency} ms</span> : <span className="text-slate-600">-</span>}</td><td className="px-6 py-4"><Sparkline data={provider.history || []} color={provider.color} /></td><td className="px-6 py-4 text-slate-300 font-mono">{provider.batchLatency > 0 ? provider.batchLatency : '-'}</td><td className="px-6 py-4 text-slate-300 font-mono">{provider.gas > 0 ? provider.gas.toFixed(2) : '-'}</td><td className="px-6 py-4 text-slate-400 text-xs">{provider.coverage} Nets</td><td className="px-6 py-4"><div className="flex gap-1.5">{provider.archive && <Tooltip content={<div className="p-2 text-xs">Archive Node Support</div>}><Database className="w-4 h-4 text-indigo-400" /></Tooltip>}{provider.trace && <Tooltip content={<div className="p-2 text-xs">Trace/Debug API Support</div>}><FileCode className="w-4 h-4 text-emerald-400" /></Tooltip>}{(provider.certs || []).length > 0 && <Tooltip content={<div className="p-2 text-xs">Certified: {(provider.certs || []).join(', ')}</div>}><ShieldCheck className="w-4 h-4 text-amber-400" /></Tooltip>}</div></td><td className="px-6 py-4"><Tooltip content={<div className="p-2 text-xs whitespace-nowrap">{(provider.securityIssues || []).length > 0 ? `${(provider.securityIssues || []).length} Issues Found` : "All Checks Passed"}</div>}>{provider.securityScore === 100 ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />}</Tooltip></td><td className="px-6 py-4 text-right text-xs text-slate-400">{provider.freeTier}</td></tr>))}</tbody></table></div></GlassCard></div>

        {/* SMART CONTRACT AUDIT SECTION */}
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><Box className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Execution Layer Audit</h3></div>
                    {/* STANDARD SELECTOR */}
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 gap-1">
                        {['erc20', 'erc721', 'erc1155'].map(type => (
                            <button key={type} onClick={() => setAuditStandard(type)} className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-all ${auditStandard === type ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{type}</button>
                        ))}
                    </div>
                </div>
                <button onClick={handleSmartTest} disabled={isTestingContracts} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all">{isTestingContracts ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run {auditStandard.toUpperCase()} Check</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractData.length > 0 ? contractData.map((res, idx) => {
                    const isMismatch = consensusValue && res.result && res.result !== consensusValue;
                    return (
                        <GlassCard key={idx} className="p-4 flex items-center justify-between relative overflow-hidden">
                            {isMismatch && <div className="absolute top-0 right-0 bg-red-500/20 px-2 py-0.5 text-[9px] text-red-300 font-bold border-bl rounded-bl">DATA MISMATCH</div>}
                            <div>
                                <div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-2">
                                    {res.name}
                                    {res.success && !isMismatch && <Check className="w-3 h-3 text-emerald-500" />}
                                    {isMismatch && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                </div>
                                <div className="text-sm text-white font-mono">
                                    {res.success ? (
                                        <div>
                                            <div className="text-[10px] text-slate-400">Time: {res.time}ms</div>
                                            <div className={`mt-1 font-bold ${isMismatch ? 'text-red-300' : 'text-emerald-300'}`}>{formatBigNumber(res.result)}</div>
                                        </div>
                                    ) : <span className="text-red-400">Failed</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Target</div>
                                <div className="text-xs text-indigo-300 font-bold max-w-[150px] truncate">{res.target || 'N/A'}</div>
                            </div>
                        </GlassCard>
                    );
                }) : (
                    <div className="col-span-full py-8 border border-dashed border-slate-800 rounded-xl text-center">
                        <div className="text-slate-500 text-sm mb-2">No audit data available.</div>
                        <p className="text-xs text-slate-600">Select a standard (ERC20/721/1155) and run a test to verify eth_call capabilities on {network}.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}