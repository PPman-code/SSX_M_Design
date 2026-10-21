import { useState } from 'react';
import { Checkbox, CheckboxGroup } from './ui/Checkbox';

export function CheckboxExamples() {
  const [basic, setBasic] = useState(['a', 'b']);
  const [all, setAll] = useState(['a']);
  const [styles, setStyles] = useState(['circle', 'square', 'check', 'right']);
  const [horizontal, setHorizontal] = useState(['a']);
  const [cards, setCards] = useState(['a']);
  const [rowCards, setRowCards] = useState(['a']);
  const [icon, setIcon] = useState(false);
  return <section aria-labelledby="checkboxes-title" className="demo-section checkbox-examples">
    <div className="section-heading"><h2 id="checkboxes-title">多选 Checkbox</h2><span>20px · 40px 热区</span></div>
    <h3>垂直多选</h3>
    <CheckboxGroup label="基础多选" value={basic} onChange={setBasic}>
      <Checkbox label="基础选项一" value="a" /><Checkbox label="基础选项二" value="b" />
      <Checkbox label="带说明的选项" description="说明用于补充选项信息，点击整行均可选择。" value="c" />
      <Checkbox label="长文字选项会自然换行，标记与首行文字顶部对齐，不截断内容" value="d" />
    </CheckboxGroup>
    <h3>全选与半选</h3>
    <CheckboxGroup label="带全选多选" value={all} onChange={setAll} allValues={['a', 'b', 'c']}>
      <Checkbox label="全选" parent />
      {['选项一', '选项二', '选项三'].map((label, index) => <Checkbox key={label} value={['a', 'b', 'c'][index]} label={label} />)}
    </CheckboxGroup>
    <h3>横向多选</h3>
    <CheckboxGroup label="横向多选" layout="horizontal" value={horizontal} onChange={setHorizontal}>{['语文', '数学', '英语'].map((label, index) => <Checkbox key={label} label={label} value={['a', 'b', 'c'][index]} />)}</CheckboxGroup>
    <h3>标记样式与位置</h3>
    <CheckboxGroup label="多选样式" value={styles} onChange={setStyles}>
      <Checkbox label="圆形勾选" value="circle" /><Checkbox label="方形勾选" value="square" variant="square" /><Checkbox label="纯勾样式" value="check" variant="check" />
      <Checkbox label="右侧勾选" value="right" placement="right" /><Checkbox label="右侧纯勾" value="right-check" placement="right" variant="check" />
    </CheckboxGroup>
    <h3>禁用与只读</h3>
    <CheckboxGroup label="多选不可操作状态" value={[]}>
      <Checkbox label="禁用未选中" checked={false} disabled /><Checkbox label="禁用已选中" checked disabled /><Checkbox label="禁用半选" indeterminate disabled /><Checkbox label="只读已选中" checked readOnly />
    </CheckboxGroup>
    <div className="checkbox-icon-demo"><Checkbox label="独立多选标记" checked={icon} onChange={setIcon} hideLabel /><span>独立标记 · 20px 占位 / 40px 热区</span></div>
    <h3>垂直卡片多选</h3>
    <CheckboxGroup label="垂直卡片多选" layout="cards" value={cards} onChange={setCards}>
      <Checkbox label="卡片选项一" description="补充说明，选中后显示边框与左上角标记。" variant="card" value="a" />
      <Checkbox label="卡片选项二" description="多张卡片可以同时选择。" variant="card" value="b" />
    </CheckboxGroup>
    <h3>横向卡片多选</h3>
    <CheckboxGroup label="横向卡片多选" layout="card-row" value={rowCards} onChange={setRowCards}>{['选项甲', '选项乙', '选项丙'].map((label, index) => <Checkbox key={label} label={label} value={['a', 'b', 'c'][index]} variant="card" />)}</CheckboxGroup>
  </section>;
}
