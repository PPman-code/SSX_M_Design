import { useId, useRef, useState, type RefObject } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/useToast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Search } from '../../../components/ui/Search';
import { SheetActions } from '../../../components/ui/SheetContent';
import { formatPoints, pointsInCents, type PointsEntry, type PointsRule, type PointsOperation } from './points-model';
import './points-adjustment.css';

export function PointsAdjustment({ open, onOpenChange, student, balance, rules, onCreateRule, onConfirm, finalFocus, operation }: {
  operation: PointsOperation;
  open: boolean; onOpenChange: (open: boolean) => void; student: { name: string }; balance: number;
  finalFocus: RefObject<HTMLButtonElement | null>;
  rules: PointsRule[]; onCreateRule: (rule: PointsRule) => void; onConfirm: (cents: number) => void;
}) {
  const { showToast } = useToast();
  const createFields = useRef<HTMLDivElement>(null);
  const entryFields = useRef<HTMLDivElement>(null);
  const verb = operation === 'add' ? '加' : '减';
  const sign = operation === 'add' ? '+' : '−';
  const rulePrefix = useId();
  const ruleSequence = useRef(0);
  const [entries, setEntries] = useState<PointsEntry[]>([]);
  const [selectorOpen, setSelectorOpen] = useState(true);
  const [editorStarted, setEditorStarted] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState('fixed');
  const [defaultPoints, setDefaultPoints] = useState('');
  const [reason, setReason] = useState('');
  const [nameError, setNameError] = useState('');
  const [pointsError, setPointsError] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [discardTarget, setDiscardTarget] = useState<'main' | 'create' | null>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const createRef = useRef<HTMLButtonElement>(null);
  const submitting = useRef(false);
  const amounts = entries.map(entry => {
    const rule = rules.find(rule => rule.id === entry.id)!;
    return pointsInCents(rule.unlimited ? entry.points : rule.points);
  });
  const total = amounts.reduce<number>((sum, amount) => sum + (amount ?? 0), 0);
  const valid = entries.length > 0 && amounts.every(amount => amount !== null) && Number.isSafeInteger(total);
  const filtered = rules.filter(rule => rule.name.includes(query.trim()));
  const mainDirty = entries.length > 0;
  const createDirty = name !== '' || kind !== 'fixed' || defaultPoints !== '' || reason !== '';
  function requestClose(target: 'main' | 'create') {
    if (target === 'main' ? mainDirty : createDirty) { setDiscardTarget(target); return; }
    if (target === 'main') onOpenChange(false); else setCreateOpen(false);
  }
  function discard() {
    const target = discardTarget;
    setDiscardTarget(null);
    if (target === 'main') onOpenChange(false); else setCreateOpen(false);
  }
  function openSelector() {
    setSelected(entries.map(entry => entry.id)); setQuery(''); setSelectorOpen(true);
  }
  function closeSelector() {
    setSelectorOpen(false);
    if (!editorStarted) onOpenChange(false);
  }
  function confirmSelection() {
    if (!selected.length) { showToast({ message: '请先选择积分项' }); return; }
    setEntries(selected.map(id => entries.find(entry => entry.id === id) ?? {
      id, points: rules.find(rule => rule.id === id)!.points, reason: rules.find(rule => rule.id === id)!.reason,
    }));
    setSubmitError(''); setSelectorOpen(false); setEditorStarted(true);
  }
  function startCreate() { setName(''); setKind('fixed'); setDefaultPoints(''); setReason(''); setNameError(''); setPointsError(''); setCreateOpen(true); }
  function saveRule() {
    setNameError('');
    setPointsError('');
    if (!name.trim()) {
      setNameError('请输入规则名称');
      showToast({ message: '请输入规则名称' });
      createFields.current?.querySelectorAll('input')[0]?.focus();
      return;
    }
    if (rules.some(rule => rule.name === name.trim())) {
      setNameError('规则名称已存在');
      showToast({ message: '规则名称已存在' });
      createFields.current?.querySelectorAll('input')[0]?.focus();
      return;
    }
    if (kind === 'fixed' && pointsInCents(defaultPoints) === null) {
      setPointsError('默认分值须大于 0');
      showToast({ message: '默认分值须大于 0' });
      createFields.current?.querySelectorAll('input')[1]?.focus();
      return;
    }
    const rule: PointsRule = { id: `local-${rulePrefix}-${++ruleSequence.current}`, name: name.trim(), points: kind === 'fixed' ? defaultPoints.trim() : '', reason: reason.trim(), unlimited: kind === 'unlimited' };
    onCreateRule(rule); setSelected(current => [...current, rule.id]); setQuery(''); setCreateOpen(false);
  }
  function updateEntry(id: string, patch: Partial<PointsEntry>) { setEntries(current => current.map(entry => entry.id === id ? { ...entry, ...patch } : entry)); setSubmitError(''); }
  function submit() {
    if (submitting.current) return;
    setSubmitAttempted(true);
    if (!valid) {
      const message = !entries.length ? '请先选择积分项' : !Number.isSafeInteger(total) ? '积分数值过大，请调整后重试' : '请为每项填写大于 0 的分值';
      setSubmitError(message); showToast({ message });
      if (!entries.length) addRef.current?.focus();
      else { const index = amounts.findIndex(amount => amount === null); entryFields.current?.querySelectorAll('.points-entry')[Math.max(index, 0)]?.querySelector<HTMLInputElement>('.points-value-input input')?.focus(); }
      return;
    }
    if (!Number.isSafeInteger(balance + (operation === 'add' ? total : -total))) { setSubmitError('积分数值过大，请调整后重试'); return; }
    submitting.current = true; onConfirm(operation === 'add' ? total : -total); onOpenChange(false);
  }
  const discardDialog = (
    <Dialog stacked open={discardTarget !== null} onOpenChange={next => { if (!next) setDiscardTarget(null); }} title="放弃本次修改？"
      actions={[{ label: '继续编辑' }, { label: '放弃修改', danger: true, onSelect: discard }]}>
      {discardTarget === 'create' ? '已填写的规则名称、分值和备注将被丢弃。' : '已选择的积分项及填写的分值、原因将被丢弃。'}
    </Dialog>
  );
  const selector = (
    <BottomSheet onBack={editorStarted ? closeSelector : undefined} title={`选择${verb}分项`} open={open && selectorOpen} onOpenChange={next => { if (!next) closeSelector(); }} finalFocus={editorStarted ? addRef : finalFocus} className="points-selector"
      footer={<div className="points-submit-bar">
        <span className="points-selection-count" role="status">已选 {selected.length} 项</span>
        <Button onClick={confirmSelection}>确认选择</Button>
      </div>}>
      <Search label="搜索积分项" placeholder="搜索积分项" value={query} onValueChange={setQuery} actions={<Button ref={createRef} variant="text" icon="plus" onClick={startCreate}>新增</Button>} />
      <div className="points-rule-options" role="group" aria-label={`${verb}分规则`}>
        {filtered.map(rule => (
          <Checkbox
            key={rule.id}
            variant="circle"
            placement="left"
            className="points-rule-checkbox"
            label={
              <span className="points-rule-item">
                <span className="points-rule-name">{rule.name}</span>
                <span className="points-rule-score">{rule.unlimited ? '不限分值' : `${sign}${rule.points} 分`}</span>
              </span>
            }
            checked={selected.includes(rule.id)}
            onChange={checked => setSelected(current => checked ? [...current, rule.id] : current.filter(id => id !== rule.id))}
          />
        ))}
      </div>
      {!filtered.length && <p className="points-empty" role="status">没有匹配的积分项</p>}
      <BottomSheet mode="editor" onCloseRequest={() => requestClose('create')} title={`新增${verb}分规则`} open={createOpen} onOpenChange={setCreateOpen} finalFocus={createRef} className="points-create"
        header={<div className="points-create-nav">
          <Button className="sheet-nav-back" variant="text" icon="left" onClick={() => requestClose('create')}>返回</Button>
          <span className="points-create-nav-title" aria-hidden="true">新增{verb}分规则</span>
          <span aria-hidden="true" />
        </div>}
        footer={<SheetActions primary={{ label: '保存并选中', onClick: saveRule }} />}>
        <div className="points-create-fields" ref={createFields}>
          <CellGroup variant="block">
            <Input
              label="规则名称"
              required
              value={name}
              onValueChange={val => { setName(val); if (nameError) setNameError(''); }}
              status={nameError ? 'error' : 'default'}
              description={nameError || undefined}
              placeholder="请输入"
            />
            <Cell
              label={`${verb}分分值类型`}
              control={
                <div className="points-kind-toggle" role="group" aria-label={`${verb}分分值类型`}>
                  <button
                    type="button"
                    aria-pressed={kind === 'fixed'}
                    className={`points-kind-btn ${kind === 'fixed' ? 'points-kind-btn--active' : ''}`}
                    onClick={() => { setKind('fixed'); setPointsError(''); }}
                  >
                    固定分值
                  </button>
                  <button
                    type="button"
                    aria-pressed={kind === 'unlimited'}
                    className={`points-kind-btn ${kind === 'unlimited' ? 'points-kind-btn--active' : ''}`}
                    onClick={() => { setKind('unlimited'); setPointsError(''); }}
                  >
                    不限分值
                  </button>
                </div>
              }
            />
            {kind === 'fixed' && (
              <Input
                label="默认分值"
                aria-label={`默认${verb}分分值`}
                required
                value={defaultPoints}
                onValueChange={val => { setDefaultPoints(val); if (pointsError) setPointsError(''); }}
                status={pointsError ? 'error' : 'default'}
                description={pointsError || undefined}
                inputMode="decimal"
                placeholder="0"
                suffix="分"
              />
            )}
            <Input label="备注" optional value={reason} onValueChange={setReason} placeholder="请输入" />
          </CellGroup>
          <p className="points-note">保存后返回规则库并自动勾选，确认选择后应用到本次操作。积分在主页面提交后生效。</p>
        </div>
      </BottomSheet>
      {!editorStarted && discardDialog}
    </BottomSheet>
  );
  return <>
  <BottomSheet mode="editor" onCloseRequest={() => requestClose('main')} title={`${verb}积分`} open={open && editorStarted} onOpenChange={onOpenChange} finalFocus={finalFocus} className={`points-adjustment points-adjustment--${operation}`}
    footer={<div className="points-submit-bar">
      <div className="points-submit-total" role="group" aria-label={`本次${verb}分汇总`} aria-live="polite">
        {entries.length > 0 ? <><span>本次{verb}分</span><strong>{sign}{formatPoints(total)} 分</strong></> : <span>请选择积分项</span>}
      </div>
      <Button onClick={submit} tone={operation === 'subtract' ? 'danger' : 'brand'}>确认{verb}分</Button>
    </div>}>
    <div className="points-section-title"><h3>积分项</h3><span className="points-entry-count" aria-label={`已选 ${entries.length} 项`}>{entries.length}</span><span className="points-student-summary">{student.name}：{formatPoints(balance)} 积分</span></div>
    <div className="points-entry-list" ref={entryFields}>
      {entries.map(entry => {
        const rule = rules.find(rule => rule.id === entry.id)!;
        const amount = pointsInCents(rule.unlimited ? entry.points : rule.points);
        const hasError = submitAttempted && (amount === null || amount <= 0);
        return <section className="points-entry" key={entry.id} aria-label={rules.find(rule => rule.id === entry.id)!.name}>
          <div className="points-entry-heading"><h3>{rules.find(rule => rule.id === entry.id)!.name}</h3><Button variant="text" size="sm" onClick={() => setEntries(current => current.filter(item => item.id !== entry.id))} aria-label={`移除${rules.find(rule => rule.id === entry.id)!.name}`}>移除</Button></div>
          <div className="points-entry-fields">
            {rule.unlimited ? <Input
              label={`${verb}分分值`}
              aria-label={`${rules.find(rule => rule.id === entry.id)!.name}${verb}分分值`}
              className="points-value-input"
              value={entry.points}
              onValueChange={points => updateEntry(entry.id, { points })}
              status={hasError ? 'error' : 'default'}
              description={hasError ? '请为每项填写大于 0 的分值' : undefined}
              inputMode="decimal"
              placeholder="0"
              suffix="分"
              aria-invalid={hasError}
            /> : <Cell label={`${verb}分分值`} value={`${rule.points} 分`} />}
            <Input label={`${verb}分原因`} aria-label={`${rules.find(rule => rule.id === entry.id)!.name}${verb}分原因`} optional className="points-reason-input" value={entry.reason} onValueChange={reason => updateEntry(entry.id, { reason })} placeholder="请输入" />
          </div>
        </section>;
      })}
      <Button ref={addRef} className="points-add-item" variant="soft" block icon="plus-circle" onClick={openSelector}>{entries.length ? '添加积分项' : '选择积分项'}</Button>
    </div>
    {submitError && !entries.length && <p className="points-error" role="alert">{submitError}</p>}

    {editorStarted && selector}
    {editorStarted && discardDialog}
  </BottomSheet>
  {!editorStarted && selector}

  </>;
}
