import { CompilerOptions, BuildLogMessage, DisassemblyLine, MemorySegment } from '../types/dosbox';

export interface CompilationResult {
  success: boolean;
  executableName: string;
  executableSize: string;
  format: 'COM' | 'EXE';
  logs: BuildLogMessage[];
  disassembly: DisassemblyLine[];
  memoryMap: MemorySegment[];
  entryPoint: string;
  targetMode: 'vga-plasma' | 'wireframe-3d' | 'ansi-dungeon' | 'sound-dsp';
}

export function compileDosSource(
  sourceCode: string,
  options: CompilerOptions,
  customPatchesCount: number = 0
): Promise<CompilationResult> {
  return new Promise((resolve) => {
    const logs: BuildLogMessage[] = [];
    const now = () => new Date().toISOString().substring(11, 19);

    const isC = options.language === 'c';
    const isCpp = options.language === 'cpp';
    const isCSharp = options.language === 'csharp';

    // Infer target mode from source keywords
    let targetMode: 'vga-plasma' | 'wireframe-3d' | 'ansi-dungeon' | 'sound-dsp' = 'vga-plasma';
    if (sourceCode.includes('WireframeCube') || sourceCode.includes('RotateAndProject') || isCpp) {
      targetMode = 'wireframe-3d';
    } else if (sourceCode.includes('DungeonMap') || sourceCode.includes('RenderDungeon') || isCSharp) {
      targetMode = 'ansi-dungeon';
    } else if (sourceCode.includes('play_speaker_tone') || sourceCode.includes('scale') || sourceCode.includes('PIT_COMMAND_PORT')) {
      targetMode = 'sound-dsp';
    } else {
      targetMode = 'vga-plasma';
    }

    // Step 1: Preprocessing
    const compilerName = isC 
      ? 'OpenWatcom C/C++ v1.9 (wcl)' 
      : isCpp 
        ? 'DJGPP GCC 12.2.0 (i586-pc-msdosdjgpp)' 
        : 'bflat Native AOT compiler v8.0 (-os:dos -arch:x86)';

    logs.push({
      id: 'log-1',
      timestamp: now(),
      level: 'info',
      phase: 'preprocess',
      text: `[1/5] Invoking toolchain: ${compilerName}`,
    });

    if (customPatchesCount > 0) {
      logs.push({
        id: 'log-patch',
        timestamp: now(),
        level: 'info',
        phase: 'preprocess',
        text: `[Patch Engine] Injected ${customPatchesCount} active community hardware patch(es) into build tree.`,
      });
    }

    logs.push({
      id: 'log-2',
      timestamp: now(),
      level: 'info',
      phase: 'preprocess',
      text: `Target: ${options.target.toUpperCase()} | Opt: ${options.optLevel} | Model: ${options.memoryModel.toUpperCase()}`,
    });

    // Step 2: Syntax & Parsing
    const hasMain = sourceCode.includes('main') || sourceCode.includes('Main');
    if (!hasMain) {
      logs.push({
        id: 'log-err',
        timestamp: now(),
        level: 'error',
        phase: 'syntax',
        text: `fatal error: entry point 'main' not found in translation unit`,
      });
      resolve({
        success: false,
        executableName: 'ERROR.BIN',
        executableSize: '0 KB',
        format: 'EXE',
        logs,
        disassembly: [],
        memoryMap: [],
        entryPoint: '0000:0000',
        targetMode,
      });
      return;
    }

    logs.push({
      id: 'log-3',
      timestamp: now(),
      level: 'info',
      phase: 'syntax',
      text: `[2/5] AST parsed: 0 warnings, 0 syntax errors. Dialect: ${options.standard}`,
    });

    // Step 3: Codegen & Disassembly
    logs.push({
      id: 'log-4',
      timestamp: now(),
      level: 'info',
      phase: 'codegen',
      text: `[3/5] Emitting x86 assembly instructions & register allocation...`,
    });

    const isCom = options.memoryModel === 'tiny' || (isC && !sourceCode.includes('std::'));
    const format = isCom ? 'COM' : 'EXE';
    const exeName = isCom ? 'PROGRAM.COM' : 'PROGRAM.EXE';

    // Generate authentic x86 disassembly
    const disassembly: DisassemblyLine[] = [];
    if (isCom) {
      disassembly.push(
        { address: '0100', opcodes: 'EB 0A', instruction: 'JMP SHORT 010Ch', comment: 'Skip MZ header / jump past PSP' },
        { address: '0102', opcodes: '50 53 50', instruction: 'DB "PSP_DOSBOX"', comment: 'Signature' },
        { address: '010C', opcodes: 'B8 00 A0', instruction: 'MOV AX, 0A000h', comment: 'Load VGA Mode 13h Segment 0xA000' },
        { address: '010F', opcodes: '8E C0', instruction: 'MOV ES, AX', comment: 'ES = Video RAM Buffer' },
        { address: '0111', opcodes: '31 FF', instruction: 'XOR DI, DI', comment: 'Offset 0 (pixel 0,0)' },
        { address: '0113', opcodes: 'B8 13 00', instruction: 'MOV AX, 0013h', comment: 'AH=0 (Set Mode), AL=13h (320x200 256c)' },
        { address: '0116', opcodes: 'CD 10', instruction: 'INT 10h', comment: 'BIOS Video Interrupt' },
        { address: '0118', opcodes: 'BA DA 03', instruction: 'MOV DX, 03DAh', comment: 'VGA Status Register 1' },
        { address: '011B', opcodes: 'EC', instruction: 'IN AL, DX', comment: 'Wait for vertical retrace' },
        { address: '011C', opcodes: 'A8 08', instruction: 'TEST AL, 08h', comment: 'Check VSYNC flag' },
        { address: '011E', opcodes: '74 FB', instruction: 'JZ 011Bh', comment: 'Spin until beam retrace starts' },
        { address: '0120', opcodes: 'B8 00 4C', instruction: 'MOV AX, 4C00h', comment: 'AH=4Ch (DOS Terminate), AL=0 (Exit code)' },
        { address: '0123', opcodes: 'CD 21', instruction: 'INT 21h', comment: 'DOS System Call' }
      );
    } else {
      disassembly.push(
        { address: '0000:0000', opcodes: '4D 5A 90 00', instruction: 'DB "MZ"', comment: 'DOS Executable Signature' },
        { address: '1000:0000', opcodes: '8C C8', instruction: 'MOV AX, CS', comment: 'Initialize Code Segment' },
        { address: '1000:0002', opcodes: '8E D8', instruction: 'MOV DS, AX', comment: 'DS = CS' },
        { address: '1000:0004', opcodes: 'BC 00 20', instruction: 'MOV SP, 2000h', comment: 'Setup 8KB Stack' },
        { address: '1000:0007', opcodes: 'E8 20 00', instruction: 'CALL _main', comment: 'Call application entry' },
        { address: '1000:000A', opcodes: 'B4 4C', instruction: 'MOV AH, 4Ch', comment: 'Terminate process' },
        { address: '1000:000C', opcodes: 'CD 21', instruction: 'INT 21h', comment: 'DOS Dispatcher' }
      );
    }

    // Step 4: Linker & Memory mapping
    logs.push({
      id: 'log-5',
      timestamp: now(),
      level: 'info',
      phase: 'linker',
      text: `[4/5] Linker resolved symbols. Aligning segments to paragraph boundaries (16 bytes).`,
    });

    const memoryMap: MemorySegment[] = [
      { name: 'IVT (Interrupt Vector Table)', range: '0000:0000 - 0000:03FF', sizeKb: 1, type: 'system', description: '256 x 4-byte real-mode interrupt vectors (INT 00h - FFh)' },
      { name: 'BIOS Data Area (BDA)', range: '0040:0000 - 0040:00FF', sizeKb: 0.25, type: 'system', description: 'Hardware timers, keyboard buffer, COM/LPT port base addresses' },
      { name: 'DOS Kernel & System Drivers', range: '0050:0000 - 01FF:FFFF', sizeKb: 64, type: 'system', description: 'IO.SYS, MSDOS.SYS, and config.sys device drivers' },
      { name: 'Program Segment Prefix (PSP)', range: '0200:0000 - 0200:00FF', sizeKb: 0.25, type: 'system', description: '256-byte DOS process header, command-line arguments, FCBs' },
      { name: '.TEXT (Executable Code)', range: '0210:0000 - 0280:FFFF', sizeKb: isCom ? 4.2 : 18.6, type: 'code', description: 'Compiled x86 machine instructions & functions' },
      { name: '.DATA & .BSS (Globals / Static)', range: '0290:0000 - 02B0:FFFF', sizeKb: 8.4, type: 'data', description: 'Palette tables, sine lookup arrays, initialized strings' },
      { name: 'Heap & Dynamic Allocator', range: '02C0:0000 - 0400:0000', sizeKb: 128, type: 'heap', description: 'malloc() / new / managed C# object allocation area' },
      { name: 'Program Stack', range: '0400:0000 - 0400:1FFF', sizeKb: 8, type: 'stack', description: 'Downwards growing stack segment (SS:SP)' },
      { name: 'Free Conventional Memory', range: '0400:2000 - 9FFF:FFFF', sizeKb: 405.5, type: 'heap', description: 'Available conventional RAM for DOS applications' },
      { name: 'VGA Framebuffer (Mode 13h)', range: 'A000:0000 - A000:FFFF', sizeKb: 64, type: 'video', description: '320x200x256 Video RAM direct memory window' },
      { name: 'Upper Memory Area (UMA / ROM)', range: 'C000:0000 - FFFF:FFFF', sizeKb: 256, type: 'uma', description: 'VGA BIOS, Sound Blaster OPL3 DSP, System BIOS ROM' },
    ];

    // Step 5: Packaging
    const exeSize = isCom ? '3.8 KB (3,892 bytes)' : '16.4 KB (16,794 bytes)';
    logs.push({
      id: 'log-6',
      timestamp: now(),
      level: 'success',
      phase: 'package',
      text: `[5/5] Build SUCCESSFUL: Output ${exeName} (${exeSize}) created. Ready to launch in DOSBox.`,
    });

    setTimeout(() => {
      resolve({
        success: true,
        executableName: exeName,
        executableSize: exeSize,
        format,
        logs,
        disassembly,
        memoryMap,
        entryPoint: isCom ? 'CS:0100h' : '1000:0000h',
        targetMode,
      });
    }, 450);
  });
}
