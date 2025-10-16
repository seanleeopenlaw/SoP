'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ChronotypeAnimalModal } from './ChronotypeAnimalModal';

type ChronotypeType = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

interface ChronotypeSelectorProps {
  selected: ChronotypeType[];
  onChange: (selected: ChronotypeType[]) => void;
  isReadOnly?: boolean;
}

// Move constant outside component to prevent recreation
const chronotypes = [
  {
    type: 'Lion' as const,
    image: '/chronotypes/lion.png',
    description: 'Early risers, peak productivity in morning',
  },
  {
    type: 'Bear' as const,
    image: '/chronotypes/bear.png',
    description: 'Follow the sun, productive mid-morning to afternoon',
  },
  {
    type: 'Wolf' as const,
    image: '/chronotypes/wolf.png',
    description: 'Night owls, peak productivity in evening',
  },
  {
    type: 'Dolphin' as const,
    image: '/chronotypes/dolphin.png',
    description: 'Light sleepers, irregular sleep patterns',
  },
] as const;

export function ChronotypeSelector({
  selected,
  onChange,
  isReadOnly = false,
}: ChronotypeSelectorProps) {
  const [modalType, setModalType] = useState<ChronotypeType | null>(null);

  const handleSelect = useCallback((type: ChronotypeType) => {
    if (selected.includes(type)) {
      // Deselect if already selected
      onChange(selected.filter(t => t !== type));
    } else {
      // Add to selection
      onChange([...selected, type]);
    }
  }, [onChange, selected]);

  const handleViewDetails = useCallback((type: ChronotypeType) => {
    setModalType(type);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalType(null);
  }, []);

  // Memoize modal image URL lookup
  const modalImageUrl = useMemo(() => {
    if (!modalType) return '';
    return chronotypes.find((c) => c.type === modalType)?.image ?? '';
  }, [modalType]);

  return (
    <div className="space-y-4">
      {!isReadOnly && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Select one or more chronotypes that describe you
          </p>
          {selected.length > 0 && (
            <span className="text-sm font-medium text-foreground">
              Selected: {selected.join(', ')}
            </span>
          )}
        </div>
      )}

      <div className={cn(
        "grid gap-4",
        isReadOnly ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-4"
      )}>
        {chronotypes
          .filter((chronotype) => !isReadOnly || selected.includes(chronotype.type))
          .map((chronotype) => {
          const isSelected = selected.includes(chronotype.type);

          return (
            <div
              key={chronotype.type}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all duration-200',
                'hover:shadow-lg',
                isReadOnly ? 'flex flex-row items-center gap-4' : 'flex flex-col items-center gap-3 cursor-pointer',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/50'
              )}
              onClick={!isReadOnly ? () => handleSelect(chronotype.type) : undefined}
            >
              {/* Selection indicator */}
              {isSelected && !isReadOnly && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Animal image */}
              <div
                className={cn(
                  "relative",
                  isReadOnly ? "w-32 h-32 flex-shrink-0" : "w-full aspect-square"
                )}
              >
                <Image
                  src={chronotype.image}
                  alt={chronotype.type}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Right side content for read-only mode */}
              {isReadOnly ? (
                <div className="flex-1 flex flex-col items-start gap-2">
                  <h3 className="font-semibold text-lg text-primary">
                    {chronotype.type}
                  </h3>
                  <p className="text-sm text-muted-foreground text-left">
                    {chronotype.description}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(chronotype.type);
                    }}
                    className="mt-2 py-2 px-4 text-sm font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    type="button"
                    aria-label={`View details about ${chronotype.type} chronotype`}
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <>
                  {/* Type name */}
                  <h3
                    className={cn(
                      'font-semibold text-lg',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}
                  >
                    {chronotype.type}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {chronotype.description}
                  </p>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(chronotype.type);
                    }}
                    className="mt-2 w-full py-2 px-3 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    type="button"
                    aria-label={`View details about ${chronotype.type} chronotype`}
                  >
                    View Details
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Modal */}
      {modalType && (
        <ChronotypeAnimalModal
          type={modalType}
          description={`Detailed information about the ${modalType} chronotype. This modal can be customized with more content.`}
          imageUrl={modalImageUrl}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
