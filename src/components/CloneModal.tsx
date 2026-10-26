import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, GitBranch, ExternalLink } from 'lucide-react';
import { REPO_METADATA } from '../data/repositoryFiles';

interface CloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
}

export function CloneModal({ isOpen, onClose, onDownloadZip }: CloneModalProps) {
  const [protocol, setProtocol] = useState<'https' | 'ssh' | 'cli'>('https');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cloneCommands = {
    https: `git clone https://github.com/${REPO_METADATA.fullName}.git`,
    ssh: `git clone git@github.com:${REPO_METADATA.fullName}.git`,
    cli: `gh repo clone ${REPO_METADATA.fullName}`,
  };

  const currentCommand = cloneCommands[protocol];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">Clone Repository</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-3">
            Clone or copy <span className="font-semibold text-slate-200">{REPO_METADATA.fullName}</span> to your local machine to build standalone DOSBox binaries or create custom hardware modules and patches.
          </p>

          {/* Protocol Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg mb-3">
            <button
              onClick={() => setProtocol('https')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                protocol === 'https' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HTTPS
            </button>
            <button
              onClick={() => setProtocol('ssh')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                protocol === 'ssh' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SSH
            </button>
            <button
              onClick={() => setProtocol('cli')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                protocol === 'cli' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GitHub CLI
            </button>
          </div>

          {/* Command display and copy button */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 mb-4">
            <Terminal className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="truncate select-all">{currentCommand}</span>
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Download ZIP & contribute note */}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                onDownloadZip();
                onClose();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download Repository Archive (.ZIP)</span>
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Ready to submit a patch?</span>
              <span className="text-amber-400 font-medium">See Contributor Hub tab</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
