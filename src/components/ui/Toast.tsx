import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import type { ToastData, ToastType } from './useToast';

const statusIcons: Record<Exclude<ToastType, 'text'>, IconName> = { success: 'check-circle', error: 'close-circle', warning: 'exclamation-circle', loading: 'loading' };

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager<ToastData>();
  return <BaseToast.Portal><BaseToast.Viewport className="toast-viewport" aria-label="轻提示">
    {toasts.map((toast) => {
      const icon = toast.data?.icon ?? statusIcons[toast.type as keyof typeof statusIcons];
      return <BaseToast.Root key={toast.id} toast={toast} className="toast" data-type={toast.type} data-layout={icon ? toast.data?.layout ?? 'vertical' : 'text'}>
      <BaseToast.Content className="toast-content">
        {icon && <Icon name={icon} className={`toast-icon ${toast.type === 'loading' ? 'toast-icon--loading' : ''}`} />}
        {toast.title ? <BaseToast.Title className="toast-message">{toast.title}</BaseToast.Title> : <BaseToast.Title className="sr-only">加载中</BaseToast.Title>}
      </BaseToast.Content>
    </BaseToast.Root>; })}
  </BaseToast.Viewport></BaseToast.Portal>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return <BaseToast.Provider timeout={2000} limit={1}>{children}<ToastViewport /></BaseToast.Provider>;
}
