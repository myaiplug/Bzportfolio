import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, Square, Download, Power, Activity, X } from 'lucide-react';

// --- Web Audio API Helpers ---
function makeDistortionCurve(amount: number, type: 'tape' | 'tube' | 'transfo') {
  const k = amount;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    if (type === 'tube') {
      // Asymmetrical tube-like clipping
      const val = x < 0 ? x : (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
      curve[i] = Math.max(-1, Math.min(1, val));
    } else if (type === 'tape') {
      // Soft clipping / tanh
      curve[i] = Math.tanh(x * (1 + k / 10));
    } else {
      // XFMR - harder clipping
      curve[i] = Math.max(-1, Math.min(1, x * (1 + k / 5)));
    }
  }
  return curve;
}

// --- UI Components ---
const Knob = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  size = 60, 
  color = 'cyan',
  unit = ''
}: { 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  onChange: (v: number) => void,
  size?: number,
  color?: 'cyan' | 'purple' | 'orange',
  unit?: string
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);

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
  const accentColor = color === 'cyan' ? '#00f2ff' : color === 'purple' ? '#9d00ff' : '#ff5500';

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative rounded-full bg-neutral-800 border-2 border-neutral-700 shadow-[0_5px_10px_rgba(0,0,0,0.5)] cursor-ns-resize"
        style={{ width: size, height: size }}
        onMouseDown={(e) => {
          setIsDragging(true);
          startY.current = e.clientY;
          startVal.current = value;
          document.body.style.cursor = 'ns-resize';
        }}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full rounded-full"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div 
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 rounded-full"
            style={{ height: size * 0.25, backgroundColor: accentColor, boxShadow: `0 0 5px ${accentColor}` }}
          />
        </div>
      </div>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</div>
        <div className="text-xs font-mono text-neutral-300">{Math.round(value)}{unit}</div>
      </div>
    </div>
  );
};

