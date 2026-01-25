import React from 'react';
import { METRIC_DEFINITIONS } from '../config/constants';

const MetricExplanation = ({ type }) => {
  const def = METRIC_DEFINITIONS[type];
  if (!def) return null;
  return (
    <div>
      <div className="text-sm font-bold text-white mb-1">{def.title}</div>
      <p className="text-xs text-slate-300 mb-2 opacity-90 leading-relaxed">{def.calc}</p>
      <div className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 inline-block">
        {def.meaning}
      </div>
    </div>
  );
};

export default MetricExplanation;