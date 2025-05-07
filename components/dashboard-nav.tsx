'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings, User, ChevronDown, Menu, X, Bell, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBadge } from '@/components/notification-badge';
import { NotificationPanel } from '@/components/notification-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface DashboardNavProps {
  username: string;
  userId: string;
  profilePicture?: string | null;
}

export function DashboardNav({ username, userId, profilePicture }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = username === 'AimTzy';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLoadingRoute(null);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      console.log(`[Logout] Starting logout for user: ${username}, userId: ${userId}`);
      console.log(`[Logout] Current localStorage:`, JSON.stringify(localStorage));
      console.log(`[Logout] Current sessionStorage:`, JSON.stringify(sessionStorage));
      console.log(`[Logout] Current cookies:`, document.cookie);

      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('auth_token');

      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      document.cookie = 'auth_token=; path=/dashboard; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

      console.log(`[Logout] Cookies after client-side deletion:`, document.cookie);

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to logout on server');
      }

      console.log(`[Logout] After API call - localStorage:`, JSON.stringify(localStorage));
      console.log(`[Logout] After API call - sessionStorage:`, JSON.stringify(sessionStorage));
      console.log(`[Logout] After API call - cookies:`, document.cookie);

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });

      router.push('/login');
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('[Logout] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (href: string) => {
    if (href === '#') return;
    setLoadingRoute(href);
    router.push(href);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      title: 'GALXE',
      href: isAdmin ? '/dashboard/galxe-admin' : '/dashboard/galxe-user',
      active: pathname.includes('/dashboard/galxe'),
    },
    {
      title: 'Market',
      href: '#',
      disabled: true,
      comingSoon: true,
      active: false,
    },
    {
      title: 'Transfer',
      href: '#',
      disabled: true,
      comingSoon: true,
      active: false,
    },
    {
      title: 'Leaderboard',
      href: '#',
      disabled: true,
      comingSoon: true,
      active: false,
    },
  ];

  // Gunakan useMemo untuk diceBearUrl
  const diceBearUrl = useMemo(
    () => `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
    [username]
  );

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'hidden md:flex items-center justify-between sticky top-0 z-30 px-6 py-4 transition-all duration-300',
          isScrolled ? 'bg-[#1a1f2e]/80 backdrop-blur-md border-b border-gray-700/50 shadow-lg' : 'bg-transparent',
        )}
      >
        <div className='flex items-center space-x-6'>
          <div className='mr-6'>
            <Link href='/dashboard' className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='text-white'
                >
                  <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
                  <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
                </svg>
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Crypto Tracker
              </span>
            </Link>
          </div>

          <div className='flex items-center space-x-3'>
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                disabled={item.disabled || loadingRoute === item.href}
                className={cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  item.active
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                  item.disabled && 'opacity-70 cursor-not-allowed',
                )}
              >
                {loadingRoute === item.href ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
                {item.title}
                {item.comingSoon && (
                  <span className='ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full'>
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <div>
                <NotificationBadge onClick={() => setShowNotifications(!showNotifications)} userId={userId} />
              </div>
            </PopoverTrigger>
            <PopoverContent side='bottom' align='end' className='p-0 bg-transparent border-none shadow-xl'>
              <NotificationPanel
                onClose={() => setShowNotifications(false)}
                userId={userId}
                onViewAll={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/notifications');
                }}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant='ghost'
            size='icon'
            className='text-gray-400 hover:text-white'
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className='h-5 w-5' />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className='flex items-center ml-4 pl-4 border-l border-gray-700 cursor-pointer'>
                <Avatar className='h-8 w-8 mr-2'>
                  <AvatarImage src={profilePicture || diceBearUrl} alt={username} />
                  <AvatarFallback className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex items-center'>
                  <span className='text-sm font-medium text-white'>{username}</span>
                  <ChevronDown className='h-4 w-4 ml-1 text-gray-400' />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 bg-[#1a1f2e] border-gray-700'>
              <DropdownMenuLabel className='text-gray-400'>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-gray-700' />
              <DropdownMenuItem asChild>
                <Link href='/dashboard/settings' className='cursor-pointer text-white'>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/dashboard/notifications' className='cursor-pointer text-white'>
                  <Bell className='mr-2 h-4 w-4' />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href='/dashboard/community' className='cursor-pointer text-white'>
                  <User className='mr-2 h-4 w-4' />
                  <span>Community</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className='bg-gray-700' />
              <DropdownMenuItem
                className='text-red-400 hover:text-red-300 focus:text-red-300 cursor-pointer'
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <LogOut className='mr-2 h-4 w-4' />}
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className='md:hidden'>
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3 sticky top-0 z-30 transition-all duration-300',
            isScrolled ? 'bg-[#1a1f2e]/80 backdrop-blur-md border-b border-gray-700/50 shadow-md' : 'bg-transparent',
          )}
        >
          <Link href='/dashboard' className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-white'
              >
                <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
                <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
              </svg>
            </div>
            <span className='text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Crypto Tracker
            </span>
          </Link>

          <div className='flex items-center gap-2'>
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <div>
                  <NotificationBadge onClick={() => setShowNotifications(!showNotifications)} userId={userId} />
                </div>
              </PopoverTrigger>
              <PopoverContent side='bottom' align='end' className='p-0 bg-transparent border-none shadow-xl'>
                <NotificationPanel
                  onClose={() => setShowNotifications(false)}
                  userId={userId}
                  onViewAll={() => {
                    setShowNotifications(false);
                    router.push('/dashboard/notifications');
                  }}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='text-gray-400'
            >
              {isMobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='bg-[#1a1f2e] border-b border-gray-700 overflow-hidden'
            >
              <div className='px-4 py-2 space-y-1'>
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    disabled={item.disabled || loadingRoute === item.href}
                    className={cn(
                      'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                      item.active
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                      item.disabled && 'opacity-70 cursor-not-allowed',
                    )}
                  >
                    {loadingRoute === item.href ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : null}
                    {item.title}
                    {item.comingSoon && (
                      <span className='ml-1.5 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-300 rounded-full'>
                        Soon
                      </span>
                    )}
                  </button>
                ))}

                <button
                  onClick={() => handleNavigation('/dashboard/settings')}
                  className={cn(
                    'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === '/dashboard/settings'
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                  )}
                >
                  <Settings className='h-4 w-4 mr-2' />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => handleNavigation('/dashboard/notifications')}
                  className={cn(
                    'flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    pathname === '/dashboard/notifications'
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50',
                  )}
                >
                  <Bell className='h-4 w-4 mr-2' />
                  <span>Notifications</span>
                </button>

                <div className='pt-2 mt-2 border-t border-gray-700'>
                  <div className='flex items-center px-4 py-3'>
                    <Avatar className='h-8 w-8 mr-2'>
                      <AvatarImage src={profilePicture || diceBearUrl} alt={username} />
                      <AvatarFallback className='bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
                        {username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className='text-sm font-medium text-white'>{username}</span>
                      <p className='text-xs text-gray-400'>Member</p>
                      <p className='text-xs text-gray-400'>{profilePicture}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className='flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-gray-800/50'
                  >
                    {isLoggingOut ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <LogOut className='mr-2 h-4 w-4' />
                    )}
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}