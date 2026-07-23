'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { navGroups } from '@/config/navigation';
import { ChevronLeft, ChevronRight, LogOut, Users } from 'lucide-react';




export function AppSidebar({ userName = 'Opérateur', isAdmin = false }: { userName?: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Sync sidebar width to CSS variable for the main layout to re-center dynamically
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '14rem');
  }, [collapsed]);

  return (
    <aside
      className={`
        hidden md:flex fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar
        flex-col transition-all duration-300 ease-in-out
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
          <span className="font-bold text-lg tracking-tight">Rise Dash</span>
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
      <nav className="flex-1 py-4 px-2 space-y-4 overflow-y-auto overflow-x-hidden">
        {[...navGroups, ...(isAdmin ? [{ title: 'Admin', items: [{ href: '/admin/users', label: 'Utilisateurs', icon: Users }] }] : [])].map((group, groupIdx) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <h4 className="px-4 text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            {group.items.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              const linkContent = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold
                    transition-all duration-300
                    ${collapsed ? 'justify-center px-0' : ''}
                    ${
                      isActive
                        ? 'bg-sidebar-accent border border-primary/20 text-white shadow-[0_0_20px_rgba(109,40,217,0.15)]'
                        : 'text-sidebar-foreground/70 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <item.icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`} />
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
                      flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium
                      transition-all duration-200 justify-center px-0 mx-1 mb-1
                      ${
                        isActive
                          ? 'bg-sidebar-accent border border-primary/20 text-primary shadow-[0_0_15px_rgba(109,40,217,0.15)]'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white border border-transparent'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  </Link>
                );
              }

              return linkContent;
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center justify-center p-2 rounded-xl text-sidebar-foreground/50 hover:text-white hover:bg-sidebar-accent/50 transition-colors
          `}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Sign out */}
        <form action={signOut}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className={`
              flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors w-full
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </Button>
        </form>
      </div>
    </aside>
  );
}
