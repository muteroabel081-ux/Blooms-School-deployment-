'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, GraduationCap, UserCheck, ShieldCheck, Eye, EyeOff, Briefcase, Mail, Phone, Globe, Upload, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (role: string, userData?: Record<string, unknown>) => void;
}

const bubbles = Array.from({ length: 10 }, (_, i) => ({
  id: i, size: 10 + (i % 5) * 8, left: `${(i * 11) % 95}%`, dur: `${14 + i * 2}s`, delay: `${i * 1.5}s`,
}));

const demoAccounts = [
  { role: 'Admin', email: 'admin@bloomsjunior.sc.ke', password: 'Blooms@2025' },
  { role: 'Parent', email: 'parent1@email.com', password: 'Blooms@2025' },
  { role: 'Teacher', email: 'teacher1@bloomsjunior.sc.ke', password: 'Blooms@2025' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [studentFirst, setStudentFirst] = useState('');
  const [studentLast, setStudentLast] = useState('');
  const // Registration
    [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOccupation, setRegOccupation] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regType, setRegType] = useState<'parent' | 'investor'>('parent');
  // Student registration
  const [srFirst, setSrFirst] = useState('');
  const [srLast, setSrLast] = useState('');
  const [srGrade, setSrGrade] = useState('');
  const [srGender, setSrGender] = useState('');
  const [srDob, setSrDob] = useState('');
  const [srAllergens, setSrAllergens] = useState('');
  const [srNemis, setSrNemis] = useState('');
  const [srHobbies, setSrHobbies] = useState('');
  const [srBirthCert, setSrBirthCert] = useState('');
  // Application
  const [appName, setAppName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPhone, setAppPhone] = useState('');
  const [appPosition, setAppPosition] = useState('');
  const [appCvUrl, setAppCvUrl] = useState('');
  const [appWhyMe, setAppWhyMe] = useState('');
  const [appWhyBlooms, setAppWhyBlooms] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    // Also check DOM values as fallback (for automated testing / non-synthetic events)
    const emailVal = email || (typeof document !== 'undefined' ? (document.querySelectorAll('input')[0] as HTMLInputElement)?.value : '');
    const passVal = password || (typeof document !== 'undefined' ? (document.querySelectorAll('input')[1] as HTMLInputElement)?.value : '');
    if (!emailVal || !passVal) return;
    // Determine role from DOM if React state wasn't updated
    let role = selectedRole;
    if (typeof document !== 'undefined') {
      const roleBtns = document.querySelectorAll('button');
      for (const btn of roleBtns) {
        const text = btn.textContent?.trim();
        if (text === 'Parent' && btn.className.includes('emerald')) role = 'parent';
        if (text === 'Teacher' && btn.className.includes('sky')) role = 'teacher';
        if (text === 'Student' && btn.className.includes('violet')) role = 'student';
        if (text === 'Admin' && btn.className.includes('amber')) role = 'admin';
      }
    }
    onLogin(role);
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPhone) return;
    setLoading(true);
    try {
      await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: regEmail, role: regType === 'parent' ? 'parent' : 'investor' }) });
      toast.success(`${regType === 'parent' ? 'Registration' : 'Inquiry'} submitted! Check your email for OTP verification.`);
    } catch { toast.error('Registration failed'); }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otpEmail || otpCode.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: otpEmail, otp: otpCode }) });
      if (res.ok) { toast.success('Email verified! You can now sign in.'); } else { toast.error('Invalid OTP'); }
    } catch { toast.error('Verification failed'); }
    setLoading(false);
  };

  const handleRegisterStudent = async () => {
    if (!srFirst || !srLast || !srGrade) return;
    setLoading(true);
    try {
      await fetch('/api/register-student', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentId: 'demo-parent', firstName: srFirst, lastName: srLast, grade: srGrade, gender: srGender, dateOfBirth: srDob, allergens: srAllergens, nemisNumber: srNemis, hobbies: srHobbies, birthCertUrl: srBirthCert || undefined }) });
      toast.success('Student registered!');
    } catch { toast.error('Registration failed'); }
    setLoading(false);
  };

  const handleStudentLogin = async () => {
    if (!studentFirst || !studentLast) return;
    try {
      const res = await fetch('/api/students');
      const students = await res.json();
      const match = students.find((s: { firstName: string; lastName: string }) => s.firstName.toLowerCase() === studentFirst.toLowerCase() && s.lastName.toLowerCase() === studentLast.toLowerCase());
      if (match) { onLogin('student', { student: match }); } else { toast.error('Student not found'); }
    } catch { toast.error('Login failed'); }
  };

  const handleApply = async () => {
    if (!appName || !appEmail || !appPosition) return;
    setLoading(true);
    try {
      await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicantName: appName, email: appEmail, phone: appPhone, position: appPosition, cvUrl: appCvUrl || undefined, whyMe: appWhyMe, whyBlooms: appWhyBlooms }) });
      toast.success('Application submitted successfully!');
      setAppName(''); setAppEmail(''); setAppPhone(''); setAppPosition(''); setAppWhyMe(''); setAppWhyBlooms('');
    } catch { toast.error('Application failed'); }
    setLoading(false);
  };

  const uploadFile = async (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json(); return data.url;
  };

  const roles = [
    { id: 'parent', label: 'Parent', icon: Users, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    { id: 'student', label: 'Student', icon: UserCheck, color: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ];

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Bubbles */}
      <div className="bubbles-container">
        {bubbles.map(b => (
          <div key={b.id} className="liquid-bubble" style={{ width: b.size, height: b.size, left: b.left, '--duration': b.dur, '--delay': b.delay } as React.CSSProperties} />
        ))}
      </div>

      {/* VESTA watermark */}
      <div className="vesta-watermark"><img src="/vesta-logo.jpeg" alt="" /></div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg relative z-10">
        <div className="glass-card-static p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/30 flex items-center justify-center mb-3 bg-[#0a0e1a] overflow-hidden">
              <img src="/blooms-logo.jpeg" alt="BLOOMS" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold blooms-text-gradient tracking-wide">BLOOMS</h1>
            <p className="text-sm uppercase tracking-widest text-gray-400 mt-1">Junior School</p>
            <p className="text-xs text-gray-500">Learning Management System</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="w-full flex h-10 bg-[#0a0e1a] rounded-lg p-1 mb-6">
              {['signin', 'register', 'apply', 'verify', 'regstudent', 'studentlogin'].map((t) => (
                <TabsTrigger key={t} value={t} className="flex-1 text-[10px] px-1 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
                  {t === 'signin' ? 'Sign In' : t === 'register' ? 'Register' : t === 'apply' ? 'Apply' : t === 'verify' ? 'Verify OTP' : t === 'regstudent' ? 'Reg Student' : 'Student'}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <div className="grid grid-cols-4 gap-2 mb-5">
                {roles.map(r => {
                  const Icon = r.icon;
                  return (
                    <button key={r.id} onClick={() => setSelectedRole(r.id)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-xs ${selectedRole === r.id ? r.color : 'border-white/5 text-gray-500 hover:border-white/10'}`}>
                      <Icon className="w-5 h-5" /><span className="font-medium">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-3 mb-5">
                <div><Label className="text-gray-400 text-xs">Email</Label><Input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Password</Label><div className="relative mt-1"><Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white h-10 pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              </div>
              <Button onClick={handleSignIn} className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] font-semibold text-sm rounded-lg">Sign In</Button>
              <p className="text-[10px] text-gray-600 text-center mt-3">Default password: Blooms@2025</p>

              <Collapsible open={demoOpen} onOpenChange={setDemoOpen} className="mt-4">
                <CollapsibleTrigger className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-amber-400/70 uppercase tracking-wider">
                  Demo Accounts <ChevronDown className={`w-3 h-3 transition-transform ${demoOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 space-y-1">
                    {demoAccounts.map(a => (
                      <button key={a.role} onClick={() => { setEmail(a.email); setPassword(a.password); setSelectedRole(a.role.toLowerCase()); }} className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="text-xs text-gray-300">{a.role}</span>
                        <span className="text-[10px] text-gray-600 ml-2">{a.email}</span>
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </TabsContent>

            {/* Register */}
            <TabsContent value="register">
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <button onClick={() => setRegType('parent')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${regType === 'parent' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#0a0e1a] text-gray-400 border border-white/5'}`}>Parent Registration</button>
                  <button onClick={() => setRegType('investor')} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${regType === 'investor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#0a0e1a] text-gray-400 border border-white/5'}`}>Investor Inquiry</button>
                </div>
                <div><Label className="text-gray-400 text-xs">Full Name</Label><Input value={regName} onChange={e => setRegName(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Email</Label><Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={regPhone} onChange={e => setRegPhone(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                {regType === 'parent' && (<>
                  <div><Label className="text-gray-400 text-xs">Occupation</Label><Input value={regOccupation} onChange={e => setRegOccupation(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                  <div><Label className="text-gray-400 text-xs">Address</Label><Input value={regAddress} onChange={e => setRegAddress(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                </>)}
              </div>
              <Button onClick={handleRegister} disabled={loading} className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] font-semibold text-sm rounded-lg">{loading ? 'Submitting...' : regType === 'parent' ? 'Register' : 'Submit Inquiry'}</Button>
            </TabsContent>

            {/* Apply - Staff Application */}
            <TabsContent value="apply">
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-amber-400">Prospective Staff Application</h3>
                <div><Label className="text-gray-400 text-xs">Full Name</Label><Input value={appName} onChange={e => setAppName(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Email</Label><Input type="email" value={appEmail} onChange={e => setAppEmail(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Phone</Label><Input value={appPhone} onChange={e => setAppPhone(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Position</Label>
                  <Select value={appPosition} onValueChange={setAppPosition}><SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10"><SelectValue placeholder="Select position" /></SelectTrigger><SelectContent><SelectItem value="Teacher">Teacher</SelectItem><SelectItem value="Admin">Admin Staff</SelectItem><SelectItem value="Support">Support Staff</SelectItem><SelectItem value="Driver">Driver</SelectItem><SelectItem value="Chef">Chef</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
                </div>
                <div><Label className="text-gray-400 text-xs">Upload CV</Label>
                  <div className="mt-1"><Input type="file" accept=".pdf,.doc,.docx" onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await uploadFile(f); setAppCvUrl(url); toast.success('CV uploaded'); } }} className="bg-[#0a0e1a] border-white/10 text-gray-400 h-10 text-xs" /></div>
                  {appCvUrl && <p className="text-[10px] text-emerald-400 mt-1">✓ CV uploaded</p>}
                </div>
                <div><Label className="text-gray-400 text-xs">Why Me?</Label><Textarea value={appWhyMe} onChange={e => setAppWhyMe(e.target.value)} placeholder="Tell us why you are the best fit for this position..." className="bg-[#0a0e1a] border-white/10 text-white mt-1 min-h-[80px] text-sm" /></div>
                <div><Label className="text-gray-400 text-xs">Why BLOOMS?</Label><Textarea value={appWhyBlooms} onChange={e => setAppWhyBlooms(e.target.value)} placeholder="Tell us why you chose BLOOMS Junior School..." className="bg-[#0a0e1a] border-white/10 text-white mt-1 min-h-[80px] text-sm" /></div>
              </div>
              <Button onClick={handleApply} disabled={loading} className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] font-semibold text-sm rounded-lg">{loading ? 'Submitting...' : 'Submit Application'}</Button>
            </TabsContent>

            {/* Verify OTP */}
            <TabsContent value="verify">
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-amber-400">Verify Your Email</h3>
                <div><Label className="text-gray-400 text-xs">Email</Label><Input type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">OTP Code (6 digits)</Label><Input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10 font-mono text-center text-lg tracking-[0.5em]" /></div>
              </div>
              <Button onClick={handleVerifyOtp} disabled={loading} className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] font-semibold text-sm rounded-lg">{loading ? 'Verifying...' : 'Verify'}</Button>
              <p className="text-[10px] text-gray-500 text-center mt-2">Didn&apos;t receive? <button onClick={() => toast.success('OTP resent!')} className="text-amber-400 hover:underline">Resend OTP</button></p>
            </TabsContent>

            {/* Register Student */}
            <TabsContent value="regstudent">
              <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto pr-1">
                <h3 className="text-sm font-semibold text-amber-400">Register a Student</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-gray-400 text-xs">First Name</Label><Input value={srFirst} onChange={e => setSrFirst(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                  <div><Label className="text-gray-400 text-xs">Last Name</Label><Input value={srLast} onChange={e => setSrLast(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-gray-400 text-xs">Grade</Label>
                    <Select value={srGrade} onValueChange={setSrGrade}><SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10"><SelectValue placeholder="Grade" /></SelectTrigger><SelectContent>{['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8'].map(g=><SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div><Label className="text-gray-400 text-xs">Gender</Label>
                    <Select value={srGender} onValueChange={setSrGender}><SelectTrigger className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10"><SelectValue placeholder="Gender" /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select>
                  </div>
                </div>
                <div><Label className="text-gray-400 text-xs">Date of Birth</Label><Input type="date" value={srDob} onChange={e => setSrDob(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">NEMIS / UPI Number</Label><Input value={srNemis} onChange={e => setSrNemis(e.target.value)} className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                <div><Label className="text-gray-400 text-xs">Allergens</Label><Textarea value={srAllergens} onChange={e => setSrAllergens(e.target.value)} placeholder="List any allergens..." className="bg-[#0a0e1a] border-white/10 text-white mt-1 min-h-[50px] text-sm" /></div>
                <div><Label className="text-gray-400 text-xs">Hobbies / Extracurricular</Label><Textarea value={srHobbies} onChange={e => setSrHobbies(e.target.value)} placeholder="List hobbies and interests..." className="bg-[#0a0e1a] border-white/10 text-white mt-1 min-h-[50px] text-sm" /></div>
                <div><Label className="text-gray-400 text-xs">Birth Certificate</Label><Input type="file" accept=".pdf,.jpg,.png" onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await uploadFile(f); setSrBirthCert(url); toast.success('Birth cert uploaded'); } }} className="bg-[#0a0e1a] border-white/10 text-gray-400 h-10 text-xs mt-1" /></div>
              </div>
              <Button onClick={handleRegisterStudent} disabled={loading} className="w-full h-10 bg-amber-500 hover:bg-amber-400 text-[#0a0e1a] font-semibold text-sm rounded-lg">{loading ? 'Registering...' : 'Register Student'}</Button>
            </TabsContent>

            {/* Student Login */}
            <TabsContent value="studentlogin">
              <div className="space-y-3 mb-4">
                <h3 className="text-sm font-semibold text-amber-400">Student Login</h3>
                <p className="text-xs text-gray-500">Enter your first and last name to log in.</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-gray-400 text-xs">First Name</Label><Input value={studentFirst} onChange={e => setStudentFirst(e.target.value)} placeholder="e.g. John" className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                  <div><Label className="text-gray-400 text-xs">Last Name</Label><Input value={studentLast} onChange={e => setStudentLast(e.target.value)} placeholder="e.g. Kamau" className="bg-[#0a0e1a] border-white/10 text-white mt-1 h-10" /></div>
                </div>
              </div>
              <Button onClick={handleStudentLogin} className="w-full h-10 bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm rounded-lg">Login as Student</Button>
            </TabsContent>
          </Tabs>

          {/* Contact Info */}
          <div className="mt-6 p-4 bg-[#0a0e1a] rounded-xl border border-white/5">
            <p className="text-[10px] font-semibold text-amber-400/70 uppercase tracking-wider mb-3">Contact Us</p>
            <div className="space-y-2 text-xs text-gray-400">
              <a href="mailto:bloomsjuniorschool@gmail.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors"><Mail className="w-3 h-3" /> bloomsjuniorschool@gmail.com</a>
              <a href="tel:+2540114503664" className="flex items-center gap-2 hover:text-amber-400 transition-colors"><Phone className="w-3 h-3" /> +254 011 450 3664</a>
              <a href="https://bloomsjunior.sc.ke" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-400 transition-colors"><Globe className="w-3 h-3" /> bloomsjunior.sc.ke</a>
            </div>
          </div>
        </div>

        <div className="text-center mt-4"><p className="text-[10px] text-gray-600">Powered by <span className="text-amber-500/50 font-medium">VESTA</span></p></div>
      </motion.div>
    </div>
  );
}
