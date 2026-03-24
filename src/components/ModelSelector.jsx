import { useState, useMemo, useRef, useEffect } from 'react';

export default function ModelSelector({ models, selected, onToggle, onSelectAll, onClearAll, onSelectTop }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Group models by org
  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = models.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.fullModel.toLowerCase().includes(q)
    );
    const groups = {};
    filtered.forEach((m) => {
      const org = m.fullModel.includes('/') ? m.fullModel.split('/')[0] : 'Other';
      if (!groups[org]) groups[org] = [];
      groups[org].push(m);
    });
    return groups;
  }, [models, search]);

  const selectedCount = selected.size;
  const totalCount = models.length;

  // Selected model chips for the bar (show up to 5)
  const selectedModels = models.filter((m) => selected.has(m.id));
  const chipLimit = 5;
  const visibleChips = selectedModels.slice(0, chipLimit);
  const extraCount = selectedModels.length - chipLimit;

  return (
    <div ref={panelRef} style={{ maxWidth: 1100, margin: '0 auto 20px', position: 'relative' }}>
      {/* Compact bar */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 8,
          padding: '8px 14px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
        }}
      >
        <span style={{
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#888',
          flexShrink: 0,
        }}>
          Models
        </span>
        <div style={{
          display: 'flex',
          gap: 6,
          flex: 1,
          overflow: 'hidden',
          alignItems: 'center',
          flexWrap: 'nowrap',
        }}>
          {visibleChips.map((m) => (
            <span
              key={m.id}
              onClick={(e) => { e.stopPropagation(); onToggle(m.id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: `${m.color}15`,
                border: `1px solid ${m.color}33`,
                borderRadius: 4,
                padding: '2px 8px',
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: m.color,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: m.color, display: 'inline-block',
              }} />
              {m.name}
              <span style={{ color: `${m.color}88`, marginLeft: 2 }}>×</span>
            </span>
          ))}
          {extraCount > 0 && (
            <span style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#666',
              flexShrink: 0,
            }}>
              +{extraCount} more
            </span>
          )}
          {selectedCount === 0 && (
            <span style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#444',
            }}>
              Click to select models...
            </span>
          )}
        </div>
        <span style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#555',
          flexShrink: 0,
        }}>
          {selectedCount}/{totalCount}
        </span>
        <span style={{
          fontSize: 10,
          color: '#555',
          transition: 'transform 0.2s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▼</span>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 0,
          zIndex: 50,
          maxHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {/* Search + bulk actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 5,
                padding: '5px 10px',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#e0e0e0',
                outline: 'none',
                flex: 1,
                minWidth: 0,
              }}
            />
            <button onClick={(e) => { e.stopPropagation(); onSelectTop(); }} style={bulkBtn}>Top</button>
            <button onClick={(e) => { e.stopPropagation(); onSelectAll(); }} style={bulkBtn}>All</button>
            <button onClick={(e) => { e.stopPropagation(); onClearAll(); }} style={bulkBtn}>None</button>
          </div>

          {/* Grouped list */}
          <div style={{
            overflowY: 'auto',
            padding: '6px 0',
          }}>
            {Object.entries(grouped).map(([org, items]) => (
              <div key={org}>
                <div style={{
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '8px 14px 4px',
                  fontWeight: 600,
                }}>
                  {org}
                </div>
                {items.map((m) => {
                  const active = selected.has(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={(e) => { e.stopPropagation(); onToggle(m.id); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '6px 14px',
                        cursor: 'pointer',
                        transition: 'background 0.1s ease',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Checkbox */}
                      <span style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        border: `1.5px solid ${active ? m.color : 'rgba(255,255,255,0.15)'}`,
                        background: active ? `${m.color}25` : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}>
                        {active && (
                          <span style={{ fontSize: 9, color: m.color, lineHeight: 1 }}>✓</span>
                        )}
                      </span>
                      {/* Color dot */}
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: m.color, display: 'inline-block', flexShrink: 0,
                        opacity: active ? 1 : 0.3,
                      }} />
                      {/* Name */}
                      <span style={{
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: active ? '#ddd' : '#666',
                        fontWeight: active ? 500 : 400,
                        flex: 1,
                      }}>
                        {m.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
            {Object.keys(grouped).length === 0 && (
              <div style={{
                padding: '20px 14px',
                textAlign: 'center',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#444',
              }}>
                No models match "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const bulkBtn = {
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
  flexShrink: 0,
};
