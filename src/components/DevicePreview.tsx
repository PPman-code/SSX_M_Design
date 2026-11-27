const DEVICE_PRESETS: Record<number, { height: number; island: 'hole' | 'compact' | 'standard' | 'large'; screenRadius: number }> = {
  360: { height: 800, island: 'hole', screenRadius: 34 },
  375: { height: 812, island: 'compact', screenRadius: 40 },
  390: { height: 844, island: 'standard', screenRadius: 42 },
  430: { height: 932, island: 'large', screenRadius: 46 },
};

const BEZEL = 12;

export function DevicePreview({ width, src, title, shell, height }: { width: number; src: string; title: string; shell: boolean; height: number }) {
  const preset = DEVICE_PRESETS[width];
  const screenHeight = shell ? (preset?.height ?? height) : height;
  const screenRadius = preset?.screenRadius ?? 42;
  const frameWidth = shell ? width + BEZEL * 2 : width;
  const frameHeight = shell ? screenHeight + BEZEL * 2 : height;

  return <div
    className={`device-frame ${shell ? 'device-frame--phone' : 'device-frame--plain'}`}
    data-device-width={shell ? width : undefined}
    data-island={shell ? (preset?.island ?? 'standard') : undefined}
    style={{
      width: frameWidth,
      height: frameHeight,
      ...(shell ? { '--device-screen-radius': `${screenRadius}px`, '--device-bezel': `${BEZEL}px` } as React.CSSProperties : {}),
    }}
  >
    <iframe title={title} src={src} style={{ width, height: screenHeight }} />
    {shell && <div className="device-shell" aria-hidden="true">
      <span className="device-shell-island" />
    </div>}
  </div>;
}
