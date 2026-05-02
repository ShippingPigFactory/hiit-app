import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTimer } from '../hooks/useTimer';
import type { TimerPhase, WorkoutSession } from '../types';

const PHASE_LABELS: Record<TimerPhase, string> = {
  idle: 'READY',
  preparing: 'GET READY',
  working: 'WORK',
  resting: 'REST',
  resting_between_rounds: 'RECOVER',
  complete: 'DONE!',
};

const PHASE_COLORS: Record<TimerPhase, string> = {
  idle: 'var(--text-2)',
  preparing: '#FFA500',
  working: 'var(--accent)',
  resting: 'var(--rest-color)',
  resting_between_rounds: 'var(--rest-color)',
  complete: 'var(--success)',
};

function CircleTimer({ timeLeft, totalTime, phase }: { timeLeft: number; totalTime: number; phase: TimerPhase }) {
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 1;
  const offset = circumference * (1 - progress);
  const color = PHASE_COLORS[phase];

  return (
    <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="280" height="280" style={{ position: 'absolute', inset: 0 }}>
        <circle
          cx="140" cy="140" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx="140" cy="140" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transform: 'rotate(-90deg)', transformOrigin: '140px 140px', transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
        />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: 72,
            lineHeight: 1,
            color,
            textShadow: `0 0 20px ${color}50`,
            transition: 'color 0.3s ease',
          }}
        >
          {timeLeft}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-2)', marginTop: 4 }}>
          SECONDS
        </div>
      </div>
    </div>
  );
}

export default function TimerPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const { templates, settings, addSession } = useApp();
  const navigate = useNavigate();
  const sessionSavedRef = useRef(false);

  const template = templates.find((t) => t.id === templateId);

  const { state, start, pause, resume, skip, reset } = useTimer({
    template: template!,
    weightKg: settings.weightKg,
    soundEnabled: settings.soundEnabled,
    onComplete: (durationSeconds, calories, rounds) => {
      if (sessionSavedRef.current) return;
      sessionSavedRef.current = true;
      const session: WorkoutSession = {
        id: Math.random().toString(36).slice(2),
        templateId: template?.id,
        name: template?.name ?? 'Custom Workout',
        date: new Date().toISOString(),
        durationSeconds,
        caloriesBurned: calories,
        roundsCompleted: rounds,
        completed: true,
      };
      addSession(session);
    },
  });

  useEffect(() => {
    if (!template) navigate('/');
  }, [template, navigate]);

  if (!template) return null;

  const color = PHASE_COLORS[state.phase];
  const totalTime =
    state.phase === 'preparing' ? 5 :
    state.phase === 'working' ? template.workSeconds :
    state.phase === 'resting' ? template.restSeconds :
    state.phase === 'resting_between_rounds' ? template.restBetweenRoundsSeconds :
    1;

  const handleStop = () => {
    reset();
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        transition: 'background 0.5s ease',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, marginBottom: 8 }}>
        <button
          onClick={handleStop}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer' }}
        >
          ← STOP
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 18, letterSpacing: '-0.01em' }}>{template.name}</div>
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--text-2)' }}>
          {Math.floor(state.totalElapsedSeconds / 60)}:{(state.totalElapsedSeconds % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Phase label */}
      <div style={{ marginTop: 16, marginBottom: 12 }}>
        <div
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 900,
            fontSize: 32,
            letterSpacing: '0.08em',
            color,
            textShadow: `0 0 16px ${color}80`,
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
            animation: state.phase === 'working' ? 'phase-pulse 1s ease-in-out infinite' : 'none',
          }}
        >
          {PHASE_LABELS[state.phase]}
        </div>
      </div>

      {/* Circle Timer */}
      <CircleTimer timeLeft={state.timeLeft} totalTime={totalTime} phase={state.phase} />

      {/* Round counter */}
      <div style={{ display: 'flex', gap: 6, marginTop: 20, marginBottom: 8 }}>
        {Array.from({ length: template.rounds }).map((_, i) => (
          <div
            key={i}
            style={{
              width: Math.min(32, Math.floor(280 / template.rounds) - 6),
              height: 6,
              borderRadius: 3,
              background: i < state.currentRound - 1
                ? 'var(--accent)'
                : i === state.currentRound - 1 && state.phase !== 'idle'
                ? color
                : 'var(--border)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em' }}>
        ROUND {state.phase !== 'idle' ? state.currentRound : '—'} / {template.rounds}
      </div>

      {/* Current exercise */}
      {template.exercises.length > 0 && state.phase === 'working' && (
        <div style={{ marginTop: 16, padding: '10px 20px', background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 12, textAlign: 'center' }}>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '0.05em', color: 'var(--accent)' }}>
            {template.exercises[(state.currentRound - 1) % template.exercises.length]?.name}
          </span>
        </div>
      )}

      {/* Live stats */}
      {state.phase !== 'idle' && state.phase !== 'complete' && (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{Math.round(state.totalCalories)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>KCAL</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22, color: 'var(--text-1)' }}>{Math.floor(state.totalElapsedSeconds / 60)}:{(state.totalElapsedSeconds % 60).toString().padStart(2, '0')}</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>ELAPSED</div>
          </div>
        </div>
      )}

      {/* Complete state */}
      {state.phase === 'complete' && (
        <div style={{ marginTop: 24, padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', textAlign: 'center', animation: 'scale-in 0.3s ease-out' }}>
          <div style={{ fontSize: 48 }}>🔥</div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 28, letterSpacing: '-0.01em', marginBottom: 16 }}>WORKOUT COMPLETE!</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 28, color: 'var(--accent)' }}>{Math.round(state.totalCalories)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>KCAL</div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 28, color: 'var(--text-1)' }}>{Math.floor(state.totalElapsedSeconds / 60)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>MINUTES</div>
            </div>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 28, color: 'var(--text-1)' }}>{state.currentRound}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>ROUNDS</div>
            </div>
          </div>
          <button
            onClick={handleStop}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: 12, padding: '14px 40px', color: '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 18, letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            BACK HOME
          </button>
        </div>
      )}

      {/* Controls */}
      {state.phase !== 'complete' && (
        <div style={{ display: 'flex', gap: 16, marginTop: 'auto', paddingBottom: 40, paddingTop: 24, alignItems: 'center' }}>
          {state.phase === 'idle' ? (
            <button
              onClick={start}
              style={{
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '50%',
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 0 30px var(--accent-glow)',
                fontSize: 28,
              }}
            >
              ▶
            </button>
          ) : (
            <>
              <button
                onClick={state.isRunning ? pause : resume}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 72,
                  height: 72,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px var(--accent-glow)',
                  fontSize: 24,
                }}
              >
                {state.isRunning ? '⏸' : '▶'}
              </button>
              <button
                onClick={skip}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '50%',
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 18,
                  color: 'var(--text-2)',
                }}
              >
                ⏭
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
