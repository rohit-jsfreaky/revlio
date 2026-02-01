"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { gsap } from "gsap";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  splitType?: "chars" | "words" | "lines";
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "center" | "right";
  onAnimationComplete?: () => void;
}

export default function SplitText({
  text,
  className = "",
  delay = 0.05,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const splitContent = useMemo(() => {
    if (splitType === "chars") {
      return text.split("").map((char, index) => (
        <span
          key={index}
          className="split-char inline-block"
          style={{ opacity: 0 }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ));
    } else if (splitType === "words") {
      return text.split(" ").map((word, index) => (
        <span
          key={index}
          className="split-word inline-block mr-[0.25em]"
          style={{ opacity: 0 }}
        >
          {word}
        </span>
      ));
    } else {
      return text.split("\n").map((line, index) => (
        <span key={index} className="split-line block" style={{ opacity: 0 }}>
          {line}
        </span>
      ));
    }
  }, [text, splitType]);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(
      splitType === "chars"
        ? ".split-char"
        : splitType === "words"
          ? ".split-word"
          : ".split-line",
    );

    gsap.fromTo(elements, from, {
      ...to,
      duration,
      stagger: delay,
      ease,
      onComplete: onAnimationComplete,
    });
  }, [delay, duration, ease, from, to, splitType, onAnimationComplete]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animate, threshold, rootMargin]);

  return (
    <div ref={containerRef} className={className} style={{ textAlign }}>
      {splitContent}
    </div>
  );
}
