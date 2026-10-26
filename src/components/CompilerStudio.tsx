import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Cpu, Settings, FileCode, CheckCircle, AlertTriangle, 
  Download, Terminal, Search, Layers, RefreshCw, Sparkles, BookOpen 
} from 'lucide-react';
import { 
  SupportedLanguage, CompilerOptions, BuildLogMessage, DisassemblyLine, 
  MemorySegment, EditorTheme 
} from '../types/dosbox';
import { CODE_TEMPLATES, CodeTemplate } from '../data/codeTemplates';
import { compileDosSource, CompilationResult } from '../utils/dosCompilerEngine';
import { DosCanvas } from './DosCanvas';
import { SyntaxHighlight } from '../utils/syntaxHighlight';

interface CompilerStudioProps {
  initialCode?: string;
  initialLang?: SupportedLanguage;
  initialFilename?: string;
  activePatchesCount: number;
}

export function CompilerStudio({
  initialCode,
  initialLang,
  initialFilename,
  activePatchesCount,
}: CompilerStudioProps) {
  // Current language and template
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLang || 'c');
  const [code, setCode] = useState<string>(initialCode || CODE_TEMPLATES[0].code);
  const [currentFilename, setCurrentFilename] = useState<string>(initialFilename || CODE_TEMPLATES[0].filename);

  // Compiler options
  const [options, setOptions] = useState<CompilerOptions>({
    language: initialLang || 'c',
    target: 'dos-16-real',
    optLevel: '-O2',
    memoryModel: 'tiny',
    standard: 'c99',
    enableSoundBlaster: true,
    enableVGA: true,
    generateDisassembly: true,
    cycles: 3000,
  });

  // Editor states
  const [theme, setTheme] = useState<EditorTheme>('slate-modern');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Compilation & Execution state
  const [isCompiling, setIsCompiling] = useState(false);
  const [buildResult, setBuildResult] = useState<CompilationResult | null>(null);
  const [activeOutputTab, setActiveOutputTab] = useState<'screen' | 'logs' | 'disasm' | 'memory'>('screen');
  const [isDosRunning, setIsDosRunning] = useState(false);

  // Keep options.language in sync with selectedLang
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      language: selectedLang,
      standard: selectedLang === 'c' ? 'c99' : selectedLang === 'cpp' ? 'c++20' : 'c# 10',
      memoryModel: selectedLang === 'c' ? 'tiny' : 'small',
    }));
  }, [selectedLang]);

  // Initial compilation on mount
  useEffect(() => {
    handleCompile(false);
  }, []);

  // Update if initialCode props change
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      if (initialLang) setSelectedLang(initialLang);
      if (initialFilename) setCurrentFilename(initialFilename);
    }
  }, [initialCode, initialLang, initialFilename]);

  const handleTemplateSelect = (template: CodeTemplate) => {
    setSelectedLang(template.language);
    setCode(template.code);
    setCurrentFilename(template.filename);
    handleCompile(true, template.code, template.language);
  };

  const handleCompile = async (autoRun: boolean = true, customCode?: string, customLang?: SupportedLanguage) => {
    setIsCompiling(true);
    const codeToCompile = customCode !== undefined ? customCode : code;
    const currentOpts = {
      ...options,
      language: customLang || selectedLang,
    };

    const res = await compileDosSource(codeToCompile, currentOpts, activePatchesCount);
    setBuildResult(res);
    setIsCompiling(false);

    if (autoRun && res.success) {
      setIsDosRunning(true);
      setActiveOutputTab('screen');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const lines = code.substring(0, pos).split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  const handleDownloadExecutable = () => {
    if (!buildResult) return;
    const dummyContent = `MZ_DOSBOX_BINARY_HEADER\r\nTarget: ${selectedLang.toUpperCase()}\r\nExecuted with DOSBox Staging\r\n`;
    const blob = new Blob([dummyContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildResult.executableName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'borland-blue':
        return 'bg-[#000080] text-[#ffff55] selection:bg-[#00aaaa] selection:text-white';
      case 'amber-crt':
        return 'bg-[#150f00] text-[#f59e0b] selection:bg-[#78350f] selection:text-[#fef3c7]';
      case 'matrix-green':
        return 'bg-[#021405] text-[#22c55e] selection:bg-[#14532d] selection:text-[#86efac]';
      default:
        return 'bg-slate-950 text-slate-100 selection:bg-amber-500/20 selection:text-amber-200';
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="space-y-4">
      {/* Top Studio Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        {/* Language selector & Presets */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedLang('c')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedLang === 'c' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C (Watcom / DJGPP)
            </button>
            <button
              onClick={() => setSelectedLang('cpp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedLang === 'cpp' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C++ (Modern C++20)
            </button>
            <button
              onClick={() => setSelectedLang('csharp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedLang === 'csharp' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              C# (bflat Native AOT)
            </button>
          </div>

          {/* Quick template loader */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-xs font-mono">Demo:</span>
            <select
              onChange={(e) => {
                const found = CODE_TEMPLATES.find((t) => t.id === e.target.value);
                if (found) handleTemplateSelect(found);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 py-1.5 px-2.5 focus:outline-none focus:border-amber-500"
            >
              {CODE_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary Compiler Action Buttons */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => handleCompile(true)}
            disabled={isCompiling}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Compile & Run</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleCompile(false)}
            disabled={isCompiling}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Build Only</span>
          </button>

          {buildResult?.success && (
            <button
              onClick={handleDownloadExecutable}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-emerald-300 text-xs font-medium rounded-lg transition-colors"
              title="Download compiled DOS binary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{buildResult.executableName}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Code Editor Workspace */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {/* Editor Sub-header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={currentFilename}
                onChange={(e) => setCurrentFilename(e.target.value)}
                className="bg-transparent border-none text-xs font-mono font-semibold text-slate-200 w-28 focus:outline-none focus:underline"
              />
              <span className="text-slate-600 font-mono">·</span>
              <span className="text-slate-500 font-mono text-[11px]">{lineCount} lines</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                title="Find text in editor"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* Theme toggle */}
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as EditorTheme)}
                className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-0.5 focus:outline-none"
              >
                <option value="slate-modern">Slate Dark</option>
                <option value="borland-blue">Borland IDE</option>
                <option value="amber-crt">Amber CRT</option>
                <option value="matrix-green">Phosphor Green</option>
              </select>
            </div>
          </div>

          {/* Find Toolbar */}
          {showSearch && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-xs">
              <span className="text-slate-500 text-[11px] font-mono">Find:</span>
              <input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-xs text-slate-100 flex-1 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 font-mono">
                {searchQuery
                  ? `${(code.match(new RegExp(searchQuery, 'gi')) || []).length} matches`
                  : ''}
              </span>
            </div>
          )}

          {/* Code Textarea & Gutter */}
          <div className="relative flex-1 flex overflow-hidden min-h-[460px]">
            {/* Line numbers gutter */}
            <div className="w-10 select-none py-3 text-right pr-2 text-slate-600 font-mono text-xs bg-slate-950/90 border-r border-slate-800/80 leading-relaxed overflow-hidden">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="tabular-nums">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Editable code area */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              spellCheck={false}
              className={`flex-1 p-3 font-mono text-xs leading-relaxed resize-none focus:outline-none overflow-auto whitespace-pre ${getThemeClass()}`}
            />
          </div>

          {/* Editor status footer */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-3">
              <span>
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span>·</span>
              <span>{code.length} chars</span>
              <span>·</span>
              <span>UTF-8 / CRLF</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-400">
                {selectedLang === 'c'
                  ? 'Watcom C99'
                  : selectedLang === 'cpp'
                  ? 'DJGPP C++20'
                  : 'bflat C# 10'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive DOS Screen & Build Pipeline */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Output Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveOutputTab('screen')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                activeOutputTab === 'screen'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DOS Screen
            </button>
            <button
              onClick={() => setActiveOutputTab('logs')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                activeOutputTab === 'logs'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Build Logs
            </button>
            <button
              onClick={() => setActiveOutputTab('disasm')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                activeOutputTab === 'disasm'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              x86 Disassembly
            </button>
            <button
              onClick={() => setActiveOutputTab('memory')}
              className={`flex-1 py-1.5 font-medium rounded-md transition-colors ${
                activeOutputTab === 'memory'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Memory Map
            </button>
          </div>

          {/* Tab 1: DOS Screen */}
          {activeOutputTab === 'screen' && (
            <DosCanvas
              isRunning={isDosRunning}
              onToggleRun={() => setIsDosRunning(!isDosRunning)}
              targetMode={buildResult?.targetMode || 'vga-plasma'}
              executableName={buildResult?.executableName || 'DEMO.COM'}
            />
          )}

          {/* Tab 2: Compiler Pipeline Logs */}
          {activeOutputTab === 'logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-slate-200">Compilation Pipeline</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Exit Code: 0</span>
              </div>

              <div className="p-3 font-mono text-xs space-y-2 bg-slate-950/80 flex-1 overflow-y-auto max-h-[460px]">
                {buildResult?.logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none tabular-nums text-[11px]">
                      {log.timestamp}
                    </span>
                    <span
                      className={`${
                        log.level === 'error'
                          ? 'text-rose-400 font-bold'
                          : log.level === 'warn'
                          ? 'text-amber-400'
                          : log.level === 'success'
                          ? 'text-emerald-400 font-medium'
                          : 'text-slate-300'
                      }`}
                    >
                      {log.text}
                    </span>
                  </div>
                ))}

                {isCompiling && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Emitting machine opcodes and linking symbols...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: x86 Disassembly View */}
          {activeOutputTab === 'disasm' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
                <span className="font-semibold text-slate-200">x86 Intel Disassembly</span>
                <span className="text-slate-500 font-mono text-[11px]">
                  Entry: {buildResult?.entryPoint || 'CS:0100h'}
                </span>
              </div>

              <div className="p-3 font-mono text-xs bg-slate-950/80 flex-1 overflow-y-auto max-h-[460px] divide-y divide-slate-900">
                {buildResult?.disassembly.map((line, idx) => (
                  <div key={idx} className="py-1 flex items-baseline gap-3 text-[11px]">
                    <span className="text-slate-500 w-16 select-none tabular-nums">
                      {line.address}
                    </span>
                    <span className="text-cyan-400/90 w-24 tabular-nums">
                      {line.opcodes}
                    </span>
                    <span className="text-amber-300 font-semibold flex-1">
                      {line.instruction}
                    </span>
                    {line.comment && (
                      <span className="text-slate-500 italic text-[10px]">
                        ; {line.comment}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: DOS Conventional Memory Map */}
          {activeOutputTab === 'memory' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[380px]">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-slate-200">DOS 640 KB Memory Allocation</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Base RAM: 640 KB</span>
              </div>

              <div className="p-3 bg-slate-950/80 flex-1 overflow-y-auto max-h-[460px] space-y-2">
                {buildResult?.memoryMap.map((seg, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-900 border border-slate-800/80 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200">{seg.name}</span>
                      <span className="font-mono text-[11px] text-amber-400 tabular-nums">
                        {seg.sizeKb} KB
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{seg.range}</span>
                      <span className="capitalize text-slate-400">{seg.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{seg.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compiler Configuration Drawer / Options Card */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Compiler Flags & Architecture</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">x86 Real & Protected Mode</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-slate-400 block mb-1">Target Mode</label>
                <select
                  value={options.target}
                  onChange={(e) => setOptions({ ...options, target: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
                >
                  <option value="dos-16-real">16-bit 8086/80286 Real Mode</option>
                  <option value="dos-32-protected">32-bit DOS4GW Protected</option>
                  <option value="dosbox-x-extended">DOSBox-X DPMI Extension</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Optimization</label>
                <select
                  value={options.optLevel}
                  onChange={(e) => setOptions({ ...options, optLevel: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs"
                >
                  <option value="-O0">-O0 (Debug Symbols)</option>
                  <option value="-O1">-O1 (Basic Folding)</option>
                  <option value="-O2">-O2 (Speed & Unroll)</option>
                  <option value="-Os">-Os (Small Size .COM)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
