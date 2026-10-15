import { Toast as BaseToast } from '@base-ui/react/toast';

export type ToastType = 'text' | 'success' | 'error' | 'warning' | 'loading';
export interface ToastOptions { message?: string; type?: ToastType; duration?: number }

export function useToast() {
  const manager = BaseToast.useToastManager();
  return {
    showToast({ message, type = 'text', duration = type === 'loading' ? 0 : 2000 }: ToastOptions) {
      if (!message?.trim() && type !== 'loading') return;
      return manager.add({ id: 'mobile-toast', title: message, type, timeout: duration, priority: type === 'error' ? 'high' : 'low' });
    },
    closeToast: () => manager.close('mobile-toast'),
  };
}
