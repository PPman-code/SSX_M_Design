import { useState } from 'react';
import { Radio, RadioGroup } from './ui/Radio';

export function RadioExamples() {
  const [selection, setSelection] = useState('a');
  const [dot, setDot] = useState('a');
  return <section aria-labelledby="radios-title" className="demo-section">
    <div className="section-heading"><h2 id="radios-title">单选</h2><span>20px · 44px 触控区</span></div>
    <div className="demo-card radio-examples">
      <RadioGroup label="基础单选示例" name="check-demo" value={selection} onChange={setSelection}>
        <Radio value="a" label="选项一" /><Radio value="b" label="选项二" /><Radio value="c" label="禁用未选中" disabled />
      </RadioGroup>
      <RadioGroup label="禁用已选中示例" value="selected" disabled><Radio value="selected" label="禁用已选中" /></RadioGroup>
      <p className="radio-example-note">当前选择：{selection === 'a' ? '选项一' : '选项二'}</p>
      <RadioGroup label="列表单选示例" value={dot} onChange={setDot}>
        <Radio value="a" label="列表选项一" variant="list" /><Radio value="b" label="列表选项二" variant="list" />
      </RadioGroup>
      <div className="radio-icon-samples">
        <RadioGroup label="圆点禁用状态" value="on" disabled><Radio value="on" label="圆点禁用选中" variant="dot" hideLabel /><Radio value="off" label="圆点禁用未选中" variant="dot" hideLabel /></RadioGroup>
        <RadioGroup label="圆点基础状态" value={selection} onChange={setSelection}><Radio value="a" label="仅图标选项一" hideLabel /><Radio value="b" label="仅图标选项二" hideLabel /></RadioGroup>
      </div>
      <RadioGroup label="长文字单选示例" value="long"><Radio value="long" label="较长的选项说明会自然换行，保持单选标记与首行文字对齐" /></RadioGroup>
    </div>
  </section>;
}
