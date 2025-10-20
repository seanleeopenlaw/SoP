'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info, Users, ArrowLeft, LogOut } from 'lucide-react';
import { TextListInput } from '@/components/profile/TextListInput';
import { ChronotypeSelector } from '@/components/profile/ChronotypeSelector';
import { BigFiveSelector } from '@/components/profile/BigFiveSelector';
import { GoalsSection } from '@/components/profile/GoalsSection';
import ResizableTraitModal from '@/components/profile/ResizableTraitModal';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';
import AdminRoute from '@/components/AdminRoute';
import { formatDateAU } from '@/lib/date-utils';
import { isValidChronotype } from '@/lib/validators';
import { prepareBigFiveForSave, filterEmptyValues, normalizeChronotype, normalizeGoals } from '@/lib/big-five-utils';
import { getSession, clearSession } from '@/lib/auth-utils';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BigFiveGroup, Profile } from '@/types/profile';

function AdminEditProfileContent() {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; imageUrl: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>('');

  useEffect(() => {
    const session = getSession();
    if (session?.email) {
      setAdminEmail(session.email);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profiles/${profileId}`);
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
        router.push('/users');
      } finally {
        setLoading(false);
      }
    }

    if (profileId) {
      loadProfile();
    }
  }, [profileId, router]);

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

  const handleSave = useCallback(async () => {
    if (!profile?.id) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          team: profile.team,
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
        router.push('/users');
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
  }, [profile, router]);

  const coreValues = profile?.coreValues?.values || [];
  const characterStrengths = profile?.characterStrengths?.strengths || [];
  const selectedChronotypes = (profile?.chronotype?.types || []).filter(type => isValidChronotype(type));
  const bigFiveData = profile?.bigFiveData || [];

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8 flex flex-col items-center justify-center gap-4">
        <ChronotypeLoadingSpinner message="Loading profile..." />
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
            <div className="flex items-center gap-4 flex-1">
              <Button
                onClick={() => router.push('/users')}
                variant="ghost"
                size="icon"
                className="p-2"
                aria-label="Back to directory"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Profile: {profile?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-muted-foreground">{adminEmail}</p>
                  <Button
                    onClick={() => {
                      clearSession();
                      router.push('/');
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive/80 h-auto p-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/users')}
                variant="secondary"
                className="w-full md:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !profile?.id}
                variant="brand"
                className="w-full md:w-auto"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Basic Information, Core Values, Character Strengths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <SectionCard size="compact">
            <h2 className="text-xl font-bold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  type="text"
                  value={profile.team || ''}
                  onChange={(e) => handleBasicInfoChange('team', e.target.value)}
                  placeholder="Team"
                />
              </div>

              <div className="space-y-2">
                <Label>Birthday</Label>
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
              <h2 className="text-xl font-bold" style={{ color: '#E50202' }}>Core Values</h2>
              <Button
                onClick={() => setInfoModal({ title: 'Core Values', imageUrl: '/core-values.png' })}
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 text-primary hover:text-primary/80"
                aria-label="Learn more about Core Values"
              >
                <Info className="w-5 h-5" />
              </Button>
            </div>
            <TextListInput
              label="List top 5 core values"
              values={coreValues}
              onChange={handleCoreValuesChange}
              placeholderPrefix="Value"
            />
          </SectionCard>

          {/* Character Strengths */}
          <SectionCard size="compact">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#E18600' }}>Character Strengths</h2>
              <Button
                onClick={() => setInfoModal({ title: 'Character Strengths', imageUrl: '/strengths.png' })}
                variant="ghost"
                size="icon"
                className="h-auto w-auto p-0 text-primary hover:text-primary/80"
                aria-label="Learn more about Character Strengths"
              >
                <Info className="w-5 h-5" />
              </Button>
            </div>
            <TextListInput
              label="List top 5 signature strengths"
              values={characterStrengths}
              onChange={handleCharacterStrengthsChange}
              placeholderPrefix="Strength"
            />
          </SectionCard>
        </div>

        {/* Chronotype */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Chronotype</h2>
          <ChronotypeSelector
            selected={selectedChronotypes}
            onChange={handleChronotypeChange}
            isReadOnly={false}
          />
        </section>

        {/* Big 5 Personality */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Big 5 Factor of Personality</h2>
          <BigFiveSelector
            data={bigFiveData}
            onChange={handleBigFiveChange}
            isReadOnly={false}
          />
        </section>

        {/* Goals */}
        <GoalsSection
          goals={profile?.goals}
          onChange={handleGoalsChange}
          isReadOnly={false}
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

export default function AdminEditProfilePage() {
  return (
    <AdminRoute>
      <AdminEditProfileContent />
    </AdminRoute>
  );
}
