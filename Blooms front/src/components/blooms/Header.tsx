'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    initials: string;
    role: string;
  };
  onToggleSidebar: () => void;
  role: string;
}

const roleBadgeStyles: Record<string, string> = {
  admin: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  parent: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  teacher: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  student: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  parent: 'Parent',
  teacher: 'Teacher',
  student: 'Student',
};

export default function Header({ user, onToggleSidebar, role }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const badgeStyle = roleBadgeStyles[role] ?? roleBadgeStyles.admin;
  const roleLabel = roleLabels[role] ?? 'Admin';

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Hamburger + Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar - desktop only */}
          <div className="relative max-w-sm w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: Role badge + Notification + Avatar */}
        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <Badge
            variant="outline"
            className={`hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${badgeStyle}`}
          >
            {roleLabel}
          </Badge>

          {/* Notification Bell */}
          <button
            className="relative p-2 rounded-lg hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#0a0e1a]" />
          </button>

          {/* User Avatar + Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-[#0f172a] text-xs font-bold flex-shrink-0">
                  {user.initials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm text-slate-200 leading-tight font-medium">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500 hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-[#111827] border-white/[0.08] rounded-xl shadow-xl"
            >
              <DropdownMenuLabel className="text-slate-300 font-medium">
                {user.name}
              </DropdownMenuLabel>
              <DropdownMenuLabel className="text-slate-500 text-xs font-normal -mt-1">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-slate-300 focus:bg-white/[0.04] focus:text-slate-100 cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}