import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Download, Upload, Monitor, Settings, Zap, Layers, RefreshCw, X, Sun, Moon } from 'lucide-react';

interface ReverbDeGlossProps {
  onClose?: () => void;
}

export const ReverbDeGloss: React.FC<ReverbDeGlossProps> = ({ onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('SYSTEM READY');
  const [reduction, setReduction] = useState(50);
  const [output, setOutput] = useState(50);
  const [decay, setDecay] = useState(50);
  const [reverbType, setReverbType] = useState('auto');
  const [preset, setPreset] = useState('moderate');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const highpassFilterRef = useRef<BiquadFilterNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Initialize Audio Context
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    if (audioRef.current) {
      const source = ctx.createMediaElementSource(audioRef.current);
      const outputGain = ctx.createGain();
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 100 + (reduction * 100);
      
      source.connect(highpass);
      highpass.connect(outputGain);
      outputGain.connect(ctx.destination);
      
      sourceNodeRef.current = source;
      outputGainNodeRef.current = outputGain;
      highpassFilterRef.current = highpass;
    }
  }, [reduction]);

  useEffect(() => {
    if (outputGainNodeRef.current && audioCtxRef.current) {
      const gain = Math.pow(output / 50, 2);
      outputGainNodeRef.current.gain.setTargetAtTime(gain, audioCtxRef.current.currentTime, 0.015);
    }
  }, [output]);

  useEffect(() => {
    if (highpassFilterRef.current && audioCtxRef.current) {
      const filterFreq = 100 + (reduction * 100);
      highpassFilterRef.current.frequency.setTargetAtTime(filterFreq, audioCtxRef.current.currentTime, 0.015);
    }
  }, [reduction]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setStatus('ERROR: INVALID FILE');
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStatus('AUDIO LOADED');
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    if (!audioUrl) {
      setStatus('LOAD AUDIO FIRST');
      return;
    }

    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setStatus('PAUSED');
      } else {
        audioRef.current.play().catch(err => {
          console.error("Playback error:", err);
          setStatus('PLAYBACK ERROR');
        });
        setIsPlaying(true);
        setStatus('DE-GLOSSING...');
      }
    }
  };

  const applyPreset = (p: string) => {
    setPreset(p);
    switch(p) {
      case 'gentle': setReduction(25); setDecay(40); break;
      case 'moderate': setReduction(50); setDecay(50); break;
      case 'aggressive': setReduction(75); setDecay(60); break;
      case 'surgical': setReduction(95); setDecay(70); break;
    }
  };

  // Knob Component
  const Knob = ({ label, value, onChange, min = 0, max = 100, size = "md", color = "cyan" }: any) => {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef(0);
    const startVal = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      startY.current = e.clientY;
      startVal.current = value;
      document.body.style.cursor = 'ns-resize';
    };

    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaY = startY.current - e.clientY;
        const sensitivity = (max - min) / 200;
        let newVal = startVal.current + (deltaY * sensitivity);
        newVal = Math.max(min, Math.min(max, newVal));
        onChange(newVal);
      };

      const onMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
      };

      if (isDragging) {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }, [isDragging, max, min, onChange]);

    const rotation = ((value - min) / (max - min) - 0.5) * 270;
    const accentColor = color === 'cyan' ? '#00f2ff' : '#9d00ff';

    return (
      <div className="flex flex-col items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
        
        {size === 'lg' ? (
          <div className="relative w-40 h-40 rounded-full bg-[conic-gradient(#444,#777,#444,#666,#444)] shadow-[0_15px_40px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.3)] flex items-center justify-center">
            <div 
              className="w-32 h-32 rounded-full bg-[#111] border border-black shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-ns-resize relative transition-transform"
              onMouseDown={onMouseDown}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#333] to-[#111] shadow-inner flex justify-center pt-2">
                <div 
                  className="w-1 h-8 rounded-full shadow-[0_0_8px_rgba(157,0,255,0.8)]"
                  style={{ backgroundColor: accentColor }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="w-24 h-24 rounded-full bg-[#111] border border-black shadow-[0_8px_16px_rgba(0,0,0,0.5)] cursor-ns-resize relative transition-transform"
            onMouseDown={onMouseDown}
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[#333] to-[#111] shadow-inner flex justify-center pt-2">
              <div 
                className="w-1 h-6 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>
        )}
        
        <div className="font-mono text-sm text-accent-cyan bg-black/40 px-3 py-1 rounded border border-white/5 min-w-[60px] text-center shadow-inner">
          {label === 'Decay Time' ? `${(value / 100 * 2).toFixed(1)}s` : `${Math.round(value)}%`}
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <style>{`
        @keyframes sweepGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .btn-sweep {
          background-image: linear-gradient(90deg, #00f2ff, #9d00ff, #00f2ff);
          background-size: 200% 100%;
          animation: sweepGradient 2s linear infinite;
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-[#2a2a2a] bg-[repeating-linear-gradient(90deg,transparent_0,transparent_1px,rgba(255,255,255,0.02)_1px,rgba(255,255,255,0.02)_2px)] border border-[#444] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] overflow-hidden flex flex-col p-10">
        
        {/* Screws */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#eee] to-[#555] border border-black shadow-md flex items-center justify-center">
          <div className="w-2 h-[1px] bg-[#333] rotate-45 absolute" />
          <div className="w-2 h-[1px] bg-[#333] -rotate-45 absolute" />
        </div>
        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#eee] to-[#555] border border-black shadow-md flex items-center justify-center">
          <div className="w-2 h-[1px] bg-[#333] rotate-45 absolute" />
          <div className="w-2 h-[1px] bg-[#333] -rotate-45 absolute" />
        </div>
        <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#eee] to-[#555] border border-black shadow-md flex items-center justify-center">
          <div className="w-2 h-[1px] bg-[#333] rotate-45 absolute" />
          <div className="w-2 h-[1px] bg-[#333] -rotate-45 absolute" />
        </div>
        <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-gradient-to-br from-[#eee] to-[#555] border border-black shadow-md flex items-center justify-center">
          <div className="w-2 h-[1px] bg-[#333] rotate-45 absolute" />
          <div className="w-2 h-[1px] bg-[#333] -rotate-45 absolute" />
        </div>

        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[#444] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00f2ff] to-[#9d00ff] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.6)]">
              <Zap className="text-white fill-white drop-shadow-md" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#00f2ff] to-[#9d00ff] bg-clip-text text-transparent uppercase">MyAiPlug</h2>
              <p className="text-[10px] font-bold text-neutral-500 tracking-[0.4em] uppercase">REVERB DE-GLOSS™</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-5 bg-black rounded-full border border-[#555] relative transition-colors"
            >
              <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all ${isDarkMode ? 'left-0.5' : 'left-5.5'}`} />
            </button>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* LCD Panel */}
        <div className="bg-black rounded-lg border border-[#444] h-16 flex items-center justify-between px-6 mb-8 shadow-[inset_0_5px_15px_rgba(0,0,0,0.5)]">
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-b from-[#444] to-[#222] border border-black rounded text-[10px] font-bold text-neutral-300 uppercase tracking-widest hover:btn-sweep transition-all active:scale-95"
            >
              Load Audio
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="audio/*" />
            
            <button 
              onClick={togglePlay}
              className={`px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-black
                ${isPlaying ? 'btn-sweep text-white shadow-[0_0_15px_rgba(0,240,255,0.6)]' : 'bg-gradient-to-b from-[#444] to-[#222] text-neutral-300'}`}
            >
              {isPlaying ? 'Disengage' : 'Engage'}
            </button>

            <button 
              className="px-4 py-2 bg-gradient-to-b from-[#444] to-[#222] border border-black rounded text-[10px] font-bold text-neutral-300 uppercase tracking-widest hover:btn-sweep transition-all active:scale-95"
            >
              Export WAV
            </button>
          </div>
          
          <div className="font-mono text-xs text-accent-cyan tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,240,255,0.6)]">
            {status}
          </div>
        </div>

        <audio ref={audioRef} src={audioUrl || ''} onEnded={() => setIsPlaying(false)} />

        {/* Visualizer Area */}
        <div className="h-64 bg-black/40 border border-[#444] rounded-xl relative overflow-hidden flex items-end justify-center gap-1.5 p-6 mb-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,0,255,0.1),transparent_70%)] pointer-events-none" />
           
           {[...Array(40)].map((_, i) => {
             const reductionFactor = reduction / 100;
             const baseHeight = Math.max(5, 100 - (i * 2.3));
             const height = isPlaying ? Math.max(5, baseHeight * (1 - reductionFactor)) : 5;
             return (
               <div 
                 key={i} 
                 className="flex-1 bg-gradient-to-t from-[#00f2ff] to-[#9d00ff] rounded-t-sm transition-all duration-300 shadow-[0_0_10px_rgba(0,242,255,0.6)]"
                 style={{ height: `${height}%` }}
               />
             );
           })}
        </div>

        {/* Controls Grid */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-10 flex items-center justify-between mb-8 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
           <Knob label="Reduction" value={reduction} onChange={setReduction} />
           <Knob label="Output" value={output} onChange={setOutput} size="lg" color="purple" />
           <Knob label="Decay Time" value={decay} onChange={setDecay} />
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-10">
           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-neutral-500 tracking-[0.2em] uppercase text-center">⊙ Reverb Type Detection ⊙</h4>
              <div className="grid grid-cols-4 gap-2">
                {['auto', 'hall', 'plate', 'room'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setReverbType(type)}
                    className={`py-3 rounded border text-[9px] font-bold uppercase tracking-wider transition-all
                      ${reverbType === type 
                        ? 'btn-sweep text-white border-transparent shadow-[0_0_15px_rgba(0,240,255,0.6)]' 
                        : 'bg-gradient-to-b from-[#333] to-[#1a1a1a] border-[#555] text-neutral-500 hover:border-neutral-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[11px] font-black text-neutral-500 tracking-[0.2em] uppercase text-center">◈ De-Gloss Presets ◈</h4>
              <div className="grid grid-cols-4 gap-2">
                {['gentle', 'moderate', 'aggressive', 'surgical'].map(p => (
                  <button 
                    key={p}
                    onClick={() => applyPreset(p)}
                    className={`py-3 rounded border text-[9px] font-bold uppercase tracking-wider transition-all
                      ${preset === p 
                        ? 'btn-sweep text-white border-transparent shadow-[0_0_15px_rgba(157,0,255,0.6)]' 
                        : 'bg-gradient-to-b from-[#333] to-[#1a1a1a] border-[#555] text-neutral-500 hover:border-neutral-400'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
