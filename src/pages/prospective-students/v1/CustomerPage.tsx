import { ListEnd } from '../../../components/ui/ListEnd';
import { simulateRefresh } from '../../../preview/simulateRefresh';
import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { Search } from '../../../components/ui/Search';
import { Checkbox } from '../../../components/ui/Checkbox';
import { MobilePage } from '../../../components/ui/MobilePage';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { PopoverMenu } from '../../../components/ui/PopoverMenu';
import { SheetActions, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/useToast';
import { CustomerFilters } from './CustomerFilters';
import { campuses, createCustomers, dateLabel, editableStatuses, emptyFilters, localDay, selectCustomers, sortOptions } from './model';
import type { Customer, SortKey } from './model';
import './customers.css';

export function CustomerPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams(); const { showToast } = useToast();
  const [customers, setCustomers] = useState(createCustomers); const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(emptyFilters); const [filterOpen, setFilterOpen] = useState(false); const [filterKey, setFilterKey] = useState(0);
  const [sort, setSort] = useState<SortKey>('inputDate'); const [descending, setDescending] = useState(true); const [sortOpen, setSortOpen] = useState(false);
  const [batch, setBatch] = useState(false); const [selected, setSelected] = useState<string[]>([]);
  const [discardEdit, setDiscardEdit] = useState(false);
  const editFieldRows = useRef<HTMLDivElement>(null);
  const editFieldRef = useRef<HTMLButtonElement>(null);
  const [editOpen, setEditOpen] = useState(false); const [editStatus, setEditStatus] = useState(''); const [editCampus, setEditCampus] = useState('');
  const [choosing, setChoosing] = useState<'status' | 'campus' | null>(null); const [optionQuery, setOptionQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false); const [editError, setEditError] = useState('');
  const [pendingAction, setPendingAction] = useState<{ label: string; count: number } | null>(null);
  const batchActionRef = useRef<HTMLButtonElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const sortRef = useRef<HTMLButtonElement>(null); const filterRef = useRef<HTMLButtonElement>(null); const moreRef = useRef<HTMLButtonElement>(null);
  const scenario = params.get('state');
  const visible = scenario === 'empty' ? [] : selectCustomers(customers, query, filters, sort, descending);
  const allSelected = visible.length > 0 && visible.every(customer => selected.includes(customer.id));
  const filterActive = JSON.stringify(filters) !== JSON.stringify(emptyFilters());
  function externalFlow(name: string, customer?: Customer) { if (name === '客户主页' && customer) { const next = new URLSearchParams(params); next.delete('state'); next.set('customer', customer.id); navigate(`/pages/customer-info/v1?${next}`); return; } showToast({ message: `${customer ? `${customer.name} · ` : ''}${name}请在现有业务系统中办理` }); }
  function toggle(id: string) { setSelected(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]); }
  function beginEdit() { setEditStatus(''); setEditCampus(''); setEditError(''); setChoosing(null); setEditOpen(true); }
  function requestEditClose() { if (editStatus || editCampus) setDiscardEdit(true); else setEditOpen(false); }
  function saveEdit() {
    if (!editStatus && !editCampus) { setEditError('请选择至少一个需要修改的字段'); showToast({ message: '请选择至少一个需要修改的字段' }); editFieldRows.current?.querySelector('button')?.focus(); return; }
    if (params.get('save') === 'error') { setEditError('保存失败，请稍后重试'); return; }
    setCustomers(previous => previous.map(customer => selected.includes(customer.id) ? { ...customer, ...(editStatus ? { status: editStatus } : {}), ...(editCampus ? { campus: editCampus } : {}) } : customer));
    setSelected([]); setEditOpen(false); showToast({ message: '修改已应用于当前预览' });
  }
  function runAction(action: string) {
    if (!selected.length) { showToast({ message: '请先选择客户' }); return; }
    if (action === '修改') beginEdit();
    else if (action === '删除') setConfirmDelete(true);
    else if (selected.length) {
      batchActionRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
      setPendingAction({ label: action, count: selected.length });
    }
  }
  function recover() { setQuery(''); setFilters(emptyFilters()); setParams(previous => { const next = new URLSearchParams(previous); next.delete('state'); return next; }, { replace: true }); }
  const footer = <div className={`prospect-footer ${batch ? 'prospect-footer--batch' : ''}`}>
    {batch ? <>
      <div className="prospect-batch-heading">
        <Checkbox className="prospect-check" variant="circle" label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : visible.map(customer => customer.id))} />
        <span aria-live="polite">已选 <b>{selected.length}</b> 位</span>
        <Button variant="text" onClick={() => { setBatch(false); setSelected([]); setMoreOpen(false); }}>取消</Button>
      </div>
      <div className="prospect-batch-actions">
        {([['转为正式', 'user-add'], ['取消转化', 'reply'], ['新开班试听', 'calendar'], ['跟班试听', 'user-group']] as const).map(([action, icon], index) => <button key={action} type="button" className={'prospect-batch-action' + (index === 0 ? ' prospect-batch-action--primary' : '')} onClick={() => runAction(action)}><Icon name={icon} size="md" /><span>{action}</span></button>)}
        <PopoverMenu label="更多操作" placement="top-end" open={moreOpen} onOpenChange={open => { if (open && !selected.length) showToast({ message: '请先选择客户' }); else setMoreOpen(open); }} actions={[
          { key: 'edit', label: '修改', onSelect: () => runAction('修改') },
          { key: 'delete', label: '删除', danger: true, onSelect: () => runAction('删除') },
        ]} trigger={<button ref={moreRef} type="button" className="prospect-batch-action"><Icon name="more" size="md" /><span>更多</span></button>} />
      </div>
    </> : <Button block icon="plus" className="prospect-add-button" onClick={() => externalFlow('添加客户')}>添加客户</Button>}
  </div>;
  return <MobilePage onRefresh={simulateRefresh} refreshDisabled={batch || scenario === 'forbidden'} refreshSuccessText="模拟刷新完成" title="意向客户管理" previewChrome={params.get('chrome') === 'wechat'} className="prospect-page" footer={scenario === 'forbidden' || scenario === 'error' ? undefined : footer}>{refreshIndicator => <>
    <div className="prospect-content">
      {scenario === 'forbidden' ? <div className="prospect-empty" role="status"><h2>暂无客户查看权限</h2><p>请联系管理员开通权限</p></div> : scenario === 'error' ? <>{refreshIndicator}<div className="prospect-empty" role="alert"><h2>加载失败</h2><Button variant="soft" onClick={recover}>重试</Button></div></> : <>
        {!batch && <Search className="prospect-tools" label="搜索客户" placeholder="搜索姓名 / 电话 / 公立学校" clearLabel="清除搜索" value={query} onValueChange={setQuery} actions={<><button ref={sortRef} type="button" className="icon-button touch-target" aria-label="排序" aria-haspopup="dialog" onClick={() => setSortOpen(true)}><img src={`${import.meta.env.BASE_URL}pages/prospective-students/v1/sort.svg`} width="20" height="20" alt="" /></button><button ref={filterRef} type="button" className="icon-button touch-target" data-active={filterActive || undefined} aria-label="筛选客户" aria-haspopup="dialog" onClick={() => { setFilterKey(key => key + 1); setFilterOpen(true); }}><img src={`${import.meta.env.BASE_URL}pages/prospective-students/v1/filter.svg`} width="20" height="20" alt="" />{filterActive && <span className="prospect-active-dot" />}</button></>} />}
        {refreshIndicator}
        <div className="prospect-count"><span aria-live="polite">共 <b>{visible.length}</b> 位客户</span>{!batch && <Button variant="text" size="sm" onClick={() => { if (!visible.length) { showToast({ message: '当前没有可批量操作的客户' }); return; } setBatch(true); setSelected([]); }}>批量管理</Button>}</div>
        <div className="prospect-list" role="list" aria-label="客户列表">{visible.map((customer, index) => <article role="listitem" key={customer.id} className={`prospect-card prospect-avatar-${index % 4} ${selected.includes(customer.id) ? 'is-selected' : ''}`} onClick={batch ? () => toggle(customer.id) : undefined}>
          <div className="prospect-card-heading">{batch && <Checkbox className="prospect-card-select" variant="circle" hideLabel label={`选择${customer.name}`} checked={selected.includes(customer.id)} onChange={() => toggle(customer.id)} onClick={(event) => { event.stopPropagation(); }} />}<div className="prospect-avatar">{customer.avatar ? <img src={customer.avatar} alt="" /> : customer.name[0]}</div><div className="prospect-person"><div className="prospect-person-title"><strong title={customer.name}>{customer.name}</strong>{customer.gender && <span className={`prospect-gender prospect-gender--${customer.gender}`} aria-label={customer.gender === 'male' ? '男' : '女'}><Icon name={customer.gender === 'male' ? 'man' : 'woman'} size="xs" /></span>}{customer.status && <span className={`prospect-status ${customer.status === '转化成功' ? 'prospect-status--success' : customer.status === '体验课报名' ? 'prospect-status--trial' : ''}`}>{customer.status}</span>}</div><div className="prospect-phone-row"><span className="prospect-phone-number">{params.get('phone') === 'masked' ? customer.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : customer.phone}</span></div></div>{!batch && <div className="prospect-card-links">{params.get('phone') === 'masked' ? <button className="prospect-call touch-target" aria-label={`拨打${customer.name}电话`} onClick={() => showToast({ message: '暂无号码查看及拨号权限' })}><Icon name="phone" size="base" /></button> : <a className="prospect-call touch-target" href={`tel:${customer.phone}`} aria-label={`拨打${customer.name}电话`}><Icon name="phone" size="base" /></a>}<button className="icon-button prospect-detail-action" aria-label={`${customer.name}客户主页`} onClick={() => externalFlow('客户主页', customer)}><Icon name="right" size="base" /></button></div>}</div>
          <dl className="prospect-metrics"><div><dt>主责任人</dt><dd>{customer.owner || '\u00a0'}</dd></div><div><dt>意向级别</dt><dd className="prospect-hearts" aria-label={customer.level == null ? '未设置意向级别' : `${customer.level}心`}>{Array.from({ length: customer.level ?? 0 }, (_, heart) => <Icon key={heart} name="heart-fill" size="xs" />)}</dd></div><div><dt>上次沟通</dt><dd>{dateLabel(customer.lastDate) || '\u00a0'}</dd></div></dl>
          <div className="prospect-card-bottom"><span className={customer.nextDate.slice(0, 10) === localDay() ? 'prospect-follow-today' : ''}><Icon name="clock-circle" size="xs" />下次跟进 {dateLabel(customer.nextDate, true)}</span>{!batch && <button type="button" onClick={() => externalFlow('基本信息', customer)}>查看资料<Icon name="right" size="xs" /></button>}</div>
        </article>)}</div>
        {!visible.length ? <div className="prospect-empty" role="status"><h2>暂无符合条件的客户</h2><Button variant="text" onClick={recover}>清除条件</Button></div> : <ListEnd />}
      </>}
    </div>
    <BottomSheet title="排序方式" open={sortOpen} onOpenChange={setSortOpen} finalFocus={sortRef}><div className="prospect-sort-options">{sortOptions.map(option => <button type="button" aria-pressed={sort === option.key} key={option.key} onClick={() => { const nextDescending = sort === option.key ? !descending : option.key !== 'name'; setSort(option.key); setDescending(nextDescending); setSortOpen(false); showToast({ message: nextDescending ? '已按降序排列' : '已按升序排列' }); }}><span>按{option.label === '跟进时间' ? '下次跟进时间' : option.label === '沟通时间' ? '上次沟通时间' : option.label}排序{sort === option.key && <Icon name={descending ? 'arrow-down' : 'arrow-up'} size="sm" />}</span>{sort === option.key && <Icon name="check" size="sm" />}</button>)}</div><p className="prospect-sort-hint">再次点击已选项切换升序 / 降序</p></BottomSheet>
    <CustomerFilters key={filterKey} value={filters} onApply={setFilters} open={filterOpen} onOpenChange={setFilterOpen} finalFocus={filterRef} />
    <BottomSheet mode="editor" title="批量修改" open={editOpen} finalFocus={moreRef} onCloseRequest={requestEditClose} onOpenChange={setEditOpen}
      footer={<>{editError && <p role="alert" className="prospect-error">{editError}</p>}<SheetActions secondary={{ label: '取消', onClick: requestEditClose }} primary={{ label: '保存修改', onClick: saveEdit }} /></>}>
      <p className="prospect-edit-hint">已选 {selected.length} 位客户，未选择的字段保持原值。</p>
      <div className="prospect-edit-cells" ref={editFieldRows}><CellGroup label="批量修改字段" variant="block">{([['status', '客户状态', editStatus], ['campus', '所属校区', editCampus]] as const).map(([key, label, value]) => <Cell key={key} label={label} value={value || '请选择'} arrow onClick={() => { editFieldRef.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null; setEditError(''); setOptionQuery(''); setChoosing(key); }} />)}</CellGroup></div>
      <BottomSheet onBack={() => setChoosing(null)} title={choosing === 'status' ? '选择状态' : '选择校区'} open={choosing !== null} onOpenChange={open => { if (!open) setChoosing(null); }} finalFocus={editFieldRef}>
        <Search label={choosing === 'status' ? '搜索状态' : '搜索校区'} placeholder={choosing === 'status' ? '搜索状态' : '搜索校区'} value={optionQuery} onValueChange={setOptionQuery} />
        <SheetSelectionList label={choosing === 'status' ? '客户状态选项' : '校区选项'} options={[{ value: '', label: '不修改' }, ...(choosing === 'status' ? editableStatuses : campuses).filter(value => value.includes(optionQuery)).map(value => ({ value, label: value }))]} value={choosing === 'status' ? editStatus : editCampus} onChange={value => { if (choosing === 'status') setEditStatus(value); else setEditCampus(value); setChoosing(null); }} onReselect={() => setChoosing(null)} />
        {!(choosing === 'status' ? editableStatuses : campuses).some(value => value.includes(optionQuery)) && <p className="prospect-selection-empty" role="status">没有匹配的选项</p>}
      </BottomSheet>
      <Dialog stacked open={discardEdit} onOpenChange={setDiscardEdit} title="放弃本次修改？" actions={[{ label: '继续编辑' }, { label: '放弃修改', danger: true, onSelect: () => { setDiscardEdit(false); setEditOpen(false); } }]}>
        已选择的客户状态和校区尚未保存，放弃后将不应用这些修改。
      </Dialog>
    </BottomSheet>
    <Dialog open={pendingAction !== null} onOpenChange={open => { if (!open) setPendingAction(null); }} finalFocus={batchActionRef} title={pendingAction?.label ?? '确认操作'} actions={[
      { label: '取消' }, { label: '确认', onSelect: () => { if (pendingAction) externalFlow(pendingAction.label); } },
    ]}>将对已选的 {pendingAction?.count ?? 0} 位客户执行「{pendingAction?.label}」。</Dialog>
    <Dialog open={confirmDelete} onOpenChange={setConfirmDelete} finalFocus={moreRef} title="删除客户" actions={[{ label: '取消' }, { label: '删除', danger: true, onSelect: () => { setCustomers(previous => previous.filter(customer => !selected.includes(customer.id))); setSelected([]); showToast({ message: '已从当前预览中删除' }); } }]}><p>确定删除选中的 {selected.length} 位客户？本次操作仅作用于当前预览数据。</p></Dialog>
  </>}</MobilePage>;
}
