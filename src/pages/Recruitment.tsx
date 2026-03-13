import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Star,
  Phone,
  Mail,
  FileText,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Clock,
  Briefcase,
  Trash2,
  Edit3,
  Upload,
  Loader2
} from 'lucide-react';
import { Card, Button, cn } from '../components/Layout';

const STAGES = [
  { id: 'applied', title: 'فرز السير الذاتية', color: 'border-slate-100' },
  { id: 'interview', title: 'المقابلات', color: 'border-blue-50' },
  { id: 'offer', title: 'العروض الوظيفية', color: 'border-emerald-50' },
  { id: 'rejected', title: 'مرفوض', color: 'border-rose-50' },
];

interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  date: string;
  score: number;
  priority: 'عاجل' | 'متوسط' | 'عادي';
  status: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export const Recruitment = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    role: '',
    experience: '',
    priority: 'عادي' as const,
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      setCandidates(data.map((c: any) => ({
        ...c,
        date: new Date(c.createdAt).toLocaleDateString('ar-EG')
      })));
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const saveCandidate = async (candidate: Candidate) => {
    try {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...candidate,
          createdAt: Date.now()
        })
      });
    } catch (err) {
      console.error('Failed to save candidate:', err);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate: Candidate = {
      id: Date.now().toString(),
      ...newCandidate,
      date: new Date().toLocaleDateString('ar-EG'),
      score: Math.floor(Math.random() * 30) + 60,
      status: 'applied'
    };
    setCandidates([...candidates, candidate]);
    await saveCandidate(candidate);
    setShowAddModal(false);
    setNewCandidate({ name: '', role: '', experience: '', priority: 'عادي', email: '', phone: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        text = await parsePDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        text = await parseDocx(file);
      } else {
        throw new Error('Unsupported file type');
      }

      const analyzedData = await analyzeCVLocal(text, file.name);
      if (analyzedData) {
        const candidate: Candidate = {
          id: Date.now().toString(),
          name: analyzedData.name || 'غير معروف',
          role: analyzedData.role || 'غير محدد',
          experience: analyzedData.experience || 'غير محدد',
          email: analyzedData.email || '',
          phone: analyzedData.phone || '',
          score: analyzedData.score || 70,
          priority: (analyzedData.score > 85 ? 'عاجل' : analyzedData.score > 70 ? 'متوسط' : 'عادي') as any,
          status: 'applied',
          date: new Date().toLocaleDateString('ar-EG'),
          notes: analyzedData.summary || ''
        };
        setCandidates(prev => [...prev, candidate]);
        await saveCandidate(candidate);
      }
    } catch (err) {
      console.error('Error analyzing CV:', err);
      alert('حدث خطأ أثناء تحليل السيرة الذاتية');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = (window as any).pdfjsLib;
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ');
    }
    return text;
  };

  const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = (window as any).mammoth;
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const analyzeCVLocal = async (text: string, filename: string) => {
    // Basic local extraction using Regex
    const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    const phoneMatch = text.match(/(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d{2,4}[\s-]?){2,4}\d{2,4}/);
    
    // Guess name from filename (remove extension and clean up)
    let name = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').trim();
    if (!name || name.toLowerCase().includes('cv') || name.toLowerCase().includes('resume')) {
        // Try to get first few words of text as name if filename is generic
        const words = text.trim().split(/\s+/).slice(0, 3);
        if (words.length > 0 && !words[0].includes('@') && !/\d/.test(words[0])) {
            name = words.join(' ');
        } else {
            name = 'غير معروف';
        }
    }
    
    // Try to find a role
    const roles = [
      'developer', 'engineer', 'manager', 'designer', 'accountant', 'sales', 'hr', 
      'مدير', 'مهندس', 'محاسب', 'مبيعات', 'مطور', 'مصمم', 'تسويق', 'marketing',
      'frontend', 'backend', 'fullstack', 'data scientist', 'analyst', 'consultant',
      'مستشار', 'محلل', 'مبرمج'
    ];
    let role = 'غير محدد';
    const lowerText = text.toLowerCase();
    for (const r of roles) {
      if (lowerText.includes(r)) {
        role = r;
        break;
      }
    }

    // Try to find experience
    let experience = 'غير محدد';
    const expMatch = lowerText.match(/(\d+)\s*(?:years?|yrs?|سنوات|سنة|سنين)\s*(?:of)?\s*experience/i) || 
                     lowerText.match(/خبرة\s*(?:تصل إلى|حوالي|أكثر من)?\s*(\d+)\s*(?:سنوات|سنة|سنين)/i);
    if (expMatch && expMatch[1]) {
        experience = `${expMatch[1]} سنوات`;
    }

    // Estimate score based on text length and keywords
    let score = 60;
    if (text.length > 500) score += 5;
    if (text.length > 1500) score += 10;
    if (emailMatch) score += 5;
    if (phoneMatch) score += 5;
    if (role !== 'غير محدد') score += 10;
    if (experience !== 'غير محدد') score += 5;
    score = Math.min(score, 99);

    return {
      name: name,
      role: role,
      experience: experience,
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : '',
      score: score,
      summary: text.substring(0, 300) + '...'
    };
  };

  const handleEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    
    setCandidates(prev => prev.map(c => 
      c.id === editingCandidate.id ? editingCandidate : c
    ));
    await saveCandidate(editingCandidate);
    setEditingCandidate(null);
  };

  const moveNext = async (id: string) => {
    let updatedCandidate: Candidate | null = null;
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const currentIndex = STAGES.findIndex(s => s.id === c.status);
        if (currentIndex < STAGES.length - 1) {
          updatedCandidate = { ...c, status: STAGES[currentIndex + 1].id };
          return updatedCandidate;
        }
      }
      return c;
    }));
    if (updatedCandidate) {
      await saveCandidate(updatedCandidate);
    }
  };

  const deleteCandidate = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المرشح؟')) {
      try {
        await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
        setCandidates(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete candidate:', err);
      }
    }
  };

  const stats = [
    { label: 'إجمالي المرشحين', value: candidates.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'مقابلات نشطة', value: candidates.filter(c => c.status === 'interview').length, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'عروض معلقة', value: candidates.filter(c => c.status === 'offer').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500" dir="rtl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 p-4 rounded-[40px] border border-white shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Briefcase size={20} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter">إدارة التوظيف</h1>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث سريع..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.docx" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isAnalyzing ? 'جاري التحليل...' : 'تحليل CV ذكي'}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={16} />
            <span>كل الأولويات</span>
          </button>
          <Button onClick={() => setShowAddModal(true)} className="px-6 py-3 rounded-2xl">
            <Plus size={18} />
            <span>إضافة مرشح</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[700px]">
        {STAGES.map(stage => {
          const stageCandidates = candidates.filter(c => c.status === stage.id);
          return (
            <div key={stage.id} className="flex-1 min-w-[320px] flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-800 text-sm">{stage.title}</h3>
                <span className="bg-white border border-slate-100 px-3 py-1 rounded-xl text-[10px] font-black text-slate-400 shadow-sm">
                  {stageCandidates.length}
                </span>
              </div>
              
              <div className={cn(
                "flex-1 rounded-[40px] p-4 space-y-4 border-2 border-dashed transition-colors",
                stage.id === 'applied' ? "bg-slate-50/30 border-slate-100" :
                stage.id === 'interview' ? "bg-blue-50/20 border-blue-100/50" :
                stage.id === 'offer' ? "bg-emerald-50/20 border-emerald-100/50" :
                "bg-rose-50/20 border-rose-100/50"
              )}>
                {stageCandidates.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3 opacity-50">
                    <Users size={48} strokeWidth={1} />
                    <p className="font-black text-xs">لا يوجد مرشحين</p>
                  </div>
                ) : (
                  stageCandidates.map(cand => (
                    <Card key={cand.id} className="p-5 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                      {/* Priority Tag */}
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[9px] font-black",
                          cand.priority === 'عاجل' ? "bg-rose-100 text-rose-600" :
                          cand.priority === 'متوسط' ? "bg-amber-100 text-amber-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {cand.priority}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setEditingCandidate(cand)}
                            className="text-slate-300 hover:text-indigo-500 transition-colors p-1"
                            title="تعديل"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteCandidate(cand.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1 mb-4">
                        <h4 className="font-black text-slate-800 text-base">{cand.name}</h4>
                        <p className="text-xs font-bold text-indigo-600">{cand.role}</p>
                        {cand.notes && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 p-2 rounded-lg mt-2 italic">
                            {cand.notes}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Briefcase size={14} />
                          <span className="text-[10px] font-bold">{cand.experience}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-[10px] font-bold">{cand.date}</span>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <FileText size={14} className="text-slate-300" />
                          <Phone size={14} className="text-slate-300" />
                          <Mail size={14} className="text-slate-300" />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 font-black text-[10px]">
                          <Star size={12} fill="currentColor" />
                          <span>{cand.score}</span>
                        </div>
                        
                        {stage.id !== 'rejected' && (
                          <button 
                            onClick={() => moveNext(cand.id)}
                            className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1"
                          >
                            <span>نقل للمرحلة التالية</span>
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">إضافة مرشح جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">اسم المرشح</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={newCandidate.name}
                  onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">الوظيفة المستهدفة</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={newCandidate.role}
                  onChange={(e) => setNewCandidate({...newCandidate, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">سنوات الخبرة</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="مثال: 3 سنوات"
                    className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={newCandidate.experience}
                    onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">الأولوية</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={newCandidate.priority}
                    onChange={(e) => setNewCandidate({...newCandidate, priority: e.target.value as any})}
                  >
                    <option value="عادي">عادي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عاجل">عاجل</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full py-4 rounded-2xl text-lg shadow-lg shadow-indigo-100">
                  إضافة لقائمة الفرز
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 rounded-[40px] shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">تعديل بيانات المرشح</h3>
              <button onClick={() => setEditingCandidate(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleEditCandidate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">اسم المرشح</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={editingCandidate.name}
                  onChange={(e) => setEditingCandidate({...editingCandidate, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase">الوظيفة المستهدفة</label>
                <input 
                  required 
                  type="text" 
                  className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  value={editingCandidate.role}
                  onChange={(e) => setEditingCandidate({...editingCandidate, role: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">سنوات الخبرة</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="مثال: 3 سنوات"
                    className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={editingCandidate.experience}
                    onChange={(e) => setEditingCandidate({...editingCandidate, experience: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase">الأولوية</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl border outline-none font-bold bg-slate-50 border-slate-100 text-slate-800 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={editingCandidate.priority}
                    onChange={(e) => setEditingCandidate({...editingCandidate, priority: e.target.value as any})}
                  >
                    <option value="عادي">عادي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="عاجل">عاجل</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <Button type="submit" className="w-full py-4 rounded-2xl text-lg shadow-lg shadow-indigo-100">
                  حفظ التعديلات
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
