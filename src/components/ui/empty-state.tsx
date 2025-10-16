import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyStateSimple({ children = 'Not set' }: { children?: ReactNode }) {
  return (
    <div className="text-muted-foreground italic text-sm">
      {children}
    </div>
  );
}
