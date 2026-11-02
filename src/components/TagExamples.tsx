import { Tag, type TagSize, type TagTone, type TagVariant } from './ui/Tag';
import './TagExamples.css';

const sizes: { value: TagSize; label: string }[] = [{ value: 'sm', label: '小 · 18px' }, { value: 'md', label: '中 · 20px' }, { value: 'lg', label: '大 · 24px' }];
const tones: TagTone[] = ['brand', 'success', 'warning', 'danger', 'neutral'];
const variants: { value: TagVariant; label: string }[] = [{ value: 'soft', label: '基本' }, { value: 'solid', label: '实心' }, { value: 'outline', label: '实线描边' }, { value: 'dashed', label: '虚线描边' }];
export function TagExamples() {
  return <section className="demo-section" aria-labelledby="tags-title">
    <div className="section-heading"><h2 id="tags-title">标签 Tag</h2><span>大 / 中 / 小 · 12px常规字重</span></div>
    {sizes.map(size => <div key={size.value} className="demo-card tag-example">
      <h3>{size.label}</h3>
      {variants.map(variant => <div className="tag-example-row" key={variant.value}>
        <span>{variant.label}</span><div className="tag-example-shapes">{[false, true].map(round => <div className="tag-example-colors" key={String(round)}>{tones.map(tone => <Tag key={tone} size={size.value} tone={tone} variant={variant.value} round={round}>Tag</Tag>)}</div>)}</div>
      </div>)}
    </div>)}
  </section>;
}
