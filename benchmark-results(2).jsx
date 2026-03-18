import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line } from "recharts";

const BENCH = [
  {
    id: "qwen-122b",
    model: "Qwen3.5-122B-A10B",
    shortName: "Qwen 122B",
    params: "122B total / 10B active",
    type: "MoE · FP8",
    timestamp: "2026-03-16T11:04",
    ttft: 4.29,
    raw: { 128: 120.7, 512: 124.62, 1024: 124.58, 2048: 125.56, 4096: 125.09 },
    prefill: { 500: 118.17, 1000: 116.64, 4000: 107.59, 8000: 95.23 },
    throughput: { 1: 121.61, 5: 329.58, 10: 537.43, 20: 954.6 },
    gpuMem: [
      { gpu: 0, used: 90390, total: 97887, pct: 92.3 },
      { gpu: 1, used: 91826, total: 97887, pct: 93.8 },
    ],
    color: "#22d3ee",
    bg: "rgba(34,211,238,0.08)",
  },
  {
    id: "qwen-35b",
    model: "Qwen3.5-35B-A3B",
    shortName: "Qwen 35B",
    params: "35B total / 3B active",
    type: "MoE",
    timestamp: "2026-03-16T11:17",
    ttft: 8.98,
    raw: { 128: 219.1, 512: 224.79, 1024: 229.47, 2048: 229.86, 4096: 228.92 },
    prefill: { 500: 213.77, 1000: 183.19, 4000: 175.26, 8000: 173.41 },
    throughput: { 1: 223.92, 5: 566.86, 10: 785.13, 20: 1631.75 },
    gpuMem: [
      { gpu: 0, used: 90054, total: 97887, pct: 92.0 },
      { gpu: 1, used: 91490, total: 97887, pct: 93.5 },
    ],
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
  },
  {
    id: "nemotron",
    model: "Nemotron-3-Super-120B-A12B",
    shortName: "Nemotron 120B",
    params: "120B total / 12B active",
    type: "MoE · FP8",
    timestamp: "2026-03-16T12:10",
    ttft: 9.48,
    raw: { 128: 119.11, 512: 123.58, 1024: 125.71, 2048: 124.7, 4096: 124.71 },
    prefill: { 500: 117.63, 1000: 115.46, 4000: 103.54, 8000: 89.29 },
    throughput: { 1: 123.75, 5: 281.88, 10: 412.24, 20: 713.35 },
    gpuMem: [
      { gpu: 0, used: 93428, total: 97887, pct: 95.4 },
      { gpu: 1, used: 94866, total: 97887, pct: 96.9 },
    ],
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
  },
  {
    id: "qwen-27b",
    model: "Qwen3.5-27B",
    shortName: "Qwen 27B",
    params: "27B dense",
    type: "Dense",
    timestamp: "2026-03-18T13:47",
    ttft: 4.37,
    raw: { 128: 51.91, 512: 51.75, 1024: 52.64, 2048: 52.7, 4096: 52.68 },
    prefill: { 500: 51.38, 1000: 50.43, 4000: 44.03, 8000: 39.89 },
    throughput: { 1: 52.56, 5: 218.39, 10: 413.55, 20: 819.23 },
    gpuMem: [
      { gpu: 0, used: 89888, total: 97887, pct: 91.8 },
      { gpu: 1, used: 91470, total: 97887, pct: 93.4 },
    ],
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
  },
];

const rawData = ["128", "512", "1024", "2048", "4096"].map((k) => ({
  name: k,
  ...Object.fromEntries(BENCH.map((b) => [b.id, b.raw[k]])),
}));

const prefillData = ["500", "1000", "4000", "8000"].map((k) => ({
  name: k,
  ...Object.fromEntries(BENCH.map((b) => [b.id, b.prefill[k]])),
}));

const throughputData = ["1", "5", "10", "20"].map((k) => ({
  name: `batch ${k}`,
  ...Object.fromEntries(BENCH.map((b) => [b.id, b.throughput[k]])),
}));

