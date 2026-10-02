'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Briefcase,
  UsersRound,
  Image,
  BookOpen,
  MapPin,
  Bell,
  MessageSquare,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  collapsed: boolean;
  role: 'admin' | 'parent' | 'teacher' | 'student';
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
}

/* ══════════════════════════════════════════════════════════════
   Navigation Items per Role
══════════════════════════════════════════════════════════════ */
const allNavItems: Record<string, NavItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'fees', label: 'Fee Management', icon: CreditCard },
    { id: 'hr', label: 'HR Recruitment', icon: Briefcase },
    { id: 'parents', label: 'Parents', icon: UsersRound },
    { id: 'media', label: 'Media Gallery', icon: Image },
    { id: 'school-work', label: 'School Work', icon: BookOpen },
    { id: 'trips-events', label: 'Trips & Events', icon: MapPin, isNew: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ],
  parent: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fees', label: 'Fee Payments', icon: CreditCard },
    { id: 'school-work', label: 'School Work', icon: BookOpen },
    { id: 'media', label: 'Media Gallery', icon: Image },
    { id: 'trips-events', label: 'Trips & Events', icon: MapPin, isNew: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ],
  teacher: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'All Students', icon: Users },
    { id: 'school-work', label: 'School Work', icon: BookOpen },
    { id: 'hr', label: 'My Portal', icon: Briefcase },
    { id: 'media', label: 'Media Gallery', icon: Image },
    { id: 'trips-events', label: 'Trips & Events', icon: MapPin, isNew: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ],
  student: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'school-work', label: 'My Assignments', icon: BookOpen },
    { id: 'media', label: 'Media Gallery', icon: Image },
    { id: 'trips-events', label: 'Trips & Events', icon: MapPin, isNew: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ],
};

const roleSubtitles: Record<string, string> = {
  admin: 'Admin Portal',
  parent: 'Parent Portal',
  teacher: 'Teacher Portal',
  student: 'Student Portal',
};

/* ══════════════════════════════════════════════════════════════
   BLOOMS Shield Logo SVG
══════════════════════════════════════════════════════════════ */
function ShieldLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 8L65 20V45C65 62 52 72 40 76C28 72 15 62 15 45V20L40 8Z"
        fill="#b91c1c"
        stroke="#f59e0b"
        strokeWidth="2"
      />
      <path d="M30 35L40 30L50 35V55L40 50L30 55V35Z" fill="#fbbf24" />
      <line
        x1="40"
        y1="30"
        x2="40"
        y2="50"
        stroke="#b91c1c"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   Sidebar Component
══════════════════════════════════════════════════════════════ */
export default function Sidebar({
  activeSection,
  onNavigate,
  onLogout,
  collapsed,
  role,
}: SidebarProps) {
  const navItems = allNavItems[role] ?? allNavItems.admin;
  const subtitle = roleSubtitles[role] ?? 'Portal';

  return (
    <div suppressHydrationWarning>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => onNavigate(activeSection)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        className={`fixed top-0 left-0 h-full z-50 sidebar-dark border-r border-white/[0.06] sidebar-transition flex flex-col
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-[72px]' : 'translate-x-0 w-[250px]'}
        `}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between border-b border-white/[0.06] min-h-[72px]">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-[#0f172a] border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldLogo className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-amber-400 font-bold text-base tracking-wide leading-tight">
                  BLOOMS
                </h1>
                <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-medium">
                  {subtitle}
                </p>
              </div>
            </motion.div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-lg bg-[#0f172a] border border-amber-500/30 flex items-center justify-center mx-auto">
              <ShieldLogo className="w-5 h-5" />
            </div>
          )}
          <button
            onClick={() => onNavigate(activeSection)}
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative group
                  ${isActive
                    ? 'text-amber-400'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {/* Active amber left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Tab Bubble Indicator behind active item */}
                {isActive && <div className="tab-bubble-indicator" />}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-amber-400' : ''
                  }`}
                />

                {!collapsed && (
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                )}

                {/* NEW badge */}
                {!collapsed && item.isNew && (
                  <span className="text-[9px] bg-amber-500 text-[#0f172a] px-1.5 py-0.5 rounded-full font-bold leading-none tracking-wide">
                    NEW
                  </span>
                )}
                {collapsed && item.isNew && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}

                {/* Tooltip when collapsed (desktop only) */}
                {collapsed && (
                  <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-[#1e293b] rounded text-xs text-slate-300 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/[0.06] transition-opacity">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>

        {/* VESTA Footer */}
        <div className="p-3 pt-0">
          {!collapsed && (
            <p className="text-[10px] text-slate-600 text-center opacity-[0.15]">
              Powered by VESTA
            </p>
          )}
          {collapsed && (
            <p className="text-[8px] text-slate-600 text-center opacity-[0.15]">
              VESTA
            </p>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
