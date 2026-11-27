import { useEffect, useId, useRef, useState } from 'react';
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
import { ApprovalPage } from './ApprovalPage';
import { BusinessData, BusinessDataAira, BusinessDataTabs, type BusinessTab } from './BusinessData';
import { ChargeHubPage } from './ChargeHubPage';
import { CustomerPage } from '../../prospective-students/v1/CustomerPage';
import { EnrollmentChargePage } from '../../enrollment-charge/v1/EnrollmentChargePage';
import { OrderManagementPage } from './OrderManagementPage';
import { RollCallPage } from './RollCallPage';
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
  const [businessDataOpen, setBusinessDataOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [quickChargeOpen, setQuickChargeOpen] = useState(false);
  const [rollCallOpen, setRollCallOpen] = useState(false);
  const [businessTab, setBusinessTab] = useState<BusinessTab>('board');
  const businessDataId = useId();
  const settingsRef = useRef<HTMLButtonElement>(null);
  const reportRef = useRef<HTMLButtonElement>(null);
  const restoreReportFocus = useRef(false);
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
  const showBusinessData = signedIn && businessDataOpen;
  const showFollowUp = signedIn && followUpOpen && !showBusinessData;
  const showApproval = signedIn && approvalOpen && !showBusinessData && !showFollowUp;
  const showWorkbench = signedIn && workbenchView === 'home' && !showBusinessData && !showFollowUp && !showApproval;
  const showMine = signedIn && workbenchView === 'mine' && !settingsOpen && !showBusinessData && !showFollowUp && !showApproval;
  const showSettings = signedIn && settingsOpen && !showBusinessData && !showFollowUp && !showApproval;
  const previousScreen = useRef({ step, workbenchView, settingsOpen, businessDataOpen, followUpOpen });

  useEffect(() => {
    const previous = previousScreen.current;
    if (previous.step !== step || previous.workbenchView !== workbenchView || previous.settingsOpen !== settingsOpen || previous.businessDataOpen !== businessDataOpen || previous.followUpOpen !== followUpOpen) {
      if (restoreSettingsFocus.current && showMine) {
        settingsRef.current?.focus();
        restoreSettingsFocus.current = false;
      } else if (restoreReportFocus.current && showWorkbench) {
        reportRef.current?.focus({ preventScroll: true });
        restoreReportFocus.current = false;
      } else headingRef.current?.focus();
    }
    previousScreen.current = { step, workbenchView, settingsOpen, businessDataOpen, followUpOpen };
  }, [step, workbenchView, settingsOpen, businessDataOpen, followUpOpen, showMine, showWorkbench]);

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
      setBusinessDataOpen(false);
      setFollowUpOpen(false);
      setApprovalOpen(false);
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
    setBusinessDataOpen(false);
    setFollowUpOpen(false);
    setApprovalOpen(false);
    setChargeOpen(false);
    setOrdersOpen(false);
    setQuickChargeOpen(false);
    setRollCallOpen(false);
    setAiraOpen(false);
    setWorkbenchView('home');
    setVerifiedPhone('');
    setSms(undefined);
    setStep('phone');
  }

  function backToLogin() {
    if (showBusinessData) {
      restoreReportFocus.current = true;
      setBusinessDataOpen(false);
      return;
    }
    if (showFollowUp) {
      setFollowUpOpen(false);
      return;
    }
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
  const preview = params.get('chrome') === 'app';
  function showUnavailable() {
    toast.showToast({ message: '未接入' });
  }

  if (showFollowUp) {
    return <CustomerPage appShell={{ title: '意向客户', backLabel: '返回首页', onBack: () => setFollowUpOpen(false), preview, defaultScope: 'self' }} />;
  }
  if (showApproval) {
    return <ApprovalPage preview={preview} onBack={() => setApprovalOpen(false)} onSearch={showUnavailable} />;
  }
  if (signedIn && rollCallOpen) {
    return <>
      <RollCallPage preview={preview} onBack={() => setRollCallOpen(false)} onOpenAira={() => setAiraOpen(true)} />
      <AiraChat key={session.schoolId} open={airaOpen} onOpenChange={setAiraOpen}
        onReturnHome={() => { setRollCallOpen(false); setWorkbenchView('home'); }} preview={preview} />
    </>;
  }
  if (signedIn && quickChargeOpen) {
    return <EnrollmentChargePage appShell={{ title: '快速收费', backLabel: '返回报名收费', onBack: () => setQuickChargeOpen(false), preview }} />;
  }
  if (signedIn && ordersOpen) {
    return <>
      <OrderManagementPage preview={preview} backLabel={chargeOpen ? '返回报名收费' : '返回首页'}
        onBack={() => setOrdersOpen(false)} onOpenAira={() => setAiraOpen(true)} />
      <AiraChat key={session.schoolId} open={airaOpen} onOpenChange={setAiraOpen}
        onReturnHome={() => { setOrdersOpen(false); setChargeOpen(false); setWorkbenchView('home'); }} preview={preview} />
    </>;
  }
  if (signedIn && chargeOpen) {
    return <>
      <ChargeHubPage preview={preview} onBack={() => setChargeOpen(false)} onOpenQuickCharge={() => setQuickChargeOpen(true)} onOpenOrders={() => setOrdersOpen(true)} onOpenAira={() => setAiraOpen(true)} />
      <AiraChat key={session.schoolId} open={airaOpen} onOpenChange={setAiraOpen}
        onReturnHome={() => { setChargeOpen(false); setQuickChargeOpen(false); setWorkbenchView('home'); }} preview={preview} />
    </>;
  }

  return <AppPage title="教师端-app" showNavTitle={!atLogin && step !== 'verify-phone' && step !== 'select-school' && !showMine} preview={preview}
    previewStatus={step === 'phone' ? <TeacherLoginPreviewStatus /> : undefined}
    solidNavOnScroll={showWorkbench || showBusinessData}
    navFadeDistance={showBusinessData ? 160 : undefined}
    navLeading={showWorkbench ? <button type="button" className="workbench-campus-switch" aria-label={`当前校区：${currentSchool?.name ?? '星禾艺术学校'}`} onClick={showUnavailable}><span>{currentSchool?.name ?? '星禾艺术学校'}</span><Icon name="school-chevron" size="md" /></button> : undefined}
    navTitle={signedIn ? <>
      <h1 className={showWorkbench || showBusinessData ? 'sr-only' : 'app-page-title workbench-heading'} ref={headingRef} tabIndex={-1}>{showBusinessData ? '经营数据专区' : showFollowUp ? '待跟进客户' : showSettings ? '设置' : '工作台'}</h1>
      {showBusinessData && <BusinessDataTabs id={businessDataId} tab={businessTab} onChange={setBusinessTab} />}
    </> : undefined}
    background={background === 'brand' || background === 'transparent' ? background : 'surface'}
    backIcon={showBusinessData || showFollowUp || showSettings || step === 'account' ? 'left' : step === 'phone' || step === 'signed-in' || back === 'none' ? null : back === 'close' ? 'close' : 'left'}
    backLabel={showBusinessData || showFollowUp ? '返回首页' : showSettings ? '返回我的' : step === 'account' ? '返回手机号登录' : undefined}
    onBack={backToLogin}
    onRefresh={signedIn && !showSettings && !showBusinessData && !showFollowUp ? simulateRefresh : undefined}
    scrollKey={showBusinessData ? 'business-data' : showFollowUp ? 'follow-up' : undefined}
    actions={showWorkbench ? <button type="button" className="app-page-icon-button" aria-label="通知" onClick={showUnavailable}><Icon name="home-notification" size="md" /></button>
      : params.get('appAction') === 'more' ? <button type="button" className="app-page-icon-button" aria-label="App 更多" onClick={showUnavailable}><Icon name="more" /></button> : undefined}
    footer={showBusinessData ? <BusinessDataAira onOpen={() => setAiraOpen(true)} />
      : signedIn && !showSettings && !showFollowUp ? <WorkbenchNavigation view={workbenchView} onChange={setWorkbenchView} onAira={() => setAiraOpen(true)} /> : undefined}>
    {step === 'signed-in' ? showBusinessData
      ? <BusinessData id={businessDataId} tab={businessTab} />
      : showWorkbench
      ? <TeacherWorkbench onOpenEntry={showUnavailable} onOpenCharge={() => setChargeOpen(true)} onOpenRollCall={() => setRollCallOpen(true)} onOpenOrders={() => setOrdersOpen(true)} onOpenFollowUp={() => setFollowUpOpen(true)} onOpenApproval={() => setApprovalOpen(true)} onOpenReport={() => { setBusinessTab('board'); setBusinessDataOpen(true); }} reportRef={reportRef} showReport={params.get('workbenchReport') !== 'hidden'} />
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
    {signedIn && <AiraChat key={session.schoolId} open={airaOpen} onOpenChange={setAiraOpen}
      onReturnHome={() => { setBusinessDataOpen(false); setWorkbenchView('home'); }} preview={preview} />}
  </AppPage>;
}
