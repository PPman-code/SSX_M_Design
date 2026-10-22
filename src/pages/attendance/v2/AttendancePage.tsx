import { DateRangeFields } from '../../../components/ui/DateRangeFields';
import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Collapse, CollapseItem } from '../../../components/ui/Collapse';
import { MobilePage } from '../../../components/ui/MobilePage';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { SheetActions, SheetChoiceGroup, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Popover } from '../../../components/ui/Popover';
import { Search } from '../../../components/ui/Search';
import {
  buildLessons, computeStats, defaultFilters, dimensionNames, dimensions, filterLabels, formatNumber,
  groupRecords, percent, periodLabel, rangeFor, roleLabels, scopeRecords, todayISO,
  type AttendanceFilters, type AttendanceGroup, type AttendanceRole, type Dimension, type Lesson, type Period, type Stats,
} from './attendance-data';
import './attendance-page.css';

const teacherName = '用户名称';
const groupPageSize = 4;
const detailPageSize = 6;
const searchableDimensions: Dimension[] = ['班级名称', '课程名称'];

const scopeCopy: Record<AttendanceRole, string> = {
  teacher: `统计筛选时间内，${teacherName}在排课中担任任课老师或助教的本班出勤数据。`,
  headmaster: `统计筛选时间内，${teacherName}作为班主任的班级出勤数据。`,
  manager: `统计筛选时间内，排课中由${teacherName}担任学管师的学员出勤数据。`,
  principal: '',
};

function trimPercent(value: string): string {
  return value.endsWith('%') ? value.slice(0, -1) : value;
}

function AttendanceDetailTable({ stats, lesson = false }: { stats: Stats; lesson?: boolean }) {
  return <div className="att-v2-detail-breakdown">
    <table className="att-v2-detail-table" aria-label="计费及未计费出勤人次">
      <thead><tr><th scope="col">{lesson ? '统计项' : '单位：人次'}</th><th scope="col">计费</th><th scope="col">未计费</th>{lesson && <th scope="col">比率</th>}</tr></thead>
      <tbody>
        <tr><th scope="row">出勤</th><td>{formatNumber(stats.att)}</td><td>{formatNumber(stats.attFree)}</td>{lesson && <td className="att-v2-table-rate">{percent(stats.att + stats.attFree, stats.people)}</td>}</tr>
        <tr><th scope="row">缺勤</th><td>{formatNumber(stats.abs)}</td><td>{formatNumber(stats.absFree)}</td>{lesson && <td>{percent(stats.abs + stats.absFree, stats.people)}</td>}</tr>
        <tr><th scope="row">缺勤已补</th><td>{formatNumber(stats.make)}</td><td>{formatNumber(stats.makeFree)}</td>{lesson && <td>—</td>}</tr>
      </tbody>
    </table>
    <div className="att-v2-detail-rate">{!lesson && <span className="att-v2-report-trial">试听 {formatNumber(stats.trial)}</span>}<span className="att-v2-rate-label">{lesson ? '补课后出勤率' : `缺勤率 ${percent(stats.abs + stats.absFree, stats.people)}`}{lesson && <Popover appearance="dark" placement="top-start"
      trigger={<Button variant="text" icon="question-circle" iconOnly className="att-v2-rate-info touch-target" aria-label="查看补课后出勤率规则" />}
      content={<div className="att-v2-rate-explanation"><p>补课后出勤率：将符合统计规则的“缺勤已补”计入后的出勤率。</p><p>“缺勤已补”指原记录缺勤、后续补课已出勤的人次，属于缺勤中的一部分，不能与缺勤相加作为总人次。</p><p>计费／未计费是否参与计算、试听等学员是否纳入，以及补课计入原缺勤课程还是补课课程，均以当前生效的统计规则为准。</p></div>} />}</span>{lesson && <span>{percent(stats.att + stats.attFree + stats.make + stats.makeFree, stats.people)}</span>}</div>
  </div>;
}

