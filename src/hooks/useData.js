import { useState, useEffect } from 'react';
import { transformBenchmarks } from '../utils/transform';

const BASE = import.meta.env.BASE_URL;

export function useData() {
  const [models, setModels] = useState(null);
  const [hardware, setHardware] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}data/benchmarks.json`).then((r) => r.json()),
      fetch(`${BASE}data/hardware.json`).then((r) => r.json()),
    ])
      .then(([benchmarks, hw]) => {
        setModels(transformBenchmarks(benchmarks));
        setHardware(hw);
      })
      .catch((err) => setError(err.message));
  }, []);

  return { models, hardware, error };
}
