import { useRef, useCallback, useEffect } from 'react';

export default function AutoTextarea({ value, onChange, className = '', minRows = 1, ...props }) {
  const ref = useRef(null);

  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => { resize(); }, [value, resize]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={minRows}
      className={className.replace('resize-none', '') + ' overflow-hidden'}
      onInput={resize}
      {...props}
    />
  );
}
