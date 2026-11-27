import { useRef, useState, type CSSProperties } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon, type IconName } from '../../../components/ui/Icon';
import { SheetSelectionList } from '../../../components/ui/SheetContent';
import { Tabs } from '../../../components/ui/Tabs';
import './business-data.css';

const campuses = [
  { label: '全部授权校区', share: 1, classes: [3, 2, 4] },
  { label: '中心校区', share: .62, classes: [2, 1, 3] },
  { label: '东区校区', share: .38, classes: [1, 1, 1] },
] as const;
const days = ['07', '08', '09', '10', '11', '12', '13'];
const trends = {
  income: { label: '实收', values: [29680, 33020, 32040, 33240, 33520, 35575.30, 34520] },
  lessons: { label: '课消', values: [18200, 19370, 18550, 20200, 19960, 20610, 20350] },
} as const;
const teachers = [
  { name: '李老师', score: '4.70', amount: 5640, activity: '课消 9 小时 · 2 个班 · 12 人' },
  { name: '王老师', score: '4.80', amount: 4110, activity: '课消 4.5 小时 · 6 次 · 2 个班 · 12 人' },
  { name: '周老师', score: '4.50', amount: 3640, activity: '课消 34 次 · 2 个班 · 17 人' },
] as const;
const classBands = ['0% ≤ 满班率 < 50%', '50% ≤ 满班率 < 80%', '满班率 ≥ 80%'];
const reports = [
  { label: '收费汇总表', icon: 'money-collect-filled', metric: '实收金额', amount: trends.income.values[5] },
  { label: '退费汇总表', icon: 'reply', metric: '退费金额', amount: 1280 },
  { label: '课程收费汇总表', icon: 'bill-line', metric: '课程收费', amount: 32860 },
  { label: '净收汇总表', icon: 'dashboard', metric: '净收金额', amount: trends.income.values[5] - 1280 },
  { label: '校区业绩归属汇总表', icon: 'location', metric: '校区归属业绩', amount: trends.income.values[5] },
  { label: '目标排行', icon: 'trophy', metric: '今日示例目标', amount: 40000 },
] as const satisfies readonly { label: string; icon: IconName; metric: string; amount: number }[];
const currency = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });
const heroDonut = `${import.meta.env.BASE_URL}pages/teacher-app/v1/business-data/hero-donut-yellow.webp`;
const money = (amount: number) => currency.format(amount).replace('CN¥', '¥');
const formatAxis = (value: number) => (value === 0 ? '0' : value >= 10000 ? `${Number((value / 10000).toFixed(1))}万` : `${Math.round(value / 1000)}k`);
function MoneyText({ amount }: { amount: number }) {
  const text = money(amount);
  return <><span className="business-money-symbol">¥</span>{text.slice(1)}</>;
}
const medalPalettes = [
  { top: '#FFE58F', bottom: '#F59E0B', ribbon: '#D97706', text: '#78350F' },
  { top: '#F3F4F6', bottom: '#9CA3AF', ribbon: '#6B7280', text: '#374151' },
  { top: '#F7D0AE', bottom: '#C27438', ribbon: '#9A4E1A', text: '#5C2D0C' },
] as const;
function RankMedal({ rank, id }: { rank: number; id: string }) {
  const palette = medalPalettes[rank - 1];
  if (!palette) return <span className="business-rank-position" data-rank={rank}>{rank}</span>;
  const gradId = `${id}-medal-${rank}`;
  return <span className="business-rank-medal" data-rank={rank} aria-hidden="true">
    <svg viewBox="0 0 24 28" width="24" height="28">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={palette.top} />
          <stop offset="100%" stopColor={palette.bottom} />
        </linearGradient>
      </defs>
      <path d="M7 1H11.2L12 7.5H8.5L7 1Z" fill={palette.ribbon} opacity="0.88" />
      <path d="M17 1H12.8L12 7.5H15.5L17 1Z" fill={palette.ribbon} />
      <circle cx="12" cy="16.5" r="9.5" fill={`url(#${gradId})`} stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="12" cy="16.5" r="7.2" fill="none" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
      <text x="12" y="20.2" textAnchor="middle" fill={palette.text} fontSize="10.5" fontWeight="700">{rank}</text>
    </svg>
  </span>;
}
export type BusinessTab = 'board' | 'reports';
type TrendMetric = keyof typeof trends;
type Detail = { title: string; rows: readonly (readonly [string, string])[] };

