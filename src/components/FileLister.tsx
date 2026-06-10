"use client";

import React from 'react';

const FileLister = () => {
  // Use Vite's import.meta.glob to list all typescript, tsx, css, and json files in the codebase
  const files = import.meta.glob('/**/*.(ts|tsx|json|css|html)', { eager: false });
  const filePaths = Object.keys(files);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900/95 border border-amber-500/30 rounded-lg p-4 text-xs font-mono text-slate-300 shadow-2xl max-h-80 overflow-y-auto backdrop-blur-md">
      <h3 className="font-bold text-amber-400 mb-2 border-b border-amber-500/20 pb-1 flex items-center justify-between">
        <span>📂 Workspace Files ({filePaths.length})</span>
        <span className="text-[10px] text-slate-500">Auto-generated list</span>
      </h3>
      <ul className="space-y-1">
        {filePaths.map((path) => (
          <li key={path} className="hover:text-amber-300 truncate" title={path}>
            {path.replace(/^\/src\//, './src/').replace(/^\//, './')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileLister;