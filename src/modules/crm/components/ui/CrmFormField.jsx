/**
 * CrmFormField - Campo de formulario padronizado.
 *
 * Props:
 * - label: string
 * - name: string
 * - type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date' | 'currency'
 * - value: any
 * - onChange: (e) => void
 * - error: string
 * - placeholder: string
 * - required: boolean
 * - options: [{ value, label }] (para select)
 * - rows: number (para textarea)
 * - disabled: boolean
 */

export function CrmFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required,
  options = [],
  rows = 3,
  disabled,
  className = '',
}) {
  const baseClass = `w-full px-3 py-2 rounded-lg border text-sm transition-colors
    ${error
      ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 focus:border-rose-500'
      : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary focus:border-fyness-primary'
    }
    bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
    placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:ring-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${baseClass} resize-none`}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={baseClass}
        >
          <option value="">{placeholder || 'Selecione...'}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (type === 'currency') {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-slate-500">R$</span>
          <input
            id={name}
            name={name}
            type="number"
            step="0.01"
            min="0"
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder || '0,00'}
            required={required}
            disabled={disabled}
            className={`${baseClass} pl-9`}
          />
        </div>
      );
    }

    return (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={baseClass}
      />
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}

export default CrmFormField;
