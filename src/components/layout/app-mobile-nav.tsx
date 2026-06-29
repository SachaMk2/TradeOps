'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  PenLine,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

import { navGroups } from '@/config/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const mainMobileItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/trades/new', label: 'Trade', icon: PenLine },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
      {/* Glassmorphism background with optimized blur for mobile performance */}
      <div className="absolute inset-0 bg-sidebar/95 backdrop-blur-md border-t border-sidebar-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"></div>
      
      {/* Safe area padding for iPhones */}
      <div className="relative flex items-center justify-around pb-safe">
        {mainMobileItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center w-full py-3 gap-1
                transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-sidebar-foreground/60 hover:text-white'}
              `}
            >
              <div className={`
                p-1.5 rounded-xl transition-all duration-300
                ${isActive ? 'bg-primary/20 shadow-[0_0_15px_rgba(109,40,217,0.3)]' : 'bg-transparent'}
              `}>
                <item.icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu Hamburger */}
        <Sheet>
          <SheetTrigger className="flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors duration-200 text-sidebar-foreground/60 hover:text-white">
            <div className="p-1.5 rounded-xl bg-transparent">
              <Menu className="w-5 h-5 shrink-0" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium">Menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="bg-sidebar border-l border-sidebar-border w-[280px] p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-sidebar-border/50">
              <SheetTitle className="text-left text-white font-bold text-xl">SACH MK2</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h4 className="px-4 text-[10px] font-black text-white/40 uppercase tracking-wider mb-2">
                    {group.title}
                  </h4>
                  {group.items.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold
                          transition-all duration-300
                          ${
                            isActive
                              ? 'bg-sidebar-accent border border-primary/20 text-white shadow-[0_0_20px_rgba(109,40,217,0.15)]'
                              : 'text-sidebar-foreground/70 hover:text-white border border-transparent'
                          }
                        `}
                      >
                        <item.icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? 'text-primary' : ''}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
