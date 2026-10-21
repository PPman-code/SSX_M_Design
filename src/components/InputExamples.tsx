import { useState } from 'react';
import { Input, type InputProps } from './ui/Input';
import { Button } from './ui/Button';
import './InputExamples.css';

function ExampleField({ initialValue = '', ...props }: Omit<InputProps, 'value' | 'onValueChange'> & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return <Input {...props} value={value} onValueChange={setValue} />;
}

export function InputExamples() {
  const [feedback, setFeedback] = useState('');
  return <section className="demo-section input-examples" aria-labelledby="input-title">
    <div className="section-heading"><h2 id="input-title">输入框 Input</h2><span>横排 · 垂直 · 标签外置</span></div>
    <h3>基础输入</h3>
    <div className="input-example-group">
      <ExampleField label="基础输入" placeholder="请输入内容" />
      <ExampleField label="必填信息" required placeholder="请输入内容" />
      <ExampleField label="备注" optional placeholder="请输入内容" />
      <ExampleField label="无标签输入" hideLabel placeholder="不显示标签，保留无障碍名称" />
      <ExampleField label="辅助说明" placeholder="请输入内容" description="辅助说明用于解释当前输入项" />
      <ExampleField label="可清除" clearable placeholder="输入后可清除" />
      <ExampleField label="较长的标签内容" placeholder="标签自动换行" />
    </div>
    <h3>前后缀与操作</h3>
    <div className="input-example-group">
      <ExampleField label="账号" leadingIcon="user" placeholder="请输入账号" />
      <ExampleField label="密码" type="password" autoComplete="new-password" placeholder="请输入密码" />
      <ExampleField label="联系电话" type="tel" inputMode="tel" prefix="+86" placeholder="请输入手机号" />
      <ExampleField label="验证码" inputMode="numeric" maxLength={6} placeholder="6 位数字" suffix={<Button className="input-code-action" size="sm" onClick={() => setFeedback('演示验证码：123456，仅本地展示，未发送短信')}>发送验证码</Button>} />
      <ExampleField label="价格" inputMode="decimal" placeholder="0.00" className="input-example-numeric" suffix="元" />
      <ExampleField label="数量" inputMode="numeric" placeholder="0" className="input-example-numeric" suffix="个" />
    </div>
    {feedback && <p className="input-example-feedback" role="status">{feedback}</p>}
    <h3>输入状态</h3>
    <div className="input-example-group">
      <ExampleField label="填写完成" initialValue="已填写的内容" clearable />
      <ExampleField label="只读信息" initialValue="只读内容" readOnly />
      <ExampleField label="不可编辑" initialValue="禁用内容" disabled />
      <ExampleField label="成功示例" initialValue="验证成功" status="success" description="内容已通过校验" />
      <ExampleField label="警示示例" initialValue="请核对内容" status="warning" description="请确认输入的信息" />
      <ExampleField label="错误示例" initialValue="格式有误" status="error" description="请输入正确的内容" />
    </div>
    <h3>垂直布局</h3>
    <div className="input-example-group"><ExampleField label="垂直布局" layout="vertical" placeholder="请输入内容" /><ExampleField label="垂直说明" layout="vertical" placeholder="请输入内容" description="说明跟随输入区，内容较长时自然换行" /></div>
    <h3>标签外置</h3>
    <div className="input-example-external"><ExampleField label="外置标签" layout="external" placeholder="请输入内容" clearable /><ExampleField label="外置错误" layout="external" placeholder="请输入内容" status="error" description="请输入正确的内容" /></div>
  </section>;
}
