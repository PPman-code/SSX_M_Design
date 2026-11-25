import { useEffect, useRef, useState, type FormEvent, type Ref } from 'react';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Dialog } from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Icon } from '../../../components/ui/Icon';
import { VerificationCodeInput } from '../../../components/ui/VerificationCodeInput';
import { useToast } from '../../../components/ui/useToast';
import { demoAccountSchools, demoPassword, demoCode, maskPhone, onboardingPhone, schoolStatusLabel, type DemoAccountSchool, type DemoSchool } from './login-demo';
import './teacher-login.css';

const loginAssets = `${import.meta.env.BASE_URL}pages/teacher-app/v1/login/`;
const privacyTitle = '服务协议及隐私保护';
const smsLoadingMs = 600;

const loginQuestions = [
  '这周的出勤率如何？',
  '我要给今天的课程点名。',
  '看一下今天的排课。',
  '今天有哪些试听课？',
  '今天还有什么事情要处理？',
  '哪些学员待回访？',
  '这次沟通重点是什么？',
];
const questionSlots = ['top', 'upper', 'featured', 'lower', 'bottom', 'enter', 'exit'];

function TeacherLoginQuestions() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;
    const syncMotion = () => {
      window.clearInterval(timer);
      if (!reducedMotion.matches) {
        timer = window.setInterval(() => setCurrent(index => (index + 1) % loginQuestions.length), 2200);
      }
    };
    syncMotion();
    reducedMotion.addEventListener('change', syncMotion);
    return () => {
      window.clearInterval(timer);
      reducedMotion.removeEventListener('change', syncMotion);
    };
  }, []);

  return <div className="guanzai-questions">
    {loginQuestions.map((question, index) => {
      const slot = questionSlots[(index - current + questionSlots.length) % questionSlots.length];
      return <span className="guanzai-question" data-slot={slot} key={question}>
        {slot === 'featured' && <span className="guanzai-question-icon" />}
        <span className="guanzai-question-text">{question}</span>
      </span>;
    })}
  </div>;
}

export function TeacherLoginPreviewStatus() {
  return <div className="preview-system-status teacher-login-preview-status" aria-hidden="true">
    <span>9:41</span>
    <div className="teacher-login-status-icons">
      <img src={`${loginAssets}cellular.svg`} alt="" />
      <img src={`${loginAssets}wifi.svg`} alt="" />
      <span className="teacher-login-status-battery"><img src={`${loginAssets}battery-cap.svg`} alt="" /></span>
    </div>
  </div>;
}

export type LoginStep = 'phone' | 'account' | 'bind-account' | 'bind-phone' | 'unbind-phone' | 'verify-phone' | 'select-school' | 'signed-in';
export type SmsChallenge = { phone: string; origin: 'phone' | 'bind-phone' | 'unbind-phone'; resendAt: number };
const copy = {
  phone: ['手机号登录'],
  account: ['账号登录', '请输入学校分配的工作账号和密码。'],
  'bind-account': ['绑定工作账号', '请输入学校分配的账号和密码，绑定已验证的手机号。'],
  'bind-phone': ['绑定手机号', '绑定后，下次可以使用手机验证码登录。'],
  'unbind-phone': ['解绑手机号', '请验证原手机号。解绑后，这个号码将不能用于登录当前学校。'],
  'verify-phone': ['输入验证码'],
  'select-school': ['选择学校'],
} satisfies Record<Exclude<LoginStep, 'signed-in'>, [string, string?]>;

