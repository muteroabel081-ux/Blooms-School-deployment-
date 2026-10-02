'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, XCircle, CheckCheck, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; seeded?: boolean; }
interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string; }

const typeCfg: Record<string, { color: string; bg: string }> = {
  info: { color: 'text-sky-400', bg: 'bg-sky-500/10' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  success: { color: 'text-green-400', bg: 'bg-green-500/10' },
  error: { color: 'text-red-400', bg: 'bg-red-500/10' },
  fee: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  announcement: { color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

export default function NotificationsPage({ role, seeded }: PageProps) {
  const [notes, setNotes] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sendOpen, setSendOpen] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });

  useEffect(() => {
    if (!seeded) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!cancelled) setNotes(await res.json());
      } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [seeded]);

  const markRead = async (id: string) => {
    try { await fetch(`/api/notifications/${id}?XTransformPort=3000`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) }); setNotes(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); } catch { /* */ }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(notes.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}?XTransformPort=3000`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read: true }) })));
      setNotes(prev => prev.map(n => ({ ...n, read: true }))); toast.success('All marked as read');
    } catch { toast.error('Error'); }
  };

  const handleSend = async () => {
    if (!form.title || !form.message) return toast.error('Fill all fields');
    try {
      const res = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Notification sent!'); setSendOpen(false); setForm({ title: '', message: '', type: 'info' }); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const filtered = notes.filter(n => filter === 'all' || n.type === filter || (filter === 'unread' && !n.read));
  const unread = notes.filter(n => !n.read).length;

  if (loading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Bell className="text-amber-400" />Notifications{unread > 0 && <Badge className="bg-amber-500 text-black ml-2">{unread} new</Badge>}</h2>
        <div className="flex gap-2">
          {role === 'admin' && <Button onClick={() => setSendOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Send className="w-4 h-4 mr-2" />Send</Button>}
          {unread > 0 && <Button variant="outline" onClick={markAllRead} className="border-amber-500/30 text-amber-400"><CheckCheck className="w-4 h-4 mr-2" />Mark All Read</Button>}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'unread', 'info', 'warning', 'success', 'fee', 'announcement'].map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className={filter === f ? 'bg-amber-500 text-black' : 'border-white/[0.08] text-slate-400 h-7 text-xs capitalize'}>{f}</Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(n => {
          const cfg = typeCfg[n.type] || typeCfg.info;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onClick={() => !n.read && markRead(n.id)} className={`glass-card p-4 rounded-xl flex items-start gap-4 cursor-pointer transition-colors ${!n.read ? 'border-l-2 border-amber-500' : 'opacity-70'}`}>
              <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}><Bell className={`w-5 h-5 ${cfg.color}`} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-white font-medium text-sm">{n.title}</p>{!n.read && <span className="w-2 h-2 bg-amber-500 rounded-full" />}</div>
                <p className="text-sm text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <p className="text-center text-slate-500 py-10">No notifications</p>}
      </div>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Send Notification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" /></div>
            <div><Label className="text-slate-300">Message</Label><Textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" rows={3} /></div>
            <div><Label className="text-slate-300">Type</Label><Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Info</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="fee">Fee</SelectItem><SelectItem value="announcement">Announcement</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={handleSend} className="bg-amber-500 hover:bg-amber-600 text-black"><Send className="w-4 h-4 mr-2" />Send</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
