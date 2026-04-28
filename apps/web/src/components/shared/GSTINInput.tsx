import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { validateGSTIN } from '@textilepro/shared';
import { Check, X } from 'lucide-react';

interface GSTINInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  onValidGSTIN?: (stateName: string) => void;
}

export const GSTINInput = React.forwardRef<HTMLInputElement, GSTINInputProps>(
  ({ value, onChange, className, error, onValidGSTIN, ...props }, ref) => {

    const [info, setInfo] = useState<string | null>(null);

    useEffect(() => {
      if (value.length === 15) {
        const result = validateGSTIN(value);
        if (result.valid) {
          setInfo(`${result.stateName} • ${result.entityType}`);
          onValidGSTIN?.(result.stateName);
        } else {
          setInfo(null);
        }
      } else {
        setInfo(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only alphanumeric, auto-uppercase, max 15 chars
      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 15);
      onChange(val);
    };

    const isValid = value.length === 15 && validateGSTIN(value).valid;
    const isError = error || (value.length === 15 && !isValid);

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          className={cn(
            isError && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          placeholder="22AAAAA0000A1Z5"
        />
        {value.length === 15 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none bg-background rounded-r-md">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
        {info && (
          <p className="text-xs text-muted-foreground mt-1.5 ml-1 absolute right-0 -bottom-6">
            {info}
          </p>
        )}
      </div>
    );
  }
);

GSTINInput.displayName = 'GSTINInput';
