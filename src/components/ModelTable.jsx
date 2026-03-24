import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'name', label: 'Model', align: 'left', getValue: (m) => m.name, format: null },
  { key: 'ttft', label: 'TTFT', unit: 'ms', align: 'right', getValue: (m) => m.ttft, format: (v) => v.toFixed(2), lower: true },
  { key: 'peakGen', label: 'Peak Gen', unit: 'tok/s', align: 'right', getValue: (m) => Math.max(...Object.values(m.raw)), format: (v) => v.toFixed(0) },
  { key: 'throughput1', label: 'TP×1', unit: 'tok/s', align: 'right', getValue: (m) => m.throughput[1], format: (v) => v.toFixed(1) },
  { key: 'throughput20', label: 'TP×20', unit: 'tok/s', align: 'right', getValue: (m) => m.throughput[20], format: (v) => v.toLocaleString(undefined, { maximumFractionDigits: 1 }) },
  { key: 'prefill', label: 'Prefill', unit: 'tok/s', align: 'right', getValue: (m) => Math.max(...Object.values(m.prefill)), format: (v) => v.toFixed(1) },
  { key: 'vram', label: 'VRAM', unit: '%', align: 'right', getValue: (m) => m.gpuMem.reduce((s, g) => s + g.pct, 0) / m.gpuMem.length, format: (v) => v.toFixed(1), lower: true },
];

const INITIAL_ROWS = 10;

export default function ModelTable({ models, winners }) {
  const [sortCol, setSortCol] = useState('peakGen');
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSort = (key) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      const col = COLUMNS.find((c) => c.key === key);
      setSortAsc(col?.lower || key === 'name');
    }
  };

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortCol);
    if (!col) return models;
    return [...models].sort((a, b) => {
      let va = col.getValue(a);
      let vb = col.getValue(b);
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [models, sortCol, sortAsc]);

  // Find best values for highlighting
  const bests = useMemo(() => {
    const result = {};
    COLUMNS.forEach((col) => {
      if (col.key === 'name') return;
      const values = models.map((m) => ({ id: m.id, val: col.getValue(m) }));
      const best = col.lower
        ? values.reduce((a, b) => (b.val < a.val ? b : a))
        : values.reduce((a, b) => (b.val > a.val ? b : a));
      result[col.key] = best.id;
    });
    return result;
  }, [models]);

  const winnerKeys = useMemo(() => {
    const map = {};
    Object.values(winners).forEach((w) => { if (w?.id) map[w.id] = true; });
    return map;
  }, [winners]);

  const showExpand = sorted.length > INITIAL_ROWS;
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_ROWS);
  const hiddenCount = sorted.length - INITIAL_ROWS;

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      marginBottom: 28,
      overflowX: 'auto',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
      }}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  textAlign: col.align,
                  padding: '10px 12px',
                  color: sortCol === col.key ? '#fff' : '#666',
                  fontWeight: 600,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
              >
                {col.label}
                {col.unit && <span style={{ color: '#444', fontWeight: 400, marginLeft: 3 }}>{col.unit}</span>}
                {sortCol === col.key && (
                  <span style={{ marginLeft: 4, fontSize: 9 }}>{sortAsc ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((m, idx) => (
            <tr
              key={m.id}
              style={{
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
            >
              {COLUMNS.map((col) => {
                const val = col.getValue(m);
                const isBest = bests[col.key] === m.id;
                const isName = col.key === 'name';

                return (
                  <td
                    key={col.key}
                    style={{
                      textAlign: col.align,
                      padding: '8px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      whiteSpace: 'nowrap',
                      color: isName ? m.color : isBest ? '#fbbf24' : '#ccc',
                      fontWeight: isName || isBest ? 700 : 400,
                    }}
                  >
                    {isName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: m.color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }} />
                        <span>{val}</span>
                        {winnerKeys[m.id] && (
                          <span style={{
                            fontSize: 9,
                            color: '#fbbf24',
                            marginLeft: 2,
                          }}>★</span>
                        )}
                      </div>
                    ) : (
                      <>
                        {col.format ? col.format(val) : val}
                        {isBest && <span style={{ marginLeft: 4, fontSize: 9 }}>★</span>}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {showExpand && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 4,
              padding: '5px 16px',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#888',
              cursor: 'pointer',
            }}
          >
            {expanded ? 'Show less' : `Show ${hiddenCount} more`}
          </button>
        </div>
      )}
    </div>
  );
}
