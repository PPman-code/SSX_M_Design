import { useRef, useState, type ReactNode, type RefObject, type PointerEvent } from 'react';

/** Seat-map-only gestures: keep the surrounding sheet and browser viewport stationary. */
export function SeatViewport({ children, viewportRef, label }: { label: string; children: ReactNode; viewportRef: RefObject<HTMLDivElement | null> }) {
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const blockedUntil = useRef(0);
  const start = useRef({ x: 0, y: 0 });
  function move(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    const root = viewportRef.current;
    if (!previous || !root) return;
    const before = [...pointers.current.values()];
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      event.preventDefault();
      blockedUntil.current = Date.now() + 350;
      const after = [...pointers.current.values()];
      const distance = (points: typeof before) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const oldDistance = distance(before);
      if (oldDistance < 1) return;
      const next = Math.max(.5, Math.min(2, scaleRef.current * distance(after) / oldDistance));
      const bounds = root.getBoundingClientRect();
      const oldX = (before[0].x + before[1].x) / 2 - bounds.left;
      const oldY = (before[0].y + before[1].y) / 2 - bounds.top;
      const newX = (after[0].x + after[1].x) / 2 - bounds.left;
      const newY = (after[0].y + after[1].y) / 2 - bounds.top;
      const ratio = next / scaleRef.current;
      const left = (root.scrollLeft + oldX) * ratio - newX;
      const top = (root.scrollTop + oldY) * ratio - newY;
      scaleRef.current = next;
      setScale(next);
      requestAnimationFrame(() => { root.scrollLeft = left; root.scrollTop = top; });
    } else if (Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 5 || Date.now() < blockedUntil.current) {
      event.preventDefault();
      blockedUntil.current = Date.now() + 350;
      if (event.nativeEvent.isTrusted) root.setPointerCapture(event.pointerId);
      root.scrollLeft -= event.clientX - previous.x;
      root.scrollTop -= event.clientY - previous.y;
    }
  }
  return <div ref={viewportRef} className="parent-seat-map" role="group" aria-label={label} data-scale={scale.toFixed(2)} data-base-ui-swipe-ignore=""
    onPointerDown={event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      start.current = { x: event.clientX, y: event.clientY };
      if (pointers.current.size > 1) {
        blockedUntil.current = Date.now() + 350;
        if (event.nativeEvent.isTrusted) for (const id of pointers.current.keys()) event.currentTarget.setPointerCapture(id);
      }
    }} onPointerMove={move}
    onPointerUp={event => { pointers.current.delete(event.pointerId); }}
    onPointerCancel={event => { pointers.current.delete(event.pointerId); }}
    onLostPointerCapture={event => {
      // A child seat losing capture while handing it to this viewport is not a finished gesture.
      if (event.target === event.currentTarget) pointers.current.delete(event.pointerId);
    }}
    onClickCapture={event => { if (Date.now() < blockedUntil.current) { event.preventDefault(); event.stopPropagation(); } }}>
    <div className="parent-seat-zoom" style={{ zoom: scale }}>{children}</div>
  </div>;
}
