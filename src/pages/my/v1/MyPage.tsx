import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MobilePage } from '../../../components/ui/MobilePage';
import { MenuCell } from '../../../components/ui/MenuCell';
import { ProductTabBar } from '../../../components/ProductTabBar';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { InfoDialog } from '../../../components/ui/InfoDialog';
import { Icon, type IconName } from '../../../components/ui/Icon';
import './my-page.css';
import { PaymentActivationDialog } from './PaymentActivationDialog';

const groups: readonly (readonly { label: string; icon: IconName }[])[] = [
  [{ label: '招生二维码', icon: 'qrcode-line' }, { label: '老师秀', icon: 'tongue-line' },
    { label: '我的考勤', icon: 'schedule-line' }, { label: '自定义报表', icon: 'chart-pie-2-line' }, { label: '我的工资条', icon: 'bill-line' }],
  [{ label: '表扬与投诉建议', icon: 'chat-1-line' }, { label: '帮助中心', icon: 'question-line' }],
];

export function MyPage() {
  const [params] = useSearchParams();
  const [entry, setEntry] = useState('');
  const [collectionHelpOpen, setCollectionHelpOpen] = useState(false);
  const collectionHelpRef = useRef<HTMLButtonElement>(null);
  const [activationOpen, setActivationOpen] = useState(false);
  const paymentTriggerRef = useRef<HTMLButtonElement>(null);
  const paymentEnabled = params.get('payment') === 'enabled';
  const previewChrome = params.get('chrome') === 'wechat';
  const assets = `${import.meta.env.BASE_URL}pages/my/v1/`;
  useEffect(() => { const previous = document.title; document.title = '我的 · 师生信'; return () => { document.title = previous; }; }, []);
  function payment(label: string, icon: IconName) {
    return <button type="button" className="payment-entry" aria-haspopup="dialog" onClick={(event) => { paymentTriggerRef.current = event.currentTarget; if (paymentEnabled) setEntry(label); else setActivationOpen(true); }}><span className="payment-icon"><Icon name={icon} size="lg" /></span><span>{label}</span></button>;
  }
  return <>
    <MobilePage onRefresh={simulateRefresh} refreshSuccessText="模拟刷新完成" title="我的" previewChrome={previewChrome} previewHistory={false} className="my-page" footer={<ProductTabBar active="my" />}>
      <div className="my-content">
        <img className="my-decoration my-decoration-left" src={`${assets}decoration-left.svg`} width="244" height="150" alt="" />
        <img className="my-decoration my-decoration-right" src={`${assets}decoration-right.svg`} width="160" height="109" alt="" />
        <button type="button" className="my-profile" onClick={() => setEntry('个人信息')} aria-label="查看个人信息">
          <img className="my-avatar" src={`${assets}avatar.png`} width="56" height="56" alt="用户头像" />
          <span className="my-identity"><span className="my-name">用户名称</span><span className="my-role">班主任</span></span>
          <Icon name="right" size="sm" />
        </button>
        <section className="payment-card" aria-label="报名与收款">
          <div className="payment-inner">
            <div className="registration-group"><h2>正式报名</h2>{payment('收费报名', 'money-collect-filled')}</div>
            <div className="payment-divider" aria-hidden="true" />
            <div className="collection-group"><div className="collection-heading"><h2>仅收款</h2><button ref={collectionHelpRef} type="button" className="collection-help touch-target" aria-label="仅收款说明" aria-haspopup="dialog" onClick={() => setCollectionHelpOpen(true)}><Icon name="question-circle" size="sm" /></button></div>
              <div className="collection-actions">{payment('收款码', 'qr-code-fill')}{payment('扫码收款', 'qr-scan-2-line')}</div>
            </div>
          </div>
        </section>
        {groups.map((group, index) => <section className="my-menu" aria-label={index === 0 ? '常用功能' : '服务与帮助'} key={index}>{group.map((item) => <MenuCell key={item.label} {...item} onClick={() => setEntry(item.label)} />)}</section>)}
      </div>
    </MobilePage>
    <BottomSheet open={Boolean(entry)} onOpenChange={(open) => { if (!open) setEntry(''); }} title={entry || '功能入口'} description="当前为页面设计预览">
      <p className="my-entry-note">{`“${entry}”的后续页面待提供。`}</p>
    </BottomSheet>
    <InfoDialog open={collectionHelpOpen} onOpenChange={setCollectionHelpOpen} title="使用说明" finalFocus={collectionHelpRef}>
      <section className="collection-instructions"><h3>1、什么是“仅收款”：</h3><p>“仅收款”是快速收款方式，并不是学员正式的报名收费。</p><p>“正式收费”请使用校管家系统内的【报名收费】或【新学员报名】功能。</p></section>
      <section className="collection-instructions"><h3>2、“仅收款”后：</h3><p>· 可以在【收费管家-订单中心】对账，但该笔收款信息不会同步至校管家系统。</p><p>· 需通过【报名收费】或【新学员报名】完成报名流程后，才能进行上课、点名等后续操作。</p></section>
    </InfoDialog>
    <PaymentActivationDialog open={activationOpen} onOpenChange={setActivationOpen} finalFocus={paymentTriggerRef} />
  </>;
}
