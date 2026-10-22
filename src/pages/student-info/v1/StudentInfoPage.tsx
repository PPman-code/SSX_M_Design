import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { MobilePage } from '../../../components/ui/MobilePage';
import { PopoverMenu, type PopoverMenuAction } from '../../../components/ui/PopoverMenu';
import { useToast } from '../../../components/ui/useToast';
import { students } from '../../students/v1/model';
import { PointsAdjustment } from './PointsAdjustment';
import { formatPoints, initialPointsRules, initialSubtractRules, type PointsRule, type PointsOperation } from './points-model';
import './student-info.css';

export function StudentInfoPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const student = students.find(item => item.id === params.get('student'));

  const pointsTrigger = useRef<HTMLButtonElement>(null);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [operation, setOperation] = useState<PointsOperation>('add');
  const [session, setSession] = useState(0);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [rules, setRules] = useState<Record<PointsOperation, PointsRule[]>>({ add: initialPointsRules, subtract: initialSubtractRules });
  const balance = student ? balances[student.id] ?? 12800 : 12800;
  // Prototype data only; rules and balances are retained in this page's memory.
  const actions = ([
    { key: 'add', label: '加分', icon: 'plus-circle-fill' },
    { key: 'subtract', label: '减分', icon: 'minus-circle-fill' },
    { key: 'clear', label: '积分清零', icon: 'stop' },
  ] satisfies PopoverMenuAction[]).map(action => ({ ...action, onSelect: () => { if (action.key === 'add' || action.key === 'subtract') { setSession(current => current + 1); setOperation(action.key); setAdjustmentOpen(true); } else showToast({ message: `${action.label}操作待设计` }); } }));

  function returnToStudents() {
    const next = new URLSearchParams(params); next.delete('student');
    navigate(`/pages/students/v1?${next}`);
  }
  return <MobilePage title={student?.name || '学员信息'} previewChrome={params.get('chrome') === 'wechat'} className="student-info-page"
    footer={<footer className="student-info-footer" aria-label="学员积分操作">
      <PopoverMenu label="积分操作" placement="top" actions={actions}
        trigger={<Button ref={pointsTrigger} shape="round" disabled={!student}>加减积分</Button>} />
    </footer>}>
    <h1 className="sr-only">{student ? `${student.name}的学员信息` : '学员信息'}</h1>
    {!student && <div className="student-info-unavailable" role="status">
      <p>{params.has('student') ? '未找到学员' : '请先从学员管理选择学员'}</p>
      <Button variant="soft" onClick={returnToStudents}>返回学员管理</Button>
    </div>}
    {student && <PointsAdjustment key={`${student.id}-${session}`} operation={operation} open={adjustmentOpen} onOpenChange={setAdjustmentOpen} student={student} balance={balance} rules={rules[operation]} finalFocus={pointsTrigger}
      onCreateRule={rule => setRules(current => ({ ...current, [operation]: [...current[operation], rule] }))}
      onConfirm={cents => { setBalances(current => ({ ...current, [student.id]: balance + cents })); showToast({ message: `${operation === 'add' ? '加分成功' : '减分成功'}\n本次 ${cents < 0 ? '−' : '+'}${formatPoints(Math.abs(cents))} 分`, type: 'success' }); }} />}
  </MobilePage>;
}
