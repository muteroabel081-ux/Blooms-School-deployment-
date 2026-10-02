'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, CreditCard, Receipt, Download, Search, Loader2,
  Smartphone, CheckCircle2, XCircle, ShieldCheck, Send, FileText, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface FeesPageProps { role: 'admin' | 'parent' | 'teacher' | 'student'; onNavigate?: (section: string) => void; seeded?: boolean; }
interface FeeRecord { id: string; studentId: string; term: string; amount: number; paid: number; status: string; dueDate?: string; createdAt?: string; student?: { id: string; firstName: string; lastName: string; admissionNo?: string; grade?: string; parent?: { id: string; name: string; email: string; phone: string } | null }; }
interface PaymentRecord { id: string; studentId: string; studentName?: string; feeId?: string; amount: number; paymentMethod: string; referenceNo: string; slipUrl?: string; status: string; term?: string; verifiedBy?: string; createdAt?: string; student?: { id: string; firstName: string; lastName: string; parent?: { id: string; name: string; email: string; phone: string } | null }; }
interface ReceiptRecord { id: string; receiptNo: string; studentName: string; amount: number; paymentMethod: string; referenceNo: string; term: string; verifiedBy?: string; createdAt: string; }
interface StudentBrief { id: string; firstName: string; lastName: string; grade?: string; }

const kes = (n: number) => 'KES ' + Number(n).toLocaleString('en-KE');
const statusBadge = (s: string) => {
  const m: Record<string, string> = { Pending: 'bg-amber-500/20 text-amber-400', Paid: 'bg-green-500/20 text-green-400', Partial: 'bg-yellow-500/20 text-yellow-400', Overdue: 'bg-red-500/20 text-red-400', Verified: 'bg-green-500/20 text-green-400', Rejected: 'bg-red-500/20 text-red-400' };
  return m[s] || 'bg-gray-500/20 text-gray-400';
};

