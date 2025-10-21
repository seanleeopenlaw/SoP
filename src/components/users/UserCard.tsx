'use client';

import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  team?: string | null;
  jobTitle?: string | null;
  chronotype?: {
    types: string[];
    primaryType: string;
  } | null;
  completeness: number;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getChronotypeEmoji = (type: string) => {
  switch (type) {
    case 'Lion':
      return '🦁';
    case 'Bear':
      return '🐻';
    case 'Wolf':
      return '🐺';
    case 'Dolphin':
      return '🐬';
    default:
      return '❓';
  }
};

export const UserCard = memo(function UserCard({ id, name, email, team, jobTitle, chronotype, completeness, isAdmin, onEdit, onDelete }: UserCardProps) {
  const profileUrl = `/users/${id}`;
  const chronotypeTypes = chronotype?.types || [];
  const displayTypes = chronotypeTypes.slice(0, 4); // Show max 4 chronotypes

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <Link
      href={profileUrl}
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card block",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/50",
        "hover:-translate-y-1 hover:scale-[1.02] cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      )}
      aria-label={`View ${name}'s profile`}
    >
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>

          {/* Chronotype Emojis - Stacked when multiple */}
          <div className="flex-shrink-0 ml-3">
            {displayTypes.length > 0 ? (
              displayTypes.length === 1 ? (
                // Single chronotype - show normally (same size as multiple)
                <span className="text-2xl" title={displayTypes[0]}>
                  {getChronotypeEmoji(displayTypes[0])}
                </span>
              ) : (
                // Multiple chronotypes - stack with slight overlap
                <div
                  className="relative flex items-center"
                  style={{
                    width: `${20 + (displayTypes.length - 1) * 16}px`,
                    height: '32px'
                  }}
                >
                  {displayTypes.map((type, index) => (
                    <span
                      key={type}
                      className="absolute text-2xl"
                      style={{
                        left: `${index * 16}px`,
                        zIndex: displayTypes.length - index,
                      }}
                      title={type}
                    >
                      {getChronotypeEmoji(type)}
                    </span>
                  ))}
                </div>
              )
            ) : (
              <span className="text-2xl">❓</span>
            )}
          </div>
        </div>

        {/* Team and Job Title */}
        {team && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {team}
            </span>
            <span className="text-xs text-muted-foreground">
              {jobTitle || 'Senior Developer'}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium text-foreground">{completeness}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                completeness === 100 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex-1 py-2 px-4 rounded-md text-center bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white font-medium text-sm transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-4 rounded-md text-center bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-medium text-sm transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        )}

        {/* View Label */}
        <div
          className={cn(
            "w-full py-2 px-4 rounded-md text-center",
            "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
            "font-medium text-sm transition-colors duration-200",
            "group-hover:shadow-md"
          )}
        >
          View Profile
        </div>
      </div>
    </Link>
  );
}, (prevProps, nextProps) => {
  // Custom comparator: only re-render if these specific props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.email === nextProps.email &&
    prevProps.team === nextProps.team &&
    prevProps.jobTitle === nextProps.jobTitle &&
    prevProps.completeness === nextProps.completeness &&
    prevProps.isAdmin === nextProps.isAdmin &&
    JSON.stringify(prevProps.chronotype) === JSON.stringify(nextProps.chronotype)
  );
});
