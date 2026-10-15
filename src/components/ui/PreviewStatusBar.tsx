/** Decorative system status for the desktop phone-shell preview only. */
export function PreviewStatusBar() {
  const assets = `${import.meta.env.BASE_URL}preview/wechat/`;
  return <div className="component-preview-status" aria-hidden="true">
    <img src={`${assets}time.svg`} width="25.615" height="10.343" alt="" />
    <img src={`${assets}status.svg`} width="66.601" height="24" alt="" />
  </div>;
}
