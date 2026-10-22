import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loading } from '../../../components/ui/Loading';
import { Search } from '../../../components/ui/Search';
import { MobilePage } from '../../../components/ui/MobilePage';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { useToast } from '../../../components/ui/useToast';
import { StudentFilters } from './StudentFilters';
import { defaultFilters, filterStudents, inTab, money, sortOptions, students, tabs } from './model';
import type { StudentSort, StudentTab } from './model';
import './students.css';

const asset = `${import.meta.env.BASE_URL}pages/students/v1/`;
function AssetIcon({ name, size }: { name: string; size: number }) { return <img src={`${asset}${name}.svg`} width={size} height={size} alt="" />; }
export function StudentPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams(); const { showToast } = useToast();
  const [query, setQuery] = useState(''); const [tab, setTab] = useState<StudentTab>('all');
  const [filters, setFilters] = useState(defaultFilters); const [filterOpen, setFilterOpen] = useState(false); const [filterKey, setFilterKey] = useState(0);
  const [sort, setSort] = useState<StudentSort>('inputDate'); const [descending, setDescending] = useState(true); const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLButtonElement>(null); const filterRef = useRef<HTMLButtonElement>(null);
  const state = params.get('state');
  const filtered = filterStudents(state === 'empty' ? [] : students, query, filters);
  const visible = filtered.filter(student => inTab(student, tab)).sort((a, b) => {
    const av = a[sort]; const bv = b[sort];
    const order = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'zh-CN', { numeric: true });
    return descending ? -order : order;
  });
  const activeFilter = JSON.stringify(filters) !== JSON.stringify(defaultFilters());
  function openStudent(id: string) {
    const next = new URLSearchParams(params); next.delete('state'); next.set('student', id);
    navigate(`/pages/student-info/v1?${next}`);
  }
  function recover() { setQuery(''); setFilters(defaultFilters()); setTab('all'); setParams(previous => { const next = new URLSearchParams(previous); next.delete('state'); return next; }, { replace: true }); }
  return <MobilePage onRefresh={simulateRefresh} refreshDisabled={state === 'forbidden'} refreshSuccessText="模拟刷新完成" title="学员管理" previewChrome={params.get('chrome') === 'wechat'} className="student-page">{refreshIndicator => <>
    <div className="student-content">
      {state === 'forbidden' ? <div className="student-empty" role="status"><h2>暂无学员查看权限</h2><p>请联系管理员开通权限</p></div> : state === 'loading' ? <>{refreshIndicator}<div className="student-empty" aria-busy="true"><Loading text="正在加载学员…" /></div></> : state === 'error' ? <>{refreshIndicator}<div className="student-empty" role="alert"><h2>加载失败</h2><Button variant="soft" onClick={recover}>重试</Button></div></> : <>
        <Search className="student-toolbar" label="搜索学员" placeholder="搜索学员/手机号" clearLabel="清除学员搜索" value={query} onValueChange={setQuery} actions={<><button ref={sortRef} className="icon-button touch-target" type="button" aria-label="学员排序" aria-haspopup="dialog" onClick={() => setSortOpen(true)}><AssetIcon name="sort" size={20} /></button><button ref={filterRef} className="icon-button touch-target" type="button" aria-label="筛选学员" aria-haspopup="dialog" onClick={() => { setFilterKey(key => key + 1); setFilterOpen(true); }}><AssetIcon name="filter" size={20} />{activeFilter && <span className="student-filter-dot" />}</button></>} />
          <div className="student-tabs" role="tablist" aria-label="学员分类">{tabs.map((item, index) => { const count = filtered.filter(student => inTab(student, item.key)).length; return <button type="button" role="tab" key={item.key} id={`student-tab-${item.key}`} aria-selected={tab === item.key} aria-controls="student-panel" tabIndex={tab === item.key ? 0 : -1} onClick={() => setTab(item.key)} onKeyDown={event => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[next].key); document.getElementById(`student-tab-${tabs[next].key}`)?.focus(); }}>{item.label}{item.key !== 'all' && <span> ({count})</span>}</button>; })}</div>
        {refreshIndicator}
        <section id="student-panel" role="tabpanel" aria-labelledby={`student-tab-${tab}`}><p className="student-count" aria-live="polite">共 <b>{visible.length}</b> 名学员</p><div className="student-list" role="list" aria-label="学员列表">{visible.map(student => <article className={`student-card student-status-${student.status}`} role="listitem" key={student.id}>
          <div className="student-card-heading"><div className="student-avatar" aria-hidden="true">{student.name[0]}</div><div className="student-person"><div className="student-name"><strong title={student.name}>{student.name}</strong><span className="student-status">{student.status}</span></div><div className="student-phone-row"><span>{params.get('phone') === 'masked' ? student.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : student.phone}</span>{params.get('phone') === 'masked' ? <button type="button" className="student-phone touch-target" aria-label={`拨打${student.name}电话`} onClick={() => showToast({ message: '暂无号码查看及拨号权限' })}><AssetIcon name="phone" size={14} /></button> : <a className="student-phone touch-target" href={`tel:${student.phone}`} aria-label={`拨打${student.name}电话`}><AssetIcon name="phone" size={14} /></a>}</div></div>
            <div className="student-card-actions"><button type="button" className="student-round-action touch-target" aria-label={`${student.name}学员二维码`} onClick={() => showToast({ message: `${student.name}的学员二维码待对接` })}><AssetIcon name="qrcode" size={16} /></button><button type="button" className="student-round-action touch-target" aria-label={`${student.name}课程信息`} onClick={() => showToast({ message: `${student.name}的课程信息待对接` })}><AssetIcon name="book" size={16} /></button><button type="button" className="student-detail-action" aria-label={`${student.name}学员详情`} onClick={() => openStudent(student.id)}><AssetIcon name="right" size={16} /></button></div>
          </div>
          <dl className="student-metrics"><div><dt>剩余学费</dt><dd className={student.tuition < 0 ? 'student-negative' : ''}>{money(student.tuition)}</dd></div><div><dt>剩余数量</dt><dd className={student.quantity < 0 ? 'student-negative' : ''}>{student.quantity}</dd></div><div><dt>电子钱包</dt><dd>{money(student.wallet)}</dd></div><div><dt>有效期至</dt><dd>{student.validUntil || '不限'}</dd></div></dl>
        </article>)}</div>{!visible.length ? <div className="student-empty" role="status"><h2>暂无符合条件的学员</h2><Button variant="text" onClick={recover}>清除条件</Button></div> : <p className="student-list-end">已显示全部学员</p>}</section>
      </>}
    </div>
    <BottomSheet title="排序方式" open={sortOpen} onOpenChange={setSortOpen} finalFocus={sortRef}><div className="student-sort-options">{sortOptions.map(option => <button type="button" aria-pressed={sort === option.key} key={option.key} onClick={() => { const nextDescending = sort === option.key ? !descending : option.key !== 'name'; setSort(option.key); setDescending(nextDescending); setSortOpen(false); showToast({ message: nextDescending ? '已按降序排列' : '已按升序排列' }); }}><span>按{option.label}排序{sort === option.key && <Icon name={descending ? 'arrow-down' : 'arrow-up'} size="sm" />}</span>{sort === option.key && <Icon name="check" size="sm" />}</button>)}</div><p className="student-sort-hint">再次点击已选项切换升序 / 降序</p></BottomSheet>
    <StudentFilters key={filterKey} value={filters} onApply={setFilters} open={filterOpen} onOpenChange={setFilterOpen} finalFocus={filterRef} />
  </>}</MobilePage>;
}
