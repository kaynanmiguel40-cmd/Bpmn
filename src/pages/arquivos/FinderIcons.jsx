/**
 * FinderIcons - glifos estilo macOS Finder pro Arquivo de Relatórios.
 *  - FolderGlyph: pasta colorida (com inicial opcional), igual às pastas do Mac.
 *  - FileGlyph: documento (página com canto dobrado) pros relatórios.
 *  - FinderItem: ícone + rótulo embaixo, com seleção azul no hover (icon view).
 */

export function FolderGlyph({ color = '#3B9EE3', badge, size = 74 }) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 96 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="48" cy="73" rx="33" ry="4" fill="#000" opacity="0.06" />
      {/* painel de trás + aba */}
      <path d="M10 20c0-4.4 3.6-8 8-8h18.3c1.5 0 3 .6 4 1.8l4.2 4.7c.4.4.9.6 1.5.6H78c4.4 0 8 3.6 8 8v6H10V20z" fill={color} />
      <path d="M10 20c0-4.4 3.6-8 8-8h18.3c1.5 0 3 .6 4 1.8l4.2 4.7c.4.4.9.6 1.5.6H78c4.4 0 8 3.6 8 8v6H10V20z" fill="#000" opacity="0.18" />
      {/* painel da frente */}
      <path d="M6 30c0-4.4 3.6-8 8-8h68c4.4 0 8 3.6 8 8v28c0 4.4-3.6 8-8 8H14c-4.4 0-8-3.6-8-8V30z" fill={color} />
      {/* brilho no topo da frente */}
      <path d="M6 30c0-4.4 3.6-8 8-8h68c4.4 0 8 3.6 8 8v4H6v-4z" fill="#fff" opacity="0.22" />
      {badge && <text x="48" y="53" textAnchor="middle" fontSize="22" fontWeight="700" fill="#fff" opacity="0.95">{badge}</text>}
    </svg>
  );
}

export function FileGlyph({ accent = '#3B9EE3', size = 54 }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 72 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 4h28l24 24v54a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V10a6 6 0 0 1 6-6z" fill="#fff" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M42 4l24 24H50a8 8 0 0 1-8-8V4z" fill="#eef2f7" />
      <rect x="18" y="40" width="36" height="6" rx="3" fill={accent} opacity="0.9" />
      <rect x="18" y="52" width="32" height="4" rx="2" fill="#cbd5e1" />
      <rect x="18" y="61" width="36" height="4" rx="2" fill="#cbd5e1" />
      <rect x="18" y="70" width="22" height="4" rx="2" fill="#cbd5e1" />
    </svg>
  );
}

export function FinderItem({ glyph, label, sublabel, onClick }) {
  return (
    <button onClick={onClick}
      className="group flex flex-col items-center gap-1 w-[108px] p-2 rounded-xl hover:bg-fyness-primary/5 transition">
      <div className="h-[64px] flex items-end justify-center">{glyph}</div>
      <span className="text-xs text-center leading-tight line-clamp-2 px-1.5 py-0.5 rounded-md text-slate-700 dark:text-slate-200 group-hover:bg-fyness-primary group-hover:text-white">
        {label}
      </span>
      {sublabel && <span className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-tight">{sublabel}</span>}
    </button>
  );
}
