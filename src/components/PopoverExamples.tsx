import { useState } from 'react';
import { Popover, type PopoverPlacement } from './ui/Popover';
import { Button } from './ui/Button';

const placements: { value: PopoverPlacement; label: string }[] = [{ value: 'top-start', label: '上左' }, { value: 'top', label: '上方' }, { value: 'top-end', label: '上右' }, { value: 'bottom-start', label: '下左' }, { value: 'bottom', label: '下方' }, { value: 'bottom-end', label: '下右' }];
export function PopoverExamples() {
  const [feedback, setFeedback] = useState('');
  return <section aria-labelledby="popovers-title" className="demo-section"><div className="section-heading"><h2 id="popovers-title">气泡提示</h2><span>点击展开</span></div><div className="demo-card popover-examples">
    <div className="popover-example-grid">{placements.map(({ value, label }) => <Popover key={value} placement={value} trigger={<Button variant="secondary" size="sm">{label}气泡</Button>} content={`${label}的轻量说明`} />)}</div>
    <div className="popover-example-grid"><Popover appearance="dark" content="黑色气泡说明" trigger={<Button variant="secondary" size="sm">黑色气泡</Button>} /><Popover closable content="可关闭的气泡说明" trigger={<Button variant="secondary" size="sm">带关闭气泡</Button>} /><Popover content="点击确认继续" action={{ label: '确认', onClick: () => setFeedback('已执行气泡按钮操作') }} trigger={<Button variant="secondary" size="sm">带按钮气泡</Button>} /><Popover appearance="dark" content="了解更多信息" action={{ label: '查看', style: 'text', onClick: () => setFeedback('已执行气泡文本操作') }} trigger={<Button variant="secondary" size="sm">带文本气泡</Button>} /></div>
    {feedback && <p role="status" className="feedback">{feedback}</p>}
  </div></section>;
}
