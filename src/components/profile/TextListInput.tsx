'use client';

import { useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <Label className="block mb-3">
        {label}
      </Label>
      <div className="flex flex-col gap-2" role="list">
        {displayValues.map((value, index) => (
          <div key={`${label}-input-${index}`} role="listitem">
            <Input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              maxLength={maxLength}
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
