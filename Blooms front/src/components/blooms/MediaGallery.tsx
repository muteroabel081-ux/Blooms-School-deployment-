'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon, Upload, X, Search, Loader2, ZoomIn, Trash2,
  FolderOpen, Sparkles, CheckCircle2, ChevronRight, Home, ArrowLeft, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  role: 'admin' | 'parent' | 'teacher' | 'student';
  onNavigate?: (section: string) => void;
}
interface MediaItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

const categories = ['All', 'General', 'Classroom', 'Events', 'Sports', 'Trips', 'Awards', 'Facilities'];
const canUpload = (role: string) => role === 'admin' || role === 'teacher';

export default function MediaGallery({ role, onNavigate }: PageProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', category: 'General', imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setSelectedFile(file);

    // Auto-fill title if empty
    if (!form.title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      setForm(prev => ({
        ...prev,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
      }));
    }

    // Upload directly to server
    try {
      setIsUploadingFile(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, imageUrl: data.url }));
        toast.success('Photo uploaded & ready to publish!');
      } else {
        // Fallback: convert to base64 Data URL so it always works
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
        toast.info('Using local photo buffer');
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim()) {
      return toast.error('Please enter a photo title');
    }
    if (!form.imageUrl && !filePreview) {
      return toast.error('Please select an image file to upload');
    }

    try {
      setIsSubmitting(true);
      const imageUrlToSave = form.imageUrl || filePreview || '';
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          category: form.category || 'General',
          imageUrl: imageUrlToSave,
        }),
      });

      if (res.ok) {
        const created: MediaItem = await res.json();
        // Immediately add to interface state
        setItems(prev => [created, ...prev]);
        toast.success(`Photo "${created.title}" published to gallery!`);

        // Close modal and reset
        setAddOpen(false);
        setForm({ title: '', category: 'General', imageUrl: '' });
        setFilePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Switch to the photo's category or All so it's guaranteed visible
        if (cat !== 'All' && cat !== created.category) {
          setCat(created.category);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed to save media photo');
      }
    } catch {
      toast.error('Network error saving media photo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
        toast.success('Photo removed from gallery');
      } else {
        const res2 = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
        if (res2.ok) {
          setItems(prev => prev.filter(i => i.id !== id));
          toast.success('Photo removed from gallery');
        } else {
          toast.error('Failed to delete photo');
        }
      }
    } catch {
      toast.error('Network error deleting photo');
    }
  };

  const filtered = items.filter(i =>
    (cat === 'All' || i.category === cat) &&
    (!search || i.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          )}
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-white font-medium flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Media Gallery
          </span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400">{items.length} total photos</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            title="Refresh gallery"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-amber-400/80 hover:text-amber-300 transition-colors hidden sm:flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Main Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-amber-400" />
            Media Gallery
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            School activities, academic ceremonies, sports events, and campus life
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canUpload(role) && (
            <Button
              onClick={() => {
                setForm({ title: '', category: 'General', imageUrl: '' });
                setFilePreview(null);
                setSelectedFile(null);
                setAddOpen(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-lg shadow-amber-500/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search photos..."
              className="pl-9 bg-white/[0.04] border-white/[0.08] w-48 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap items-center">
        {categories.map(c => {
          const count = c === 'All' ? items.length : items.filter(it => it.category === c).length;
          return (
            <Button
              key={c}
              size="sm"
              variant={cat === c ? 'default' : 'outline'}
              onClick={() => setCat(c)}
              className={
                cat === c
                  ? 'bg-amber-500 text-black font-semibold shadow-sm'
                  : 'border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04] h-7 text-xs'
              }
            >
              {c}
              {count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  cat === c ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-400'
                }`}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                className="group relative glass-card rounded-xl overflow-hidden cursor-pointer border border-white/[0.08] hover:border-amber-500/40 transition-all duration-300"
                onClick={() => setLightbox(item)}
              >
                <div className="aspect-square bg-slate-900/60 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/blooms-logo.jpeg';
                      target.classList.add('opacity-80', 'p-4', 'object-contain');
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-xs text-amber-400 font-medium">{item.category}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  {canUpload(role) && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-lg shadow transition-colors"
                    title="Zoom View"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-slate-500 py-16 glass-card rounded-2xl">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-base text-slate-300 font-medium">No media photos found</p>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `No photos match "${search}"` : `No photos in "${cat}" category`}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {search && (
                  <Button size="sm" variant="outline" onClick={() => setSearch('')} className="border-white/10 text-xs">
                    Clear Search
                  </Button>
                )}
                {cat !== 'All' && (
                  <Button size="sm" variant="outline" onClick={() => setCat('All')} className="border-white/10 text-xs">
                    View All Categories
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500 text-center">{filtered.length} photos shown</p>

      {/* Lightbox Modal */}
      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="bg-black/95 border border-white/10 max-w-3xl">
          {lightbox && (
            <div className="space-y-4">
              <div className="relative flex items-center justify-center min-h-[50vh] max-h-[75vh] overflow-hidden rounded-xl bg-black">
                <img
                  src={lightbox.imageUrl}
                  alt={lightbox.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/blooms-logo.jpeg';
                  }}
                />
              </div>
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-white font-semibold text-lg">{lightbox.title}</p>
                  <p className="text-xs text-slate-400">
                    Category: <span className="text-amber-400">{lightbox.category}</span> &middot; Added {new Date(lightbox.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {canUpload(role) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleDelete(lightbox.id);
                      setLightbox(null);
                    }}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete Photo
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 
        Add / Upload Media Dialog 
        NOTE: Uses max-h-[85vh] + flex-col + overflow-hidden to guarantee 
        the "Add to Gallery" footer button is ALWAYS visible on screen!
      */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#0f172a] border border-white/10 max-w-lg w-full max-h-[88vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Pinned Modal Header */}
          <div className="p-4 px-6 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0 bg-[#0c1322]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-semibold">Upload Photo to Gallery</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Publish photos to the school gallery
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* File Upload Drop Area */}
            <div>
              <Label className="text-slate-300 text-xs mb-1.5 block">Select Photo File *</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="media-file-upload"
              />
              <label
                htmlFor="media-file-upload"
                className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04]"
              >
                {filePreview ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden bg-black/50 border border-amber-400/30">
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                      <span className="bg-emerald-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                      <span className="text-[11px] text-slate-200 bg-black/60 px-2 py-0.5 rounded border border-white/10 hover:bg-black/90">
                        Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <ImageIcon className="w-8 h-8 text-amber-400/80 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white">Click to choose a photo</p>
                    <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, WEBP, GIF up to 10MB</p>
                  </div>
                )}
              </label>
              {isUploadingFile && (
                <div className="flex items-center gap-2 mt-1.5 text-xs text-amber-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image to server...
                </div>
              )}
            </div>

            {/* Photo Title */}
            <div>
              <Label className="text-slate-300 text-xs">Photo Title *</Label>
              <Input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="e.g. Annual Athletics Meet 2026"
                className="bg-white/[0.04] border-white/[0.08] mt-1 text-sm text-white"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <Label className="text-slate-300 text-xs">Gallery Category</Label>
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08] mt-1 text-sm text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/[0.08] text-white">
                  {categories.filter(c => c !== 'All').map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optional URL */}
            <div>
              <Label className="text-slate-400 text-xs">Image URL (Auto-filled on upload)</Label>
              <Input
                value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                onChange={e => {
                  setForm({ ...form, imageUrl: e.target.value });
                  setFilePreview(e.target.value);
                }}
                className="bg-white/[0.04] border-white/[0.08] mt-1 text-xs text-slate-400 font-mono"
                placeholder="https://... or /uploads/..."
              />
            </div>
          </div>

          {/* Permanently Sticky Footer: Always visible on all screen sizes */}
          <div className="p-4 px-6 border-t border-white/[0.08] bg-[#0c1322] flex-shrink-0 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {filePreview ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo selected
                </span>
              ) : (
                <span className="text-slate-500">Pick an image file</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="border-white/10 text-slate-300 hover:bg-white/[0.04] text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isSubmitting || isUploadingFile || (!form.title.trim() && !filePreview)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-xs h-9 px-5 shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Add to Gallery
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
