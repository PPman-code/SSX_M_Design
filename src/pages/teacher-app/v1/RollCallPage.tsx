import { useMemo, useRef, useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Calendar } from '../../../components/ui/Calendar';
import { Icon } from '../../../components/ui/Icon';
import { ListEnd } from '../../../components/ui/ListEnd';
import { SheetActions, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Tabs, type TabItem } from '../../../components/ui/Tabs';
import { Tag } from '../../../components/ui/Tag';
import { useToast } from '../../../components/ui/useToast';
import { AppPage } from './AppPage';
import { BusinessDataAira } from './BusinessData';
import './roll-call.css';

type CourseStatus = 'upcoming' | 'finished';
type StatusTab = 'all' | CourseStatus;

type RollCallCourse = {
  id: string;
  start: string;
  end: string;
  title: string;
  campus: string;
  room: string;
  teachers: string;
  attended: number;
  total: number;
  status: CourseStatus;
};

const defaultDate = '2026-11-25';
const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;

const sampleCourses: readonly RollCallCourse[] = [
  { id: 'c1', start: '08:30', end: '09:20', title: '少儿水彩 · A 班', campus: '城东校区', room: '教室 01', teachers: '李老师, 王老师', attended: 0, total: 6, status: 'upcoming' },
  { id: 'c2', start: '09:40', end: '10:30', title: '阅读写作 · B 班', campus: '城东校区', room: '教室 02', teachers: '李老师, 周老师', attended: 0, total: 7, status: 'upcoming' },
  { id: 'c3', start: '10:45', end: '11:40', title: '素描基础 · C 班', campus: '城东校区', room: '教室 03', teachers: '李老师, 王老师', attended: 0, total: 8, status: 'upcoming' },
  { id: 'c4', start: '13:00', end: '14:00', title: '创意手工 · A 班', campus: '城西校区', room: '教室 04', teachers: '李老师, 周老师', attended: 0, total: 9, status: 'upcoming' },
  { id: 'c5', start: '14:00', end: '15:30', title: '语文班', campus: '城东校区', room: '教室 02', teachers: '李老师, 王老师', attended: 0, total: 8, status: 'upcoming' },
];

const campusOptions = [
  { value: 'all', label: '全部校区' },
  { value: '城东校区', label: '城东校区' },
  { value: '城西校区', label: '城西校区' },
];

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftIsoDate(iso: string, delta: number) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + delta);
  return formatIsoDate(date);
}

