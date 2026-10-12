// Original PNG: 1350 × 2760; transparent screen: x=72, y=69, 1206 × 2622.
// Scale only the shell; the iframe keeps the selected CSS viewport width.
export function DevicePreview({ width, src, title, shell, height }: { width: number; src: string; title: string; shell: boolean; height: number }) {
  const scale = width / 1206;
  return <div className={`device-frame ${shell ? 'device-frame--phone' : 'device-frame--plain'}`} style={{ width: shell ? 1350 * scale : width, height: shell ? 2760 * scale : height }}>
    <iframe title={title} src={src} style={{ width, height: shell ? 2622 * scale : height, ...(shell ? { left: 72 * scale, top: 69 * scale, borderRadius: 200 * scale } : {}) }} />
    {shell && <img className="device-shell" src={`${import.meta.env.BASE_URL}preview/devices/phone-navy.png`} alt="" aria-hidden="true" />}
  </div>;
}
