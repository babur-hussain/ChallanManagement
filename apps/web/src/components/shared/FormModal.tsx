import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  isLoading = false,
  className,
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent 
        className={`sm:max-w-[600px] p-0 overflow-hidden flex flex-col max-h-[90vh] ${className || ''}`}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        {/* We use standard div with auto overflow instead of ScrollArea primitive 
            to avoid weird interaction bugs with complex forms/selects */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
        
        {/* Form contents should include their own footer actions if needed, 
            or we can pass them as props. For full flexibility, we let the form render its own footer actions. */}
      </DialogContent>
    </Dialog>
  );
}
