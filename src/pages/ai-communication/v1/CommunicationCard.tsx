import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { dateTime, type Communication } from './model';

/** Local card shared by saved records and read-only preview histories. */
export function CommunicationCard({ item, onEdit, onViewAI }: { item: Communication; onEdit?: () => void; onViewAI?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const content = useRef<HTMLParagraphElement>(null);
  const contentId = useId();
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setOverflow(element.scrollHeight > 75);
    const observer = new ResizeObserver(measure);
    observer.observe(element); measure();
    return () => observer.disconnect();
  }, [item.content]);
  return <article className="ai-communication-card">
    <div className="ai-card-author"><span className="ai-author-avatar">{item.creator[0]}</span><div className="ai-card-person"><b>{item.creator}</b><p>{[dateTime(item.createdAt), item.mode, item.result].filter(Boolean).join(' · ')}</p></div>{onEdit && <Button className="ai-communication-edit" variant="text" onClick={onEdit}>修改<Icon name="right" size="sm" /></Button>}</div>
    <p id={contentId} ref={content} className={`ai-content-text ai-card-description ${expanded ? 'is-expanded' : ''}`}>{item.content}</p>
    {(!!item.attachments?.length || onViewAI) && <div className="ai-card-attachments" aria-label="沟通附件">
      {onViewAI && <Button className="ai-card-attachment ai-card-original" variant="text" onClick={onViewAI} aria-label="查看 AI 原始录音与转写"><Icon name="a-ailuyinzhuanxiesvg" size="lg" /><span title="AI 原始录音与转写">AI 录音转写</span></Button>}
      {item.attachments?.map((file, index) => <div className="ai-card-attachment" key={`${file.name}-${index}`}>{file.image ? <img src={`${import.meta.env.BASE_URL}${file.image}`} alt={file.name} /> : <><Icon name={file.type === 'word' ? 'word' : file.type === 'pdf' ? 'pdf' : 'wenjian1'} size="lg" /><span title={file.name}>{file.name}</span></>}</div>)}
    </div>}
    <div className="ai-card-bottom"><span className="ai-card-followup">下次跟进：{[item.nextDate?.replaceAll('-', '/'), item.nextMode].filter(Boolean).join(' · ') || '待定'}</span>{overflow && <Button variant="text" className="ai-card-expand" aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)}>{expanded ? '收起' : '展开'}<Icon name={expanded ? 'up' : 'down'} size="sm" /></Button>}</div>
  </article>;
}
