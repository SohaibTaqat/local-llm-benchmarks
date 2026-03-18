# vLLM Inference Benchmark Dashboard — Requirements

## Overview

A single-page interactive dashboard for visualizing and comparing local LLM inference benchmarks run via vLLM on a 2× NVIDIA RTX PRO 6000 Blackwell workstation. The site allows users to view all tested models at a glance, select specific models for side-by-side comparison, and explore detailed performance metrics through multiple chart types.

## Tech Stack

- **Framework:** React + Vite
- **Charts:** Recharts
- **Styling:** CSS (dark theme, monospace-heavy aesthetic)
- **Hosting:** GitHub Pages (static deployment via `vite build`)
- **Data Format:** JSON — benchmark results are stored as a flat array of model objects

## Data Source

Data is split across two JSON files to avoid redundancy:

### `hardware.json` — Test Environment (single file, one object)

Contains hardware and environment info that is shared across all benchmarks. This is the single source of truth for hardware details shown on the site.

```json
{
  "gpu_name": "NVIDIA RTX PRO 6000 Blackwell Workstation Edition",
  "gpu_count": 2,
  "vram_per_gpu_mib": 97887,
  "driver_version": "590.48.01",
  "cuda_version": "13.1",
  "vllm_version": "0.17.1rc1.dev168+gb3debb7e7",
  "runs_per_test": 3
}
```

### `benchmarks.json` — Model Results (array of entries)

Each entry is the raw output from the benchmark script. It includes hardware fields inside `metadata`, but **the frontend ignores these** and pulls hardware info exclusively from `hardware.json`.

```json
{
  "timestamp": "ISO 8601 string",
  "metadata": {
    "model": "org/model-name",
    "url": "http://localhost:8000",
    "gpu_name": "...",
    "gpu_count": 2,
    "vram_per_gpu_mib": 97887,
    "driver_version": "...",
    "cuda_version": "...",
    "vllm_version": "...",
    "runs_per_test": 3
  },
  "ttft_ms": 4.29,
  "raw_speed_tok_s": {
    "max_128": 120.7,
    "max_512": 124.62,
    "max_1024": 124.58,
    "max_2048": 125.56,
    "max_4096": 125.09
  },
  "prefill_speed_tok_s": {
    "input_500": 118.17,
    "input_1000": 116.64,
    "input_4000": 107.59,
    "input_8000": 95.23
  },
  "throughput_tok_s": {
    "batch_1": 121.61,
    "batch_5": 329.58,
    "batch_10": 537.43,
    "batch_20": 954.6
  },
  "gpu_memory": [
    {
      "gpu": 0,
      "used_mib": 90390,
      "total_mib": 97887,
      "free_mib": 6861,
      "utilization_pct": 92.3
    }
  ]
}
```

The frontend reads `metadata.model` for the model name and all performance/memory fields. Everything else under `metadata` is redundant with `hardware.json` and is ignored.

**Note:** The benchmark JSON currently does not include model metadata like architecture type (MoE vs Dense), active parameter count, or quantization method. These fields may be added to the schema later. The frontend should not attempt to infer this information from the model name.

## Features

### 1. Model Selection & Comparison

- All models are shown by default on initial load.
- Users can toggle individual models on/off to filter which appear in the charts.
- Selection should be persistent across chart tab switches within a session.
- A "Select All / Clear All" shortcut should be available.

### 2. Model Summary Cards

Each model gets a card displaying at a glance:

- Model name (derived from `metadata.model`)
- TTFT (time to first token) in ms
- Peak generation speed (highest value across `raw_speed_tok_s`)
- Peak throughput at batch 20 (`throughput_tok_s.batch_20`)
- GPU memory usage per GPU — shown as progress bars with used/total and percentage

### 3. Chart Views

The dashboard has tabbed chart views, all using Recharts:

| Tab | Chart Type | X-Axis | Y-Axis | Description |
|-----|-----------|--------|--------|-------------|
| Generation Speed | Bar chart | Max output tokens (128, 512, 1024, 2048, 4096) | tok/s | Raw generation speed at different output lengths |
| Prefill Speed | Line chart | Input token count (500, 1000, 4000, 8000) | tok/s | Prefill performance across context lengths |
| Batch Throughput | Line chart | Batch size (1, 5, 10, 20) | tok/s | Total throughput scaling with concurrency |
| Radar Overview | Radar chart | Metrics (Raw Speed, Prefill, Throughput, TTFT, VRAM Efficiency) | Normalized | Multi-axis comparison of overall model profiles |

All charts should:

- Only display currently selected models.
- Use a consistent color per model across all views.
- Include a custom tooltip showing model name and exact values.
- Have labeled axes with units.

### 4. Hardware & Test Info Footer

A footer section displaying the test environment details pulled from `hardware.json`:

- GPU name and count
- VRAM per GPU
- Driver version, CUDA version, vLLM version
- Runs per test
- Date range of benchmarks (derived from `benchmarks.json` timestamps)

## Design Direction

- **Theme:** Dark background (#0a0a0f range), subtle borders and card backgrounds.
- **Typography:** Monospace font (JetBrains Mono or similar) for data and labels. Clean hierarchy between headings, labels, and values.
- **Color scheme:** Each model gets a distinct, vibrant accent color used consistently across its card, chart bars/lines, and legend entries.
- **Cards:** Subtle colored top borders or glows to associate cards with their model color.
- **Charts:** Minimal grid lines, dark chart backgrounds, clean axis labels.
- **Overall feel:** Technical, data-dense but not cluttered. The existing JSX prototype and screenshots set the visual baseline.

## Deployment

- Static build via `vite build` → outputs to `dist/`.
- Hosted on GitHub Pages.
- `vite.config.js` must set `base` to the repository name for correct asset paths.
- Optionally: GitHub Actions workflow for automatic deployment on push to `main`.

## Adding New Models

Adding a new benchmark result should require only:

1. Run the benchmark script (produces a JSON entry with all fields including hardware metadata).
2. Append the raw output directly to `benchmarks.json` — no need to strip or modify fields.
3. Commit and push — the site rebuilds and the new model appears automatically.

No code changes should be needed to add a model.

If the hardware or test environment changes, update `hardware.json` accordingly.

## Out of Scope (For Now)

- Model metadata inference (architecture type, active params, quantization) — will be added to the JSON schema later.
- Backend or API — everything is static.
- User authentication or multi-user features.
- Mobile-first responsive design (desktop-primary is fine, but should not break on smaller screens).
