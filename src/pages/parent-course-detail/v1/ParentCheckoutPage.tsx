import { useRef, useState, type RefObject } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { Dialog } from '../../../components/ui/Dialog';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { MobilePage } from '../../../components/ui/MobilePage';
import { SheetActions } from '../../../components/ui/SheetContent';
import { Tag } from '../../../components/ui/Tag';
import { useToast } from '../../../components/ui/useToast';
import { mockStudentPortraits } from '../../../mocks/student-avatars';
import { BundleItemName } from './BundleItemName';
import { bundleItems, courseDetail, exampleBundleSelections, formatBundleGood, getSelectedBundleGoods, getBundleItemPrices, getPackagePrices, type BundleSelection } from './course-data';
import './parent-checkout.css';

export type CheckoutSelection = { items: Record<string, BundleSelection>; multipleClasses: boolean };

const exampleSelection: CheckoutSelection = { items: exampleBundleSelections, multipleClasses: false };
const checkoutStudent = { name: '林小禾', avatar: mockStudentPortraits[0].avatar };
const exampleUnavailableCoupons = [
  { name: '校区专享券', discount: 100, reason: '仅限新城校区使用' },
  { name: '单课优惠券', discount: 50, reason: '仅适用于单课购买' },
];

type Address = { name: string; phone: string; street: string };
const exampleAddress: Address = { name: '林老师', phone: '13800000000', street: '星光市青禾路 18 号 2 栋 301 室' };
const addressFields = [
  { key: 'name', label: '收货人', autoComplete: 'shipping name' },
  { key: 'phone', label: '联系电话', autoComplete: 'shipping tel' },
  { key: 'street', label: '详细地址', autoComplete: 'shipping street-address' },
] as const;

const amountFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (amount: number) => `¥${amountFormat.format(amount)}`;

function seatLabel(seat: string) {
  const [row, column] = seat.split('-');
  return seat ? `${row}排${column}座` : '';
}

function AddressEditor({ address, onClose, onSave, trigger }: {
  address: Address; onClose: () => void; onSave: (value: Address) => void; trigger: RefObject<HTMLButtonElement | null>;
}) {
  const [draft, setDraft] = useState(address);
  const [submitted, setSubmitted] = useState(false);
  const [discard, setDiscard] = useState(false);
  function save() {
    setSubmitted(true);
    if (addressFields.some(({ key }) => !draft[key].trim())) return;
    onSave({ name: draft.name.trim(), phone: draft.phone.trim(), street: draft.street.trim() });
  }
  function requestClose() {
    if (addressFields.some(({ key }) => draft[key] !== address[key])) setDiscard(true);
    else onClose();
  }
  return <>
    <BottomSheet mode="editor" title="编辑收货地址" open onOpenChange={open => { if (!open) onClose(); }} onCloseRequest={requestClose} finalFocus={trigger}
      footer={<SheetActions primary={{ label: '保存', onClick: save }} />}>
      {addressFields.map(({ key, label, autoComplete }) => {
        const empty = submitted && !draft[key].trim();
        return <Input key={key} label={label} autoComplete={autoComplete} type={key === 'phone' ? 'tel' : 'text'} multiline={key === 'street'} required
          value={draft[key]} onValueChange={value => setDraft(previous => ({ ...previous, [key]: value }))}
          status={empty ? 'error' : 'default'} description={empty ? `请输入${label}` : undefined} />;
      })}
    </BottomSheet>
    <Dialog stacked open={discard} onOpenChange={setDiscard} title="放弃本次修改？" actions={[{ label: '继续编辑' }, { label: '放弃修改', danger: true, onSelect: onClose }]}>
      <p>关闭后将保留原收货地址。</p>
    </Dialog>
  </>;
}

