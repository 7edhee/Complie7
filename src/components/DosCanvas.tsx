import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Monitor, Camera, Maximize2 } from 'lucide-react';

interface DosCanvasProps {
  isRunning: boolean;
  onToggleRun: () => void;
  targetMode: 'vga-plasma' | 'wireframe-3d' | 'ansi-dungeon' | 'sound-dsp';
  executableName: string;
}

export function DosCanvas({ isRunning, onToggleRun, targetMode, executableName }: DosCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scanlines, setScanlines] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cycles, setCycles] = useState(3000);
  const [statusMessage, setStatusMessage] = useState('DOSBox x86 Ready');
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 4, gold: 0, hp: 100 });

  // Web Audio Context reference for authentic PC Speaker simulation
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize or stop audio
  const stopTone = useCallback(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }
  }, []);

  const playFrequency = useCallback((freq: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'square'; // Authentic PC speaker tone
        gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (oscRef.current && gainRef.current) {
        oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gainRef.current.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      }
    } catch {
      // Audio not permitted without interaction
    }
  }, [soundEnabled]);

  // Dungeon map definition
  const dungeonMap = useRef([
    '########################################',
    '#........#.........#...................#',
    '#........#..$......#.....##########...#',
    '#........#.........#.....#........#...#',
    '######.###...#######.....#..$$$....#...#',
    '#........#...#...........#........#...#',
    '#.M......#...#...M.......##########...#',
    '#........#...#.........................#',
    '#.########...#################.#########',
    '#..................#.........#.........#',
    '#..$...............#..M......#....$....#',
    '#..................#.........#.........#',
    '################.#######################',
    '#......................................#',
    '#...$$$$.......M..........EXIT [E].....#',
    '########################################'
  ]).current;

  // Handle keyboard inputs for the ANSI dungeon crawler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (targetMode !== 'ansi-dungeon' || !isRunning) return;

      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
      else return;

      e.preventDefault();

      setPlayerPos((prev) => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;

        if (newY >= 0 && newY < dungeonMap.length && newX >= 0 && newX < dungeonMap[newY].length) {
          const char = dungeonMap[newY][newX];
          if (char === '#') {
            playFrequency(140); // bump sound
            setTimeout(stopTone, 80);
            return prev;
          }
          let newGold = prev.gold;
          let newHp = prev.hp;
          if (char === '$') {
            newGold += 50;
            playFrequency(880); // coin sound
            setTimeout(stopTone, 100);
          } else if (char === 'M') {
            newHp = Math.max(0, newHp - 15);
            playFrequency(220); // monster roar
            setTimeout(stopTone, 120);
          } else {
            playFrequency(440); // step sound
            setTimeout(stopTone, 40);
          }

          return { x: newX, y: newY, gold: newGold, hp: newHp };
        }
        return prev;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetMode, isRunning, dungeonMap, playFrequency, stopTone]);

  // Sound DSP Arpeggiator simulation
  useEffect(() => {
    if (targetMode === 'sound-dsp' && isRunning && soundEnabled) {
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
      let noteIdx = 0;
      const interval = setInterval(() => {
        playFrequency(notes[noteIdx]);
        noteIdx = (noteIdx + 1) % notes.length;
      }, 110);
      return () => {
        clearInterval(interval);
        stopTone();
      };
    } else {
      stopTone();
    }
  }, [targetMode, isRunning, soundEnabled, playFrequency, stopTone]);

  // Main rendering animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;
    let angleX = 0;
    let angleY = 0;

    const render = () => {
      tick++;

      // If stopped, render DOS prompt
      if (!isRunning) {
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, 320, 200);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('DOSBox Staging x86 Emulator v0.74-3', 10, 20);
        ctx.fillText('Conventional Memory: 640 KB OK', 10, 36);
        ctx.fillText('Sound Blaster 16 at Port 0220h, IRQ 7, DMA 1', 10, 52);
        ctx.fillText('Drive C: mounted as VIRTUAL_HOST_DIR', 10, 68);
        ctx.fillText('AUTOEXEC.BAT executed successfully.', 10, 84);

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`C:\\>${executableName}`, 10, 114);

        // Blinking cursor
        if (Math.floor(tick / 20) % 2 === 0) {
          ctx.fillRect(10 + ctx.measureText(`C:\\>${executableName}`).width + 2, 106, 6, 9);
        }

        ctx.fillStyle = '#64748b';
        ctx.fillText('Click [Run] or [Compile & Run] to launch execution', 10, 180);
        return;
      }

      // 1. VGA Mode 13h Real-Time Plasma Mode
      if (targetMode === 'vga-plasma') {
        const imgData = ctx.createImageData(320, 200);
        const data = imgData.data;

        const t = tick * 0.05;
        for (let y = 0; y < 200; y += 2) {
          const v1 = Math.sin(y * 0.05 + t) * 64 + 64;
          for (let x = 0; x < 320; x += 2) {
            const v2 = Math.sin(x * 0.04 + t * 0.7) * 64 + 64;
            const v3 = Math.sin((x + y) * 0.03 + t * 0.5) * 64 + 64;
            const val = (v1 + v2 + v3) % 256;

            // Mode 13h custom fiery palette mapping
            const r = Math.floor(Math.sin(val * 0.05) * 127 + 128);
            const g = Math.floor(Math.cos(val * 0.03) * 100 + 100);
            const b = Math.floor(Math.sin(val * 0.08) * 127 + 128);

            // Fill 2x2 blocks for authentic retro chunky pixel look
            for (let dy = 0; dy < 2; dy++) {
              for (let dx = 0; dx < 2; dx++) {
                const idx = ((y + dy) * 320 + (x + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255;
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Overlay OSD
        ctx.fillStyle = 'rgba(10, 13, 20, 0.75)';
        ctx.fillRect(8, 8, 175, 26);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('VGA Mode 13h (320x200 256c)', 14, 20);
        ctx.fillStyle = '#a3e635';
        ctx.fillText(`Frame: ${tick} · ${cycles} cycles`, 14, 30);
      }

      // 2. 3D Wireframe Cube Mode (C++)
      else if (targetMode === 'wireframe-3d') {
        ctx.fillStyle = '#070a10';
        ctx.fillRect(0, 0, 320, 200);

        // Draw starfield grid background
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let i = 20; i < 320; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 200);
          ctx.stroke();
        }
        for (let j = 20; j < 200; j += 30) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(320, j);
          ctx.stroke();
        }

        angleX += 0.025;
        angleY += 0.035;

        const size = 52;
        const vertices = [
          [-size, -size, -size],
          [size, -size, -size],
          [size, size, -size],
          [-size, size, -size],
          [-size, -size, size],
          [size, -size, size],
          [size, size, size],
          [-size, size, size]
        ];

        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);

        const projected = vertices.map(([vx, vy, vz]) => {
          const x1 = vx * cosY + vz * sinY;
          const z1 = -vx * sinY + vz * cosY;

          const y2 = vy * cosX - z1 * sinX;
          const z2 = vy * sinX + z1 * cosX;

          const distance = 160 + z2;
          const projX = 160 + (x1 * 130) / distance;
          const projY = 100 + (y2 * 130) / distance;
          return [projX, projY, z2];
        });

        const edges = [
          [0,1], [1,2], [2,3], [3,0],
          [4,5], [5,6], [6,7], [7,4],
          [0,4], [1,5], [2,6], [3,7]
        ];

        // Draw edges
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        edges.forEach(([u, v]) => {
          ctx.beginPath();
          ctx.moveTo(projected[u][0], projected[u][1]);
          ctx.lineTo(projected[v][0], projected[v][1]);
          ctx.stroke();
        });

        // Draw vertex glowing dots
        projected.forEach(([px, py, pz]) => {
          ctx.fillStyle = pz > 0 ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // OSD
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('C++ Fixed-Point 3D Pipeline', 10, 18);
        ctx.fillText(`Angles: X=${Math.round(angleX * 57.3)}° Y=${Math.round(angleY * 57.3)}°`, 10, 30);
      }

      // 3. ANSI Dungeon Crawler Mode (C#)
      else if (targetMode === 'ansi-dungeon') {
        ctx.fillStyle = '#05070c';
        ctx.fillRect(0, 0, 320, 200);

        ctx.font = '9px "JetBrains Mono", monospace';
        
        // Header
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('C# NATIVE AOT DUNGEON · DOS REAL MODE', 10, 16);

        // Map rendering
        const startY = 30;
        const charW = 7.5;
        const charH = 9.5;

        for (let y = 0; y < dungeonMap.length; y++) {
          const row = dungeonMap[y];
          for (let x = 0; x < row.length; x++) {
            const posX = 10 + x * charW;
            const posY = startY + y * charH;

            if (x === playerPos.x && y === playerPos.y) {
              ctx.fillStyle = '#22c55e';
              ctx.fillText('@', posX, posY);
            } else {
              const char = row[x];
              if (char === '#') {
                ctx.fillStyle = '#475569';
              } else if (char === '$') {
                ctx.fillStyle = '#eab308';
              } else if (char === 'M') {
                ctx.fillStyle = '#ef4444';
              } else {
                ctx.fillStyle = '#1e293b';
              }
              ctx.fillText(char, posX, posY);
            }
          }
        }

        // Stats Footer
        ctx.fillStyle = '#0ea5e9';
        ctx.fillText(`HP: ${playerPos.hp}/100  Gold: ${playerPos.gold} GP  Pos: (${playerPos.x},${playerPos.y})`, 10, 190);
      }

      // 4. Sound Blaster & Audio DSP Mode
      else if (targetMode === 'sound-dsp') {
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, 320, 200);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('Sound Blaster 16 DSP Spectrum Analyzer', 10, 20);
        ctx.fillStyle = '#64748b';
        ctx.fillText('Port 0x220 · IRQ 7 · DMA 1 · 44.1 kHz', 10, 34);

        // Draw animated frequency spectrum bars
        const numBars = 24;
        const barWidth = 10;
        const spacing = 3;
        const startX = 10;

        for (let b = 0; b < numBars; b++) {
          const h = Math.abs(Math.sin(tick * 0.1 + b * 0.4)) * 90 + 10;
          const x = startX + b * (barWidth + spacing);
          const y = 160 - h;

          const grad = ctx.createLinearGradient(0, y, 0, 160);
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(0.5, '#eab308');
          grad.addColorStop(1, '#10b981');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, h);

          // Peak dots
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y - 3, barWidth, 2);
        }

        ctx.fillStyle = soundEnabled ? '#38bdf8' : '#ef4444';
        ctx.fillText(soundEnabled ? 'Speaker: ACTIVE (Chiptune Playing)' : 'Speaker: MUTED (Click sound icon)', 10, 185);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isRunning, targetMode, executableName, playerPos, dungeonMap, cycles, soundEnabled]);

  const takeScreenshot = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `dosbox-${executableName.toLowerCase()}-${Date.now()}.png`;
    a.click();
    setStatusMessage('Screenshot saved to downloads');
    setTimeout(() => setStatusMessage('DOSBox x86 Ready'), 2500);
  };

  const resetDungeon = () => {
    setPlayerPos({ x: 5, y: 4, gold: 0, hp: 100 });
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Top Header of the DOS Screen */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-200">DOS Screen</span>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-slate-400 font-mono text-[11px]">{executableName}</span>
          <span className="text-slate-600 font-mono">·</span>
          <span className={`text-[11px] font-mono ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isRunning ? 'EXEC' : 'IDLE'}
          </span>
        </div>

        {/* Speed & Audio controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1 rounded transition-colors ${
              soundEnabled ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={soundEnabled ? 'Mute PC Speaker' : 'Unmute PC Speaker'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setScanlines(!scanlines)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
              scanlines ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Toggle authentic CRT monitor scanline simulation"
          >
            CRT
          </button>

          <button
            onClick={takeScreenshot}
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            title="Download DOSBox Canvas Screenshot"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Frame with CRT Overlay */}
      <div className={`relative bg-black flex items-center justify-center p-2 min-h-[260px] overflow-hidden ${scanlines ? 'crt-screen' : ''}`}>
        <canvas
          ref={canvasRef}
          width={320}
          height={200}
          className="w-full max-w-[560px] aspect-[4/3] rounded border border-slate-900 bg-black shadow-inner"
          style={{ imageRendering: 'pixelated' }}
        />

        {targetMode === 'ansi-dungeon' && isRunning && (
          <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800 p-2 rounded text-[10px] text-slate-300 shadow-lg pointer-events-none">
            <div className="text-amber-400 font-bold mb-1">Interactive Crawler:</div>
            <div>[W][A][S][D] / Arrows: Move</div>
            <div>Collect [$] Gold & Avoid [M]</div>
          </div>
        )}
      </div>

      {/* Execution Controls Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium text-xs transition-colors ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Run Program</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (targetMode === 'ansi-dungeon') resetDungeon();
              onToggleRun();
              setTimeout(onToggleRun, 150);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-300 hover:bg-slate-800 transition-colors"
            title="Reset DOS Environment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Cycles slider */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px] font-mono">Cycles:</span>
          <input
            type="range"
            min={1000}
            max={15000}
            step={500}
            value={cycles}
            onChange={(e) => setCycles(Number(e.target.value))}
            className="w-20 h-1 accent-amber-500 bg-slate-800 cursor-pointer"
          />
          <span className="font-mono text-[11px] text-amber-400 tabular-nums w-12">{cycles}</span>
        </div>

        <div className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
          {statusMessage}
        </div>
      </div>
    </div>
  );
}
