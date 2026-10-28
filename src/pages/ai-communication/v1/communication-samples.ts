import type { Communication } from './model';

/** Default preview histories; opened samples are stored by stable ID for editing. */
export function createCommunicationSamples(customerId: string): Communication[] {
  const examples = [
    { daysAgo: 0, hour: 8, minute: 30, creator: '刘亦菲', mode: '电话', result: '有效沟通', content: '与家长初步沟通了课程安排，家长希望先了解适合孩子的课程，后续继续跟进。' },
    { daysAgo: 1, hour: 15, minute: 20, creator: '王老师', mode: '微信', result: '有效沟通', content: '与家长沟通孩子近期上课表现和课后练习情况，已发送课堂反馈，家长表示会配合完成本周练习。' },
    { daysAgo: 2, hour: 10, minute: 15, creator: '刘亦菲', mode: '面谈', result: '有效沟通', content: '家长带孩子到校了解课程，重点咨询了班级人数、授课方式和课后练习安排。孩子参与了课堂小任务，愿意继续体验。已约定下次联系时确认体验课。' },
    { daysAgo: 3, hour: 18, minute: 40, creator: '王老师', mode: '电话', result: '无效沟通', content: '电话未接通，已通过微信留言说明来意。暂未收到家长回复，计划在家长方便的时间再次联系。' },
    { daysAgo: 5, hour: 14, minute: 5, creator: '刘亦菲', mode: '微信', result: '有效沟通', content: '家长咨询后续课程安排和请假补课方式，已说明补课流程，并约定下次上课时一起确认学习进度。' },
    { daysAgo: 7, hour: 11, minute: 30, creator: '刘亦菲', mode: '电话', result: '有效沟通', content: '首次联系家长，了解孩子目前的年级和兴趣方向。家长希望培养孩子的逻辑思维与表达能力，平时工作日较忙，更倾向周末到校体验。' },
  ];
  return examples.map((example, index) => {
    const date = new Date(); date.setDate(date.getDate() - example.daysAgo); date.setHours(example.hour, example.minute, 0, 0);
    return { id: `sample-${customerId}-${index}`, customerId, attachments: index === 0 ? [{ name: '体验课安排.pdf', type: 'pdf' }] : index === 1 ? [{ name: '课程介绍.png', image: 'mock/courses/vocal-course.png' }, { name: '课后练习说明.docx', type: 'word' }] : undefined, creator: example.creator, createdAt: date.toISOString(), content: example.content, result: example.result, mode: example.mode, nextMode: index === 1 ? '微信' : index === 2 ? '电话' : '', nextDate: index === 1 || index === 2 ? new Date(Date.now() + (index + 1) * 86400000).toLocaleDateString('en-CA') : '', source: 'manual', stage: index === 1 || index === 4 ? '售后' : '售前', outbound: index === 0 || index === 3 };
  });
}
