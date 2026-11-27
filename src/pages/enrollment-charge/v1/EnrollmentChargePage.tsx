import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { SheetActions, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { MobilePage } from '../../../components/ui/MobilePage';
import { AppPage } from '../../teacher-app/v1/AppPage';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { Tag } from '../../../components/ui/Tag';
import { createPersonalChargePoster } from './personal-charge-poster';
import './enrollment-charge.css';

type ChargeTab = 'student' | 'quick';
const tabs: readonly TabItem<ChargeTab>[] = [
  { value: 'student', label: '学员收费', id: 'charge-student-tab', panelId: 'charge-student-panel' },
  { value: 'quick', label: '快速收费', id: 'charge-quick-tab', panelId: 'charge-quick-panel' },
];
const qrSource = `${import.meta.env.BASE_URL}pages/enrollment-charge/v1/demo-receipt-qr.svg`;
const campusOptions = ['星禾艺术城南校区', '滨江校区', '星禾艺术中心校区'].map(name => ({ value: name, label: name }));
const campusNameLimit = 6;

type ChargeAppShell = { title: string; backLabel: string; onBack: () => void; preview?: boolean };

export function EnrollmentChargePage({ appShell }: { appShell?: ChargeAppShell } = {}) {
  const [params, setParams] = useSearchParams();
  const tab: ChargeTab = !appShell && params.get('tab') === 'student' ? 'student' : 'quick';
  const [campus, setCampus] = useState(campusOptions[0].value);
  const [campusOpen, setCampusOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [amountOpen, setAmountOpen] = useState(false);
  const [discardAmount, setDiscardAmount] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterImage, setPosterImage] = useState('');
  const [posterError, setPosterError] = useState(false);
  const campusTrigger = useRef<HTMLButtonElement>(null);
  const amountTrigger = useRef<HTMLButtonElement>(null);
  const posterTrigger = useRef<HTMLButtonElement>(null);
  const valid = /^\d{1,6}(?:\.\d{0,2})?$/.test(draft) && Number(draft) >= 0.01 && Number(draft) <= 999999.99;
  const heading = amount === null ? '扫码交费' : `¥${amount.toFixed(2)}`;
  const paymentInstruction = amount === null ? '使用微信扫码，填写金额支付' : '使用微信扫码，确认金额后支付';
  const posterTitle = amount === null ? '个人收费海报-未设置金额' : '个人收费海报-含金额';
  const campusCharacters = Array.from(campus);
  const campusLabel = campusCharacters.length > campusNameLimit ? `${campusCharacters.slice(0, campusNameLimit).join('')}…` : campus;
  useEffect(() => {
    if (!posterOpen) return;
    let cancelled = false;
    createPersonalChargePoster(qrSource, campus, amount).then(image => {
      if (!cancelled) setPosterImage(image);
    }).catch(() => {
      if (!cancelled) setPosterError(true);
    });
    return () => { cancelled = true; };
  }, [posterOpen, campus, amount]);

  function changeTab(value: ChargeTab) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value === 'student') next.set('tab', 'student');
      else next.delete('tab');
      return next;
    }, { replace: true });
  }

  function requestAmountClose() {
    if (draft !== (amount?.toFixed(2) ?? '')) setDiscardAmount(true);
    else setAmountOpen(false);
  }

  function confirmAmount() {
    if (!valid) return;
    setAmount(Number(draft));
    setAmountOpen(false);
  }

  function openPoster() {
    setPosterImage('');
    setPosterError(false);
    setPosterOpen(true);
  }

  const quickChargeSection = <section id="charge-quick-panel" className="quick-charge-panel" role="tabpanel" aria-labelledby="charge-quick-tab" hidden={tab !== 'quick'}>
      <div className="quick-charge-card">
        <header className="quick-charge-header">
          <Button ref={campusTrigger} className="quick-charge-campus-trigger" variant="ghost"
            aria-label={`选择校区，当前：${campus}`} aria-haspopup="dialog" aria-expanded={campusOpen} onClick={() => setCampusOpen(true)}>
            <span>{campusLabel}</span><Icon name="down" size="sm" />
          </Button>
          <Tag size="sm" tone="success">长期有效</Tag>
        </header>
        <div className="quick-charge-body">
          <div className="quick-charge-intro">
            <h2 className={amount === null ? undefined : 'quick-charge-fixed-amount'}>{heading}</h2>
            <p>{paymentInstruction}</p>
          </div>
          <figure className="quick-charge-code">
            <img src={qrSource} alt="快速收费演示二维码" width="222" height="222" />
          </figure>
          <div className="quick-charge-amount-actions">
            <Button ref={amountTrigger} variant="text" onClick={() => { setDraft(amount === null ? '' : amount.toFixed(2)); setAmountOpen(true); }}>{amount === null ? '设置金额' : '修改金额'}</Button>
            {amount !== null && <Button variant="text" onClick={() => { setAmount(null); amountTrigger.current?.focus(); }}>清除金额</Button>}
          </div>
          <p>支付后自动关联交费学员</p>
        </div>
        <div className="quick-charge-footer">
          <Button ref={posterTrigger} block onClick={openPoster}>生成海报</Button>
        </div>
      </div>
    </section>;
  const chargeDialogs = <>
    <BottomSheet open={campusOpen} onOpenChange={setCampusOpen} title="选择校区" finalFocus={campusTrigger}>
      <SheetSelectionList label="校区选项" options={campusOptions} value={campus}
        onChange={value => { setCampus(value); setCampusOpen(false); }} onReselect={() => setCampusOpen(false)} />
    </BottomSheet>
    <BottomSheet mode="editor" open={amountOpen} onOpenChange={setAmountOpen} onCloseRequest={requestAmountClose} title="设置交费金额" finalFocus={amountTrigger}
      footer={<SheetActions secondary={{ label: '取消', onClick: requestAmountClose }} primary={{ label: '保存金额', disabled: !valid, onClick: confirmAmount }} />}>
      <form id="quick-charge-amount-form" onSubmit={event => { event.preventDefault(); confirmAmount(); }}>
        <Input className="quick-charge-amount-input" label="交费金额" hideLabel layout="external" inputMode="decimal" prefix="¥" placeholder="0.00" value={draft}
          onValueChange={value => { if (/^\d{0,6}(?:\.\d{0,2})?$/.test(value)) setDraft(value); }} />
      </form>
    </BottomSheet>
    <Dialog stacked open={discardAmount} onOpenChange={setDiscardAmount} title="放弃本次修改？" actions={[
      { label: '继续编辑' },
      { label: '放弃修改', danger: true, onSelect: () => setAmountOpen(false) },
    ]}><p>未保存的金额将被丢弃。</p></Dialog>
    <BottomSheet open={posterOpen} onOpenChange={setPosterOpen} title={posterTitle}
      description="正式收款后，经手人记录为当前老师。" descriptionPlacement="under-title"
      className="quick-charge-poster-sheet" finalFocus={posterTrigger}>
      {posterError ? <p className="quick-charge-poster-note" role="alert">图片生成失败，请重试。</p> : <>
        <div className="quick-charge-poster-preview" aria-busy={!posterImage}>
          {posterImage && <img src={posterImage} alt={`${campus}个人收费海报${amount === null ? '，未设置金额' : `，金额${heading}`}`} width="1080" height="1466" />}
        </div>
        {posterImage && <p className="quick-charge-poster-note">长按保存海报</p>}
      </>}
    </BottomSheet>
  </>;
  if (appShell) {
    return <AppPage title={appShell.title} className="enrollment-charge" preview={appShell.preview} backIcon="left" backLabel={appShell.backLabel} onBack={appShell.onBack} scrollKey="enrollment-charge-app">
      {quickChargeSection}
      {chargeDialogs}
    </AppPage>;
  }
  return <MobilePage title={tab === 'quick' ? '快速收费' : '学员收费'} previewChrome={params.get('chrome') === 'wechat'} className="enrollment-charge">
    <Tabs className="enrollment-charge-tabs" label="报名收费" size="primary" items={tabs} value={tab} onValueChange={changeTab} />
    <section id="charge-student-panel" className="charge-student-placeholder" role="tabpanel" aria-labelledby="charge-student-tab" hidden={tab !== 'student'}>
      <p>学员收费暂未开放</p>
      <Button variant="text" onClick={() => changeTab('quick')}>前往快速收费</Button>
    </section>
    {quickChargeSection}
    {chargeDialogs}
  </MobilePage>;
}
