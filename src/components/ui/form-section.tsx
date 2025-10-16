import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title?: string;
  titleClassName?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function FormSection({
  title,
  titleClassName,
  icon,
  children,
  className,
  compact = false
}: FormSectionProps) {
  return (
    <section className={cn(
      "border-2 rounded-lg border-border bg-card",
      compact ? "p-4" : "p-6",
      className
    )}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <h2 className={cn("text-xl font-bold", titleClassName)}>
            {title}
          </h2>
          {icon}
        </div>
      )}
      {children}
    </section>
  );
}
