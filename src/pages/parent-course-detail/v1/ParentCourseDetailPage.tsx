import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MobilePage } from '../../../components/ui/MobilePage';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Badge } from '../../../components/ui/Badge';
import { BundleSelectionSheet, type BundleSelection } from './BundleSelectionSheet';
import { useToast } from '../../../components/ui/useToast';
import { courseDetail, bundleItems, formatCourseAmount, hasDirectSeatEntry, type BundleItem, type BundleKind } from './course-data';
import './parent-course-detail.css';

const bundleKinds: Record<BundleKind, { icon: 'xuanke1' | 'xuanban1' | 'xuanwu'; label: string }> = {
  course: { icon: 'xuanke1', label: '课程' },
  class: { icon: 'xuanban1', label: '班级' },
  goods: { icon: 'xuanwu', label: '物品' },
};

export function ParentCourseDetailPage() {
  const [params] = useSearchParams();
  const { showToast } = useToast();
  const multipleClasses = params.get('classMultiple') === 'enabled';
  const showRemainingSeats = params.get('remainingSeats') !== 'hidden';
  const [favorite, setFavorite] = useState(false);
  const [item, setItem] = useState<BundleItem | null>(null);
  const [selected, setSelected] = useState<Record<string, BundleSelection>>({});
  const [purchaseReady, setPurchaseReady] = useState(false);
  function openSpecification(bundle: BundleItem) { setPurchaseReady(false); setItem(bundle); }
  function buyPackage() {
    const incomplete = bundleItems.find(bundle => {
      const choice = selected[bundle.id];
      return !choice || !choice.specification || (bundle.requiresSeat && (choice.classes?.length ? (multipleClasses ? choice.classes : choice.classes.slice(0, 1)).some(value => !value.seat) : !choice.seat)) || (!bundle.kinds.includes('class') && !choice.classId);
    });
    if (incomplete) {
      showToast({ message: `请先为“${incomplete.name}”${hasDirectSeatEntry(incomplete) ? '选座位' : '选规格'}` });
      setItem(incomplete);
      return;
    }
    setPurchaseReady(true);
  }
  function toggleFavorite() { setFavorite(current => !current); showToast({ message: favorite ? '已取消收藏' : '已收藏' }); }
  return <MobilePage title="课程详情" className="parent-course-page" previewChrome={params.get('chrome') === 'wechat'} footer={<footer className="parent-course-footer">
    <Button variant="text" className="parent-course-shortcut" onClick={() => showToast({ message: '家长端首页待补充' })}><Icon name="xuexishangcheng" size="md" /><span>首页</span></Button>
    <Button variant="text" className={`parent-course-shortcut ${favorite ? 'is-favorite' : ''}`} aria-pressed={favorite} aria-label={favorite ? '取消收藏' : '收藏'} onClick={toggleFavorite}><Icon name={favorite ? 'shoucangxuanzhong' : 'shoucang'} size="md" /><span>{favorite ? '已收藏' : '收藏'}</span></Button>
    <Button variant="text" className="parent-course-shortcut" aria-label={`购物车，${courseDetail.cartCount}件商品`} onClick={() => showToast({ message: '购物车页面待补充' })}><Badge count={courseDetail.cartCount} label={`购物车${courseDetail.cartCount}件商品`}><Icon name="gouwuche" size="md" /></Badge><span>购物车</span></Button>
    <Button className="parent-course-buy" onClick={buyPackage}>立即购买</Button>
  </footer>}>
    <div className="parent-course-cover" role="img" aria-label={courseDetail.coverUrl ? `${courseDetail.name}课程封面` : '课程封面占位，比例4比3，图片待提供'}>
      {courseDetail.coverUrl ? <img src={courseDetail.coverUrl} alt="" /> : <div className="parent-course-cover-placeholder"><Icon name="image" size="lg" /><span>课程封面待提供</span><small>4:3</small></div>}
    </div>
    <section className="parent-course-intro" aria-label="课程信息">
      <h1>{courseDetail.name}</h1>
      <div className="parent-course-pricing">
        <p className="parent-course-price"><span>¥</span>{formatCourseAmount(courseDetail.price)}</p>
        <p className="parent-course-original"><del>¥ {formatCourseAmount(courseDetail.originalPrice)}</del></p>
      </div>
    </section>
    <section className="parent-course-bundle" aria-labelledby="parent-bundle-title">
      <div className="parent-bundle-heading"><h2 id="parent-bundle-title">套餐内容</h2><span>共{bundleItems.length}个项目</span></div>
      {purchaseReady && <p className="parent-purchase-status" role="status">购买流程待补充，当前为本地演示</p>}
      <div className="parent-bundle-list">{bundleItems.map(bundle => <Button key={bundle.id} variant="text" className="parent-bundle-row" aria-label={`选择${bundle.name}${hasDirectSeatEntry(bundle) ? '座位' : '规格参数'}`} onClick={() => openSpecification(bundle)}>
        <span className="parent-bundle-info">
          <span className="parent-bundle-name"><span className="parent-bundle-kind-icons">{bundle.kinds.map(kind => <Icon key={kind} name={bundleKinds[kind].icon} size="md" label={bundleKinds[kind].label} />)}</span><span>{bundle.name}</span></span>
          {selected[bundle.id] && <span className="parent-bundle-details">
            {!bundle.kinds.includes('class') && (selected[bundle.id].classes?.length ? (multipleClasses ? selected[bundle.id].classes! : selected[bundle.id].classes!.slice(0, 1)).map(value => <span key={value.classId} className="parent-bundle-class-line"><span className="parent-bundle-detail-label">班级</span>{value.className}{value.seat && <span> · 座位 {value.seat}</span>}</span>) : <span className="parent-bundle-class-line"><span className="parent-bundle-detail-label">班级</span>{selected[bundle.id].className}</span>)}
            <span className="parent-bundle-summary-line">
              {selected[bundle.id].specification && <span><span className="parent-bundle-detail-label">规格</span>{selected[bundle.id].specification}</span>}
              {bundle.requiresSeat && !selected[bundle.id].classes?.length && <span><span className="parent-bundle-detail-label">座位</span>{selected[bundle.id].seat}</span>}
              {selected[bundle.id].price != null && <span className="parent-bundle-price">¥{formatCourseAmount(selected[bundle.id].price ?? 0)}</span>}
            </span>
            {!!selected[bundle.id].goods?.length && <span className="parent-bundle-goods-summary"><span className="parent-bundle-detail-label">物品</span><span>{bundle.goodsOptions?.filter(option => selected[bundle.id].goods?.includes(option.id)).map(option => `${option.name} ¥${formatCourseAmount(option.price)}`).join('、')}</span></span>}
          </span>}

        </span>
        <span className={`parent-bundle-select ${selected[bundle.id] ? 'is-selected' : !hasDirectSeatEntry(bundle) ? 'is-specification' : ''}`}>
          <span>{selected[bundle.id] ? '修改' : <span className="parent-bundle-placeholder">{hasDirectSeatEntry(bundle) ? '选座位' : '选规格'}</span>}</span><Icon name="right" size="sm" />
        </span>
      </Button>)}</div>
    </section>
    {item && <BundleSelectionSheet key={item.id} multipleClasses={multipleClasses} showRemainingSeats={showRemainingSeats} item={item} initial={selected[item.id]} onClose={() => setItem(null)} onConfirm={selection => { setSelected(current => ({ ...current, [item.id]: selection })); setItem(null); }} />}
  </MobilePage>;
}
