import { useSyncExternalStore } from 'react';
import { activeRecord, sampleSegments, sampleSummary, storageKey, type AIRecord, type Communication, type CommunicationState } from './model';

// crypto.randomUUID is only available in secure contexts (https / localhost); plain http over a LAN IP has no access to it.
const uuid = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const windowOwner = (() => {
  try {
    const key = `${storageKey}-tab`;
    const existing = sessionStorage.getItem(key);
    // A duplicated tab inherits sessionStorage; only a real reload retains ownership.
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (existing && navigation?.type === 'reload') return existing;
    const id = uuid(); sessionStorage.setItem(key, id); return id;
  } catch { return uuid(); }
})();
let recoveredOnLoad = false;
function load(): CommunicationState {
  const blank = { records: [], communications: [], seeded: [], storageError: false };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return blank;
    const saved = JSON.parse(raw) as CommunicationState;
    if (!Array.isArray(saved.records) || !Array.isArray(saved.communications) || !Array.isArray(saved.seeded)) return blank;
    return { ...saved, storageError: false, records: saved.records.map(record => {
      if (activeRecord(record) && (!record.ownerId || record.ownerId === windowOwner)) { recoveredOnLoad = true; return { ...record, status: 'interrupted' }; }
      return record;
    }) };
  } catch { return { ...blank, storageError: true }; }
}
let state = load();
if (recoveredOnLoad) { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { state = { ...state, storageError: true }; } }
const listeners = new Set<() => void>();
function commit(next: CommunicationState) {
  try { localStorage.setItem(storageKey, JSON.stringify({ ...next, storageError: false })); state = { ...next, storageError: false }; }
  catch {
    // Never keep showing a running recorder when the simulated fragment cannot be stored.
    state = { ...state, storageError: true, records: state.records.map(record => activeRecord(record) ? { ...record, status: 'interrupted' } : record) };
  }
  listeners.forEach(listener => listener());
  return !state.storageError;
}
function update(id: string, transform: (record: AIRecord) => AIRecord) {
  return commit({ ...state, records: state.records.map(record => record.id === id ? transform(record) : record) });
}
export function useCommunications() {
  return useSyncExternalStore(callback => { listeners.add(callback); return () => listeners.delete(callback); }, () => state);
}
export function startRecord(customerId: string, customerName: string, creator: string): AIRecord | undefined {
  const active = state.records.find(activeRecord);
  if (active) return active;
  const previewParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const record: AIRecord = { ownerId: windowOwner, lastTick: Date.now(), mockProcessError: previewParams.get('process') === 'error', mockEmptyResult: previewParams.get('result') === 'empty', mockOffline: previewParams.get('network') === 'offline', id: uuid(), customerId, customerName, creator, createdAt: new Date().toISOString(), title: `${customerName}的沟通记录`, status: 'recording', duration: 0, speakers: { '1': '说话人 1', '2': '说话人 2' }, segments: [], summary: '' };
  return commit({ ...state, records: [...state.records, record] }) ? record : undefined;
}
export function pauseRecord(id: string, creator: string, paused: boolean) {
  return update(id, record => record.creator === creator && activeRecord(record) ? { ...record, lastTick: Date.now(), status: paused ? 'paused' : 'recording' } : record);
}
export function processRecord(id: string, creator: string) {
  return update(id, record => record.creator === creator && !record.communicationId ? { ...record, status: record.status === 'failed' ? record.failedStage ?? 'transcribing' : 'transcribing', processAt: Date.now() } : record);
}
export function editRecord(id: string, creator: string, change: { title?: string; speaker?: string; name?: string }) {
  return update(id, record => record.creator !== creator ? record : { ...record,
    ...(change.title ? { title: Array.from(change.title.trim()).slice(0, 20).join('') } : {}),
    ...(change.speaker && change.name?.trim() ? { speakers: { ...record.speakers, [change.speaker]: change.name.trim() } } : {}),
  });
}
export function deleteRecord(id: string, creator: string) {
  return commit({ ...state, records: state.records.filter(record => !(record.id === id && record.creator === creator && !activeRecord(record))) });
}
export function submitCommunication(input: Omit<Communication, 'id' | 'createdAt'>): string | undefined {
  const existing = input.aiId && state.communications.find(item => item.aiId === input.aiId);
  if (existing) return existing.creator === input.creator ? existing.id : undefined;
  const record = input.aiId ? state.records.find(item => item.id === input.aiId && item.creator === input.creator && item.customerId === input.customerId && item.status === 'ready' && !item.communicationId) : undefined;
  if (input.aiId && !record) return undefined;
  if (!input.content.trim() || Array.from(input.content).length > 1000 || !input.result) return undefined;
  const communication: Communication = { ...input, id: uuid(), createdAt: new Date().toISOString(), source: record ? 'ai' : 'manual', duration: record?.duration };
  return commit({ ...state, communications: [communication, ...state.communications], records: state.records.map(item => item.id === record?.id ? { ...item, communicationId: communication.id } : item) }) ? communication.id : undefined;
}
export function seedScenario(customerId: string, customerName: string, creator: string, scenario: string) {
  if (!['multiple', 'error', 'empty', 'interrupted', 'single'].includes(scenario)) return;
  const key = `${customerId}-${creator}-${scenario}`;
  if (state.seeded.includes(key)) return;
  const statuses = scenario === 'multiple' ? ['ready', 'failed', 'interrupted'] as const : [scenario === 'single' ? 'ready' : scenario === 'error' ? 'failed' : scenario === 'empty' ? 'empty' : 'interrupted'] as const;
  const records = statuses.map((status, index): AIRecord => ({
    id: uuid(), customerId, customerName, creator, title: `${customerName}的沟通记录`, createdAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    status, duration: 151, segments: [...sampleSegments], speakers: { '1': '说话人 1', '2': '说话人 2' }, summary: status === 'ready' ? sampleSummary : '', failedStage: status === 'failed' ? 'summarizing' : undefined,
  }));
  commit({ ...state, records: [...state.records, ...records], seeded: [...state.seeded, key] });
}

