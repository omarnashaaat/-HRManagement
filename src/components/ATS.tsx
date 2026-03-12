import React, { useState, useRef, useMemo } from 'react';
import { Icon } from './Icon';

const ATS = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files);
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const extractText = async (file: File): Promise<string> => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e: any) => {
                const content = e.target.result;
                if (file.type === 'application/pdf') {
                    try {
                        // @ts-ignore
                        const pdf = await window.pdfjsLib.getDocument({ data: content }).promise;
                        let text = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            let lastY: number | undefined, textItems: string[] = [];
                            for (let item of textContent.items) {
                                if (lastY !== undefined && lastY !== item.transform[5]) {
                                    textItems.push('\n');
                                }
                                textItems.push(item.str);
                                lastY = item.transform[5];
                            }
                            text += textItems.join(' ') + ' ';
                        }
                        resolve(text);
                    } catch (err) {
                        reject('خطأ في قراءة ملف PDF');
                    }
                } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    try {
                        // @ts-ignore
                        const result = await window.mammoth.extractRawText({ arrayBuffer: content });
                        resolve(result.value);
                    } catch (err) {
                        reject('خطأ في قراءة ملف Word');
                    }
                } else {
                    resolve(new TextDecoder().decode(content));
                }
            };
            if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    };

    const analyzeWithGemini = async (cvText: string, jd: string) => {
        const apiKey = (window as any).GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
        
        const prompt = `
            أنت محرك ATS متطور وخبير موارد بشرية. مهمتك هي إجراء مقارنة دقيقة جداً بين الوصف الوظيفي والسيرة الذاتية.
            
            الوصف الوظيفي (المرجع):
            ${jd}
            
            السيرة الذاتية (المصدر):
            ${cvText}
            
            التعليمات الصارمة:
            1. استخرج الكلمات المفتاحية والمهارات المطلوبة "فقط" من الوصف الوظيفي المعطى.
            2. ابحث عن هذه الكلمات في نص السيرة الذاتية بدقة، مع مراعاة المترادفات.
            3. لا تضع أي كلمة في "missingKeywords" إذا كانت موجودة بالفعل في السيرة الذاتية أو لها ذكر واضح.
            
            المطلوب هو إرجاع النتيجة بتنسيق JSON فقط كالتالي:
            {
                "score": (رقم من 0 إلى 100),
                "skillsScore": (رقم من 0 إلى 100),
                "contextScore": (رقم من 0 إلى 100),
                "formattingScore": (رقم من 0 إلى 100),
                "summary": (ملخص قصير),
                "classification": ("قوي" أو "متوسط" أو "ضعيف"),
                "name": (اسم المرشح من السيرة الذاتية),
                "experience": (سنوات الخبرة المستخلصة، مثال: "5 سنوات"),
                "email": (البريد الإلكتروني إن وجد),
                "phone": (الهاتف),
                "foundKeywords": [],
                "missingKeywords": [],
                "recommendations": []
            }
        `;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;
            const jsonMatch = textResponse.match(/\{.*\}/s);
            if (jsonMatch) {
                return {
                    ...JSON.parse(jsonMatch[0]),
                    experience: JSON.parse(jsonMatch[0]).experience || 'غير محدد'
                };
            }
            throw new Error('فشل في تحليل الرد');
        } catch (err) {
            console.error(err);
            return { score: 0, skillsScore: 0, contextScore: 0, formattingScore: 0, summary: 'خطأ', classification: 'غير معروف', name: 'غير معروف', experience: 'غير متوفر', email: '', phone: '', foundKeywords: [], missingKeywords: [], recommendations: [] };
        }
    };

    const saveCandidate = async (res: any) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: res.id.toString(),
                    name: res.name,
                    role: jobDescription.substring(0, 50),
                    experience: res.experience || 'غير محدد',
                    email: res.email,
                    phone: res.phone,
                    status: 'applied',
                    priority: res.score > 70 ? 'عالية' : 'متوسطة',
                    score: res.score,
                    createdAt: Date.now(),
                    notes: res.summary
                })
            });
            if (response.ok) {
                alert('تم حفظ المرشح بنجاح');
            }
        } catch (err) {
            alert('فشل في الحفظ');
        } finally {
            setIsSaving(false);
        }
    };

    const startAnalysis = async () => {
        if (!jobDescription || files.length === 0) return;
        setIsAnalyzing(true);
        setResults([]);
        const newResults = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const text = await extractText(files[i]);
                const analysis = await analyzeWithGemini(text, jobDescription);
                newResults.push({ ...analysis, fileName: files[i].name, id: Date.now() + i });
            } catch (err) {
                newResults.push({ name: files[i].name, score: 0, skillsScore: 0, contextScore: 0, formattingScore: 0, summary: 'خطأ', classification: 'ضعيف', fileName: files[i].name, id: Date.now() + i, email: '', phone: '', foundKeywords: [], missingKeywords: [], recommendations: [] });
            }
            setAnalysisProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setResults(newResults.sort((a, b) => b.score - a.score));
        setIsAnalyzing(false);
    };

    const stats = useMemo(() => {
        if (results.length === 0) return { total: 0, avg: 0, best: null };
        const avg = Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length);
        return { total: results.length, avg, best: results[0] };
    }, [results]);

    if (selectedResult) {
        return (
            <div className="space-y-8 animate-fade-in pb-20">
                <div className="flex justify-between items-center no-print">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSelectedResult(null)} className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg hover:bg-indigo-600 transition-all flex items-center gap-2">
                            <Icon name="arrow-right" size={20} />
                            <span className="font-black text-sm">العودة</span>
                        </button>
                        <h2 className="text-2xl font-black text-slate-800">تقرير ATS: {selectedResult.name}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6 no-print">
                        <div className="bg-white rounded-[30px] p-6 shadow-xl border border-slate-50">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-4">الوصف الوظيفي</h4>
                            <div className="bg-slate-50 rounded-2xl p-4 text-[11px] font-bold text-slate-500 h-[200px] overflow-y-auto">{jobDescription}</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] p-10 shadow-2xl border-t-8 border-orange-400 flex flex-col md:flex-row items-center gap-10">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="80" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                                    <circle cx="96" cy="96" r="80" stroke="#fb923c" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - selectedResult.score / 100)} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-slate-800">{selectedResult.score}%</span>
                                    <span className="text-[10px] font-black text-slate-400">ATS SCORE</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <h3 className="text-3xl font-black text-slate-800">تقييم: {selectedResult.name}</h3>
                                {[
                                    { label: 'تطابق المهارات', score: selectedResult.skillsScore, color: 'bg-blue-600' },
                                    { label: 'الخبرة والسياق', score: selectedResult.contextScore, color: 'bg-indigo-500' },
                                    { label: 'جودة التنسيق', score: selectedResult.formattingScore, color: 'bg-emerald-500' }
                                ].map((bar, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs font-black text-slate-700"><span>{bar.label}</span><span>{bar.score}%</span></div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${bar.color}`} style={{ width: `${bar.score}%` }}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-emerald-50/50 rounded-[30px] p-8 border border-emerald-100">
                                <h4 className="text-emerald-700 font-black mb-4 flex items-center gap-2"><Icon name="check-circle" size={18} /> كلمات موجودة</h4>
                                <div className="flex flex-wrap gap-2">{selectedResult.foundKeywords.map((kw: string, i: number) => <span key={i} className="px-3 py-1 bg-white text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">{kw}</span>)}</div>
                            </div>
                            <div className="bg-rose-50/50 rounded-[30px] p-8 border border-rose-100">
                                <h4 className="text-rose-700 font-black mb-4 flex items-center gap-2"><Icon name="x-circle" size={18} /> كلمات مفقودة</h4>
                                <div className="flex flex-wrap gap-2">{selectedResult.missingKeywords.map((kw: string, i: number) => <span key={i} className="px-3 py-1 bg-white text-rose-600 rounded-lg text-[10px] font-black border border-rose-100">{kw}</span>)}</div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[30px] p-8 shadow-xl border border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                            <button onClick={() => saveCandidate(selectedResult)} disabled={isSaving} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all flex items-center gap-2">
                                <Icon name="save" size={18} /> {isSaving ? 'جاري الحفظ...' : 'حفظ في قاعدة البيانات'}
                            </button>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase">بيانات الاتصال</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black">{selectedResult.phone}</span>
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black">{selectedResult.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-slate-800">ATS</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 space-y-6">
                    <h3 className="text-xl font-black text-slate-800">1. الوصف الوظيفي</h3>
                    <textarea 
                        className="w-full h-[300px] p-6 rounded-3xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 text-right font-bold text-slate-700 resize-none"
                        placeholder="أدخل الوصف الوظيفي هنا..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 space-y-6 flex flex-col">
                    <h3 className="text-xl font-black text-slate-800">2. ملفات الموظفين</h3>
                    <div 
                        className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 space-y-4 transition-all cursor-pointer ${isAnalyzing ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'}`}
                        onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.docx,.doc" onChange={handleFileChange} />
                        {isAnalyzing ? (
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="font-black text-indigo-600">جاري التحليل... {analysisProgress}%</p>
                            </div>
                        ) : (
                            <>
                                <Icon name="upload-cloud" size={48} className="text-slate-300" />
                                <p className="font-black text-slate-600">اسحب الملفات هنا</p>
                            </>
                        )}
                    </div>
                    <button onClick={startAnalysis} disabled={isAnalyzing || files.length === 0} className={`w-full font-black py-5 rounded-2xl shadow-lg transition-all ${isAnalyzing || files.length === 0 ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {isAnalyzing ? 'جاري التحليل...' : 'بدء التحليل الجماعي'}
                    </button>
                </div>
            </div>

            {results.length > 0 && (
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                            <tr><th className="px-6 py-5 text-center">الترتيب</th><th className="px-6 py-5">المرشح</th><th className="px-6 py-5 text-center">التوافق</th><th className="px-6 py-5 text-center">الإجراء</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {results.map((res, idx) => (
                                <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-center"><span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto font-black text-sm">{idx + 1}</span></td>
                                    <td className="px-6 py-4 font-black text-slate-800">{res.name}</td>
                                    <td className="px-6 py-4 text-center font-black text-indigo-600">{res.score}%</td>
                                    <td className="px-6 py-4 text-center"><button onClick={() => setSelectedResult(res)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all">عرض التقرير</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ATS;
