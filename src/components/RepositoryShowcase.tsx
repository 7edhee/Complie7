import React, { useState } from 'react';
import { 
  Folder, File, GitBranch, Star, GitFork, Eye, Download, Copy, Check, 
  ExternalLink, ArrowLeft, Terminal, Play, FileCode, CheckCircle2 
} from 'lucide-react';
import { RepoFile } from '../types/dosbox';
import { REPO_METADATA, REPO_FILES } from '../data/repositoryFiles';
import { SyntaxHighlight } from '../utils/syntaxHighlight';

interface RepositoryShowcaseProps {
  onOpenInCompiler: (filename: string, code: string, lang: 'c' | 'cpp' | 'csharp') => void;
  onOpenCloneModal: () => void;
  onDownloadZip: () => void;
}

export function RepositoryShowcase({
  onOpenInCompiler,
  onOpenCloneModal,
  onDownloadZip,
}: RepositoryShowcaseProps) {
  const [selectedBranch, setSelectedBranch] = useState(REPO_METADATA.defaultBranch);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<RepoFile | null>(REPO_FILES[0]); // Start with README.md
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(REPO_METADATA.stars);

  // Navigate folder hierarchy
  const getCurrentFolderFiles = (): RepoFile[] => {
    let currentList = REPO_FILES;
    for (const seg of currentPath) {
      const found = currentList.find((f) => f.name === seg && f.type === 'dir');
      if (found && found.children) {
        currentList = found.children;
      }
    }
    return currentList;
  };

  const handleSelectFile = (file: RepoFile) => {
    if (file.type === 'dir') {
      setCurrentPath([...currentPath, file.name]);
    } else {
      setActiveFile(file);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  const handleCopyRaw = () => {
    if (!activeFile?.content) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleToggleStar = () => {
    if (starred) {
      setStarCount((c) => c - 1);
      setStarred(false);
    } else {
      setStarCount((c) => c + 1);
      setStarred(true);
    }
  };

  const handleSendToCompiler = () => {
    if (!activeFile?.content) return;
    let lang: 'c' | 'cpp' | 'csharp' = 'c';
    if (activeFile.name.endsWith('.cpp') || activeFile.name.endsWith('.hpp')) lang = 'cpp';
    else if (activeFile.name.endsWith('.cs')) lang = 'csharp';
    onOpenInCompiler(activeFile.name, activeFile.content, lang);
  };

  const currentFolderFiles = getCurrentFolderFiles();

  return (
    <div className="space-y-6">
      {/* GitHub Repo Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-sm">
              DOS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">{REPO_METADATA.owner}</span>
                <span className="text-slate-600">/</span>
                <h1 className="text-lg font-bold text-slate-100">{REPO_METADATA.name}</h1>
                <span className="text-[11px] font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                  Public
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {REPO_METADATA.description}
              </p>
            </div>
          </div>

          {/* Social and Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            <button
              onClick={handleToggleStar}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                starred
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Star</span>
              <span className="text-slate-500 font-mono text-[11px] tabular-nums">· {starCount}</span>
            </button>

            <button
              onClick={onOpenCloneModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors shadow"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Clone / Copy</span>
            </button>

            <button
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors"
              title="Download entire repository as ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ZIP</span>
            </button>
          </div>
        </div>

        {/* Branch bar and Commit line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                {REPO_METADATA.branches.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-slate-200">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              {REPO_METADATA.commitCount} commits
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 font-mono text-[11px]">
              Release {REPO_METADATA.releaseTag}
            </span>
          </div>

          <div className="text-slate-400 font-mono text-[11px] truncate">
            Latest commit: <span className="text-slate-200">docs: update C# AOT and Watcom guides</span> · 2 days ago
          </div>
        </div>
      </div>

      {/* Main Repository Explorer Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Tree Navigator */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-200">File Explorer</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {currentPath.length > 0 ? `/${currentPath.join('/')}` : '/root'}
            </span>
          </div>

          {/* Breadcrumb nav */}
          {currentPath.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800/60 flex items-center gap-1 text-xs text-slate-400">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>..</span>
              </button>
              <span>/</span>
              {currentPath.map((seg, idx) => (
                <React.Fragment key={idx}>
                  <button
                    onClick={() => handleBreadcrumbClick(idx)}
                    className="hover:text-amber-400 transition-colors text-[11px]"
                  >
                    {seg}
                  </button>
                  {idx < currentPath.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* File list */}
          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
            {currentFolderFiles.map((file) => {
              const isSelected = activeFile?.path === file.path;
              return (
                <div
                  key={file.path}
                  onClick={() => handleSelectFile(file)}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {file.type === 'dir' ? (
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 tabular-nums shrink-0 ml-2">
                    {file.size}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer & Quick Launcher */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {activeFile ? (
            <>
              {/* File Viewer Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-slate-100 font-mono text-xs">{activeFile.path}</span>
                  <span className="text-slate-600 font-mono">·</span>
                  <span className="text-slate-500 font-mono text-[11px]">{activeFile.size}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Open in Compiler Studio button */}
                  {(activeFile.name.endsWith('.c') ||
                    activeFile.name.endsWith('.cpp') ||
                    activeFile.name.endsWith('.cs')) && (
                    <button
                      onClick={handleSendToCompiler}
                      className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium rounded transition-colors"
                      title="Load this file into the Compiler Studio workspace"
                    >
                      <Play className="w-3 h-3" />
                      <span>Open in Compiler</span>
                    </button>
                  )}

                  <button
                    onClick={handleCopyRaw}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Raw</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* File Content Body */}
              <div className="p-4 bg-slate-950/70 overflow-x-auto min-h-[350px] max-h-[560px]">
                {activeFile.content ? (
                  <SyntaxHighlight
                    code={activeFile.content}
                    language={activeFile.language || 'c'}
                  />
                ) : (
                  <div className="text-xs text-slate-500 italic p-4 text-center">
                    Binary or sample file preview. Click "Open in Compiler" to inspect or compile.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Folder className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm">Select a file from the repository tree to view code.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
