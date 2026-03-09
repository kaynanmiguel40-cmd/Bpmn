/**
 * CrmPageHeader - Header padrao para paginas CRM.
 * Titulo, subtitulo, acoes (botoes) e breadcrumb opcional.
 */

export function CrmPageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export default CrmPageHeader;
