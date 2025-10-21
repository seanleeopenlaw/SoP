/**
 * Custom hook for profile editing functionality
 * Manages all state and handlers for profile editing across different pages
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { prepareBigFiveForSave, filterEmptyValues, normalizeChronotype, normalizeGoals } from '@/lib/big-five-utils';
import { logger } from '@/lib/logger';
import type { Profile, BigFiveGroup } from '@/types/profile';

interface UseProfileEditorOptions {
  initialProfile: Profile | null;
  onSaveSuccess?: () => void | Promise<void>;
  onSaveError?: (error: Error) => void;
}

interface UseProfileEditorReturn {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  saving: boolean;
  handlers: {
    handleBasicInfoChange: (field: string, value: string) => void;
    handleCoreValuesChange: (values: string[]) => void;
    handleCharacterStrengthsChange: (strengths: string[]) => void;
    handleChronotypeChange: (types: ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[]) => void;
    handleBigFiveChange: (data: BigFiveGroup[]) => void;
    handleGoalsChange: (goals: { period: string; professionalGoals?: string; personalGoals?: string }) => void;
    handleSave: () => Promise<boolean>;
  };
}

export function useProfileEditor({
  initialProfile,
  onSaveSuccess,
  onSaveError,
}: UseProfileEditorOptions): UseProfileEditorReturn {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [saving, setSaving] = useState(false);

  const handleBasicInfoChange = useCallback((field: string, value: string) => {
    setProfile((prev) => prev ? { ...prev, [field]: value } : null);
  }, []);

  const handleCoreValuesChange = useCallback((values: string[]) => {
    setProfile((prev) => prev ? { ...prev, coreValues: { values } } : null);
  }, []);

  const handleCharacterStrengthsChange = useCallback((strengths: string[]) => {
    setProfile((prev) => prev ? { ...prev, characterStrengths: { strengths } } : null);
  }, []);

  const handleChronotypeChange = useCallback((types: ('Lion' | 'Bear' | 'Wolf' | 'Dolphin')[]) => {
    setProfile((prev) => prev ? {
      ...prev,
      chronotype: {
        types,
        primaryType: types[0] || 'Lion',
      },
    } : null);
  }, []);

  const handleBigFiveChange = useCallback((data: BigFiveGroup[]) => {
    setProfile((prev) => prev ? { ...prev, bigFiveData: data } : null);
  }, []);

  const handleGoalsChange = useCallback((goals: { period: string; professionalGoals?: string; personalGoals?: string }) => {
    setProfile((prev) => prev ? { ...prev, goals } : null);
  }, []);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!profile?.id) {
      toast.error('Profile ID is missing');
      return false;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          team: profile.team,
          jobTitle: profile.jobTitle?.trim() || null, // Normalize empty strings to null
          birthday: profile.birthday || undefined,
          coreValues: filterEmptyValues(profile.coreValues?.values),
          characterStrengths: filterEmptyValues(profile.characterStrengths?.strengths),
          chronotype: normalizeChronotype(profile.chronotype),
          bigFiveProfile: prepareBigFiveForSave(profile.bigFiveData),
          goals: normalizeGoals(profile.goals),
        }),
      });

      if (res.ok) {
        toast.success('Profile saved successfully!');
        await onSaveSuccess?.();
        return true;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        logger.error('Save error:', errorData);
        toast.error(errorData.error || 'Failed to save profile');
        onSaveError?.(new Error(errorData.error || 'Failed to save profile'));
        return false;
      }
    } catch (error) {
      logger.error('Error saving profile:', error);
      toast.error('Error saving profile');
      onSaveError?.(error instanceof Error ? error : new Error('Unknown error'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [profile, onSaveSuccess, onSaveError]);

  return {
    profile,
    setProfile,
    saving,
    handlers: {
      handleBasicInfoChange,
      handleCoreValuesChange,
      handleCharacterStrengthsChange,
      handleChronotypeChange,
      handleBigFiveChange,
      handleGoalsChange,
      handleSave,
    },
  };
}
