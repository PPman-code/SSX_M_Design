import { useEffect } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import { Workspace } from './pages/Workspace';
import { MobilePreview } from './pages/MobilePreview';
import { MyPage } from './pages/my/v1/MyPage';
import { HomePage } from './pages/home/v1/HomePage';
import { AttendancePage as AttendancePageV2 } from './pages/attendance/v2/AttendancePage';
import { AttendancePage } from './pages/attendance/v1/AttendancePage';

export function App() {
  const [params, setParams] = useSearchParams();
  const mode = params.get('theme') === 'dark' ? 'dark' : 'light';
  useEffect(() => { document.documentElement.dataset.colorMode = mode; }, [mode]);
  const onToggleTheme = () => setParams((previous) => { previous.set('theme', mode === 'light' ? 'dark' : 'light'); return previous; }, { replace: true });
  return <Routes>
    <Route path="/" element={<Workspace mode={mode} onToggleTheme={onToggleTheme} />} />
    <Route path="/pages/home/v1" element={<HomePage />} />
    <Route path="/pages/my/v1" element={<MyPage />} />
    <Route path="/pages/attendance/v2" element={<AttendancePageV2 />} />
    <Route path="/pages/attendance/v1" element={<AttendancePage />} />
    <Route path="/mobile" element={<MobilePreview />} />
    <Route path="/handoff" element={<Workspace mode={mode} onToggleTheme={onToggleTheme} />} />
    <Route path="*" element={<main className="not-found"><h1>页面不存在</h1><p>这个设计页面可能尚未添加。</p><Link className="text-link" to="/">返回工作区</Link></main>} />
  </Routes>;
}
