'use client';

import { cn } from '@/lib/utils';
import type { TraitLevel } from '@/lib/big-five-config';

interface TraitLevelSelectorProps {
  levels: readonly TraitLevel[];
  selected: TraitLevel;
  onChange: (level: TraitLevel) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
  ariaLabel?: string;
}

export function TraitLevelSelector({
  levels,
  selected,
  onChange,
  size = 'md',
  disabled = false,
  ariaLabel = 'trait level',
}: TraitLevelSelectorProps) {
  return (
    <div className="flex gap-1" role="tablist" aria-label={ariaLabel}>
      {levels.map((level) => (
        <button
          key={level}
          onClick={() => onChange(level)}
          disabled={disabled}
          className={cn(
            'rounded-md font-semibold transition-colors border',
            size === 'sm' && 'w-8 h-8 text-xs',
            size === 'md' && 'flex-1 py-2 px-3 text-sm',
            selected === level
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="tab"
          aria-selected={selected === level}
          tabIndex={selected === level ? 0 : -1}
          type="button"
        >
          {size === 'sm' ? level.charAt(0) : level}
        </button>
      ))}
    </div>
  );
}
