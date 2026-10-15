import { useRef, useState, type RefObject } from 'react';
import { InfoDialog } from '../../../components/ui/InfoDialog';
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

export function PaymentActivationDialog({ open, onOpenChange, finalFocus }: { open: boolean; onOpenChange: (open: boolean) => void; finalFocus: RefObject<HTMLElement | null> }) {
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLButtonElement>(null);
  return <InfoDialog open={open} onOpenChange={onOpenChange} title="当前机构未开通收费管家" className="payment-activation" finalFocus={finalFocus} footer={<div className="activation-footer">
    <Button className="activation-contact" onClick={(event) => { contactRef.current = event.currentTarget; setContactOpen(true); }}><Icon name="phone" size="md" />联系客服开通</Button>
    <p>{serviceHours}</p>
    <ActionSheet open={contactOpen} onOpenChange={setContactOpen} title="拨打客服热线" description={serviceHours} actions={hotlines} finalFocus={contactRef} />
  </div>}>
    <p className="activation-subtitle">立刻开通收费管家，开启以下功能</p>
    <div className="activation-features">{features.map((feature) => <div className="activation-feature" key={feature.title}><Icon name={feature.icon} size="lg" /><div><h3>{feature.title}</h3><p>{feature.description}</p></div></div>)}</div>
  </InfoDialog>;
}
