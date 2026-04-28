import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
    // During editing we keep a raw string so we never reformat mid-type (which moves the cursor)
    const [localRaw, setLocalRaw] = useState<string>(value === 0 ? '' : String(value));
    const isFocused = useRef(false);

    // Sync from outside changes (e.g. form reset) only when not focused
    useEffect(() => {
      if (!isFocused.current) {
        setLocalRaw(value === 0 ? '' : String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Allow digits and a single decimal point only
      const cleaned = raw.replace(/[^0-9.]/g, '');

      // Only one decimal point allowed
      const parts = cleaned.split('.');
      let sanitized = parts.length > 2
        ? parts[0] + '.' + parts.slice(1).join('')
        : cleaned;

      // At most 2 decimal places — but DON'T trim while still typing
      if (sanitized.includes('.')) {
        const [intP, decP = ''] = sanitized.split('.');
        if (decP.length > 2) {
          sanitized = `${intP}.${decP.substring(0, 2)}`;
        }
      }

      setLocalRaw(sanitized);

      const num = parseFloat(sanitized);
      onChange(isNaN(num) ? 0 : num);
    };

    const handleFocus = () => {
      isFocused.current = true;
      // Show plain number while editing (no commas, no forced .00)
      setLocalRaw(value === 0 ? '' : String(value));
    };

    const handleBlur = () => {
      isFocused.current = false;
      const num = parseFloat(localRaw);
      if (!isNaN(num)) {
        // On blur, show clean representation
        setLocalRaw(String(num));
        onChange(num);
      } else {
        setLocalRaw('');
        onChange(0);
      }
    };

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-muted-foreground">₹</span>
        </div>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={localRaw}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn('pl-8', error && 'border-destructive focus-visible:ring-destructive', className)}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