export function BusinessDataAira({ onOpen }: { onOpen: () => void }) {
  return <Button variant="ghost" className="business-aira" onClick={onOpen}>
    <Icon name="app-tab-aira" size="lg" /><span>AIRA</span>
  </Button>;
}

function DetailLink({ children, onClick, label }: { children: string; onClick: () => void; label?: string }) {
  return <Button variant="text" size="sm" className="business-detail-link" aria-label={label} onClick={onClick}>
    {children}<Icon name="right" size="xs" />
  </Button>;
}

export function BusinessDataTabs({ id, tab, onChange }: { id: string; tab: BusinessTab; onChange: (tab: BusinessTab) => void }) {
  const items = [
    { value: 'board', label: '看板', id: `${id}-board-tab`, panelId: `${id}-board` },
    { value: 'reports', label: '报表', id: `${id}-reports-tab`, panelId: `${id}-reports` },
  ] as const;
  return <Tabs className="business-tabs" label="经营数据视图" indicator="label" items={items} value={tab} onValueChange={onChange} />;
}

export function BusinessData({ id, tab }: { id: string; tab: BusinessTab }) {
  const [campus, setCampus] = useState(0);
  const [campusOpen, setCampusOpen] = useState(false);
  const [metric, setMetric] = useState<TrendMetric>('income');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const campusButton = useRef<HTMLButtonElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);
  const { label: campusLabel, share, classes } = campuses[campus];
  const series = trends[metric].values.map(value => Math.round(value * share * 100) / 100);
  const totalAmount = series.reduce((sum, value) => sum + value, 0);
  const ceiling = Math.ceil(Math.max(...series) / 2000) * 2000;
  const points = series.map((value, index) => ({ x: index * 100 + 50, y: 114 - (value / ceiling) * 108 }));
  const dailyMetrics = [
    ['昨日实收', trends.income.values[5] * share],
    ['昨日课消金额', trends.lessons.values[5] * share],
  ] as const;
  const dailyRows = dailyMetrics.map(([label, amount]) => [label, money(amount)] as const);
  const teacherRows = teachers.map(teacher => [teacher.name, money(teacher.amount * share)] as const);
  const classRows = classBands.map((band, index) => [band, `${classes[index]} 个班`] as const);
  const areaPoints = `50,114 ${points.map(({ x, y }) => `${x},${y}`).join(' ')} 650,114`;
  const totalClasses = classes.reduce((sum, count) => sum + count, 0);
  const ringCircumference = 2 * Math.PI * 38;
  const ringSegments = classes.reduce<{ items: { band: number; dash: number; offset: number }[]; acc: number }>((state, count, index) => {
    const length = totalClasses > 0 ? (count / totalClasses) * ringCircumference : 0;
    const gap = Math.min(4, length * 0.2);
    state.items.push({ band: index, dash: Math.max(0, length - gap), offset: -state.acc });
    state.acc += length;
    return state;
  }, { items: [], acc: 0 }).items;
  const activePoint = selectedDay !== null ? points[selectedDay] : null;
  function pickDay(clientX: number) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    setSelectedDay(Math.max(0, Math.min(days.length - 1, Math.round(ratio * days.length - 0.5))));
  }

  return <div className="business-data">
    <section hidden={tab !== 'board'} className="business-panel business-panel--board"
      id={`${id}-board`} role="tabpanel" aria-labelledby={`${id}-board-tab`}>
      <div className="business-hero">
        <div className="business-campus">
          <strong>星星美术</strong>
          <Button ref={campusButton} variant="text" size="sm" className="business-campus-button"
            aria-haspopup="dialog" aria-expanded={campusOpen} onClick={() => setCampusOpen(true)}>
            {campusLabel}<Icon name="down" size="sm" />
          </Button>
        </div>
        <span className="business-hero-art" aria-hidden="true">
          <img className="business-hero-art-back" src={heroDonut} width="148" height="148" alt="" />
          <img className="business-hero-art-front" src={heroDonut} width="148" height="148" alt="" />
        </span>
      </div>

      <section className="business-card business-card--overview" aria-label="昨日经营概览">
        <svg className="business-overview-bg" viewBox="0 0 353 148" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}-overview-fill`} x1="0" y1="0.15" x2="0.95" y2="1">
              <stop offset="0%" stopColor="var(--color-background-surface)" stopOpacity="0.68" />
              <stop offset="100%" stopColor="var(--color-background-surface)" stopOpacity="0.96" />
            </linearGradient>
          </defs>
          <path d="M1 13C1 6.37258 6.37258 1 13 1H209.861C213.433 1 216.819 2.59152 219.099 5.34173L227.651 15.6583C229.931 18.4085 233.317 20 236.889 20H340C346.627 20 352 25.3726 352 32V135C352 141.627 346.627 147 340 147H13C6.37258 147 1 141.627 1 135V13Z"
            fill={`url(#${id}-overview-fill)`} stroke="var(--color-background-surface)" strokeWidth="1.5" />
        </svg>
        <div className="business-card-heading">
          <div><h2>昨日经营概览</h2><p>2026-11-12</p></div>
          <DetailLink onClick={() => setDetail({ title: '运营日报', rows: dailyRows })}>运营日报</DetailLink>
        </div>
        <dl className="business-overview-metrics">
          {dailyMetrics.map(([name, amount]) => <div key={name}><dt>{name}</dt><dd><MoneyText amount={amount} /></dd></div>)}
        </dl>
      </section>

      <section className="business-card" aria-label="经营趋势">
        <div className="business-card-heading">
          <h2>经营趋势</h2>
          <div className="business-trend-options" role="group" aria-label="趋势指标">
            {(['income', 'lessons'] as const).map(value => <Button type="button" key={value} size="sm"
              variant="ghost" aria-pressed={metric === value} onClick={() => setMetric(value)}>{trends[value].label}</Button>)}
          </div>
        </div>
        <p className="business-trend-period">近 7 天{trends[metric].label}（11-07 至 11-13）</p>
        <div className="business-trend-value" aria-live="polite">
          <strong><MoneyText amount={totalAmount} /></strong>
        </div>
        <div className="business-trend">
          <div className="business-trend-axis" aria-hidden="true">
            <span>{formatAxis(ceiling)}</span><span>{formatAxis(ceiling / 2)}</span><span>0</span>
          </div>
          <div className="business-trend-main">
            <div ref={plotRef} className="business-trend-plot"
              onPointerDown={event => { scrubbingRef.current = true; event.currentTarget.setPointerCapture?.(event.pointerId); pickDay(event.clientX); }}
              onPointerMove={event => { if (scrubbingRef.current) pickDay(event.clientX); }}
              onPointerUp={() => { scrubbingRef.current = false; }}
              onPointerCancel={() => { scrubbingRef.current = false; }}>
              <svg viewBox="0 0 700 120" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id={`${id}-trend-area`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-background-brand-bold)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--color-background-brand-bold)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="business-trend-grid" d="M50 6H650 M50 60H650 M50 114H650" vectorEffect="non-scaling-stroke" />
                {activePoint && <line className="business-trend-guide" x1={activePoint.x} y1={activePoint.y} x2={activePoint.x} y2="114" vectorEffect="non-scaling-stroke" />}
                <polygon points={areaPoints} fill={`url(#${id}-trend-area)`} />
                <polyline points={points.map(({x, y}) => `${x},${y}`).join(' ')} vectorEffect="non-scaling-stroke" />
              </svg>
              {activePoint && selectedDay !== null && <span className="business-trend-tooltip" aria-hidden="true" style={{
                left: `${activePoint.x / 7}%`, top: `${activePoint.y / 1.2}%`,
                '--tooltip-anchor': selectedDay === 0 ? '14%' : selectedDay === 1 ? '35%' : selectedDay === days.length - 1 ? '86%' : selectedDay === days.length - 2 ? '65%' : '50%',
              } as CSSProperties}>11-{days[selectedDay]} {trends[metric].label}：{money(series[selectedDay])}</span>}
              {points.map(({x, y}, index) => <Button key={days[index]} variant="ghost" shape="round"
                className="business-trend-point" aria-label={`11月${days[index]}日 ${trends[metric].label} ${money(series[index])}`}
                aria-pressed={selectedDay === index} onClick={() => setSelectedDay(index)}
                style={{ left: `${x / 7}%`, top: `${y / 1.2}%` }}><span aria-hidden="true" /></Button>)}
            </div>
            <div className="business-trend-days" aria-hidden="true">{days.map((day, index) => <span key={day} data-active={selectedDay === index}>{day}日</span>)}</div>
          </div>
        </div>
        <div className="business-card-footer">
          <DetailLink onClick={() => setDetail({ title: `${trends[metric].label}趋势明细`, rows: days.map((day, index) => [`11-${day}`, money(series[index])]) })}>查看明细</DetailLink>
        </div>
      </section>

      <section className="business-card" aria-label="教师课消业绩">
        <div className="business-card-heading">
          <h2>教师课消业绩</h2>
          <DetailLink label="查看全部教师课消业绩" onClick={() => setDetail({ title: '教师课消业绩', rows: teacherRows })}>查看全部</DetailLink>
        </div>
        <p className="business-card-caption">近 7 天 · 按课消金额排序 · TOP 3</p>
        <ol className="business-rank-list">
          {teachers.map((teacher, index) => <li key={teacher.name}>
            <button type="button" className="business-rank" onClick={() => setDetail({
              title: teacher.name, rows: [['课消金额', money(teacher.amount * share)], ['课消情况', teacher.activity], ['评分', teacher.score]],
            })}>
              <RankMedal rank={index + 1} id={id} />
              <span className="business-rank-body">
                <span className="business-rank-head">
                  <strong>{teacher.name}</strong>
                  <span className="business-rank-score"><Icon name="star-fill" size="xs" />{teacher.score}</span>
                </span>
                <small className="business-rank-activity">{teacher.activity}</small>
              </span>
              <span className="business-rank-end">
                <strong><MoneyText amount={teacher.amount * share} /></strong>
                <Icon name="right" size="xs" />
              </span>
            </button>
          </li>)}
        </ol>
      </section>

      <section className="business-card" aria-label="班级满班率">
        <div className="business-card-heading">
          <h2>班级满班率</h2>
          <DetailLink label="查看全部班级满班率" onClick={() => setDetail({ title: '班级满班率', rows: classRows })}>查看全部</DetailLink>
        </div>
        <p className="business-card-caption">开班日期 · 11-07 至 11-13</p>
        <div className="business-occupancy-layout">
          <div className="business-occupancy-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100">
              <circle className="business-occupancy-track" cx="50" cy="50" r="38" />
              {ringSegments.map(seg => <circle key={seg.band} className="business-occupancy-arc" data-band={seg.band}
                cx="50" cy="50" r="38" strokeDasharray={`${seg.dash} ${ringCircumference}`} strokeDashoffset={seg.offset} />)}
            </svg>
            <div className="business-occupancy-total"><strong>{totalClasses}</strong><span>个班</span></div>
          </div>
          <ul className="business-occupancy-list">
            {classRows.map(([name, count], index) => <li key={name}><Button variant="ghost" onClick={() => setDetail({ title: '班级满班率', rows: [[name, count]] })}>
              <span className="business-occupancy-dot" data-band={index} aria-hidden="true" /><span>{name}</span><strong>{count}</strong><Icon name="right" size="xs" />
            </Button></li>)}
          </ul>
        </div>
      </section>
    </section>

    <section hidden={tab !== 'reports'} className="business-panel" id={`${id}-reports`} role="tabpanel" aria-labelledby={`${id}-reports-tab`}>
      <section className="business-card" aria-label="报表入口">
        <h2>报表入口</h2>
        <div className="business-report-grid">
          {reports.map(report => <Button key={report.label} variant="ghost" className="business-report-tile"
            onClick={() => setDetail({ title: report.label, rows: [['统计日期', '2026-11-12'], [report.metric, money(report.amount * share)]] })}>
            <span className="business-report-icon"><Icon name={report.icon} size="md" /></span><span>{report.label}</span>
          </Button>)}
        </div>
      </section>
      <section className="business-card business-weekly" aria-label="系统使用周报">
        <span className="business-weekly-icon"><Icon name="dashboard" size="md" /></span>
        <div><h2>系统使用周报</h2><p>11-02 至 11-08</p></div>
        <DetailLink onClick={() => setDetail({ title: '系统使用周报', rows: [['统计周期', '11-02 至 11-08'], ['使用天数', '7 天'], ['教务操作', '98 次']] })}>查看周报</DetailLink>
      </section>
    </section>

    <BottomSheet open={campusOpen} onOpenChange={setCampusOpen} finalFocus={campusButton} title="选择校区">
      <SheetSelectionList label="选择校区"
        options={campuses.map(({ label }, index) => ({ value: String(index), label }))}
        value={String(campus)}
        onChange={value => { setCampus(Number(value)); setCampusOpen(false); }}
        onReselect={() => setCampusOpen(false)} />
    </BottomSheet>
    <BottomSheet open={detail !== null} onOpenChange={value => { if (!value) setDetail(null); }}
      title={detail?.title ?? '数据明细'} description={`${campusLabel} · 原型示例数据`}>
      {detail && <dl className="business-detail-data">{detail.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    </BottomSheet>
  </div>;
}
