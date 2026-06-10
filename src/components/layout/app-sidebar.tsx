'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Kanban,
  PenLine,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Target,
  Settings,
  Wallet,
  CalendarDays,
  Brain,
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/mind-dump', label: 'Mind Dump', icon: Brain },
  { href: '/trades/new', label: 'New Trade', icon: PenLine },
  { href: '/setups', label: 'Setups', icon: TrendingUp },
  { href: '/accounts', label: 'Accounts', icon: Wallet },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({ userName = 'Opérateur' }: { userName?: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar
        flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-20 px-6 border-b border-sidebar-border ${collapsed ? 'justify-center px-4' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-widest text-white uppercase">
            SACH MK2
          </span>
        )}
      </div>

      {/* User Welcome Block */}
      {!collapsed && (
        <div className="px-4 py-6">
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Bienvenue,</p>
            <p className="text-base font-bold text-white truncate" title={userName}>{userName}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold
                transition-all duration-300
                ${collapsed ? 'justify-center px-0' : ''}
                ${
                  isActive
                    ? 'bg-sidebar-accent border border-primary/20 text-white shadow-[0_0_20px_rgba(109,40,217,0.15)]'
                    : 'text-sidebar-foreground/70 hover:text-white border border-transparent'
                }
              `}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 justify-center px-0
                  ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary shadow-sm'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }
                `}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
              </Link>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2 text-sm w-full
            text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50
            transition-all duration-200
            ${collapsed ? 'justify-center px-0' : ''}
          `}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {/* Sign out */}
        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className={`
              w-full text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10
              ${collapsed ? 'px-0 justify-center' : 'justify-start gap-3'}
            `}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </form>
      </div>
    </aside>
  );
}
