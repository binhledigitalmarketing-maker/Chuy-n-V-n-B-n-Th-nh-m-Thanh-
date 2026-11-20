import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  colorClass?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 38,
  colorClass = 'from-neutral-900 via-neutral-700 to-neutral-900',
}) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);
  const heightsRef = useRef<number[]>(bars.map(() => 15));
  const [, setTick] = React.useState(0);

  useEffect(() => {
    let animId: number;
    const updateBars = () => {
      if (isPlaying) {
        heightsRef.current = heightsRef.current.map((h, i) => {
          const time = Date.now() / 140;
          const sinFactor = Math.sin(time + i * 0.35);
          const target = 15 + Math.abs(sinFactor) * 70 + Math.random() * 15;
          return Math.round(target);
        });
        setTick((t) => t + 1);
        animId = requestAnimationFrame(updateBars);
      } else {
        heightsRef.current = heightsRef.current.map((h) => Math.max(10, Math.round(h * 0.85)));
        setTick((t) => t + 1);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateBars);
    } else {
      heightsRef.current = bars.map(() => 10);
      setTick((t) => t + 1);
    }

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, barCount]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-14 w-full px-2 overflow-hidden bg-neutral-50/80 rounded-xl border border-neutral-200">
      {bars.map((idx) => {
        const height = heightsRef.current[idx] || 10;
        return (
          <div
            key={idx}
            className={`w-[4px] rounded-full bg-gradient-to-t ${colorClass} transition-all duration-75`}
            style={{
              height: `${Math.min(100, Math.max(8, height))}%`,
              opacity: isPlaying ? 0.9 : 0.25,
            }}
          />
        );
      })}
    </div>
  );
};