export default function HarmonicWarper({ onClose }: { onClose?: () => void }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('DEMO MODE - UPLOAD AUDIO');
  
  // Audio State
  const [bypass, setBypass] = useState(false);
  const [hpf, setHpf] = useState(75);
  const [lpf, setLpf] = useState(19000);
  const [drive, setDrive] = useState(33);
  const [satModel, setSatModel] = useState<'tape' | 'tube' | 'transfo'>('tube');
  const [warpAmount, setWarpAmount] = useState(50); // Main big knob
  
  // EQ State
  const [eqModes, setEqModes] = useState({
    low: 'punch',
    mid: 'gentle',
    himid: 'focused',
    high: 'shine'
  });
  const [solos, setSolos] = useState<Record<string, boolean>>({});
  const [mutes, setMutes] = useState<Record<string, boolean>>({});

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const nodesRef = useRef<any>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);

  // Init Audio
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      if (audioRef.current && !sourceRef.current) {
        sourceRef.current = ctx.createMediaElementSource(audioRef.current);
      }

      // Create Nodes
      const hpfNode = ctx.createBiquadFilter();
      hpfNode.type = 'highpass';
      
      const lpfNode = ctx.createBiquadFilter();
      lpfNode.type = 'lowpass';

      const eqLow = ctx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.value = 100;

      const eqMid = ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.value = 1000;

      const eqHiMid = ctx.createBiquadFilter();
      eqHiMid.type = 'peaking';
      eqHiMid.frequency.value = 3500;

      const eqHigh = ctx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.value = 10000;

      const waveShaper = ctx.createWaveShaper();
      waveShaper.oversample = '4x';

      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      nodesRef.current = { hpfNode, lpfNode, eqLow, eqMid, eqHiMid, eqHigh, waveShaper, dryGain, wetGain, masterGain, analyser };

      // Routing
      if (sourceRef.current) {
        sourceRef.current.connect(dryGain);
        sourceRef.current.connect(hpfNode);
        
        hpfNode.connect(lpfNode);
        lpfNode.connect(eqLow);
        eqLow.connect(eqMid);
        eqMid.connect(eqHiMid);
        eqHiMid.connect(eqHigh);
        eqHigh.connect(waveShaper);
        waveShaper.connect(wetGain);

        dryGain.connect(masterGain);
        wetGain.connect(masterGain);
        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
      }
    }
  };

  // Update Nodes when state changes
  useEffect(() => {
    if (!nodesRef.current.hpfNode) return;
    const { hpfNode, lpfNode, eqLow, eqMid, eqHiMid, eqHigh, waveShaper, dryGain, wetGain } = nodesRef.current;

    hpfNode.frequency.setTargetAtTime(hpf, audioCtxRef.current!.currentTime, 0.1);
    lpfNode.frequency.setTargetAtTime(lpf, audioCtxRef.current!.currentTime, 0.1);

    waveShaper.curve = makeDistortionCurve(drive, satModel);

    // EQ Logic based on modes
    eqLow.gain.value = mutes.low ? -40 : (eqModes.low === 'thick' ? 4 : 2);
    eqMid.gain.value = mutes.mid ? -40 : (eqModes.mid === 'warm' ? 3 : 1);
    eqHiMid.gain.value = mutes.himid ? -40 : (eqModes.himid === 'wide' ? 4 : 2);
    eqHigh.gain.value = mutes.high ? -40 : (eqModes.high === 'shine' ? 5 : 2);

    // Warp Amount (Mix)
    const mix = bypass ? 0 : warpAmount / 100;
    dryGain.gain.setTargetAtTime(1 - mix, audioCtxRef.current!.currentTime, 0.1);
    wetGain.gain.setTargetAtTime(mix, audioCtxRef.current!.currentTime, 0.1);

  }, [hpf, lpf, drive, satModel, warpAmount, bypass, eqModes, mutes, solos]);

  // Visualizer
  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current || !nodesRef.current.analyser) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const analyser = nodesRef.current.analyser;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#00f2ff');
        gradient.addColorStop(1, '#ff5500');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setStatus(`LOADED: ${file.name.toUpperCase()}`);
      if (audioRef.current) {
        audioRef.current.src = url;
      }
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
        audioRef.current.play().catch(err => console.error(err));
        setIsPlaying(true);
        setStatus('WARPING REALITY...');
      }
    }
  };

  const toggleEqMode = (band: keyof typeof eqModes, opt1: string, opt2: string) => {
    setEqModes(prev => ({ ...prev, [band]: prev[band] === opt1 ? opt2 : opt1 }));
  };

  const toggleMute = (band: string) => {
    setMutes(prev => ({ ...prev, [band]: !prev[band] }));
  };

  const toggleSolo = (band: string) => {
    setSolos(prev => ({ ...prev, [band]: !prev[band] }));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-[#111] rounded-xl border-2 border-neutral-800 shadow-2xl overflow-hidden relative">
        
        {/* Screws */}
        <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-neutral-700 border border-neutral-900 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-neutral-900 rotate-45"></div></div>
        <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-neutral-700 border border-neutral-900 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-neutral-900 -rotate-12"></div></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-neutral-700 border border-neutral-900 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-neutral-900 rotate-90"></div></div>
        <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-neutral-700 border border-neutral-900 shadow-inner flex items-center justify-center"><div className="w-full h-[1px] bg-neutral-900 rotate-180"></div></div>

        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-b from-[#1a1a1a] to-[#111]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ff5500] to-[#00f2ff] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.4)]">
              <Activity className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#ff5500] to-[#00f2ff] bg-clip-text text-transparent uppercase m-0 leading-none">MyAiPlug</h1>
              <p className="text-[10px] font-bold text-neutral-500 tracking-[0.3em] uppercase mt-1">Harmonic Reality Warper</p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full bg-black border border-neutral-800 rounded p-3 flex flex-col gap-3 shadow-inner">
            <div className="flex gap-2">
              <label className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded cursor-pointer text-center transition-colors border border-neutral-700">
                Load Audio
                <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={togglePlay}
                className={`flex-1 text-xs font-bold uppercase tracking-wider py-2 px-4 rounded transition-colors border ${isPlaying ? 'bg-[#ff5500] text-white border-[#ff5500] shadow-[0_0_10px_rgba(255,85,0,0.5)]' : 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-700'}`}
              >
                {isPlaying ? 'Stop' : 'Engage'}
              </button>
            </div>
            <div className="text-[10px] font-mono text-[#00f2ff] text-center tracking-widest uppercase truncate">
              {status}
            </div>
          </div>

          {onClose && (
            <button onClick={onClose} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Spectrum Analyzer */}
        <div className="p-6 bg-black border-b border-neutral-800">
          <div className="w-full h-32 bg-[#050505] rounded-lg border border-neutral-800 relative overflow-hidden shadow-inner">
            <canvas ref={canvasRef} width={800} height={128} className="w-full h-full opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
          </div>
        </div>

        {/* Modules Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-800 border-b border-neutral-800">
          {[
            { id: 'low', label: 'Low End', opts: ['thick', 'punch'] },
            { id: 'mid', label: 'Mid Range', opts: ['gentle', 'warm'] },
            { id: 'himid', label: 'Presence', opts: ['focused', 'wide'] },
            { id: 'high', label: 'Air Band', opts: ['shine', 'silk'] }
          ].map((mod) => (
            <div key={mod.id} className="bg-[#111] p-6 flex flex-col items-center gap-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{mod.label}</div>
              
              <div 
                className="bg-black rounded-full p-1 flex cursor-pointer border border-neutral-800 w-full relative"
                onClick={() => toggleEqMode(mod.id as any, mod.opts[0], mod.opts[1])}
              >
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-neutral-800 rounded-full transition-all duration-300 ${eqModes[mod.id as keyof typeof eqModes] === mod.opts[1] ? 'left-[calc(50%+2px)]' : 'left-1'}`}></div>
                <div className={`flex-1 text-center text-[10px] font-bold uppercase tracking-wider py-1 z-10 ${eqModes[mod.id as keyof typeof eqModes] === mod.opts[0] ? 'text-white' : 'text-neutral-500'}`}>{mod.opts[0]}</div>
                <div className={`flex-1 text-center text-[10px] font-bold uppercase tracking-wider py-1 z-10 ${eqModes[mod.id as keyof typeof eqModes] === mod.opts[1] ? 'text-white' : 'text-neutral-500'}`}>{mod.opts[1]}</div>
              </div>

              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => toggleSolo(mod.id)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${solos[mod.id] ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50' : 'bg-neutral-900 text-neutral-600 border-neutral-800 hover:bg-neutral-800'}`}
                >
                  S
                </button>
                <button 
                  onClick={() => toggleMute(mod.id)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${mutes[mod.id] ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-neutral-900 text-neutral-600 border-neutral-800 hover:bg-neutral-800'}`}
                >
                  M
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Main Section & Bottom Rack */}
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-t from-[#0a0a0a] to-[#111]">
          
          {/* Left Controls */}
          <div className="flex gap-8">
            <Knob label="HPF" value={hpf} min={20} max={2000} onChange={setHpf} size={50} unit="Hz" />
            <Knob label="LPF" value={lpf} min={2000} max={20000} onChange={setLpf} size={50} unit="Hz" />
          </div>

          {/* Big Center Knob */}
          <div className="flex flex-col items-center gap-4">
            <Knob label="WARP AMOUNT" value={warpAmount} min={0} max={100} onChange={setWarpAmount} size={120} color="orange" unit="%" />
          </div>

          {/* Right Controls */}
          <div className="flex gap-8 items-center">
            <Knob label="DRIVE" value={drive} min={0} max={100} onChange={setDrive} size={50} color="orange" unit="%" />
            
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 text-center mb-1">MODEL</div>
              {['tape', 'tube', 'transfo'].map(model => (
                <button
                  key={model}
                  onClick={() => setSatModel(model as any)}
                  className={`text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded border transition-colors ${satModel === model ? 'bg-[#ff5500]/20 text-[#ff5500] border-[#ff5500]/50' : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:bg-neutral-800'}`}
                >
                  {model}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 ml-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">BYPASS</div>
              <button 
                onClick={() => setBypass(!bypass)}
                className={`w-12 h-20 rounded-full border-2 transition-colors relative flex justify-center ${bypass ? 'bg-red-950 border-red-900' : 'bg-neutral-900 border-neutral-700'}`}
              >
                <div className={`w-10 h-10 rounded-full absolute transition-all duration-300 shadow-lg ${bypass ? 'bottom-1 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'top-1 bg-neutral-400'}`}></div>
              </button>
            </div>
          </div>

        </div>

      </div>
      <audio ref={audioRef} loop crossOrigin="anonymous" />
    </div>
  );
}
