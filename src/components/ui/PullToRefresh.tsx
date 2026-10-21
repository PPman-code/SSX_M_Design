import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { Icon } from './Icon';
import { Loading } from './Loading';
import './PullToRefresh.css';

type Phase = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'success' | 'error';
interface Props {
  scrollRef: RefObject<HTMLElement | null>;
  onRefresh: (signal: AbortSignal) => Promise<void>;
  disabled?: boolean;
  successText?: string;
}

/** Attaches to the existing scroll viewport; children and sticky headers retain their layout. */
export function PullToRefresh({ scrollRef, onRefresh, disabled = false, successText = '刷新完成' }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [distance, setDistance] = useState(0);
  const active = useRef(false);
  const task = useRef<AbortController | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef({ onRefresh, disabled });
  useEffect(() => { latest.current = { onRefresh, disabled }; }, [onRefresh, disabled]);
  useEffect(() => () => { task.current?.abort(); clearTimeout(settleTimer.current); }, []);

  async function refresh() {
    if (active.current || latest.current.disabled) return;
    active.current = true;
    clearTimeout(settleTimer.current);
    const controller = new AbortController(); task.current = controller;
    setPhase('refreshing'); setDistance(56);
    try {
      await latest.current.onRefresh(controller.signal);
      if (controller.signal.aborted) return;
      setPhase('success');
    } catch {
      if (controller.signal.aborted) return;
      setPhase('error');
    } finally {
      if (!controller.signal.aborted) {
        active.current = false;
        settleTimer.current = setTimeout(() => { setPhase('idle'); setDistance(0); }, 1200);
      }
    }
  }
  const refreshRef = useRef(refresh);
  useEffect(() => { refreshRef.current = refresh; });

  useEffect(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;
    let start: { x: number; y: number } | null = null;
    let offset = 0;
    let blocked = false;
    let pointerId: number | null = null;
    let suppressClick = false;
    let clickTimer: ReturnType<typeof setTimeout> | undefined;
    function begin(x: number, y: number, target: EventTarget | null) {
      if (active.current || latest.current.disabled || viewport!.scrollTop > 0 || (target instanceof Element && target.closest('input, textarea, select, [role="slider"], [contenteditable="true"]'))) return;
      start = { x, y }; offset = 0; blocked = false;
    }
    function move(x: number, y: number, event: Event) {
      if (!start || blocked) return;
      const dy = y - start.y, dx = x - start.x;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { blocked = true; cancel(); return; }
      if (dy < 0 || viewport!.scrollTop > 0 || active.current || latest.current.disabled) { cancel(); return; }
      if (dy < 8) return;
      if (event.cancelable) event.preventDefault();
      suppressClick = true;
      clearTimeout(settleTimer.current);
      offset = Math.min(96, dy * .5);
      setDistance(offset); setPhase(offset >= 64 ? 'ready' : 'pulling');
    }
    function clearSuppression() {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => { suppressClick = false; }, 0);
    }
    function cancel() { start = null; offset = 0; clearSuppression(); if (!active.current) { setDistance(0); setPhase('idle'); } }
    function end() {
      clearSuppression();
      if (!start) return;
      if (latest.current.disabled) { cancel(); return; }
      start = null;
      if (offset >= 64) void refreshRef.current();
      else { setDistance(0); setPhase('idle'); }
      offset = 0;
    }
    const touchStart = (e: TouchEvent) => { if (e.touches.length === 1) begin(e.touches[0].clientX, e.touches[0].clientY, e.target); else cancel(); };
    const touchMove = (e: TouchEvent) => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY, e); else cancel(); };
    const pointerDown = (e: PointerEvent) => { if (e.pointerType === 'mouse' && e.button === 0) { pointerId = e.pointerId; begin(e.clientX, e.clientY, e.target); } };
    const pointerMove = (e: PointerEvent) => { if (e.pointerId === pointerId && e.buttons === 1) { move(e.clientX, e.clientY, e); if (offset > 0 && !viewport.hasPointerCapture(e.pointerId)) viewport.setPointerCapture(e.pointerId); } };
    const pointerUp = (e: PointerEvent) => { if (e.pointerId === pointerId) { end(); pointerId = null; } };
    const pointerCancel = () => { pointerId = null; cancel(); };
    const click = (e: MouseEvent) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; } };
    viewport.addEventListener('touchstart', touchStart, { passive: true });
    viewport.addEventListener('touchmove', touchMove, { passive: false });
    viewport.addEventListener('touchend', end);
    viewport.addEventListener('touchcancel', cancel);
    viewport.addEventListener('pointerdown', pointerDown);
    viewport.addEventListener('pointermove', pointerMove);
    viewport.addEventListener('pointerup', pointerUp);
    viewport.addEventListener('pointercancel', pointerCancel);
    viewport.addEventListener('click', click, true);
    return () => {
      clearTimeout(clickTimer);
      viewport.removeEventListener('touchstart', touchStart); viewport.removeEventListener('touchmove', touchMove);
      viewport.removeEventListener('touchend', end); viewport.removeEventListener('touchcancel', cancel);
      viewport.removeEventListener('pointerdown', pointerDown); viewport.removeEventListener('pointermove', pointerMove);
      viewport.removeEventListener('pointerup', pointerUp); viewport.removeEventListener('pointercancel', pointerCancel);
      viewport.removeEventListener('click', click, true);
    };
  }, [scrollRef]);
  return <>
    <button type="button" className="pull-refresh-accessible" disabled={disabled || phase === 'refreshing'} onClick={() => void refreshRef.current()}>刷新当前页面</button>
    <div className="pull-refresh" data-state={phase} style={{ '--pull-distance': `${distance}px` } as CSSProperties} aria-busy={phase === 'refreshing'}>
      {phase !== 'idle' && <span className="pull-refresh-feedback" role="status" aria-live="polite">
        {phase === 'refreshing' ? <Loading text="刷新中…" /> : <><Icon name={phase === 'success' ? 'check' : phase === 'error' ? 'exclamation-circle' : 'arrow-down'} className={phase === 'ready' ? 'pull-refresh-ready' : ''} /><span>{phase === 'pulling' ? '下拉刷新' : phase === 'ready' ? '释放刷新' : phase === 'success' ? successText : '刷新失败，请重试'}</span></>}
      </span>}
    </div>
  </>;
}
