import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays, isWithinInterval, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useApp } from '../contexts/AppContext';

type Range = '7d' | '30d' | '90d' | 'all';

const RANGES: { label: string; value: Range }[] = [
  { label: '7日', value: '7d' },
  { label: '30日', value: '30d' },
  { label: '90日', value: '90d' },
  { label: 'ALL', value: 'all' },
];

export default function StatsPage() {
  const { history } = useApp();
  const [range, setRange] = useState<Range>('30d');
  const [metric, setMetric] = useState<'calories' | 'minutes'>('calories');

  const now = new Date();
  const rangeStart = range === 'all'
    ? (history.length > 0 ? parseISO(history[history.length - 1].date) : subDays(now, 30))
    : subDays(now, range === '7d' ? 7 : range === '30d' ? 30 : 90);

  const filtered = useMemo(() =>
    history.filter((s) =>
      isWithinInterval(parseISO(s.date), { start: startOfDay(rangeStart), end: endOfDay(now) })
    ),
    [history, range]
  );

  const totalCalories = filtered.reduce((s, r) => s + r.caloriesBurned, 0);
  const totalMinutes = Math.round(filtered.reduce((s, r) => s + r.durationSeconds, 0) / 60);
  const totalSessions = filtered.length;
  const avgCaloriesPerSession = totalSessions > 0 ? Math.round(totalCalories / totalSessions) : 0;

  const chartData = useMemo(() => {
    const days = eachDayOfInterval({ start: rangeStart, end: now });
    const groupBy = range === '7d' ? 1 : range === '30d' ? 1 : 7;

    if (groupBy === 1) {
      return days.map((day) => {
        const daySessions = filtered.filter((s) =>
          format(parseISO(s.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        return {
          name: format(day, 'M/d', { locale: ja }),
          value: metric === 'calories'
            ? daySessions.reduce((s, r) => s + r.caloriesBurned, 0)
            : Math.round(daySessions.reduce((s, r) => s + r.durationSeconds, 0) / 60),
        };
      }).filter((_, i) => range === '7d' || i % (range === '30d' ? 1 : 1) === 0);
    }

    const weeks: { name: string; value: number }[] = [];
    for (let i = 0; i < days.length; i += groupBy) {
      const weekDays = days.slice(i, i + groupBy);
      const weekSessions = filtered.filter((s) =>
        weekDays.some((d) => format(parseISO(s.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd'))
      );
      weeks.push({
        name: format(weekDays[0], 'M/d'),
        value: metric === 'calories'
          ? weekSessions.reduce((s, r) => s + r.caloriesBurned, 0)
          : Math.round(weekSessions.reduce((s, r) => s + r.durationSeconds, 0) / 60),
      });
    }
    return weeks;
  }, [filtered, range, metric]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>{label}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>
            {payload[0].value}{metric === 'calories' ? ' kcal' : ' min'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      <div style={{ paddingTop: 56, paddingBottom: 20 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.02em' }}>STATS</h1>
      </div>

      {/* Range selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: range === r.value ? 'var(--accent)' : 'none',
              border: 'none',
              borderRadius: 8,
              color: range === r.value ? '#fff' : 'var(--text-2)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'SESSIONS', value: totalSessions, unit: '', accent: false },
          { label: 'AVG KCAL', value: avgCaloriesPerSession, unit: '/session', accent: false },
          { label: 'TOTAL KCAL', value: totalCalories, unit: '', accent: true },
          { label: 'TOTAL MIN', value: totalMinutes, unit: '', accent: false },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--surface)', border: `1px solid ${s.accent ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 14, padding: '16px 14px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 28, color: s.accent ? 'var(--accent)' : 'var(--text-1)', marginBottom: 2 }}>{s.value}<span style={{ fontSize: 14, color: 'var(--text-2)' }}>{s.unit}</span></div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Metric toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['calories', 'minutes'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            style={{
              padding: '6px 16px',
              background: metric === m ? 'var(--accent-dim)' : 'none',
              border: `1px solid ${metric === m ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              color: metric === m ? 'var(--accent)' : 'var(--text-2)',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {m === 'calories' ? 'CALORIES' : 'MINUTES'}
          </button>
        ))}
      </div>

      {/* Chart */}
      {filtered.length > 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 8px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--text-2)', fontSize: 10, fontFamily: 'Barlow, sans-serif' }}
                axisLine={false}
                tickLine={false}
                interval={range === '30d' ? 4 : 0}
              />
              <YAxis
                tick={{ fill: 'var(--text-2)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-dim)' }} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontSize: 16, color: 'var(--text-2)', letterSpacing: '0.05em' }}>NO DATA FOR THIS PERIOD</div>
        </div>
      )}

      {/* Best sessions */}
      {filtered.length > 0 && (
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: 12 }}>TOP SESSIONS</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...filtered].sort((a, b) => b.caloriesBurned - a.caloriesBurned).slice(0, 3).map((s, i) => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 20, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32', width: 24, textAlign: 'center' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{format(parseISO(s.date), 'M月d日', { locale: ja })}</div>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{s.caloriesBurned}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'Barlow Condensed, sans-serif' }}>kcal</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
