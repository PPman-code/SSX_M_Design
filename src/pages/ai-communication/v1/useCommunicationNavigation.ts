import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
export function useCommunicationNavigation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const actor = params.get('teacher') === 'other' ? '王老师' : '刘亦菲';
  const go = useCallback((page: string, values: Record<string, string | null> = {}, options: { replace?: boolean } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value));
    navigate(`/pages/${page}/v1?${next}`, options);
  }, [navigate, params]);
  const backToCustomer = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else go('customer-info', { record: null }, { replace: true });
  };
  return { params, actor, go, backToCustomer };
}
