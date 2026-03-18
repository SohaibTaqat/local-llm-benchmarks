export default function ModelSelector({ models, selected, onToggle, onSelectAll, onClearAll }) {
  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={onSelectAll} style={btnStyle}>Select All</button>
        <button onClick={onClearAll} style={btnStyle}>Clear All</button>
      </div>
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
      {models.map((m) => {
        const active = selected.has(m.id);
        return (
          <button
            key={m.id}
            onClick={() => onToggle(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: active ? `${m.color}18` : 'transparent',
              border: `1px solid ${active ? `${m.color}44` : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 6,
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: active ? 1 : 0.4,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: m.color,
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: active ? m.color : '#666',
              fontWeight: active ? 600 : 400,
            }}>
              {m.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const btnStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 4,
  padding: '4px 10px',
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
  color: '#888',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
