import { RepoFile, ContributedPatch } from '../types/dosbox';

export const REPO_METADATA = {
  owner: 'adheeexe',
  name: 'dosbox-compiler-suite',
  fullName: 'adheeexe/dosbox-compiler-suite',
  defaultBranch: 'main',
  branches: ['main', 'dev-csharp-aot', 'feature-voodoo-glide', 'patch-sb16-dma'],
  stars: 1428,
  forks: 389,
  watchers: 94,
  license: 'GPL-2.0 & MIT',
  releaseTag: 'v2.4.0-dosbox-unified',
  commitCount: 284,
  pullRequestsCount: 12,
  description: 'Clean modern compiler suite & cross-build toolkit for compiling C, C++, and C# into DOSBox 16-bit / 32-bit executables, featuring modular sound, graphics, and custom patch injection.',
};

export const INITIAL_PATCHES: ContributedPatch[] = [
  {
    id: 'patch-0001',
    title: 'Fix VGA Mode 13h Double Buffering and VSYNC Race Condition',
    category: 'Video Graphics',
    author: 'adheeexe',
    authorEmail: '7e.adithyan@gmail.com',
    date: '2026-10-21',
    status: 'merged',
    targetFile: 'src/vga_render.c',
    description: 'Eliminates tearing and CRT raster flicker during port 0x3DA status register polling in Mode 13h 320x200 256-color double-buffered render pipelines.',
    diff: `--- a/src/vga_render.c
+++ b/src/vga_render.c
@@ -84,11 +84,16 @@ void vga_wait_vsync(void) {
-    /* Busy loop on bit 3 */
-    while ((inportb(0x3DA) & 0x08) == 0);
+    /* Wait for end of current retrace if already in progress */
+    while ((inportb(0x3DA) & 0x08) != 0);
+    /* Now wait for start of next vertical retrace period */
+    while ((inportb(0x3DA) & 0x08) == 0);
+    vga_state.frame_counter++;
 }`,
    stars: 87,
  },
  {
    id: 'patch-0002',
    title: 'Sound Blaster 16 High-Speed DMA Double Buffer Underrun Guard',
    category: 'Audio DSP',
    author: 'retro_audiophile',
    authorEmail: 'dsp@chiptune-lab.org',
    date: '2026-10-18',
    status: 'verified',
    targetFile: 'src/sb16_dsp.c',
    description: 'Implements circular DMA ring buffers on Channel 1 and Channel 5 to prevent audio clicks and buffer starvation under high CPU cycles.',
    diff: `--- a/src/sb16_dsp.c
+++ b/src/sb16_dsp.c
@@ -142,6 +142,12 @@ void sb16_handle_dma_interrupt(uint8_t irq) {
+    if (dsp.ring_head == dsp.ring_tail) {
+        /* Underflow mitigation: repeat last valid PCM sample */
+        dsp.last_pcm_sample = dsp.history_buffer[dsp.ring_tail];
+        dsp.underflow_events++;
+    }
+    outportb(0x20, 0x20); /* Send EOI to master PIC */
 }`,
    stars: 64,
  },
  {
    id: 'patch-0003',
    title: 'Native AOT C# Runtime Stub for 16-bit Real Mode Memory Segmenting',
    category: 'C# AOT Runtime',
    author: 'dotnet_hacker',
    authorEmail: 'dev@bflat-dos.io',
    date: '2026-10-14',
    status: 'merged',
    targetFile: 'modules/csharp_dos_runtime.cs',
    description: 'Adds bflat zero-overhead C# runtime bindings for DOS interrupts, allowing managed C# struct pointers to map directly into 0xA000:0000 VGA framebuffers.',
    diff: `--- a/modules/csharp_dos_runtime.cs
+++ b/modules/csharp_dos_runtime.cs
@@ -45,6 +45,15 @@ public static unsafe class DosHost {
+    [System.Runtime.CompilerServices.MethodImpl(System.Runtime.CompilerServices.MethodImplOptions.AggressiveInlining)]
+    public static byte* GetVgaFramebuffer() {
+        // Segment 0xA000 converted to linear 32-bit address for protected mode or far pointer
+        return (byte*)0x000A0000;
+    }
+    public static void TriggerInterrupt(byte intNum, ref DosRegisters regs) {
+        InlineAsm.Emit("int " + intNum);
+    }
 }`,
    stars: 142,
  },
  {
    id: 'patch-0004',
    title: 'Yamaha OPL3 4-Operator FM Synthesis Polyphony Expansion',
    category: 'Peripheral',
    author: 'adheeexe',
    authorEmail: '7e.adithyan@gmail.com',
    date: '2026-10-09',
    status: 'verified',
    targetFile: 'modules/opl3_yamaha.cpp',
    description: 'Expands custom DOSBox synth pipeline with true 18-channel OPL3 emulation and AdLib Gold surround stereophony.',
    diff: `--- a/modules/opl3_yamaha.cpp
+++ b/modules/opl3_yamaha.cpp
@@ -98,7 +98,11 @@ void OPL3Synthesizer::WriteRegister(uint16_t port, uint8_t val) {
+    if (port == 0x388 || port == 0x220) {
+        bank0[selected_reg] = val;
+    } else if (port == 0x38A || port == 0x222) {
+        bank1[selected_reg] = val; // OPL3 Secondary Register Bank
+    }
 }`,
    stars: 53,
  },
];

