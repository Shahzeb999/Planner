'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Home, 
  BookOpen, 
  Code, 
  BarChart3, 
  Search, 
  Settings, 
  Target,
  Upload,
  Clock
} from 'lucide-react';
import UserProfile from '@/components/auth/UserProfile';

const navItems = [
  { href: '/home', label: 'Home', icon: Home, shortcut: 'h' },
  { href: '/today', label: 'Today', icon: Clock, shortcut: 't' },
  { href: '/calendar', label: 'Calendar', icon: Calendar, shortcut: 'c' },
  { href: '/problems', label: 'Problems', icon: Code, shortcut: 'p' },
  { href: '/playbooks', label: 'Playbooks', icon: BookOpen, shortcut: 'r' },
  { href: '/mocks', label: 'Mocks', icon: Target, shortcut: 'm' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, shortcut: 'a' },
  { href: '/import', label: 'Import', icon: Upload, shortcut: 'i' },
  { href: '/search', label: 'Search', icon: Search, shortcut: '/' },
  { href: '/settings', label: 'Settings', icon: Settings, shortcut: 's' },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Don't show navigation on auth page
  if (pathname === '/auth') {
    return null;
  }

  // Show loading state during authentication
  if (loading) {
    return (
      <nav className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">LLM Prep Planner</h1>
          <p className="text-sm text-gray-600 mt-1">6-Month Program</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </nav>
    );
  }

  // Show minimal navigation for unauthenticated users
  if (!user) {
    return (
      <nav className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-full">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">LLM Prep Planner</h1>
          <p className="text-sm text-gray-600 mt-1">6-Month Program</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-gray-500">
            <p className="text-sm">Please sign in to access your planner</p>
            <Link 
              href="/auth"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col w-64 bg-gray-50 border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">LLM Prep Planner</h1>
        <p className="text-sm text-gray-600 mt-1">6-Month Program</p>
      </div>
      
      <div className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && item.href !== '/home' && pathname?.startsWith(item.href)) ||
              (item.href === '/home' && pathname === '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                    {item.shortcut}
                  </kbd>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Timezone: Asia/Kolkata (IST)</p>
          <p>Last Import: Never</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <UserProfile />
        </div>
      </div>
    </nav>
  );
}
