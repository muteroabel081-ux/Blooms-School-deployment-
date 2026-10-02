'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Pencil, Trash2, Star, Loader2, UserCircle,
  Award, Gem, Crown, Trophy, Shield, TrendingUp, GraduationCap,
  Heart, Sparkles, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface PageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void }
interface Parent { id: string; name: string; email: string; phone: string; occupation: string | null; address: string | null; starRating: number; starTier: string; participation: string; _count?: { children: number }; createdAt: string }
interface Student { id: string; firstName: string; lastName: string; admissionNo: string; grade: string; allergens?: string | null; nemisNumber?: string | null; hobbies?: string | null; parentId?: string }

const TIERS = [
  { n: 'Bronze', c: 'text-orange-400', bg: 'bg-orange-500/15', b: 'border-orange-500/25', i: Shield },
  { n: 'Silver', c: 'text-slate-300', bg: 'bg-slate-400/15', b: 'border-slate-400/25', i: Award },
  { n: 'Gold', c: 'text-amber-400', bg: 'bg-amber-500/15', b: 'border-amber-500/25', i: Crown },
  { n: 'Platinum', c: 'text-cyan-400', bg: 'bg-cyan-500/15', b: 'border-cyan-500/25', i: Trophy },
  { n: 'Diamond', c: 'text-purple-400', bg: 'bg-purple-500/15', b: 'border-purple-500/25', i: Gem },
] as const;
const TIER_MIN: Record<string, number> = { Bronze: 0, Silver: 4, Gold: 7, Platinum: 10, Diamond: 13 };
const getTier = (s: number) => [...TIERS].reverse().find(t => s >= TIER_MIN[t.n])!.n;
const tc = (name: string) => TIERS.find(t => t.n === name) || TIERS[0];
const ic = 'bg-white/5 border-white/10 text-slate-200 placeholder:text-slate-600';
const ef = { name: '', email: '', phone: '', occupation: '', address: '' };