export const REPO_FILES: RepoFile[] = [
  {
    path: 'README.md',
    name: 'README.md',
    type: 'file',
    language: 'markdown',
    size: '4.8 KB',
    lastCommit: '2 days ago',
    lastCommitMessage: 'docs: update C# AOT and Watcom C++ toolchain guides',
    content: `# DOSBox Compiler Suite (C / C++ / C#)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License: GPL-2.0](https://img.shields.io/badge/License-GPL--2.0-blue.svg)](#)
[![Target: DOS 8086/80386](https://img.shields.io/badge/DOS-16--bit%20%2F%2032--bit-amber)](#)

A high-performance, developer-first compilation suite designed for writing, compiling, and running **C**, **C++**, and **C#** programs on DOSBox and retro x86 hardware.

## ✨ Features
- **Multi-Language Support**:
  - **C**: OpenWatcom C99 / DJGPP real-mode and protected-mode 32-bit DOS4GW.
  - **C++**: Modern C++17/C++20 for DOS with zero-cost abstractions and custom hardware OOP modules.
  - **C#**: Native AOT Ahead-of-Time compilation for DOS via bflat / Cosmopolitan libc and bare-metal runtime stubs.
- **VGA Graphics & Audio**: Direct memory access to \`0xA000:0000\` (Mode 13h 320x200), Sound Blaster 16 DSP, and Yamaha OPL3 FM synthesis.
- **Interactive Emulator**: Run and debug executables directly on the in-browser canvas with PC speaker sound and CRT scanline filter.
- **Modular Architecture**: Pluggable community modules and \`.patch\` submission pipeline.

## 🚀 Quick Clone
\`\`\`bash
# Clone the repository
git clone https://github.com/adheeexe/dosbox-compiler-suite.git

# Navigate into workspace
cd dosbox-compiler-suite

# Compile with Watcom / DJGPP / bflat
make target=c_plasma
dosbox bin/plasma.com
\`\`\`

## 📦 Project Structure
- \`src/\`: Core x86 emulation helpers, interrupt dispatcher, and VGA driver.
- \`modules/\`: Hardware expansion modules (OPL3, Sound Blaster 16, Voodoo Glide, C# DOS runtime).
- \`patches/\`: Community patch submissions and diffs.
- \`examples/\`: Ready-to-compile sample code in C, C++, and C#.
- \`dosbox.conf\`: Standardized DOSBox staging configuration.

## 🤝 Contributing Custom Modules & Patches
1. Fork or clone this repository.
2. Create your feature branch (\`git checkout -b feature/my-cool-module\`).
3. Create your module in \`modules/\` or generate a unified diff (\`git diff > my_patch.patch\`).
4. Test using the online **DOSBox Compiler Studio**.
5. Submit via the **Contributor Hub** tab or GitHub Pull Request!
`,
  },
  {
    path: 'CONTRIBUTING.md',
    name: 'CONTRIBUTING.md',
    type: 'file',
    language: 'markdown',
    size: '3.1 KB',
    lastCommit: '4 days ago',
    lastCommitMessage: 'chore: add CLA guidelines and patch conventions',
    content: `# Contributing to DOSBox Compiler Suite

Thank you for contributing to the DOSBox Compiler Suite! We welcome custom hardware modules, compiler optimizations, bug fixes, and sample programs for C, C++, and C#.

## Code Guidelines
- **Pure C**: Adhere to ANSI C (C89/C99) or Watcom extensions. Avoid compiler-specific non-standard macros unless wrapped in \`#ifdef __WATCOMC__\`.
- **C++**: Strive for minimal runtime overhead. Prefer stack allocation and fixed-point math over heavy dynamic heap allocations in 16-bit real mode.
- **C#**: Use \`unsafe\` pointer operations when interfacing with VGA video buffers or DOS interrupt structs. Ensure zero garbage-collection latency on time-critical render loops.

## Patch Formatting
All patches should be submitted in unified diff format (\`diff -u\`).
Example:
\`\`\`diff
--- a/src/vga_render.c
+++ b/src/vga_render.c
@@ -20,4 +20,6 @@
+    // My enhancement
\`\`\`

## Contributor Agreement
By submitting code or patches, you certify that you have the right to license your contribution under the repository's open source license (GPL-2.0 / MIT dual compatibility).
`,
  },
  {
    path: 'LICENSE',
    name: 'LICENSE',
    type: 'file',
    language: 'text',
    size: '18 KB',
    lastCommit: '1 month ago',
    lastCommitMessage: 'legal: initialize GPL-2.0 and MIT open source license',
    content: `GNU GENERAL PUBLIC LICENSE
Version 2, June 1991

Copyright (C) 2026 DOSBox Compiler Suite Contributors

Everyone is permitted to copy and distribute verbatim copies
of this license document, but changing it is not allowed.

Preamble
The licenses for most software are designed to take away your
freedom to share and change it. By contrast, the GNU General Public
License is intended to guarantee your freedom to share and change free
software--to make sure the software is free for all its users.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
`,
  },
  {
    path: 'dosbox.conf',
    name: 'dosbox.conf',
    type: 'file',
    language: 'ini',
    size: '2.4 KB',
    lastCommit: '3 days ago',
    lastCommitMessage: 'conf: configure optimal SB16 irq7 dma1 and vga 320x200',
    content: `[sdl]
fullscreen=false
fulldouble=false
fullresolution=original
windowresolution=1280x800
output=opengl
autolock=true
sensitivity=100
waitonerror=true

[dosbox]
language=
machine=svga_s3
captures=capture
memsize=32

[render]
frameskip=0
aspect=true
scaler=normal2x

[cpu]
core=dynamic
cputype=auto
cycles=3000
cycleup=500
cycledown=500

[mixer]
nosound=false
rate=44100
blocksize=1024
prebuffer=20

[midi]
mpu401=intelligent
mididevice=default

[sblaster]
sbtype=sb16
sbbase=220
irq=7
dma=1
hdma=5
sbmixer=true
oplmode=opl3
oplemu=default
oplrate=44100

[autoexec]
# Lines in this section will be run at startup.
MOUNT C ./BIN
C:
@echo off
cls
echo DOSBox Compiler Suite v2.4 initialized.
echo Type demo.exe to run compiled output.
`,
  },
  {
    path: 'src',
    name: 'src',
    type: 'dir',
    size: '5 files',
    lastCommit: '1 day ago',
    lastCommitMessage: 'refactor: modularize interrupt vectors and VGA timing',
    children: [
      {
        path: 'src/main.cpp',
        name: 'main.cpp',
        type: 'file',
        language: 'cpp',
        size: '5.2 KB',
        lastCommit: '1 day ago',
        lastCommitMessage: 'refactor: modularize interrupt vectors and VGA timing',
        content: `/**
 * DOSBox Compiler Suite - Entry Bootstrap
 * Copyright (C) 2026 adheeexe
 * Licensed under GPL-2.0
 */

#include <iostream>
#include <cstdint>
#include <vector>

class DosboxEnvironment {
public:
    DosboxEnvironment() : cpu_cycles(3000), memory_kb(640) {}

    void InitializeSubsystems() {
        std::cout << "[DOSBox Init] Booting Virtual x86 80386 Processor..." << std::endl;
        std::cout << "[DOSBox Init] Conventional Memory: " << memory_kb << " KB OK" << std::endl;
        std::cout << "[DOSBox Init] Setting up Interrupt Vector Table (IVT)..." << std::endl;
        std::cout << "[DOSBox Init] Sound Blaster 16 mapped to Port 0x220, IRQ 7, DMA 1" << std::endl;
        std::cout << "[DOSBox Init] VGA 256-color DAC ready at Port 0x3C8" << std::endl;
    }

    void ExecuteBinary(const std::string& binary_name) {
        std::cout << "[DOSBox Exec] Loading " << binary_name << " into CS:0100h..." << std::endl;
    }

private:
    uint32_t cpu_cycles;
    uint32_t memory_kb;
};

int main(int argc, char* argv[]) {
    DosboxEnvironment env;
    env.InitializeSubsystems();
    env.ExecuteBinary("DEMO.EXE");
    return 0;
}
`,
      },
      {
        path: 'src/vga_render.c',
        name: 'vga_render.c',
        type: 'file',
        language: 'c',
        size: '6.4 KB',
        lastCommit: '2 days ago',
        lastCommitMessage: 'fix: double buffering race in vga_wait_vsync',
        content: `/**
 * VGA Mode 13h Hardware Controller
 * Direct Framebuffer access at 0xA000:0000 (320x200x256)
 */

#include <stdint.h>

#define VGA_SCREEN_WIDTH  320
#define VGA_SCREEN_HEIGHT 200
#define VGA_VRAM_SEGMENT  0xA0000000L

static uint8_t far* VGA_VRAM = (uint8_t far*)0xA0000000L;

/* Enter 320x200 256-color Mode 13h */
void vga_set_mode_13h(void) {
    /* BIOS interrupt 10h, AH=0x00, AL=0x13 */
    #if defined(__WATCOMC__) || defined(__BORLANDC__)
    union REGS regs;
    regs.h.ah = 0x00;
    regs.h.al = 0x13;
    int86(0x10, &regs, &regs);
    #endif
}

/* Return to standard 80x25 text mode */
void vga_restore_text_mode(void) {
    #if defined(__WATCOMC__) || defined(__BORLANDC__)
    union REGS regs;
    regs.h.ah = 0x00;
    regs.h.al = 0x03;
    int86(0x10, &regs, &regs);
    #endif
}

/* Set single palette index RGB (0..63 per component) */
void vga_set_palette(uint8_t index, uint8_t r, uint8_t g, uint8_t b) {
    outportb(0x3C8, index);
    outportb(0x3C9, r);
    outportb(0x3C9, g);
    outportb(0x3C9, b);
}

/* Wait for vertical retrace to prevent tearing */
void vga_wait_vsync(void) {
    while ((inportb(0x3DA) & 0x08) != 0);
    while ((inportb(0x3DA) & 0x08) == 0);
}

/* Blit linear buffer to video memory */
void vga_blit(const uint8_t* backbuffer) {
    uint16_t i;
    for (i = 0; i < VGA_SCREEN_WIDTH * VGA_SCREEN_HEIGHT; ++i) {
        VGA_VRAM[i] = backbuffer[i];
    }
}
`,
      },
      {
        path: 'src/sb16_dsp.c',
        name: 'sb16_dsp.c',
        type: 'file',
        language: 'c',
        size: '4.9 KB',
        lastCommit: '3 days ago',
        lastCommitMessage: 'feat: add 8-bit mono DSP output stream',
        content: `/**
 * Sound Blaster 16 DSP Driver
 * Base Port 0x220, IRQ 7, DMA 1
 */

#include <stdint.h>

#define DSP_PORT_RESET  0x226
#define DSP_PORT_READ   0x22A
#define DSP_PORT_WRITE  0x22C
#define DSP_PORT_STATUS 0x22E

int sb16_reset_dsp(void) {
    uint16_t timeout;
    outportb(DSP_PORT_RESET, 1);
    delay_microseconds(10);
    outportb(DSP_PORT_RESET, 0);

    for (timeout = 0; timeout < 1000; timeout++) {
        if (inportb(DSP_PORT_STATUS) & 0x80) {
            if (inportb(DSP_PORT_READ) == 0xAA) {
                return 1; /* DSP Success */
            }
        }
    }
    return 0; /* Reset Failed */
}

void sb16_write_dsp(uint8_t command) {
    while (inportb(DSP_PORT_WRITE) & 0x80);
    outportb(DSP_PORT_WRITE, command);
}

void sb16_play_tone(uint16_t freq_hz, uint16_t duration_ms) {
    /* PC speaker backup if DSP busy */
    uint16_t div = 1193180 / freq_hz;
    outportb(0x43, 0xB6);
    outportb(0x42, (uint8_t)(div & 0xFF));
    outportb(0x42, (uint8_t)(div >> 8));
    outportb(0x61, inportb(0x61) | 0x03);
}
`,
      },
      {
        path: 'src/dos_int21.c',
        name: 'dos_int21.c',
        type: 'file',
        language: 'c',
        size: '3.7 KB',
        lastCommit: '5 days ago',
        lastCommitMessage: 'feat: implement handle-based file I/O for DOS 2.0+',
        content: `/**
 * MS-DOS Interrupt 21h System Services
 */

#include <stdint.h>

/* DOS Print String (AH = 0x09, terminated by '$') */
void dos_print_string(const char* str) {
    #if defined(__WATCOMC__) || defined(__BORLANDC__)
    union REGS regs;
    struct SREGS sregs;
    regs.h.ah = 0x09;
    regs.x.dx = (uint16_t)str;
    int86(0x21, &regs, &regs);
    #endif
}

/* DOS Terminate Program with Return Code (AH = 0x4C) */
void dos_exit(uint8_t exit_code) {
    #if defined(__WATCOMC__) || defined(__BORLANDC__)
    union REGS regs;
    regs.h.ah = 0x4C;
    regs.h.al = exit_code;
    int86(0x21, &regs, &regs);
    #endif
}
`,
      },
      {
        path: 'src/cpu_core.c',
        name: 'cpu_core.c',
        type: 'file',
        language: 'c',
        size: '5.8 KB',
        lastCommit: '6 days ago',
        lastCommitMessage: 'core: improve x86 real-mode segment:offset translation',
        content: `/**
 * x86 CPU Real Mode & Protected Mode Address Translator
 */

#include <stdint.h>

typedef struct {
    uint16_t ax, bx, cx, dx;
    uint16_t si, di, bp, sp;
    uint16_t cs, ds, ss, es, fs, gs;
    uint16_t ip;
    uint16_t flags;
} x86_registers_t;

/* Translate 16-bit Segment:Offset to 20-bit Linear Physical Address */
uint32_t x86_real_mode_to_linear(uint16_t segment, uint16_t offset) {
    return ((uint32_t)segment << 4) + offset;
}
`,
      },
    ],
  },
  {
    path: 'modules',
    name: 'modules',
    type: 'dir',
    size: '5 files',
    lastCommit: '2 days ago',
    lastCommitMessage: 'feat: add OPL3 and C# native AOT runtime bindings',
    children: [
      {
        path: 'modules/csharp_dos_runtime.cs',
        name: 'csharp_dos_runtime.cs',
        type: 'file',
        language: 'csharp',
        size: '6.8 KB',
        lastCommit: '2 days ago',
        lastCommitMessage: 'feat: add zero-allocation C# DOS runtime stub',
        content: `// =========================================================================
// C# Native AOT DOS Runtime Interface (bflat / Cosmopolitan DOS target)
// Allows C# code to compile into standalone 16/32-bit DOS binaries
// =========================================================================

namespace DosBox.Runtime
{
    using System;
    using System.Runtime.InteropServices;

    public unsafe struct DosRegisters
    {
        public ushort AX, BX, CX, DX;
        public ushort SI, DI, BP, SP;
        public ushort CS, DS, SS, ES;
        public ushort Flags;
    }

    public static unsafe class DosHost
    {
        public const uint VRAM_VGA_BASE = 0x000A0000;
        public const int SCREEN_WIDTH = 320;
        public const int SCREEN_HEIGHT = 200;

        /// <summary>
        /// Direct pointer to VGA Mode 13h video memory
        /// </summary>
        public static byte* VideoRam => (byte*)VRAM_VGA_BASE;

        /// <summary>
        /// Write character to standard DOS output via INT 21h (AH=02h)
        /// </summary>
        public static void PutChar(char c)
        {
            // Simulated inline assembly or BIOS call
            Console.Write(c);
        }

        /// <summary>
        /// Fast plot pixel in Mode 13h
        /// </summary>
        public static void PlotPixel(int x, int y, byte color)
        {
            if (x >= 0 && x < SCREEN_WIDTH && y >= 0 && y < SCREEN_HEIGHT)
            {
                VideoRam[y * SCREEN_WIDTH + x] = color;
            }
        }
    }
}
`,
      },
      {
        path: 'modules/voodoo_glide.cpp',
        name: 'voodoo_glide.cpp',
        type: 'file',
        language: 'cpp',
        size: '4.6 KB',
        lastCommit: '5 days ago',
        lastCommitMessage: 'feat: add 3dfx Glide 2.x pass-through wrapper stub',
        content: `/**
 * 3dfx Voodoo Glide 2.x Hardware Emulation Module
 */

#include <iostream>
#include <cstdint>

class VoodooGlideModule {
public:
    void InitGlide() {
        std::cout << "[Glide] 3dfx Voodoo Graphics Accelerator detected." << std::endl;
        std::cout << "[Glide] FBI revision 2, TMU count: 1, 4MB Framebuffer." << std::endl;
    }

    void grBufferSwap(int swap_interval) {
        // Swap front and back buffer on Voodoo card
    }
};
`,
      },
      {
        path: 'modules/mt32_synth.cpp',
        name: 'mt32_synth.cpp',
        type: 'file',
        language: 'cpp',
        size: '5.1 KB',
        lastCommit: '1 week ago',
        lastCommitMessage: 'audio: Roland MT-32 MIDI sysex queue',
        content: `/**
 * Roland MT-32 / LAPC-I MIDI Synthesizer Module
 */

#include <cstdint>

class RolandMT32Module {
public:
    void SendMidiByte(uint8_t byte) {
        // Handle MPU-401 UART mode MIDI stream
    }
};
`,
      },
      {
        path: 'modules/opl3_yamaha.cpp',
        name: 'opl3_yamaha.cpp',
        type: 'file',
        language: 'cpp',
        size: '5.7 KB',
        lastCommit: '3 days ago',
        lastCommitMessage: 'feat: add Yamaha OPL3 4-operator FM synthesis polyphony',
        content: `/**
 * Yamaha YMF262 (OPL3) FM Sound Synthesizer
 */

#include <cstdint>

class OPL3Synthesizer {
public:
    void Reset() {
        for (int i = 0; i < 256; i++) {
            bank0[i] = 0;
            bank1[i] = 0;
        }
    }

    void WriteRegister(uint16_t port, uint8_t val) {
        if (port == 0x388 || port == 0x220) {
            bank0[selected_reg] = val;
        } else if (port == 0x38A || port == 0x222) {
            bank1[selected_reg] = val; // Secondary bank for stereo OPL3
        }
    }

private:
    uint8_t selected_reg;
    uint8_t bank0[256];
    uint8_t bank1[256];
};
`,
      },
      {
        path: 'modules/pci_bus.c',
        name: 'pci_bus.c',
        type: 'file',
        language: 'c',
        size: '3.4 KB',
        lastCommit: '1 week ago',
        lastCommitMessage: 'hw: basic PCI configuration space mechanism #1',
        content: `/**
 * PCI Bus Configuration Mechanism #1 for DOSBox-X
 * Port 0xCF8 (Address) and 0xCFC (Data)
 */

#include <stdint.h>

#define PCI_CONFIG_ADDRESS 0xCF8
#define PCI_CONFIG_DATA    0xCFC

uint32_t pci_read_config(uint8_t bus, uint8_t slot, uint8_t func, uint8_t offset) {
    uint32_t address = (uint32_t)((bus << 16) | (slot << 11) | (func << 8) | (offset & 0xFC) | 0x80000000L);
    outportd(PCI_CONFIG_ADDRESS, address);
    return inportd(PCI_CONFIG_DATA);
}
`,
      },
    ],
  },
  {
    path: 'patches',
    name: 'patches',
    type: 'dir',
    size: '4 files',
    lastCommit: '2 days ago',
    lastCommitMessage: 'chore: index community patch submissions',
    children: [
      {
        path: 'patches/0001-fix-mode-13h-page-flip.patch',
        name: '0001-fix-mode-13h-page-flip.patch',
        type: 'file',
        language: 'diff',
        size: '1.2 KB',
        lastCommit: '4 days ago',
        lastCommitMessage: 'patch 0001: fix double buffering race in vga_wait_vsync',
        content: INITIAL_PATCHES[0].diff,
      },
      {
        path: 'patches/0002-sb16-dma-buffer.patch',
        name: '0002-sb16-dma-buffer.patch',
        type: 'file',
        language: 'diff',
        size: '1.1 KB',
        lastCommit: '1 week ago',
        lastCommitMessage: 'patch 0002: sound blaster 16 dma underrun guard',
        content: INITIAL_PATCHES[1].diff,
      },
      {
        path: 'patches/0003-enable-csharp-native-aot.patch',
        name: '0003-enable-csharp-native-aot.patch',
        type: 'file',
        language: 'diff',
        size: '1.4 KB',
        lastCommit: '1 week ago',
        lastCommitMessage: 'patch 0003: c# native AOT runtime stub for real mode',
        content: INITIAL_PATCHES[2].diff,
      },
      {
        path: 'patches/0004-vga-palette-dac-snow-fix.patch',
        name: '0004-vga-palette-dac-snow-fix.patch',
        type: 'file',
        language: 'diff',
        size: '0.9 KB',
        lastCommit: '2 weeks ago',
        lastCommitMessage: 'patch 0004: palette dac snow effect elimination',
        content: INITIAL_PATCHES[3].diff,
      },
    ],
  },
  {
    path: 'examples',
    name: 'examples',
    type: 'dir',
    size: '4 files',
    lastCommit: '3 days ago',
    lastCommitMessage: 'examples: polish plasma, wireframe, and C# crawler',
    children: [
      {
        path: 'examples/plasma_c.c',
        name: 'plasma_c.c',
        type: 'file',
        language: 'c',
        size: '2.8 KB',
        lastCommit: '3 days ago',
        lastCommitMessage: 'examples: optimize trigonometry lookup tables',
      },
      {
        path: 'examples/wireframe_cpp.cpp',
        name: 'wireframe_cpp.cpp',
        type: 'file',
        language: 'cpp',
        size: '3.4 KB',
        lastCommit: '4 days ago',
        lastCommitMessage: 'examples: add 3D rotating cube with fixed-point math',
      },
      {
        path: 'examples/crawler_cs.cs',
        name: 'crawler_cs.cs',
        type: 'file',
        language: 'csharp',
        size: '3.9 KB',
        lastCommit: '5 days ago',
        lastCommitMessage: 'examples: text-mode ANSI dungeon crawler in C#',
      },
      {
        path: 'examples/sound_dsp.c',
        name: 'sound_dsp.c',
        type: 'file',
        language: 'c',
        size: '2.1 KB',
        lastCommit: '1 week ago',
        lastCommitMessage: 'examples: arpeggio PC speaker and DSP tone generator',
      },
    ],
  },
];
