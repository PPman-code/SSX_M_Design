import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../../components/ui/Button';
import { Icon, type IconName } from '../../../components/ui/Icon';

// Local attachment presentation; MIME and extension cover browser/file-picker differences.
function fileIcon(file: File): IconName {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['doc', 'docx'].includes(ext) || /word|wordprocessingml/.test(file.type)) return 'word';
  if (['xls', 'xlsx', 'xlsm', 'csv'].includes(ext) || /excel|spreadsheetml|csv/.test(file.type)) return 'excel';
  if (['ppt', 'pptx'].includes(ext) || /powerpoint|presentationml/.test(file.type)) return 'ppt';
  if (ext === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (ext === 'txt' || file.type === 'text/plain') return 'txt';
  if (file.type.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext)) return 'shipin1';
  if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) return 'yuyin';
  return 'wenjian1';
}

/** Shared content area. Files are local previews; no upload service is connected. */
export function CommunicationContentField({ value, onChange, invalid, aiRecord, readOnly = false }: { value: string; onChange: (value: string) => void; invalid: boolean; readOnly?: boolean; aiRecord?: { title: string; onView: () => void; disabled?: boolean } }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const urls = useRef(new Set<string>());
  const [previews, setPreviews] = useState<{ id: string; name: string; image?: string; icon: IconName; progress: number }[]>([]);
  useEffect(() => { const allocated = urls.current; return () => { allocated.forEach(url => URL.revokeObjectURL(url)); }; }, []);
  const adding = previews.some(item => item.progress < 100);
  useEffect(() => {
    if (!adding) return;
    // Visual upload simulation only; file bytes never leave this browser.
    const timer = window.setInterval(() => setPreviews(current => current.map(item => item.progress < 100 ? { ...item, progress: Math.min(100, item.progress + 12) } : item)), 180);
    return () => window.clearInterval(timer);
  }, [adding]);
  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const additions = Array.from(event.target.files ?? []).map(file => {
      const id = URL.createObjectURL(file);
      urls.current.add(id);
      return { id, name: file.name, icon: fileIcon(file), image: file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|bmp|svg|heic)$/i.test(file.name) ? id : undefined, progress: 0 };
    });
    setPreviews(current => [...current, ...additions]);
    event.target.value = '';
  }
  function removePreview(id: string) {
    URL.revokeObjectURL(id); urls.current.delete(id);
    setPreviews(current => current.filter(item => item.id !== id));
  }
  const count = Array.from(value).length;
  return <section className="ai-content-field">
    <div className="ai-content-heading"><label htmlFor="communication-content">沟通内容 <span aria-hidden="true">*</span></label><div className="ai-content-tools">
      <span className="ai-content-tool">选择聊天记录</span><span className="ai-content-tool">选择模板</span><span className="ai-content-tool ai-content-tool--ai"><Icon name="sparkling-2-fill" size="sm" />AI识别</span>
    </div></div>
    <div className="ai-content-input"><textarea readOnly={readOnly} aria-label="沟通内容" id="communication-content" aria-required="true" aria-invalid={invalid} value={value} onChange={event => onChange(event.target.value)} placeholder="请输入沟通内容（必填，限1000字）" rows={4} />
    <p className={`ai-content-counter ${count > 1000 ? 'ai-error' : 'ai-muted'}`}>{count} / 1000</p></div>
    <div className="ai-content-attachments">
      {previews.map(item => <div className="ai-content-preview" key={item.id}>
        {item.image ? <img src={item.image} alt={item.name} /> : <><Icon name={item.icon} size="lg" /><span title={item.name}>{item.name}</span></>}
        {item.progress < 100 && <div className="ai-content-upload-mask" role="progressbar" aria-label={`正在添加${item.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}><span>{item.progress}%</span></div>}
        <Button disabled={readOnly} className="ai-content-remove" variant="ghost" icon="close-circle-fill" iconOnly aria-label={`移除${item.name}`} onClick={() => removePreview(item.id)} />
      </div>)}
      <Button disabled={readOnly} className="ai-content-add" variant="secondary" onClick={() => fileInput.current?.click()}><Icon name="plus" size="lg" />添加附件</Button>
    </div>
    <input ref={fileInput} className="ai-content-file-input" type="file" multiple aria-label="选择附件文件" onChange={event => addFiles(event)} />
    {aiRecord && <Button disabled={aiRecord.disabled} className="ai-original-attachment" variant="secondary" onClick={aiRecord.onView} aria-label={`查看 AI 原始记录：${aiRecord.title}`}><span className="ai-original-icon"><Icon name="a-ailuyinzhuanxiesvg" size="lg" /></span><span className="ai-original-info"><strong>{aiRecord.title}</strong><span>AI 原始记录 · 录音与完整转写</span></span><Icon name="right" size="sm" /></Button>}
  </section>;
}
