import React, { useState } from 'react';
import { BookOpen, Terminal, Cpu, FileCode, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { SyntaxHighlight } from '../utils/syntaxHighlight';

export function DocumentationView() {
  const [activeGuide, setActiveGuide] = useState<'c-guide' | 'cpp-guide' | 'csharp-guide' | 'interrupts' | 'architecture'>('c-guide');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Guide Navigation */}
      <div className="lg:col-span-3 space-y-1 bg-slate-900 border border-slate-800 rounded-xl p-3 h-fit">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Guides & References
        </div>

        <button
          onClick={() => setActiveGuide('c-guide')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
            activeGuide === 'c-guide'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>Compiling C in DOSBox</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        <button
          onClick={() => setActiveGuide('cpp-guide')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
            activeGuide === 'cpp-guide'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>Modern C++ for DOS</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        <button
          onClick={() => setActiveGuide('csharp-guide')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
            activeGuide === 'csharp-guide'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>C# Native AOT for DOS</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        <button
          onClick={() => setActiveGuide('interrupts')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
            activeGuide === 'interrupts'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>DOS Interrupts Table</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>

        <button
          onClick={() => setActiveGuide('architecture')}
          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
            activeGuide === 'architecture'
              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <span>Memory & Architecture</span>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        </button>
      </div>

      {/* Main Documentation Body */}
      <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Guide 1: C */}
        {activeGuide === 'c-guide' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-amber-400" />
              <span>Compiling C Programs for DOSBox</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              OpenWatcom C and DJGPP GCC are the industry standards for generating authentic 16-bit real-mode binaries (.COM/.EXE) and 32-bit protected-mode programs with DOS4GW or PMODEW extenders.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-amber-400">OpenWatcom Command Line:</span>
                <button
                  onClick={() => handleCopyCode('wcl', 'wcl -0 -ms -ox -zp1 plasma.c')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {copiedSection === 'wcl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'wcl' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded">
                wcl -0 -ms -ox -zp1 plasma.c
              </pre>
              <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside pt-1">
                <li><code className="text-amber-300 font-mono">-0</code>: Target 8086/8088 CPU instruction set.</li>
                <li><code className="text-amber-300 font-mono">-ms</code>: Small memory model (single code & data segment).</li>
                <li><code className="text-amber-300 font-mono">-ox</code>: Maximum speed optimizations with register variables.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Guide 2: C++ */}
        {activeGuide === 'cpp-guide' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>Modern C++ on Retro DOS Hardware</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              With DJGPP GCC 12+, developers can write modern C++20 code (classes, lambdas, constexpr lookup tables, structured binding) and compile directly to 32-bit protected-mode DOS executables with zero runtime penalty.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-amber-400">DJGPP GCC C++20 Compile Command:</span>
                <button
                  onClick={() => handleCopyCode('djgpp', 'gxx -std=c++20 -O2 -fno-rtti -fno-exceptions -march=i386 cube3d.cpp -o CUBE3D.EXE')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {copiedSection === 'djgpp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'djgpp' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded overflow-x-auto">
                gxx -std=c++20 -O2 -fno-rtti -fno-exceptions -march=i386 cube3d.cpp -o CUBE3D.EXE
              </pre>
            </div>
          </div>
        )}

        {/* Guide 3: C# */}
        {activeGuide === 'csharp-guide' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <span>C# Native Ahead-of-Time (AOT) for DOS</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Using the <span className="text-amber-400 font-semibold">bflat</span> Ahead-of-Time compiler with Cosmopolitan libc, modern C# 10/11 compiles into standalone bare-metal x86 DOS binaries without requiring the .NET CLR installed on the host.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-amber-400">bflat DOS Target Command:</span>
                <button
                  onClick={() => handleCopyCode('bflat', 'bflat build --os:dos --arch:x86 --no-reflection --no-stacktrace -o DUNGEON.EXE dungeon.cs')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {copiedSection === 'bflat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSection === 'bflat' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded overflow-x-auto">
                bflat build --os:dos --arch:x86 --no-reflection --no-stacktrace -o DUNGEON.EXE dungeon.cs
              </pre>
            </div>
          </div>
        )}

        {/* Guide 4: Interrupts Table */}
        {activeGuide === 'interrupts' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">
              Essential DOS & BIOS Interrupt Reference
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-800">
                <thead className="bg-slate-950 text-slate-300 font-mono">
                  <tr>
                    <th className="p-2.5 border-b border-slate-800">Interrupt</th>
                    <th className="p-2.5 border-b border-slate-800">Function (AH)</th>
                    <th className="p-2.5 border-b border-slate-800">Description</th>
                    <th className="p-2.5 border-b border-slate-800">Registers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
                  <tr>
                    <td className="p-2 text-amber-400 font-bold">INT 10h</td>
                    <td className="p-2">AH = 00h</td>
                    <td className="p-2 font-sans">Set Video Display Mode (Mode 13h = 320x200 256c)</td>
                    <td className="p-2">AL = 13h</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-amber-400 font-bold">INT 10h</td>
                    <td className="p-2">AH = 0Ch</td>
                    <td className="p-2 font-sans">Write Graphics Pixel to Screen</td>
                    <td className="p-2">AL = Color, CX = X, DX = Y</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-amber-400 font-bold">INT 21h</td>
                    <td className="p-2">AH = 09h</td>
                    <td className="p-2 font-sans">Print '$'-terminated string to standard output</td>
                    <td className="p-2">DS:DX = Pointer</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-amber-400 font-bold">INT 21h</td>
                    <td className="p-2">AH = 4Ch</td>
                    <td className="p-2 font-sans">Terminate Process with Return Code</td>
                    <td className="p-2">AL = Return Code</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-amber-400 font-bold">INT 33h</td>
                    <td className="p-2">AX = 0000h</td>
                    <td className="p-2 font-sans">Reset Mouse Driver & Query Button Count</td>
                    <td className="p-2">AX = Status, BX = Buttons</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Guide 5: Architecture */}
        {activeGuide === 'architecture' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">
              DOS 1 Megabyte Physical Memory Map
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Standard 8086/80286 real-mode CPU addressing consists of 20 physical address lines allowing 1,048,576 bytes (1 MB) of memory. Conventional memory resides between <code className="text-amber-300 font-mono">0000:0000</code> and <code className="text-amber-300 font-mono">9FFF:FFFF</code> (640 KB).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-semibold text-emerald-400 block mb-1">0xA0000 (VGA VRAM)</span>
                <p className="text-slate-400 text-[11px]">
                  Mode 13h video buffer. Write linear bytes at 0xA000:0000 to instantly render pixels on screen.
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-semibold text-amber-400 block mb-1">0x00000 (IVT Table)</span>
                <p className="text-slate-400 text-[11px]">
                  First 1024 bytes holding 256 Far Pointers (Segment:Offset) to system interrupt handlers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
