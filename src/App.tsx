/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Howl } from 'howler';
import { 
  AudioLines, 
  ChevronRight, 
  ExternalLink, 
  Github, 
  Mail, 
  MessageSquare, 
  Play, 
  Twitter, 
  Waves 
} from 'lucide-react';

import ParticleBackground from './components/ParticleBackground';
import { Header, Sidebar, LEDIndicator, PurityBadge } from './components/HUD';
import { SpectralVisualizer, TechnicalReadout, DataStream } from './components/ArchitectVisuals';
import CharacterSheet from './components/CharacterSheet';

// Sound Effects
const playSound = (name: string) => {
  const sound = new Howl({
    src: [`https://assets.mixkit.co/sfx/preview/mixkit-interface-click-1126.mp3`], // Placeholder SFX
    volume: 0.3,
  });
  sound.play();
};

const stemColors = {
  vocals: '#a78bfa',
  drums: '#f87171',
  bass: '#60a5fa',
  other: '#facc15',
  piano: '#e879f9',
  guitar: '#fb923c',
  kick: '#ef4444',
  snare: '#fbbf24',
  toms: '#818cf8',
  cymbals: '#7dd3fc',
  instrumental: '#34d399'
};

const ProjectCard = ({ title, description, tags, link }: { title: string, description: string, tags: string[], link: string }) => (
  <motion.div 
    className="glass-panel p-6 flex flex-col gap-4 border-cyan-900/20 hover:border-cyan-500/50 transition-all group"
    whileHover={{ y: -5, scale: 1.02 }}
    onMouseEnter={() => playSound('hover_tick')}
  >
    <div className="flex justify-between items-start">
      <div className="p-2 rounded-lg bg-cyan-900/20 border border-cyan-500/30">
        <AudioLines className="w-5 h-5 text-cyan-400" />
      </div>
      <PurityBadge value={98} />
    </div>
    
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-tech font-bold tracking-wider text-text-primary group-hover:text-cyan-400 transition-colors uppercase">{title}</h3>
      <p className="text-xs font-mono text-text-secondary leading-relaxed">{description}</p>
    </div>
    
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag, i) => (
        <span key={i} className="text-[9px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wider">
          {tag}
        </span>
      ))}
    </div>
    
    <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-800">
      <div className="flex items-center gap-2">
        <LEDIndicator active color="emerald" />
        <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">STATUS_LIVE</span>
      </div>
      <a 
        href={link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[10px] font-mono text-text-muted hover:text-cyan-400 transition-colors flex items-center gap-1 uppercase tracking-widest"
      >
        VIEW_PROJECT <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  </motion.div>
);

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    playSound('process_start');
  }, []);

  return (
    <div className="min-h-screen bg-background-deep text-text-primary font-mono antialiased overflow-x-hidden">
      <ParticleBackground />
      <Header />
      <Sidebar />

      <main className="relative z-10 pt-24 pb-20 px-4 md:px-20 max-w-7xl mx-auto flex flex-col gap-32">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <img 
              src="https://primary.jwwb.nl/public/z/l/w/temp-ozipnbuvryhxyibklfdr/image-high-e600vq.png?enable-io=true&width=1000" 
              alt="The Beat Mob Logo" 
              className="w-48 md:w-64 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-cyan-500/50" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.5em] text-shadow-glow">ESTABLISHED_2024</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
            
            <h1 className="text-[2.8rem] md:text-[5rem] font-display font-bold tracking-[0.75em] text-text-primary leading-none uppercase text-3d-extruded glitch">
              STEM<span className="text-cyan-400">SPLIT</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-sm md:text-base font-mono text-text-secondary leading-relaxed tracking-wide mt-4">
              A dark, audio-production-focused aesthetic inspired by reactor interfaces, holographic displays, and vintage synthesizer panels.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button className="btn-primary flex items-center gap-2 group" onClick={() => playSound('click_engage')}>
              INITIALIZE_SYSTEM <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-secondary flex items-center gap-2" onClick={() => playSound('click_engage')}>
              VIEW_DOCUMENTATION <Play className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        {/* Architect of Sound Section */}
        <section id="about" className="flex flex-col gap-20">
          {/* Section Header - Full Width & Centered */}
          <div className="flex flex-col items-center text-center gap-8 max-w-5xl mx-auto w-full">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-[1px] bg-cyan-500/30" />
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.6em] text-shadow-glow">SYSTEM_ARCHITECT_V1.2</span>
              <div className="w-12 h-[1px] bg-cyan-500/30" />
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-8xl font-display font-bold text-text-primary leading-none uppercase tracking-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              THE ARCHITECT <br className="hidden md:block" />
              <span className="text-cyan-400 glitch" data-text="OF SOUND">OF SOUND</span>
            </motion.h2>

            <motion.div 
              className="relative px-10 py-3 border-x border-cyan-500/20"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: 'auto' }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 1 }}
            >
              <p className="text-sm md:text-lg font-mono text-cyan-400 uppercase tracking-[0.8em] whitespace-nowrap">
                CREATIVE_SYSTEMS_ENGINEERING
              </p>
              {/* HUD Corner Accents */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            {/* Visual Column (Left) */}
            <div className="lg:col-span-5 relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative w-full aspect-square max-w-md mx-auto"
            >
              {/* HUD Rings */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/10 animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-cyan-500/5 animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute inset-16 rounded-full border-2 border-cyan-500/20 animate-[spin_40s_linear_infinite]" />
              
              {/* Main Visual Container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-72 h-72 rounded-full bg-slate-950 border border-cyan-500/30 shadow-[0_0_80px_rgba(34,211,238,0.1)] overflow-hidden group-hover:border-cyan-400 group-hover:shadow-[0_0_100px_rgba(34,211,238,0.2)] transition-all duration-700">
                  <img 
                    src="https://pngimg.com/d/subwoofer_PNG18.png" 
                    alt="Architect Visual" 
                    className="w-full h-full object-contain p-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  {/* Scanning Line */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-1/4 w-full -translate-y-full animate-[scan_4s_linear_infinite]" />
                  
                  {/* Internal HUD Overlays */}
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-cyan-500/10 rounded-full animate-pulse" />
                </div>
              </div>

              {/* External HUD Annotations */}
              <motion.div 
                className="absolute -top-4 -left-4 p-3 border-l-2 border-t-2 border-cyan-500/50 bg-slate-950/80 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-mono text-cyan-500 uppercase tracking-widest">CORE_VIBRATION_SYNC</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono text-emerald-400">LOCKED_ON_TARGET</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-4 -right-4 p-3 border-r-2 border-b-2 border-cyan-500/50 bg-slate-950/80 backdrop-blur-sm"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <TechnicalReadout />
              </motion.div>

              {/* Floating Coordinates */}
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 flex flex-col gap-1 text-[7px] font-mono text-cyan-500/40 vertical-text">
                <span>X: 128.42</span>
                <span>Y: 092.11</span>
                <span>Z: 004.88</span>
              </div>
            </motion.div>
          </div>

            {/* Content Column (Right) */}
            <div className="lg:col-span-7 flex flex-col gap-12">
              <motion.div 
                className="flex flex-col gap-8 text-text-secondary font-mono text-base leading-relaxed"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <p className="border-l-2 border-slate-800 pl-8 py-3 hover:border-cyan-500/50 transition-colors bg-slate-900/5">
                  My journey began in the high-pressure environment of the recording studio, where I became obsessed with the <strong className="text-cyan-400">physics of sound</strong> and the intricate dance between technology and human emotion.
                </p>
                <p className="border-l-2 border-slate-800 pl-8 py-3 hover:border-cyan-500/50 transition-colors bg-slate-900/5">
                  As I pushed the limits of traditional tools, I realized that the future of media wasn't just in the art we make, but in the <strong className="text-cyan-400">systems we build</strong>. This led me to transition from audio engineering to media systems design.
                </p>
                <p className="border-l-2 border-slate-800 pl-8 py-3 hover:border-cyan-500/50 transition-colors bg-slate-900/5">
                  Today, I bridge the gap between <strong className="text-cyan-400">creative intuition and engineering precision</strong>. Whether I'm developing a new VST plugin or architecting a cloud-based media system.
                </p>
              </motion.div>

              <motion.div 
                className="flex flex-col gap-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                <div className="glass-panel p-6 flex flex-col gap-6 border-cyan-500/10">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">SPECTRAL_ANALYSIS</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-cyan-500/50 rounded-full" />
                    </div>
                  </div>
                  <SpectralVisualizer />
                  <div className="h-[1px] w-full bg-slate-800/50" />
                  <DataStream />
                </div>
              </motion.div>
            </div>

            <motion.div 
              className="flex flex-wrap items-center gap-8 pt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">SIGNATURE_AUTH</span>
                <span className="text-xl font-tech font-bold text-text-primary tracking-[0.2em]">— BRIAN_JUTZ</span>
              </div>
              <div className="h-12 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-text-muted uppercase tracking-widest">DESIGNATION</span>
                <div className="flex items-center gap-2">
                  <LEDIndicator active color="cyan" />
                  <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">PRINCIPAL_SYSTEMS_ENGINEER</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Character Sheet Section */}
        <section id="attributes">
          <CharacterSheet />
        </section>

        {/* Stem Analysis Section */}
        <section id="analysis" className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 items-center text-center">
            <div className="flex items-center gap-3">
              <AudioLines className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-tech font-bold tracking-[0.3em] text-text-primary uppercase">STEM_DECOMPOSITION</h2>
            </div>
            <p className="text-xs font-mono text-text-muted uppercase tracking-widest">REAL_TIME_SPECTRAL_ANALYSIS_AND_EXTRACTION</p>
          </div>

          <div className="glass-panel p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Object.entries(stemColors).map(([name, color], i) => (
              <motion.div 
                key={i}
                className="flex flex-col items-center gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/30 transition-all group"
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-all"
                  style={{ 
                    backgroundColor: `${color}20`, 
                    border: `1px solid ${color}50`,
                    boxShadow: `0 0 15px ${color}30`
                  }}
                >
                  <Waves className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color }}>{name}</span>
                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full"
                    style={{ backgroundColor: color }}
                    animate={{ width: ['20%', '80%', '40%', '90%', '60%'] }}
                    transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="flex flex-col gap-12">
          <div className="flex flex-col gap-2 items-center text-center">
            <div className="flex items-center gap-3">
              <Waves className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-tech font-bold tracking-[0.3em] text-text-primary uppercase">PROJECT_REPOSITORY</h2>
            </div>
            <p className="text-xs font-mono text-text-muted uppercase tracking-widest">ACTIVE_DEPLOYMENTS_AND_EXPERIMENTS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectCard 
              title="STEMSPLIT"
              description="High-performance audio processing engine with AI-driven stem separation and real-time analysis."
              tags={["AUDIO", "AI", "SYSTEMS"]}
              link="https://myaiplug.github.io/DeepSplit/"
            />
            <ProjectCard 
              title="CYBER_HUD_UI"
              description="A comprehensive design system for audio-centric applications, focusing on high-density data visualization."
              tags={["UI", "UX", "DESIGN"]}
              link="#"
            />
            <ProjectCard 
              title="WAVE_FORM_GEN"
              description="Procedural waveform generator for vintage synthesizer emulation and holographic visualization."
              tags={["DSP", "SYNTH", "WEBGL"]}
              link="#"
            />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="flex flex-col gap-12 max-w-2xl mx-auto w-full">
          <div className="flex flex-col gap-2 items-center text-center">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-orange-500" />
              <h2 className="text-2xl font-tech font-bold tracking-[0.3em] text-text-primary uppercase">COMM_CHANNEL</h2>
            </div>
            <p className="text-xs font-mono text-text-muted uppercase tracking-widest">ESTABLISH_CONNECTION_WITH_THE_CORE</p>
          </div>

          <div className="glass-panel p-8 flex flex-col gap-6 border-orange-900/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-text-muted uppercase tracking-widest">IDENTIFIER</label>
                <input type="text" placeholder="USER_NAME" className="input-field" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-text-muted uppercase tracking-widest">ENCRYPTED_MAIL</label>
                <input type="email" placeholder="USER@DOMAIN.COM" className="input-field" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-text-muted uppercase tracking-widest">TRANSMISSION_DATA</label>
              <textarea rows={4} placeholder="ENTER_MESSAGE_HERE..." className="input-field resize-none" />
            </div>
            <button className="btn-primary w-full bg-orange-900 border-orange-500 shadow-orange-900/50 hover:bg-orange-800" onClick={() => playSound('click_engage')}>
              SEND_TRANSMISSION
            </button>
          </div>

          <div className="flex justify-center gap-8">
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Github className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">GITHUB</span>
            </a>
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
              <Twitter className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">TWITTER</span>
            </a>
            <a href="#" className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-mono uppercase tracking-widest">DISCORD</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-800/50 text-center">
        <div className="flex flex-col gap-2">
          <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.3em]">
            © 2024 NO_DAW_STUDIO // CYBER_HUD_V1.2
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest">ALL_SYSTEMS_OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
