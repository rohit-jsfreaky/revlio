"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  animateOnScroll?: boolean;
}

export default function BlurText({
  text,
  className = "",
  delay = 0.03,
  duration = 0.5,
  yOffset = 20,
  animateOnScroll = true,
}: BlurTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const words = container.querySelectorAll(".blur-word");

    // Set initial state
    gsap.set(words, {
      opacity: 0,
      y: yOffset,
      filter: "blur(10px)",
    });

    const animate = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      gsap.to(words, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration,
        stagger: delay,
        ease: "power2.out",
      });
    };

    if (animateOnScroll) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "-50px" },
      );

      observer.observe(container);
      return () => observer.disconnect();
    } else {
      animate();
    }
  }, [delay, duration, yOffset, animateOnScroll]);

  return (
    <p ref={containerRef} className={className}>
      {text.split(" ").map((word, index) => (
        <span key={index} className="blur-word inline-block mr-[0.3em]">
          {word}
        </span>
      ))}
    </p>
  );
}
