/** Copy plain text, with a fallback for embedded browsers without Clipboard API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* Try the embedded-browser fallback. */ }
  const previous = document.activeElement;
  const input = document.createElement('textarea');
  input.value = text;
  input.readOnly = true;
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  input.style.cssText = 'position:fixed;left:-9999px;opacity:0';
  document.body.append(input);
  try {
    input.select();
    input.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    input.remove();
    if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
  }
}
