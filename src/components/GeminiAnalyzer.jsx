import React, { useState } from 'react';
import { Sparkles, X, Bot, Loader2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useGeminiAnalysis } from '../hooks/useGeminiAnalysis';

const GeminiAnalyzer = ({ benchmarkData, portfolioData }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { analysis, isAnalyzing, error, analyzeData, clearAnalysis } = useGeminiAnalysis();

    const handleAnalyze = () => {
        if (!isOpen) setIsOpen(true);
        if (!analysis) {
            analyzeData(benchmarkData, portfolioData);
        }
    };

    return (
        <>
            {/* FLOATING ACTION BUTTON */}
            <button
                onClick={handleAnalyze}
                className={`fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-slate-800 text-slate-400 translate-y-20 opacity-0 pointer-events-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    }`}
            >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="font-bold text-sm">Analyze Results</span>
            </button>

            {/* ANALYSIS PANEL */}
            <div
                className={`fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-[#020617] border-l border-slate-700 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Bot className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">AI Insights</h2>
                                <p className="text-xs text-slate-400">Powered by Gemini</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-70">
                                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                <p className="text-sm text-slate-400 animate-pulse">Analyzing Provider Metrics...</p>
                            </div>
                        ) : error ? (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                                <button onClick={() => analyzeData(benchmarkData, portfolioData)} className="mt-2 text-xs underline font-bold">Try Again</button>
                            </div>
                        ) : analysis ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-purple-400 mb-4" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold text-white mt-6 mb-3 border-b border-slate-800 pb-2" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="text-indigo-300 font-bold" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="space-y-2 my-4" {...props} />,
                                        li: ({ node, ...props }) => <li className="flex gap-2 items-start text-slate-300"><ChevronRight className="w-4 h-4 mt-1 text-slate-600 shrink-0" /><span {...props} /></li>
                                    }}
                                >
                                    {analysis}
                                </ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 mt-20">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Run a benchmark or portfolio test, then click here to get AI-driven insights on the results.</p>
                                <button
                                    onClick={() => analyzeData(benchmarkData, portfolioData)}
                                    className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold text-white transition-colors"
                                >
                                    Run Analysis Now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
                        <p className="text-[10px] text-slate-600">AI analysis may vary. Always verify with raw data.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GeminiAnalyzer;