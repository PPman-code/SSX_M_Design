import { Link } from 'react-router-dom';
import { semanticColorCatalog } from '../handoff/token-catalog.generated';
import { mobileRules, componentCatalog } from '../design-data';
import { Icon, iconNames } from '../components/ui/Icon';
import { IconGallery } from '../components/IconGallery';
import { businessPages } from '../page-registry';

const names = ['color.mobile.action.foreground', 'color.background.brand.bold', 'color.background.page', 'color.background.surface', 'color.text', 'color.text.subtle', 'color.border', 'color.text.success', 'color.text.warning', 'color.text.danger'];
export function Handoff({ mode }: { mode: 'light' | 'dark' }) {
  return <div className="handoff-page">
    <main className="handoff-content"><span className="eyebrow">SSX MOBILE / HANDOFF</span><h1>设计规范与交付</h1><p className="lead">继承智校 PC 基础，形成独立的移动端设计基线。</p><span className="status-badge">v0.1.0 · 初始基线</span>
      <section className="handoff-section"><h2>业务页面</h2>{businessPages.map((page) => <article className="spec-card" key={page.id}><h3>{page.name} · {page.version}</h3><p>{page.status} · {page.audience} · {page.description}</p><Link className="text-link" to={`/?page=${page.id}&theme=${mode}`}>打开页面工作区 <Icon name="right" /></Link><p>当前为正常状态视觉与入口反馈；下级页面、说明文案和真机验收待补充。</p></article>)}</section>
      <section className="handoff-section"><h2>移动端关键尺寸</h2><div className="handoff-metrics">{mobileRules.map((rule) => <article className="spec-card" key={rule.name}><span>{rule.name}</span><strong className="large-number">{rule.value}<small>{rule.unit}</small></strong><p>{rule.note}</p></article>)}</div></section>
      <section className="handoff-section"><h2>基础色彩</h2><p>以下色值由项目 token 自动生成，可在浏览器中追溯完整引用链。</p><div className="color-grid">{semanticColorCatalog.filter((token) => names.includes(token.name)).map((token) => <article className="color-card" key={token.name}><div className="color-swatch" style={{ background: `var(${token.cssVariable})` }} /><div><h3>{token.description}</h3><code>{token.cssVariable}</code><span>{mode === 'light' ? token.lightResolved : token.darkResolved}</span></div></article>)}</div></section>
      <section className="handoff-section"><h2>本地组件</h2><div className="component-list">{componentCatalog.map((component) => <article className="component-row" key={component.name}><div><h3>{component.label} <code>{component.name}</code></h3><p>{component.detail}</p></div><span className="status-badge">可复用</span></article>)}</div></section>
      <section className="handoff-section"><h2>图标库</h2><p>ssx-design · {iconNames.length} 个图标 · 项目 5242145</p><a className="text-link" href={`${import.meta.env.BASE_URL}downloads/ssx-design-5242145.zip`} download>下载原始图标包 <Icon name="download" /></a><details className="icon-library-details"><summary>查看全部 {iconNames.length} 个图标</summary><IconGallery /></details></section>
      <section className="handoff-section provenance"><h2>来源与验收边界</h2><p>基础色板、主题角色和系统字体来自智校 PC 设计项目的 2026-10-12 本地快照；图标使用本项目专属的 ssx-design 图标库。移动端尺寸与布局为初始化新增，继承规范不会自动跟随 PC 更新。</p><p>当前组件示例采用内存状态。手机键盘、安全区与微信内置浏览器的表现仍需真机验收。</p><Link to="/mobile" className="text-link">打开移动端组件预览 <Icon name="right" /></Link></section>
    </main>
  </div>;
}
