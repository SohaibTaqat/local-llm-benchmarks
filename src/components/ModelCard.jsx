function StatBadge({ label, value, unit, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#666',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 22,
        fontWeight: 800,
        color: accent,
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
      }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 400, color: '#666', marginLeft: 3 }}>{unit}</span>
      </span>
    </div>
  );
}

function MemBar({ used, total, pct, color, label }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        color: '#777',
        marginBottom: 4,
      }}>
        <span>{label}</span>
        <span>{(used / 1024).toFixed(1)} / {(total / 1024).toFixed(1)} GB</span>
      </div>
      <div style={{
        height: 8,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 4,
          transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ fontSize: 10, color, marginTop: 2, fontWeight: 600 }}>{pct}%</div>
    </div>
  );
}

import { useRef, useEffect, useState } from 'react';

export default function ModelCard({ model }) {
  const { name, color, bg, ttft, raw, throughput, gpuMem } = model;
  const peakGen = Math.max(...Object.values(raw)).toFixed(0);
  const textRef = useRef(null);
  const wrapperRef = useRef(null);
  const [scrollDist, setScrollDist] = useState(0);

  useEffect(() => {
    if (textRef.current && wrapperRef.current) {
      const overflow = textRef.current.scrollWidth - wrapperRef.current.clientWidth;
      setScrollDist(overflow > 0 ? -overflow - 8 : 0);
    }
  }, [name]);

  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}22`,
      borderRadius: 12,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
      }} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 14,
      }}>
        <div ref={wrapperRef} className="model-name-wrapper" style={{
          overflow: 'hidden',
          flex: 1,
          minWidth: 0,
        }}>
          <div ref={textRef} className="model-name-text" style={{
            '--scroll-distance': `${scrollDist}px`,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: 15,
            color,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {name}
          </div>
        </div>
        <div style={{
          fontSize: 10,
          color,
          background: `${color}15`,
          padding: '3px 8px',
          borderRadius: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          TTFT {ttft}ms
        </div>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        <StatBadge label="Peak Gen" value={peakGen} unit="tok/s" accent={color} />
        <StatBadge label="Throughput x20" value={throughput[20].toLocaleString()} unit="tok/s" accent={color} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {gpuMem.map((g, i) => (
          <MemBar key={i} used={g.used} total={g.total} pct={g.pct} color={color} label={`GPU ${g.gpu}`} />
        ))}
      </div>
    </div>
  );
}
