'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Users, DollarSign, FileText, Download, Eye, CheckCircle2,
  XCircle, Search, Loader2, Award, BookOpen, Star, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface HRPageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; seeded?: boolean; }
interface Teacher { id: string; firstName: string; lastName: string; email: string; phone: string; subject: string; qualification: string | null; status: string; profileImage: string | null; appliedAt: string; contracts?: Contract[]; payslips?: Payslip[]; conducts?: Conduct[]; schemes?: Scheme[]; }
interface Contract { id: string; contractNo: string; startDate: string; endDate?: string; salary: number; position: string; fileUrl?: string; status: string; }
interface Payslip { id: string; month: string; year: string; basicSalary: number; allowances: number; deductions: number; netPay: number; fileUrl?: string; }
interface Conduct { id: string; rating: string; comments: string; loggedBy: string; period: string; }
interface Scheme { id: string; title: string; subject: string; grade: string; term: string; fileUrl: string; createdAt: string; }
interface Application { id: string; applicantName: string; email: string; phone: string; position: string; cvUrl?: string; whyMe: string; whyBlooms: string; status: string; createdAt: string; }

const kes = (n: number) => 'KES ' + Number(n).toLocaleString('en-KE');

export default function HRPage({ role, seeded }: HRPageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('employees');
  const [detailOpen, setDetailOpen] = useState<Teacher | null>(null);
  const [conductOpen, setConductOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [payslipOpen, setPayslipOpen] = useState(false);
  const [cForm, setCForm] = useState({ teacherId: '', rating: 'Good', comments: '', period: '' });
  const [pForm, setPForm] = useState({ teacherId: '', month: 'January', year: '2025', salary: '', allowances: '', deductions: '' });
  const [ctForm, setCtForm] = useState({ teacherId: '', position: 'Teacher', salary: '', startDate: '', endDate: '' });
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [uploadingStaffPhoto, setUploadingStaffPhoto] = useState(false);
  const [staffForm, setStaffForm] = useState({ firstName: '', lastName: '', email: '', phone: '', subject: 'General', qualification: 'Bachelor of Education', position: 'Teacher', status: 'Active', profileImage: '' });

  useEffect(() => {
    if (!seeded) return;
    let cancelled = false;

    (async () => {
      try {
        const [t, a] = await Promise.all([fetch('/api/teachers'), fetch('/api/applications')]);
        const tData = await t.json(); const aData = await a.json();
        if (cancelled) return;
        setApps(aData);
        const enriched = await Promise.all(tData.map(async (tc: any) => {
          try {
            const [c, p, cd, sc] = await Promise.all([
              fetch(`/api/employment-contracts?teacherId=${tc.id}`).then(r => r.json()).catch(() => []),
              fetch(`/api/payslips?teacherId=${tc.id}`).then(r => r.json()).catch(() => []),
              fetch(`/api/teacher-conducts?teacherId=${tc.id}`).then(r => r.json()).catch(() => []),
              fetch(`/api/schemes-of-work?teacherId=${tc.id}`).then(r => r.json()).catch(() => []),
            ]);
            return { ...tc, contracts: c, payslips: p, conducts: cd, schemes: sc };
          } catch { return tc; }
        }));
        if (!cancelled) setTeachers(enriched);
      } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [seeded]);

  const handleConduct = async () => {
    if (!cForm.teacherId || !cForm.comments) return toast.error('Fill all fields');
    try {
      const res = await fetch('/api/teacher-conducts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherId: cForm.teacherId, rating: cForm.rating, comments: cForm.comments, loggedBy: 'Admin', period: cForm.period || 'Current' }) });
      if (res.ok) { toast.success('Conduct record added!'); setConductOpen(false); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handlePayslip = async () => {
    if (!pForm.teacherId || !pForm.salary) return toast.error('Fill all fields');
    const net = parseFloat(pForm.salary) + parseFloat(pForm.allowances || '0') - parseFloat(pForm.deductions || '0');
    try {
      const res = await fetch('/api/payslips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherId: pForm.teacherId, month: pForm.month, year: pForm.year, basicSalary: parseFloat(pForm.salary), allowances: parseFloat(pForm.allowances || '0'), deductions: parseFloat(pForm.deductions || '0'), netPay: net }) });
      if (res.ok) { toast.success('Payslip created!'); setPayslipOpen(false); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleStaffPhotoUpload = async (file: File) => {
    try {
      setUploadingStaffPhoto(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setStaffForm(prev => ({ ...prev, profileImage: data.url }));
        toast.success('Staff photo uploaded!');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setStaffForm(prev => ({ ...prev, profileImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaffForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingStaffPhoto(false);
    }
  };

  const handleAddStaff = async () => {
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email || !staffForm.phone) {
      return toast.error('Please fill in all required fields (Name, Email, Phone)');
    }
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      if (res.ok) {
        const created = await res.json();
        setTeachers(prev => [created, ...prev]);
        toast.success(`Staff member ${staffForm.firstName} ${staffForm.lastName} added successfully!`);
        setAddStaffOpen(false);
        setStaffForm({ firstName: '', lastName: '', email: '', phone: '', subject: 'General', qualification: 'Bachelor of Education', position: 'Teacher', status: 'Active', profileImage: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to add staff member');
      }
    } catch {
      toast.error('Network error creating staff member');
    }
  };

  const handleAppStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/applications/${id}?XTransformPort=3000`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { toast.success(`Application ${status}`); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  if (role === 'parent' || role === 'student') return <div className="text-center py-20 text-slate-500">HR section is not available for your role.</div>;

  const filtered = teachers.filter(t => !search || `${t.firstName} ${t.lastName} ${t.subject}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase className="text-amber-400" />{role === 'admin' ? 'HR & Recruitment' : 'My Portal'}</h2>
        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <Button onClick={() => setAddStaffOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />Add Staff Member
            </Button>
          )}
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-white/[0.04] border-white/[0.08] w-56" /></div>
        </div>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/[0.04] flex-wrap">
            {role === 'admin' ? (
              <>
                <TabsTrigger value="employees">Employees</TabsTrigger>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="conduct">Conduct</TabsTrigger>
                <TabsTrigger value="payslips">Payslips</TabsTrigger>
                <TabsTrigger value="schemes">Schemes</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="contracts">My Contracts</TabsTrigger>
                <TabsTrigger value="payslips">My Payslips</TabsTrigger>
                <TabsTrigger value="schemes">My Schemes</TabsTrigger>
                <TabsTrigger value="conduct">My Conduct</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Employees / Teacher Portal */}
          <TabsContent value="employees" className="mt-4">
            <div className="grid gap-3">
              {(role === 'teacher' ? teachers.slice(0, 1) : filtered).map(t => (
                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/[0.06]" onClick={() => setDetailOpen(t)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm overflow-hidden flex-shrink-0 border border-white/10">
                      {t.profileImage ? (
                        <img src={t.profileImage} alt={t.firstName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                      ) : (
                        <span>{t.firstName[0]}{t.lastName[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{t.firstName} {t.lastName}</p>
                      <p className="text-xs text-slate-400">{t.subject} · {t.qualification || 'No qualification'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2"><Badge className={`text-xs ${t.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.status}</Badge><Eye className="w-4 h-4 text-amber-400" /></div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Contracts */}
          <TabsContent value="contracts" className="mt-4">
            <div className="space-y-3">
              {teachers.flatMap(t => (t.contracts || []).map(c => (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{c.contractNo} — {c.position}</p>
                    <p className="text-xs text-slate-400">{t.firstName} {t.lastName} · {c.startDate} → {c.endDate || 'Open-ended'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">{kes(c.salary)}/mo</span>
                    <Badge className={`text-xs ${c.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>{c.status}</Badge>
                    {c.fileUrl && <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-7" onClick={() => window.open(c.fileUrl, '_blank')}><Download className="w-3 h-3 mr-1" />PDF</Button>}
                  </div>
                </motion.div>
              )))}
              {teachers.every(t => !(t.contracts || []).length) && <p className="text-center text-slate-500 py-10">No contracts</p>}
            </div>
          </TabsContent>

          {/* Conduct */}
          <TabsContent value="conduct" className="mt-4">
            <div className="space-y-3">
              {role === 'admin' && <Button onClick={() => setConductOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black mb-2"><Plus className="w-4 h-4 mr-2" />Add Conduct Record</Button>}
              {teachers.flatMap(t => (t.conducts || []).map(cd => (
                <motion.div key={cd.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl">
                  <div className="flex justify-between"><p className="text-white font-medium">{t.firstName} {t.lastName}</p><Badge className={`text-xs ${cd.rating === 'Excellent' ? 'bg-green-500/20 text-green-400' : cd.rating === 'Good' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{cd.rating}</Badge></div>
                  <p className="text-sm text-slate-400 mt-1">{cd.comments}</p>
                  <p className="text-xs text-slate-500 mt-1">Period: {cd.period} · By: {cd.loggedBy}</p>
                </motion.div>
              )))}
            </div>
          </TabsContent>

          {/* Payslips */}
          <TabsContent value="payslips" className="mt-4">
            <div className="space-y-3">
              {role === 'admin' && <Button onClick={() => setPayslipOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black mb-2"><Plus className="w-4 h-4 mr-2" />Generate Payslip</Button>}
              {teachers.flatMap(t => (t.payslips || []).map(ps => (
                <motion.div key={ps.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{t.firstName} {t.lastName} — {ps.month} {ps.year}</p>
                    <p className="text-xs text-slate-400">Basic: {kes(ps.basicSalary)} + Allow: {kes(ps.allowances)} - Deduct: {kes(ps.deductions)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">{kes(ps.netPay)}</span>
                    {ps.fileUrl && <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-7" onClick={() => window.open(ps.fileUrl, '_blank')}><Download className="w-3 h-3 mr-1" />PDF</Button>}
                  </div>
                </motion.div>
              )))}
            </div>
          </TabsContent>

          {/* Schemes of Work */}
          <TabsContent value="schemes" className="mt-4">
            <div className="space-y-3">
              {teachers.flatMap(t => (t.schemes || []).map(sc => (
                <motion.div key={sc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{sc.title}</p>
                    <p className="text-xs text-slate-400">{t.firstName} {t.lastName} · {sc.subject} · {sc.grade} · {sc.term}</p>
                  </div>
                  {sc.fileUrl && <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-7" onClick={() => window.open(sc.fileUrl, '_blank')}><Download className="w-3 h-3 mr-1" />View</Button>}
                </motion.div>
              )))}
              {teachers.every(t => !(t.schemes || []).length) && <p className="text-center text-slate-500 py-10">No schemes of work</p>}
            </div>
          </TabsContent>

          {/* Applications (Admin only) */}
          {role === 'admin' && (
            <TabsContent value="applications" className="mt-4">
              <div className="space-y-3">
                {apps.map(app => (
                  <motion.div key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{app.applicantName}</p>
                        <p className="text-xs text-slate-400">{app.position} · {app.email} · {app.phone}</p>
                        <p className="text-sm text-slate-300 mt-1 line-clamp-2">{app.whyMe}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${app.status === 'Accepted' ? 'bg-green-500/20 text-green-400' : app.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{app.status}</Badge>
                        {app.status === 'Under Review' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-600 h-7" onClick={() => handleAppStatus(app.id, 'Accepted')}><CheckCircle2 className="w-3 h-3 mr-1" /></Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 h-7" onClick={() => handleAppStatus(app.id, 'Rejected')}><XCircle className="w-3 h-3 mr-1" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {apps.length === 0 && <p className="text-center text-slate-500 py-10">No applications</p>}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Teacher Detail Modal */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08] max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">{detailOpen?.firstName} {detailOpen?.lastName}</DialogTitle></DialogHeader>
          {detailOpen && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl">
                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg overflow-hidden flex-shrink-0 border-2 border-amber-500/30">
                  {detailOpen.profileImage ? (
                    <img src={detailOpen.profileImage} alt={detailOpen.firstName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span>{detailOpen.firstName[0]}{detailOpen.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{detailOpen.firstName} {detailOpen.lastName}</h3>
                  <p className="text-xs text-slate-400">{detailOpen.subject} &middot; {detailOpen.qualification || 'Educator'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-slate-500">Subject</p><p className="text-white">{detailOpen.subject}</p></div>
                <div><p className="text-xs text-slate-500">Email</p><p className="text-white">{detailOpen.email}</p></div>
                <div><p className="text-xs text-slate-500">Phone</p><p className="text-white">{detailOpen.phone}</p></div>
                <div><p className="text-xs text-slate-500">Status</p><Badge className={detailOpen.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{detailOpen.status}</Badge></div>
              </div>
              <div className="glass-card p-3 rounded-lg"><h4 className="text-xs text-amber-400 mb-2">Contracts ({detailOpen.contracts?.length || 0})</h4>{detailOpen.contracts?.map(c => <p key={c.id} className="text-sm text-white">{c.contractNo} · {c.position} · {kes(c.salary)}/mo · {c.startDate}→{c.endDate || 'Open'}</p>)}</div>
              <div className="glass-card p-3 rounded-lg"><h4 className="text-xs text-amber-400 mb-2">Schemes ({detailOpen.schemes?.length || 0})</h4>{detailOpen.schemes?.map(s => <p key={s.id} className="text-sm text-white">{s.title} · {s.subject} · {s.grade} · {s.term}</p>)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Conduct Form */}
      <Dialog open={conductOpen} onOpenChange={setConductOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Add Conduct Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Teacher</Label><Select value={cForm.teacherId} onValueChange={v => setCForm({ ...cForm, teacherId: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select teacher" /></SelectTrigger><SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-slate-300">Rating</Label><Select value={cForm.rating} onValueChange={v => setCForm({ ...cForm, rating: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Excellent">Excellent</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Satisfactory">Satisfactory</SelectItem><SelectItem value="Needs Improvement">Needs Improvement</SelectItem></SelectContent></Select></div>
            <div><Label className="text-slate-300">Comments</Label><Textarea value={cForm.comments} onChange={e => setCForm({ ...cForm, comments: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
          </div>
          <DialogFooter><Button onClick={handleConduct} className="bg-amber-500 hover:bg-amber-600 text-black">Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Form */}
      <Dialog open={payslipOpen} onOpenChange={setPayslipOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Generate Payslip</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label className="text-slate-300">Teacher</Label><Select value={pForm.teacherId} onValueChange={v => setPForm({ ...pForm, teacherId: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-slate-300">Month</Label><Select value={pForm.month} onValueChange={v => setPForm({ ...pForm, month: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent>{['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-slate-300">Year</Label><Input value={pForm.year} onChange={e => setPForm({ ...pForm, year: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Basic Salary</Label><Input type="number" value={pForm.salary} onChange={e => setPForm({ ...pForm, salary: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Allowances</Label><Input type="number" value={pForm.allowances} onChange={e => setPForm({ ...pForm, allowances: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Deductions</Label><Input type="number" value={pForm.deductions} onChange={e => setPForm({ ...pForm, deductions: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
          </div>
          <DialogFooter><Button onClick={handlePayslip} className="bg-amber-500 hover:bg-amber-600 text-black">Generate</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff Member Modal */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              Add New Staff Member
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-xs">First Name *</Label>
              <Input
                value={staffForm.firstName}
                onChange={e => setStaffForm({ ...staffForm, firstName: e.target.value })}
                placeholder="e.g. Grace"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Last Name *</Label>
              <Input
                value={staffForm.lastName}
                onChange={e => setStaffForm({ ...staffForm, lastName: e.target.value })}
                placeholder="e.g. Mwangi"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-slate-300 text-xs">Email Address *</Label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                placeholder="e.g. g.mwangi@bloomsjunior.sc.ke"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Phone Number *</Label>
              <Input
                value={staffForm.phone}
                onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                placeholder="e.g. +254 712 345 678"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Role / Position</Label>
              <Select value={staffForm.position} onValueChange={v => setStaffForm({ ...staffForm, position: v })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/[0.08] text-white">
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Headteacher">Headteacher</SelectItem>
                  <SelectItem value="Admin">Administrator</SelectItem>
                  <SelectItem value="Accountant">Accountant / Bursar</SelectItem>
                  <SelectItem value="Sports Coach">Sports Coach</SelectItem>
                  <SelectItem value="IT Specialist">IT Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Primary Subject</Label>
              <Input
                value={staffForm.subject}
                onChange={e => setStaffForm({ ...staffForm, subject: e.target.value })}
                placeholder="e.g. Mathematics & Science"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs">Qualification</Label>
              <Input
                value={staffForm.qualification}
                onChange={e => setStaffForm({ ...staffForm, qualification: e.target.value })}
                placeholder="e.g. B.Ed Primary Education"
                className="bg-white/[0.04] border-white/[0.08] mt-1"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-slate-300 text-xs">Staff Profile / ID Photo</Label>
              <div className="flex items-center gap-3 mt-1.5">
                {staffForm.profileImage ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 flex-shrink-0">
                    <img src={staffForm.profileImage} alt="Staff preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleStaffPhotoUpload(f);
                    }}
                    className="bg-white/[0.04] border-white/[0.08] text-xs h-9"
                  />
                  {uploadingStaffPhoto && <p className="text-[11px] text-amber-400 mt-1">Uploading photo...</p>}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddStaffOpen(false)} className="border-white/[0.08] text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleAddStaff} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              Save Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
