interface Props {
  width: number;
  onWidthChange: (width: number) => void;
  shell: boolean;
  onShellChange: (shell: boolean) => void;
  showChrome: boolean;
  previewChrome: boolean;
  onPreviewChromeChange: (chrome: boolean) => void;
}

export function PreviewSettings({ width, onWidthChange, shell, onShellChange, showChrome, previewChrome, onPreviewChromeChange }: Props) {
  return <div className="preview-settings" role="group" aria-label="通用预览设置">
    <div className="width-selector" role="group" aria-label="预览宽度">{[360, 375, 390, 430].map((value) => <button type="button" key={value} aria-pressed={width === value} onClick={() => onWidthChange(value)}>{value}</button>)}<span>px</span></div>
    <div className="shell-selector" role="group" aria-label="预览外壳"><button type="button" aria-pressed={shell} onClick={() => onShellChange(true)}>手机外壳</button><button type="button" aria-pressed={!shell} onClick={() => onShellChange(false)}>无外壳</button></div>
    {showChrome && <label className="config-checkbox"><input type="checkbox" checked={previewChrome} onChange={(event) => onPreviewChromeChange(event.target.checked)} />微信外观预览</label>}
  </div>;
}
