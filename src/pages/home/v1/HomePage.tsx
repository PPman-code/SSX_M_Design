import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProductTabBar } from '../../../components/ProductTabBar';
import { Icon } from '../../../components/ui/Icon';
import { MobilePage } from '../../../components/ui/MobilePage';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Radio, RadioGroup } from '../../../components/ui/Radio';
import { useToast } from '../../../components/ui/useToast';
import { roleLabels, type AttendanceRole } from '../../attendance/v2/attendance-data';
import './home-page.css';

type Tone = 'blue' | 'orange' | 'yellow' | 'green' | 'red';
const features: readonly [string, Tone][] = [
  ['报名收费', 'orange'], ['班级管理', 'orange'], ['课表', 'blue'], ['上课点名', 'green'],
  ['上课点评', 'yellow'], ['AI 上课点评', 'yellow'], ['学员动态', 'orange'], ['学员总结', 'yellow'],
  ['素材管理', 'green'], ['学员管理', 'blue'], ['通知', 'blue'], ['师生信', 'blue'],
  ['电子推荐卡', 'orange'], ['学校公告', 'orange'], ['意向学员', 'blue'], ['补课管理', 'yellow'],
  ['成绩录入', 'green'], ['我的审批', 'orange'], ['结转', 'green'], ['班级花名册', 'blue'],
  ['订单管理', 'orange'], ['网上商城', 'orange'], ['签单业绩排行', 'orange'], ['名师意向单', 'green'],
];
const reports: readonly [string, Tone][] = [
  ['销售业绩表', 'orange'], ['家长评价排行', 'yellow'], ['工作统计', 'blue'], ['底数报表', 'green'],
  ['课程营收报表', 'blue'], ['课消汇总表', 'green'], ['续报报表', 'orange'], ['课消业绩报表', 'blue'],
  ['续费率', 'yellow'], ['出勤率', 'blue'],
];
const tutoring: readonly [string, Tone][] = [['课后练习', 'blue'], ['打卡', 'yellow'], ['在线答疑', 'red'], ['错题本', 'red']];
function Placeholder({ tone }: { tone: Tone }) {
  return <span className={`home-placeholder home-placeholder--${tone}`} aria-hidden="true" />;
}
export function HomePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const previewChrome = params.get('chrome') === 'wechat';
  const candidate = params.get('role');
  const role: AttendanceRole = candidate && Object.hasOwn(roleLabels, candidate) ? candidate as AttendanceRole : 'teacher';
  const [roleOpen, setRoleOpen] = useState(false);
  useEffect(() => { const previous = document.title; document.title = '黄老师-校管家'; return () => { document.title = previous; }; }, []);
  const roleRef = useRef<HTMLButtonElement>(null);
  function open(label: string) {
    if (label === '学员管理') {
      const next = new URLSearchParams(params); next.set('from', 'home');
      navigate(`/pages/students/v1?${next}`);
    } else if (label === '意向学员') {
      const next = new URLSearchParams(params); next.set('from', 'home');
      navigate(`/pages/prospective-students/v1?${next}`);
    } else if (label === '出勤率') {
      const next = new URLSearchParams(params);
      next.set('role', role); next.set('from', 'home');
      navigate(`/pages/attendance/v2?${next}`);
    } else showToast({ message: `${label}页面待补充` });
  }
  function grid(title: string, items: readonly [string, Tone][], more = false) {
    return <section className="home-card" aria-label={title}>
      <div className="home-card-heading"><h2>{title}</h2>{more && <button className="home-more touch-target" aria-label={`更多${title}`} onClick={() => open(title)}><Icon name="right" size="sm" /></button>}</div>
      <div className="home-grid">{items.map(([label, tone]) => <button type="button" key={label} className="home-entry" onClick={() => open(label)}>{label === '出勤率' ? <img className="home-feature-icon" src={`${import.meta.env.BASE_URL}pages/home/v1/attendance.png`} width="32" height="32" alt="" /> : <Placeholder tone={tone} />}<span>{label}</span></button>)}</div>
    </section>;
  }
  return <MobilePage onRefresh={simulateRefresh} refreshSuccessText="模拟刷新完成" title="黄老师-校管家" previewChrome={previewChrome} previewHistory={false} className="home-page" footer={<ProductTabBar active="home" />}>
    <div className="home-role"><span>当前身份：</span><button ref={roleRef} type="button" onClick={() => setRoleOpen(true)}>{roleLabels[role]}<Icon name="caret-down" size="xs" /></button></div>
    <button type="button" className="home-announcement" onClick={() => showToast({ message: '2020年春节放假通知 · 示例公告' })}><Icon name="notification" size="sm" /><span>2020年春节放假通知</span><Icon name="right" size="sm" /></button>
    <div className="home-content">
      <section className="home-card" aria-label="待办事项"><div className="home-card-heading home-todo-heading"><h2>待办事项</h2><Icon name="question-circle" size="sm" /></div><div className="home-todos">{[['6', '待跟进'], ['2', '待点名'], ['99+', '待点评'], ['3', '待批阅']].map(([count, label]) => <button key={label} type="button" onClick={() => open(label)}><strong>{count}</strong><span>{label}</span></button>)}</div></section>
      {grid('常用功能', features, true)}
      {grid('报表中心', reports)}
      {grid('云学辅', tutoring)}
      <section className="home-card" aria-label="今日课表"><div className="home-card-heading"><h2>今日课表</h2><span>共 3 节课</span><Icon name="right" size="sm" /></div><div className="home-lessons">{['去点名', '1/40', '40/40'].map((status, index) => <div className="home-lesson" key={index}><div><strong>09:00–09:40</strong><p>班级：小周老师教语文2班</p><p>教室：206</p></div>{index === 0 ? <button type="button" className="home-rollcall" onClick={() => open('上课点名')}>{status}</button> : <span>{status}</span>}</div>)}</div></section>
    </div>
    <BottomSheet open={roleOpen} onOpenChange={setRoleOpen} title="切换身份" description="当前为设计模拟身份，不代表真实权限。" finalFocus={roleRef}><RadioGroup label="当前身份" value={role} onChange={(next) => { const search = new URLSearchParams(params); search.set('role', next); navigate(`/pages/home/v1?${search}`, { replace: true }); setRoleOpen(false); }}>{Object.entries(roleLabels).map(([value, label]) => <Radio key={value} value={value} label={label} variant="list" onSelect={value === role ? () => setRoleOpen(false) : undefined} />)}</RadioGroup></BottomSheet>
  </MobilePage>;
}
