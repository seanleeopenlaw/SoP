'use client';

import { useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';

interface TextListInputProps {
  label: string;
  values: string[];
  onChange: (updated: string[]) => void;
  maxLength?: number;
  placeholderPrefix?: string;
}

const DEFAULT_LIST_LENGTH = 5;
const DEFAULT_MAX_LENGTH = 100;

export const TextListInput = memo<TextListInputProps>(function TextListInput({
  label,
  values,
  onChange,
  maxLength = DEFAULT_MAX_LENGTH,
  placeholderPrefix = 'Item',
}) {
  const handleInputChange = useCallback((index: number, value: string) => {
    const updated = [...values];
    updated[index] = value;
    onChange(updated);
  }, [values, onChange]);

  // Memoize displayValues to prevent recalculation
  const displayValues = useMemo(() =>
    Array.from({ length: DEFAULT_LIST_LENGTH }, (_, i) => values[i] || ''),
    [values]
  );

  return (
    <div>
      <label className="text-foreground font-medium block mb-3">
        {label}
      </label>
      <div className="flex flex-col gap-2" role="list">
        {displayValues.map((value, index) => (
          <div key={`${label}-input-${index}`} role="listitem">
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              maxLength={maxLength}
              className={cn(
                'w-full bg-input border border-border text-foreground',
                'px-3 py-2 rounded-sm',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'transition-shadow'
              )}
              placeholder={
                index === 0
                  ? `e.g., ${
                      placeholderPrefix === 'Value' ? 'Integrity' :
                      placeholderPrefix === 'Strength' ? 'Leadership' :
                      'Example'
                    }`
                  : `${placeholderPrefix} ${index + 1}`
              }
              aria-label={`${label} ${index + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
