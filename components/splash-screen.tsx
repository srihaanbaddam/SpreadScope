"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3200),
      setTimeout(() => onComplete(), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-8">
        {}
        <div className="absolute inset-0 -m-32 overflow-hidden opacity-20">
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: phase >= 1 ? 1 : 0 }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-px bg-foreground/30"
                style={{
                  top: `${(i + 1) * 12.5}%`,
                  transform: `scaleX(${phase >= 1 ? 1 : 0})`,
                  transition: `transform 0.8s ease-out ${i * 0.05}s`,
                }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-px bg-foreground/30"
                style={{
                  left: `${(i + 1) * 12.5}%`,
                  transform: `scaleY(${phase >= 1 ? 1 : 0})`,
                  transition: `transform 0.8s ease-out ${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>

        {}
        <div
          className="relative h-16 w-64 transition-opacity duration-500"
          style={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          <svg viewBox="0 0 256 64" className="h-full w-full">
            {}
            <path
              d="M0,32 Q32,48 64,28 T128,36 T192,24 T256,32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground/40"
              style={{
                strokeDasharray: 300,
                strokeDashoffset: phase >= 2 ? 0 : 300,
                transition: "stroke-dashoffset 0.8s ease-out",
              }}
            />
            {}
            <line
              x1="0"
              y1="32"
              x2="256"
              y2="32"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4,4"
              className="text-foreground/20"
              style={{
                opacity: phase >= 2 ? 1 : 0,
                transition: "opacity 0.5s ease-out 0.3s",
              }}
            />
            {}
            {[
              { x: 32, y: 40 },
              { x: 64, y: 28 },
              { x: 96, y: 34 },
              { x: 128, y: 36 },
              { x: 160, y: 30 },
              { x: 192, y: 24 },
              { x: 224, y: 28 },
            ].map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="3"
                fill="currentColor"
                className="text-foreground"
                style={{
                  opacity: phase >= 2 ? 1 : 0,
                  transform: `scale(${phase >= 2 ? 1 : 0})`,
                  transformOrigin: `${point.x}px ${point.y}px`,
                  transition: `all 0.3s ease-out ${0.4 + i * 0.08}s`,
                }}
              />
            ))}
          </svg>
        </div>

        {}
        <div className="relative overflow-hidden">
          <h1
            className="font-sans text-4xl font-semibold tracking-tight text-foreground"
            style={{
              opacity: phase >= 3 ? 1 : 0,
              transform: `translateY(${phase >= 3 ? 0 : 20}px)`,
              transition: "all 0.6s ease-out",
            }}
          >
            SpreadScope
          </h1>
        </div>

        {}
        <p
          className="font-sans text-sm tracking-widest text-muted-foreground uppercase"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: `translateY(${phase >= 3 ? 0 : 10}px)`,
            transition: "all 0.5s ease-out 0.2s",
          }}
        >
          Statistical Pairs Trading
        </p>

        {}
        <div
          className="h-px w-48 bg-border overflow-hidden"
          style={{
            opacity: phase >= 1 && phase < 4 ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <div
            className="h-full bg-foreground"
            style={{
              width: `${Math.min((phase / 3) * 100, 100)}%`,
              transition: "width 0.5s ease-out",
            }}
          />
        </div>
      </div>

      {}
      <div
        className="absolute inset-0 bg-background pointer-events-none"
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transition: "opacity 0.5s ease-out",
        }}
      />
    </div>
  );
}