export default function FeesPage({ role, seeded }: FeesPageProps) {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [students, setStudents] = useState<StudentBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('fees');
  const [search, setSearch] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState<ReceiptRecord | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', amount: '', ref: '', method: 'M-Pesa', term: '' });

  useEffect(() => {
    if (!seeded) return;
    let cancelled = false;

    (async () => {
      try {
        const [f, p, r, s] = await Promise.all([fetch('/api/fees'), fetch('/api/fee-payments'), fetch('/api/receipts'), fetch('/api/students')]);
        if (!cancelled) { setFees(await f.json()); setPayments(await p.json()); setReceipts(await r.json()); setStudents(await s.json()); }
      } catch { /* */ }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [seeded]);

  const reload = () => {

    Promise.all([fetch('/api/fees'), fetch('/api/fee-payments'), fetch('/api/receipts'), fetch('/api/students')])
      .then(([f, p, r, s]) => Promise.all([f.json(), p.json(), r.json(), s.json()]))
      .then(([fees, payments, receipts, students]) => { setFees(fees); setPayments(payments); setReceipts(receipts); setStudents(students); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handlePay = async () => {
    if (!form.studentId || !form.amount || !form.ref) return toast.error('Fill all fields');
    try {
      const res = await fetch('/api/fee-payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: form.studentId, amount: parseFloat(form.amount), referenceNo: form.ref, paymentMethod: form.method, term: form.term || 'Term 1' }) });
      if (res.ok) { toast.success('Payment submitted!'); setPayOpen(false); setForm({ studentId: '', amount: '', ref: '', method: 'M-Pesa', term: '' }); reload(); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleVerify = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/fee-payments/${id}?XTransformPort=3000`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { toast.success(`Payment ${status}`); reload(); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const handleReminder = async () => {
    if (!form.studentId) return toast.error('Select a student');
    try {
      const res = await fetch('/api/fee-reminders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: form.studentId, message: `Reminder: Fee payment is overdue. Please make payment as soon as possible.`, sentBy: 'Admin' }) });
      if (res.ok) { toast.success('Reminder sent!'); setReminderOpen(false); } else toast.error('Failed');
    } catch { toast.error('Error'); }
  };

  const filtered = (arr: any[]) => arr.filter(i => !search || JSON.stringify(i).toLowerCase().includes(search.toLowerCase()));

  if (role === 'student' || role === 'teacher') setTab('fees');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><CreditCard className="text-amber-400" />{role === 'admin' ? 'Fee Management' : role === 'parent' ? 'My Fee Payments' : 'Fee Overview'}</h2>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 bg-white/[0.04] border-white/[0.08] w-64" /></div>
      </div>

      {role === 'admin' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Fees', value: kes(fees.reduce((a, f) => a + f.amount, 0)), icon: DollarSign, color: 'text-amber-400' },
            { label: 'Collected', value: kes(fees.reduce((a, f) => a + f.paid, 0)), icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Pending', value: fees.filter(f => f.status === 'Pending').length, icon: ShieldCheck, color: 'text-yellow-400' },
            { label: 'Payments', value: payments.length, icon: Receipt, color: 'text-sky-400' },
          ].map(s => (
            <div key={s.label} className="glass-card p-4 rounded-xl"><div className="flex items-center gap-3"><s.icon className={`w-5 h-5 ${s.color}`} /><div><p className="text-xs text-slate-400">{s.label}</p><p className="text-lg font-bold text-white">{s.value}</p></div></div></div>
          ))}
        </div>
      )}

      {role === 'admin' && (
        <div className="flex gap-2">
          <Button onClick={() => setPayOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Smartphone className="w-4 h-4 mr-2" />Record Payment</Button>
          <Button onClick={() => setReminderOpen(true)} variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"><Send className="w-4 h-4 mr-2" />Send Reminder</Button>
        </div>
      )}

      {role === 'parent' && (
        <Button onClick={() => setPayOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black"><Smartphone className="w-4 h-4 mr-2" />Make Payment</Button>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/[0.04]">
          <TabsTrigger value="fees">Fees</TabsTrigger>
          {(role === 'admin' || role === 'parent') && <TabsTrigger value="payments">Payments</TabsTrigger>}
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="mt-4">
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <div className="space-y-3">
              {filtered(fees).slice(0, 20).map(fee => (
                <motion.div key={fee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{fee.student?.firstName} {fee.student?.lastName} <span className="text-slate-500 text-sm">({fee.student?.admissionNo})</span></p>
                    {fee.student?.parent && <p className="text-xs text-slate-400">Parent: {fee.student.parent.name} · {fee.student.parent.phone}</p>}
                    <div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{fee.term}</Badge><Badge variant="outline" className="text-xs">{fee.student?.grade}</Badge></div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{kes(fee.amount)}</p>
                    <p className="text-xs text-green-400">Paid: {kes(fee.paid)}</p>
                    <Badge className={`mt-1 ${statusBadge(fee.status)}`}>{fee.status}</Badge>
                  </div>
                </motion.div>
              ))}
              {filtered(fees).length === 0 && <p className="text-center text-slate-500 py-10">No fees found</p>}
            </div>
          )}
        </TabsContent>

        {(role === 'admin' || role === 'parent') && (
          <TabsContent value="payments" className="mt-4">
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-3">
                {filtered(payments).slice(0, 20).map(pay => (
                  <motion.div key={pay.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-medium">{pay.studentName || `${pay.student?.firstName} ${pay.student?.lastName}`}</p>
                        <div className="flex gap-2 mt-1 text-xs text-slate-400"><span>{pay.paymentMethod}</span><span>Ref: {pay.referenceNo}</span><span>{pay.term}</span></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold">{kes(pay.amount)}</span>
                        <Badge className={statusBadge(pay.status)}>{pay.status}</Badge>
                        {role === 'admin' && pay.status === 'Pending' && (
                          <div className="flex gap-1">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7" onClick={() => handleVerify(pay.id, 'Verified')}><CheckCircle2 className="w-3 h-3 mr-1" />Approve</Button>
                            <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 h-7" onClick={() => handleVerify(pay.id, 'Rejected')}><XCircle className="w-3 h-3 mr-1" />Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        <TabsContent value="receipts" className="mt-4">
          {loading ? <Skeleton className="h-64 w-full" /> : (
            <div className="space-y-3">
              {filtered(receipts).slice(0, 20).map(rec => (
                <motion.div key={rec.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/[0.06]" onClick={() => setReceiptOpen(rec)}>
                  <div>
                    <p className="text-white font-medium">{rec.studentName}</p>
                    <p className="text-xs text-slate-400">{rec.receiptNo} · {rec.term}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold">{kes(rec.amount)}</span>
                    <Eye className="w-4 h-4 text-amber-400" />
                  </div>
                </motion.div>
              ))}
              {filtered(receipts).length === 0 && <p className="text-center text-slate-500 py-10">No receipts yet</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-slate-300">Student</Label><Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.grade})</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-slate-300">Amount (KES)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" placeholder="e.g. 15000" /></div>
            <div><Label className="text-slate-300">Reference No</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" placeholder="M-Pesa reference" /></div>
            <div><Label className="text-slate-300">Term</Label><Select value={form.term} onValueChange={v => setForm({ ...form, term: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select term" /></SelectTrigger><SelectContent><SelectItem value="Term 1">Term 1</SelectItem><SelectItem value="Term 2">Term 2</SelectItem><SelectItem value="Term 3">Term 3</SelectItem></SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={handlePay} className="bg-amber-500 hover:bg-amber-600 text-black"><Send className="w-4 h-4 mr-2" />Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptOpen} onOpenChange={() => setReceiptOpen(null)}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Receipt className="text-amber-400" />Receipt</DialogTitle></DialogHeader>
          {receiptOpen && (
            <div className="space-y-4 receipt-print bg-white text-black p-6 rounded-lg">
              <div className="text-center border-b pb-3">
                <h3 className="text-lg font-bold">BLOOMS Junior School</h3>
                <p className="text-xs text-gray-500">bloomsjunior.sc.ke</p>
                <p className="text-sm font-semibold mt-2">OFFICIAL RECEIPT</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Receipt No:</span><span className="font-mono font-bold">{receiptOpen.receiptNo}</span></div>
                <div className="flex justify-between"><span>Student:</span><span className="font-medium">{receiptOpen.studentName}</span></div>
                <div className="flex justify-between"><span>Amount:</span><span className="font-bold text-green-600">{kes(receiptOpen.amount)}</span></div>
                <div className="flex justify-between"><span>Method:</span><span>{receiptOpen.paymentMethod}</span></div>
                <div className="flex justify-between"><span>Reference:</span><span className="font-mono">{receiptOpen.referenceNo}</span></div>
                <div className="flex justify-between"><span>Term:</span><span>{receiptOpen.term}</span></div>
                {receiptOpen.verifiedBy && <div className="flex justify-between"><span>Verified By:</span><span>{receiptOpen.verifiedBy}</span></div>}
              </div>
              <div className="text-center border-t pt-3 text-xs text-gray-500">Thank you for your payment</div>
            </div>
          )}
          <DialogFooter><Button onClick={() => window.print()} variant="outline" className="border-amber-500/30 text-amber-400"><Download className="w-4 h-4 mr-2" />Print/Download</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="bg-[#0f172a] border-white/[0.08]">
          <DialogHeader><DialogTitle className="text-white">Send Fee Reminder</DialogTitle></DialogHeader>
          <div><Label className="text-slate-300">Student</Label><Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}><SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button onClick={handleReminder} className="bg-amber-500 hover:bg-amber-600 text-black"><Send className="w-4 h-4 mr-2" />Send Reminder</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
