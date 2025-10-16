'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ChronotypeSelector } from '@/components/profile/ChronotypeSelector';
import { BigFiveSelector } from '@/components/profile/BigFiveSelector';
import { GoalsSection } from '@/components/profile/GoalsSection';
import ResizableTraitModal from '@/components/profile/ResizableTraitModal';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateAU } from '@/lib/date-utils';
import type { BigFiveGroup } from '@/types/profile';

interface BigFiveProfileData {
  opennessData?: any;
  conscientiousnessData?: any;
  extraversionData?: any;
  agreeablenessData?: any;
  neuroticismData?: any;
}

type ChronotypeType = 'Lion' | 'Bear' | 'Wolf' | 'Dolphin';

interface Profile {
  id: string;
  name: string;
  email: string;
  team: string | null;
  birthday: string | null;
  chronotype: {
    types: ChronotypeType[];
    primaryType: ChronotypeType;
  } | null;
  coreValues: { values: string[] } | null;
  characterStrengths: { strengths: string[] } | null;
  bigFiveProfile?: BigFiveProfileData | null;
  bigFiveData?: BigFiveGroup[];
  goals?: {
    period: string;
    professionalGoals?: string | null;
    personalGoals?: string | null;
  } | null;
}

async function fetchProfile(id: string): Promise<Profile> {
  const response = await fetch(`/api/profiles/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
}

async function fetchBigFiveData(id: string): Promise<BigFiveGroup[]> {
  const response = await fetch(`/api/profiles/${id}/bigfive`);
  if (!response.ok) {
    throw new Error('Failed to fetch Big Five data');
  }
  const data = await response.json();
  return data.bigFiveData || [];
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [infoModal, setInfoModal] = useState<{ title: string; imageUrl: string } | null>(null);

  const profileId = params.id as string;

  // Use React Query for data fetching with caching
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => fetchProfile(profileId),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Lazy load Big Five data only if it exists
  const hasBigFive = profile?.bigFiveProfile?.id;
  const { data: bigFiveData } = useQuery({
    queryKey: ['bigFive', profileId],
    queryFn: () => fetchBigFiveData(profileId),
    enabled: !!profileId && !!hasBigFive,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <ChronotypeLoadingSpinner message="Loading profile..." />
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/users')}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Back to directory"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded">
            READ-ONLY
          </span>
        </div>

        {/* Basic Info, Core Values, Character Strengths */}
        <section className="border-2 rounded-lg p-6 border-border bg-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Basic Information */}
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-bold mb-3">Basic Info</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{' '}
                  <span className="text-foreground font-medium">{profile.name || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Team:</span>{' '}
                  <span className="text-foreground font-medium">{profile.team || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Birthday:</span>{' '}
                  <span className="text-foreground font-medium">
                    {formatDateAU(profile.birthday)}
                  </span>
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
                {profile.coreValues?.values && profile.coreValues.values.length > 0 ? (
                  profile.coreValues.values.filter(v => v).map((value, i) => (
                    <div key={i} className="text-foreground">{value}</div>
                  ))
                ) : (
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
                {profile.characterStrengths?.strengths && profile.characterStrengths.strengths.length > 0 ? (
                  profile.characterStrengths.strengths.filter(s => s).map((strength, i) => (
                    <div key={i} className="text-foreground">{strength}</div>
                  ))
                ) : (
                  <div className="text-muted-foreground italic">Not set</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Chronotype */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Chronotype</h2>
          <ChronotypeSelector
            selected={profile.chronotype?.types || []}
            onChange={() => {}}
            isReadOnly={true}
          />
        </div>

        {/* Big Five */}
        {hasBigFive ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-big-five mb-4">
              Big 5 Factor of Personality
            </h2>
            {bigFiveData && bigFiveData.length > 0 ? (
              <BigFiveSelector
                data={bigFiveData}
                onChange={() => {}}
                isReadOnly={true}
              />
            ) : (
              <div className="border-2 rounded-lg p-6 border-border bg-card">
                <div className="flex items-center justify-center py-8">
                  <ChronotypeLoadingSpinner message="Loading Big Five data..." />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-big-five mb-4">
              Big 5 Factor of Personality
            </h2>
            <div className="border-2 rounded-lg p-6 border-border bg-card">
              <div className="text-center py-8 text-muted-foreground italic">
                Not set
              </div>
            </div>
          </div>
        )}

        {/* Goals */}
        <div className="mb-8">
          <GoalsSection
            goals={profile.goals}
            onChange={() => {}}
            isReadOnly={true}
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
      </div>
    </main>
  );
}
