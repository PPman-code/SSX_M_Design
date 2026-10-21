/** Local design preview only: preserves edited data and never requests a production API. */
export function simulateRefresh(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 700);
    signal.addEventListener('abort', abort, { once: true });
  });
}
