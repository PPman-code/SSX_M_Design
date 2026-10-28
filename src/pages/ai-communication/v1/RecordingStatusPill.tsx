import { useLayoutEffect, useRef, useState } from 'react';

/** Show the short status first, then reveal the explanation from its right edge. */
export function RecordingStatusPill({ paused }: { paused: boolean }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const detailRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [size, setSize] = useState({ label: 0, detail: 0 });
  useLayoutEffect(() => {
    const label = labelRef.current, detail = detailRef.current;
    if (!label || !detail) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const measure = () => setSize({ label: label.getBoundingClientRect().width, detail: detail.getBoundingClientRect().width });
    measure();
    setExpanded(reduced.matches);
    const timer = window.setTimeout(() => setExpanded(true), 160);
    const updateMotion = () => { if (reduced.matches) { window.clearTimeout(timer); setExpanded(true); } };
    reduced.addEventListener('change', updateMotion);
    const observer = new ResizeObserver(measure);
    observer.observe(label); observer.observe(detail);
    return () => { window.clearTimeout(timer); observer.disconnect(); reduced.removeEventListener('change', updateMotion); };
  }, [paused]);
  return <div className={`ai-recorder ${paused ? 'is-paused' : ''}`} data-expanded={expanded} style={{ width: size.label ? size.label + 16 + (expanded ? size.detail : 0) : undefined }}>
    <span className="ai-recorder-inner">
      <span className="ai-recorder-label" ref={labelRef}><span className="ai-record-dot" />{paused ? '已暂停' : '录音中'}</span>
      <span className="ai-recorder-detail" style={{ width: expanded ? size.detail : 0 }}><span ref={detailRef}>{paused ? '，点击下方按钮继续' : '，收起后继续实时转写'}</span></span>
    </span>
  </div>;
}
