import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  PenLine,
  TrendingUp,
  Settings,
  DollarSign,
  Target,
  Wallet,
  Brain,
  Globe,
} from 'lucide-react';

export const navGroups = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/journal', label: 'Journal', icon: BookOpen },
      { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    ]
  },
  {
    title: 'Trading',
    items: [
      { href: '/trades/new', label: 'New Trade', icon: PenLine },
      { href: '/setups', label: 'Setups', icon: TrendingUp },
      { href: '/news', label: 'News', icon: Globe },
      { href: '/mind-dump', label: 'Mind Dump', icon: Brain },
    ]
  },
  {
    title: 'Performance',
    items: [
      { href: '/accounts', label: 'Accounts', icon: Wallet },
      { href: '/goals', label: 'Goals', icon: Target },
      { href: '/payouts', label: 'Payouts', icon: DollarSign },
    ]
  },
  {
    title: 'System',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];
