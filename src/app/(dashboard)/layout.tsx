'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Home,
  Beef,
  Sprout,
  Users,
  Wrench,
  ClipboardList,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  UserCog,
  ChevronDown,
  User,
  MoreHorizontal,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/NotificationBell';

type NavChild = { name: string; href: string; children?: { name: string; href: string }[] };

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  children?: NavChild[];
};

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { 
    name: 'Livestock', href: '/dashboard/livestock', icon: Beef,
    children: [
      { name: 'All Livestock', href: '/dashboard/livestock' },
      { name: 'Goats', href: '/dashboard/goats', children: [
        { name: 'All Goats', href: '/dashboard/goats' },
        { name: 'Inventory', href: '/dashboard/goats/inventory' },
        { name: 'Daily Tracker', href: '/dashboard/goats/daily-tracker' },
        { name: 'Breeding', href: '/dashboard/goats/breeding' },
        { name: 'Health', href: '/dashboard/goats/health' },
      ]},
    ]
  },
  { 
    name: 'Crops', href: '/dashboard/crops', icon: Sprout,
    children: [
      { name: 'All Crops', href: '/dashboard/crops' },
      { name: 'Crop Daily Tracker', href: '/dashboard/crops/daily-tracker' },
    ]
  },
  { name: 'Workers', href: '/dashboard/workers', icon: Users, adminOnly: true },
  { name: 'Equipment', href: '/dashboard/equipment', icon: Wrench },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

// Bottom nav shows first 4 items + "More" for mobile
const bottomNavItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Livestock', href: '/dashboard/livestock', icon: Beef },
  { name: 'Crops', href: '/dashboard/crops', icon: Sprout },
  { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auto-expand sections whose children match the current route
  useEffect(() => {
    navigation.forEach((item) => {
      if (item.children) {
        const anyChildActive = item.children.some(child => 
          isActive(child.href) || child.children?.some(sub => isActive(sub.href))
        );
        if (anyChildActive) {
          setExpandedSections(prev => prev.includes(item.name) ? prev : [...prev, item.name]);
        }
        // Auto-expand sub-groups too
        item.children.forEach(child => {
          if (child.children?.some(sub => isActive(sub.href))) {
            setExpandedSections(prev => prev.includes(child.name) ? prev : [...prev, child.name]);
          }
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Get user initials
  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'SUPERVISOR': return 'Supervisor';
      case 'STAFF': return 'Staff';
      default: return 'User';
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleSection = (name: string) => {
    setExpandedSections(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Mwembeshi Farm
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation
            .filter((item) => {
              if (item.adminOnly && session?.user?.role === 'STAFF') {
                return false;
              }
              return true;
            })
            .map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedSections.includes(item.name);
            const childActive = hasChildren && item.children!.some(child => isActive(child.href));
            const active = !hasChildren && isActive(item.href);

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSection(item.name)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                      childActive
                        ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>
                  {isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
                      {item.children!.map((child) => {
                        const childIsActive = !child.children && isActive(child.href);
                        const hasSubChildren = child.children && child.children.length > 0;
                        const subExpanded = expandedSections.includes(child.name);
                        const subChildActive = hasSubChildren && child.children!.some(sub => isActive(sub.href));

                        if (hasSubChildren) {
                          return (
                            <div key={child.name}>
                              <button
                                onClick={() => toggleSection(child.name)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                                  subChildActive
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                )}
                              >
                                <span className="flex-1 text-left">{child.name}</span>
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", subExpanded && "rotate-180")} />
                              </button>
                              {subExpanded && (
                                <div className="mt-1 ml-3 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
                                  {child.children!.map((sub) => {
                                    const subIsActive = isActive(sub.href);
                                    return (
                                      <Link
                                        key={sub.href}
                                        href={sub.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={cn(
                                          "block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                          subIsActive
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                            : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                        )}
                                      >
                                        {sub.name}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              childIsActive
                                ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 space-y-1">
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/dashboard/users"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith('/dashboard/users')
                  ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <UserCog className="w-5 h-5" />
              User Management
            </Link>
          )}
          <Link
            href="/dashboard/settings"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith('/dashboard/settings')
                ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors -ml-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              {/* Mobile logo */}
              <Link href="/dashboard" className="lg:hidden flex items-center gap-1.5">
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  Mwembeshi
                </span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <NotificationBell />

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 sm:gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-1.5 sm:px-2 py-1 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                    {getUserInitials(session?.user?.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session?.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleDisplay(session?.user?.role)}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session?.user?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content - extra bottom padding on mobile for bottom nav */}
        <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 lg:hidden safe-area-bottom">
        <div className="flex items-stretch justify-around h-16">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 px-1 transition-colors relative",
                  active
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-200"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-600 dark:bg-green-400 rounded-b-full" />
                )}
                <item.icon className={cn("w-5 h-5", active && "scale-110")} style={{ transition: 'transform 0.15s ease' }} />
                <span className={cn(
                  "text-[10px] leading-tight truncate",
                  active ? "font-semibold" : "font-medium"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          {/* More button opens sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 px-1 transition-colors",
              "text-gray-500 dark:text-gray-400 active:text-gray-700 dark:active:text-gray-200"
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] leading-tight font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
