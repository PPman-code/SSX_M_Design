import { useState, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { PreviewHistoryContext } from './PreviewHistory.context';

/** Track only this application's entries, so controls never leave the preview. */
export function PreviewHistoryProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const action = useNavigationType();
  const [history, setHistory] = useState({ key: location.key, keys: [location.key], index: 0 });
  if (history.key !== location.key) {
    if (action === 'POP') {
      const index = history.keys.indexOf(location.key);
      setHistory(index < 0 ? { key: location.key, keys: [location.key], index: 0 } : { ...history, key: location.key, index });
    } else if (action === 'REPLACE') {
      const keys = [...history.keys]; keys[history.index] = location.key;
      setHistory({ ...history, key: location.key, keys });
    } else {
      const keys = [...history.keys.slice(0, history.index + 1), location.key];
      setHistory({ key: location.key, keys, index: keys.length - 1 });
    }
  }
  return <PreviewHistoryContext.Provider value={{ canBack: history.index > 0, canForward: history.index < history.keys.length - 1, hasHistory: history.keys.length > 1 }}>{children}</PreviewHistoryContext.Provider>;
}
