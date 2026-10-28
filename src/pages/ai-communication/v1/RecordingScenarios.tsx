/** Generated raster scene illustrations, independent from the UI icon library. */
export function RecordingScenarios() {
  const base = `${import.meta.env.BASE_URL}illustrations/ai-recording`;
  return <section className="ai-start-scenarios" aria-labelledby="ai-start-scenarios-title"><h3 id="ai-start-scenarios-title">适用场景</h3><div className="ai-scenario-grid">
    <figure><div className="ai-scenario-drawing ai-scenario-drawing--conversation"><img src={`${base}/face-to-face-v1.png`} alt="" /></div><figcaption>与家长面对面沟通</figcaption></figure>
    <figure><div className="ai-scenario-drawing ai-scenario-drawing--speakerphone"><img src={`${base}/speakerphone-v1.png`} alt="" /></div><figcaption>用另一台设备免提通话</figcaption></figure>
  </div></section>;
}
