/**
 * CrmPanel - Painel de vidro (Soft Depth / Glass) reutilizavel.
 *
 * Wrapper padrao das secoes do CRM: superficie translucida com blur,
 * cabecalho opcional (icone com tint de accent + titulo + acao a direita).
 *
 * Props:
 * - title: titulo do painel (opcional)
 * - icon: componente lucide-react (opcional, exibido antes do titulo)
 * - accent: 'blue'|'emerald'|'amber'|'rose'|'violet'|'sky'|'slate' — tint do icone
 * - action: ReactNode renderizado a direita do cabecalho (link "ver todos", badge...)
 * - hover: ativa lift+glow no hover (default false)
 * - padded: aplica padding interno (default true)
 * - className: classes extras no container
 * - bodyClassName: classes extras no corpo
 */

const accentMap = {
  blue:    'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  amber:   'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
  rose:    'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20',
  violet:  'bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20',
  sky:     'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20',
  slate:   'bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-1 ring-slate-500/20',
};

export function CrmPanel({
  title,
  icon: Icon,
  accent = 'blue',
  action,
  hover = false,
  padded = true,
  className = '',
  bodyClassName = '',
  children,
}) {
  const hasHeader = title || Icon || action;
  return (
    <section
      className={`crm-glass ${hover ? 'crm-glass-hover' : ''} rounded-2xl overflow-hidden ${className}`}
    >
      {hasHeader && (
        <div className={`flex items-center justify-between gap-3 ${padded ? 'px-5 pt-5' : 'px-4 pt-4'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accentMap[accent] || accentMap.blue}`}>
                <Icon size={16} />
              </span>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
                {title}
              </h3>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`${padded ? 'p-5' : 'p-4'} ${hasHeader && padded ? 'pt-4' : ''} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}

export default CrmPanel;
