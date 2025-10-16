'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Info, Users, LogOut } from 'lucide-react';
import { TextListInput } from '@/components/profile/TextListInput';
import { ChronotypeSelector } from '@/components/profile/ChronotypeSelector';
import { BigFiveSelector } from '@/components/profile/BigFiveSelector';
import { GoalsSection } from '@/components/profile/GoalsSection';
import ResizableTraitModal from '@/components/profile/ResizableTraitModal';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { cn } from '@/lib/utils';
import { formatDateAU, toInputDate, toMonthDay, fromMonthDay } from '@/lib/date-utils';
import { isValidEmail, isValidChronotype } from '@/lib/validators';
import { getSession, clearSession, isAdminUser } from '@/lib/auth-utils';
import { transformBigFiveGroupToDatabase } from '@/lib/big-five-config';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { SectionCard } from '@/components/ui/section-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Subtrait, BigFiveGroup, Profile } from '@/types/profile';

function ProfilePageContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; imageUrl: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }

    async function loadProfile() {
      try {
        const res = await fetch('/api/profile-by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: session?.email }),
        });
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleLogout = useCallback(() => {
    clearSession();
    router.push('/');
  }, [router]);

  // Memoized handlers
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

  const handleEmailEdit = useCallback(() => {
    if (profile) {
      setTempEmail(profile.email);
      setEditingEmail(true);
    }
  }, [profile]);


  const handleEmailSave = useCallback(() => {
    if (!profile || !tempEmail.trim()) return;

    const normalizedEmail = tempEmail.toLowerCase().trim();

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Update profile state (session will be updated after successful save)
    setProfile((prev) => prev ? { ...prev, email: normalizedEmail } : null);
    setEditingEmail(false);
  }, [profile, tempEmail]);

  const handleEmailCancel = useCallback(() => {
    setEditingEmail(false);
    setTempEmail('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      // Transform bigFiveData to bigFiveProfile format
      // Convert UI format (level, score) to database format (overallLevel, overallScore, groupName)
      const bigFiveProfile = profile.bigFiveData ? {
        neuroticismData: profile.bigFiveData.find(g => g.name === 'Neuroticism')
          ? transformBigFiveGroupToDatabase(profile.bigFiveData.find(g => g.name === 'Neuroticism')!)
          : undefined,
        extraversionData: profile.bigFiveData.find(g => g.name === 'Extraversion')
          ? transformBigFiveGroupToDatabase(profile.bigFiveData.find(g => g.name === 'Extraversion')!)
          : undefined,
        opennessData: profile.bigFiveData.find(g => g.name === 'Openness to Experience')
          ? transformBigFiveGroupToDatabase(profile.bigFiveData.find(g => g.name === 'Openness to Experience')!)
          : undefined,
        agreeablenessData: profile.bigFiveData.find(g => g.name === 'Agreeableness')
          ? transformBigFiveGroupToDatabase(profile.bigFiveData.find(g => g.name === 'Agreeableness')!)
          : undefined,
        conscientiousnessData: profile.bigFiveData.find(g => g.name === 'Conscientiousness')
          ? transformBigFiveGroupToDatabase(profile.bigFiveData.find(g => g.name === 'Conscientiousness')!)
          : undefined,
      } : undefined;

      // Filter out empty arrays to avoid database constraint issues
      const coreValuesArray = profile.coreValues?.values?.filter(v => v) || [];
      const characterStrengthsArray = profile.characterStrengths?.strengths?.filter(s => s) || [];

      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          team: profile.team,
          birthday: profile.birthday || undefined,
          coreValues: coreValuesArray.length > 0 ? coreValuesArray : undefined,
          characterStrengths: characterStrengthsArray.length > 0 ? characterStrengthsArray : undefined,
          chronotype: profile.chronotype
            ? {
                types: profile.chronotype.types,
                primaryType: profile.chronotype.primaryType,
              }
            : undefined,
          bigFiveProfile,
          goals: profile.goals?.period ? {
            period: profile.goals.period,
            professionalGoals: profile.goals.professionalGoals || undefined,
            personalGoals: profile.goals.personalGoals || undefined,
          } : undefined,
        }),
      });

      if (res.ok) {
        // Session is already updated with email, no need to update sessionStorage
        toast.success('Profile saved successfully!');
        setIsReadOnly(true);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save error:', errorData);
        toast.error(errorData.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  // Simple property access - no memoization needed
  const coreValues = profile?.coreValues?.values || [];
  const characterStrengths = profile?.characterStrengths?.strengths || [];

  // Safe chronotype validation - support multiple chronotypes
  const selectedChronotypes = (profile?.chronotype?.types || []).filter(type => isValidChronotype(type));

  const bigFiveData = profile?.bigFiveData || [];

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8 flex flex-col items-center justify-center gap-4">
        <ChronotypeLoadingSpinner message="Loading your profile..." />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Profile not found</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{profile?.name || 'Your Profile'}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/users')}
                variant="secondary"
                className="w-full md:w-auto"
              >
                <Users className="w-4 h-4" />
                Team Directory
              </Button>
              {isAdminUser() && (
                <Button
                  onClick={() => router.push('/admin/import')}
                  variant="secondary"
                  className="w-full md:w-auto"
                >
                  Admin
                </Button>
              )}
              {isReadOnly ? (
                <Button
                  onClick={() => setIsReadOnly(false)}
                  variant="brand"
                  className="w-full md:w-auto"
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving || !profile?.id}
                  variant="brand"
                  className="w-full md:w-auto"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">

        {/* Basic Information, Core Values, Character Strengths */}
        {isReadOnly ? (
          <SectionCard className="max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Basic Information */}
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-bold mb-3">Basic Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Team:</span>{' '}
                    <span className="text-foreground font-medium">{profile.team || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Birthday:</span>{' '}
                    <span className="text-foreground font-medium">{formatDateAU(profile.birthday)}</span>
                  </div>
                </div>
              </div>

              {/* Core Values */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-foreground">Core Values</h3>
                  <button
                    onClick={() => setInfoModal({ title: 'Core Values', imageUrl: '/core-values.png' })}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Learn more about Core Values"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  {coreValues.filter(v => v).map((value, i) => (
                    <div key={i} className="text-foreground">{value}</div>
                  ))}
                  {coreValues.filter(v => v).length === 0 && (
                    <div className="text-muted-foreground italic">Not set</div>
                  )}
                </div>
              </div>

              {/* Character Strengths */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-character-strength">Character Strengths</h3>
                  <button
                    onClick={() => setInfoModal({ title: 'Character Strengths', imageUrl: '/strengths.png' })}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label="Learn more about Character Strengths"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  {characterStrengths.filter(s => s).map((strength, i) => (
                    <div key={i} className="text-foreground">{strength}</div>
                  ))}
                  {characterStrengths.filter(s => s).length === 0 && (
                    <div className="text-muted-foreground italic">Not set</div>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <SectionCard size="compact">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-input border border-border text-foreground px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Team</label>
                <input
                  type="text"
                  value={profile.team || ''}
                  onChange={(e) => handleBasicInfoChange('team', e.target.value)}
                  placeholder="Your team"
                  className="w-full bg-input border border-border text-foreground px-4 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Birthday</label>
                <div className="flex gap-3">
                  <Select
                    value={profile.birthday ? String(new Date(profile.birthday).getMonth() + 1) : ''}
                    onValueChange={(value) => {
                      const month = value;
                      const day = profile.birthday ? new Date(profile.birthday).getDate() : 1;
                      if (month) {
                        const year = new Date().getFullYear();
                        handleBasicInfoChange('birthday', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[60%]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={profile.birthday ? String(new Date(profile.birthday).getDate()) : ''}
                    onValueChange={(value) => {
                      const day = value;
                      const month = profile.birthday ? new Date(profile.birthday).getMonth() + 1 : 1;
                      if (day) {
                        const year = new Date().getFullYear();
                        handleBasicInfoChange('birthday', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[37%]">
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Core Values */}
          <SectionCard size="compact">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-foreground">Core Values</h2>
              <button
                onClick={() => setInfoModal({ title: 'Core Values', imageUrl: '/core-values.png' })}
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Learn more about Core Values"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            <TextListInput
              label="List your top 5 core values"
              values={coreValues}
              onChange={handleCoreValuesChange}
              placeholderPrefix="Value"
            />
          </SectionCard>

          {/* Character Strengths */}
          <SectionCard size="compact">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-character-strength">Character Strengths</h2>
              <button
                onClick={() => setInfoModal({ title: 'Character Strengths', imageUrl: '/strengths.png' })}
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Learn more about Character Strengths"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            <TextListInput
              label="List your top 5 signature strengths"
              values={characterStrengths}
              onChange={handleCharacterStrengthsChange}
              placeholderPrefix="Strength"
            />
          </SectionCard>
        </div>
        )}

        <Separator className="my-8" />

        {/* Chronotype */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Chronotype</h2>
          <ChronotypeSelector
            selected={selectedChronotypes}
            onChange={handleChronotypeChange}
            isReadOnly={isReadOnly}
          />
        </section>

        <Separator className="my-8" />

        {/* Big 5 Personality */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Big 5 Factor of Personality</h2>
          <BigFiveSelector
            data={bigFiveData}
            onChange={handleBigFiveChange}
            isReadOnly={isReadOnly}
          />
        </section>

        <Separator className="my-8" />

        {/* Goals */}
        <GoalsSection
          goals={profile?.goals}
          onChange={handleGoalsChange}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Info Modal */}
      {infoModal && (
        <ResizableTraitModal
          title={infoModal.title}
          description=""
          imageUrl={infoModal.imageUrl}
          onClose={() => setInfoModal(null)}
        />
      )}
    </main>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
