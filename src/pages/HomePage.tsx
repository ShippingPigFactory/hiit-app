import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import WorkoutBuilderModal from '../components/WorkoutBuilderModal';
import type { WorkoutTemplate } from '../types';

function formatDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function estimateDuration(t: WorkoutTemplate): number {
  return t.rounds * (t.workSeconds + t.restSeconds) + (t.rounds - 1) * t.restBetweenRoundsSeconds;
}

function WorkoutCard({ template, onStart, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: {
  template: WorkoutTemplate;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const dur = estimateDuration(template);

  const menuBtnStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '8px 12px',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-1)', textAlign: 'left', fontSize: 14,
    fontFamily: 'Barlow, sans-serif',
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '18px 16px',
        position: 'relative',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <h3 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 20, letterSpacing: '-0.01em', marginBottom: 2 }}>{template.name}</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>
              {template.rounds} rounds · {template.workSeconds}s work / {template.restSeconds}s rest
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '4px 8px', fontSize: 18 }}
          >⋯</button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px', zIndex: 50, minWidth: 140 }}>
              <button onClick={() => { setShowMenu(false); onEdit(); }} style={menuBtnStyle}>Edit</button>
              {!isFirst && <button onClick={() => { setShowMenu(false); onMoveUp(); }} style={menuBtnStyle}>↑ Move up</button>}
              {!isLast && <button onClick={() => { setShowMenu(false); onMoveDown(); }} style={menuBtnStyle}>↓ Move down</button>}
              <button onClick={() => { setShowMenu(false); onDelete(); }} style={{ ...menuBtnStyle, color: '#FF4444' }}>Delete</button>
            </div>
          )}
        </div>
      </div>

      {template.exercises.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {template.exercises.slice(0, 4).map((ex) => (
            <span key={ex.id} style={{ fontSize: 11, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>
              {ex.name}
            </span>
          ))}
          {template.exercises.length > 4 && (
            <span style={{ fontSize: 11, color: 'var(--text-2)' }}>+{template.exercises.length - 4}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace' }}>~{formatDuration(dur)}</span>
        <button
          onClick={onStart}
          style={{
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            color: '#fff',
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          START ▶
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, moveTemplate, history, settings } = useApp();
  const navigate = useNavigate();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  const recentSessions = history.slice(0, 3);

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--accent)' }}>BURN</h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>Ready to sweat?</p>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--accent-dim)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 18, color: 'var(--accent)' }}>{settings.weightKg}</span>
        </div>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: 12 }}>RECENT</h2>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recentSessions.map((s) => (
              <div key={s.id} style={{ minWidth: 130, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', flexShrink: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontFamily: 'Barlow, sans-serif' }}>
                  {new Date(s.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{s.caloriesBurned}kcal</span>
                  <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace' }}>{Math.round(s.durationSeconds / 60)}min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workouts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-2)' }}>WORKOUTS</h2>
        <button
          onClick={() => { setEditingTemplate(null); setShowBuilder(true); }}
          style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', cursor: 'pointer' }}
        >
          + NEW
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
        {templates.map((t, i) => (
          <WorkoutCard
            key={t.id}
            template={t}
            onStart={() => navigate(`/timer/${t.id}`)}
            onEdit={() => { setEditingTemplate(t); setShowBuilder(true); }}
            onDelete={() => deleteTemplate(t.id)}
            onMoveUp={() => moveTemplate(t.id, 'up')}
            onMoveDown={() => moveTemplate(t.id, 'down')}
            isFirst={i === 0}
            isLast={i === templates.length - 1}
          />
        ))}
      </div>

      {showBuilder && (
        <WorkoutBuilderModal
          initial={editingTemplate}
          onSave={(t) => {
            if (editingTemplate) {
              updateTemplate(t.id, t);
            } else {
              addTemplate(t);
            }
            setShowBuilder(false);
          }}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
