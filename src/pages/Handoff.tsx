import { Link } from 'react-router-dom';
import { semanticColorCatalog } from '../handoff/token-catalog.generated';
import { mobileRules, componentCatalog } from '../design-data';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';

const names = ['color.mobile.action.background', 'color.mobile.action.foreground', 'color.background.brand.bold', 'color.background.page', 'color.background.surface', 'color.text', 'color.text.subtle', 'color.border', 'color.text.success', 'color.text.warning', 'color.text.danger'];
export function Handoff({ mode, onToggleTheme }: { mode: 'light' | 'dark'; onToggleTheme: () => void }) {
  return <div className="handoff-page">
    <header className="handoff-header"><Link className="text-link" to="/"><Icon name="a-arrow-left" />返回工作区</Link><Button variant="ghost" size="sm" onClick={onToggleTheme}>{mode === 'light' ? '深色预览' : '浅色预览'}</Button></header>
    <main className="handoff-content"><span className="eyebrow">SSX MOBILE / HANDOFF</span><h1>设计规范与交付</h1><p className="lead">继承智校 PC 基础，形成独立的移动端设计基线。</p><span className="status-badge">v0.1.0 · 初始基线</span>
      <section className="handoff-section"><h2>移动端关键尺寸</h2><div className="handoff-metrics">{mobileRules.map((rule) => <article className="spec-card" key={rule.name}><span>{rule.name}</span><strong className="large-number">{rule.value}<small>{rule.unit}</small></strong><p>{rule.note}</p></article>)}</div></section>
      <section className="handoff-section"><h2>基础色彩</h2><p>以下色值由项目 token 自动生成，可在浏览器中追溯完整引用链。</p><div className="color-grid">{semanticColorCatalog.filter((token) => names.includes(token.name)).map((token) => <article className="color-card" key={token.name}><div className="color-swatch" style={{ background: `var(${token.cssVariable})` }} /><div><h3>{token.description}</h3><code>{token.cssVariable}</code><span>{mode === 'light' ? token.lightResolved : token.darkResolved}</span></div></article>)}</div></section>
      <section className="handoff-section"><h2>本地组件</h2><div className="component-list">{componentCatalog.map((component) => <article className="component-row" key={component.name}><div><h3>{component.label} <code>{component.name}</code></h3><p>{component.detail}</p></div><span className="status-badge">可复用</span></article>)}</div></section>
      <section className="handoff-section provenance"><h2>来源与验收边界</h2><p>基础色板、主题角色、系统字体及图标来自智校 PC 设计项目的 2026-10-12 本地快照；移动端尺寸与布局为本次初始化新增。这里的继承不会自动跟随 PC 更新。</p><p>当前组件示例采用内存状态。手机键盘、安全区与微信内置浏览器的表现仍需真机验收。</p><Link to="/mobile" className="text-link">打开移动端组件预览 <Icon name="a-arrow-right" /></Link></section>
    </main>
  </div>;
}
