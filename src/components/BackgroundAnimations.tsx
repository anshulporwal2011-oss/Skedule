import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export function RainAnimation() {
  const drops = useMemo(() => [...Array(15)].map(() => ({
    left: `${Math.random() * 100}%`,
    duration: 0.5 + Math.random() * 0.5,
    delay: Math.random() * 2
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          className="absolute bg-blue-400/40 w-[1px] h-3 rounded-full"
          initial={{ top: -20, left: drop.left }}
          animate={{ top: '120%' }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: "linear",
            delay: drop.delay
          }}
        />
      ))}
    </div>
  );
}

export function SnowAnimation() {
  const flakes = useMemo(() => [...Array(15)].map(() => ({
    leftStart: `${Math.random() * 100}%`,
    leftEnd: `${(Math.random() * 100) + (Math.random() * 10 - 5)}%`,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map((flake, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/60 w-1 h-1 rounded-full"
          initial={{ top: -10, left: flake.leftStart }}
          animate={{ 
            top: '110%',
            left: [flake.leftStart, flake.leftEnd]
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            ease: "linear",
            delay: flake.delay
          }}
        />
      ))}
    </div>
  );
}

export function StarAnimation() {
  const stars = useMemo(() => [...Array(12)].map(() => ({
    width: Math.random() * 1.5 + 0.5 + 'px',
    height: Math.random() * 1.5 + 0.5 + 'px',
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 5
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: star.width,
            height: star.height,
            top: star.top,
            left: star.left,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
            delay: star.delay
          }}
        />
      ))}
    </div>
  );
}

export function MorningAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      <motion.div
        className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/40 rounded-full blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute top-8 -left-10 w-24 h-8 bg-white/60 rounded-full blur-md"
        animate={{ x: [-20, 160] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function AfternoonAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      <motion.div
        className="absolute -top-12 -right-4 w-40 h-40 bg-amber-400/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute top-1/4 -left-12 w-32 h-10 bg-white/70 rounded-full blur-lg"
        animate={{ x: [-40, 180] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function EveningAnimation() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
      <motion.div
        className="absolute -bottom-10 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/40 via-pink-500/20 to-transparent blur-xl"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div
        className="absolute top-1/3 -left-10 w-28 h-6 bg-pink-200/40 rounded-full blur-md"
        animate={{ x: [-30, 160] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
