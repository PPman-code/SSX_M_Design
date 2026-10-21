import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from '../../../components/ui/Search';
import { Checkbox } from '../../../components/ui/Checkbox';
import { MobilePage } from '../../../components/ui/MobilePage';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { ActionSheet } from '../../../components/ui/ActionSheet';
import { SheetActions, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/useToast';
import { CustomerFilters } from './CustomerFilters';
import { campuses, createCustomers, dateLabel, editableStatuses, emptyFilters, localDay, selectCustomers, sortOptions } from './model';
import type { Customer, SortKey } from './model';
import './customers.css';

export function CustomerPage() {
  const [params, setParams] = useSearchParams(); const { showToast } = useToast();
  const [customers, setCustomers] = useState(createCustomers); const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(emptyFilters); const [filterOpen, setFilterOpen] = useState(false); const [filterKey, setFilterKey] = useState(0);
  const [sort, setSort] = useState<SortKey>('inputDate'); const [descending, setDescending] = useState(true); const [sortOpen, setSortOpen] = useState(false);
  const [batch, setBatch] = useState(false); const [selected, setSelected] = useState<string[]>([]);
  const [editOpen, setEditOpen] = useState(false); const [editStatus, setEditStatus] = useState(''); const [editCampus, setEditCampus] = useState('');
  const [choosing, setChoosing] = useState<'status' | 'campus' | null>(null); const [optionQuery, setOptionQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false); const [editError, setEditError] = useState('');
  const [moreOpen, setMoreOpen] = useState(false);
  const sortRef = useRef<HTMLButtonElement>(null); const filterRef = useRef<HTMLButtonElement>(null); const moreRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { const previous = document.title; document.title = '意向客户管理 · 智校'; return () => { document.title = previous; }; }, []);
  const scenario = params.get('state');
  const visible = scenario === 'empty' ? [] : selectCustomers(customers, query, filters, sort, descending);
  const allSelected = visible.length > 0 && visible.every(customer => selected.includes(customer.id));
  const filterActive = JSON.stringify(filters) !== JSON.stringify(emptyFilters());
  function externalFlow(name: string, customer?: Customer) { showToast({ message: `${customer ? `${customer.name} · ` : ''}${name}请在现有业务系统中办理` }); }
  function toggle(id: string) { setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); }
  function beginEdit() { setEditStatus(''); setEditCampus(''); setEditError(''); setChoosing(null); setEditOpen(true); }
  function saveEdit() {
    if (params.get('save') === 'error') { setEditError('保存失败，请稍后重试'); return; }
    setCustomers(previous => previous.map(customer => selected.includes(customer.id) ? { ...customer, ...(editStatus ? { status: editStatus } : {}), ...(editCampus ? { campus: editCampus } : {}) } : customer));
    setSelected([]); setEditOpen(false); showToast({ message: '修改已应用于当前预览' });
  }
  function runAction(action: string) {
    if (action === '修改') beginEdit();
    else if (action === '删除') setConfirmDelete(true);
    else externalFlow(action);
  }
  function recover() { setQuery(''); setFilters(emptyFilters()); setParams(previous => { const next = new URLSearchParams(previous); next.delete('state'); return next; }, { replace: true }); }
  const footer = <div className={`prospect-footer ${batch ? 'prospect-footer--batch' : ''}`}>
    {batch ? <>
      <div className="prospect-batch-heading">
        <Checkbox className="prospect-check" variant="square" label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : visible.map(customer => customer.id))} />
        <span aria-live="polite">已选 <b>{selected.length}</b> 位</span>
        <Button variant="text" onClick={() => { setBatch(false); setSelected([]); setMoreOpen(false); }}>取消</Button>
      </div>
      <div className="prospect-batch-actions">
        {([['转为正式', 'user-add'], ['取消转化', 'reply'], ['新开班试听', 'calendar'], ['跟班试听', 'user-group']] as const).map(([action, icon], index) => <button key={action} type="button" className={'prospect-batch-action' + (index === 0 ? ' prospect-batch-action--primary' : '')} disabled={!selected.length} onClick={() => runAction(action)}><Icon name={icon} size="md" /><span>{action}</span></button>)}
        <button ref={moreRef} type="button" className="prospect-batch-action" disabled={!selected.length} aria-haspopup="dialog" aria-expanded={moreOpen} onClick={() => setMoreOpen(true)}><Icon name="more" size="md" /><span>更多</span></button>
      </div>
    </> : <Button block icon="plus" className="prospect-add-button" onClick={() => externalFlow('添加客户')}>添加客户</Button>}
  </div>;
  return <MobilePage onRefresh={simulateRefresh} refreshDisabled={batch || scenario === 'forbidden'} refreshSuccessText="模拟刷新完成" title="意向客户管理" previewChrome={params.get('chrome') === 'wechat'} className="prospect-page" footer={scenario === 'forbidden' || scenario === 'error' ? undefined : footer}>{refreshIndicator => <>
    <div className="prospect-content">
      {scenario === 'forbidden' ? <div className="prospect-empty" role="status"><h2>暂无客户查看权限</h2><p>请联系管理员开通权限</p></div> : scenario === 'error' ? <>{refreshIndicator}<div className="prospect-empty" role="alert"><h2>加载失败</h2><Button variant="soft" onClick={recover}>重试</Button></div></> : <>
        {!batch && <Search className="prospect-tools" label="搜索客户" placeholder="搜索姓名 / 电话 / 公立学校" clearLabel="清除搜索" value={query} onValueChange={setQuery} actions={<><button ref={sortRef} type="button" className="icon-button touch-target" aria-label="排序" aria-haspopup="dialog" onClick={() => setSortOpen(true)}><img src={`${import.meta.env.BASE_URL}pages/prospective-students/v1/sort.svg`} width="20" height="20" alt="" /></button><button ref={filterRef} type="button" className="icon-button touch-target" data-active={filterActive || undefined} aria-label="筛选客户" aria-haspopup="dialog" onClick={() => { setFilterKey(key => key + 1); setFilterOpen(true); }}><img src={`${import.meta.env.BASE_URL}pages/prospective-students/v1/filter.svg`} width="20" height="20" alt="" />{filterActive && <span className="prospect-active-dot" />}</button></>} />}
        {refreshIndicator}
        <div className="prospect-count"><span aria-live="polite">共 <b>{visible.length}</b> 位客户</span>{!batch && <Button variant="text" size="sm" disabled={!visible.length} onClick={() => { setBatch(true); setSelected([]); }}>批量管理</Button>}</div>
        <div className="prospect-list" role="list" aria-label="客户列表">{visible.map((customer, index) => <article role="listitem" key={customer.id} className={`prospect-card prospect-avatar-${index % 4} ${selected.includes(customer.id) ? 'is-selected' : ''}`} onClick={batch ? () => toggle(customer.id) : undefined}>
          <div className="prospect-card-heading">{batch && <Checkbox className="prospect-card-select" variant="square" hideLabel label={`选择${customer.name}`} checked={selected.includes(customer.id)} onChange={() => toggle(customer.id)} onClick={(event) => { event.stopPropagation(); }} />}<div className="prospect-avatar">{customer.avatar ? <img src={customer.avatar} alt="" /> : customer.name[0]}</div><div className="prospect-person"><div className="prospect-person-title"><strong title={customer.name}>{customer.name}</strong>{customer.gender && <span className={`prospect-gender prospect-gender--${customer.gender}`} aria-label={customer.gender === 'male' ? '男' : '女'}><Icon name={customer.gender === 'male' ? 'man' : 'woman'} size="xs" /></span>}{customer.status && <span className={`prospect-status ${customer.status === '转化成功' ? 'prospect-status--success' : customer.status === '体验课报名' ? 'prospect-status--trial' : ''}`}>{customer.status}</span>}</div><div className="prospect-phone-row"><span className="prospect-phone-number">{params.get('phone') === 'masked' ? customer.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : customer.phone}</span></div></div>{!batch && <div className="prospect-card-links">{params.get('phone') === 'masked' ? <button className="prospect-call touch-target" aria-label={`拨打${customer.name}电话`} onClick={() => showToast({ message: '暂无号码查看及拨号权限' })}><Icon name="phone" size="base" /></button> : <a className="prospect-call touch-target" href={`tel:${customer.phone}`} aria-label={`拨打${customer.name}电话`}><Icon name="phone" size="base" /></a>}<button className="icon-button prospect-detail-action" aria-label={`${customer.name}客户主页`} onClick={() => externalFlow('客户主页', customer)}><Icon name="right" size="base" /></button></div>}</div>
          <dl className="prospect-metrics"><div><dt>主责任人</dt><dd>{customer.owner || '\u00a0'}</dd></div><div><dt>意向级别</dt><dd className="prospect-hearts" aria-label={customer.level == null ? '未设置意向级别' : `${customer.level}心`}>{Array.from({ length: customer.level ?? 0 }, (_, heart) => <Icon key={heart} name="heart-fill" size="xs" />)}</dd></div><div><dt>上次沟通</dt><dd>{dateLabel(customer.lastDate) || '\u00a0'}</dd></div></dl>
          <div className="prospect-card-bottom"><span className={customer.nextDate.slice(0, 10) === localDay() ? 'prospect-follow-today' : ''}><Icon name="clock-circle" size="xs" />下次跟进 {dateLabel(customer.nextDate, true)}</span>{!batch && <button type="button" onClick={() => externalFlow('基本信息', customer)}>查看资料<Icon name="right" size="xs" /></button>}</div>
        </article>)}</div>
        {!visible.length ? <div className="prospect-empty" role="status"><h2>暂无符合条件的客户</h2><Button variant="text" onClick={recover}>清除条件</Button></div> : <p className="prospect-list-end">已显示全部客户</p>}
      </>}
    </div>
    <BottomSheet title="排序方式" open={sortOpen} onOpenChange={setSortOpen} finalFocus={sortRef}><div className="prospect-sort-options">{sortOptions.map(option => <button type="button" aria-pressed={sort === option.key} key={option.key} onClick={() => { const nextDescending = sort === option.key ? !descending : option.key !== 'name'; setSort(option.key); setDescending(nextDescending); setSortOpen(false); showToast({ message: nextDescending ? '已按降序排列' : '已按升序排列' }); }}><span>按{option.label === '跟进时间' ? '下次跟进时间' : option.label === '沟通时间' ? '上次沟通时间' : option.label}排序{sort === option.key && <Icon name={descending ? 'arrow-down' : 'arrow-up'} size="sm" />}</span>{sort === option.key && <Icon name="check" size="sm" />}</button>)}</div><p className="prospect-sort-hint">再次点击已选项切换升序 / 降序</p></BottomSheet>
    <CustomerFilters key={filterKey} value={filters} onApply={setFilters} open={filterOpen} onOpenChange={setFilterOpen} finalFocus={filterRef} />
    <BottomSheet title={choosing === 'status' ? '选择状态' : choosing === 'campus' ? '选择校区' : '批量修改'} open={editOpen} finalFocus={moreRef} onOpenChange={open => { setEditOpen(open); if (!open) setChoosing(null); }} header={choosing ? <div className="prospect-option-heading"><Button variant="text" onClick={() => setChoosing(null)}>返回</Button><h2>{choosing === 'status' ? '选择状态' : '选择校区'}</h2><Button variant="text" onClick={() => setChoosing(null)}>取消</Button></div> : undefined} footer={!choosing ? <>{editError && <p role="alert" className="prospect-error">{editError}</p>}<SheetActions secondary={{ label: '取消', onClick: () => setEditOpen(false) }} primary={{ label: '保存修改', disabled: !editStatus && !editCampus, onClick: saveEdit }} /></> : undefined}>
      {choosing ? <><label className="prospect-search prospect-option-search"><Icon name="search" size="sm" /><input aria-label={choosing === 'status' ? '搜索状态' : '搜索校区'} placeholder={choosing === 'status' ? '搜索状态' : '搜索校区'} value={optionQuery} onChange={event => setOptionQuery(event.target.value)} /></label><SheetSelectionList label={choosing === 'status' ? '客户状态选项' : '校区选项'} options={(choosing === 'status' ? editableStatuses : campuses).filter(value => value.includes(optionQuery)).map(value => ({ value, label: value }))} value={choosing === 'status' ? editStatus : editCampus} onChange={value => { if (choosing === 'status') setEditStatus(value); else setEditCampus(value); setChoosing(null); }} onReselect={() => setChoosing(null)} /></> : <><p className="prospect-edit-hint">已选 {selected.length} 位客户，未选择的字段保持原值。</p>{([['status', '客户状态', editStatus], ['campus', '所属校区', editCampus]] as const).map(([key, label, value]) => <button className="prospect-edit-field" type="button" key={key} onClick={() => { setOptionQuery(''); setChoosing(key); }}><span>{label}</span><span>{value || '请选择'}<Icon name="right" size="sm" /></span></button>)}</>}
    </BottomSheet>
    <ActionSheet open={moreOpen} onOpenChange={setMoreOpen} finalFocus={moreRef} title="更多操作" actions={[
      { label: '修改', disabled: !selected.length, onSelect: () => runAction('修改') },
      { label: '删除', danger: true, disabled: !selected.length, onSelect: () => runAction('删除') },
    ]} />
    <Dialog open={confirmDelete} onOpenChange={setConfirmDelete} finalFocus={moreRef} title="删除客户" actions={[{ label: '取消' }, { label: '删除', danger: true, onSelect: () => { setCustomers(previous => previous.filter(customer => !selected.includes(customer.id))); setSelected([]); showToast({ message: '已从当前预览中删除' }); } }]}><p>确定删除选中的 {selected.length} 位客户？本次操作仅作用于当前预览数据。</p></Dialog>
  </>}</MobilePage>;
}