export function TeacherLogin({ step, changeStep, verifiedPhone, boundPhone, reservedPhone, sms, onRequestCode, onResendCode, onPhoneVerified, onAccountVerified, currentSchool, onEnterSchool, headingRef, schoolChoices, agreementChecked, onAgreementChange, onOpenAgreement }: {
  step: Exclude<LoginStep, 'signed-in'>;
  changeStep: (step: LoginStep) => void;
  verifiedPhone: string;
  boundPhone: string;
  reservedPhone: string;
  sms?: SmsChallenge;
  onRequestCode: (phone: string) => void;
  onResendCode: () => void;
  onPhoneVerified: () => string | undefined;
  currentSchool?: DemoSchool;
  schoolChoices: readonly DemoSchool[];
  hasBoundChoices: boolean;
  headingRef: Ref<HTMLHeadingElement>;
  onEnterSchool: (school: string) => string | undefined;
  onAccountVerified: (school: DemoAccountSchool) => string | undefined;
  agreementChecked: boolean;
  onAgreementChange: (checked: boolean) => void;
  onOpenAgreement: () => void;
}) {
  const [phone, setPhone] = useState(step === 'unbind-phone' ? boundPhone : sms?.origin === step ? sms.phone : step === 'bind-phone' ? reservedPhone : '');
  const [code, setCode] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [wechatOpen, setWechatOpen] = useState(false);
  const [phoneFormatAlertOpen, setPhoneFormatAlertOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const smsTimer = useRef<number | undefined>(undefined);
  const wechatButtonRef = useRef<HTMLButtonElement>(null);
  const [now, setNow] = useState(Date.now);
  const { showToast } = useToast();
  const [error, setError] = useState<{ field: string; message: string }>();
  const resendAt = step === 'verify-phone' ? sms?.resendAt ?? 0 : 0;
  const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const resendDisabled = resendSeconds > 0;
  const usesPhone = step === 'phone' || step === 'bind-phone' || step === 'unbind-phone';
  const validPhone = /^1[3-9]\d{9}$/.test(phone);
  const [title, description] = copy[step];
  const submitLabel = step === 'phone' ? '下一步'
    : usesPhone ? '获取验证码'
    : step === 'bind-account' ? '绑定'
    : '登录';

  useEffect(() => {
    if (!resendDisabled) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [resendDisabled]);
  useEffect(() => () => window.clearTimeout(smsTimer.current), []);

  function startPhoneVerification() {
    if (smsTimer.current !== undefined) return;
    setSendingCode(true);
    smsTimer.current = window.setTimeout(() => {
      smsTimer.current = undefined;
      setSendingCode(false);
      setPrivacyOpen(false);
      onRequestCode(phone);
    }, smsLoadingMs);
  }

  function updateCode(value: string) {
    if (value === code) return;
    setCode(value);
    setError(undefined);
    if (value.length !== demoCode.length) return;
    if (value !== demoCode) {
      setCode('');
      showToast({ message: '验证码错误', type: 'error' });
      return;
    }
    const conflict = onPhoneVerified();
    if (conflict) setError({ field: 'binding-conflict', message: conflict });
  }

  function openAccountLogin() {
    setError(undefined);
    changeStep('account');
  }

  function fieldError(field: string) {
    return error?.field === field ? { status: 'error' as const, description: error.message } : {};
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (usesPhone) {
      if (!validPhone) return setPhoneFormatAlertOpen(true);
      if (step !== 'phone') onRequestCode(phone);
      else if (agreementChecked) startPhoneVerification();
      else setPrivacyOpen(true);
      return;
    }
    if (!account.trim()) return setError({ field: 'account', message: '请输入学校分配的工作账号。' });
    if (!password) return setError({ field: 'password', message: '请输入密码。' });
    const school = demoAccountSchools.find(item => item.account === account.trim().toLowerCase());
    if (!school || password !== demoPassword) {
      return setError({ field: 'password', message: '工作账号或密码不正确，请核对后重试。' });
    }
    const conflict = onAccountVerified(school);
    if (conflict) setError({ field: 'binding-conflict', message: conflict });
  }

  const bindingConflict = error?.field === 'binding-conflict' || error?.field === 'school';

  return <section className={step === 'phone' ? 'teacher-login teacher-login-home' : step === 'select-school' ? 'teacher-login teacher-login-select-school' : 'teacher-login'} aria-labelledby="teacher-login-title">
    {step === 'phone' && <header className="guanzai-welcome" aria-hidden="true">
      <img className="guanzai-portrait" src={`${loginAssets}guanzai.png`} alt="" />
      <TeacherLoginQuestions />
    </header>}
    <div className={step === 'phone' ? 'teacher-login-card' : undefined}>
      <div className={step === 'phone' ? 'teacher-login-card-heading' : 'teacher-login-intro'}>
        <h1 id="teacher-login-title" tabIndex={-1} ref={headingRef} aria-label={step === 'phone' ? title : undefined}>
          {step === 'phone' ? '🎉欢迎登录校管家' : title}
        </h1>
        {description && <p>{description}</p>}
        {step === 'verify-phone' && sms && <p role="status">接收手机号 <strong>{sms.phone}</strong></p>}
        {verifiedPhone && step === 'bind-account' && <p className="teacher-login-verified">已验证 {maskPhone(verifiedPhone)}</p>}
        {verifiedPhone && step === 'select-school' && <p className="teacher-login-school-caption"><strong>{maskPhone(verifiedPhone)}</strong> 关联的学校</p>}
      </div>

      {step === 'select-school' ? <>
        <div className="teacher-login-schools" role="group" aria-label="学校与任职记录">
          {schoolChoices.map(item => <Button key={item.id} className="teacher-login-school" variant="secondary"
            data-school-status={item.status} disabled={item.status === 'inactive'} onClick={() => {
              const message = onEnterSchool(item.id);
              if (message) setError({ field: 'school', message });
            }}>
            <span className="teacher-login-school-avatar" aria-hidden="true">{Array.from(item.name.trim())[0]}</span>
            <span className="teacher-login-school-info">
              <strong>{item.name}</strong>
              <span className="teacher-login-school-meta"><span>{item.campus}</span><span className="teacher-login-school-status">{schoolStatusLabel[item.status]}</span></span>
            </span>
            {item.status !== 'inactive' && <Icon name="right" size="base" />}
          </Button>)}
        </div>
        {bindingConflict && <p className="teacher-login-error" role="alert">{error.message}</p>}
        {bindingConflict && <Button variant="ghost" block onClick={() => changeStep('phone')}>返回手机号登录</Button>}
        <Button className="teacher-login-school-help" variant="ghost" block onClick={() => changeStep('bind-account')}>没找到我的校区</Button>
      </> : <>
        {(step === 'bind-phone' || step === 'unbind-phone' || (step === 'verify-phone' && sms?.origin !== 'phone')) && currentSchool &&
          <p className="teacher-login-context">当前学校 <strong>{currentSchool.name}</strong></p>}
        {step === 'verify-phone' ? <div className="teacher-login-form">
          <VerificationCodeInput label="验证码" value={code} onValueChange={updateCode} />
          {bindingConflict && <p className="teacher-login-error" role="alert">{error.message}</p>}
          <Button className="teacher-login-resend" variant="ghost" block disabled={resendDisabled} onClick={() => {
            setError(undefined);
            setCode('');
            setNow(Date.now());
            onResendCode();
          }}>{resendDisabled ? `${resendSeconds} 秒后重新发送` : '重新发送验证码'}</Button>
        </div> : <form className="teacher-login-form" onSubmit={submit} noValidate>
          {usesPhone ?
            <Input label="手机号" hideLabel layout="external" type="tel" autoComplete="tel-national" maxLength={11} placeholder={step === 'phone' ? '请输入手机号码' : '请输入 11 位手机号'} value={phone}
              readOnly={step === 'unbind-phone' || sendingCode}
              description={step === 'bind-phone' && reservedPhone && phone === reservedPhone ? '已填入入职预留手机号，可修改。' : undefined}
              onValueChange={value => { setPhone(value.replace(/\D/g, '')); setError(undefined); }} />
          : <>
            <Input label="工作账号" hideLabel layout="external" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="请输入工作账号" value={account}
              onValueChange={value => { setAccount(value); setError(undefined); }} {...fieldError('account')} />
            <Input label="密码" hideLabel layout="external" type="password" autoComplete="current-password" placeholder="请输入密码" value={password}
              onValueChange={value => { setPassword(value); setError(undefined); }} {...fieldError('password')} />
          </>}
          {bindingConflict && <p className="teacher-login-error" role="alert">{error.message}</p>}
          <Button className="teacher-login-submit" type="submit" block loading={sendingCode} loadingText="发送中">{submitLabel}</Button>
        </form>}
        {step === 'phone' && <>
          <div className="teacher-login-agreement">
            <Checkbox label="阅读并同意" className="teacher-login-agreement-check" checked={agreementChecked} onChange={onAgreementChange} disabled={sendingCode} />
            {['服务协议', '隐私政策'].map(label => <Button key={label} variant="text" onClick={onOpenAgreement}>
              《{label}》
            </Button>)}
          </div>
          <div className="teacher-login-divider">其他登录方式</div>
          <div className="teacher-login-alternatives">
            <Button ref={wechatButtonRef} className="teacher-login-switch" variant="ghost" block disabled={sendingCode} onClick={() => setWechatOpen(true)}>
              <img src={`${loginAssets}wechat.svg`} alt="" />
              <span>微信登录</span>
            </Button>
            <Button className="teacher-login-switch" variant="ghost" block disabled={sendingCode} onClick={openAccountLogin}>
              <img src={`${loginAssets}account.svg`} alt="" />
              <span>账号登录</span>
            </Button>
          </div>
          <BottomSheet open={privacyOpen} onOpenChange={open => { if (!sendingCode) setPrivacyOpen(open); }}
            title={privacyTitle}
            footer={<div className="sheet-actions">
              <Button variant="soft" disabled={sendingCode} onClick={() => setPrivacyOpen(false)}>不同意</Button>
              <Button loading={sendingCode} loadingText="发送中" onClick={() => {
                onAgreementChange(true);
                startPhoneVerification();
              }}>同意并登录</Button>
            </div>}>
            <div className="teacher-login-privacy-copy">
              我已阅读并同意<Button variant="text" onClick={onOpenAgreement}>服务协议</Button>、
              <Button variant="text" onClick={onOpenAgreement}>隐私权政策</Button>
            </div>
          </BottomSheet>
          <Dialog open={wechatOpen} onOpenChange={setWechatOpen} finalFocus={wechatButtonRef} title="微信登录" actions={[
            { label: '取消' },
            { label: '验证手机号', onSelect: () => onRequestCode(onboardingPhone) },
          ]}>
            <p>模拟微信授权。使用演示微信绑定的手机号 {maskPhone(onboardingPhone)} 验证后继续登录。</p>
          </Dialog>
        </>}
        {step === 'bind-phone' && <Button variant="text" block onClick={() => changeStep('signed-in')}>暂不绑定</Button>}
        {step === 'bind-account' && <Button variant="text" block onClick={() => changeStep('phone')}>{bindingConflict ? '返回手机号登录' : '更换手机号'}</Button>}
        {step === 'bind-account' && <p className="teacher-login-help">没有工作账号或密码？请向学校管理员索取。</p>}
        {step === 'account' && <p className="teacher-login-help">账号或密码有问题？请联系学校管理员。</p>}
      </>}
    </div>
    <Dialog open={phoneFormatAlertOpen} onOpenChange={setPhoneFormatAlertOpen} title="手机号格式不正确" actions={[{ label: '我知道了' }]}>
      {null}
    </Dialog>
  </section>;
}
