import { motion } from 'motion/react';
import { Activity, Cpu, Database, Disc, Settings, Terminal, Zap } from 'lucide-react';

export const LEDIndicator = ({ active = false, color = 'cyan' }: { active?: boolean, color?: 'cyan' | 'emerald' | 'red' }) => {
  const colors = {
    cyan: 'from-cyan-400 to-cyan-600',
    emerald: 'from-emerald-400 to-emerald-600',
    red: 'from-red-400 to-red-600'
  };
  
  const glowColors = {
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500'
  };

  return (
    <div className="relative flex items-center justify-center w-4 h-4">
      <div className="w-3 h-3 rounded-full border border-slate-700 bg-slate-900 overflow-hidden">
        {active && <div className={`w-full h-full bg-gradient-to-br ${colors[color]}`} />}
      </div>
      {active && (
        <motion.div 
          className={`absolute inset-0 rounded-full blur-md ${glowColors[color]}`}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export const PurityBadge = ({ value = 95 }: { value?: number }) => (
  <div className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
    {value}% PURE
  </div>
);

export const StatusLabel = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] font-mono text-text-muted uppercase tracking-[0.2em]">{label}</span>
    <span className="text-[11px] font-mono text-cyan-400 text-shadow-glow">{value}</span>
  </div>
);

export const Header = () => (
  <header className="fixed top-0 left-0 right-0 h-10 z-[9999] bg-background-deep/80 backdrop-blur-md border-b border-slate-700/50 px-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <LEDIndicator active />
        <span className="text-xs font-tech font-bold tracking-widest text-cyan-400 text-shadow-glow">SYSTEM_ACTIVE</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-700" />
      <div className="flex items-center gap-3">
        <StatusLabel label="CORE_TEMP" value="42.5°C" />
        <StatusLabel label="SYNC_RATE" value="128.0 BPM" />
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Activity className="w-3 h-3 text-emerald-400" />
        <span className="text-[9px] font-mono text-emerald-400">SIGNAL_STABLE</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-500 hover:text-cyan-400 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <button className="text-slate-500 hover:text-cyan-400 transition-colors">
          <Terminal className="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
);

export const Sidebar = () => (
  <aside className="fixed left-4 top-24 bottom-4 w-12 z-10 flex flex-col gap-4 items-center py-4 glass-panel">
    <div className="flex flex-col gap-6">
      <button className="p-2 text-cyan-400 bg-cyan-900/20 border border-cyan-500/30 rounded-lg shadow-lg shadow-cyan-900/20">
        <Cpu className="w-5 h-5" />
      </button>
      <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
        <Database className="w-5 h-5" />
      </button>
      <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
        <Disc className="w-5 h-5" />
      </button>
      <button className="p-2 text-slate-500 hover:text-cyan-400 transition-colors">
        <Zap className="w-5 h-5" />
      </button>
    </div>
    <div className="mt-auto flex flex-col gap-4 items-center">
      <div className="w-1 h-12 bg-slate-800 rounded-full relative overflow-hidden">
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-cyan-500"
          animate={{ height: ['20%', '80%', '40%', '90%', '60%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <span className="text-[8px] font-mono text-slate-600 vertical-text">PWR_LVL</span>
    </div>
  </aside>
);
