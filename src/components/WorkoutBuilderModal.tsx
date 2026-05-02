import { useState } from 'react';
import type { WorkoutTemplate, Exercise } from '../types';

interface Props {
  initial?: WorkoutTemplate | null;
  onSave: (t: WorkoutTemplate) => void;
  onClose: () => void;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

const defaultForm = (): Omit<WorkoutTemplate, 'id' | 'createdAt'> => ({
  name: '',
  exercises: [{ id: uid(), name: '' }],
  rounds: 8,
  workSeconds: 20,
  restSeconds: 10,
  restBetweenRoundsSeconds: 0,
  metValue: 10,
});

export default function WorkoutBuilderModal({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          exercises: initial.exercises,
          rounds: initial.rounds,
          workSeconds: initial.workSeconds,
          restSeconds: initial.restSeconds,
          restBetweenRoundsSeconds: initial.restBetweenRoundsSeconds,
          metValue: initial.metValue,
        }
      : defaultForm()
  );

  function setField<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function addExercise() {
    setField('exercises', [...form.exercises, { id: uid(), name: '' }]);
  }

  function removeExercise(id: string) {
    setField('exercises', form.exercises.filter((e) => e.id !== id));
  }

  function updateExercise(id: string, name: string) {
    setField('exercises', form.exercises.map((e) => (e.id === id ? { ...e, name } : e)));
  }

  function handleSave() {
    if (!form.name.trim()) return;
    const exercises: Exercise[] = form.exercises.filter((e) => e.name.trim());
    onSave({
      id: initial?.id ?? uid(),
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      ...form,
      name: form.name.trim(),
      exercises,
    });
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-1)',
    padding: '10px 12px',
    fontSize: 15,
    fontFamily: 'Barlow, sans-serif',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: 'Barlow Condensed, sans-serif',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'var(--text-2)',
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 480,
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'slide-up 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em' }}>
            {initial ? 'EDIT WORKOUT' : 'NEW WORKOUT'}
          </h2>
          <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-2)' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>WORKOUT NAME</label>
            <input style={inputStyle} placeholder="e.g. Morning Burn" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>ROUNDS</label>
              <input style={inputStyle} type="number" min={1} max={50} value={form.rounds} onChange={(e) => setField('rounds', +e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>INTENSITY (MET)</label>
              <input style={{ ...inputStyle }} type="number" min={4} max={15} step={0.5} value={form.metValue} onChange={(e) => setField('metValue', +e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>WORK (sec)</label>
              <input style={inputStyle} type="number" min={5} max={300} value={form.workSeconds} onChange={(e) => setField('workSeconds', +e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>REST (sec)</label>
              <input style={inputStyle} type="number" min={0} max={300} value={form.restSeconds} onChange={(e) => setField('restSeconds', +e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>REST BETWEEN ROUNDS (sec)</label>
            <input style={inputStyle} type="number" min={0} max={600} value={form.restBetweenRoundsSeconds} onChange={(e) => setField('restBetweenRoundsSeconds', +e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>EXERCISES</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.exercises.map((ex) => (
                <div key={ex.id} style={{ display: 'flex', gap: 8 }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Exercise name"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, e.target.value)}
                  />
                  {form.exercises.length > 1 && (
                    <button onClick={() => removeExercise(ex.id)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', cursor: 'pointer', color: 'var(--text-2)' }}>✕</button>
                  )}
                </div>
              ))}
              <button
                onClick={addExercise}
                style={{ background: 'var(--accent-dim)', border: '1px dashed var(--accent)', borderRadius: 8, padding: '10px', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em' }}
              >
                + ADD EXERCISE
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!form.name.trim()}
            style={{
              background: form.name.trim() ? 'var(--accent)' : 'var(--border)',
              border: 'none', borderRadius: 12, padding: '16px',
              cursor: form.name.trim() ? 'pointer' : 'not-allowed',
              color: form.name.trim() ? '#fff' : 'var(--text-2)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 900, fontSize: 18, letterSpacing: '0.05em',
              marginTop: 8,
            }}
          >
            {initial ? 'SAVE CHANGES' : 'CREATE WORKOUT'}
          </button>
        </div>
      </div>
    </div>
  );
}
