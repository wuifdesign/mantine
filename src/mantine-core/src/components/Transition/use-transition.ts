import { useState, useEffect, useRef } from 'react';
import { useReducedMotion, useDidUpdate } from '@mantine/hooks';
import { useMantineTheme } from '../../core';

export type TransitionStatus =
  | 'entered'
  | 'exited'
  | 'entering'
  | 'exiting'
  | 'pre-exiting'
  | 'pre-entering';

interface UseTransition {
  duration: number;
  exitDuration: number;
  timingFunction: string;
  mounted: boolean;
  runOnInitialRender?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
  onEntered?: () => void;
  onExited?: () => void;
}

export function useTransition({
  duration,
  exitDuration,
  timingFunction,
  mounted,
  runOnInitialRender,
  onEnter,
  onExit,
  onEntered,
  onExited,
}: UseTransition) {
  const theme = useMantineTheme();
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = theme.respectReducedMotion ? shouldReduceMotion : false;
  const [transitionDuration, setTransitionDuration] = useState(reduceMotion ? 0 : duration);
  const initialValue = runOnInitialRender ? !mounted : mounted;
  const [transitionStatus, setStatus] = useState<TransitionStatus>(initialValue ? 'entered' : 'exited');
  const timeoutRef = useRef<number>(-1);

  const handleStateChange = (shouldMount: boolean) => {
    const preHandler = shouldMount ? onEnter : onExit;
    const handler = shouldMount ? onEntered : onExited;

    setStatus(shouldMount ? 'pre-entering' : 'pre-exiting');
    window.clearTimeout(timeoutRef.current);

    const newTransitionDuration = reduceMotion ? 0 : shouldMount ? duration : exitDuration;
    setTransitionDuration(newTransitionDuration);

    if (newTransitionDuration === 0) {
      typeof preHandler === 'function' && preHandler();
      typeof handler === 'function' && handler();
      setStatus(shouldMount ? 'entered' : 'exited');
    } else {
      const preStateTimeout = window.setTimeout(() => {
        typeof preHandler === 'function' && preHandler();
        setStatus(shouldMount ? 'entering' : 'exiting');
      }, 10);

      timeoutRef.current = window.setTimeout(() => {
        window.clearTimeout(preStateTimeout);
        typeof handler === 'function' && handler();
        setStatus(shouldMount ? 'entered' : 'exited');
      }, newTransitionDuration);
    }
  };

  useDidUpdate(() => {
    handleStateChange(mounted);
  }, [mounted]);

  useEffect(() => {
    if (runOnInitialRender) {
      handleStateChange(mounted);
    }
  }, []);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return {
    transitionDuration,
    transitionStatus,
    transitionTimingFunction: timingFunction || 'ease',
  };
}
