import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  LineChart, Line,
} from 'recharts';
import CustomTooltip from './CustomTooltip';
import { buildRawData, buildPrefillData, buildThroughputData, buildRadarData } from '../utils/transform';

const TABS = ['Generation Speed', 'Prefill Speed', 'Batch Throughput', 'Radar Overview'];

const axisProps = {
  tick: { fill: '#666', fontSize: 11, fontFamily: 'JetBrains Mono' },
  axisLine: { stroke: '#222' },
  tickLine: false,
};

const gridProps = {
  strokeDasharray: '3 3',
  stroke: 'rgba(255,255,255,0.04)',
};

export default function ChartTabs({ models, tab, setTab }) {
  const rawData = buildRawData(models);
  const prefillData = buildPrefillData(models);
  const throughputData = buildThroughputData(models);
  const radarData = buildRadarData(models);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              background: tab === i ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === i ? '#fff' : '#666',
              border: tab === i ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              borderRadius: 6,
              padding: '7px 16px',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: tab === i ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '24px 16px',
      }}>
        {tab === 0 && (
          <div>
            <div style={chartLabel}>Raw generation speed (tok/s) vs max output tokens</div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={rawData} barCategoryGap="20%">
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="name"
                  {...axisProps}
                  label={{ value: 'Max Output Tokens', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 10 }}
                />
                <YAxis
                  {...axisProps}
                  label={{ value: 'tok/s', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip models={models} />} />
                {models.map((b) => (
                  <Bar key={b.id} dataKey={b.id} fill={b.color} radius={[3, 3, 0, 0]} name={b.name} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 1 && (
          <div>
            <div style={chartLabel}>Prefill speed (tok/s) vs input context length</div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={prefillData}>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="name"
                  {...axisProps}
                  label={{ value: 'Input Tokens', position: 'insideBottom', offset: -5, fill: '#555', fontSize: 10 }}
                />
                <YAxis
                  {...axisProps}
                  label={{ value: 'tok/s', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip models={models} />} />
                {models.map((b) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={b.id}
                    stroke={b.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: b.color }}
                    activeDot={{ r: 6, stroke: '#0a0a0f', strokeWidth: 2 }}
                    name={b.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={chartLabel}>Total throughput (tok/s) scaling across concurrent batches</div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={throughputData}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis
                  {...axisProps}
                  label={{ value: 'tok/s', angle: -90, position: 'insideLeft', fill: '#555', fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip models={models} />} />
                {models.map((b) => (
                  <Line
                    key={b.id}
                    type="monotone"
                    dataKey={b.id}
                    stroke={b.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: b.color }}
                    activeDot={{ r: 6, stroke: '#0a0a0f', strokeWidth: 2 }}
                    name={b.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 3 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={380}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: '#888', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <PolarRadiusAxis tick={false} axisLine={false} />
                {models.map((b) => (
                  <Radar
                    key={b.id}
                    dataKey={b.id}
                    stroke={b.color}
                    fill={b.color}
                    fillOpacity={0.12}
                    strokeWidth={2}
                    name={b.name}
                  />
                ))}
                <Legend
                  formatter={(val) => {
                    const b = models.find((x) => x.id === val);
                    return (
                      <span style={{ color: b?.color, fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                        {b?.name}
                      </span>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend strip (non-radar tabs) */}
      {tab !== 3 && (
        <div style={{
          display: 'flex',
          gap: 24,
          marginTop: 16,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          {models.map((b) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: b.color,
                display: 'inline-block',
              }} />
              <span style={{
                fontSize: 11,
                color: '#888',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {b.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const chartLabel = {
  fontSize: 11,
  color: '#666',
  marginBottom: 12,
  fontFamily: "'JetBrains Mono', monospace",
  padding: '0 8px',
};
