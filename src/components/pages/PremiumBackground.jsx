import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export const Spotlight = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${springX}px ${springY}px, rgba(168, 85, 247, 0.15), transparent 80%)`,
      }}
    />
  );
};

export const BackgroundBeams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <motion.rect
          initial={{ x: "10%", opacity: 0 }}
          animate={{ x: "90%", opacity: [0, 1, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          width="1"
          height="100%"
          fill="url(#beam-grad)"
        />
        <motion.rect
          initial={{ x: "30%", opacity: 0 }}
          animate={{ x: "10%", opacity: [0, 0.5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
          width="1"
          height="100%"
          fill="url(#beam-grad)"
        />
        <motion.rect
          initial={{ x: "60%", opacity: 0 }}
          animate={{ x: "40%", opacity: [0, 0.8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 5 }}
          width="1"
          height="100%"
          fill="url(#beam-grad)"
        />
        <motion.rect
          initial={{ x: "80%", opacity: 0 }}
          animate={{ x: "20%", opacity: [0, 0.6, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 1 }}
          width="1"
          height="100%"
          fill="url(#beam-grad)"
        />
      </svg>
    </div>
  );
};

export const MeshBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050816]">
      <BackgroundBeams />
      {/* Aurora Effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-purple-600/20 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/20 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-indigo-500/20 blur-[120px]"
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.15]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 100%)'
        }}
      />
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </div>
  );
};

export const FloatingParticles = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-5">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          initial={{ x: `${p.x}%`, y: `${p.y}%`, opacity: 0 }}
          animate={{
            y: [`${p.y}%`, `${p.y - 20}%`],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ width: p.size, height: p.size }}
        />
      ))}
    </div>
  );
};
