import { Button } from './ui/Button';
import { useToast } from './ui/useToast';

export function ToastExamples() {
  const { showToast, closeToast } = useToast();
  return <section aria-labelledby="toast-title" className="demo-section toast-demo">
    <div className="section-heading"><h2 id="toast-title">轻提示 Toast</h2><span>文字 · 横向 · 纵向</span></div>
    <h3>文字提示</h3>
    <div className="demo-card toast-examples">
      <Button variant="soft" onClick={() => showToast({ message: '这是一条轻提示' })}>文字提示</Button>
      <Button variant="soft" onClick={() => showToast({ message: '轻提示用于简短反馈，较长内容自动换行，建议控制在三行以内。' })}>长文字提示</Button>
    </div>
    <h3>横向图标 · 24px</h3>
    <div className="demo-card toast-examples">
      <Button variant="soft" onClick={() => showToast({ type: 'success', message: '操作成功', layout: 'horizontal' })}>横向成功提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'error', message: '操作失败', layout: 'horizontal' })}>横向失败提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'warning', message: '请完善信息', layout: 'horizontal' })}>横向警告提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'loading', message: '加载中…', layout: 'horizontal' })}>横向加载提示</Button>
      <Button variant="soft" onClick={() => showToast({ icon: 'cloud-download', message: '准备下载', layout: 'horizontal' })}>横向自定义图标</Button>
    </div>
    <h3>纵向图标 · 32px</h3>
    <div className="demo-card toast-examples">
      <Button variant="soft" onClick={() => showToast({ type: 'success', message: '操作成功' })}>成功提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'error', message: '操作失败，请重试' })}>失败提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'warning', message: '请先填写完整信息' })}>警告提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'loading', message: '加载中…' })}>加载提示</Button>
      <Button variant="soft" onClick={() => showToast({ type: 'loading' })}>仅加载图标</Button>
      <Button variant="soft" onClick={() => showToast({ icon: 'cloud-download', message: '准备下载' })}>纵向自定义图标</Button>
    </div>
    <div className="toast-demo-footer"><Button variant="ghost" onClick={closeToast}>关闭提示</Button><p className="toast-example-note">普通提示 2 秒后消失；加载提示由业务主动关闭。再次触发替换当前提示。</p></div>
  </section>;
}