window.addEventListener('storage', event => {
  if (event.key !== storageKey || !event.newValue) return;
  try {
    const next = JSON.parse(event.newValue) as CommunicationState;
    if (Array.isArray(next.records) && Array.isArray(next.communications) && Array.isArray(next.seeded)) { state = next; listeners.forEach(listener => listener()); }
  } catch { /* Ignore malformed external prototype state. */ }
});

// One device-wide simulation clock survives route changes/minimization.
const timer = window.setInterval(() => {
  // The desktop workspace embeds the business page: only that surface drives time.
  if (!window.location.hash.startsWith('#/pages/') || state.storageError) return;
  // Read the latest shared checkpoint before advancing, so two tabs cannot add the same second twice.
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const latest = JSON.parse(saved) as CommunicationState;
      if (Array.isArray(latest.records) && Array.isArray(latest.communications) && Array.isArray(latest.seeded)) state = latest;
    }
  } catch { /* commit reports storage errors if recording needs to advance. */ }
  let changed = false;
  const records = state.records.map((record): AIRecord => {
    if (record.status === 'recording') {
      const elapsed = Math.max(0, Math.floor((Date.now() - (record.lastTick ?? Date.now())) / 1000));
      if (!elapsed) return record;
      changed = true;
      const duration = record.duration + elapsed;
      const online = navigator.onLine && !record.mockOffline;
      const segments = online ? sampleSegments.slice(0, Math.min(4, Math.floor(duration / 3) + 1)) : record.segments;
      return { ...record, duration, segments, lastTick: (record.lastTick ?? Date.now()) + elapsed * 1000 };
    }
    if ((record.status === 'transcribing' || record.status === 'summarizing') && Date.now() - (record.processAt ?? 0) >= 1800) {
      changed = true;
      if (record.mockProcessError || !navigator.onLine) return { ...record, status: 'failed', failedStage: record.status, mockProcessError: false };
      if (record.status === 'transcribing') return { ...record, status: 'summarizing', processAt: Date.now(), segments: [...sampleSegments] };
      if (record.mockEmptyResult) return { ...record, status: 'empty', summary: '', segments: [] };
      return { ...record, status: 'ready', summary: sampleSummary };
    }
    return record;
  });
  if (changed) commit({ ...state, records });
}, 1000);
if (import.meta.hot) import.meta.hot.dispose(() => window.clearInterval(timer));
