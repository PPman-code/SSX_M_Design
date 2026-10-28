import { sampleSegments, sampleSummary, type AIRecord } from './model';

// Stable review fixtures: processing examples stay at their stage until explicitly reprocessed.
export const pendingShowcaseKey = (customerId: string, creator: string) => `pending-showcase-${customerId === 'customer-1' ? 'v5' : customerId === 'customer-2' ? 'v3' : 'v4'}:${customerId}:${creator}`;
export function createPendingSamples(customerId: string, customerName: string, creator: string): AIRecord[] {
  const cases: { key: string; title: string; status: AIRecord['status']; duration: number; fragments: number; failedStage?: AIRecord['failedStage'] }[] = [
    { key: 'ready', title: '周末编程体验课咨询', status: 'ready', duration: 324, fragments: 4 },
    { key: 'transcribing', title: '试听课时间与接送安排', status: 'transcribing', duration: 218, fragments: 2 },
    { key: 'summarizing', title: '课程计划与学习目标沟通', status: 'summarizing', duration: 407, fragments: 4 },
    { key: 'transcription-failed', title: '课程费用与报名方式咨询', status: 'failed', duration: 186, fragments: 2, failedStage: 'transcribing' },
    { key: 'summary-failed', title: '家长课后学习反馈', status: 'failed', duration: 263, fragments: 4, failedStage: 'summarizing' },
    { key: 'empty', title: '未接通的电话沟通', status: 'empty', duration: 18, fragments: 0 },
    { key: 'interrupted', title: '试听课安排确认', status: 'interrupted', duration: 74, fragments: 2 },
  ];
  // The first student remains the complete state review sample; other students have their own small histories.
  const studentIndex = Number(customerId.replace('customer-', '')) || 1;
  const choices = studentIndex === 1 ? cases : studentIndex === 2 ? [cases[0], cases[1]] : [];
  const course = studentIndex % 2 ? '编程' : '美术';
  const titles: Record<string, string> = { ready: `${customerName}的${course}体验课回访`, transcribing: `${customerName}家长到校时间确认`, summarizing: `${customerName}的学习计划沟通`, 'summary-failed': `${customerName}家长课程反馈`, empty: `${customerName}家长未接通回访`, interrupted: `${customerName}试听安排沟通` };
  return choices.map((item, index) => ({
    id: `${pendingShowcaseKey(customerId, creator)}:${item.key}`, customerId, customerName, creator,
    title: studentIndex === 1 ? item.title : titles[item.key] ?? `${customerName}的课程咨询`, status: item.status, duration: studentIndex === 1 ? item.duration : item.duration + studentIndex * 17,
    createdAt: new Date(Date.now() - (index + 1) * 45 * 60 * 1000).toISOString(),
    segments: sampleSegments.slice(0, item.fragments).map(segment => ({ ...segment, text: segment.text.replaceAll('编程', course) })),
    speakers: { '1': creator, '2': `${customerName}家长` },
    summary: item.status === 'ready' ? sampleSummary.replaceAll('编程', course) : '', failedStage: item.failedStage,
    mockPreviewHold: item.status === 'transcribing' || item.status === 'summarizing',
    mockEmptyResult: item.key === 'interrupted-empty',
  }));
}
