import { motion } from 'motion/react';
import { User, Shield, Zap, Target, Award, Code, Music, Layers } from 'lucide-react';

const Attribute = ({ icon: Icon, label, value, color = 'cyan', bgImage }: { icon: any, label: string, value: string, color?: string, bgImage?: string }) => (
  <motion.div 
    className="relative flex items-center gap-4 p-3 glass-panel border-cyan-900/20 hover:border-cyan-500/30 transition-colors group overflow-hidden"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {bgImage && (
      <div 
        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
    )}
    <div className={`relative z-10 p-2 rounded-lg bg-${color}-900/20 border border-${color}-500/30 group-hover:shadow-lg group-hover:shadow-${color}-900/50 transition-all`}>
      <Icon className={`w-5 h-5 text-${color}-400`} />
    </div>
    <div className="relative z-10 flex flex-col">
      <span className="text-[9px] font-mono text-text-muted uppercase tracking-[0.2em]">{label}</span>
      <span className="text-sm font-tech font-bold text-text-primary group-hover:text-cyan-400 transition-colors">{value}</span>
    </div>
  </motion.div>
);

const SkillBar = ({ label, level }: { label: string, level: number }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center px-1">
      <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">{label}</span>
      <span className="text-[10px] font-mono text-cyan-400">{level}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
      <motion.div 
        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        initial={{ width: 0 }}
        animate={{ width: `${level}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
      />
    </div>
  </div>
);

export default function CharacterSheet() {
  const attributes = [
    { icon: Music, label: "CLASS", value: "AUDIO_ENGINEER", color: "cyan" },
    { icon: Code, label: "SUBCLASS", value: "SYSTEMS_ENGINEER", color: "emerald" },
    { icon: Layers, label: "SPECIALTY", value: "AI_AUTOMATION", color: "orange" },
    { icon: Zap, label: "POWER_SOURCE", value: "THE_BEAT_MOB", color: "red", bgImage: "https://primary.jwwb.nl/public/z/l/w/temp-ozipnbuvryhxyibklfdr/whiteguuy-high.png?enable-io=true&crop=1%3A1&width=347" }
  ];

  const skills = [
    { label: "AUDIO_PRODUCTION", level: 98 },
    { icon: Code, label: "WEB_DEVELOPMENT", level: 92 },
    { icon: Target, label: "AI_INTEGRATION", level: 85 },
    { icon: Shield, label: "CREATIVE_BRANDING", level: 88 }
  ];

  return (
    <div className="flex flex-col gap-12 w-full max-w-5xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-tech font-bold tracking-[0.3em] text-text-primary uppercase">CHARACTER_PROFILE</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image Box */}
            <motion.div 
              className="w-full sm:w-48 aspect-square flex-shrink-0 glass-panel border-cyan-500/30 overflow-hidden relative group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src="https://public-files.gumroad.com/k9qxxigmgywqgkysf0s7tek939vr" 
                alt="Character Portrait"
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              {/* HUD Elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-background-deep/60 to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 text-[7px] font-mono text-cyan-500/40">ID: BJ_001</div>
              <div className="absolute bottom-2 right-2 text-[7px] font-mono text-cyan-500/40">SCAN_ACTIVE</div>
              
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-500/60" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-500/60" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-500/60" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-500/60" />
              
              {/* Scanning Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-1/4 w-full -translate-y-full animate-[scan_3s_linear_infinite] pointer-events-none" />
            </motion.div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 gap-3 flex-grow">
              {attributes.map((attr, i) => (
                <Attribute key={i} {...attr} />
              ))}
            </div>
          </div>
        </div>

        {/* Skills Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-tech font-bold tracking-[0.3em] text-text-primary uppercase">SKILL_LEVELS</h2>
          </div>
          <div className="glass-panel p-6 flex flex-col gap-6 border-emerald-500/10">
            {skills.map((skill, i) => (
              <SkillBar key={i} {...skill} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
