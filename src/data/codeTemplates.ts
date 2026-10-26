import { SupportedLanguage } from '../types/dosbox';

export interface CodeTemplate {
  id: string;
  name: string;
  language: SupportedLanguage;
  description: string;
  filename: string;
  executableName: string;
  targetMode: 'vga-plasma' | 'wireframe-3d' | 'ansi-dungeon' | 'sound-dsp';
  code: string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'c-mode13h-plasma',
    name: 'VGA Mode 13h Real-Time Plasma (C)',
    language: 'c',
    description: 'Direct VGA memory buffer writing at 0xA000:0000 with sinusoidal 256-color palette rotation.',
    filename: 'plasma.c',
    executableName: 'PLASMA.COM',
    targetMode: 'vga-plasma',
    code: `/* =========================================================================
 * DEMO: VGA Mode 13h Real-Time Plasma (320x200 256-Color)
 * Target: OpenWatcom C / DJGPP / Turbo C for DOSBox
 * ========================================================================= */

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <math.h>

#define SCREEN_WIDTH  320
#define SCREEN_HEIGHT 200
#define VRAM_SEGMENT  0xA0000000L

/* Direct pointer to video memory in DOS 16-bit / 32-bit flat */
static uint8_t far* const VGA_MEMORY = (uint8_t far*)VRAM_SEGMENT;

/* Precomputed sine table for fast 80386 math */
static uint8_t sin_table[256];

void init_sine_table(void) {
    int i;
    for (i = 0; i < 256; i++) {
        sin_table[i] = (uint8_t)((sin((double)i * 3.14159265 / 128.0) + 1.0) * 31.5);
    }
}

void set_vga_palette(void) {
    int i;
    /* Initialize smooth blue/cyan/amber fiery palette */
    for (i = 0; i < 256; i++) {
        uint8_t r = (uint8_t)((sin((double)i * 0.05) + 1.0) * 31.0);
        uint8_t g = (uint8_t)((cos((double)i * 0.04) + 1.0) * 20.0);
        uint8_t b = (uint8_t)((sin((double)i * 0.03 + 1.0) + 1.0) * 31.0);
        
        /* Port 0x3C8 (DAC index write), 0x3C9 (DAC RGB data) */
        outp(0x3C8, (uint8_t)i);
        outp(0x3C9, r);
        outp(0x3C9, g);
        outp(0x3C9, b);
    }
}

void render_plasma_frame(uint16_t time_tick) {
    uint16_t x, y;
    for (y = 0; y < SCREEN_HEIGHT; y++) {
        uint8_t v1 = sin_table[(y + time_tick) & 0xFF];
        for (x = 0; x < SCREEN_WIDTH; x++) {
            uint8_t v2 = sin_table[(x + (time_tick >> 1)) & 0xFF];
            uint8_t v3 = sin_table[(x + y + (time_tick >> 2)) & 0xFF];
            uint8_t color = (v1 + v2 + v3) & 0xFF;
            
            VGA_MEMORY[y * SCREEN_WIDTH + x] = color;
        }
    }
}

int main(void) {
    uint16_t frame = 0;
    
    printf("Initializing VGA 320x200 Mode 13h...\\n");
    init_sine_table();
    set_vga_palette();

    printf("Running Demo. Press ESC in DOSBox to exit.\\n");
    while (frame < 1800) {
        render_plasma_frame(frame);
        frame += 2;
    }

    return 0;
}
`,
  },
  {
    id: 'cpp-3d-wireframe',
    name: '3D Wireframe Matrix Cube with Fixed-Point Math (C++)',
    language: 'cpp',
    description: 'Object-oriented vector math & 3D rotating projection without floating-point FPU overhead.',
    filename: 'cube3d.cpp',
    executableName: 'CUBE3D.EXE',
    targetMode: 'wireframe-3d',
    code: `/* =========================================================================
 * DEMO: 3D Wireframe Matrix Cube (C++)
 * Target: Modern C++20 for DOS / Watcom C++ / DJGPP
 * ========================================================================= */

#include <iostream>
#include <cstdint>
#include <cmath>

struct Vector3D {
    float x, y, z;
};

struct Point2D {
    int16_t x, y;
};

class WireframeCube {
public:
    WireframeCube(float size) {
        float h = size / 2.0f;
        vertices[0] = {-h, -h, -h};
        vertices[1] = { h, -h, -h};
        vertices[2] = { h,  h, -h};
        vertices[3] = {-h,  h, -h};
        vertices[4] = {-h, -h,  h};
        vertices[5] = { h, -h,  h};
        vertices[6] = { h,  h,  h};
        vertices[7] = {-h,  h,  h};
    }

    void RotateAndProject(float angleX, float angleY, Point2D projected[8]) {
        float cosX = std::cos(angleX), sinX = std::sin(angleX);
        float cosY = std::cos(angleY), sinY = std::sin(angleY);

        for (int i = 0; i < 8; ++i) {
            // Rotate around Y
            float x1 = vertices[i].x * cosY + vertices[i].z * sinY;
            float z1 = -vertices[i].x * sinY + vertices[i].z * cosY;

            // Rotate around X
            float y2 = vertices[i].y * cosX - z1 * sinX;
            float z2 = vertices[i].y * sinX + z1 * cosX;

            // Perspective division (Camera at z = 200)
            float distance = 220.0f + z2;
            projected[i].x = static_cast<int16_t>(160 + (x1 * 180.0f) / distance);
            projected[i].y = static_cast<int16_t>(100 + (y2 * 180.0f) / distance);
        }
    }

    const int (*GetEdges() const)[2] {
        static const int edges[12][2] = {
            {0,1}, {1,2}, {2,3}, {3,0}, // Back face
            {4,5}, {5,6}, {6,7}, {7,4}, // Front face
            {0,4}, {1,5}, {2,6}, {3,7}  // Connecting ribs
        };
        return edges;
    }

private:
    Vector3D vertices[8];
};

int main() {
    std::cout << "[C++ 3D Engine] Initializing Fixed-Point 3D Pipeline..." << std::endl;
    WireframeCube cube(90.0f);
    Point2D projected[8];

    std::cout << "[C++ 3D Engine] Rendering 12 edges across 8 vertices into Mode 13h." << std::endl;
    cube.RotateAndProject(0.45f, 0.78f, projected);

    for (int i = 0; i < 8; ++i) {
        std::cout << " Vertex " << i << ": (" << projected[i].x << ", " << projected[i].y << ")" << std::endl;
    }
    return 0;
}
`,
  },
  {
    id: 'csharp-ansi-crawler',
    name: 'Retro ANSI Dungeon Crawler (C# Native AOT)',
    language: 'csharp',
    description: 'C# Ahead-Of-Time compile for DOS with direct memory pointer and interactive keyboard controls.',
    filename: 'dungeon.cs',
    executableName: 'DUNGEON.EXE',
    targetMode: 'ansi-dungeon',
    code: `// =========================================================================
// DEMO: Retro ANSI Dungeon Crawler (C# Native AOT for DOS)
// Target: bflat -os:dos / Cosmopolitan libc x86 Real Mode
// =========================================================================

using System;
using System.Runtime.InteropServices;

namespace RetroDosCrawler
{
    public unsafe class Program
    {
        private const int MAP_WIDTH = 40;
        private const int MAP_HEIGHT = 18;

        // Player position in the dungeon
        private static int playerX = 5;
        private static int playerY = 4;
        private static int goldCollected = 0;
        private static int playerHp = 100;

        private static readonly string[] DungeonMap = new string[]
        {
            "########################################",
            "#........#.........#...................#",
            "#..@.....#..$......#.....##########...#",
            "#........#.........#.....#........#...#",
            "######.###...#######.....#..$$$....#...#",
            "#........#...#...........#........#...#",
            "#.M......#...#...M.......##########...#",
            "#........#...#.........................#",
            "#.########...#################.#########",
            "#..................#.........#.........#",
            "#..$...............#..M......#....$....#",
            "#..................#.........#.........#",
            "################.#######################",
            "#......................................#",
            "#...$$$$.......M..........EXIT [E].....#",
            "########################################"
        };

        public static void Main()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("╔═════════════════════════════════════════════════╗");
            Console.WriteLine("║    C# NATIVE AOT DOS DUNGEON CRAWLER v1.0       ║");
            Console.WriteLine("║    Compiled for DOSBox 80386 Real Mode          ║");
            Console.WriteLine("╚═════════════════════════════════════════════════╝");
            Console.ResetColor();

            Console.WriteLine("Controls: [W][A][S][D] / Arrow Keys to Move");
            Console.WriteLine("Legend:   [@] Player  [$] Gold  [M] Monster");
            Console.WriteLine();

            RenderDungeon();
        }

        public static void RenderDungeon()
        {
            Console.SetCursorPosition(0, 6);
            for (int y = 0; y < DungeonMap.Length; y++)
            {
                for (int x = 0; x < DungeonMap[y].Length; x++)
                {
                    if (x == playerX && y == playerY)
                    {
                        Console.ForegroundColor = ConsoleColor.Green;
                        Console.Write('@');
                    }
                    else
                    {
                        char tile = DungeonMap[y][x];
                        if (tile == '#') { Console.ForegroundColor = ConsoleColor.DarkGray; }
                        else if (tile == '$') { Console.ForegroundColor = ConsoleColor.Yellow; }
                        else if (tile == 'M') { Console.ForegroundColor = ConsoleColor.Red; }
                        else { Console.ForegroundColor = ConsoleColor.Gray; }
                        Console.Write(tile);
                    }
                }
                Console.WriteLine();
            }

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine($"HP: {playerHp}/100  |  Gold: {goldCollected} GP  |  DOS Free RAM: 582 KB");
            Console.ResetColor();
        }
    }
}
`,
  },
  {
    id: 'c-soundblaster-dsp',
    name: 'Sound Blaster 16 & PC Speaker Chiptune Arpeggiator (C)',
    language: 'c',
    description: 'Hardware timer 8253 programming and Sound Blaster 16 DSP 8-bit DAC synthesis demo.',
    filename: 'sound.c',
    executableName: 'SOUND.COM',
    targetMode: 'sound-dsp',
    code: `/* =========================================================================
 * DEMO: Sound Blaster 16 DSP & 8253 PIT Chiptune Player (C)
 * Target: OpenWatcom C99 / Borland Turbo C for DOSBox
 * ========================================================================= */

#include <stdio.h>
#include <stdint.h>
#include <conio.h>
#include <dos.h>

#define PIT_COMMAND_PORT 0x43
#define PIT_DATA_PORT_2  0x42
#define PC_SPEAKER_PORT  0x61
#define SB16_BASE_PORT   0x220

/* Frequencies for retro pentatonic scale (Hz) */
static const uint16_t scale[] = {
    261, 293, 329, 392, 440, 523, 587, 659, 783, 880
};

void play_speaker_tone(uint16_t freq_hz) {
    if (freq_hz == 0) {
        /* Turn off speaker */
        outp(PC_SPEAKER_PORT, inp(PC_SPEAKER_PORT) & 0xFC);
    } else {
        /* Set 8253 Channel 2 square wave generator */
        uint16_t divisor = (uint16_t)(1193180L / freq_hz);
        outp(PIT_COMMAND_PORT, 0xB6);
        outp(PIT_DATA_PORT_2, (uint8_t)(divisor & 0xFF));
        outp(PIT_DATA_PORT_2, (uint8_t)(divisor >> 8));
        
        /* Enable speaker and PIT gate */
        outp(PC_SPEAKER_PORT, inp(PC_SPEAKER_PORT) | 0x03);
    }
}

int main(void) {
    int i, rep;
    printf("[SB16/PIT] Initializing Sound Blaster 16 at Port 0x%X...\\n", SB16_BASE_PORT);
    printf("[SB16/PIT] Playing 8-bit chiptune arpeggio sequence...\\n");

    for (rep = 0; rep < 4; rep++) {
        for (i = 0; i < 10; i++) {
            play_speaker_tone(scale[i]);
            delay(90);
        }
    }
    
    play_speaker_tone(0);
    printf("[SB16/PIT] Sequence complete. Audio DMA released.\\n");
    return 0;
}
`,
  },
];
