import { useState } from 'react';
import { Cell, CellGroup } from './ui/Cell';
import { Icon } from './ui/Icon';
import { Toggle } from './ui/Toggle';
import { Badge } from './ui/Badge';
import './CellExamples.css';

export function CellExamples() {
  const [cellNotifications, setCellNotifications] = useState(true);
  const [teachingNotifications, setTeachingNotifications] = useState(true);
  const [cellFeedback, setCellFeedback] = useState('');
  return (
        <section aria-labelledby="cells-title" className="demo-section cell-examples">
          <div className="section-heading"><h2 id="cells-title">单元格</h2><span>单行 · 多行 · 图文</span></div>
          <h3>基础与内容组合</h3>
          <CellGroup label="单元格示例">
            <Cell label="基础单元格" />
            <Cell label="带图标与详情" leading={<Icon name="question-circle" size="md" />} value="查看说明" arrow onClick={() => setCellFeedback('已点击详情单元格')} />
            <Cell label="用户名称" leading={<img src={`${import.meta.env.BASE_URL}pages/my/v1/avatar.png`} alt="用户头像" />} arrow onClick={() => setCellFeedback('已点击头像单元格')} />
            <Cell label="消息通知" control={<Toggle label="单元格消息通知" checked={cellNotifications} onChange={setCellNotifications} />} />
            <Cell label="标题与说明" description="辅助说明用于补充当前选项的信息" />
            <Cell label="多行信息" overline="辅助标题" description="这里展示补充说明，长文本会自然换行，保持内容完整。" multiline value={<span className="cell-detail-stack"><span>详细信息</span><span>辅助信息</span></span>} arrow onClick={() => setCellFeedback('已点击多行单元格')} />
            <Cell label="暂不可用" value="未开放" arrow disabled onClick={() => setCellFeedback('不应触发禁用行')} />
          </CellGroup>
          <h3>必填与图文</h3>
          <CellGroup label="图文单元格示例">
            <Cell label="选择校区" required value="请选择" arrow onClick={() => setCellFeedback('已点击校区选择')} />
            <Cell label="教学通知" description="接收课程调整与上课提醒" leading={<Icon name="application" size="md" />} control={<Toggle label="教学通知开关" checked={teachingNotifications} onChange={setTeachingNotifications} />} />
            <Cell label="编程基础课程" description="通过图形化编程学习逻辑思考与问题拆解，适合零基础学员循序渐进地学习。" leading={<img src={`${import.meta.env.BASE_URL}components/cell/course.png`} alt="课程封面" />} media="image" multiline arrow onClick={() => setCellFeedback('已点击图文单元格')} />
            <Cell label="暂未开放的课程" description="开放后可查看课程详情" leading={<img src={`${import.meta.env.BASE_URL}components/cell/course.png`} alt="课程封面" />} media="image" arrow disabled onClick={() => setCellFeedback('不应触发禁用行')} />
          </CellGroup>
          <h3>通栏分组</h3>
          <div className="cell-example-block">
            <CellGroup label="通栏单元格示例" variant="block">
              <Cell label="待处理事项" leading={<Icon name="application" size="md" />} value={<Badge count={16} />} arrow onClick={() => setCellFeedback('已点击待处理事项')} />
              <Cell label="消息中心" description="课程提醒与业务消息" value={<Badge dot />} arrow onClick={() => setCellFeedback('已点击消息中心')} />
              <Cell label="帮助与反馈" leading={<Icon name="question-circle" size="md" />} value="使用说明" arrow onClick={() => setCellFeedback('已点击帮助与反馈')} />
            </CellGroup>
          </div>
          {cellFeedback && <p className="cell-demo-feedback" role="status">{cellFeedback}</p>}
        </section>
  );
}
