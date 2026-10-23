export type RecordStatus = 'recording' | 'paused' | 'interrupted' | 'transcribing' | 'summarizing' | 'failed' | 'empty' | 'ready';
export type Segment = { speaker: string; at: number; text: string };
export type AIRecord = {
  id: string; customerId: string; customerName: string; creator: string; createdAt: string;
  title: string; status: RecordStatus; duration: number; segments: Segment[]; speakers: Record<string, string>;
  summary: string; ownerId?: string; lastTick?: number; mockProcessError?: boolean; mockEmptyResult?: boolean; mockOffline?: boolean; processAt?: number; failedStage?: 'transcribing' | 'summarizing'; communicationId?: string;
};
export type Communication = {
  id: string; customerId: string; creator: string; createdAt: string; content: string;
  result: string; mode: string; nextMode: string; nextDate: string; source: 'ai' | 'manual'; stage?: '售前' | '售后'; outbound?: boolean; aiId?: string; duration?: number;
};
export type CommunicationState = { records: AIRecord[]; communications: Communication[]; seeded: string[]; storageError: boolean };
export const storageKey = 'ssx-ai-communication-prototype-v1';
export const statusLabels: Record<RecordStatus, string> = {
  recording: '正在录音', paused: '已暂停', interrupted: '录音已中断', transcribing: '正在完成转写', summarizing: '正在生成 AI 总结', failed: '处理失败，请重试', empty: '无有效沟通内容', ready: '总结已完成',
};
export const sampleSegments: Segment[] = [
  { speaker: '1', at: 0, text: '您好，今天想和您聊聊孩子最近的学习情况，您有什么比较关心的问题？' },
  { speaker: '2', at: 12, text: '孩子对编程挺感兴趣，希望周末能先体验一下，主要想锻炼逻辑思维。' },
  { speaker: '1', at: 27, text: '我们可以先安排一次体验课，了解孩子目前的基础，再一起确定适合的学习计划。' },
  { speaker: '2', at: 42, text: '可以的，麻烦您把周末的课程时间发给我，我和孩子确认一下。' },
];
export const sampleSummary = '核心摘要\n家长希望孩子通过编程课程锻炼逻辑思维，愿意先了解周末体验课安排。\n\n沟通过程\n老师了解了孩子的兴趣和家长期望，建议先参加体验课，再根据基础制定学习计划。家长表示愿意了解课程时间，与孩子确认后再决定。\n\n待跟进事项\n向家长发送周末体验课时间，等待家长确认。';
export const activeRecord = (record: AIRecord) => record.status === 'recording' || record.status === 'paused';
export const pendingRecord = (record: AIRecord, actor: string) => record.creator === actor && !record.communicationId && !activeRecord(record);
export const canView = (record: AIRecord, actor: string) => record.creator === actor || !!record.communicationId;
export function clockTime(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60).toString().padStart(2, '0')}:${(value % 60).toString().padStart(2, '0')}`;
}
export function dateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}
