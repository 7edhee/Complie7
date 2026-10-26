import React from 'react';
import { GitBranch, Terminal } from 'lucide-react';

interface TopNavProps {
  activeTab: 'compiler' | 'repository' | 'contribute' | 'docs' | 'legal';
  onTabChange: (tab: 'compiler' | 'repository' | 'contribute' | 'docs' | 'legal') => void;
  onOpenClone: () => void;
}

export function TopNav({ activeTab, onTabChange, onOpenClone }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element Brand Zone */}
        <button
          onClick={() => onTabChange('compiler')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2 group cursor-pointer hover:opacity-90"
        >
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-slate-950 font-mono text-xs font-black shadow-sm group-hover:bg-amber-400 transition-colors">
            DB
          </div>
          <span>DOSBox Compiler Studio</span>
        </button>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => onTabChange('compiler')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 ${
              activeTab === 'compiler' ? 'text-amber-400 font-semibold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            Compiler
          </button>
          <button
            onClick={() => onTabChange('repository')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 ${
              activeTab === 'repository' ? 'text-amber-400 font-semibold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            Repository
          </button>
          <button
            onClick={() => onTabChange('contribute')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 ${
              activeTab === 'contribute' ? 'text-amber-400 font-semibold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            Contribute
          </button>
          <button
            onClick={() => onTabChange('docs')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 ${
              activeTab === 'docs' ? 'text-amber-400 font-semibold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            Documentation
          </button>
          <button
            onClick={() => onTabChange('legal')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-100 ${
              activeTab === 'legal' ? 'text-amber-400 font-semibold border-b border-amber-400 pb-0.5' : ''
            }`}
          >
            Legal
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenClone}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 shadow"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Clone Repo</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around px-3 py-2 border-t border-slate-900 bg-slate-950 text-xs text-slate-400 overflow-x-auto">
        <button
          onClick={() => onTabChange('compiler')}
          className={`px-2 py-1 ${activeTab === 'compiler' ? 'text-amber-400 font-bold' : ''}`}
        >
          Compiler
        </button>
        <button
          onClick={() => onTabChange('repository')}
          className={`px-2 py-1 ${activeTab === 'repository' ? 'text-amber-400 font-bold' : ''}`}
        >
          Repo
        </button>
        <button
          onClick={() => onTabChange('contribute')}
          className={`px-2 py-1 ${activeTab === 'contribute' ? 'text-amber-400 font-bold' : ''}`}
        >
          Patches
        </button>
        <button
          onClick={() => onTabChange('docs')}
          className={`px-2 py-1 ${activeTab === 'docs' ? 'text-amber-400 font-bold' : ''}`}
        >
          Docs
        </button>
        <button
          onClick={() => onTabChange('legal')}
          className={`px-2 py-1 ${activeTab === 'legal' ? 'text-amber-400 font-bold' : ''}`}
        >
          Legal
        </button>
      </div>
    </header>
  );
}
