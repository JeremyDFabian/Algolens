import { useEffect, useState } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function usePlayback(stepCount: number) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= stepCount - 1) {
          setIsPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed, stepCount]);

  const goToStep = (nextIndex: number) => {
    setIsPlaying(false);
    setStepIndex(clamp(nextIndex, 0, stepCount - 1));
  };

  return {
    stepIndex: clamp(stepIndex, 0, stepCount - 1),
    isPlaying,
    speed,
    setSpeed,
    togglePlay: () => setIsPlaying((playing) => !playing),
    next: () => goToStep(stepIndex + 1),
    previous: () => goToStep(stepIndex - 1),
    reset: () => goToStep(0)
  };
}
