import { useApp } from '../contexts/AppContext';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ja } from 'date-fns/locale';

function formatDate(iso: string): string {
  const d = parseISO(iso);
  if (isToday(d)) return '今日';
  if (isYesterday(d)) return '昨日';
  return format(d, 'M月d日 (E)', { locale: ja });
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function HistoryPage() {
  const { history, deleteSession } = useApp();

  const grouped = history.reduce<Record<string, typeof history>>((acc, s) => {
    const key = format(parseISO(s.date), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const totalCalories = history.reduce((sum, s) => sum + s.caloriesBurned, 0);
  const totalMinutes = Math.round(history.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      <div style={{ paddingTop: 56, paddingBottom: 20 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.02em' }}>HISTORY</h1>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'SESSIONS', value: history.length, unit: '' },
          { label: 'TOTAL KCAL', value: totalCalories, unit: '' },
          { label: 'TOTAL MIN', value: totalMinutes, unit: '' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--text-2)', letterSpacing: '0.05em' }}>NO WORKOUTS YET</div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8 }}>Complete your first workout to see history</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(grouped).map(([date, sessions]) => (
            <div key={date}>
              <div style={{ fontSize: 12, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: 10 }}>
                {formatDate(sessions[0].date)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sessions.map((session) => (
                  <div key={session.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, animation: 'fade-in 0.3s ease-out' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                      🔥
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {session.name}
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{session.caloriesBurned} kcal</span>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'JetBrains Mono, monospace' }}>{formatDuration(session.durationSeconds)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>{session.roundsCompleted}R</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif', flexShrink: 0 }}>
                      {format(parseISO(session.date), 'HH:mm')}
                    </div>
                    <button
                      onClick={() => deleteSession(session.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '4px', fontSize: 16, flexShrink: 0 }}
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
