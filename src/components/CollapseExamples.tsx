import { useState } from 'react';
import { Collapse, CollapseItem } from './ui/Collapse';
import { Icon } from './ui/Icon';
import { Button } from './ui/Button';

export function CollapseExamples() {
  const [value, setValue] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');
  return <section className="demo-section" aria-labelledby="collapse-title">
    <div className="section-heading"><h2 id="collapse-title">折叠面板</h2><span>基础 · 多项 · 卡片</span></div>
    <Collapse label="基础折叠示例" value={value} onChange={setValue}>
      <CollapseItem value="first" title="基础折叠标题"><p>展开后展示补充说明，点击标题可收起。</p><Button variant="text" onClick={() => setFeedback('已操作折叠内容')}>面板内操作</Button></CollapseItem>
      <CollapseItem value="second" title="带图标与说明" leading={<Icon name="notification" size="sm" />} suffix={<Icon name="question-circle" size="sm" />}><p>同组默认只展开一项，标题图标与说明图标为展示内容。</p></CollapseItem>
      <CollapseItem value="disabled" title="禁用折叠面板" disabled><p>禁用内容不应打开。</p></CollapseItem>
    </Collapse>
    <Collapse label="多项折叠示例" multiple defaultValue={['long']}>
      <CollapseItem value="long" title="较长的折叠标题会自然换行，箭头保留在右侧，不挤压文字"><p>内容随文字自然撑开，不使用固定高度裁切正文。</p></CollapseItem>
      <CollapseItem value="another" title="可以同时展开这一项"><p>多项模式允许两个面板同时展开。</p></CollapseItem>
    </Collapse>
    <Collapse label="卡片折叠示例" variant="card">
      <CollapseItem value="card" title="编程基础班 A班" leading={<Icon name="xuanban1" size="base" />} summary={<div className="collapse-demo-summary"><span>上课次数 <strong>9</strong></span><span>出勤率 <strong>79.80%</strong></span></div>}><p>统计摘要保持可见，展开后查看详细统计。报表卡片复用此变体。</p></CollapseItem>
    </Collapse>
    {feedback && <p className="cell-demo-feedback" role="status">{feedback}</p>}
  </section>;
}
