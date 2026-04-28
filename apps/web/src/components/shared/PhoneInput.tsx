import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { validateIndianPhone } from '@textilepro/shared';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericOnly = e.target.value.replace(/[^0-9]/g, '').substring(0, 10);
      onChange(numericOnly);
    };

    const isValid = value.length === 10 && validateIndianPhone(value);
    const isError = error || (value.length === 10 && !isValid);

    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 border-r border-input bg-muted/50 rounded-l-md pointer-events-none">
          <span className="text-muted-foreground text-sm font-medium">+91</span>
        </div>
        <Input
          {...props}
          ref={ref}
          type="tel"
          value={value}
          onChange={handleChange}
          className={cn('pl-14', isError && 'border-destructive focus-visible:ring-destructive', className)}
          placeholder="98765 43210"
        />
        {value.length === 10 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
