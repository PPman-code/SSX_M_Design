import { useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { archivedBusinessPages, businessPages } from './page-registry';
import { CustomerInfoPage } from './pages/ai-communication/v1/CustomerInfoPage';
import { RecordingPage } from './pages/ai-communication/v1/RecordingPage';
import { PendingRecordsPage, RecordDetailPage } from './pages/ai-communication/v1/RecordDetailPage';
import { CommunicationForm, CommunicationDetailPage } from './pages/ai-communication/v1/CommunicationForm';
import { StudentInfoPage } from './pages/student-info/v1/StudentInfoPage';
import { StudentPage } from './pages/students/v1/StudentPage';
import { CustomerPage } from './pages/prospective-students/v1/CustomerPage';
import { Workspace } from './pages/Workspace';
import { MobilePreview } from './pages/MobilePreview';
import { MyPage } from './pages/my/v1/MyPage';
import { HomePage } from './pages/home/v1/HomePage';
import { AttendancePage as AttendancePageV2 } from './pages/attendance/v2/AttendancePage';
import { AttendancePage } from './pages/attendance/v1/AttendancePage';

export function App() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (window.parent === window) return;
    window.parent.postMessage({ type: 'ssx-preview-location', pathname: location.pathname, search: location.search }, window.location.origin);
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (window.parent === window) return;
    function onPreviewConfig(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === 'ssx-preview-version') {
        const pages = [...businessPages, ...archivedBusinessPages];
        const current = pages.find((page) => page.route === location.pathname);
        const target = pages.find((page) => page.route === event.data.route);
        if (current && target && current.name === target.name) navigate({ pathname: target.route, search: location.search }, { replace: true });
        return;
      }
      if (event.data?.type !== 'ssx-preview-config') return;
      const { key, value } = event.data;
      if (key !== 'payment') return;
      if (typeof value !== 'string' || (key === 'payment' && !['', 'enabled'].includes(value))) return;
      setParams((previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value); else next.delete(key);
        return next;
      }, { replace: true });
    }
    window.addEventListener('message', onPreviewConfig);
    return () => window.removeEventListener('message', onPreviewConfig);
  }, [setParams, navigate, location.pathname, location.search]);
  const mode = params.get('theme') === 'dark' ? 'dark' : 'light';
  useEffect(() => { document.documentElement.dataset.colorMode = mode; }, [mode]);
  const onToggleTheme = () => setParams((previous) => { previous.set('theme', mode === 'light' ? 'dark' : 'light'); return previous; }, { replace: true });
  return <Routes>
    <Route path="/" element={<Workspace mode={mode} onToggleTheme={onToggleTheme} />} />
    <Route path="/pages/customer-info/v1" element={<CustomerInfoPage />} />
    <Route path="/pages/ai-recording/v1" element={<RecordingPage />} />
    <Route path="/pages/ai-pending/v1" element={<PendingRecordsPage />} />
    <Route path="/pages/ai-record/v1" element={<RecordDetailPage />} />
    <Route path="/pages/communication-form/v1" element={<CommunicationForm />} />
    <Route path="/pages/communication-detail/v1" element={<CommunicationDetailPage />} />
    <Route path="/pages/student-info/v1" element={<StudentInfoPage />} />
    <Route path="/pages/students/v1" element={<StudentPage />} />
    <Route path="/pages/prospective-students/v1" element={<CustomerPage />} />
    <Route path="/pages/home/v1" element={<HomePage />} />
    <Route path="/pages/my/v1" element={<MyPage />} />
    <Route path="/pages/attendance/v2" element={<AttendancePageV2 />} />
    <Route path="/pages/attendance/v1" element={<AttendancePage />} />
    <Route path="/mobile" element={<MobilePreview />} />
    <Route path="/handoff" element={<Workspace mode={mode} onToggleTheme={onToggleTheme} />} />
    <Route path="*" element={<main className="not-found"><h1>页面不存在</h1><p>这个设计页面可能尚未添加。</p><Link className="text-link" to="/">返回工作区</Link></main>} />
  </Routes>;
}