export function ParentCheckoutPage({ checkout, previewChrome }: {
  checkout?: CheckoutSelection; previewChrome: boolean;
}) {
  const { showToast } = useToast();
  const [address, setAddress] = useState(exampleAddress);
  const [editingAddress, setEditingAddress] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [note, setNote] = useState('');
  const editAddressRef = useRef<HTMLButtonElement>(null);
  const couponRef = useRef<HTMLButtonElement>(null);
  const selection = checkout ?? exampleSelection;
  const { saleCents, originalCents } = getPackagePrices(selection.items);
  const walletCents = Math.min(saleCents, 120_000);
  const amountDue = money((saleCents - walletCents) / 100);
  const packagePrice = money(saleCents / 100);
  const items = bundleItems.map(item => {
    const choice = selection.items[item.id];
    const classes = choice.classes?.length
      ? (selection.multipleClasses ? choice.classes : choice.classes.slice(0, 1))
      : [{ classId: choice.classId, className: item.kinds.includes('class') ? '' : choice.className, seat: choice.seat }];
    const goods = getSelectedBundleGoods(item, choice.goods);
    const prices = getBundleItemPrices(item, choice.specification, choice.goods);
    return { item, specification: choice.specification, saleCents: prices.saleCents, classes, goods };
  });
  const hasGoods = items.some(item => item.goods.length > 0);

  return <MobilePage title="填写订单" previewChrome={previewChrome} className="parent-checkout-page" footer={
    <footer className="parent-checkout-footer" role="region" aria-label="订单支付">
      <div className="parent-checkout-payable"><span>需支付</span><strong>{amountDue}</strong></div>
      <Button onClick={() => showToast({ message: '当前为结算预览，未发起支付' })}>立即支付</Button>
    </footer>
  }>
    <h1 className="sr-only">填写订单</h1>
    {!checkout && <p className="parent-checkout-example"><Tag size="sm" tone="brand">示例订单</Tag><span>用于预览结算信息和交互</span></p>}
    <CellGroup label="使用学员">
      <Cell
        label={checkoutStudent.name}
        leading={<img className="parent-checkout-student-avatar" src={checkoutStudent.avatar} alt="" />}
        control={<Button className="parent-checkout-student-switch" variant="ghost" iconOnly icon="swap" disabled aria-label="切换学员" />}
      />
    </CellGroup>

    <section className="parent-checkout-card" aria-labelledby="parent-checkout-package">
      <p className="parent-checkout-campus">校区 · 星光校区</p>
      <div className="parent-checkout-package">
        <img src={courseDetail.coverUrl} alt="" />
        <div>
          <h2 id="parent-checkout-package" className="parent-checkout-package-title">
            <Tag size="sm" tone="brand" aria-hidden="true">套餐</Tag>
            {courseDetail.name}
          </h2>
          <p className="parent-checkout-package-meta">
            <strong>{packagePrice}</strong>
            <del>{money(originalCents / 100)}</del>
            <span>共 {items.length} 个项目</span>
          </p>
        </div>
      </div>
      <ul className="parent-checkout-items" role="list" aria-label="套餐明细">
        {items.map(({ item, specification, saleCents, classes, goods }) => (
          <li key={item.id}>
            <div className="parent-checkout-item-heading">
              <h3><BundleItemName item={{ name: item.name, kinds: item.kinds.filter(kind => kind !== 'goods') }} /></h3>
              <span className="parent-checkout-item-price">{money(saleCents / 100)}</span>
            </div>
            <div className="parent-bundle-details">
              {classes.map(value => value.className && <span key={value.classId} className="parent-bundle-class-line">
                <span className="parent-bundle-detail-label">班级</span>
                <span>{value.className}{classes.length > 1 && value.seat && ` · 座位 ${seatLabel(value.seat)}`}</span>
              </span>)}
              <span className="parent-bundle-summary-line">
                <span><span className="parent-bundle-detail-label">规格</span>{specification}</span>
                {classes.length === 1 && classes[0].seat && <span><span className="parent-bundle-detail-label">座位</span>{seatLabel(classes[0].seat)}</span>}
              </span>
              {goods.length > 0 && <span className="parent-bundle-goods-summary">
                <span className="parent-bundle-detail-label">物品</span><span>{goods.map(formatBundleGood).join('、')}</span>
              </span>}
            </div>
          </li>
        ))}
      </ul>
    </section>

    <section className="parent-checkout-card" aria-labelledby="parent-checkout-amounts">
      <h2 id="parent-checkout-amounts">费用明细</h2>
      <dl className="parent-checkout-amounts">
        <div><dt>商品金额</dt><dd>{packagePrice}</dd></div>
        <div>
          <dt className="sr-only">优惠券</dt>
          <dd className="parent-checkout-coupon">
            <Button ref={couponRef} variant="ghost" className="parent-checkout-coupon-trigger" aria-label="优惠券，暂无可用" aria-haspopup="dialog" onClick={() => setShowCoupons(true)}>
              <span aria-hidden="true">优惠券</span>
              <span className="parent-checkout-coupon-value" aria-hidden="true">暂无可用<Icon name="right" size="md" /></span>
            </Button>
          </dd>
        </div>
        <div><dt>电子钱包抵扣</dt><dd>−{money(walletCents / 100)}</dd></div>
      </dl>
    </section>

    {hasGoods && <section className="parent-checkout-card" aria-labelledby="parent-checkout-delivery">
      <div className="parent-checkout-card-heading"><h2 id="parent-checkout-delivery">收货地址</h2><span>快递配送</span></div>
      <div className="parent-checkout-address">
        <Icon name="location" size="md" className="parent-checkout-address-location" />
        <div><p className="parent-checkout-address-street">{address.street}</p><p className="parent-checkout-muted">{address.name} · {address.phone}</p></div>
        <Button ref={editAddressRef} variant="ghost" iconOnly icon="pen" aria-label="编辑地址" onClick={() => setEditingAddress(true)} />
      </div>
    </section>}

    <CellGroup><Input label="备注" optional placeholder="请输入备注" value={note} onValueChange={setNote} /></CellGroup>
    <BottomSheet title="优惠券" description="当前订单暂无可用优惠券" open={showCoupons} onOpenChange={setShowCoupons} finalFocus={couponRef}>
      <h3 className="parent-checkout-coupons-title">不可用优惠券（{exampleUnavailableCoupons.length}）</h3>
      <ul className="parent-checkout-coupons" role="list">
        {exampleUnavailableCoupons.map(coupon => <li key={coupon.name}>
          <div>
            <p>{coupon.name}</p>
            <p className="parent-checkout-coupon-reason">{coupon.reason}</p>
          </div>
          <span>减 ¥{coupon.discount}</span>
        </li>)}
      </ul>
    </BottomSheet>
    {editingAddress && <AddressEditor address={address} trigger={editAddressRef} onClose={() => setEditingAddress(false)} onSave={value => { setAddress(value); setEditingAddress(false); }} />}
  </MobilePage>;
}
