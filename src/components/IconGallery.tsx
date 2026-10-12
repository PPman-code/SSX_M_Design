import { useState } from 'react';
import { Icon, iconNames } from './ui/Icon';

export function IconGallery() {
  const [query, setQuery] = useState('');
  const filtered = iconNames.filter((name) => name.includes(query.trim().toLowerCase()));
  return <div className="icon-library">
    <div className="icon-library-toolbar">
      <label className="field">查找图标<input type="search" placeholder="输入英文名称，如 search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <span>{filtered.length} / {iconNames.length}</span>
    </div>
    <div className="icon-gallery">{filtered.map((name) => <div className="icon-tile" key={name}><Icon name={name} size="lg" /><code>{name}</code></div>)}</div>
    {filtered.length === 0 && <p className="icon-empty">没有匹配的图标，试试其他名称。</p>}
  </div>;
}
