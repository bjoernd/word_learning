// ABOUTME: Component that renders lottie-based confetti animations at specified screen positions.
// ABOUTME: Supports optional completion callbacks and automatic cleanup on unmount.
import { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import styles from './Practice.module.css';

interface ConfettiAnimationProps {
  top: number;
  left: number;
  onComplete?: () => void;
  animationData: unknown;
}

export function ConfettiAnimation({ top, left, onComplete, animationData }: ConfettiAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'canvas',
        loop: false,
        autoplay: true,
        animationData: animationData,
      });

      if (onComplete) {
        animRef.current.addEventListener('complete', onComplete);
      }

      return () => {
        animRef.current?.destroy();
      };
    }
    // onComplete intentionally omitted from deps to prevent animation restart on re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.confettiOverlay}
      style={{
        top: `${top}%`,
        left: `${left}%`,
      }}
    />
  );
}