function formatDateHeading(iso: string) {
  const date = parseDate(iso);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}/${d} ${weekdayNames[date.getDay()]}`;
}

export function RollCallPage({ preview, onBack, onOpenAira }: {
  preview?: boolean;
  onBack: () => void;
  onOpenAira: () => void;
}) {
  const { showToast } = useToast();
  const [date, setDate] = useState(defaultDate);
  const [draftDate, setDraftDate] = useState(defaultDate);
  const [tab, setTab] = useState<StatusTab>('all');
  const [campus, setCampus] = useState('all');
  const [draftCampus, setDraftCampus] = useState('all');
  const [dateOpen, setDateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const dayCourses = useMemo(() => {
    const base = date === defaultDate ? sampleCourses : sampleCourses.slice(0, 3).map((item, idx) => (
      idx === 0 ? { ...item, status: 'finished' as const, attended: item.total } : item
    ));
    return campus === 'all' ? base : base.filter(item => item.campus === campus);
  }, [date, campus]);

  const upcomingCount = dayCourses.filter(item => item.status === 'upcoming').length;
  const finishedCount = dayCourses.filter(item => item.status === 'finished').length;
  const visibleCourses = tab === 'all' ? dayCourses : dayCourses.filter(item => item.status === tab);

  const tabItems: readonly TabItem<StatusTab>[] = [
    { value: 'all', label: `全部 ${dayCourses.length}`, id: 'roll-call-tab-all', panelId: 'roll-call-panel' },
    { value: 'upcoming', label: `未上课 ${upcomingCount}`, id: 'roll-call-tab-upcoming', panelId: 'roll-call-panel' },
    { value: 'finished', label: `已上课 ${finishedCount}`, id: 'roll-call-tab-finished', panelId: 'roll-call-panel' },
  ];

  function openFilter() {
    setDraftCampus(campus);
    setFilterOpen(true);
  }

  return <AppPage title="上课点名" preview={preview} backIcon="left" backLabel="返回首页" onBack={onBack}
    scrollKey="roll-call"
    actions={<button type="button" className="app-page-icon-button" aria-label="快速排课"
      onClick={() => showToast({ message: '快速排课请在现有业务系统中办理' })}>
      <Icon name="plus-circle" />
    </button>}
    footer={<BusinessDataAira onOpen={onOpenAira} />}>
    <div className="roll-call-sticky">
      <div className="roll-call-date-bar">
        <div className="roll-call-date-nav">
          <button type="button" className="icon-button touch-target" aria-label="前一天" onClick={() => setDate(d => shiftIsoDate(d, -1))}>
            <Icon name="left" size="sm" />
          </button>
          <Button ref={dateButtonRef} variant="text" className="roll-call-date-trigger" aria-haspopup="dialog" aria-expanded={dateOpen} onClick={() => { setDraftDate(date); setDateOpen(true); }}>
            <span>{formatDateHeading(date)}</span>
            <Icon name="down" size="xs" />
          </Button>
          <button type="button" className="icon-button touch-target" aria-label="后一天" onClick={() => setDate(d => shiftIsoDate(d, 1))}>
            <Icon name="right" size="sm" />
          </button>
        </div>
        <div className="roll-call-tools">
          <Button variant="soft" size="sm" className="roll-call-today-btn" aria-label="回到今天" onClick={() => setDate(defaultDate)}>今</Button>
          <button ref={filterButtonRef} type="button" className="icon-button touch-target roll-call-filter-btn"
            data-active={campus !== 'all' || undefined} aria-label="筛选上课点名" aria-haspopup="dialog" onClick={openFilter}>
            <img src={`${import.meta.env.BASE_URL}pages/prospective-students/v1/filter.svg`} width="20" height="20" alt="" />
            {campus !== 'all' && <span className="roll-call-active-dot" />}
          </button>
        </div>
      </div>
      <Tabs className="roll-call-tabs" label="课程状态" size="secondary" items={tabItems} value={tab} onValueChange={setTab} />
    </div>

    <div id="roll-call-panel" role="tabpanel" className="roll-call-list-wrap">
      {visibleCourses.length === 0 ? <div className="roll-call-empty">
        <p>当前条件下暂无课程</p>
        {campus !== 'all' && <Button variant="soft" size="sm" onClick={() => setCampus('all')}>重置筛选</Button>}
      </div> : <>
        <ul className="roll-call-list" aria-label="上课点名课程列表">
          {visibleCourses.map(course => <li key={course.id} className="roll-call-card" data-status={course.status}>
            <div className="roll-call-time">
              <strong>{course.start}</strong>
              <span>{course.end}</span>
            </div>
            <span className="roll-call-divider" aria-hidden="true" />
            <div className="roll-call-main">
              <div className="roll-call-card-head">
                <h3>{course.title}</h3>
                <Tag size="sm" tone={course.status === 'finished' ? 'neutral' : 'brand'}>
                  {course.status === 'finished' ? '已上课' : '未上课'}
                </Tag>
              </div>
              <p className="roll-call-meta"><Icon name="location" size="xs" /><span>{course.campus} · {course.room}</span></p>
              <p className="roll-call-meta"><Icon name="user" size="xs" /><span>{course.teachers}</span></p>
              <div className="roll-call-card-foot">
                <span className="roll-call-attendance">出勤 {course.attended}/{course.total}</span>
                <div className="roll-call-card-actions">
                  <button type="button" className="icon-button touch-target roll-call-qr-btn" aria-label={`${course.title} 点名二维码`}
                    onClick={() => showToast({ message: `${course.title} 点名二维码暂未接入` })}>
                    <Icon name="qrcode-line" size="md" />
                  </button>
                  <Button variant="soft" size="sm" className="roll-call-action-btn"
                    onClick={() => showToast({ message: `${course.title} 点名流程暂未接入` })}>
                    {course.status === 'finished' ? '查看点名' : '去点名'}
                  </Button>
                </div>
              </div>
            </div>
          </li>)}
        </ul>
        <ListEnd />
      </>}
    </div>

    <Calendar open={dateOpen} onOpenChange={setDateOpen} title="选择上课日期" value={draftDate} onChange={setDraftDate}
      onConfirm={() => setDate(draftDate)} minDate="2026-01-01" maxDate="2026-12-31" today={defaultDate} />

    <BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title="筛选条件" finalFocus={filterButtonRef}
      footer={<SheetActions secondary={{ label: '重置', onClick: () => { setCampus('all'); setFilterOpen(false); } }}
        primary={{ label: '确定', onClick: () => { setCampus(draftCampus); setFilterOpen(false); } }} />}>
      <SheetSelectionList label="上课校区" options={campusOptions} value={draftCampus}
        onChange={setDraftCampus} onReselect={() => {}} />
    </BottomSheet>
  </AppPage>;
}
