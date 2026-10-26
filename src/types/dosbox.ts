export type SupportedLanguage = 'c' | 'cpp' | 'csharp';

export type CompilerTarget = 
  | 'dos-16-real'      // 16-bit 8086/80286 Real Mode (.COM / .EXE)
  | 'dos-32-protected' // 32-bit Protected Mode (DOS4GW / PMODEW / DPMI)
  | 'dosbox-x-extended'; // DOSBox-X Custom Module / DPMI

export type EditorTheme = 'slate-modern' | 'borland-blue' | 'amber-crt' | 'matrix-green';

export interface CompilerOptions {
  language: SupportedLanguage;
  target: CompilerTarget;
  optLevel: '-O0' | '-O1' | '-O2' | '-Os';
  memoryModel: 'tiny' | 'small' | 'compact' | 'medium' | 'large' | 'flat';
  standard: string;
  enableSoundBlaster: boolean;
  enableVGA: boolean;
  generateDisassembly: boolean;
  cycles: number;
}

export interface BuildLogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  phase: 'preprocess' | 'syntax' | 'codegen' | 'linker' | 'package';
  text: string;
}

export interface DisassemblyLine {
  address: string;
  opcodes: string;
  instruction: string;
  comment?: string;
}

export interface MemorySegment {
  name: string;
  range: string;
  sizeKb: number;
  type: 'system' | 'code' | 'data' | 'heap' | 'stack' | 'video' | 'uma';
  description: string;
}

export interface RepoFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  language?: string;
  size: string;
  lastCommit: string;
  lastCommitMessage: string;
  content?: string;
  children?: RepoFile[];
}

export interface ContributedPatch {
  id: string;
  title: string;
  category: 'Core Patch' | 'Audio DSP' | 'Video Graphics' | 'C# AOT Runtime' | 'Peripheral' | 'Memory';
  author: string;
  authorEmail: string;
  date: string;
  status: 'merged' | 'in-review' | 'verified';
  targetFile: string;
  description: string;
  diff: string;
  stars: number;
}
