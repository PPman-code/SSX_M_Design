import { useEffect, useRef, useState } from 'react';

const ACTION_HEIGHT = 48;
const OPEN_THRESHOLD = 24;
const CLOSE_THRESHOLD = 12;
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));

/** Page-local native scrolling: only the unified header's transform is animated. */
export function useCustomerStickyHeader(enabled: boolean, customerId?: string) {
  const headerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  useEffect(() => {
    const header = headerRef.current;
    const marker = markerRef.current;
    const root = marker?.closest('.product-scroll');
    if (!enabled || !header || !marker || !root) return;
    let last = Math.max(0, root.scrollTop);
    let reveal = 0;
    let direction = 0;
    let distance = 0;
    let frame = 0;
    let settleTimer = 0;
    let touchActive = false;
    const geometry = () => {
      const y = clamp(root.scrollTop, Math.max(0, root.scrollHeight - root.clientHeight));
      const start = marker.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
      return { y, start, available: clamp(y - start, ACTION_HEIGHT) };
    };
    function paint() {
      if (!header) return;
      const { y, start, available } = geometry();
      reveal = clamp(reveal, available);
      header.style.setProperty('--ai-header-reveal', `${reveal}px`);
      header.dataset.reveal = String(reveal);
      const isPinned = y >= start + ACTION_HEIGHT || (reveal > 0 && y >= start);
      header.toggleAttribute('data-pinned', isPinned);
      setPinned(isPinned);
    }
    function stopSettling() {
      if (!header) return;
      window.clearTimeout(settleTimer);
      if (header.hasAttribute('data-settling')) {
        reveal = new DOMMatrixReadOnly(getComputedStyle(header).transform).m42;
        header.style.setProperty('--ai-header-reveal', `${reveal}px`);
        header.dataset.reveal = String(reveal);
        header.removeAttribute('data-settling');
      }
    }
    function settle() {
      if (!header) return;
      const { available } = geometry();
      reveal = reveal >= available / 2 ? available : 0;
      header.setAttribute('data-settling', '');
      direction = 0;
      distance = 0;
      paint();
    }
    function update() {
      frame = 0;
      if (!header) return;
      stopSettling();
      const { y } = geometry();
      const delta = y - last;
      last = y;
      if (y === 0) { reveal = 0; direction = 0; distance = 0; }
      else if (Math.abs(delta) > 0) {
        const nextDirection = Math.sign(delta);
        if (nextDirection !== direction) { direction = nextDirection; distance = 0; }
        const threshold = direction < 0 ? OPEN_THRESHOLD : CLOSE_THRESHOLD;
        const previous = Math.max(0, distance - threshold);
        distance += Math.abs(delta);
        const change = Math.max(0, distance - threshold) - previous;
        reveal = clamp(reveal + (direction < 0 ? change : -change), ACTION_HEIGHT);
      }
      paint();
      if (!touchActive) settleTimer = window.setTimeout(settle, 160);
    }
    function onTouchStart() { touchActive = true; stopSettling(); direction = 0; distance = 0; }
    function onTouchEnd() { touchActive = false; window.clearTimeout(settleTimer); settleTimer = window.setTimeout(settle, 160); }
    function onScroll() { if (!frame) frame = requestAnimationFrame(update); }
    function onResize() { last = geometry().y; onScroll(); }
    function onFocus(event: FocusEvent) {
      if (!(event.target instanceof Element) || !event.target.closest('.ai-customer-actions')) return;
      stopSettling(); reveal = geometry().available; paint();
    }
    root.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchEnd, { passive: true });
    header.addEventListener('focusin', onFocus);
    const observer = new ResizeObserver(onResize);
    observer.observe(root);
    observer.observe(header);
    const profile = root.querySelector('.ai-customer-profile');
    if (profile) observer.observe(profile);
    frame = requestAnimationFrame(update);
    return () => {
      root.removeEventListener('scroll', onScroll);
      root.removeEventListener('touchstart', onTouchStart); root.removeEventListener('touchend', onTouchEnd); root.removeEventListener('touchcancel', onTouchEnd);
      header.removeEventListener('focusin', onFocus);
      observer.disconnect(); cancelAnimationFrame(frame); window.clearTimeout(settleTimer);
      header.style.removeProperty('--ai-header-reveal');
      header.removeAttribute('data-reveal'); header.removeAttribute('data-pinned'); header.removeAttribute('data-settling');
    };
  }, [enabled, customerId]);
  return { headerRef, markerRef, pinned };
}
