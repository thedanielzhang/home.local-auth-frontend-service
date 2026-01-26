import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        id={inputId}
        className="form-input"
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="form-error">
          {error}
        </span>
      )}
    </div>
  );
}
