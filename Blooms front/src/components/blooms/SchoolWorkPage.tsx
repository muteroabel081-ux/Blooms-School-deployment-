'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, Search, Download, Eye, Trash2, Plus, FileText, Loader2, Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; }
interface SchoolWork { id: string; teacherId?: string; title: string; description: string; subject: string; grade: string; fileUrl: string; type: string; createdAt: string; teacher?: { firstName: string; lastName: string } | null; }
interface Scheme { id: string; teacherId?: string; title: string; subject: string; grade: string; term: string; fileUrl: string; createdAt: string; teacher?: { firstName: string; lastName: string } | null; }

export default function SchoolWorkPage({ role }: PageProps) {
  const [schoolwork, setSchoolwork] = useState<SchoolWork[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('assignments');
  const [addOpen, setAddOpen] = useState(false);
  const [schemeOpen, setSchemeOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<SchoolWork | null>(null);
  const [swForm, setSwForm] = useState({ title: '', description: '', subject: '', grade: 'Grade 1', fileUrl: '', type: 'Homework' });
  const [scForm, setScForm] = useState({ title: '', subject: '', grade: 'Grade 1', term: 'Term 1', fileUrl: '' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [sw, sc] = await Promise.all([fetch('/api/schoolwork'), fetch('/api/schemes-of-work')]);
        if (!cancelled) { setSchoolwork(await sw.json()); setSchemes(await sc.json()); }
      } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAddSW = async () => {
    if (!swForm.title || !swForm.subject) return toast.error('Title and subject required');
    try {
      const res = await fetch('/api/schoolwork', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(swForm) });
      if (res.ok) { toast.success('Assignment created!'); setAddOpen(false); setSwForm({ title: '', description: '', subject: '', grade: 'Grade 1', fileUrl: '', type: 'Homework' }); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleAddScheme = async () => {
    if (!scForm.title || !scForm.subject) return toast.error('Title and subject required');
    try {
      const res = await fetch('/api/schemes-of-work', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scForm) });
      if (res.ok) { toast.success('Scheme added!'); setSchemeOpen(false); setScForm({ title: '', subject: '', grade: 'Grade 1', term: 'Term 1', fileUrl: '' }); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const fSW = schoolwork.filter(s => !search || `${s.title} ${s.subject} ${s.grade}`.toLowerCase().includes(search.toLowerCase()));
  const fSC = schemes.filter(s => !search || `${s.title} ${s.subject} ${s.grade}`.toLowerCase().includes(search.toLowerCase()));
  const canCreate = role === 'admin' || role === 'teacher';

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="text-amber-400" />{role === 'student' ? 'My Assignments' : role === 'teacher' ? 'School Work & Schemes' : 'School Work'}</h2>
        <div className="flex gap-2">
          {canCreate && <Button onClick={() => setAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="w-4 h-4 mr-2" />Assignment</Button>}
          {canCreate && <Button onClick={() => setSchemeOpen(true)} variant="outline" className="border-amber-500/30 text-amber-400"><Plus className="w-4 h-4 mr-2" />Scheme</Button>}
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-white/[0.04] border-white/[0.08] w-48" /></div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schemes">Schemes of Work</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="mt-4">
          <div className="grid gap-3">
            {fSW.map(sw => (
              <motion.div key={sw.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/[0.06]" onClick={() => setDetailOpen(sw)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-400" /></div>
                  <div>
                    <p className="text-white font-medium">{sw.title}</p>
                    <div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{sw.subject}</Badge><Badge variant="outline" className="text-xs">{sw.grade}</Badge><Badge className="text-xs bg-white/[0.06] text-slate-300">{sw.type}</Badge></div>
                    {sw.teacher && <p className="text-xs text-slate-500 mt-1">By {sw.teacher.firstName} {sw.teacher.lastName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sw.fileUrl && <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-7" onClick={e => { e.stopPropagation(); window.open(sw.fileUrl, '_blank'); }}><Download className="w-3 h-3 mr-1" />File</Button>}
                  <Eye className="w-4 h-4 text-slate-500" />
                </div>
              </motion.div>
            ))}
            {fSW.length === 0 && <p className="text-center text-slate-500 py-10">No assignments</p>}
          </div>
        </TabsContent>

        <TabsContent value="schemes" className="mt-4">
          <div className="grid gap-3">
            {fSC.map(sc => (
              <motion.div key={sc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-sky-400" /></div>
                  <div>
                    <p className="text-white font-medium">{sc.title}</p>
                    <div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{sc.subject}</Badge><Badge variant="outline" className="text-xs">{sc.grade}</Badge><Badge variant="outline" className="text-xs">{sc.term}</Badge></div>
                    {sc.teacher && <p className="text-xs text-slate-500 mt-1">By {sc.teacher.firstName} {sc.teacher.lastName}</p>}
                  </div>
                </div>
                {sc.fileUrl && <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-7" onClick={() => window.open(sc.fileUrl, '_blank')}><Download className="w-3 h-3 mr-1" />View</Button>}
              </motion.div>
            ))}
            {fSC.length === 0 && <p className="text-center text-slate-500 py-10">No schemes of work</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">{detailOpen?.title}</DialogTitle><DialogDescription className="text-slate-400">{detailOpen?.description}</DialogDescription></DialogHeader>
          {detailOpen && (
            <div className="space-y-3">
              <div className="flex gap-2"><Badge variant="outline">{detailOpen.subject}</Badge><Badge variant="outline">{detailOpen.grade}</Badge><Badge>{detailOpen.type}</Badge></div>
              <p className="text-sm text-slate-400">Assigned: {new Date(detailOpen.createdAt).toLocaleDateString()}</p>
              {detailOpen.fileUrl && <Button onClick={() => window.open(detailOpen.fileUrl, '_blank')} className="bg-amber-500 hover:bg-amber-600 text-black w-full"><Download className="w-4 h-4 mr-2" />Download File</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Assignment */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Create Assignment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Title *</Label><Input value={swForm.title} onChange={e => setSwForm({ ...swForm, title: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Description</Label><Textarea value={swForm.description} onChange={e => setSwForm({ ...swForm, description: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Subject *</Label><Input value={swForm.subject} onChange={e => setSwForm({ ...swForm, subject: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
              <div><Label className="text-slate-300">Grade</Label><Select value={swForm.grade} onValueChange={v => setSwForm({ ...swForm, grade: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent>{['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="text-slate-300">File URL</Label><Input value={swForm.fileUrl} onChange={e => setSwForm({ ...swForm, fileUrl: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Type</Label><Select value={swForm.type} onValueChange={v => setSwForm({ ...swForm, type: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Homework">Homework</SelectItem><SelectItem value="Classwork">Classwork</SelectItem><SelectItem value="Project">Project</SelectItem><SelectItem value="Exam">Exam</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={handleAddSW} className="bg-amber-500 hover:bg-amber-600 text-black">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Scheme */}
      <Dialog open={schemeOpen} onOpenChange={setSchemeOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Add Scheme of Work</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Title *</Label><Input value={scForm.title} onChange={e => setScForm({ ...scForm, title: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Subject *</Label><Input value={scForm.subject} onChange={e => setScForm({ ...scForm, subject: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
              <div><Label className="text-slate-300">Grade</Label><Select value={scForm.grade} onValueChange={v => setScForm({ ...scForm, grade: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent>{['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label className="text-slate-300">Term</Label><Select value={scForm.term} onValueChange={v => setScForm({ ...scForm, term: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Term 1">Term 1</SelectItem><SelectItem value="Term 2">Term 2</SelectItem><SelectItem value="Term 3">Term 3</SelectItem></SelectContent></Select></div>
            <div><Label className="text-slate-300">File URL</Label><Input value={scForm.fileUrl} onChange={e => setScForm({ ...scForm, fileUrl: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
          </div>
          <DialogFooter><Button onClick={handleAddScheme} className="bg-amber-500 hover:bg-amber-600 text-black">Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
