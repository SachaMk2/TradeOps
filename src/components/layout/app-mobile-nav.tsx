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
      {/* Glassmorphism background with blur */}
      <div className="absolute inset-0 bg-sidebar/80 backdrop-blur-xl border-t border-sidebar-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"></div>
      
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
      </div>
    </div>
  );
}
