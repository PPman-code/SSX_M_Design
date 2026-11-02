import { students } from '../../students/v1/model';
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
export function useCommunicationNavigation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const actor = params.get('teacher') === 'other' ? '王老师' : '刘亦菲';
  const go = useCallback((page: string, values: Record<string, string | null> = {}, options: { replace?: boolean } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => value === null ? next.delete(key) : next.set(key, value));
    const personId = next.get('customer') ?? next.get('student');
    const student = students.find(item => item.id === personId);
    if (page === 'customer-info' && student) {
      page = 'student-info'; next.set('student', student.id); next.delete('customer'); next.delete('detailTab');
    } else if (page !== 'student-info') {
      if (student) next.set('customer', student.id);
      next.delete('student'); next.delete('detailTab');
    }
    navigate(`/pages/${page}/v1?${next}`, options);
  }, [navigate, params]);
  const backToCustomer = (customerId?: string) => {
    if (window.history.state?.idx > 0) navigate(-1);
    else go('customer-info', { ...(customerId ? { customer: customerId } : {}), record: null }, { replace: true });
  };
  return { params, actor, go, backToCustomer };
}
