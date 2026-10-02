'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginPage from '@/components/blooms/LoginPage';
import Sidebar from '@/components/blooms/Sidebar';
import Header from '@/components/blooms/Header';
import WeatherEffects from '@/components/blooms/WeatherEffects';
import FloatingBubbles from '@/components/blooms/FloatingBubbles';
import Dashboard from '@/components/blooms/Dashboard';
import StudentsPage from '@/components/blooms/StudentsPage';
import FeesPage from '@/components/blooms/FeesPage';
import HRPage from '@/components/blooms/HRPage';
import ParentsPage from '@/components/blooms/ParentsPage';
import MediaGallery from '@/components/blooms/MediaGallery';
import TripsEvents from '@/components/blooms/TripsEvents';
import NotificationsPage from '@/components/blooms/NotificationsPage';
import MessagesPage from '@/components/blooms/MessagesPage';
import SchoolWorkPage from '@/components/blooms/SchoolWorkPage';

type UserRole = 'admin' | 'parent' | 'teacher' | 'student';

const sectionComponents: Record<string, React.ComponentType<{ role: UserRole; onNavigate?: (section: string) => void; seeded?: boolean }>> = {
  dashboard: Dashboard,
  students: StudentsPage,
  fees: FeesPage,
  hr: HRPage,
  parents: ParentsPage,
  media: MediaGallery,
  'school-work': SchoolWorkPage,
  'trips-events': TripsEvents,
  notifications: NotificationsPage,
  messages: MessagesPage,
};

const userProfiles: Record<UserRole, { name: string; email: string; initials: string; role: UserRole }> = {
  admin: { name: 'System Administrator', email: 'admin@bloomsjunior.sc.ke', initials: 'SA', role: 'admin' },
  parent: { name: 'Jane Wanjiku', email: 'parent1@email.com', initials: 'JW', role: 'parent' },
  teacher: { name: 'Mr. Ochieng', email: 'teacher1@bloomsjunior.sc.ke', initials: 'MO', role: 'teacher' },
  student: { name: 'Alex Kamau', email: 'student1@bloomsjunior.sc.ke', initials: 'AK', role: 'student' },
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Restore authenticated session and active section from localStorage
    try {
      const saved = localStorage.getItem('blooms_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) {
          setIsLoggedIn(true);
          if (parsed.userRole) setUserRole(parsed.userRole as UserRole);
          if (parsed.activeSection) setActiveSection(parsed.activeSection);
        }
      }
    } catch { /* empty */ }
    setIsReady(true);

    // 2. Safe seed check (will not wipe existing data because route checks if already populated)
    async function seed() {
      try { await fetch('/api/seed', { method: 'POST' }); } catch { /* */ }
      setSeeded(true);
    }
    seed();
  }, []);

  const handleLogin = useCallback((role: string) => {
    setUserRole(role as UserRole);
    setIsLoggedIn(true);
    setActiveSection('dashboard');
    setSidebarCollapsed(window.innerWidth < 1024);
    try {
      localStorage.setItem('blooms_session', JSON.stringify({
        isLoggedIn: true,
        userRole: role,
        activeSection: 'dashboard'
      }));
    } catch { /* empty */ }
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole('admin');
    setActiveSection('dashboard');
    try {
      localStorage.removeItem('blooms_session');
    } catch { /* empty */ }
  }, []);

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
    if (window.innerWidth < 1024) setSidebarCollapsed(true);
    try {
      const saved = localStorage.getItem('blooms_session');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem('blooms_session', JSON.stringify({
        ...parsed,
        activeSection: section
      }));
    } catch { /* empty */ }
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const user = userProfiles[userRole] || userProfiles.admin;
  const ActiveComponent = sectionComponents[activeSection];

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative" suppressHydrationWarning>
      <div className="ambient-glow" />
      <WeatherEffects />
      <FloatingBubbles />
      <div className="vesta-watermark"><img src="/vesta-logo.jpeg" alt="" /></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} onLogout={handleLogout} collapsed={sidebarCollapsed} role={userRole} />

        <div className={`flex-1 flex flex-col sidebar-transition ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[250px]'}`}>
          <Header user={user} onToggleSidebar={handleToggleSidebar} role={userRole} />

          <main className="flex-1 p-4 lg:p-6 pb-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}>
                {!seeded ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : ActiveComponent ? (
                  <ActiveComponent role={userRole} onNavigate={handleNavigate} seeded={seeded} />
                ) : (
                  <div className="text-gray-500 text-center py-20">Section not found</div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="mt-auto py-3 px-6 border-t border-white/[0.04] flex items-center justify-between relative z-10">
            <p className="text-[10px] text-gray-600">© {new Date().getFullYear()} BLOOMS Junior School</p>
            <p className="text-[10px] text-gray-600">Powered by <span className="text-amber-500/50 font-medium">VESTA</span></p>
          </footer>
        </div>
      </div>
    </div>
  );
}
