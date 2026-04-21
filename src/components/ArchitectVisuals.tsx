import { motion } from 'motion/react';
import { useMemo } from 'react';

export const SpectralVisualizer = () => {
  const bars = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-cyan-500/40 rounded-t-sm"
          animate={{
            height: [
              `${20 + Math.random() * 80}%`,
              `${20 + Math.random() * 80}%`,
              `${20 + Math.random() * 80}%`,
            ],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const TechnicalReadout = () => {
  return (
    <div className="flex flex-col gap-2 font-mono text-[8px] text-cyan-500/60 uppercase tracking-widest">
      <div className="flex justify-between border-b border-cyan-500/20 pb-1">
        <span>BIT_DEPTH</span>
        <span className="text-cyan-400">32_FLOAT</span>
      </div>
      <div className="flex justify-between border-b border-cyan-500/20 pb-1">
        <span>SAMPLE_RATE</span>
        <span className="text-cyan-400">192_KHZ</span>
      </div>
      <div className="flex justify-between border-b border-cyan-500/20 pb-1">
        <span>LATENCY</span>
        <span className="text-cyan-400">0.2_MS</span>
      </div>
      <div className="flex justify-between">
        <span>BUFFER_SIZE</span>
        <span className="text-cyan-400">64_SMPL</span>
      </div>
    </div>
  );
};

export const DataStream = () => {
  const lines = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  
  return (
    <div className="flex flex-col gap-1 font-mono text-[7px] text-cyan-500/30 overflow-hidden h-32 select-none">
      {lines.map((i) => (
        <motion.div
          key={i}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          {`0x${Math.random().toString(16).slice(2, 10).toUpperCase()} >> SYNC_OK >> ${Math.random() > 0.5 ? 'PROCESS' : 'IDLE'}`}
        </motion.div>
      ))}
      <motion.div
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-cyan-400/50"
      >
        {`>> LISTENING_FOR_INPUT...`}
      </motion.div>
    </div>
  );
};
