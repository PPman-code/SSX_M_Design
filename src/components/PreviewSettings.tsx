interface Props {
  width: number;
  onWidthChange: (width: number) => void;
}

export function PreviewSettings({ width, onWidthChange }: Props) {
  return <div className="preview-settings" role="group" aria-label="通用预览设置">
    <div className="width-selector" role="group" aria-label="预览宽度">{[360, 375, 390, 430].map((value) => <button type="button" key={value} aria-pressed={width === value} onClick={() => onWidthChange(value)}>{value}</button>)}<span>px</span></div>
  </div>;
}
