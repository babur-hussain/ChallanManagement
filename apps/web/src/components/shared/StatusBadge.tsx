import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant = 'active' | 'inactive' | 'overdue' | 'pending' | 'paid' | 'cancelled';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const getBadgeProps = () => {
    switch (status) {
      case 'active':
      case 'paid':
        return { variant: 'success' as const, defaultLabel: status === 'active' ? 'Active' : 'Paid' };
      case 'inactive':
      case 'cancelled':
        return { variant: 'destructive' as const, defaultLabel: status === 'inactive' ? 'Inactive' : 'Cancelled' };
      case 'pending':
        return { variant: 'warning' as const, defaultLabel: 'Pending' };
      case 'overdue':
        return { variant: 'destructive' as const, defaultLabel: 'Overdue' };
      default:
        return { variant: 'default' as const, defaultLabel: 'Unknown' };
    }
  };

  const props = getBadgeProps();

  return (
    <Badge variant={props.variant} className={cn('capitalize', className)}>
      {label || props.defaultLabel}
    </Badge>
  );
}
