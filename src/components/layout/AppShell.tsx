import { BarChart3, LayoutGrid, LogOut, Moon, Plug, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { NavLink, Outlet } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/features/auth/RequireAuth';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Devices', icon: LayoutGrid, end: true },
  { to: '/energy', label: 'Energy', icon: BarChart3, end: false },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-5 dark:hidden" />
      <Moon className="hidden size-5 dark:block" />
    </Button>
  );
}

export function AppShell() {
  // The session lifecycle (auth gate + sign-out) is owned by RequireAuth,
  // which supplies signOut through the outlet context. AppShell is layout only.
  const { signOut } = useSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          <Plug className="size-5" />
          <span className="text-lg font-semibold tracking-tight">Kasa Home</span>
          <nav className="ml-6 hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}>
                {({ isActive }) => (
                  <span
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu">
                  <LogOut className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-4 sm:pb-8">
        <Outlet />
      </main>

      {/* Bottom tab bar on phones */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <span
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 text-xs font-medium',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
