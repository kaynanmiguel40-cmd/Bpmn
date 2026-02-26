/**
 * CrmAvatar - Avatar com iniciais ou imagem.
 *
 * Props:
 * - name: string (usado para gerar iniciais e cor)
 * - src: URL da imagem (opcional)
 * - size: 'sm' | 'md' | 'lg'
 * - color: cor fixa (opcional, senao gera pela hash do nome)
 */

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

const colors = [
  'from-indigo-500 to-indigo-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-rose-500 to-rose-700',
  'from-sky-500 to-sky-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
];

function getColorFromName(name) {
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function CrmAvatar({ name, src, size = 'md', color }) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const gradientColor = color || getColorFromName(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-semibold shrink-0`}>
      {getInitials(name)}
    </div>
  );
}

export default CrmAvatar;
