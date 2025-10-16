'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import ResizableTraitModal from './ResizableTraitModal';
import { BIG_FIVE_TEMPLATE, createDefaultGroup, getSubtraitImagePath, type TraitLevel, type BigFiveGroup } from '@/lib/big-five-config';
import { UI_CONSTANTS } from '@/lib/constants';
import type { BigFiveSelectorProps } from '@/types/profile';

// Extract constants to prevent recreation
const TRAIT_LEVELS: readonly TraitLevel[] = ['High', 'Average', 'Low'];
const { DEFAULT_OFFSET, BASE_POSITION } = UI_CONSTANTS.MODAL;
const { MIN_SCORE, MAX_SCORE, SCORE_STEP } = UI_CONSTANTS.BIG_FIVE;

// Helper function to convert trait name to image URL
const getTraitImageUrl = (traitName: string): string | undefined => {
  // Use the centralized mapping function from big-five-config
  return getSubtraitImagePath(traitName);
};

export function BigFiveSelector({ data, onChange, isReadOnly = false }: BigFiveSelectorProps) {
  const [activeModals, setActiveModals] = useState<{
    id: string;
    title: string;
    description: string;
    position: { x: number; y: number };
    imageUrl: string;
  }[]>([]);

  // Memoize displayData to prevent unnecessary recalculations
  const displayData = useMemo(() => {
    if (data.length === 0) {
      return BIG_FIVE_TEMPLATE.map((_, index) => createDefaultGroup(index));
    }
    return data;
  }, [data]);

  // Memoize handlers with useCallback
  const handleGroupLevelChange = useCallback((groupIndex: number, level: TraitLevel) => {
    const updated = [...displayData];
    if (!updated[groupIndex]) {
      updated[groupIndex] = createDefaultGroup(groupIndex);
    }
    updated[groupIndex] = { ...updated[groupIndex], level };
    onChange(updated);
  }, [displayData, onChange]);

  const handleSubtraitLevelChange = useCallback((
    groupIndex: number,
    subtraitIndex: number,
    level: TraitLevel
  ) => {
    const updated = [...displayData];
    if (!updated[groupIndex]) {
      updated[groupIndex] = createDefaultGroup(groupIndex);
    }
    const updatedSubtraits = [...updated[groupIndex].subtraits];
    updatedSubtraits[subtraitIndex] = { ...updatedSubtraits[subtraitIndex], level };
    updated[groupIndex] = { ...updated[groupIndex], subtraits: updatedSubtraits };
    onChange(updated);
  }, [displayData, onChange]);

  const handleGroupScoreChange = useCallback((groupIndex: number, score: number) => {
    const updated = [...displayData];
    if (!updated[groupIndex]) {
      updated[groupIndex] = createDefaultGroup(groupIndex);
    }
    updated[groupIndex] = { ...updated[groupIndex], score };
    onChange(updated);
  }, [displayData, onChange]);

  const handleSubtraitScoreChange = useCallback((
    groupIndex: number,
    subtraitIndex: number,
    score: number
  ) => {
    const updated = [...displayData];
    if (!updated[groupIndex]) {
      updated[groupIndex] = createDefaultGroup(groupIndex);
    }
    const updatedSubtraits = [...updated[groupIndex].subtraits];
    updatedSubtraits[subtraitIndex] = { ...updatedSubtraits[subtraitIndex], score };
    updated[groupIndex] = { ...updated[groupIndex], subtraits: updatedSubtraits };
    onChange(updated);
  }, [displayData, onChange]);

  const openModal = useCallback((title: string, description: string) => {
    setActiveModals((prev) => {
      // Check if modal with same title already exists
      const existingModal = prev.find((modal) => modal.title === title);
      if (existingModal) {
        // Bring existing modal to front by updating its timestamp
        return prev.map((modal) =>
          modal.title === title
            ? { ...modal, id: `${Date.now()}-${Math.random()}` }
            : modal
        );
      }

      const imageUrl = getTraitImageUrl(title);
      if (!imageUrl) return prev; // Skip if no image available

      const newModal = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        description,
        imageUrl,
        position: {
          x: BASE_POSITION.x + prev.length * DEFAULT_OFFSET,
          y: BASE_POSITION.y + prev.length * DEFAULT_OFFSET,
        },
      };
      return [...prev, newModal];
    });
  }, []);

  const closeModal = useCallback((id: string) => {
    setActiveModals((prev) => prev.filter((modal) => modal.id !== id));
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BIG_FIVE_TEMPLATE.map((template, groupIndex) => {
          const groupData = displayData[groupIndex];

          return (
            <div
              key={template.name}
              className="border-2 rounded-lg p-4 border-border bg-card transition-all duration-200 hover:shadow-lg"
            >
              {/* Group Header */}
              <h3
                className="text-xl font-bold mb-2 cursor-pointer hover:underline"
                style={{ color: template.color }}
                onClick={() =>
                  openModal(
                    template.name,
                    ''
                  )
                }
              >
                {template.name}
              </h3>

            {/* Group Level Selector or Display */}
            {isReadOnly ? (
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground flex-1">Overall</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {groupData?.level || 'Average'}
                  </span>
                  {groupData?.score !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({groupData.score})
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-2">
                <div className="flex gap-1 flex-1" role="tablist" aria-label={`${template.name} level`}>
                  {TRAIT_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => handleGroupLevelChange(groupIndex, level)}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-md font-semibold transition-colors border text-sm',
                        groupData?.level === level
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                      )}
                      role="tab"
                      aria-selected={groupData?.level === level}
                      tabIndex={groupData?.level === level ? 0 : -1}
                      type="button"
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={MIN_SCORE}
                  max={MAX_SCORE}
                  step={SCORE_STEP}
                  value={groupData?.score ?? ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || MIN_SCORE;
                    const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
                    handleGroupScoreChange(groupIndex, clampedValue);
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || MIN_SCORE;
                    if (value < MIN_SCORE || value > MAX_SCORE) {
                      const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
                      handleGroupScoreChange(groupIndex, clampedValue);
                    }
                  }}
                  className="w-20 px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="000"
                />
              </div>
            )}

            {/* Subtraits List */}
            <div className="space-y-2">
              {template.subtraits.map((subtraitName, subtraitIndex) => {
                const subtrait = groupData?.subtraits[subtraitIndex];

                return (
                  <div
                    key={subtraitName}
                    className="flex items-center justify-between gap-2"
                  >
                    {/* Subtrait Name */}
                    <div
                      className="text-sm font-medium flex-1 cursor-pointer hover:underline"
                      style={{ color: template.color }}
                      onClick={() =>
                        openModal(
                          subtraitName,
                          ''
                        )
                      }
                    >
                      {subtraitName}
                    </div>

                    {/* Level Selector or Display */}
                    {isReadOnly ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {subtrait?.level || 'Average'}
                        </span>
                        {subtrait?.score !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({subtrait.score})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1" role="tablist" aria-label={`${subtraitName} level`}>
                          {TRAIT_LEVELS.map((level) => (
                            <button
                              key={level}
                              onClick={() => handleSubtraitLevelChange(groupIndex, subtraitIndex, level)}
                              className={cn(
                                'w-8 h-8 rounded-md text-xs font-semibold transition-colors border',
                                subtrait?.level === level
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                              )}
                              role="tab"
                              aria-selected={subtrait?.level === level}
                              tabIndex={subtrait?.level === level ? 0 : -1}
                              type="button"
                            >
                              {level.charAt(0)}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          min={MIN_SCORE}
                          max={MAX_SCORE}
                          step={SCORE_STEP}
                          value={subtrait?.score ?? ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || MIN_SCORE;
                            const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
                            handleSubtraitScoreChange(groupIndex, subtraitIndex, clampedValue);
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value) || MIN_SCORE;
                            if (value < MIN_SCORE || value > MAX_SCORE) {
                              const clampedValue = Math.max(MIN_SCORE, Math.min(MAX_SCORE, value));
                              handleSubtraitScoreChange(groupIndex, subtraitIndex, clampedValue);
                            }
                          }}
                          className="w-14 px-1 py-1 text-xs border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="000"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>

      {/* Modals */}
    {activeModals.map((modal) => (
      <ResizableTraitModal
        key={modal.id}
        title={modal.title}
        description={modal.description}
        imageUrl={modal.imageUrl}
        initialPosition={modal.position}
        onClose={() => closeModal(modal.id)}
      />
    ))}
    </>
  );
}
