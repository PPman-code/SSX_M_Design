import { useEffect, useRef, useState } from 'react';
import { Loading } from './ui/Loading';
import { PullToRefresh } from './ui/PullToRefresh';
import { Button } from './ui/Button';
import { Cell, CellGroup } from './ui/Cell';
import { simulateRefresh } from '../preview/simulateRefresh';
import './LoadingExamples.css';

export function LoadingExamples() {
  const [retryState, setRetryState] = useState<'error' | 'loading' | 'done'>('error');
  const [failRefresh, setFailRefresh] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (retryState !== 'loading') return;
    const timer = setTimeout(() => setRetryState('done'), 700);
    return () => clearTimeout(timer);
  }, [retryState]);
  return <section className="demo-section loading-demo" aria-labelledby="loading-title">
    <div className="section-heading"><h2 id="loading-title">加载 Loading</h2><span>24 / 28 / 32px</span></div>
    <h3>加载类型</h3>
    <div className="demo-card loading-demo-types">
      <div><span>环形</span><Loading label="环形加载" /></div>
      <div><span>三点</span><Loading variant="dots" label="三点加载" /></div>
      <div><span>横向图文</span><Loading text="加载中…" /></div>
      <div><span>纵向图文</span><Loading layout="vertical" text="加载中…" /></div>
      <div><span>纯文字</span><Loading variant="text" text="加载中…" /></div>
      <div><span>失败重试</span><Loading variant={retryState === 'loading' ? 'spinner' : 'text'} status={retryState === 'error' ? 'error' : 'loading'} text={retryState === 'loading' ? '正在重新加载…' : retryState === 'done' ? '演示重试完成' : '加载失败'} onRetry={() => setRetryState('loading')} /></div>
      <div><span>自定义图标</span><Loading icon="refresh" tone="subtle" text="加载中…" /></div>
      <div><span>继承颜色</span><Loading tone="inherit" text="加载中…" /></div>
    </div>
    <h3>下拉刷新演示</h3>
    <div className="loading-refresh-demo">
      <div className="loading-refresh-controls"><span>模拟完成 {refreshCount} 次</span><Button variant="text" aria-pressed={failRefresh} onClick={() => setFailRefresh(value => !value)}>{failRefresh ? '失败模式' : '成功模式'}</Button></div>
      <div ref={scrollRef} className="loading-refresh-scroll" aria-label="下拉刷新演示列表">
        <PullToRefresh scrollRef={scrollRef} successText="模拟刷新完成" onRefresh={async signal => { await simulateRefresh(signal); if (failRefresh) throw new Error('模拟刷新失败'); setRefreshCount(value => value + 1); }} />
        <CellGroup label="刷新演示记录">{[1, 2, 3, 4, 5].map(value => <Cell key={value} label={`示例记录 ${value}`} value="预览数据" />)}</CellGroup>
      </div>
    </div>
    <h3>尺寸对照</h3>
    <div className="demo-card loading-demo-sizes">
      {(['lg', 'md', 'sm'] as const).map((size, index) => <div key={size} data-size={size}><span>{[32, 28, 24][index]}px</span><Loading size={size} label={`${size}纯图标`} /><Loading size={size} text="加载中…" /><Loading size={size} layout="vertical" text="加载中…" /></div>)}
    </div>
    <p className="loading-demo-note">页面到达顶部后可下拉刷新；桌面手机预览也可向下拖动。当前仅演示刷新状态，不连接生产接口。</p>
  </section>;
}
