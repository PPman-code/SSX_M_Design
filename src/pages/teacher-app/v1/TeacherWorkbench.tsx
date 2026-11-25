import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Tag } from '../../../components/ui/Tag';
import '../../home/v1/home-page.css';
import './teacher-workbench.css';

const features = [
  ['收费', 'orange', 'home-enrollment'], ['课表', 'pink', 'home-timetable'],
  ['课程', 'violet', 'home-orders'], ['招生意向', 'yellow', 'home-prospective'],
] as const;
// Fixed Figma samples deliberately show several states at once, independent of device time.
const courses = [
  { time: '08:00–08:45', phase: 'finished', attendance: 'recorded', attendanceCount: 7 },
  { time: '09:00–09:45', phase: 'finished', attendance: 'overdue', attendanceCount: 10 },
  { time: '10:00–11:00', phase: 'ongoing', attendance: 'recorded', attendanceCount: 7 },
  { time: '14:00–14:45', phase: 'upcoming', attendance: 'pending', attendanceCount: 0 },
] as const;

const reportPreviews = ['运营日报', '校区报表', '招生转化', '课消收入'];
const workbenchDate = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
const courseStatuses = { finished: '已上课', ongoing: '上课中', upcoming: '待上课' };
const attendanceLabels = { recorded: '已点名', overdue: '超时未点名', pending: '未点名' };

function minutesOfDay(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function TeacherWorkbench({ onOpenEntry }: { onOpenEntry: () => void }) {
  const now = new Date();
  const needsAttendance = courses.filter(course => course.attendance === 'overdue');
  const tasks = [['待跟进', 4], ['待点名', needsAttendance.length], ['待点评', 3], ['待审批', 1]] as const;

  const assets = `${import.meta.env.BASE_URL}pages/teacher-app/v1/home/`;
  return <div className="home-page home-content teacher-workbench">
    <div className="workbench-intro">
      <header className="workbench-greeting">
        <div className="workbench-greeting-copy">
          <h2>Hi 上午好，李老师</h2>
          <p>{workbenchDate.format(now)}</p>
        </div>
      </header>
      <img className="workbench-portrait" src={`${assets}guanzai.png`} width="126" height="135" alt="" />
      <section className="workbench-report" aria-label="经营数据专区">
        <img className="workbench-report-background" src={`${assets}report-card.svg`} alt="" />
        <h2><img className="workbench-report-title" src={`${assets}report-title.png`} width="115" height="22" alt="经营数据专区" /></h2>
        <div className="workbench-report-row">
          <div className="workbench-report-options" aria-hidden="true">
            <div className="workbench-report-track">
              {[0, 1].map(copy => <div className="workbench-report-tags" key={copy}>
                {reportPreviews.map(label => <span key={label}>{label}</span>)}
              </div>)}
            </div>
          </div>
          <Button className="workbench-report-view touch-target" variant="secondary" onClick={onOpenEntry} aria-label="查看经营数据专区">查看</Button>
        </div>
      </section>
    </div>

    <section className="home-card" aria-labelledby="workbench-features">
      <div className="home-card-heading">
        <h2 id="workbench-features">常用功能</h2>
        <Button className="workbench-heading-action" variant="text" onClick={onOpenEntry}>编辑<Icon name="right" size="base" /></Button>
      </div>
      <div className="home-grid">
        {features.map(([label, tone, icon]) => <button key={label} type="button" className="home-entry" onClick={onOpenEntry}>
          <span className="workbench-feature-icon" data-tone={tone}><Icon name={icon} size="lg" /></span>
          <span>{label}</span>
        </button>)}
      </div>
    </section>

    <section className="home-card" aria-labelledby="workbench-tasks">
      <div className="home-card-heading home-todo-heading">
        <h2 id="workbench-tasks">我的待办</h2>
        <Button className="workbench-todo-help" variant="text" aria-label="待办说明" onClick={onOpenEntry}>
          <Icon name="question-circle" size="sm" />
        </Button>
      </div>
      <div className="home-todos">
        {tasks.map(([label, count]) => <button key={label} type="button" onClick={onOpenEntry}>
          <strong>{count}</strong><span>{label}</span>
        </button>)}
      </div>
    </section>

    <section className="home-card" aria-labelledby="workbench-courses">
      <div className="home-card-heading">
        <h2 id="workbench-courses">今日课程</h2>
        <Button className="workbench-heading-action workbench-course-count" variant="text" onClick={onOpenEntry}>共 {courses.length} 节课<Icon name="right" size="base" /></Button>
      </div>
      <ul className="home-lessons workbench-course-list">
        {courses.map(({ time, phase, attendance, attendanceCount }) => {
          const status = courseStatuses[phase];
          const label = attendanceLabels[attendance];
          const [start, end] = time.split('–').map(minutesOfDay);
          return <li className="workbench-course" data-phase={phase} data-attendance={attendance} key={time}>
            <div className="workbench-course-meta">
              <img className="workbench-course-dot" src={`${assets}course-${phase}.svg`} width="8" height="8" alt="" />
              <div className="workbench-course-time"><strong>{time}</strong><Tag size="sm" tone="neutral">{end - start}分钟</Tag><span className="sr-only">{status}</span></div>
              <p className="workbench-attendance">{label}：{attendanceCount}/10</p>
            </div>
            <div className="workbench-course-body">
              <span className="workbench-course-connector" aria-hidden="true" />
              <div className="workbench-course-detail">
                <div><p className="workbench-course-name">课程名称课程名称课程名称</p><p className="workbench-course-description">创意手工 · A 班 · 教室 03</p></div>
                <Button variant="soft" size="sm" className="workbench-course-action touch-target" onClick={onOpenEntry}>点名</Button>
              </div>
            </div>
          </li>;
        })}
      </ul>
    </section>
  </div>;
}
