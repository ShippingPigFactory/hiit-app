import { useApp } from '../contexts/AppContext';

function Row({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 500, fontSize: 15 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{sublabel}</div>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: value ? 'var(--accent)' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.25s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: value ? 22 : 3,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, history, deleteSession } = useApp();

  function clearHistory() {
    if (confirm('全てのトレーニング履歴を削除しますか？\nThis will delete all workout history.')) {
      history.forEach((s) => deleteSession(s.id));
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-1)',
    padding: '6px 10px',
    fontSize: 15,
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    width: 80,
    textAlign: 'right',
    outline: 'none',
  };

  return (
    <div className="page" style={{ padding: '0 16px' }}>
      <div style={{ paddingTop: 56, paddingBottom: 20 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: 36, letterSpacing: '-0.02em' }}>SETTINGS</h1>
      </div>

      {/* Appearance */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: 4 }}>APPEARANCE</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 16px' }}>
          <Row label="Dark Mode" sublabel="ダークモード">
            <Toggle value={settings.theme === 'dark'} onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })} />
          </Row>
        </div>
      </div>

      {/* Profile */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: 4 }}>PROFILE</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 16px' }}>
          <Row label="Body Weight" sublabel="体重（カロリー計算に使用）">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                style={inputStyle}
                type="number"
                min={30}
                max={200}
                value={settings.weightKg}
                onChange={(e) => updateSettings({ weightKg: +e.target.value })}
              />
              <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>kg</span>
            </div>
          </Row>
        </div>
      </div>

      {/* Workout */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: 4 }}>WORKOUT</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 16px' }}>
          <Row label="Sound Effects" sublabel="サウンド通知">
            <Toggle value={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
          </Row>
          <Row label="Vibration" sublabel="バイブレーション">
            <Toggle value={settings.vibrationEnabled} onChange={(v) => updateSettings({ vibrationEnabled: v })} />
          </Row>
          <Row label="Preparation Time" sublabel="準備カウントダウン（秒）">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                style={inputStyle}
                type="number"
                min={3}
                max={15}
                value={settings.preparationSeconds}
                onChange={(e) => updateSettings({ preparationSeconds: +e.target.value })}
              />
              <span style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'Barlow, sans-serif' }}>sec</span>
            </div>
          </Row>
        </div>
      </div>

      {/* Calorie info */}
      <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 12, padding: '12px 16px', marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>CALORIE CALCULATION</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
          消費カロリーは MET 値と体重から計算します。<br />
          <strong style={{ color: 'var(--text-1)' }}>kcal = (MET × 体重kg × 時間h)</strong><br />
          HIIT の MET 値は 9〜12 程度です。
        </div>
      </div>

      {/* Data */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-2)', marginBottom: 4 }}>DATA</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 16px' }}>
          <Row label="Workout Sessions" sublabel="記録されたワークアウト">
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: 'var(--text-1)' }}>{history.length}</span>
          </Row>
          <div style={{ padding: '16px 0' }}>
            <button
              onClick={clearHistory}
              style={{ background: 'none', border: '1px solid #FF4444', borderRadius: 10, padding: '10px 20px', color: '#FF4444', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', cursor: 'pointer', width: '100%' }}
            >
              CLEAR ALL HISTORY
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-2)', paddingBottom: 16 }}>
        BURN v0.1.0 · Built with ❤️ + 🔥
      </div>
    </div>
  );
}
