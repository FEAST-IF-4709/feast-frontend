import React from 'react';

export default function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required,
  disabled,
  helperText,
  as,
  children,
  ...rest
}) {
  const inputClass = `w-full bg-feast-bg rounded-xl px-4 py-3 text-sm text-feast-dark font-vietnam
    focus:outline-none focus:ring-2 focus:ring-feast-sunset/30 transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? 'ring-2 ring-feast-beetroot/40' : ''}`;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold text-feast-dark-secondary font-vietnam"
        >
          {label}
          {required && <span className="text-feast-beetroot ml-0.5">*</span>}
        </label>
      )}

      {as === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClass}
          {...rest}
        >
          {children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={`${inputClass} resize-none`}
          {...rest}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClass}
          {...rest}
        />
      )}

      {error && (
        <p className="text-xs text-feast-beetroot font-vietnam">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-feast-dark-muted font-vietnam">{helperText}</p>
      )}
    </div>
  );
}
