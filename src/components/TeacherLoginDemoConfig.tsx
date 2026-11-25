import { useId, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard';
import { demoAccount, unboundDemoAccount, demoPassword, demoCode, onboardingPhone, unregisteredPhone, conflictPhone } from '../pages/teacher-app/v1/login-demo';
import { Button } from './ui/Button';

type CopyResult = { id: string; copied: boolean };

function CopyValue({ label, shortLabel = label, value, result, onResult }: {
  label: string;
  shortLabel?: string;
  value: string;
  result: CopyResult | null;
  onResult: (result: CopyResult) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const copied = result?.id === id && result.copied;
  const copyLabel = `复制${label}`;

  async function copy() {
    const success = await copyText(value);
    if (!success) {
      input.current?.focus();
      input.current?.select();
    }
    onResult({ id, copied: success });
  }

  return <div className="login-demo-copy-row">
    <label htmlFor={id}>{shortLabel}</label>
    <input ref={input} id={id} aria-label={label} value={value} readOnly onFocus={event => event.currentTarget.select()} />
    <Button iconOnly size="sm" variant="ghost" icon={copied ? 'check' : 'file-copy-line'}
      aria-label={copyLabel} title={copied ? '已复制' : copyLabel} onClick={() => void copy()} />
  </div>;
}

export function TeacherLoginDemoConfig() {
  const [result, setResult] = useState<CopyResult | null>(null);
  const copyState = { result, onResult: setResult };

  return <section className="login-demo-config" aria-labelledby="login-demo-config-title">
    <h3 id="login-demo-config-title">登录演示数据</h3>
    <div className="login-demo-group" role="group" aria-label="账号登录">
      <h4>账号登录</h4>
      <p className="login-demo-scenarios">初始状态 · 已绑定直接进入，未绑定可跳过</p>
      <CopyValue label="已绑定手机号的工作账号" shortLabel="已绑定" value={demoAccount} {...copyState} />
      <CopyValue label="未绑定手机号的工作账号" shortLabel="未绑定" value={unboundDemoAccount} {...copyState} />
      <CopyValue label="密码" value={demoPassword} {...copyState} />
    </div>
    <div className="login-demo-group" role="group" aria-label="手机号登录">
      <h4>手机号登录</h4>
      <CopyValue label="入职登记手机号" shortLabel="多校选择" value={onboardingPhone} {...copyState} />
      <CopyValue label="未登记手机号" shortLabel="绑定学校" value={unregisteredPhone} {...copyState} />
      <CopyValue label="绑定冲突手机号" shortLabel="绑定冲突" value={conflictPhone} {...copyState} />
      <CopyValue label="验证码" value={demoCode} {...copyState} />
    </div>
    <p role="status" className={result && !result.copied ? 'login-demo-copy-error' : 'sr-only'}>
      {result ? result.copied ? '已复制' : '已选中，可手动复制' : ''}
    </p>
    <details className="login-demo-help">
      <summary>测试说明</summary>
      <ul>
        <li>多校：退出当前账号后，用「多校选择」号码验证即可选校。选过一所学校后，复登仍可选择其他校区。</li>
        <li>体验冲突时，先用「绑定学校」号码绑定初始未绑定的工作账号，退出后用「绑定冲突」号码验证同一账号。</li>
        <li>解决冲突时，用原号码登录，在当前学校验证原号码并解绑，再退出并使用新号绑定。</li>
      </ul>
    </details>
  </section>;
}
