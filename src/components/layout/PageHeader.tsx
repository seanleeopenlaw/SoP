'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { getSession, clearSession } from '@/lib/auth-utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  showUserInfo?: boolean;
  actions?: ReactNode;
  sticky?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  showLogo = false,
  showUserInfo = true,
  actions,
  sticky = true
}: PageHeaderProps) {
  const router = useRouter();
  const session = getSession();

  const handleLogout = () => {
    clearSession();
    router.push('/');
  };

  return (
    <div className={sticky ? "sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border" : "border-b border-border"}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4 flex-1">
            {showLogo && (
              <Image
                src="/logo.svg"
                alt={`${title} Logo`}
                width={60}
                height={60}
                priority
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <div className="flex items-center gap-3 mt-1">
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
                {showUserInfo && session && (
                  <>
                    {subtitle && <span className="text-muted-foreground">•</span>}
                    <p className="text-sm text-muted-foreground">{session.email}</p>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
