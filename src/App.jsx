import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import ModelSelector from './components/ModelSelector';
import ModelCard from './components/ModelCard';
import ModelTable from './components/ModelTable';
import ChartTabs from './components/ChartTabs';
import Footer from './components/Footer';
import { computeWinners } from './utils/transform';

const INITIAL_CARDS = 8;

export default function App() {
  const { models, hardware, error } = useData();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState(0);
  const [view, setView] = useState('table');
  const [cardsExpanded, setCardsExpanded] = useState(false);

  const winners = useMemo(() => {
    if (!models) return {};
    return computeWinners(models);
  }, [models]);

  // Initialize selection to category winners only
  if (models && selected === null) {
    const winnerIds = new Set(Object.values(winners).map((w) => w.id).filter(Boolean));
    setSelected(winnerIds);
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

      {/* View Toggle */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
      }}>
        {['table', 'cards'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              background: view === v ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: view === v ? '#fff' : '#555',
              border: view === v ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
              borderRadius: 5,
              padding: '4px 12px',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: view === v ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {filteredModels.length > 0 ? (
        <>
          {/* Model Data View */}
          {view === 'table' ? (
            <ModelTable models={filteredModels} winners={winners} />
          ) : (
            <div style={{ maxWidth: 1100, margin: '0 auto', marginBottom: 28 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}>
                {(cardsExpanded ? filteredModels : filteredModels.slice(0, INITIAL_CARDS)).map((m) => (
                  <ModelCard key={m.id} model={m} winners={winners} />
                ))}
              </div>
              {filteredModels.length > INITIAL_CARDS && (
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button
                    onClick={() => setCardsExpanded(!cardsExpanded)}
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
                    {cardsExpanded ? 'Show less' : `Show ${filteredModels.length - INITIAL_CARDS} more`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Charts */}
          <ChartTabs models={filteredModels} tab={tab} setTab={setTab} />
        </>
      ) : (
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          textAlign: 'center',
          padding: '80px 0',
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12,
            opacity: 0.15,
          }}>
            ∅
          </div>
          <div style={{
            color: '#555',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            marginBottom: 16,
          }}>
            No models selected
          </div>
          <button
            onClick={selectAll}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#888',
              cursor: 'pointer',
            }}
          >
            Select all models
          </button>
        </div>
      )}

      {/* Footer */}
      <Footer hardware={hardware} models={models} />
    </div>
  );
}
