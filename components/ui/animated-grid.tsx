"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AnimatedGridProps {
  className?: string;
  gridSize?: number;
  duration?: number;
  delay?: number;
}

export default function AnimatedGrid({
  className = "",
  gridSize = 30,
  duration = 8,
  delay = 0,
}: AnimatedGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const lines = gridRef.current.querySelectorAll(".grid-line");

    // Animate opacity subtly
    gsap.to(lines, {
      opacity: 0.15,
      duration: 2,
      stagger: {
        each: 0.02,
        from: "random",
      },
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
      delay,
    });

    // Add mouse follow effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      gsap.to(containerRef.current, {
        "--mouse-x": `${x}%`,
        "--mouse-y": `${y}%`,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    containerRef.current?.addEventListener("mousemove", handleMouseMove);

    return () => {
      containerRef.current?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [delay, duration]);

  const lines = [];
  for (let i = 0; i <= 100; i += gridSize) {
    // Horizontal lines
    lines.push(
      <div
        key={`h-${i}`}
        className="grid-line absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-brand/20 to-transparent"
        style={{ top: `${i}%`, opacity: 0.05 }}
      />,
    );
    // Vertical lines
    lines.push(
      <div
        key={`v-${i}`}
        className="grid-line absolute top-0 bottom-0 w-px bg-linear-to-b from-transparent via-brand/20 to-transparent"
        style={{ left: `${i}%`, opacity: 0.05 }}
      />,
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Gradient overlay following mouse */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), oklch(0.55 0.17 230 / 0.15), transparent 40%)`,
        }}
      />

      {/* Grid lines */}
      <div ref={gridRef} className="absolute inset-0">
        {lines}
      </div>

      {/* Corner glow effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-brand/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-brand/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
    </div>
  );
}
