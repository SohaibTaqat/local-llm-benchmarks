import { getOrgColor, getBg } from './colors';

export function slugify(model) {
  return model
    .split('/').pop()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function displayName(model) {
  return model.split('/').pop();
}

function getOrg(model) {
  return model.includes('/') ? model.split('/')[0] : 'Other';
}

export function transformBenchmarks(raw) {
  // Pre-compute org sizes for color assignment
  const orgCounts = {};
  const orgIndexes = {};
  raw.forEach((entry) => {
    const org = getOrg(entry.metadata.model);
    orgCounts[org] = (orgCounts[org] || 0) + 1;
    orgIndexes[org] = 0;
  });

  return raw.map((entry) => {
    const org = getOrg(entry.metadata.model);
    const indexInOrg = orgIndexes[org]++;
    const orgSize = orgCounts[org];
    const color = getOrgColor(org, indexInOrg, orgSize);
    const id = slugify(entry.metadata.model);
    const name = displayName(entry.metadata.model);

    return {
      id,
      name,
      fullModel: entry.metadata.model,
      timestamp: entry.timestamp,
      color,
      bg: getBg(color),
      ttft: entry.ttft_ms,
      raw: {
        128: entry.raw_speed_tok_s.max_128,
        512: entry.raw_speed_tok_s.max_512,
        1024: entry.raw_speed_tok_s.max_1024,
        2048: entry.raw_speed_tok_s.max_2048,
        4096: entry.raw_speed_tok_s.max_4096,
      },
      prefill: {
        500: entry.prefill_speed_tok_s.input_500,
        1000: entry.prefill_speed_tok_s.input_1000,
        4000: entry.prefill_speed_tok_s.input_4000,
        8000: entry.prefill_speed_tok_s.input_8000,
      },
      throughput: {
        1: entry.throughput_tok_s.batch_1,
        5: entry.throughput_tok_s.batch_5,
        10: entry.throughput_tok_s.batch_10,
        20: entry.throughput_tok_s.batch_20,
      },
      gpuMem: entry.gpu_memory.map((g) => ({
        gpu: g.gpu,
        used: g.used_mib,
        total: g.total_mib,
        pct: g.utilization_pct,
      })),
    };
  });
}

export function computeWinners(models) {
  const metrics = [
    { key: 'peakGen', label: 'Fastest Generation', getValue: (m) => Math.max(...Object.values(m.raw)) },
    { key: 'ttft', label: 'Lowest TTFT', getValue: (m) => m.ttft, lower: true },
    { key: 'throughput', label: 'Highest Throughput', getValue: (m) => m.throughput[20] },
    { key: 'vram', label: 'Most VRAM Efficient', getValue: (m) => {
      const avgPct = m.gpuMem.reduce((s, g) => s + g.pct, 0) / m.gpuMem.length;
      return avgPct;
    }, lower: true },
  ];

  const winners = {};
  for (const metric of metrics) {
    let best = null;
    let bestVal = metric.lower ? Infinity : -Infinity;
    for (const m of models) {
      const val = metric.getValue(m);
      if (metric.lower ? val < bestVal : val > bestVal) {
        bestVal = val;
        best = m.id;
      }
    }
    winners[metric.key] = { id: best, label: metric.label };
  }
  return winners;
}

export function buildRawData(models) {
  return ['128', '512', '1024', '2048', '4096'].map((k) => ({
    name: k,
    ...Object.fromEntries(models.map((b) => [b.id, b.raw[k]])),
  }));
}

export function buildPrefillData(models) {
  return ['500', '1000', '4000', '8000'].map((k) => ({
    name: k,
    ...Object.fromEntries(models.map((b) => [b.id, b.prefill[k]])),
  }));
}

export function buildThroughputData(models) {
  return ['1', '5', '10', '20'].map((k) => ({
    name: `batch ${k}`,
    ...Object.fromEntries(models.map((b) => [b.id, b.throughput[k]])),
  }));
}

export function buildRadarData(models) {
  const metrics = [
    { metric: 'Raw Speed', getValue: (b) => Math.max(...Object.values(b.raw)) },
    { metric: 'Prefill', getValue: (b) => Math.max(...Object.values(b.prefill)) },
    { metric: 'Throughput (b20)', getValue: (b) => b.throughput[20] },
    { metric: 'TTFT (inv)', getValue: (b) => 1000 / b.ttft },
    { metric: 'VRAM Eff.', getValue: (b) => {
      const avgPct = b.gpuMem.reduce((s, g) => s + g.pct, 0) / b.gpuMem.length;
      return 100 - avgPct;
    }},
  ];

  return metrics.map((m) => {
    const values = models.map((b) => m.getValue(b));
    const maxVal = Math.max(...values);
    const row = {
      metric: m.metric,
      fullMark: maxVal * 1.2 || 1,
    };
    models.forEach((b) => {
      row[b.id] = m.getValue(b);
    });
    return row;
  });
}
