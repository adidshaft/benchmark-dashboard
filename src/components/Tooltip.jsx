import React from 'react';

const Tooltip = ({ content, children }) => (
  <div className="group relative flex items-center justify-center z-[50]">
    {children}
    <div className="absolute top-full mt-3 px-4 py-3 bg-[#020617] border border-slate-700 text-left rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none w-64 shadow-2xl transform translate-y-2 group-hover:translate-y-0 z-[60]">
      {content}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-[1px] border-4 border-transparent border-b-slate-700"></div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-[#020617]"></div>
    </div>
  </div>
);

export default Tooltip;