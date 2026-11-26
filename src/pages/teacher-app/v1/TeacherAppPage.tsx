import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/useToast';
import { simulateRefresh } from '../../../preview/simulateRefresh';
import { MyPageContent } from '../../my/v1/MyPage';
import { allDemoSchools, demoAccountSchools, demoSchools, maskPhone, onboardingPhone, type DemoAccountSchool, type DemoSchool } from './login-demo';
import { loginSessionKey, readLoginSession, writeLoginSession, type LoginSession } from './login-session';
import { AppPage } from './AppPage';
import { AiraChat } from './AiraChat';
import { TeacherLogin, TeacherLoginPreviewStatus, type LoginStep, type SmsChallenge } from './TeacherLogin';
import { TeacherWorkbench } from './TeacherWorkbench';
import { WorkbenchNavigation, type WorkbenchView } from './WorkbenchNavigation';
import './teacher-mine.css';

const smsCooldownMs = 60_000;

export function TeacherAppPage() {
  const [params] = useSearchParams();
  const toast = useToast();
  const [session, setSession] = useState(readLoginSession);
  const [step, setStep] = useState<LoginStep>(() => session.schoolId ? 'signed-in' : 'phone');
  const [workbenchView, setWorkbenchView] = useState<WorkbenchView>('home');
  const [airaOpen, setAiraOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const restoreSettingsFocus = useRef(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [sms, setSms] = useState<SmsChallenge>();
  const [agreementChecked, setAgreementChecked] = useState(false);
  const currentSchool = allDemoSchools.find(school => school.id === session.schoolId);
  const boundPhone = session.bindings.find(binding => binding.schoolId === session.schoolId)?.phone ?? '';
  const matchedBindings = session.bindings.filter(binding => binding.phone === verifiedPhone);
  const hasBoundChoices = matchedBindings.length > 1;
  const schoolChoices = hasBoundChoices
    ? allDemoSchools.filter(school => matchedBindings.some(binding => binding.schoolId === school.id))
    : demoSchools;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const atLogin = step === 'phone' || step === 'account';
  const screen = atLogin ? 'login' : step;
  const signedIn = step === 'signed-in';
  const showWorkbench = signedIn && workbenchView === 'home';
  const showMine = signedIn && workbenchView === 'mine' && !settingsOpen;
  const showSettings = signedIn && settingsOpen;
  const previousScreen = useRef({ step, workbenchView, settingsOpen });

  useEffect(() => {
    if (previousScreen.current.step !== step || previousScreen.current.workbenchView !== workbenchView || previousScreen.current.settingsOpen !== settingsOpen) {
      if (restoreSettingsFocus.current && showMine) {
        settingsRef.current?.focus();
        restoreSettingsFocus.current = false;
      } else headingRef.current?.focus();
    }
    previousScreen.current = { step, workbenchView, settingsOpen };
  }, [step, workbenchView, settingsOpen, showMine]);

  useEffect(() => {
    function syncSession(event: StorageEvent) {
      if (event.key !== loginSessionKey && event.key !== null) return;
      const stored = readLoginSession();
      setSession(stored);
      setVerifiedPhone('');
      setSms(undefined);
      setAgreementChecked(false);
      setWorkbenchView('home');
      setAiraOpen(false);
      setSettingsOpen(false);
      setStep(stored.schoolId ? 'signed-in' : 'phone');
    }
    window.addEventListener('storage', syncSession);
    return () => window.removeEventListener('storage', syncSession);
  }, []);

  function saveSession(next: LoginSession) {
    setSession(next);
    writeLoginSession(next);
  }

  function restart() {
    setSettingsOpen(false);
    setAiraOpen(false);
    setWorkbenchView('home');
    setVerifiedPhone('');
    setSms(undefined);
    setStep('phone');
  }

  function backToLogin() {
    if (showSettings) {
      restoreSettingsFocus.current = true;
      setSettingsOpen(false);
      return;
    }
    if (step === 'verify-phone' && sms) setStep(sms.origin);
    else if (step === 'bind-phone' || step === 'unbind-phone') {
      setSms(undefined);
      setStep('signed-in');
    }
    else if (step === 'bind-account' && (verifiedPhone === onboardingPhone || hasBoundChoices)) setStep('select-school');
    else restart();
  }

  function bindAndSignIn(school: DemoSchool, phone: string) {
    const existing = session.bindings.find(binding => binding.schoolId === school.id);
    if (existing && existing.phone !== phone) {
      return `该工作账号已绑定 ${maskPhone(existing.phone)}。请先用原手机号登录并解绑，再用当前手机号重试。无法使用原手机号时，请联系学校管理员。`;
    }
    saveSession({
      schoolId: school.id,
      bindings: [{ schoolId: school.id, phone }, ...session.bindings.filter(binding => binding.schoolId !== school.id)],
    });
    setVerifiedPhone('');
    setSms(undefined);
    setSettingsOpen(false);
    setStep('signed-in');
  }

  function sendCode(phone: string, origin: SmsChallenge['origin']) {
    setSms({ phone, origin, resendAt: Date.now() + smsCooldownMs });
    toast.showToast({ message: '验证码已发送', type: 'success' });
  }

  function requestCode(phone: string) {
    if (step !== 'phone' && step !== 'bind-phone' && step !== 'unbind-phone') return;
    if (sms?.phone !== phone || sms.origin !== step || sms.resendAt <= Date.now()) sendCode(phone, step);
    setStep('verify-phone');
  }

  function resendCode() {
    if (step !== 'verify-phone' || !sms || sms.resendAt > Date.now()) return;
    sendCode(sms.phone, sms.origin);
  }

  function phoneVerified() {
    if (step !== 'verify-phone' || !sms) return '请返回后重新获取验证码。';
    const { phone, origin } = sms;
    if (origin === 'bind-phone' && currentSchool) return bindAndSignIn(currentSchool, phone);
    if (origin === 'unbind-phone') {
      if (!boundPhone || phone !== boundPhone) return '绑定信息已变化，请返回后重试。';
      saveSession({ ...session, bindings: session.bindings.filter(binding => binding.schoolId !== session.schoolId) });
      setSms(undefined);
      setSettingsOpen(false);
      setStep('signed-in');
      return;
    }

    const matches = session.bindings.filter(binding => binding.phone === phone);
    setSms(undefined);
    if (matches.length === 1 && phone !== onboardingPhone) {
      saveSession({ ...session, schoolId: matches[0].schoolId });
      setStep('signed-in');
      return;
    }
    setVerifiedPhone(phone);
    setStep(matches.length > 1 || phone === onboardingPhone ? 'select-school' : 'bind-account');
  }

  function accountVerified(school: DemoAccountSchool) {
    setSms(undefined);
    if (step === 'bind-account') return bindAndSignIn(school, verifiedPhone);
    saveSession({ ...session, schoolId: school.id });
    setStep(session.bindings.some(binding => binding.schoolId === school.id) ? 'signed-in' : 'bind-phone');
  }

  function enterSchool(schoolId: string) {
    const school = schoolChoices.find(item => item.id === schoolId && item.status !== 'inactive');
    if (!school) return '请选择可进入的学校。';
    return bindAndSignIn(school, verifiedPhone);
  }

  function changeStep(next: LoginStep) {
    if (next === 'signed-in') setSms(undefined);
    if (next === 'phone' && step === 'signed-in') {
      setAgreementChecked(false);
      saveSession({ ...session, schoolId: null });
    }
    if (next === 'phone' && !atLogin) restart();
    else setStep(next);
  }

  const background = params.get('appNav');
  const back = params.get('appBack');
  function showUnavailable() {
    toast.showToast({ message: '未接入' });
  }

  return <AppPage title="教师端-app" showNavTitle={!atLogin && step !== 'verify-phone' && step !== 'select-school' && !showMine} preview={params.get('chrome') === 'app'}
    previewStatus={step === 'phone' ? <TeacherLoginPreviewStatus /> : undefined}
    solidNavOnScroll={showWorkbench}
    navLeading={showWorkbench ? <button type="button" className="workbench-campus-switch" aria-label={`当前校区：${currentSchool?.name ?? '星禾艺术学校'}`} onClick={showUnavailable}><span>{currentSchool?.name ?? '星禾艺术学校'}</span><Icon name="school-chevron" size="md" /></button> : undefined}
    navTitle={signedIn ? <h1 className={showWorkbench ? 'sr-only' : 'app-page-title workbench-heading'} ref={headingRef} tabIndex={-1}>{showSettings ? '设置' : '工作台'}</h1> : undefined}
    background={background === 'brand' || background === 'transparent' ? background : 'surface'}
    backIcon={showSettings ? 'left' : step === 'account' ? 'left' : step === 'phone' || step === 'signed-in' || back === 'none' ? null : back === 'close' ? 'close' : 'left'}
    backLabel={showSettings ? '返回我的' : step === 'account' ? '返回手机号登录' : undefined}
    onBack={backToLogin}
    onRefresh={signedIn && !showSettings ? simulateRefresh : undefined}
    actions={showWorkbench ? <Button className="workbench-notification" variant="ghost" aria-label="通知" onClick={showUnavailable}><Icon name="home-notification" size="md" /></Button>
      : params.get('appAction') === 'more' ? <button type="button" className="app-page-icon-button" aria-label="App 更多" onClick={showUnavailable}><Icon name="more" /></button> : undefined}
    footer={signedIn && !showSettings ? <WorkbenchNavigation view={workbenchView} onChange={setWorkbenchView} onAira={() => setAiraOpen(true)} /> : undefined}>
    {step === 'signed-in' ? showWorkbench
      ? <TeacherWorkbench onOpenEntry={showUnavailable} showReport={params.get('workbenchReport') !== 'hidden'} />
      : showSettings ? <div className="teacher-app-settings">
        <section className="my-menu teacher-app-account" aria-label="账号管理">
          <h2>账号管理</h2>
          <dl>
            {currentSchool && <>
              <dt>当前学校</dt><dd><span>{currentSchool.name}</span><small>{currentSchool.campus} · {currentSchool.role}</small></dd>
              {'account' in currentSchool && <><dt>工作账号</dt><dd>{currentSchool.account}</dd></>}
            </>}
            <dt>手机号</dt><dd>{boundPhone ? `已绑定 ${maskPhone(boundPhone)}` : '尚未绑定'}</dd>
          </dl>
          <Button variant={boundPhone ? 'ghost' : 'soft'} block onClick={() => changeStep(boundPhone ? 'unbind-phone' : 'bind-phone')}>
            {boundPhone ? '解绑手机号' : '去绑定手机号'}
          </Button>
          <Button variant="text" block onClick={() => changeStep('phone')}>退出登录</Button>
        </section>
      </div> : <>
        <h1 className="sr-only" ref={headingRef} tabIndex={-1}>我的</h1>
        <MyPageContent iosDialogs onUnavailableEntry={showUnavailable} app={{ schoolName: currentSchool?.name ?? '', onSettings: () => setSettingsOpen(true), settingsRef }} />
      </>
      : <TeacherLogin key={screen} step={step} changeStep={changeStep} headingRef={headingRef} boundPhone={boundPhone} verifiedPhone={verifiedPhone}
      agreementChecked={agreementChecked} onAgreementChange={setAgreementChecked} onOpenAgreement={showUnavailable}
      sms={sms} onRequestCode={requestCode} onResendCode={resendCode}
      schoolChoices={schoolChoices} hasBoundChoices={hasBoundChoices}
      reservedPhone={demoAccountSchools.some(school => school.id === currentSchool?.id) ? onboardingPhone : ''}
      currentSchool={currentSchool} onPhoneVerified={phoneVerified} onAccountVerified={accountVerified} onEnterSchool={enterSchool} />}
    {signedIn && <AiraChat key={session.schoolId} open={airaOpen} onOpenChange={setAiraOpen} />}
  </AppPage>;
}
