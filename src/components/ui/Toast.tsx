import { Toast as BaseToast } from '@base-ui/react/toast';
import type { ReactNode } from 'react';

function ToastViewport() {
  const { toasts } = BaseToast.useToastManager();
  return <BaseToast.Portal><BaseToast.Viewport className="toast-viewport" aria-label="轻提示">
    {toasts.map((toast) => <BaseToast.Root key={toast.id} toast={toast} className="toast" data-type={toast.type}>
      <BaseToast.Content className="toast-content">
        {toast.type !== 'text' && <img className={`toast-icon ${toast.type === 'loading' ? 'toast-icon--loading' : ''}`} src={`${import.meta.env.BASE_URL}components/toast/${toast.type}.svg`} alt="" width="24" height="24" />}
        {toast.title ? <BaseToast.Title className="toast-message">{toast.title}</BaseToast.Title> : <BaseToast.Title className="sr-only">加载中</BaseToast.Title>}
      </BaseToast.Content>
    </BaseToast.Root>)}
  </BaseToast.Viewport></BaseToast.Portal>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return <BaseToast.Provider timeout={2000} limit={1}>{children}<ToastViewport /></BaseToast.Provider>;
}
