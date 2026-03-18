import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import ModelSelector from './components/ModelSelector';
import ModelCard from './components/ModelCard';
import ChartTabs from './components/ChartTabs';
import Footer from './components/Footer';

export default function App() {
  const { models, hardware, error } = useData();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState(0);

  // Initialize selection to all models once data loads
  if (models && selected === null) {
    setSelected(new Set(models.map((m) => m.id)));
  }

  const filteredModels = useMemo(() => {
    if (!models || !selected) return [];
    return models.filter((m) => selected.has(m.id));
  }, [models, selected]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
        Failed to load data: {error}
      </div>
    );
  }

  if (!models || !hardware) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
        Loading benchmarks...
      </div>
    );
  }

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(models.map((m) => m.id)));
  const clearAll = () => setSelected(new Set());

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      padding: '32px 24px',
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            background: 'linear-gradient(135deg, #22d3ee, #a78bfa, #fb923c, #4ade80)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Local LLM Benchmark
          </h1>
          <span style={{
            fontSize: 12,
            color: '#555',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {hardware.gpu_count}x {hardware.gpu_name.replace('Workstation Edition', '').trim()}
          </span>
        </div>
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, #22d3ee33, #a78bfa33, #fb923c33, #4ade8033, transparent)',
          marginTop: 12,
        }} />
      </div>

      {/* Model Selector */}
      <ModelSelector
        models={models}
        selected={selected}
        onToggle={toggle}
        onSelectAll={selectAll}
        onClearAll={clearAll}
      />

      {/* Model Cards */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        {filteredModels.map((m) => (
          <ModelCard key={m.id} model={m} />
        ))}
      </div>

      {/* Charts */}
      {filteredModels.length > 0 ? (
        <ChartTabs models={filteredModels} tab={tab} setTab={setTab} />
      ) : (
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          textAlign: 'center',
          padding: '60px 0',
          color: '#555',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
        }}>
          Select at least one model to view charts
        </div>
      )}

      {/* Footer */}
      <Footer hardware={hardware} models={models} />
    </div>
  );
}