const radarData = [
  { metric: "Raw Speed", fullMark: 250 },
  { metric: "Prefill", fullMark: 250 },
  { metric: "Throughput (b20)", fullMark: 1700 },
  { metric: "TTFT (inv)", fullMark: 300 },
  { metric: "VRAM Eff.", fullMark: 100 },
].map((d) => ({
  ...d,
  "qwen-122b":
    d.metric === "Raw Speed" ? 125
    : d.metric === "Prefill" ? 118
    : d.metric === "Throughput (b20)" ? 954.6
    : d.metric === "TTFT (inv)" ? 1000 / 4.29
    : 100 - 93,
  "qwen-35b":
    d.metric === "Raw Speed" ? 229
    : d.metric === "Prefill" ? 213
    : d.metric === "Throughput (b20)" ? 1631.75
    : d.metric === "TTFT (inv)" ? 1000 / 8.98
    : 100 - 92.75,
  nemotron:
    d.metric === "Raw Speed" ? 125
    : d.metric === "Prefill" ? 117
    : d.metric === "Throughput (b20)" ? 713.35
    : d.metric === "TTFT (inv)" ? 1000 / 9.48
    : 100 - 96.15,
  "qwen-27b":
    d.metric === "Raw Speed" ? 52.7
    : d.metric === "Prefill" ? 51.4
    : d.metric === "Throughput (b20)" ? 819.23
    : d.metric === "TTFT (inv)" ? 1000 / 4.37
    : 100 - 92.6,
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "#0f0f14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ color: "#888", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => {
        const b = BENCH.find((x) => x.id === p.dataKey);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: b?.color || p.color, display: "inline-block" }} />
            <span style={{ color: "#ccc" }}>{b?.shortName || p.dataKey}</span>
            <span style={{ color: b?.color || "#fff", fontWeight: 700, marginLeft: "auto" }}>{p.value.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatBadge = ({ label, value, unit, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666" }}>{label}</span>
    <span style={{ fontSize: 22, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
      {value}
      <span style={{ fontSize: 11, fontWeight: 400, color: "#666", marginLeft: 3 }}>{unit}</span>
    </span>
  </div>
);

const MemBar = ({ used, total, pct, color, label }) => (
  <div style={{ flex: 1 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#777", marginBottom: 4 }}>
      <span>{label}</span>
      <span>{(used / 1024).toFixed(1)} / {(total / 1024).toFixed(1)} GB</span>
    </div>
    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
    <div style={{ fontSize: 10, color: color, marginTop: 2, fontWeight: 600 }}>{pct}%</div>
  </div>
);

const TABS = ["Generation Speed", "Prefill Speed", "Batch Throughput", "Radar Overview"];

export default function BenchmarkDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      color: "#e0e0e0",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: "32px 24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #22d3ee, #a78bfa, #fb923c, #4ade80)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            vLLM Inference Benchmark
          </h1>
          <span style={{ fontSize: 12, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>
            2× RTX PRO 6000 Blackwell · vLLM 0.17.1 · CUDA 13.1
          </span>
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg, #22d3ee33, #a78bfa33, #fb923c33, #4ade8033, transparent)", marginTop: 12 }} />
      </div>

      {/* Model Cards */}
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240, 1fr))", gap: 16, marginBottom: 28 }}>
        {BENCH.map((b) => (
          <div key={b.id} style={{
            background: b.bg,
            border: `1px solid ${b.color}22`,
            borderRadius: 12,
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, ${b.color}, transparent)`,
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 15, color: b.color }}>
                  {b.shortName}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{b.params} · {b.type}</div>
              </div>
              <div style={{
                fontSize: 10, color: b.color, background: `${b.color}15`,
                padding: "3px 8px", borderRadius: 4, fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}>
                TTFT {b.ttft}ms
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
              <StatBadge label="Peak Gen" value={Math.max(...Object.values(b.raw)).toFixed(0)} unit="tok/s" accent={b.color} />
              <StatBadge label="Throughput ×20" value={b.throughput[20].toLocaleString()} unit="tok/s" accent={b.color} />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {b.gpuMem.map((g, i) => (
                <MemBar key={i} used={g.used} total={g.total} pct={g.pct} color={b.color} label={`GPU ${g.gpu}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              style={{
                background: tab === i ? "rgba(255,255,255,0.08)" : "transparent",
                color: tab === i ? "#fff" : "#666",
                border: tab === i ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                borderRadius: 6,
                padding: "7px 16px",
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: tab === i ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Chart Area */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "24px 16px",
        }}>
          {tab === 0 && (
            <div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", padding: "0 8px" }}>
                Raw generation speed (tok/s) vs max output tokens
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={rawData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} label={{ value: "Max Output Tokens", position: "insideBottom", offset: -5, fill: "#555", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} label={{ value: "tok/s", angle: -90, position: "insideLeft", fill: "#555", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {BENCH.map((b) => (
                    <Bar key={b.id} dataKey={b.id} fill={b.color} radius={[3, 3, 0, 0]} name={b.shortName} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 1 && (
            <div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", padding: "0 8px" }}>
                Prefill speed (tok/s) vs input context length
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={prefillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} label={{ value: "Input Tokens", position: "insideBottom", offset: -5, fill: "#555", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} label={{ value: "tok/s", angle: -90, position: "insideLeft", fill: "#555", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {BENCH.map((b) => (
                    <Line key={b.id} type="monotone" dataKey={b.id} stroke={b.color} strokeWidth={2.5} dot={{ r: 4, fill: b.color }} activeDot={{ r: 6, stroke: "#0a0a0f", strokeWidth: 2 }} name={b.shortName} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 2 && (
            <div>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", padding: "0 8px" }}>
                Total throughput (tok/s) scaling across concurrent batches
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={{ stroke: "#222" }} tickLine={false} label={{ value: "tok/s", angle: -90, position: "insideLeft", fill: "#555", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  {BENCH.map((b) => (
                    <Line key={b.id} type="monotone" dataKey={b.id} stroke={b.color} strokeWidth={2.5} dot={{ r: 4, fill: b.color }} activeDot={{ r: 6, stroke: "#0a0a0f", strokeWidth: 2 }} name={b.shortName} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 3 && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#888", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  {BENCH.map((b) => (
                    <Radar key={b.id} dataKey={b.id} stroke={b.color} fill={b.color} fillOpacity={0.12} strokeWidth={2} name={b.shortName} />
                  ))}
                  <Legend
                    formatter={(val) => {
                      const b = BENCH.find((x) => x.id === val);
                      return <span style={{ color: b?.color, fontSize: 12, fontFamily: "JetBrains Mono" }}>{b?.shortName}</span>;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend strip */}
        <div style={{
          display: "flex", gap: 24, marginTop: 16, justifyContent: "center", flexWrap: "wrap",
        }}>
          {tab !== 3 && BENCH.map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color, display: "inline-block" }} />
              <span style={{ fontSize: 11, color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>{b.shortName}</span>
            </div>
          ))}
        </div>

        {/* Footer meta */}
        <div style={{
          marginTop: 28, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          fontSize: 10, color: "#444", fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>3 runs per test · NVIDIA Driver 590.48.01</span>
          <span>2× NVIDIA RTX PRO 6000 Blackwell · 96 GB VRAM each</span>
          <span>Benchmarked 2026-03-16 / 2026-03-18</span>
        </div>
      </div>
    </div>
  );
}
