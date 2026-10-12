import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MobilePage } from '../../../components/ui/MobilePage';
import { MenuCell } from '../../../components/ui/MenuCell';
import { TabBar } from '../../../components/ui/TabBar';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Icon, type IconName } from '../../../components/ui/Icon';
import './my-page.css';

const groups: readonly (readonly { label: string; icon: IconName }[])[] = [
  [{ label: '招生二维码', icon: 'qrcode-line' }, { label: '老师秀', icon: 'tongue-line' },
    { label: '我的考勤', icon: 'schedule-line' }, { label: '自定义报表', icon: 'chart-pie-2-line' }, { label: '我的工资条', icon: 'bill-line' }],
  [{ label: '表扬与投诉建议', icon: 'chat-1-line' }, { label: '帮助中心', icon: 'question-line' }],
];
const tabs = [{ id: 'home', label: '首页', icon: 'home-1-fill' }, { id: 'my', label: '我的', icon: 'user-3-fill' }] as const;

export function MyPage() {
  const [params] = useSearchParams();
  const [entry, setEntry] = useState('');
  const previewChrome = params.get('chrome') === 'wechat';
  const assets = `${import.meta.env.BASE_URL}pages/my/v1/`;
  useEffect(() => { const previous = document.title; document.title = '我的 · 师生信'; return () => { document.title = previous; }; }, []);
  function payment(label: string, icon: IconName) {
    return <button type="button" className="payment-entry" onClick={() => setEntry(label)}><span className="payment-icon"><Icon name={icon} size="lg" /></span><span>{label}</span></button>;
  }
  return <>
    <MobilePage title="我的" previewChrome={previewChrome} className="my-page" footer={<TabBar items={tabs} active="my" onSelect={(id) => { if (id === 'home') setEntry('首页'); }} />}>
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
            <div className="collection-group"><div className="collection-heading"><h2>仅收款</h2><button type="button" className="collection-help" aria-label="仅收款说明" onClick={() => setEntry('仅收款说明')}><Icon name="question-line" size="sm" /></button></div>
              <div className="collection-actions">{payment('收款码', 'qr-code-fill')}{payment('扫码收款', 'qr-scan-2-line')}</div>
            </div>
          </div>
        </section>
        {groups.map((group, index) => <section className="my-menu" aria-label={index === 0 ? '常用功能' : '服务与帮助'} key={index}>{group.map((item) => <MenuCell key={item.label} {...item} onClick={() => setEntry(item.label)} />)}</section>)}
      </div>
    </MobilePage>
    <BottomSheet open={Boolean(entry)} onOpenChange={(open) => { if (!open) setEntry(''); }} title={entry || '功能入口'} description="当前为页面设计预览">
      <p className="my-entry-note">{entry === '仅收款说明' ? '此处说明文案待确认。' : `“${entry}”的后续页面待提供。`}</p>
    </BottomSheet>
  </>;
}
