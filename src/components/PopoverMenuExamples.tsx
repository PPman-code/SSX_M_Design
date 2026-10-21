import { useState } from 'react';
import { Button } from './ui/Button';
import { PopoverMenu, type PopoverMenuAction } from './ui/PopoverMenu';
import type { PopoverPlacement } from './ui/Popover';

export function PopoverMenuExamples() {
  const [result, setResult] = useState('尚未操作');
  const actions: PopoverMenuAction[] = ['发起群聊', '扫一扫', '帮助中心'].map(label => ({ key: label, label, onSelect: () => setResult(label) }));
  const icons: PopoverMenuAction[] = actions.map((action, index) => ({ ...action, icon: (['chat-1-line', 'qr-scan-2-line', 'question-circle'] as const)[index] }));
  const messages: PopoverMenuAction[] = [icons[0], { key: 'disabled', label: '暂不可用', icon: 'qr-scan-2-line', disabled: true }, { key: 'message', label: '消息中心', icon: 'notification', dot: true, onSelect: () => setResult('消息中心') }, icons[2]];
  const placements: { label: string; value: PopoverPlacement }[] = [{ label: '上左', value: 'top-start' }, { label: '上方', value: 'top' }, { label: '上右', value: 'top-end' }, { label: '下左', value: 'bottom-start' }, { label: '下方', value: 'bottom' }, { label: '下右', value: 'bottom-end' }];
  return <section className="demo-section" aria-labelledby="popover-menu-demo-title">
    <div className="section-heading"><h2 id="popover-menu-demo-title">气泡菜单</h2><span>深 / 浅 · 图标 · 红点</span></div>
    <div className="demo-card stack">
      <div className="popover-example-grid">
        <PopoverMenu label="深色操作菜单" actions={actions.slice(0, 2)} trigger={<Button variant="soft">深色菜单</Button>} />
        <PopoverMenu label="浅色操作菜单" appearance="light" actions={actions} trigger={<Button variant="soft">浅色菜单</Button>} />
        <PopoverMenu label="图标操作菜单" appearance="light" actions={icons} trigger={<Button variant="soft">带图标菜单</Button>} />
        <PopoverMenu label="深色图标操作菜单" actions={icons} trigger={<Button variant="soft">深色图标菜单</Button>} />
        <PopoverMenu label="浅色消息菜单" appearance="light" actions={messages} trigger={<Button variant="soft">浅色状态菜单</Button>} />
        <PopoverMenu label="消息操作菜单" actions={messages} trigger={<Button variant="soft">红点与禁用菜单</Button>} />
      </div>
      <div className="popover-example-grid">{placements.map(item => <PopoverMenu key={item.value} label={`${item.label}菜单`} placement={item.value} actions={actions.slice(0, 2)} trigger={<Button variant="soft" size="sm">{item.label}菜单</Button>} />)}</div>
      <p className="sheet-demo-caption" role="status">菜单结果：{result}</p>
    </div>
  </section>;
}
