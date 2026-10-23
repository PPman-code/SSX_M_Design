import type { ComponentPropsWithoutRef } from 'react';
import './ListEnd.css';

/** Static completion hint only. Render after a nonempty list has finished loading. */
export function ListEnd({ children = '这是我的底线', className = '', ...props }: ComponentPropsWithoutRef<'p'>) {
  return <p {...props} className={`list-end ${className}`.trim()}>{children}</p>;
}
