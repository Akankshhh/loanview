// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { APP_NAME_KEY } from '@/constants/appConstants';
import { useI18n } from '@/hooks/useI18n';
import { useTheme } from '@/hooks/useTheme';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Building, Sun, Moon, HelpCircle, User, LogOut, UserCircle } from 'lucide-react'; 
import { useState, useEffect } from 'react';
import { useUser } from '@/firebase';
import { signOutUser } from '@/firebase/auth/auth-operations';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';

export function Header() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOutUser(auth);
      router.push('/login'); // Redirect to login page after sign out
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-auto">
          <SidebarTrigger className="md:hidden -ml-2" /> 
          {/* App Name/Logo for mobile, shown when sidebar might be hidden or overlayed */}
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary md:hidden">
             <Building className="h-6 w-6" />
             <span>{t(APP_NAME_KEY)}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <LanguageSelector />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            aria-label={mounted ? t(theme === 'dark' ? 'dashboard.themeToggle.light' : 'dashboard.themeToggle.dark') : t('dashboard.themeToggle.toggle')}
            disabled={!mounted}
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" /> // Render a placeholder icon on the server
            )}
          </Button>
          
          {isUserLoading ? (
             <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? "User"} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{t('nav.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('login.signOutButton')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">
                  <User className="mr-2 h-4 w-4"/>
                  {t('login.signInButton')}
              </Link>
            </Button>
          )}

          <SidebarTrigger className="hidden md:flex" />
        </div>
      </div>
    </header>
  );
}
