import { useCallback, useEffect, useRef, useState } from 'react';
import type { TimerPhase, WorkoutTemplate } from '../types';

interface TimerState {
  phase: TimerPhase;
  timeLeft: number;
  currentRound: number;
  isRunning: boolean;
  totalElapsedSeconds: number;
  totalCalories: number;
}

interface TimerConfig {
  template: WorkoutTemplate;
  weightKg: number;
  soundEnabled: boolean;
  onComplete: (durationSeconds: number, calories: number, rounds: number) => void;
}

function createBeep(freq: number, duration: number, volume = 0.4) {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
  } catch {
    // Audio not supported
  }
}

function playWorkStart() { createBeep(880, 0.15); setTimeout(() => createBeep(1100, 0.2), 160); }
function playRestStart() { createBeep(440, 0.3); }
function playCountdown() { createBeep(660, 0.1); }
function playComplete() {
  createBeep(660, 0.15);
  setTimeout(() => createBeep(880, 0.15), 170);
  setTimeout(() => createBeep(1100, 0.3), 340);
}

export function useTimer({ template, weightKg, soundEnabled, onComplete }: TimerConfig) {
  const [state, setState] = useState<TimerState>({
    phase: 'idle',
    timeLeft: template.workSeconds,
    currentRound: 1,
    isRunning: false,
    totalElapsedSeconds: 0,
    totalCalories: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  const configRef = useRef({ template, weightKg, soundEnabled });

  stateRef.current = state;
  configRef.current = { template, weightKg, soundEnabled };

  const caloriesPerSecond = useCallback((phase: TimerPhase) => {
    const { template: t, weightKg: w } = configRef.current;
    const met = phase === 'working' ? t.metValue : 1.5;
    return (met * w) / 3600;
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      const { template: t, soundEnabled: sound } = configRef.current;
      const newElapsed = prev.totalElapsedSeconds + 1;
      const cals = prev.totalCalories + caloriesPerSecond(prev.phase);

      if (prev.phase === 'preparing') {
        if (sound && prev.timeLeft <= 3 && prev.timeLeft > 1) playCountdown();
        if (prev.timeLeft <= 1) {
          if (sound) playWorkStart();
          return { ...prev, phase: 'working', timeLeft: t.workSeconds, totalElapsedSeconds: newElapsed, totalCalories: cals };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1, totalElapsedSeconds: newElapsed, totalCalories: cals };
      }

      if (prev.phase === 'working') {
        if (sound && prev.timeLeft <= 3 && prev.timeLeft > 1) playCountdown();
        if (prev.timeLeft <= 1) {
          const isLastRound = prev.currentRound >= t.rounds;
          if (isLastRound) {
            if (sound) playComplete();
            return { ...prev, phase: 'complete', timeLeft: 0, isRunning: false, totalElapsedSeconds: newElapsed, totalCalories: cals };
          }
          if (sound) playRestStart();
          const nextPhase = t.restSeconds > 0 ? 'resting' : 'working';
          const nextTime = t.restSeconds > 0 ? t.restSeconds : t.workSeconds;
          const nextRound = t.restSeconds > 0 ? prev.currentRound : prev.currentRound + 1;
          return { ...prev, phase: nextPhase, timeLeft: nextTime, currentRound: nextRound, totalElapsedSeconds: newElapsed, totalCalories: cals };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1, totalElapsedSeconds: newElapsed, totalCalories: cals };
      }

      if (prev.phase === 'resting') {
        if (prev.timeLeft <= 1) {
          const nextRound = prev.currentRound + 1;
          const isLastRound = nextRound > t.rounds;
          if (isLastRound) {
            if (sound) playComplete();
            return { ...prev, phase: 'complete', timeLeft: 0, isRunning: false, totalElapsedSeconds: newElapsed, totalCalories: cals };
          }
          if (t.restBetweenRoundsSeconds > 0 && prev.currentRound < t.rounds) {
            return { ...prev, phase: 'resting_between_rounds', timeLeft: t.restBetweenRoundsSeconds, currentRound: nextRound, totalElapsedSeconds: newElapsed, totalCalories: cals };
          }
          if (sound) playWorkStart();
          return { ...prev, phase: 'working', timeLeft: t.workSeconds, currentRound: nextRound, totalElapsedSeconds: newElapsed, totalCalories: cals };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1, totalElapsedSeconds: newElapsed, totalCalories: cals };
      }

      if (prev.phase === 'resting_between_rounds') {
        if (sound && prev.timeLeft <= 3 && prev.timeLeft > 1) playCountdown();
        if (prev.timeLeft <= 1) {
          if (sound) playWorkStart();
          return { ...prev, phase: 'working', timeLeft: t.workSeconds, totalElapsedSeconds: newElapsed, totalCalories: cals };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1, totalElapsedSeconds: newElapsed, totalCalories: cals };
      }

      return prev;
    });
  }, [caloriesPerSecond]);

  useEffect(() => {
    if (state.phase === 'complete' && state.totalElapsedSeconds > 0) {
      onComplete(state.totalElapsedSeconds, Math.round(state.totalCalories), state.currentRound);
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isRunning, tick]);

  const start = useCallback(() => {
    const prep = configRef.current.template;
    setState({
      phase: 'preparing',
      timeLeft: 5,
      currentRound: 1,
      isRunning: true,
      totalElapsedSeconds: 0,
      totalCalories: 0,
    });
    void prep;
  }, []);

  const pause = useCallback(() => setState((s) => ({ ...s, isRunning: false })), []);
  const resume = useCallback(() => setState((s) => ({ ...s, isRunning: true })), []);

  const skip = useCallback(() => {
    setState((prev) => {
      const { template: t, soundEnabled: sound } = configRef.current;
      if (prev.phase === 'preparing' || prev.phase === 'resting' || prev.phase === 'resting_between_rounds') {
        if (sound) playWorkStart();
        return { ...prev, phase: 'working', timeLeft: t.workSeconds };
      }
      if (prev.phase === 'working') {
        const isLastRound = prev.currentRound >= t.rounds;
        if (isLastRound) {
          if (sound) playComplete();
          return { ...prev, phase: 'complete', timeLeft: 0, isRunning: false };
        }
        if (sound) playRestStart();
        return { ...prev, phase: 'resting', timeLeft: t.restSeconds, currentRound: prev.currentRound };
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      phase: 'idle',
      timeLeft: template.workSeconds,
      currentRound: 1,
      isRunning: false,
      totalElapsedSeconds: 0,
      totalCalories: 0,
    });
  }, [template]);

  return { state, start, pause, resume, skip, reset };
}
