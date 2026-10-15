import { Button } from './ui/Button';
import { useToast } from './ui/useToast';

export function ToastExamples() {
  const { showToast, closeToast } = useToast();
  return <section aria-labelledby="toast-title" className="demo-section">
    <div className="section-heading"><h2 id="toast-title">轻提示 Toast</h2><span>文字 · 状态 · 加载</span></div>
    <div className="demo-card toast-examples">
      <Button variant="secondary" onClick={() => showToast({ message: '这是一条轻提示' })}>文字提示</Button>
      <Button variant="secondary" onClick={() => showToast({ type: 'success', message: '操作成功' })}>成功提示</Button>
      <Button variant="secondary" onClick={() => showToast({ type: 'error', message: '操作失败，请重试' })}>失败提示</Button>
      <Button variant="secondary" onClick={() => showToast({ type: 'warning', message: '请先填写完整信息' })}>警告提示</Button>
      <Button variant="secondary" onClick={() => showToast({ type: 'loading', message: '加载中…' })}>加载提示</Button>
      <Button variant="secondary" onClick={() => showToast({ type: 'loading' })}>仅加载图标</Button>
      <Button variant="secondary" onClick={() => showToast({ message: '这是一条较长的轻提示，用来检查窄屏下的自然换行与左右边距。' })}>长文字提示</Button>
      <Button variant="ghost" onClick={closeToast}>关闭提示</Button>
      <p className="toast-example-note">普通提示 2 秒后消失；加载提示由业务主动关闭。再次触发替换当前提示。</p>
    </div>
  </section>;
}
