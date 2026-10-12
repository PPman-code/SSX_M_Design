import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { BottomSheet } from './ui/BottomSheet';

export function PhoneAccess({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [selected, setSelected] = useState('');
  const [qr, setQr] = useState({ url: '', image: '', failed: false });
  useEffect(() => {
    const controller = new AbortController();
    const current = new URL(window.location.href);
    current.hash = '/mobile';
    const fallback = ['localhost', '127.0.0.1', '[::1]'].includes(current.hostname) ? [] : [current.href];
    if (!import.meta.env.DEV) { Promise.resolve().then(() => setUrls(fallback)); return; }
    fetch(`${import.meta.env.BASE_URL}__preview-addresses`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { urls?: string[] }) => setUrls(data.urls?.length ? data.urls.map((url) => `${url}#/mobile`) : fallback))
      .catch(() => { if (!controller.signal.aborted) setUrls(fallback); });
    return () => controller.abort();
  }, []);
  const active = selected || urls?.[0] || '';
  useEffect(() => {
    if (!active) return;
    let current = true;
    QRCode.toDataURL(active, { width: 240, margin: 2, errorCorrectionLevel: 'M' })
      .then((value) => { if (current) setQr({ url: active, image: value, failed: false }); })
      .catch(() => { if (current) setQr({ url: active, image: '', failed: true }); });
    return () => { current = false; };
  }, [active]);
  return <BottomSheet open={open} onOpenChange={onOpenChange} title="在手机上查看" description={import.meta.env.DEV ? '手机和电脑需连接同一 Wi-Fi' : '用手机扫描二维码打开预览'}>
    <div className="phone-access">
      {urls === null ? <p role="status">正在获取预览地址…</p> : active ? <>
        {qr.url === active && qr.image ? <img width="240" height="240" src={qr.image} alt="手机预览二维码" /> : <p role="status">{qr.url === active && qr.failed ? '二维码生成失败，请直接打开下方链接。' : '正在生成二维码…'}</p>}
        {urls.length > 1 && <label className="field">网络地址<select value={active} onChange={(e) => setSelected(e.target.value)}>{urls.map((url) => <option value={url} key={url}>{url}</option>)}</select></label>}
        <a className="preview-url" href={active} target="_blank" rel="noreferrer">{active}</a>
        <p>{import.meta.env.DEV ? '电脑保持运行。修改设计后，手机页面会自动更新；若打不开，请检查 Wi-Fi 隔离或防火墙。' : '打开后即可体验页面；设计更新需等待重新部署。'}</p>
      </> : <p>未检测到局域网地址。请连接 Wi-Fi，并使用 pnpm dev:lan 启动后刷新页面。</p>}
    </div>
  </BottomSheet>;
}
