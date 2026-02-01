"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface FloatingOrbsProps {
  className?: string;
  count?: number;
}

export default function FloatingOrbs({
  className = "",
  count = 3,
}: FloatingOrbsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const orbs = containerRef.current.querySelectorAll(".floating-orb");

    orbs.forEach((orb, index) => {
      // Random floating animation
      gsap.to(orb, {
        x: `random(-50, 50)`,
        y: `random(-50, 50)`,
        duration: `random(4, 8)`,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: index * 0.5,
      });

      // Scale breathing effect
      gsap.to(orb, {
        scale: `random(0.8, 1.2)`,
        duration: `random(3, 6)`,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: index * 0.3,
      });
    });
  }, []);

  const orbConfigs = [
    {
      size: "w-96 h-96",
      position: "top-0 left-1/4",
      gradient: "from-brand/30 via-brand/10 to-transparent",
      blur: "blur-3xl",
    },
    {
      size: "w-80 h-80",
      position: "bottom-1/4 right-1/4",
      gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      blur: "blur-3xl",
    },
    {
      size: "w-64 h-64",
      position: "top-1/3 right-1/3",
      gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
      blur: "blur-2xl",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {orbConfigs.slice(0, count).map((config, index) => (
        <div
          key={index}
          className={`floating-orb absolute ${config.size} ${config.position} rounded-full bg-gradient-radial ${config.gradient} ${config.blur}`}
        />
      ))}
    </div>
  );
}
