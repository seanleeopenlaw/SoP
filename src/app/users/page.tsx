'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Shield, LogIn, LogOut } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserCard } from '@/components/users/UserCard';
import { ChronotypeLoadingSpinner } from '@/components/LoadingSpinner';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { isAdminUser, isAuthenticated, getSession, clearSession } from '@/lib/auth-utils';
import { calculateProfileCompleteness } from '@/lib/profile-utils';
import type { Profile } from '@/types/profile';
import { logger } from '@/lib/logger';

async function fetchAllProfiles(): Promise<Profile[]> {
  let allProfiles: Profile[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/profiles?page=${page}&limit=100`);
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    const result = await response.json();
    allProfiles = [...allProfiles, ...(result.data || [])];
    hasMore = result.pagination?.hasNext || false;
    page++;
  }

  return allProfiles;
}

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use React Query for data fetching with caching
  const { data: profiles = [], isLoading, refetch } = useQuery({
    queryKey: ['profiles'],
    queryFn: fetchAllProfiles,
    staleTime: 60 * 1000, // 60 seconds
  });

  useEffect(() => {
    const session = getSession();
    setIsLoggedIn(isAuthenticated());
    setIsAdmin(isAdminUser());
    setUserEmail(session?.email || null);
  }, []);

  // Memoize filtered profiles for performance
  const filteredProfiles = useMemo(() => {
    if (searchQuery.trim() === '') {
      return profiles;
    }
    const query = searchQuery.toLowerCase();
    return profiles.filter(profile =>
      profile.name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query)
    );
  }, [searchQuery, profiles]);

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    setProfileToDelete({ id, name: profile.name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!profileToDelete) return;

    setDeleteDialogOpen(false);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/profiles/${profileToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Delete failed:', errorData);
        throw new Error(errorData.error || 'Failed to delete profile');
      }

      // Refetch the profiles list without page reload
      await refetch();

      toast.success(`${profileToDelete.name}'s profile has been deleted`);
    } catch (error) {
      logger.error('Error deleting profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete profile. Please try again.');
    } finally {
      setIsDeleting(false);
      setProfileToDelete(null);
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      {/* Deleting Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg p-8 flex flex-col items-center gap-4">
            <ChronotypeLoadingSpinner message="Deleting profile..." />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.svg"
              alt="Team Directory Logo"
              width={60}
              height={60}
              priority
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Directory</h1>
              {isLoggedIn && userEmail && (
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
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
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              if (!isLoggedIn) {
                router.push('/');
              } else if (isAdmin) {
                router.push('/admin/import');
              } else {
                router.push('/profile');
              }
            }}
            variant="brand"
          >
            {!isLoggedIn ? (
              <>
                <LogIn className="w-4 h-4" />
                Login
              </>
            ) : isAdmin ? (
              <>
                <Shield className="w-4 h-4" />
                Admin
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                My Profile
              </>
            )}
          </Button>
        </div>

        {!isLoading && profiles.length > 0 && (
          <div className="mb-6">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name or email..."
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <ChronotypeLoadingSpinner message="Loading team directory..." />
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'No matching profiles found' : 'No user profiles found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <UserCard
                key={profile.id}
                id={profile.id}
                name={profile.name}
                email={profile.email}
                team={profile.team}
                chronotype={profile.chronotype}
                completeness={calculateProfileCompleteness(profile)}
                isAdmin={isAdmin}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{profileToDelete?.name}</strong>'s profile?
              This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
