import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/useToast';
import { AppPage } from './AppPage';
import { BusinessDataAira } from './BusinessData';
import './charge-hub.css';

export function ChargeHubPage({ preview, onBack, onOpenQuickCharge, onOpenOrders, onOpenAira }: {
  preview?: boolean;
  onBack: () => void;
  onOpenQuickCharge: () => void;
  onOpenOrders: () => void;
  onOpenAira: () => void;
}) {
  const { showToast } = useToast();
  const [scanHelpOpen, setScanHelpOpen] = useState(false);
  const helpRef = useRef<HTMLButtonElement>(null);

  function showPending(label: string) {
    showToast({ message: `${label}功能请在现有业务系统中办理` });
  }

  return <AppPage title="报名收费" preview={preview} backIcon="left" backLabel="返回首页" onBack={onBack}
    scrollKey="charge-hub" footer={<BusinessDataAira onOpen={onOpenAira} />}>
    <div className="charge-hub">
      <p className="charge-hub-subtitle">办理报名、收取费用与查询记录</p>

      <section className="charge-hub-heroes" aria-label="主要收费方式">
        <button type="button" className="charge-hero-card charge-hero-card--student" onClick={() => showPending('学员收费')}>
          <div className="charge-hero-top">
            <span className="charge-hero-badge" aria-hidden="true"><Icon name="user-add" size="base" /></span>
            <span className="charge-hero-arrow" aria-hidden="true"><Icon name="right" size="sm" /></span>
          </div>
          <strong>学员收费</strong>
          <p>选择学员，添加购买项目，办理报名与收费</p>
        </button>

        <button type="button" className="charge-hero-card charge-hero-card--quick" onClick={onOpenQuickCharge}>
          <div className="charge-hero-top">
            <span className="charge-hero-badge" aria-hidden="true"><Icon name="qrcode-line" size="base" /></span>
            <span className="charge-hero-arrow" aria-hidden="true"><Icon name="right" size="sm" /></span>
          </div>
          <strong>快速收费</strong>
          <p>出示收款二维码，扫码交费，自动关联学员并生成收据</p>
        </button>
      </section>

      <section className="charge-hub-section" aria-labelledby="charge-scan-heading">
        <div className="charge-section-heading">
          <h2 id="charge-scan-heading">扫码收款</h2>
          <Button ref={helpRef} variant="text" className="charge-help-button" aria-label="扫码收款说明" onClick={() => setScanHelpOpen(true)}>
            <Icon name="question-circle" size="sm" />
          </Button>
        </div>
        <div className="charge-hub-card">
          <p className="charge-scan-note">不生成智校收据，不关联正式学员</p>
          <div className="charge-scan-actions">
            <button type="button" className="charge-scan-tile charge-scan-tile--code" onClick={() => showPending('收款码')}>
              <Icon name="qrcode-line" size="md" />
              <span>收款码</span>
            </button>
            <button type="button" className="charge-scan-tile charge-scan-tile--scan" onClick={() => showPending('扫码收款')}>
              <Icon name="qr-scan-2-line" size="md" />
              <span>扫码收款</span>
            </button>
          </div>
        </div>
      </section>

      <section className="charge-hub-section" aria-labelledby="charge-records-heading">
        <div className="charge-section-heading">
          <h2 id="charge-records-heading">记录查询</h2>
        </div>
        <div className="charge-hub-card charge-hub-card--list">
          <button type="button" className="charge-record-row" onClick={onOpenOrders}>
            <span className="charge-record-icon" aria-hidden="true"><Icon name="bill-line" size="md" /></span>
            <span className="charge-record-copy">
              <strong>订单管理</strong>
              <small>查看订单与付款情况</small>
            </span>
            <Icon name="right" size="sm" className="charge-record-arrow" />
          </button>
        </div>
      </section>
    </div>

    <Dialog open={scanHelpOpen} onOpenChange={setScanHelpOpen} finalFocus={helpRef} title="扫码收款说明"
      actions={[{ label: '知道了' }]}>
      <p>扫码收款仅用于现场快速收款，不生成智校收据，也不会自动关联正式学员档案；如需关联学员并生成收据，请使用上方的「学员收费」或「快速收费」。</p>
    </Dialog>
  </AppPage>;
}
