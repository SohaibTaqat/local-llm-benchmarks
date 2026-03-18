export default function Footer({ hardware, models }) {
  if (!hardware) return null;

  const vramGb = (hardware.vram_per_gpu_mib / 1024).toFixed(0);

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
    }}>
      <div style={{
        marginTop: 28,
        padding: '14px 0',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        fontSize: 10,
        color: '#444',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <span>{hardware.runs_per_test} runs per test · NVIDIA Driver {hardware.driver_version}</span>
        <span>
          {hardware.gpu_count}x {hardware.gpu_name.replace('Workstation Edition', '').trim()} · {vramGb} GB VRAM each
        </span>
        {hardware.last_updated && <span>Last updated {hardware.last_updated}</span>}
      </div>
    </div>
  );
}
