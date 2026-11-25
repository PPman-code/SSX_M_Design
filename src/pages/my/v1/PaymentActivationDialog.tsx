import { useRef, useState, type RefObject } from 'react';
import { InfoDialog } from '../../../components/ui/InfoDialog';
import { Dialog } from '../../../components/ui/Dialog';
import { ActionSheet } from '../../../components/ui/ActionSheet';
import { Button } from '../../../components/ui/Button';
import { Icon, type IconName } from '../../../components/ui/Icon';

const features: readonly { title: string; description: string; icon: IconName }[] = [
  { title: '线上收款', description: '报名收费，线上收款', icon: 'money-collect-filled' },
  { title: '收款码收款', description: '出示收款码，用户扫码快速付款', icon: 'qr-code-fill' },
  { title: '扫码收款', description: '输入收款金额，扫付款码收款', icon: 'qr-scan-2-line' },
];
const serviceHours = '每日08:00-22:00全年无休';
const hotlines = ['400-800-5291', '400-800-5292'].map((phone) => ({ label: `拨打：${phone}`, href: `tel:${phone.replaceAll('-', '')}` }));

export function PaymentActivationDialog({ open, onOpenChange, finalFocus, iosDialog = false }: {
  open: boolean; onOpenChange: (open: boolean) => void; finalFocus: RefObject<HTMLElement | null>; iosDialog?: boolean;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLButtonElement>(null);
  const dialog = { open, onOpenChange, finalFocus, title: '当前机构未开通收费管家' };
  const content = <>
    <p className="activation-subtitle">立刻开通收费管家，开启以下功能</p>
    <div className="activation-features">{features.map((feature) => <div className="activation-feature" key={feature.title}><Icon name={feature.icon} size="lg" /><div><h3>{feature.title}</h3><p>{feature.description}</p></div></div>)}</div>
  </>;
  const contactSheet = <ActionSheet open={contactOpen} onOpenChange={setContactOpen} title="拨打客服热线" description={serviceHours}
    actions={hotlines} finalFocus={iosDialog ? undefined : contactRef} />;
  if (iosDialog) return <Dialog {...dialog} actions={[
    { label: '取消' },
    { label: '联系客服开通', closeOnSelect: false, onSelect: () => setContactOpen(true) },
  ]}>
    {content}
    <p className="activation-subtitle">{serviceHours}</p>
    {contactSheet}
  </Dialog>;
  return <InfoDialog {...dialog} className="payment-activation" footer={<div className="activation-footer">
    <Button className="activation-contact" onClick={(event) => { contactRef.current = event.currentTarget; setContactOpen(true); }}><Icon name="phone" size="md" />联系客服开通</Button>
    <p>{serviceHours}</p>
    {contactSheet}
  </div>}>
    {content}
  </InfoDialog>;
}