export default function ParentsPage({ role }: PageProps) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [kids, setKids] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(ef);
  const [editId, setEditId] = useState<string | null>(null);
  const [dlg, setDlg] = useState<'add' | 'del' | 'rate' | null>(null);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState<Parent | null>(null);
  const [rp, setRp] = useState<Parent | null>(null);
  const [sv, setSv] = useState(0);
  const [notes, setNotes] = useState('');
  const [vid, setVid] = useState<string | null>(null);

  const fp = useCallback(async () => { try { setLoading(true); const r = await fetch('/api/star-ratings'); if (!r.ok) throw 0; setParents(await r.json()); } catch { toast.error('Failed'); } finally { setLoading(false); } }, []);
  const fk = useCallback(async () => { try { const r = await fetch('/api/students'); if (!r.ok) return; setKids(await r.json()); } catch { /* */ } }, []);
  useEffect(() => { fp(); fk(); }, [fp, fk]);

  if (role !== 'admin') return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><Shield className="h-12 w-12 text-slate-600" /><p className="text-slate-400">Admin access only.</p></div>
  );

  const fil = parents.filter(p => { if (!search) return true; const q = search.toLowerCase(); return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q); });
  const st = { total: parents.length, active: parents.filter(p => p.starRating > 0).length, gold: parents.filter(p => ['Gold', 'Platinum', 'Diamond'].includes(p.starTier)).length, diamond: parents.filter(p => p.starTier === 'Diamond').length };

  const openAdd = () => { setForm(ef); setEditId(null); setDlg('add'); };
  const openEdit = (p: Parent) => { setForm({ name: p.name, email: p.email, phone: p.phone, occupation: p.occupation || '', address: p.address || '' }); setEditId(p.id); setDlg('add'); };
  const openRate = (p: Parent) => { setRp(p); setSv(p.starRating || 0); setNotes(p.participation || ''); setDlg('rate'); };

  const onSubmit = async () => {
    if (!form.name || !form.email || !form.phone) { toast.error('Fill required fields'); return; }
    try { setBusy(true); if (editId) { toast.info('Update requires server support'); } else { const r = await fetch('/api/parents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); if (!r.ok) throw new Error((await r.json()).error); toast.success('Parent added'); } setDlg(null); fp(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed'); } finally { setBusy(false); }
  };
  const onDel = async () => { if (!del) return; try { const r = await fetch(`/api/parents?id=${del.id}`, { method: 'DELETE' }); if (!r.ok) throw 0; toast.success('Deleted'); setDlg(null); setDel(null); fp(); } catch { toast.error('Failed'); } };
  const onRate = async () => { if (!rp) return; try { setBusy(true); const r = await fetch('/api/star-ratings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: rp.id, starRating: sv, participation: notes }) }); if (!r.ok) throw 0; toast.success(`${sv} stars (${getTier(sv)})`); setDlg(null); fp(); } catch { toast.error('Failed'); } finally { setBusy(false); } };

  const SR = ({ n, sz = 'w-2.5 h-2.5' }: { n: number; sz?: string }) => <div className="flex gap-px">{Array.from({ length: 13 }, (_, i) => <Star key={i} className={`${sz} ${i < n ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />)}</div>;
  const TP = ({ name }: { name: string }) => { const t = tc(name); const T = t.i; return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${t.c} ${t.bg} ${t.b}`}><T className="h-2.5 w-2.5" />{t.n}</span>; };

  return (
    <div className="space-y-5" suppressHydrationWarning>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3"><Users className="h-8 w-8 text-amber-400" /><div><h1 className="text-2xl font-bold text-slate-100">Parents</h1><p className="text-slate-400 text-sm">Manage records & star ratings</p></div></div>
        <Button onClick={openAdd} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"><Plus className="h-4 w-4 mr-2" />Add Parent</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([['Total', st.total, Users, 'text-amber-400', 'bg-amber-500/10'], ['Active', st.active, TrendingUp, 'text-emerald-400', 'bg-emerald-500/10'], ['Gold+', st.gold, Star, 'text-amber-400', 'bg-amber-500/10'], ['Diamond', st.diamond, Gem, 'text-purple-400', 'bg-purple-500/10']] as const).map(([l, v, I, t1, t2]) => (
          <div key={String(l)} className="glass-card-static rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${t2}`}><I className={`h-5 w-5 ${t1}`} /></div>
            <div><p className="text-2xl font-bold text-slate-100">{v}</p><p className="text-xs text-slate-500">{String(l)}</p></div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} className="glass-card-static rounded-xl p-3 flex items-center gap-2 flex-wrap">
        {TIERS.map(t => <span key={t.n} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${t.c} ${t.bg} ${t.b}`}>{parents.filter(p => p.starTier === t.n).length} {t.n}</span>)}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className={`pl-10 ${ic}`} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card-static rounded-2xl overflow-hidden">
        {loading ? <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 bg-white/5" />)}</div> : fil.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full"><thead><tr className="border-b border-white/5">
              {['Name', 'Email', 'Phone', 'Stars', 'Tier', 'Ch.', ''].map((h, i) => (
                <th key={h} className={`text-left text-slate-400 text-xs font-semibold p-3 ${[1, 5].includes(i) ? 'hidden sm:table-cell' : ''} ${i === 2 ? 'hidden md:table-cell' : ''} ${i === 6 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr></thead><tbody>
              <AnimatePresence>{fil.map((p, idx) => (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0"><UserCircle className="h-4 w-4 text-amber-400" /></div><span className="text-slate-200 font-medium text-sm">{p.name}</span></div></td>
                  <td className="p-3 text-slate-400 text-sm hidden sm:table-cell">{p.email}</td>
                  <td className="p-3 text-slate-400 text-sm hidden md:table-cell">{p.phone}</td>
                  <td className="p-3"><div className="flex items-center gap-1"><SR n={p.starRating || 0} /><span className="text-xs text-slate-500 ml-1">{p.starRating || 0}</span></div></td>
                  <td className="p-3"><TP name={p.starTier || 'Bronze'} /></td>
                  <td className="p-3 hidden sm:table-cell text-slate-300 text-sm">{p._count?.children || 0}</td>
                  <td className="p-3"><div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setVid(vid === p.id ? null : p.id)} className="h-7 w-7 p-0 text-slate-400 hover:text-sky-400 hover:bg-sky-500/10"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openRate(p)} className="h-7 w-7 p-0 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"><Star className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)} className="h-7 w-7 p-0 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setDel(p); setDlg('del'); }} className="h-7 w-7 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div></td>
                </motion.tr>
              ))}</AnimatePresence>
            </tbody></table>
            <AnimatePresence>{vid && (() => {
              const vc = kids.filter(s => s.parentId === vid);
              return vc.length > 0 ? (
                <motion.div key={vid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-white/[0.02] border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-2">Children ({vc.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {vc.map(s => (<div key={s.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-amber-400" /></div>
                        <div><p className="text-sm font-medium text-slate-200">{s.firstName} {s.lastName}</p><p className="text-[10px] text-slate-500">{s.admissionNo} · {s.grade}</p></div></div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        {s.allergens && s.allergens !== 'None' && <span className="flex items-center gap-1 text-[10px]"><Heart className="h-2.5 w-2.5 text-red-400" /><span className="text-slate-400">{s.allergens}</span></span>}
                        {s.nemisNumber && <span className="flex items-center gap-1 text-[10px]"><Shield className="h-2.5 w-2.5 text-sky-400" /><span className="text-slate-400">{s.nemisNumber}</span></span>}
                        {s.hobbies && <span className="flex items-center gap-1 text-[10px]"><Sparkles className="h-2.5 w-2.5 text-amber-400" /><span className="text-slate-400">{s.hobbies}</span></span>}
                      </div>
                    </div>))}
                  </div>
                </motion.div>
              ) : <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-white/[0.02] border-t border-white/5"><p className="text-sm text-slate-500">No children registered.</p></motion.div>;
            })()}</AnimatePresence>
          </div>
        ) : <div className="p-12 text-center"><Users className="h-12 w-12 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No parents found</p></div>}
      </motion.div>

      <Dialog open={dlg === 'add'} onOpenChange={o => { if (!o) setDlg(null); }}>
        <DialogContent className="bg-[#111827] border-white/10 text-slate-200">
          <DialogHeader><DialogTitle className="text-xl text-slate-100">{editId ? 'Edit' : 'Add'} Parent</DialogTitle><DialogDescription>{editId ? 'Update info.' : 'Register new parent.'}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label className="text-slate-300">Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Kamau" className={ic} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-slate-300">Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email.com" className={ic} /></div>
              <div className="space-y-2"><Label className="text-slate-300">Phone *</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+254..." className={ic} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-slate-300">Occupation</Label><Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} className={ic} /></div>
              <div className="space-y-2"><Label className="text-slate-300">Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={ic} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDlg(null)} className="text-slate-400">Cancel</Button>
            <Button onClick={onSubmit} disabled={busy} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editId ? 'Save' : 'Add'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === 'del'} onOpenChange={o => { if (!o) { setDlg(null); setDel(null); } }}>
        <DialogContent className="bg-[#111827] border-white/10 text-slate-200 max-w-md">
          <DialogHeader><DialogTitle className="text-xl text-slate-100">Delete Parent</DialogTitle></DialogHeader>
          <p className="text-slate-400 py-2">Delete <span className="text-slate-200 font-medium">{del?.name}</span>? Unlinks children. Cannot undo.</p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => { setDlg(null); setDel(null); }} className="text-slate-400">Cancel</Button>
            <Button onClick={onDel} className="bg-red-500 hover:bg-red-600 text-white font-semibold">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dlg === 'rate'} onOpenChange={o => { if (!o) setDlg(null); }}>
        <DialogContent className="bg-[#111827] border-white/10 text-slate-200 max-w-md">
          <DialogHeader><DialogTitle className="text-xl text-slate-100">Star Rating</DialogTitle><DialogDescription className="text-slate-500">Rate {rp?.name}&apos;s engagement</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center justify-between mb-3"><p className="text-sm text-slate-400">Stars</p><p className="text-3xl font-bold text-amber-400">{sv}<span className="text-sm font-normal text-slate-500"> / 13</span></p></div>
              <Slider value={[sv]} onValueChange={v => setSv(v[0])} min={0} max={13} step={1} className="[&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500" />
              <div className="flex items-center gap-1.5 mt-3"><SR n={sv} sz="w-4 h-4" /></div>
              <div className="mt-2"><TP name={getTier(sv)} /></div>
            </div>
            <div className="space-y-2"><Label className="text-slate-300">Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="PTA member..." rows={3} className="bg-white/5 border-white/10 text-slate-200 resize-none" /></div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDlg(null)} className="text-slate-400">Cancel</Button>
            <Button onClick={onRate} disabled={busy} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
