import React from 'react';
import { GitBranch, Shield, FileText, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: 'compiler' | 'repository' | 'contribute' | 'docs' | 'legal') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="mt-16 border-t border-slate-900 bg-slate-950 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-amber-400 font-mono text-[10px] font-bold">
            DB
          </div>
          <div>
            <span className="font-semibold text-slate-300">DOSBox Compiler Suite</span>
            <span className="text-slate-600 mx-2">·</span>
            <span>Open Source x86 Retro Toolchain</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <button
            onClick={() => onNavigate('repository')}
            className="hover:text-slate-300 transition-colors"
          >
            GitHub Repository
          </button>
          <button
            onClick={() => onNavigate('contribute')}
            className="hover:text-slate-300 transition-colors"
          >
            Submit Custom Patch
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className="hover:text-slate-300 transition-colors"
          >
            Build Docs
          </button>
          <button
            onClick={() => onNavigate('legal')}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => onNavigate('legal')}
            className="hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Terms of Service</span>
          </button>
        </div>

        <div className="text-center md:text-right font-mono text-[11px] text-slate-600">
          <span>GPL-2.0 & MIT License</span>
          <span className="mx-2">·</span>
          <span>© 2026 adheeexe</span>
        </div>
      </div>
    </footer>
  );
}
