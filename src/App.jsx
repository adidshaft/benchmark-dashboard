import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Zap, Globe, CheckCircle2, Play, RotateCw, Layers, Info, 
  Settings2, Signal, Hexagon, DollarSign, Filter, Activity, Server, ArrowUpDown, Search, 
  ShieldCheck, Database, FileCode, Gauge, BookOpen, X, Eye, ChevronDown, CheckSquare, Square, Terminal, Maximize2, HelpCircle, ShieldAlert, Target, Download, Box, AlertTriangle, Check, Briefcase, Sparkles, Radio, Circle
} from 'lucide-react';

// --- CUSTOM HOOKS ---
import { useBenchmark, NETWORK_CONFIG } from './hooks/useBenchmark';
import { useSmartBenchmark } from './hooks/useSmartBenchmark';
import { useStatusPage } from './hooks/useStatusPage';

// --- COMPONENTS & CONFIG ---
import MetricExplanation from './components/MetricExplanation';
import Tooltip from './components/Tooltip';
import { INITIAL_DATA, SUPPORTED_CHAINS, USE_CASE_PRESETS, METRIC_DEFINITIONS, DEFINITIONS_DATA, TRANSPARENCY_DATA } from './config/constants';

// (Local small components can stay here or move to /components/ui)
const GlassCard = ({ children, className = "" }) => <div className={`backdrop-blur-md bg-[#0f172a]/40 border border-white/5 rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>;

const Sparkline = ({ data = [], color }) => { 
  if (!data || data.length < 2) return <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>;
  const validData = data.filter(d => typeof d === 'number');
  const max = Math.max(...validData, 1);
  const minData = validData.filter(d => d > 0);
  const min = minData.length > 0 ? Math.min(...minData) : 0;
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const normalizedY = val === 0 ? 32 : 32 - ((val - min) / range) * 28; 
    return `${x},${normalizedY}`;
  }).join(' ');
  return <div className="h-8 w-24 opacity-80"><svg width="100%" height="100%" viewBox="0 0 100 32" preserveAspectRatio="none"><polyline points={points} fill="none" stroke={color} strokeWidth="2" /></svg></div>;
};

const formatBigNumber = (valueStr) => {
    if (!valueStr || valueStr === 'Error') return 'N/A';
    if (valueStr.length > 12) return valueStr.substring(0, 4) + '...'; 
    return valueStr;
};

// Modals
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
           <div><h3 className="text-sm uppercase tracking-wider text-emerald-400 font-bold mb-4 flex items-center gap-2"><Eye className="w-4 h-4" /> Data Source Transparency</h3><div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg"><table className="w-full text-left border-collapse"><thead className="bg-slate-900"><tr className="text-xs uppercase text-slate-400"><th className="px-6 py-4 font-semibold">Metric</th><th className="px-6 py-4 font-semibold">Data Type</th><th className="px-6 py-4 font-semibold">Reason / Source</th></tr></thead><tbody className="divide-y divide-slate-800 bg-slate-950/50">{TRANSPARENCY_DATA.map((r,i)=><tr key={i} className="hover:bg-slate-900/50 transition-colors"><td className="px-6 py-4 text-slate-200 text-sm font-medium">{r.metric}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${r.type === "Real-Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : r.type === "Calculated" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-slate-800 text-slate-400 border-slate-700"}`}>{r.type}</span></td><td className="px-6 py-4 text-slate-400 text-sm">{r.reason}</td></tr>)}</tbody></table></div></div>
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

