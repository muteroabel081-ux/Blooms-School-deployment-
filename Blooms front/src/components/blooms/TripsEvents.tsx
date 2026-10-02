'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Plus, Trash2, X, Loader2, ZoomIn, ImageOff,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; }
interface TripEvent { id: string; title: string; description: string; date: string; location: string; images: string; status: string; createdAt: string; }

const statusCls: Record<string, string> = { Upcoming: 'bg-amber-500/20 text-amber-400', Ongoing: 'bg-sky-500/20 text-sky-400', Completed: 'bg-green-500/20 text-green-400' };

export default function TripsEvents({ role }: PageProps) {
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState<string[]>([]);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '', status: 'Upcoming' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try { const res = await fetch('/api/trips-events'); if (!cancelled) setEvents(await res.json()); } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.date) return toast.error('Title and date required');
    try {
      const res = await fetch('/api/trips-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Event created!'); setAddOpen(false); setForm({ title: '', description: '', date: '', location: '', status: 'Upcoming' }); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id: string) => {
    try { await fetch(`/api/trips-events/${id}?XTransformPort=3000`, { method: 'DELETE' }); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const handleStatus = async (id: string, status: string) => {
    try { await fetch(`/api/trips-events/${id}?XTransformPort=3000`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); } catch { toast.error('Error'); }
  };

  const openGallery = (images: string) => {
    try { const imgs = JSON.parse(images); if (imgs.length) { setGalleryOpen(imgs); setGalleryIdx(0); } } catch { /* */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><MapPin className="text-amber-400" />Trips &amp; Events</h2>
        {role === 'admin' && <Button onClick={() => setAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Plus className="w-4 h-4 mr-2" />Create Event</Button>}
      </div>

      {loading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => {
            const images = (() => { try { return JSON.parse(ev.images); } catch { return []; } })();
            return (
              <motion.div key={ev.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
                {/* Image header */}
                <div className="relative h-40 bg-white/[0.03]">
                  {images[0] ? (
                    <img src={images[0]} alt={ev.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><MapPin className="w-10 h-10 text-slate-600" /></div>
                  )}
                  <div className="absolute top-2 right-2"><Badge className={statusCls[ev.status] || ''}>{ev.status}</Badge></div>
                  {images.length > 1 && (
                    <button onClick={() => openGallery(ev.images)} className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><ZoomIn className="w-3 h-3" />{images.length} photos</button>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold mb-1">{ev.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{ev.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3"><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.date}</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span></div>
                    {role === 'admin' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => handleStatus(ev.id, ev.status === 'Upcoming' ? 'Ongoing' : ev.status === 'Ongoing' ? 'Completed' : 'Upcoming')}>→ {ev.status === 'Upcoming' ? 'Start' : ev.status === 'Ongoing' ? 'Complete' : 'Reopen'}</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs text-red-400" onClick={() => handleDelete(ev.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {events.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No trips or events yet</div>}
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Create Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-slate-300">Date *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
              <div><Label className="text-slate-300">Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            </div>
            <div><Label className="text-slate-300">Status</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Upcoming">Upcoming</SelectItem><SelectItem value="Ongoing">Ongoing</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-black">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={galleryOpen.length > 0} onOpenChange={() => setGalleryOpen([])}>
        <DialogContent className="bg-black/95 border-none max-w-3xl">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            {galleryOpen[galleryIdx] && <img src={galleryOpen[galleryIdx]} alt="" className="max-w-full max-h-[70vh] object-contain rounded-lg" />}
            <button onClick={() => setGalleryIdx(Math.max(0, galleryIdx - 1))} className="absolute left-2 bg-black/60 text-white p-2 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setGalleryIdx(Math.min(galleryOpen.length - 1, galleryIdx + 1))} className="absolute right-2 bg-black/60 text-white p-2 rounded-full"><ChevronRight className="w-5 h-5" /></button>
            <p className="absolute bottom-2 text-white text-sm">{galleryIdx + 1} / {galleryOpen.length}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
