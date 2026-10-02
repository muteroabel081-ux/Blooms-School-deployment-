'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, GraduationCap, Phone, Mail, Calendar, Loader2,
  ArrowLeft, CreditCard, Eye, FileText, Download, X, Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentsPageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; seeded?: boolean; }
interface Student { id: string; firstName: string; lastName: string; admissionNo: string; grade: string; gender: string; dateOfBirth?: string; parentPhone?: string; parentEmail?: string; status: string; profileImage?: string; allergens?: string; nemisNumber?: string; hobbies?: string; address?: string; age?: string; parentId?: string; parent?: { id: string; name: string; email: string; phone: string } | null; }
interface FeeRecord { id: string; amount: number; paid: number; status: string; term: string; }
interface ReceiptRecord { id: string; receiptNo: string; amount: number; term: string; paymentMethod: string; createdAt: string; }
interface ParentBrief { id: string; name: string; email: string; phone: string; }

export default function StudentsPage({ role, seeded }: StudentsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<ParentBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<FeeRecord[]>([]);
  const [studentReceipts, setStudentReceipts] = useState<ReceiptRecord[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', grade: 'Grade 1', gender: 'Male', dob: '', phone: '', email: '', parentId: '', profileImage: '' });

  useEffect(() => {
    if (!seeded) return;
    let cancelled = false;

    (async () => {
      try {
        const [s, p] = await Promise.all([fetch('/api/students'), fetch('/api/parents')]);
        if (!cancelled) { setStudents(await s.json()); setParents(await p.json()); }
      } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [seeded]);

  const loadDetail = async (s: Student) => {
    setSelected(s);
    try {
      const [f, r] = await Promise.all([fetch(`/api/fees?studentId=${s.id}`), fetch(`/api/receipts?studentId=${s.id}`)]);
      setStudentFees(await f.json()); setStudentReceipts(await r.json());
    } catch { /* */ }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, profileImage: data.url }));
        toast.success('Passport photo uploaded!');
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, profileImage: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAdd = async () => {
    if (!form.firstName || !form.lastName) return toast.error('Name required');
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          grade: form.grade,
          gender: form.gender,
          dateOfBirth: form.dob,
          parentPhone: form.phone,
          parentEmail: form.email,
          parentId: form.parentId || undefined,
          profileImage: form.profileImage || undefined,
        })
      });
      if (res.ok) {
        const created = await res.json();
        setStudents(prev => [created, ...prev]);
        toast.success(`Student ${form.firstName} ${form.lastName} registered!`);
        setAddOpen(false);
        setForm({ firstName: '', lastName: '', grade: 'Grade 1', gender: 'Male', dob: '', phone: '', email: '', parentId: '', profileImage: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to register student');
      }
    } catch { toast.error('Error'); }
  };

  const kes = (n: number) => 'KES ' + Number(n).toLocaleString('en-KE');
  const filtered = students.filter(s => !search || `${s.firstName} ${s.lastName} ${s.admissionNo} ${s.grade}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Users className="text-amber-400" />{role === 'admin' ? 'All Students' : role === 'parent' ? 'My Children' : role === 'teacher' ? 'Student Roster' : 'My Profile'}</h2>
        <div className="flex gap-2">
          {role === 'admin' && <Button onClick={() => setAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="w-4 h-4 mr-2" />Register Student</Button>}
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-white/[0.04] border-white/[0.08] w-56" /></div>
        </div>
      </div>

      {loading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
        <div className="grid gap-3">
          {filtered.slice(0, 30).map(s => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/[0.06] transition-colors" onClick={() => loadDetail(s)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm overflow-hidden flex-shrink-0 border border-white/10">
                  {s.profileImage ? (
                    <img src={s.profileImage} alt={s.firstName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span>{s.firstName[0]}{s.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{s.firstName} {s.lastName}</p>
                  <div className="flex gap-2 mt-0.5"><Badge variant="outline" className="text-xs">{s.admissionNo}</Badge><Badge variant="outline" className="text-xs">{s.grade}</Badge><Badge className={`text-xs ${s.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{s.status}</Badge></div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-400">
                {s.parent && <span>Parent: {s.parent.name}</span>}
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <p className="text-center text-slate-500 py-10">No students found</p>}
        </div>
      )}

      {/* Student Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08] max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><GraduationCap className="text-amber-400" />Student Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* Profile */}
              <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl overflow-hidden flex-shrink-0 border-2 border-amber-500/40">
                  {selected.profileImage ? (
                    <img src={selected.profileImage} alt={selected.firstName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = 'none'; }} />
                  ) : (
                    <span>{selected.firstName[0]}{selected.lastName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold">{selected.firstName} {selected.lastName}</h3>
                  <p className="text-slate-400">{selected.admissionNo} · {selected.grade} · {selected.gender}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selected.dateOfBirth && <div className="glass-card p-3 rounded-lg"><p className="text-xs text-slate-500">Date of Birth</p><p className="text-white text-sm">{selected.dateOfBirth}</p></div>}
                {selected.parentPhone && <div className="glass-card p-3 rounded-lg flex items-center gap-2"><Phone className="w-3 h-3 text-slate-500" /><p className="text-white text-sm">{selected.parentPhone}</p></div>}
                {selected.parentEmail && <div className="glass-card p-3 rounded-lg flex items-center gap-2"><Mail className="w-3 h-3 text-slate-500" /><p className="text-white text-sm">{selected.parentEmail}</p></div>}
                {selected.allergens && <div className="glass-card p-3 rounded-lg"><p className="text-xs text-slate-500">Allergens</p><p className="text-white text-sm">{selected.allergens}</p></div>}
                {selected.nemisNumber && <div className="glass-card p-3 rounded-lg"><p className="text-xs text-slate-500">NEMIS No.</p><p className="text-white text-sm">{selected.nemisNumber}</p></div>}
                {selected.hobbies && <div className="glass-card p-3 rounded-lg"><p className="text-xs text-slate-500">Hobbies</p><p className="text-white text-sm">{selected.hobbies}</p></div>}
              </div>

              {/* Parent Info */}
              <div className="glass-card p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" />Parent/Guardian</h4>
                {selected.parent ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-slate-500">Name</p><p className="text-white">{selected.parent.name}</p></div>
                    <div><p className="text-xs text-slate-500">Email</p><p className="text-white">{selected.parent.email}</p></div>
                    <div><p className="text-xs text-slate-500">Phone</p><p className="text-white">{selected.parent.phone}</p></div>
                  </div>
                ) : <p className="text-slate-500 text-sm">No parent linked</p>}
              </div>

              {/* Fees */}
              <div className="glass-card p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" />Fees</h4>
                <div className="space-y-2">
                  {studentFees.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-2 bg-white/[0.03] rounded-lg">
                      <div><span className="text-white text-sm">{f.term}</span></div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{kes(f.paid)} / {kes(f.amount)}</span>
                        <Badge className={`text-xs ${f.status === 'Paid' ? 'bg-green-500/20 text-green-400' : f.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-amber-500/20 text-amber-400'}`}>{f.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {studentFees.length === 0 && <p className="text-slate-500 text-sm">No fees recorded</p>}
                </div>
              </div>

              {/* Receipts */}
              <div className="glass-card p-4 rounded-xl">
                <h4 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" />Receipts</h4>
                <div className="space-y-2">
                  {studentReceipts.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 bg-white/[0.03] rounded-lg">
                      <div><span className="text-white text-sm">{r.receiptNo}</span><span className="text-xs text-slate-500 ml-2">{r.term}</span></div>
                      <span className="text-green-400 font-bold text-sm">{kes(r.amount)}</span>
                    </div>
                  ))}
                  {studentReceipts.length === 0 && <p className="text-slate-500 text-sm">No receipts</p>}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Register Student Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Register New Student</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-slate-300">First Name *</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Last Name *</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Grade</Label><Select value={form.grade} onValueChange={v => setForm({ ...form, grade: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent>{['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-slate-300">Gender</Label><Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select></div>
            <div><Label className="text-slate-300">Date of Birth</Label><Input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Parent</Label><Select value={form.parentId} onValueChange={v => setForm({ ...form, parentId: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Link parent" /></SelectTrigger><SelectContent>{parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="col-span-2">
              <Label className="text-slate-300">Student Passport Photo</Label>
              <div className="flex items-center gap-3 mt-1.5">
                {form.profileImage ? (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-400/50 flex-shrink-0">
                    <img src={form.profileImage} alt="Preview" className="w-full h-full object-cover" />
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
                      if (f) handlePhotoUpload(f);
                    }}
                    className="bg-white/[0.04] border-white/[0.08] text-xs h-9"
                  />
                  {uploadingPhoto && <p className="text-[11px] text-amber-400 mt-1">Uploading photo...</p>}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="w-4 h-4 mr-2" />Register</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