export default function App() {
  const [activeTab, setActiveTab] = useState('score');
  const [network, setNetwork] = useState('ethereum'); 
  const [precision, setPrecision] = useState('standard');
  const [requestType, setRequestType] = useState('light'); 
  const [requestVolume, setRequestVolume] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [useCase, setUseCase] = useState('general');
  const [auditStandard, setAuditStandard] = useState('erc20');

  const [visibleProviders, setVisibleProviders] = useState(INITIAL_DATA.map(d => d.name));
  const [tableFilters, setTableFilters] = useState({ archive: false, trace: false, certs: false });
  const [isDefinitionsOpen, setDefinitionsOpen] = useState(false);
  const [isLogExpanded, setLogExpanded] = useState(false);
  const [inspectorData, setInspectorData] = useState(null);

  const { benchmarkData, isRunning, runBenchmark, logs } = useBenchmark(INITIAL_DATA, network, precision, requestType);
  const { contractData, isTestingContracts, runContractTest } = useSmartBenchmark(INITIAL_DATA, network);
  const officialStatuses = useStatusPage();

  const handleSmartTest = () => {
      const netConfig = NETWORK_CONFIG[network] || NETWORK_CONFIG.ethereum;
      const providersWithUrls = INITIAL_DATA.map(p => ({
          name: p.name,
          url: netConfig[p.name]?.url 
      })).filter(p => p.url); 
      runContractTest(providersWithUrls, auditStandard);
  };

  const processedData = useMemo(() => {
    return benchmarkData.map(p => {
      const calculatedCost = Math.round(p.baseCost * requestVolume);
      
      const latencyScore = Math.max(0, 100 - (p.latency > 0 ? p.latency / 3 : 100));
      const batchScore = Math.max(0, 100 - (p.batchLatency > 0 ? p.batchLatency / 5 : 100));
      const costScore = Math.max(0, 100 - (calculatedCost / 5)); 
      const reliabilityScore = p.uptime; 
      const integrityScore = Math.max(0, 100 - ((typeof p.lag === 'number' ? p.lag : 0) * 10)) - (100 - p.securityScore); 

      const w = USE_CASE_PRESETS[useCase].weights;
      const score = Math.round(
          (latencyScore * w.latency) + 
          (batchScore * w.batch) + 
          (reliabilityScore * w.reliability) + 
          (costScore * w.cost) + 
          (integrityScore * w.integrity)
      );

      return { 
          ...p, calculatedCost, score, 
          radar: { A: latencyScore, B: batchScore, C: costScore, D: reliabilityScore, E: p.securityScore },
          officialStatus: officialStatuses[p.name]
      };
    });
  }, [benchmarkData, requestVolume, useCase, officialStatuses]);

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
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none"><div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" /><div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" /></div>
      <DefinitionsModal isOpen={isDefinitionsOpen} onClose={() => setDefinitionsOpen(false)} />
      <InspectorModal isOpen={!!inspectorData} onClose={() => setInspectorData(null)} data={inspectorData} />
      {isLogExpanded && <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"><div className="bg-slate-950 border border-slate-700 w-full max-w-5xl h-[80vh] rounded-2xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200"><div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div className="flex items-center gap-2 text-emerald-400 font-mono text-sm uppercase tracking-wider"><Terminal className="w-4 h-4" /> Live Execution Log</div><button onClick={() => setLogExpanded(false)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><X className="w-5 h-5"/></button></div><div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-300 space-y-2">{logs.map((log, i) => <div key={i} className="border-b border-white/5 pb-1 border-dashed">{log}</div>)}</div></div></div>}
      
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
        {/* TOP CONTROL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
           <div className="lg:col-span-3 space-y-4">
              <GlassCard className="p-5 space-y-6 border-t-4 border-t-indigo-500/50">
                  <div>
                      <label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Briefcase className="w-3 h-3" /> I am building a...</label>
                      <div className="relative mb-2"><select value={useCase} onChange={(e) => setUseCase(e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 appearance-none">{Object.entries(USE_CASE_PRESETS).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}</select><ChevronDown className="absolute right-3 top-3 w-3 h-3 text-slate-500 pointer-events-none" /></div>
                      <div className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg">{USE_CASE_PRESETS[useCase].desc}</div>
                  </div>
                  <div className="h-px bg-white/5"></div>
                  <div><label className="text-xs uppercase text-slate-500 font-bold tracking-wider mb-3 flex items-center gap-2"><Globe className="w-3 h-3" /> Target Network</label><div className="grid grid-cols-1 gap-1">{SUPPORTED_CHAINS.map((net) => (<button key={net.id} onClick={() => setNetwork(net.id)} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${network === net.id ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${net.color}`}></div><span className="capitalize">{net.label}</span></div>{network === net.id && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}</button>))}</div></div>
                  <div className="h-px bg-white/5"></div>
                  <div className="grid grid-cols-4 gap-2"><button onClick={runBenchmark} disabled={isRunning} className={`col-span-3 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${isRunning ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'}`}>{isRunning ? <RotateCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}{isRunning ? 'Running...' : 'Start'}</button><Tooltip content={<div className="p-2 text-xs">Download CSV Report</div>}><button onClick={handleExport} className="flex items-center justify-center rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"><Download className="w-4 h-4" /></button></Tooltip></div>
              </GlassCard>
           </div>

           <div className="lg:col-span-9 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* WINNER CARD */}
                  <div className="relative rounded-2xl border border-white/10 p-5 md:col-span-2 flex items-center justify-between overflow-visible bg-gradient-to-br from-slate-900 to-slate-950">
                     <div className="relative z-10 flex-1">
                        <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Top Performer ({USE_CASE_PRESETS[useCase].label})</p>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">{winner.name}{winner.score > 0 && <Tooltip content={<div className="p-2 space-y-1"><div className="text-xs font-bold text-white border-b border-slate-700 pb-1 mb-1">Score Breakdown</div><div className="flex justify-between text-[10px] text-slate-300"><span>Latency</span><span>{(USE_CASE_PRESETS[useCase].weights.latency * 100).toFixed(0)}%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Reliability</span><span>{(USE_CASE_PRESETS[useCase].weights.reliability * 100).toFixed(0)}%</span></div><div className="flex justify-between text-[10px] text-slate-300"><span>Throughput</span><span>{(USE_CASE_PRESETS[useCase].weights.batch * 100).toFixed(0)}%</span></div></div>}><span className="text-sm font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20 cursor-help flex items-center gap-1 hover:bg-indigo-500/20 transition-colors">Score: {winner.score} <HelpCircle className="w-3 h-3 opacity-50" /></span></Tooltip>}</h2>
                        <div className="mt-4 flex gap-4 text-xs text-slate-400"><div><span className="block text-white font-bold text-lg">{winner.latency}ms</span>Latency</div><div><span className="block text-white font-bold text-lg">{winner.batchLatency}ms</span>Batch (10x)</div><div><span className="block text-white font-bold text-lg">{winner.score}</span>CovalScore</div></div>
                     </div>
                     <div className="w-40 h-40 relative"><ResponsiveContainer width="100%" height="100%"><RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{ subject: 'Speed', A: winner.radar.A, fullMark: 100 }, { subject: 'Batch', A: winner.radar.B, fullMark: 100 }, { subject: 'Cost', A: winner.radar.C, fullMark: 100 }, { subject: 'Uptime', A: winner.radar.D, fullMark: 100 }, { subject: 'Secure', A: winner.radar.E, fullMark: 100 }]}><PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} /><Radar name="Winner" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.3} /></RadarChart></ResponsiveContainer></div>
                  </div>
                  <GlassCard className="p-5 flex flex-col justify-center"><p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Est. Cost</p><div className="text-2xl font-bold text-white">${(winner.calculatedCost || 0).toLocaleString()}</div><p className="text-[10px] text-slate-500 mt-1">Based on {requestVolume}M requests</p></GlassCard>
              </div>

              {/* MAIN CHART */}
              <GlassCard className="flex-1 min-h-[400px]">
                 <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                        {[{ id: 'score', label: 'CovalScore', icon: Activity }, { id: 'speed', label: 'P50 Latency', icon: Zap }, { id: 'p99', label: 'P99 Stress', icon: Gauge }, { id: 'cost', label: 'Est. Cost', icon: DollarSign }].map((tab) => (
                          <Tooltip key={tab.id} content={<MetricExplanation type={tab.id} />}><button onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${activeTab === tab.id ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}><tab.icon className="w-3 h-3" />{tab.label}</button></Tooltip>
                        ))}
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

        {/* MAIN DATA TABLE */}
        <div className="mt-8">
            <GlassCard className="p-0 overflow-visible">
                <div className="overflow-visible">
                    <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/20 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                            <Tooltip content="Service Provider Name"><div className="flex items-center gap-1">Provider <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('latency')}>
                            <Tooltip content="Median response time (lower is better)."><div className="flex items-center gap-1">P50 <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                        <th className="px-6 py-4">
                            <Tooltip content="Latency history sparkline (20 points).">Stability</Tooltip>
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('batchLatency')}>
                            <Tooltip content="Time to process 10 requests in one batch."><div className="flex items-center gap-1">Batch (10x) <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('gas')}>
                            <Tooltip content="Real-time gas price estimation."><div className="flex items-center gap-1">Gas (Gwei) <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                        <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('coverage')}>
                            <Tooltip content="Number of supported networks."><div className="flex items-center gap-1">Chains <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                        <th className="px-6 py-4">
                            <Tooltip content="Advanced features (Archive, Trace, etc).">Capabilities</Tooltip>
                        </th>
                        <th className="px-6 py-4">
                            <Tooltip content="HTTPS & Header Leak analysis.">Security</Tooltip>
                        </th>
                        <th className="px-6 py-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('freeTier')}>
                            <Tooltip content="Free tier limits (normalized)."><div className="flex items-center justify-end gap-1">Free Tier <ArrowUpDown className="w-3 h-3" /></div></Tooltip>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedAndFilteredData.map((provider) => (
                        <tr key={provider.name} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setInspectorData(provider)}>
                          <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                              <Tooltip content={provider.officialStatus?.description || "All Systems Operational"}>
                                  {provider.officialStatus?.indicator === 'minor' ? <AlertTriangle className="w-3 h-3 text-amber-500 animate-pulse" /> : 
                                   provider.officialStatus?.indicator === 'major' || provider.officialStatus?.indicator === 'critical' ? <ShieldAlert className="w-3 h-3 text-red-500 animate-bounce" /> : 
                                   <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                              </Tooltip>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}></div>{provider.name}</td><td className="px-6 py-4 text-slate-300 font-mono">{provider.latency > 0 ? <span className={provider.latency < 100 ? 'text-emerald-400' : 'text-slate-200'}>{provider.latency} ms</span> : <span className="text-slate-600">-</span>}</td><td className="px-6 py-4"><Sparkline data={provider.history || []} color={provider.color} /></td><td className="px-6 py-4 text-slate-300 font-mono">{provider.batchLatency > 0 ? provider.batchLatency : '-'}</td><td className="px-6 py-4 text-slate-300 font-mono">{provider.gas > 0 ? provider.gas.toFixed(2) : '-'}</td><td className="px-6 py-4 text-slate-400 text-xs">{provider.coverage} Nets</td><td className="px-6 py-4"><div className="flex gap-1.5">{provider.archive && <Tooltip content={<div className="p-2 text-xs">Archive Node Support</div>}><Database className="w-4 h-4 text-indigo-400" /></Tooltip>}{provider.trace && <Tooltip content={<div className="p-2 text-xs">Trace/Debug API Support</div>}><FileCode className="w-4 h-4 text-emerald-400" /></Tooltip>}{(provider.certs || []).length > 0 && <Tooltip content={<div className="p-2 text-xs">Certified: {(provider.certs || []).join(', ')}</div>}><ShieldCheck className="w-4 h-4 text-amber-400" /></Tooltip>}</div></td><td className="px-6 py-4"><Tooltip content={<div className="p-2 text-xs whitespace-nowrap">{(provider.securityIssues || []).length > 0 ? `${(provider.securityIssues || []).length} Issues Found` : "All Checks Passed"}</div>}>{provider.securityScore === 100 ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />}</Tooltip></td><td className="px-6 py-4 text-right text-xs text-slate-400">{provider.freeTier}</td></tr>))}</tbody></table></div></GlassCard></div>

        {/* AUDIT SECTION */}
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4"><div className="flex items-center gap-2"><Box className="w-4 h-4 text-slate-400" /><h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Execution Layer Audit</h3></div><div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 gap-1">{['erc20', 'erc721', 'erc1155'].map(type => (<button key={type} onClick={() => setAuditStandard(type)} className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-all ${auditStandard === type ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}>{type}</button>))}</div></div>
                <button onClick={handleSmartTest} disabled={isTestingContracts} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all">{isTestingContracts ? <RotateCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Run {auditStandard.toUpperCase()} Check</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractData.length > 0 ? contractData.map((res, idx) => {
                    return (
                        <GlassCard key={idx} className="p-4 flex items-center justify-between relative overflow-hidden">
                            {res.isMismatch && <div className="absolute top-0 right-0 bg-red-500/20 px-2 py-0.5 text-[9px] text-red-300 font-bold border-bl rounded-bl">CONSENSUS FAILURE</div>}
                            <div><div className="text-xs text-slate-500 font-bold mb-1 flex items-center gap-2">{res.name}{res.success && !res.isMismatch && <Check className="w-3 h-3 text-emerald-500" />}{res.isMismatch && <AlertTriangle className="w-3 h-3 text-red-500" />}</div><div className="text-sm text-white font-mono">{res.success ? (<div><div className="text-[10px] text-slate-400">Time: {res.time}ms</div><div className={`mt-1 font-bold ${res.isMismatch ? 'text-red-300' : 'text-emerald-300'}`}>{formatBigNumber(res.result)}</div></div>) : <span className="text-red-400">Failed</span>}</div></div>
                            <div className="text-right"><div className="text-[10px] text-slate-500 uppercase tracking-wider">Target</div><div className="text-xs text-indigo-300 font-bold max-w-[150px] truncate">{res.target || 'N/A'}</div></div>
                        </GlassCard>
                    );
                }) : (
                    <div className="col-span-full py-8 border border-dashed border-slate-800 rounded-xl text-center"><div className="text-slate-500 text-sm mb-2">No audit data available.</div><p className="text-xs text-slate-600">Select a standard (ERC20/721/1155) and run a test to verify eth_call capabilities on {network}.</p></div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}