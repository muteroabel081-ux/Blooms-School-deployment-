'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, AlertTriangle, Plus, CreditCard, ArrowRight,
  Megaphone, Calendar, Star, Download, Mail, Phone, Globe, FileText,
  Briefcase, BookOpen, ClipboardList, GraduationCap, Bell,
  FileSpreadsheet, Banknote, Image as ImageIcon,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; seeded?: boolean; }
interface Announcement { id: string; title: string; content: string; author: string; createdAt: string; }
interface StarRating { id: string; parentId: string; starCount: number; tier: string; }
interface SchemeOfWork { id: string; subject: string; grade: string; term: string; title: string; createdAt: string; teacher?: { firstName: string; lastName: string } | null; }

const anim = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function getTierClass(t: string) { return { Bronze: 'tier-bronze', Silver: 'tier-silver', Gold: 'tier-gold', Platinum: 'tier-platinum', Diamond: 'tier-diamond' }[t] || 'tier-bronze'; }
function getTierBadge(t: string) { return { Bronze: 'bg-amber-700/20 text-amber-400 border-amber-600/30', Silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30', Gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', Platinum: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30', Diamond: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }[t] || 'bg-amber-700/20 text-amber-400 border-amber-600/30'; }

const TIERS = [
  { emoji: '\u{1F949}', name: 'Bronze', range: '1-3', desc: 'Getting started' },
  { emoji: '\u{1F948}', name: 'Silver', range: '4-6', desc: 'Active participation' },
  { emoji: '\u{1F947}', name: 'Gold', range: '7-9', desc: 'Highly engaged' },
  { emoji: '\u{1F48E}', name: 'Platinum', range: '10-12', desc: 'Outstanding commitment' },
  { emoji: '\u{1F3C6}', name: 'Diamond', range: '13', desc: 'Elite status' },
];

function Stars({ count, size = 'text-lg' }: { count: number; size?: string }) {
  return (<span className={`inline-flex gap-0.5 flex-wrap ${size}`}>{Array.from({ length: 13 }).map((_, i) => (<span key={i} className={i < count ? 'text-amber-400' : 'text-gray-600'}>{i < count ? '\u2605' : '\u2606'}</span>))}</span>);
}

function TierExplanation() {
  return (
    <div className="glass-card p-4 rounded-xl">
      <h4 className="text-sm font-semibold text-amber-400 mb-3">Tier System</h4>
      <div className="space-y-2">{TIERS.map(t => (
        <div key={t.name} className="flex items-center gap-3 text-sm">
          <span className="text-lg">{t.emoji}</span>
          <span className="font-medium text-white w-20">{t.name}</span>
          <span className="text-gray-400 w-14">({t.range})</span>
          <span className="text-gray-500">{t.desc}</span>
        </div>
      ))}</div>
      <p className="text-xs text-gray-500 mt-3 border-t border-gray-700/50 pt-2">
        Earn stars through: timely fee payment, event participation, volunteering
      </p>
    </div>
  );
}

function downloadGuidelines() {
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>BLOOMS Junior School - School Guidelines</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#f8f9fa;color:#1a1a2e}
.header{background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:40px;text-align:center}
.header h1{font-size:2.5rem;margin-bottom:8px}.header p{opacity:.9;font-size:1.1rem}
.container{max-width:800px;margin:0 auto;padding:30px 20px}
.section{background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.section h2{color:#d97706;margin-bottom:12px;font-size:1.3rem;border-bottom:2px solid #fef3c7;padding-bottom:8px}
.section p,.section li{line-height:1.7;color:#374151}ul{padding-left:20px}li{margin-bottom:6px}
.footer{text-align:center;padding:30px;color:#6b7280;font-size:.9rem}</style></head>
<body><div class="header"><h1>BLOOMS Junior School</h1><p>School Guidelines &amp; Policies</p></div>
<div class="container">
<div class="section"><h2>School Hours</h2><p><strong>Monday - Friday:</strong> 7:30 AM - 4:00 PM</p><p>Arrival by 7:45 AM. Late arrivals must report to the office.</p></div>
<div class="section"><h2>Uniform Policy</h2><ul><li>Official school uniform is mandatory on all school days.</li><li>Monday &amp; Friday: Full assembly uniform.</li><li>Sports day: P.E. kit required.</li></ul></div>
<div class="section"><h2>Behaviour &amp; Discipline</h2><ul><li>Respect for teachers, staff, and fellow students at all times.</li><li>Bullying, fighting, and profane language are strictly prohibited.</li><li>Consequences include warnings, detention, and parent meetings.</li></ul></div>
<div class="section"><h2>Academics</h2><ul><li>Students must maintain at least 75% attendance.</li><li>Homework must be submitted on time.</li><li>Parent-teacher conferences are held termly.</li></ul></div>
<div class="section"><h2>Fee Payment</h2><ul><li>Fees are due at the beginning of each term.</li><li>Payment via M-Pesa (Paybill), bank transfer, or cash at the office.</li><li>Outstanding balances may result in withholding of reports.</li></ul></div>
<div class="section"><h2>Communication</h2><ul><li>The school communicates via official letters, SMS, and the school portal.</li><li>Parent queries: visit the school office or call during working hours.</li><li>Emergency contacts must be kept up to date.</li></ul></div>
<div class="section"><h2>Health &amp; Safety</h2><ul><li>Allergies and medical conditions must be disclosed at enrollment.</li><li>First aid is available on-site; serious cases are referred to hospital.</li><li>Fire drills are conducted once per term.</li></ul></div>
</div><div class="footer"><p>BLOOMS Junior School \u00a9 ${new Date().getFullYear()} - Nurturing Tomorrow's Leaders</p></div></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'blooms_school_guidelines.html'; a.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard({ role, onNavigate, seeded }: DashboardProps) {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [starRating, setStarRating] = useState<StarRating | null>(null);
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([]);
  const [loading, setLoading] = useState(true);
  const didInit = useRef(false);

  useEffect(() => {
    if (!seeded || didInit.current) return;
    didInit.current = true;
    async function load() {
      try {
        const [dRes, aRes] = await Promise.all([fetch('/api/dashboard'), fetch('/api/announcements')]);
        const d = await dRes.json(); const a = await aRes.json();
        setStats({ totalStudents: d.totalStudents ?? 0, totalFeesCollected: d.totalFeesCollected ?? 0, totalOutstanding: d.totalOutstanding ?? 0, pendingApplications: d.pendingApplications ?? 0 });
        setAnnouncements(Array.isArray(a) ? a : []);
        if (role === 'parent') {
          const rRes = await fetch('/api/star-ratings');
          const ratings = await rRes.json();
          if (Array.isArray(ratings) && ratings.length > 0) setStarRating(ratings[0]);
        }
        if (role === 'teacher' || role === 'admin') {
          try {
            const sRes = await fetch('/api/schemes-of-work');
            const sData = await sRes.json();
            setSchemes(Array.isArray(sData) ? sData.slice(0, 5) : []);
          } catch { /* empty */ }
        }
      } catch { /* empty */ } finally { setLoading(false); }
    }
    load();
  }, [role, seeded]);

  const fmt = (n: number) => `KES ${n.toLocaleString()}`;
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const sc = stats?.totalStudents ?? 0;
  const fc = stats?.totalFeesCollected ?? 0;
  const os = stats?.totalOutstanding ?? 0;
  const pa = stats?.pendingApplications ?? 0;

  return (
    <div suppressHydrationWarning className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-static rounded-2xl p-6 border border-amber-500/20">
        <h1 className="blooms-text-gradient text-2xl md:text-3xl font-bold">Welcome to BLOOMS</h1>
        <p className="text-gray-400 mt-1">{role === 'admin' ? 'Administrator Dashboard' : `${roleLabel} Dashboard`}</p>
      </motion.div>

      {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: role === 'admin' ? 4 : 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)}</div>
      : <motion.div variants={stagger} initial="hidden" animate="show" className={`grid grid-cols-1 sm:grid-cols-2 ${role === 'admin' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
          {role === 'admin' && <>
            <StatCard v={anim} icon={<Users className="w-5 h-5 text-amber-400" />} bg="bg-amber-500/10" val={String(sc)} label="Students" />
            <StatCard v={anim} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} bg="bg-emerald-500/10" val={fmt(fc)} label="Fees Collected" />
            <StatCard v={anim} icon={<AlertTriangle className="w-5 h-5 text-red-400" />} bg="bg-red-500/10" val={fmt(os)} label="Outstanding" />
            <StatCard v={anim} icon={<Briefcase className="w-5 h-5 text-sky-400" />} bg="bg-sky-500/10" val={String(pa)} label="Pending Verifications" />
          </>}
          {role === 'parent' && <>
            <StatCard v={anim} icon={<GraduationCap className="w-5 h-5 text-amber-400" />} bg="bg-amber-500/10" val={String(sc)} label="Total Students" />
            <StatCard v={anim} icon={<Calendar className="w-5 h-5 text-emerald-400" />} bg="bg-emerald-500/10" val={String(pa)} label="Upcoming Events" />
            <StatCard v={anim} icon={<Bell className="w-5 h-5 text-sky-400" />} bg="bg-sky-500/10" val={String(announcements.length)} label="Announcements" />
          </>}
          {(role === 'teacher' || role === 'student') && <>
            <StatCard v={anim} icon={<Users className="w-5 h-5 text-amber-400" />} bg="bg-amber-500/10" val={String(sc)} label="Students" />
            <StatCard v={anim} icon={<Calendar className="w-5 h-5 text-emerald-400" />} bg="bg-emerald-500/10" val={String(pa)} label="Events" />
            <StatCard v={anim} icon={<Bell className="w-5 h-5 text-sky-400" />} bg="bg-sky-500/10" val={String(announcements.length)} label="Announcements" />
          </>}
        </motion.div>}

      {role === 'parent' && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
        <div className={`glass-card p-6 rounded-2xl ${getTierClass(starRating?.tier ?? 'Bronze')}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div><h3 className="text-lg font-semibold text-white mb-2">Your Star Rating</h3>
              <Stars count={starRating?.starCount ?? 0} size="text-2xl" />
              <p className="text-gray-400 text-sm mt-1">{starRating?.starCount ?? 0} of 13 stars earned</p>
            </div>
            <Badge className={`px-4 py-1.5 text-sm font-semibold border rounded-full ${getTierBadge(starRating?.tier ?? 'Bronze')}`}>
              {TIERS.find(t => t.name === (starRating?.tier ?? 'Bronze'))?.emoji} {starRating?.tier ?? 'Bronze'}
            </Badge>
          </div>
        </div>
        <TierExplanation />
      </motion.div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-amber-400" /> Announcements</h3>
            {announcements.length === 0 ? <p className="text-gray-500 text-sm py-8 text-center">No announcements yet</p> : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">{announcements.slice(0, 5).map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors">
                  <h4 className="text-sm font-medium text-white">{a.title}</h4>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-600 mt-1">{a.author} &middot; {new Date(a.createdAt).toLocaleDateString()}</p>
                </motion.div>
              ))}</div>
            )}
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-amber-400" /> Quick Actions</h3>
            <div className="space-y-2">
              {role === 'admin' && <>
                <ActBtn icon={<Plus className="w-4 h-4" />} label="Register Student" onClick={() => onNavigate?.('students')} />
                <ActBtn icon={<Briefcase className="w-4 h-4" />} label="Add Staff & HR" onClick={() => onNavigate?.('hr')} />
                <ActBtn icon={<ImageIcon className="w-4 h-4" />} label="Media Gallery & Photos" onClick={() => onNavigate?.('media')} />
                <ActBtn icon={<Megaphone className="w-4 h-4" />} label="Mass Broadcast & Alerts" onClick={() => onNavigate?.('messages')} />
                <ActBtn icon={<CreditCard className="w-4 h-4" />} label="Fee Management" onClick={() => onNavigate?.('fees')} />
                <ActBtn icon={<Calendar className="w-4 h-4" />} label="Trips &amp; Events" onClick={() => onNavigate?.('trips-events')} />
              </>}
              {role === 'parent' && <>
                <ActBtn icon={<GraduationCap className="w-4 h-4" />} label="My Children" onClick={() => onNavigate?.('parents')} />
                <ActBtn icon={<CreditCard className="w-4 h-4" />} label="Fee Statement" onClick={() => onNavigate?.('fees')} />
                <ActBtn icon={<Calendar className="w-4 h-4" />} label="Events" onClick={() => onNavigate?.('trips')} />
              </>}
              {role === 'teacher' && <>
                <ActBtn icon={<GraduationCap className="w-4 h-4" />} label="Students" onClick={() => onNavigate?.('students')} />
                <ActBtn icon={<BookOpen className="w-4 h-4" />} label="School Work" onClick={() => onNavigate?.('schoolwork')} />
                <ActBtn icon={<FileText className="w-4 h-4" />} label="My Contract" onClick={() => onNavigate?.('hr')} />
                <ActBtn icon={<Banknote className="w-4 h-4" />} label="My Payslips" onClick={() => onNavigate?.('hr')} />
                <ActBtn icon={<Calendar className="w-4 h-4" />} label="Events" onClick={() => onNavigate?.('trips')} />
              </>}
              {role === 'student' && <>
                <ActBtn icon={<BookOpen className="w-4 h-4" />} label="My School Work" onClick={() => onNavigate?.('schoolwork')} />
                <ActBtn icon={<Calendar className="w-4 h-4" />} label="Events" onClick={() => onNavigate?.('trips')} />
              </>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" /> Resources</h3>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300" onClick={downloadGuidelines}>
              <Download className="w-4 h-4" /> Download School Guidelines
            </Button>
          </motion.div>
          {role !== 'admin' && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-amber-400" /> Contact Us</h3>
            <div className="space-y-2 text-sm">
              <a href="mailto:info@bloomsjunior.ac.ke" className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors"><Mail className="w-4 h-4" /> info@bloomsjunior.ac.ke</a>
              <a href="tel:+254700000000" className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors"><Phone className="w-4 h-4" /> +254 700 000 000</a>
              <a href="https://bloomsjunior.ac.ke" className="flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors"><Globe className="w-4 h-4" /> bloomsjunior.ac.ke</a>
            </div>
          </motion.div>}
        </div>
      </div>

      {/* Admin & Teacher: Schemes of Work */}
      {(role === 'admin' || role === 'teacher') && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              {role === 'admin' ? 'All Schemes of Work' : 'My Schemes of Work'}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              onClick={() => onNavigate?.('hr')}
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {schemes.length === 0 ? (
            <p className="text-gray-500 text-sm py-6 text-center">No schemes of work uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {schemes.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-amber-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white">{s.title || s.subject}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-2 py-0 text-amber-400 border-amber-500/30">
                          {s.subject}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 text-sky-400 border-sky-500/30">
                          Grade {s.grade}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 text-slate-400 border-slate-600/30">
                          {s.term}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {role === 'admin' && s.teacher && (
                        <span className="text-[10px] text-gray-500">{s.teacher.firstName} {s.teacher.lastName}</span>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ v, icon, bg, val, label }: { v: typeof anim; icon: React.ReactNode; bg: string; val: string; label: string }) {
  return <motion.div variants={v} className="glass-card p-4 rounded-xl card-glow"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${bg}`}>{icon}</div><div><p className="text-2xl font-bold text-white">{val}</p><p className="text-xs text-gray-400">{label}</p></div></div></motion.div>;
}

function ActBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all group">
      <span className="text-amber-400 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-amber-400 transition-colors" />
    </button>
  );
}
