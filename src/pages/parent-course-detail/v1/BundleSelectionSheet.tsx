import { useEffect, useRef, useState } from 'react';
import { SeatViewport } from './SeatViewport';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { SheetActions, SheetChoiceGroup } from '../../../components/ui/SheetContent';
import { useToast } from '../../../components/ui/useToast';
import { formatCourseAmount, hasDirectSeatEntry, compactSeatLayout, type BundleItem } from './course-data';

export type SelectedBundleClass = { classId: string; className: string; seat: string };
export type BundleSelection = { classes?: SelectedBundleClass[]; specification: string; classId: string; className: string; seat: string; goods?: string[]; price?: number };

/** Local demonstration only: no real timetable, stock or seat reservation. */
export function BundleSelectionSheet({ item, initial, onClose, onConfirm, multipleClasses = false, showRemainingSeats = true }: {
  multipleClasses?: boolean; showRemainingSeats?: boolean;
  item: BundleItem; initial?: BundleSelection; onClose: () => void; onConfirm: (selection: BundleSelection) => void;
}) {
  const { showToast } = useToast();
  const classItem = item.kinds.includes('class');
  const directSeat = hasDirectSeatEntry(item);
  const options = item.specifications;
  const classes: { id: string; name: string; time: string; information?: string[]; remaining?: number; full: boolean }[] = [
    { id: 'class-1', name: item.id === 'football' ? '舞台表现·周六基础班' : '声乐启蒙·周六基础班', time: '11.07 起 · 每周六 09:00–10:00', information: ['刘老师'], remaining: 8, full: false },
    { id: 'class-2', name: item.id === 'football' ? '舞台表现·周日上午班' : '声乐启蒙·周日上午班', time: '11.08 起 · 每周日 10:00–11:00', remaining: 0, full: true },
    { id: 'class-3', name: item.id === 'football' ? '舞台表现·周六提高班' : '声乐启蒙·周六提高班', time: '11.07 起 · 每周六 10:30–12:00', information: ['王老师'], remaining: 8, full: false },
    { id: 'class-4', name: item.id === 'football' ? '舞台表现·周日下午班' : '声乐启蒙·周日下午班', time: '11.08 起 · 每周日 14:00–15:30', full: false },
  ];
  const [specification, setSpecification] = useState(initial?.specification && options.includes(initial.specification) ? initial.specification : options.length === 1 ? options[0] : '');
  const [classId, setClassId] = useState(initial?.classes?.[0]?.classId ?? initial?.classId ?? '');
  const [classIds, setClassIds] = useState<string[]>(initial?.classes?.map(value => value.classId) ?? (initial?.classId ? [initial.classId] : []));
  const [classSeats, setClassSeats] = useState<Record<string, string>>(Object.fromEntries(initial?.classes?.map(value => [value.classId, value.seat]) ?? (initial?.classId ? [[initial.classId, initial.seat]] : [])));
  const selectedIds = multipleClasses ? classIds : classIds.slice(0, 1);
  const [goods, setGoods] = useState<string[]>(initial?.goods ?? []);
  const [seat, setSeat] = useState(initial?.seat ?? '');
  const [seatDraft, setSeatDraft] = useState(initial?.seat ?? '');
  const [step, setStep] = useState<'specification' | 'seat'>(directSeat ? 'seat' : 'specification');
  const specificationRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLElement>(null);
  const seatRef = useRef<HTMLDivElement>(null);
  const classSeatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (step !== 'seat' || !seatDraft) return;
    const frame = requestAnimationFrame(() => seatRef.current?.querySelector<HTMLButtonElement>(`[data-seat-id="${seatDraft}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
    return () => cancelAnimationFrame(frame);
  }, [step, seatDraft]);
  function invalid(field: 'specification' | 'class' | 'seat') {
    showToast({ message: field === 'specification' ? '请选择规格' : field === 'class' ? '请选择班级' : '请选择座位' });
    requestAnimationFrame(() => {
      const root = field === 'specification' ? specificationRef.current : field === 'seat' ? (step === 'seat' ? seatRef.current : classItem ? classSeatRef.current : classRef.current) : classRef.current;
      root?.scrollIntoView({ block: 'nearest' });
      const selector = field === 'seat' && step !== 'seat' && !classItem ? '.parent-class-seat button' : 'button:not(:disabled)';
      root?.querySelector<HTMLButtonElement>(selector)?.focus({ preventScroll: true });
    });
  }
  const currentClass = classes.find(value => value.id === classId);
  const seatLayout = item.seatLayout ?? compactSeatLayout;
  const available = seatLayout.available;
  function commitSeat() {
    if (!seatDraft) { invalid('seat'); return; }

    if (directSeat) onConfirm({ specification, classId: item.id, className: item.name, seat: seatDraft, price: item.price });
    else { if (classItem) setSeat(seatDraft); else setClassSeats(current => ({ ...current, [classId]: seatDraft })); setStep('specification'); }
  }
  function confirm() {
    if (!specification) { invalid('specification'); return; }
    if (classItem) {
      if (!seat) { invalid('seat'); return; }
      onConfirm({ specification, classId: item.id, className: item.name, seat, goods, price: item.price });
      return;
    }
    const selectedClasses = selectedIds.map(id => classes.find(value => value.id === id)).filter(value => value != null);
    if (!selectedClasses.length) { invalid('class'); return; }
    const missingSeat = item.requiresSeat && selectedClasses.find(value => !classSeats[value.id]);
    if (missingSeat) {
      showToast({ message: multipleClasses ? `请为“${missingSeat.name}”选择座位` : '请选择座位' });
      requestAnimationFrame(() => classRef.current?.querySelector<HTMLButtonElement>(`[data-class-id="${missingSeat.id}"] .parent-class-seat button`)?.focus());
      return;
    }
    const choices = selectedClasses.map(value => ({ classId: value.id, className: value.name, seat: item.requiresSeat ? classSeats[value.id] : '' }));
    onConfirm({ specification, ...choices[0], ...(multipleClasses ? { classes: choices } : {}), goods, price: item.price });
  }
  const seating = step === 'seat';
  return <BottomSheet className={`parent-bundle-sheet${seating ? ' parent-bundle-sheet--seating' : ''}`} mode={seating ? 'editor' : 'selection'} title={seating ? '选择座位' : '选择规格参数'} open
    header={!seating ? <>
      <div className="sheet-handle" aria-hidden="true" />
      <div className="parent-specification-header">
        <div className="parent-specification-image" role="img" aria-label={item.coverUrl ? `${item.name}课程图片` : `${item.name}课程图片，4比3，待提供`}>
          {item.coverUrl ? <img src={item.coverUrl} alt="" /> : <><Icon name="image" size="lg" /><span>图片待提供</span></>}
        </div>
        <div className="parent-specification-heading"><h3>{item.name}</h3>{item.price != null && <p>¥ {formatCourseAmount(item.price)}</p>}</div>
        <Button variant="text" iconOnly icon="close" className="parent-specification-close" aria-label="关闭弹层" onClick={onClose} />
      </div>
    </> : undefined}
    onOpenChange={open => { if (!open) onClose(); }}
    onBack={seating && !directSeat ? () => setStep('specification') : undefined}
    footer={<SheetActions primary={{ label: '确定', onClick: seating ? commitSeat : confirm }} />}>
    {seating ? <div className="parent-seat-content">
      <p className="parent-selection-course">{classItem ? item.name : currentClass?.name}</p>
      <p className="parent-seat-room">教室：{item.roomName ?? (classItem ? '星光校区·201合唱教室' : item.id === 'football' ? '星光校区·302多功能教室' : '星光校区·203声乐教室')}</p>
      <SeatViewport viewportRef={seatRef} label={`座位图，${seatLayout.rows}排${seatLayout.columns}列`}>
        <div className="parent-seat-canvas" style={{ minWidth: `${24 + seatLayout.columns * 48}px` }}>
          <div className="parent-seat-stage">讲台</div>
          <div className="parent-seat-grid">
            {Array.from({ length: seatLayout.rows }, (_, row) => <div className="parent-seat-row" key={row} style={{ gridTemplateColumns: `16px repeat(${seatLayout.columns}, minmax(40px, 1fr))` }}>
              <span className="parent-seat-row-number">{row + 1}</span>
              {Array.from({ length: seatLayout.columns }, (_, column) => {
                const id = `${row + 1}-${column + 1}`;
                return <Button key={id} data-seat-id={id} variant="text" className="parent-seat" disabled={!available.includes(id)} aria-label={`${row + 1}排${column + 1}座`} aria-pressed={seatDraft === id} onClick={() => { setSeatDraft(seatDraft === id ? '' : id); }}><Icon name="frame" size="lg" />{seatDraft === id && <span className="parent-seat-number" aria-hidden="true">{id}</span>}</Button>;
              })}
            </div>)}
          </div>
        </div>
      </SeatViewport>
      <span className="sr-only" aria-live="polite">{seatDraft ? `已选：${seatDraft.split('-')[0]}排${seatDraft.split('-')[1]}座` : ''}</span>
      <div className="parent-seat-legend"><span><Icon name="frame" size="base" />可选</span><span><Icon name="frame" size="base" className="is-selected" />当前选中</span><span><Icon name="frame" size="base" className="is-unavailable" />不可选</span></div>
    </div> : <>
      <div ref={specificationRef}><SheetChoiceGroup label="规格（必选）" options={options.map(value => ({ value, label: value }))} value={specification ? [specification] : []} onToggle={value => { setSpecification(value); setClassId(''); setClassIds([]); setClassSeats({}); setSeat(''); }} /></div>
      {classItem && <div ref={classSeatRef} className="parent-class-seat-entry">
        <SheetChoiceGroup label="座位（必选）" options={[{ value: 'seat', label: seat ? `${seat.split('-')[0]}排${seat.split('-')[1]}座` : '选座位' }]} value={seat ? ['seat'] : []} onToggle={() => {
          if (!specification) { invalid('specification'); return; }
          setSeatDraft(seat); setStep('seat');
        }} />
      </div>}
      {!classItem && <section ref={classRef} className="parent-class-section" aria-label="选择班级">
        <h3>选择班级 <span>{multipleClasses ? '可多选' : '必选'}</span></h3>
        {classes.map(value => <div key={value.id} data-class-id={value.id} className={`parent-class-card ${selectedIds.includes(value.id) ? 'is-selected' : ''}`}>
          <Button variant="text" className="parent-class-choice" disabled={value.full || !specification} aria-pressed={selectedIds.includes(value.id)} onClick={() => {
            if (multipleClasses) {
              setClassIds(current => current.includes(value.id) ? current.filter(id => id !== value.id) : [...current, value.id]);
              setClassSeats(current => { const next = { ...current }; delete next[value.id]; return next; });
            } else if (selectedIds[0] !== value.id || classIds.length > 1) { setClassIds([value.id]); setClassSeats({}); }
          }}>
            <span className="parent-class-heading"><span className="parent-class-name"><strong>{value.name}</strong>{value.full && <em>已满</em>}</span>{showRemainingSeats && value.remaining != null && <span className="parent-class-quota">剩余 {value.remaining} 席</span>}</span>
            <span className="parent-class-information">{[value.time, ...(value.information ?? [])].join(' · ')}</span>
          </Button>
          {selectedIds.includes(value.id) && item.requiresSeat && <div className="parent-class-seat"><span className={classSeats[value.id] ? 'parent-class-seat-value' : 'parent-class-seat-placeholder'}>{classSeats[value.id] ? `座位 ${classSeats[value.id].split('-')[0]}排${classSeats[value.id].split('-')[1]}座` : '未选择座位'}</span><Button size="sm" variant="outline" className="touch-target" onClick={() => { setClassId(value.id); setSeatDraft(classSeats[value.id] ?? ''); setStep('seat'); }}>{classSeats[value.id] ? '修改' : '选择座位'}</Button></div>}
        </div>)}
      </section>}
      {item.goodsOptions && <section className="parent-goods-section">
        <SheetChoiceGroup label="物品（可多选）" options={item.goodsOptions.map(option => ({ value: option.id, label: `${option.name} ¥${formatCourseAmount(option.price)}` }))} value={goods} onToggle={value => setGoods(current => current.includes(value) ? current.filter(id => id !== value) : [...current, value])} />
      </section>}
    </>}
  </BottomSheet>;
}
