'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface GoalsSectionProps {
  goals?: {
    period: string;
    professionalGoals?: string | null;
    personalGoals?: string | null;
  } | null;
  onChange: (goals: { period: string; professionalGoals?: string; personalGoals?: string }) => void;
  isReadOnly?: boolean;
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

export function GoalsSection({ goals, onChange, isReadOnly = false }: GoalsSectionProps) {
  const [period, setPeriod] = useState(goals?.period || '');
  const [professionalGoals, setProfessionalGoals] = useState(goals?.professionalGoals || '');
  const [personalGoals, setPersonalGoals] = useState(goals?.personalGoals || '');

  // Create stable debounced onChange
  const debouncedOnChange = useRef(
    debounce((newGoals: { period: string; professionalGoals: string; personalGoals: string }) => {
      onChange(newGoals);
    }, 500)
  ).current;

  // Update local state when goals prop changes
  useEffect(() => {
    if (goals) {
      setPeriod(goals.period || '');
      setProfessionalGoals(goals.professionalGoals || '');
      setPersonalGoals(goals.personalGoals || '');
    }
  }, [goals]);

  const handlePeriodChange = useCallback((value: string) => {
    setPeriod(value);
    debouncedOnChange({
      period: value,
      professionalGoals,
      personalGoals,
    });
  }, [professionalGoals, personalGoals, debouncedOnChange]);

  const handleProfessionalGoalsChange = useCallback((value: string) => {
    setProfessionalGoals(value);
    debouncedOnChange({
      period,
      professionalGoals: value,
      personalGoals,
    });
  }, [period, personalGoals, debouncedOnChange]);

  const handlePersonalGoalsChange = useCallback((value: string) => {
    setPersonalGoals(value);
    debouncedOnChange({
      period,
      professionalGoals,
      personalGoals: value,
    });
  }, [period, professionalGoals, debouncedOnChange]);

  if (isReadOnly) {
    return (
      <section className="border-2 rounded-lg p-6 border-border bg-card">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {period ? `My Goals for ${period}` : 'My Goals'}
        </h2>

        {!period && !professionalGoals && !personalGoals ? (
          <div className="text-muted-foreground italic">No goals set</div>
        ) : (
          <div className="space-y-4">
            {professionalGoals && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Some of my professional goals for this period are:
                </h3>
                <div className="text-foreground whitespace-pre-wrap">{professionalGoals}</div>
              </div>
            )}

            {personalGoals && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Some of my personal goals for this period are:
                </h3>
                <div className="text-foreground whitespace-pre-wrap">{personalGoals}</div>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="border-2 rounded-lg p-6 border-border bg-card">
      <h2 className="text-2xl font-semibold text-foreground mb-4">
        {period ? `My Goals for ${period}` : 'My Goals'}
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goals-period">
            Period (e.g., &quot;January 2025&quot; or &quot;2025&quot;)
          </Label>
          <Input
            id="goals-period"
            type="text"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            placeholder="e.g., January 2025"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals-professional">
            Some of my professional goals for this period are:
          </Label>
          <Textarea
            id="goals-professional"
            value={professionalGoals}
            onChange={(e) => handleProfessionalGoalsChange(e.target.value)}
            placeholder="Enter your professional goals..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals-personal">
            Some of my personal goals for this period are:
          </Label>
          <Textarea
            id="goals-personal"
            value={personalGoals}
            onChange={(e) => handlePersonalGoalsChange(e.target.value)}
            placeholder="Enter your personal goals..."
            rows={4}
          />
        </div>
      </div>
    </section>
  );
}
