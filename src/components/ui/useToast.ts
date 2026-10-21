import { Toast as BaseToast } from '@base-ui/react/toast';
import type { IconName } from './Icon';

export type ToastType = 'text' | 'success' | 'error' | 'warning' | 'loading';
export interface ToastOptions { message?: string; type?: ToastType; duration?: number; layout?: 'horizontal' | 'vertical'; icon?: IconName }
export interface ToastData { layout: 'horizontal' | 'vertical'; icon?: IconName }

export function useToast() {
  const manager = BaseToast.useToastManager<ToastData>();
  return {
    showToast({ message, type = 'text', duration = type === 'loading' ? 0 : 2000, layout = 'vertical', icon }: ToastOptions) {
      if (!message?.trim() && type !== 'loading') return;
      return manager.add({ id: 'mobile-toast', title: message, type, timeout: duration, priority: type === 'error' ? 'high' : 'low', data: { layout, icon } });
    },
    closeToast: () => manager.close('mobile-toast'),
  };
}
