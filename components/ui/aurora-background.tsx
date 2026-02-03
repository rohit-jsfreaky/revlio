"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export default function AuroraBackground({
  className,
  children,
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-slate-950",
        className
      )}
    >
      {/* Aurora gradients */}
      <div className="pointer-events-none absolute inset-0">
        {/* Primary aurora blob */}
        <div
          className="absolute -left-1/4 top-0 h-[600px] w-[600px] animate-aurora-1 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Secondary aurora blob */}
        <div
          className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] animate-aurora-2 rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* Tertiary aurora blob */}
        <div
          className="absolute -bottom-1/4 left-1/3 h-[400px] w-[700px] animate-aurora-3 rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(ellipse, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        {/* Accent glow */}
        <div
          className="absolute right-1/4 top-1/2 h-[300px] w-[300px] animate-aurora-4 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 60%)",
            filter: "blur(50px)",
          }}
        />
      </div>
      
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
