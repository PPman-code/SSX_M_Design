import { useState } from 'react';
import { Button } from './ui/Button';

export function ButtonExamples() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  return <section aria-labelledby="buttons-title" className="demo-section"><div className="section-heading"><h2 id="buttons-title">按钮</h2><span>样式 · 尺寸 · 状态</span></div><div className="demo-card button-examples">
    <Button onClick={() => setFeedback('已触发主操作，仅为交互示例')}>主要操作</Button>
    <div className="button-pair"><Button variant="secondary" onClick={() => setFeedback('已触发次要操作，仅为交互示例')}>次要操作</Button><Button disabled>暂不可用</Button></div>
    <div className="button-example-grid"><Button variant="soft">辅助色按钮</Button><Button variant="outline">线框按钮</Button><Button variant="text">文字按钮</Button><Button tone="danger">危险操作</Button><Button tone="warning">警告操作</Button><Button variant="outline" tone="danger">危险线框</Button></div>
    <div className="button-example-grid"><Button shape="round">全圆角</Button><Button shape="square">直角按钮</Button><Button icon="check" onClick={() => setFeedback('已点击带图标按钮')}>带图标按钮</Button><Button icon="check" iconOnly shape="round" aria-label="仅图标确认" onClick={() => setFeedback('已点击纯图标按钮')} /></div>
    <p className="button-standard-note">默认规格：44px 高 · 8px 圆角 · 15px 字号 / 400 字重</p>
    <Button block onClick={() => setFeedback('已点击通栏按钮')}>通栏按钮</Button>
    <div className="button-example-grid"><Button loading={loading} loadingText="处理中" onClick={() => setLoading(true)}>加载状态示例</Button><Button variant="secondary" onClick={() => setLoading(false)}>结束加载</Button><Button disabled variant="outline">禁用线框</Button><Button disabled variant="soft">禁用辅助色</Button></div>
    {feedback && <p className="feedback" role="status">{feedback}</p>}
  </div></section>;
}
