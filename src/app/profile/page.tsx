'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Info, Users, LogOut } from 'lucide-react';
import { TextListInput } from '@/components/profile/TextListInput';
import { ChronotypeSelector } from '@/components/profile/ChronotypeSelector';
import { BigFiveSelector } from '@/components/profile/BigFiveSelector';
import { GoalsSection } from '@/components/profile/GoalsSection';
import ResizableTraitModal from '@/components/profile/ResizableTraitModal';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatDateAU } from '@/lib/date-utils';
import { isValidChronotype } from '@/lib/validators';
import { getSession, clearSession, isAdminUser } from '@/lib/auth-utils';
import { useProfileEditor } from '@/hooks/useProfileEditor';
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

function ProfilePageContent() {
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [infoModal, setInfoModal] = useState<{ title: string; imageUrl: string } | null>(null);
  const router = useRouter();

  const { profile, setProfile, saving, handlers } = useProfileEditor({
    initialProfile,
    onSaveSuccess: () => {
      setIsReadOnly(true);
    },
  });

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
        setInitialProfile(data);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, setProfile]);

  const handleLogout = useCallback(() => {
    clearSession();
    router.push('/');
  }, [router]);

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
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 h-auto p-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
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
                  onClick={handlers.handleSave}
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
                  <h3 className="text-xl font-bold" style={{ color: '#E50202' }}>Core Values</h3>
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
                  <h3 className="text-xl font-bold" style={{ color: '#E18600' }}>Character Strengths</h3>
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handlers.handleBasicInfoChange('name', e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  type="text"
                  value={profile.team || ''}
                  onChange={(e) => handlers.handleBasicInfoChange('team', e.target.value)}
                  placeholder="Your team"
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
                        handlers.handleBasicInfoChange('birthday', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
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
                        handlers.handleBasicInfoChange('birthday', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
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
              label="List your top 5 core values"
              values={coreValues}
              onChange={handlers.handleCoreValuesChange}
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
              label="List your top 5 signature strengths"
              values={characterStrengths}
              onChange={handlers.handleCharacterStrengthsChange}
              placeholderPrefix="Strength"
            />
          </SectionCard>
        </div>
        )}

        {/* Chronotype */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Chronotype</h2>
          <ChronotypeSelector
            selected={selectedChronotypes}
            onChange={handlers.handleChronotypeChange}
            isReadOnly={isReadOnly}
          />
        </section>

        {/* Big 5 Personality */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Big 5 Factor of Personality</h2>
          <BigFiveSelector
            data={bigFiveData}
            onChange={handlers.handleBigFiveChange}
            isReadOnly={isReadOnly}
          />
        </section>

        {/* Goals */}
        <GoalsSection
          goals={profile?.goals}
          onChange={handlers.handleGoalsChange}
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
