import { createContext, useContext } from 'react';

export const PreviewHistoryContext = createContext({ canBack: false, canForward: false, hasHistory: false });
export function usePreviewHistory() { return useContext(PreviewHistoryContext); }