export function AttendancePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const previewChrome = params.get('chrome') === 'wechat';
  const roleParam = params.get('role');
  const role: AttendanceRole = roleParam && Object.hasOwn(roleLabels, roleParam) ? roleParam as AttendanceRole : 'headmaster';

  const today = useState(todayISO)[0];
  const [period, setPeriod] = useState<Period>('本月');
  const [[start, end], setSpan] = useState<[string, string]>(() => rangeFor('本月', today));
  const [dimension, setDimension] = useState<Dimension>('班级名称');
  const [values, setValues] = useState<string[] | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>(defaultFilters);
  const view = params.get('view') === 'detail' ? 'detail' : 'report';
  const [expanded, setExpanded] = useState<string | null>(null);
  const [groupLimit, setGroupLimit] = useState(groupPageSize);
  const [detailLimit, setDetailLimit] = useState(detailPageSize);


  const [dateOpen, setDateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [valueOpen, setValueOpen] = useState(false);
  const [dimensionOpen, setDimensionOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState<[string, string]>([start, end]);
  const [periodDraft, setPeriodDraft] = useState<Period>(period);
  const [dateError, setDateError] = useState(false);
  const [dateResetKey, setDateResetKey] = useState(0);
  const [filterDraft, setFilterDraft] = useState<AttendanceFilters>(defaultFilters);
  const [roleError, setRoleError] = useState(false);
  const [valueDraft, setValueDraft] = useState<string[] | null>(null);
  const [valueKeyword, setValueKeyword] = useState('');
  const [valueError, setValueError] = useState(false);

  const dateRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<HTMLButtonElement>(null);
  const dimensionRef = useRef<HTMLButtonElement>(null);
  const groupLoadRef = useRef<HTMLDivElement>(null);
  const detailLoadRef = useRef<HTMLDivElement>(null);

  const lessons = useMemo(() => buildLessons(today), [today]);
  const records = useMemo(() => scopeRecords(role, lessons, start, end, filters), [role, lessons, start, end, filters]);
  const groups = useMemo(() => groupRecords(records, dimension), [records, dimension]);
  const visibleGroups = useMemo(() => values ? groups.filter((group) => values.includes(group.name)) : groups, [groups, values]);
  const scoped = useMemo(() => values
    ? records.filter((lesson) => dimensionNames(lesson, dimension).some((name) => values.includes(name)))
    : records, [records, values, dimension]);
  const overview = useMemo(() => computeStats(scoped, filters), [scoped, filters]);
  const selected = groups.find((group) => group.name === params.get('group')) ?? null;
  const detailRecords = useMemo(() => selected
    ? [...selected.lessons].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    : [], [selected]);

  useEffect(() => {
    const target = view === 'report' ? groupLoadRef.current : detailLoadRef.current;
    if (!target) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      if (view === 'report') setGroupLimit((current) => current < visibleGroups.length ? current + groupPageSize : current);
      else setDetailLimit((current) => current < detailRecords.length ? current + detailPageSize : current);
    }, { rootMargin: '0px 0px 50px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [view, visibleGroups.length, detailRecords.length, groupLimit, detailLimit]);


  function toggleDraft(key: keyof AttendanceFilters) {
    setFilterDraft((current) => {
      const next = { ...current, [key]: !current[key] };
      if (role === 'teacher' && (key === 'main' || key === 'assistant') && !next.main && !next.assistant) {
        setRoleError(true);
        return current;
      }
      setRoleError(false);
      return next;
    });
  }

  function resetDate() {
    setPeriodDraft('本月');
    setDateDraft(rangeFor('本月', today));
    setDateError(false);
    setDateResetKey(key => key + 1);
  }

  function applyDate() {
    if (!dateDraft[0] || !dateDraft[1] || dateDraft[0] > dateDraft[1]) { setDateError(true); return; }
    setDateError(false);
    setSpan(dateDraft);
    setPeriod(periodDraft);
    setDateOpen(false);
    setGroupLimit(groupPageSize);
    setExpanded(null);
  }

  function applyFilters() {
    setFilters(filterDraft);
    setFilterOpen(false);
    setGroupLimit(groupPageSize);
    setExpanded(null);
  }

  function applyValues() {
    if (valueDraft !== null && !valueDraft.length) { setValueError(true); return; }
    setValueError(false);
    setValues(valueDraft);
    setValueOpen(false);
    setGroupLimit(groupPageSize);
    setExpanded(null);
  }

  function changeDimension(next: Dimension) {
    setDimension(next);
    setValues(null);
    setExpanded(null);
    setGroupLimit(groupPageSize);
  }

  function openDetail(group: AttendanceGroup) {
    setDetailLimit(detailPageSize);
    const next = new URLSearchParams(params); next.set('view', 'detail'); next.set('group', group.name);
    navigate(`/pages/attendance/v2?${next}`);
  }

  const filteredChanges = (Object.keys(defaultFilters) as (keyof AttendanceFilters)[])
    .some((key) => (role === 'teacher' || !['main', 'assistant'].includes(key)) && defaultFilters[key] !== filters[key]);
  const valueLabel = values === null ? '全部' : values.length === 1 ? values[0] : `已选${values.length}项`;
  const spanLabel = period === '自定义' ? periodLabel(start, end) : period;
  const noAccess = role === 'principal';

  const title = view === 'detail' ? '上课明细' : '出勤率报表';
  return <MobilePage onRefresh={simulateRefresh} refreshSuccessText="模拟刷新完成" title={title} previewChrome={previewChrome} className="attendance-page-v2">
    {view === 'report' ? <div className="att-v2-body att-v2-body--report" aria-label="出勤统计">
      <img className="att-v2-report-decoration" src={`${import.meta.env.BASE_URL}pages/attendance/v2/report-decoration.svg`} width="247.776" height="247.776" alt="" />

      <div className="att-v2-toolbar">
        <Button ref={dateRef} variant="soft" className="att-v2-date" onClick={() => { setDateDraft([start, end]); setPeriodDraft(period); setDateError(false); setDateOpen(true); }}>
          <span className="att-v2-date-label">{spanLabel}</span><Icon name="down" size="sm" />
        </Button>
        <span className="att-v2-filter-wrap">
          <Button ref={filterRef} variant="soft" icon="settings" iconOnly aria-label="筛选条件" onClick={() => { setFilterDraft(filters); setRoleError(false); setFilterOpen(true); }} />
          {filteredChanges && <span className="att-v2-filter-mark" aria-hidden="true" />}
        </span>
      </div>

      {noAccess ? <div className="att-v2-empty">校长身份暂无出勤率报表数据</div> : <>
        <section className="att-v2-overview" aria-label="整体概览">
          <div className="att-v2-overview-heading"><strong>整体概览</strong>
            <Popover appearance="dark" placement="bottom-end" trigger={<Button variant="text" icon="question-circle" iconOnly className="att-v2-scope-trigger touch-target" aria-label="查看统计范围说明" />} content={<div className="att-v2-scope"><p>{scopeCopy[role]}</p></div>} />
          </div>
          <div className="att-v2-rates">
            <div><span>出勤率</span><b>{trimPercent(percent(overview.att + overview.attFree, overview.people))}{overview.people ? <em>%</em> : null}</b></div>
            <div><span>补课后出勤率</span><b>{trimPercent(percent(overview.att + overview.attFree + overview.make + overview.makeFree, overview.people))}{overview.people ? <em>%</em> : null}</b></div>
          </div>
          <div className="att-v2-counts">
            <span>上课次数<strong>{formatNumber(overview.classes)}</strong></span>
            <span>人次数<strong>{formatNumber(overview.people)}</strong></span>
            <span>试听<strong>{formatNumber(overview.trial)}</strong></span>
          </div>
        </section>

        <div className="att-v2-group-heading"><strong>分组统计</strong><span className="att-v2-row-count">{visibleGroups.length}条数据</span></div>
        <div className="att-v2-group-toolbar">
          <button type="button" ref={dimensionRef} className="att-v2-dimension" aria-label="汇总维度" onClick={() => { setDimensionOpen(true); }}>
            <span className="att-v2-dimension-label">按照{dimension}汇总</span><Icon name="down" size="sm" />
          </button>
          <button type="button" ref={valueRef} className="att-v2-value" onClick={() => { setValueDraft(values); setValueKeyword(''); setValueError(false); setValueOpen(true); }} aria-label={`选择${dimension}`}>
            <span className="att-v2-value-label">{valueLabel}</span><Icon name="down" size="sm" />
          </button>
        </div>

        {visibleGroups.length ? <Collapse variant="card" className="att-v2-group-cards" label={`${dimension}汇总列表`} value={expanded ? [expanded] : []} onChange={(values) => setExpanded(values[0] ?? null)}>
          {visibleGroups.slice(0, groupLimit).map((group) => {
            const stats = computeStats(group.lessons, filters);
            const open = expanded === group.name;
            const campuses = [...new Set(group.lessons.map((lesson) => lesson.meta['上课校区']).filter((name): name is string => typeof name === 'string'))];
            return <CollapseItem key={group.name} value={group.name} className="att-v2-summary" triggerClassName="att-v2-summary-name"
              triggerLabel={`${open ? '收起' : '展开'}${group.name}统计详情`}
              title={<span className="att-v2-group-title"><span className="att-v2-group-name">{group.name}</span>{dimension !== '上课校区' && <span className="att-v2-group-campus">{campuses.join(' / ')}</span>}</span>}
              leading={(dimension === '班级名称' || dimension === '课程名称') ? <Icon name={dimension === '班级名称' ? 'xuanban1' : 'xuanke1'} size="base" /> : undefined}
              summary={
              <div className="att-v2-group-metrics">
                <div><strong>{formatNumber(stats.classes)}</strong><span>上课次数</span></div>
                <div><strong>{formatNumber(stats.people)}</strong><span>人次数</span></div>
                <div><strong className="att-v2-value-cell">{percent(stats.att + stats.attFree, stats.people)}</strong><span>出勤率</span></div>
                <div><strong className="att-v2-value-cell">{percent(stats.att + stats.attFree + stats.make + stats.makeFree, stats.people)}</strong><span>补课后出勤率</span></div>
              </div>}>
              <div className="att-v2-inline">
                <AttendanceDetailTable stats={stats} />
                <button type="button" className="att-v2-lesson-link" onClick={() => openDetail(group)}>查看课次明细<Icon name="right" size="sm" /></button>
              </div>
            </CollapseItem>;
          })}
        </Collapse> : <div className="att-v2-empty">暂无出勤数据</div>}

        <div className="att-v2-load" role="status" ref={groupLoadRef}>
          {groupLimit < visibleGroups.length ? <Button variant="text" onClick={() => setGroupLimit((current) => current + groupPageSize)}>加载更多分组</Button> : visibleGroups.length ? '已显示全部数据' : ''}
        </div>
      </>}
    </div> : <div className="att-v2-body" aria-label="课次明细">
      <div className="att-v2-detail-summary"><span>课次明细</span><span>共{detailRecords.length}条数据</span></div>
      {detailRecords.slice(0, detailLimit).map((lesson: Lesson) => {
        const stats = computeStats([lesson], filters);
        const teachers = [lesson.mainOwner ? teacherName : '陈老师', lesson.assistantOwner === true ? teacherName : lesson.assistantOwner === false ? '王老师' : null].filter(Boolean).join('，');
        return <section className="att-v2-lesson" key={lesson.id}>
          <div className="att-v2-lesson-head">
            <div className="att-v2-lesson-time"><span>{lesson.date}</span><span className="att-v2-lesson-time-divider" aria-hidden="true">·</span><span>{lesson.time}</span></div>
            <h3 className="att-v2-lesson-class">{lesson.meta['班级名称']}</h3>
            <p className="att-v2-lesson-teacher">任课老师：{teachers}</p>

          </div>
          <div className="att-v2-inline att-v2-lesson-body">
            <div className="att-v2-lesson-counts">
              <h4>出勤明细</h4>
              <div className="att-v2-lesson-count-values"><span>实到/应到 <b>{formatNumber(stats.att + stats.attFree)}/{formatNumber(stats.people)}</b></span><span>试听 <b>{formatNumber(stats.trial)}</b></span></div>
            </div>
            <AttendanceDetailTable stats={stats} lesson />
          </div>
        </section>;
      })}
      <div className="att-v2-load" role="status" ref={detailLoadRef}>
        {detailLimit < detailRecords.length ? <Button variant="text" onClick={() => setDetailLimit((current) => current + detailPageSize)}>加载更多课次</Button> : '已显示全部课次'}
      </div>
    </div>}

    <BottomSheet open={dimensionOpen} onOpenChange={setDimensionOpen} title="汇总维度" finalFocus={dimensionRef}>
      <SheetSelectionList label="汇总方式" options={dimensions.map(value => ({ value, label: value }))} value={dimension}
        onChange={value => { changeDimension(value as Dimension); setDimensionOpen(false); }} onReselect={() => setDimensionOpen(false)} />
    </BottomSheet>

    <BottomSheet open={dateOpen} onOpenChange={setDateOpen} title="统计时段" finalFocus={dateRef} footer={<SheetActions secondary={{ label: '重置', onClick: resetDate }} primary={{ label: '确认', onClick: applyDate }} />}>
      <DateRangeFields key={dateResetKey} today={today} period={periodDraft} value={dateDraft}
        onChange={(nextPeriod, nextRange) => { setPeriodDraft(nextPeriod ?? '自定义'); setDateDraft(nextRange); setDateError(false); }} />
      {dateError && <p className="att-v2-error" role="alert">请选择有效的起止日期</p>}
    </BottomSheet>

    <BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title="筛选条件" finalFocus={filterRef} footer={<SheetActions secondary={{ label: '重置', onClick: () => { setFilterDraft(defaultFilters); setRoleError(false); } }} primary={{ label: '确认', onClick: applyFilters }} />}>
      <SheetChoiceGroup label="学员范围" options={(['trial', 'temporary', 'transfer', 'makeup'] as const).map(value => ({ value, label: filterLabels[value] }))}
        value={Object.keys(filterDraft).filter(key => filterDraft[key as keyof AttendanceFilters])} onToggle={key => toggleDraft(key as keyof AttendanceFilters)} hint="选中表示包含，常规学员始终计入" />
      {role === 'teacher' && <SheetChoiceGroup label="授课身份" options={(['main', 'assistant'] as const).map(value => ({ value, label: filterLabels[value] }))}
        value={Object.keys(filterDraft).filter(key => filterDraft[key as keyof AttendanceFilters])} onToggle={key => toggleDraft(key as keyof AttendanceFilters)} hint="主教、助教至少选择一项" error={roleError ? '请至少保留一个授课身份' : undefined} />}
    </BottomSheet>

    <BottomSheet open={valueOpen} onOpenChange={setValueOpen} title={`选择${dimension}（可多选）`} finalFocus={valueRef} footer={<SheetActions secondary={{ label: '取消', onClick: () => setValueOpen(false) }} primary={{ label: '确认', onClick: applyValues }} />}>
      {searchableDimensions.includes(dimension) && <Search label={`搜索${dimension}`} placeholder={`搜索${dimension}`} clearLabel={`清除${dimension}搜索`} value={valueKeyword} onValueChange={setValueKeyword} />}
      <SheetSelectionList multiple label={`选择${dimension}`} value={valueDraft ?? ['__all__']}
        options={[{ value: '__all__', label: '全部' }, ...groups.filter(group => group.name.toLowerCase().includes(valueKeyword.trim().toLowerCase())).map(group => ({ value: group.name, label: group.name }))]}
        onToggle={value => {
          if (value === '__all__') { setValueDraft(null); return; }
          setValueDraft(current => current === null ? [value] : current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
        }} />
      {valueKeyword.trim() && !groups.some(group => group.name.toLowerCase().includes(valueKeyword.trim().toLowerCase())) && <p className="att-v2-hint" role="status">没有匹配的选项</p>}
      {valueError && <p className="att-v2-error" role="alert">请选择至少一项，或选择全部</p>}
    </BottomSheet>
  </MobilePage>;
}
