export default function CustomTooltip({ active, payload, label, models }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: '#0f0f14',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      padding: '10px 14px',
      fontSize: 12,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ color: '#888', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => {
        const b = models.find((x) => x.id === p.dataKey);
        return (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 3,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: b?.color || p.color,
              display: 'inline-block',
            }} />
            <span style={{ color: '#ccc' }}>{b?.name || p.dataKey}</span>
            <span style={{
              color: b?.color || '#fff',
              fontWeight: 700,
              marginLeft: 'auto',
            }}>
              {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : p.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
