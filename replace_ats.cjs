const fs = require('fs');

const atsCode = `
        const extractTextFromFile = async (file) => {
            try {
                if (file.type === "text/plain") {
                    return await file.text();
                } else if (file.type === "application/pdf") {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map(item => item.str).join(" ") + " ";
                    }
                    return fullText;
                } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    return result.value;
                } else {
                    return ""; 
                }
            } catch (error) {
                console.error("Error parsing file:", error);
                return "";
            }
        };

        const extractKeywords = (text) => {
            if (!text) return [];
            const stopWords = ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'experience', 'work', 'skills', 'education', 'في', 'من', 'على', 'مع', 'العمل', 'خبرة', 'required', 'requirements', 'about', 'summary'];
            const words = text.toLowerCase().replace(/[^\\w\\s\\u0600-\\u06FF]/g, '').split(/\\s+/);
            return [...new Set(words.filter(w => w.length > 3 && !stopWords.includes(w)))];
        };

        const analyzeCV = (cvText, jobDesc) => {
            const jdKeywords = extractKeywords(jobDesc);
            const cvTextLower = cvText.toLowerCase();
            
            const foundKeywords = jdKeywords.filter(keyword => cvTextLower.includes(keyword));
            const missingKeywords = jdKeywords.filter(keyword => !cvTextLower.includes(keyword));
            
            // Sub-Scores Calculation
            
            // 1. Skills Match (Based on keywords)
            const keywordRatio = jdKeywords.length > 0 ? (foundKeywords.length / jdKeywords.length) : 0;
            const skillsScore = Math.round(keywordRatio * 100);

            // 2. Formatting Score (Mocked based on structure)
            const hasEmail = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/.test(cvText);
            const hasPhone = /(\\+?\\d{8,})/.test(cvText);
            const properLength = cvText.length > 600 && cvText.length < 5000;
            let formattingScore = 60; // Base
            if (hasEmail) formattingScore += 15;
            if (hasPhone) formattingScore += 15;
            if (properLength) formattingScore += 10;
            formattingScore = Math.min(100, formattingScore);

            // 3. Experience/Keywords Context
            let experienceScore = Math.round((skillsScore * 0.7) + (cvText.length > 1000 ? 30 : 0));
            experienceScore = Math.min(100, experienceScore);

            // Total Weighted Score
            let finalScore = Math.round((skillsScore * 0.5) + (experienceScore * 0.3) + (formattingScore * 0.2));
            finalScore = Math.min(100, Math.max(10, finalScore));

            return {
                score: finalScore,
                skillsScore,
                experienceScore,
                formattingScore,
                foundKeywords,
                missingKeywords,
                email: cvText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.[a-zA-Z0-9_-]+)/)?.[0] || "غير موجود",
                phone: cvText.match(/(\\+?\\d{9,})?.[0-9]{9,}/)?.[0] || "غير موجود"
            };
        };


        // --- UI Components ---

        const CircularProgress = ({ score, size = 160, strokeWidth = 14 }) => {
            const radius = (size - strokeWidth) / 2;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (score / 100) * circumference;
            const color = 'text-amber-500'; 

            return (
                <div className="flex flex-col items-center justify-center relative">
                    <div className="relative" style={{ width: size, height: size }}>
                        <svg className="w-full h-full transform -rotate-90" viewBox={\`0 0 \${size} \${size}\`}>
                            <circle className="text-slate-100" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                            <circle 
                                className={\`\${color} transition-all duration-1000 ease-out\`} 
                                strokeWidth={strokeWidth} 
                                strokeDasharray={circumference} 
                                strokeDashoffset={offset} 
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="transparent" 
                                r={radius} 
                                cx={size / 2} 
                                cy={size / 2} 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={\`text-4xl font-black \${color}\`}>{\${score}}%</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1">ATS SCORE</span>
                        </div>
                    </div>
                    <span className="mt-3 text-sm font-bold text-slate-700">نسبة التوافق الكلي</span>
                </div>
            );
        };

        const ProgressBar = ({ label, value, colorClass, labelEnglish }) => (
            <div className="mb-5 last:mb-0">
                <div className="flex justify-between mb-1 items-end">
                    <span className="text-sm font-bold text-slate-700 flex flex-col">
                        {label} 
                        <span className="text-[10px] text-slate-400 font-normal">{labelEnglish}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-500">{value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className={\`h-2.5 rounded-full transition-all duration-1000 \${colorClass}\`} style={{ width: \`\${value}%\` }}></div>
                </div>
            </div>
        );

        const DashboardHome = ({ setView }) => {
            return (
                <div className="max-w-6xl mx-auto pt-10 px-4 animate-slide-up min-h-[80vh] flex flex-col justify-center">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl blur-xl opacity-20"></div>
                            <Icon name="aperture" size={48} className="text-indigo-600 relative z-10" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-800 tracking-tight mb-4">Omar ATS</h1>
                        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">نظام تحليل حقيقي لجميع الموظفين. ارفع مئات الملفات وسيتم ترتيبهم حسب الأفضلية.</p>
                    </div>

                    <div className="max-w-xl mx-auto w-full">
                        <button 
                            onClick={() => setView('scanner')}
                            className={\`w-full group glass-card p-10 rounded-[40px] text-right transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/30 border border-white/50 flex flex-col items-center text-center\`}
                        >
                            <div className={\`bg-indigo-600 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 mb-6\`}>
                                <Icon name="layers" size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">الماسح الذكي الشامل</h3>
                            <p className="text-slate-400 font-bold text-lg">تحليل جماعي + ترتيب المرشحين</p>
                            <div className="mt-8 px-6 py-3 bg-slate-50 rounded-full text-indigo-600 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-2">
                                ابدأ الفحص الآن <Icon name="arrow-left" size={16} />
                            </div>
                        </button>
                    </div>
                </div>
            );
        };

        const AdvancedScanner = ({ setView }) => {
            const [step, setStep] = useState(1); 
            const [jobDesc, setJobDesc] = useState('');
            const [files, setFiles] = useState([]); // Array of files
            const [results, setResults] = useState([]); // Array of results
            const [selectedResult, setSelectedResult] = useState(null); // Selected candidate for detail view
            const [isProcessing, setIsProcessing] = useState(false);
            const fileInputRef = useRef(null);
            
            const handleFileDrop = (e) => {
                e.preventDefault();
                const droppedFiles = Array.from(e.dataTransfer.files);
                addFiles(droppedFiles);
            };

            const handleFileSelect = (e) => {
                const selectedFiles = Array.from(e.target.files);
                addFiles(selectedFiles);
            };

            const addFiles = (newFiles) => {
                const validFiles = newFiles.filter(f => 
                    ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(f.type)
                );
                setFiles(prev => [...prev, ...validFiles]);
            };

            const removeFile = (idx) => {
                setFiles(files.filter((_, i) => i !== idx));
            };

            const analyze = async () => {
                if (!jobDesc || files.length === 0) return alert('يرجى إدخال الوصف الوظيفي ورفع السير الذاتية');
                setStep(2);
                setIsProcessing(true);
                setResults([]);

                try {
                    const newResults = [];
                    for (const file of files) {
                        const text = await extractTextFromFile(file);
                        const analysis = analyzeCV(text, jobDesc);
                        
                        // Extract a readable name
                        let candidateName = file.name.replace(/\\.[^/.]+$/, "").replace(/[_-]/g, " ");
                        if(candidateName.length > 20) candidateName = candidateName.substring(0, 20) + "...";

                        newResults.push({
                            id: Date.now() + Math.random(),
                            fileName: file.name,
                            candidateName: candidateName,
                            fileSize: (file.size / 1024).toFixed(2) + " KB",
                            fileType: file.type,
                            ...analysis
                        });
                    }
                    
                    // Sort descending by score
                    newResults.sort((a, b) => b.score - a.score);
                    setResults(newResults);
                    setStep(3);
                } catch (error) {
                    console.error(error);
                    alert("حدث خطأ أثناء التحليل");
                    setStep(1);
                } finally {
                    setIsProcessing(false);
                }
            };

            return (
                <div className="max-w-7xl mx-auto pt-6 px-4 pb-20 animate-fade-in h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { 
                                if (selectedResult) { setSelectedResult(null); } // Go back to list
                                else if (step === 3) { setStep(1); setFiles([]); setResults([]); } // Reset
                                else setView('home');
                            }} className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-indigo-600">
                                <Icon name="arrow-right" size={24} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">الماسح الذكي (Smart ATS)</h2>
                                {step === 3 && !selectedResult && <p className="text-xs font-bold text-slate-500">تم تحليل {results.length} موظف</p>}
                                {selectedResult && <p className="text-xs font-bold text-slate-500">تقرير تفصيلي: {selectedResult.candidateName}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Input (Bulk Upload) */}
                    {step === 1 && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100">
                                <label className="flex items-center gap-2 font-black text-slate-700 mb-4">
                                    <Icon name="briefcase" size={20} className="text-indigo-600"/> 1. الوصف الوظيفي
                                </label>
                                <textarea 
                                    className="w-full h-64 p-4 bg-slate-50 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none text-sm font-medium transition-all"
                                    placeholder="أدخل الوصف الوظيفي هنا (سيتم استخدامه لتقييم جميع الموظفين)..."
                                    value={jobDesc}
                                    onChange={(e) => setJobDesc(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="bg-white p-8 rounded-[30px] shadow-sm border border-slate-100 flex flex-col">
                                <label className="flex items-center justify-between font-black text-slate-700 mb-4">
                                    <span className="flex items-center gap-2"><Icon name="users" size={20} className="text-indigo-600"/> 2. ملفات الموظفين</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-500">{files.length} ملفات</span>
                                </label>
                                <div 
                                    className="file-drop-zone flex-1 rounded-[24px] flex flex-col items-center justify-center cursor-pointer relative p-6 border-2 border-dashed border-slate-200"
                                    onClick={() => fileInputRef.current.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept=".pdf,.doc,.docx" />
                                    
                                    {files.length > 0 ? (
                                        <div className="w-full h-full overflow-y-auto max-h-[200px] grid grid-cols-2 gap-2 p-1" onClick={e => e.stopPropagation()}>
                                            {files.map((f, i) => (
                                                <div key={i} className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm flex items-center justify-between">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Icon name="file" size={12} className="text-slate-400 shrink-0"/>
                                                        <span className="text-[10px] font-bold text-slate-600 truncate">{f.name}</span>
                                                    </div>
                                                    <button onClick={() => removeFile(i)} className="text-slate-300 hover:text-rose-500"><Icon name="x" size={12}/></button>
                                                </div>
                                            ))}
                                            <div className="flex items-center justify-center p-2 border border-dashed border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                                <Icon name="plus" size={16}/>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Icon name="upload-cloud" size={40} className="mx-auto mb-2"/>
                                            <p className="text-sm">اسحب ملفات جميع الموظفين هنا</p>
                                            <p className="text-[10px] mt-1 opacity-70">يدعم PDF, DOCX</p>
                                        </div>
                                    )}
                                </div>
                                <button onClick={analyze} disabled={!files.length || !jobDesc} className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    بدء التحليل الجماعي <Icon name="sparkles" size={18} className="inline mr-2"/>
                                </button>
                            </div>
                         </div>
                    )}

                    {/* Step 2: Processing */}
                    {step === 2 && (
                        <div className="h-[60vh] flex flex-col items-center justify-center bg-white rounded-[30px] shadow-xl border border-slate-100">
                            <div className="animate-spin text-indigo-600 mb-4"><Icon name="loader-2" size={48} /></div>
                            <p className="font-black text-slate-700 text-xl">جاري تحليل {files.length} ملف...</p>
                            <p className="text-slate-400 text-sm mt-2">يرجى الانتظار، نقوم بقراءة كل سيرة ذاتية ومطابقتها.</p>
                        </div>
                    )}

                    {/* Step 3: Results (Leaderboard List) */}
                    {step === 3 && !selectedResult && (
                        <div className="animate-fade-in space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-6 rounded-[24px] shadow-lg shadow-indigo-200">
                                    <div className="text-indigo-200 text-sm font-bold mb-1">أفضل مرشح</div>
                                    <div className="text-2xl font-black">{results[0]?.candidateName}</div>
                                    <div className="mt-2 inline-block px-2 py-1 bg-white/20 rounded text-xs font-bold">{results[0]?.score}% توافق</div>
                                </div>
                                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                                    <div className="text-slate-400 text-sm font-bold mb-1">متوسط التقييم</div>
                                    <div className="text-3xl font-black text-slate-800">
                                        {Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length)}%
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                                    <div className="text-slate-400 text-sm font-bold mb-1">إجمالي الملفات</div>
                                    <div className="text-3xl font-black text-slate-800">{results.length}</div>
                                </div>
                            </div>

                            {/* Leaderboard Table */}
                            <div className="bg-white rounded-[30px] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right">
                                        <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase">
                                            <tr>
                                                <th className="px-6 py-5 text-center w-16">الترتيب</th>
                                                <th className="px-6 py-5">الموظف / المرشح</th>
                                                <th className="px-6 py-5">نسبة التوافق</th>
                                                <th className="px-6 py-5">التصنيف</th>
                                                <th className="px-6 py-5 text-center">الإجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {results.map((res, idx) => (
                                                <tr key={res.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedResult(res)}>
                                                    <td className="px-6 py-5 text-center">
                                                        <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mx-auto \${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-slate-100 text-slate-600' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'text-slate-400'}\`}>
                                                            {idx + 1}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm uppercase">
                                                                {res.candidateName.slice(0,2)}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-800">{res.candidateName}</div>
                                                                <div className="text-[10px] text-slate-400">{res.fileName}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 w-24 bg-slate-100 rounded-full h-1.5">
                                                                <div className={\`h-1.5 rounded-full \${res.score >= 80 ? 'bg-emerald-500' : res.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}\`} style={{width: \`\${res.score}%\`}}></div>
                                                            </div>
                                                            <span className="font-black text-sm">{res.score}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={\`px-3 py-1 rounded-full text-xs font-bold \${res.score >= 85 ? 'bg-emerald-100 text-emerald-700' : res.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}\`}>
                                                            {res.score >= 85 ? 'ممتاز' : res.score >= 60 ? 'جيد' : 'ضعيف'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <button className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">عرض التقرير</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Detailed View (Single Result) */}
                    {step === 3 && selectedResult && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                            
                            {/* LEFT COLUMN (Results) */}
                            <div className="lg:col-span-8 space-y-6">
                                {/* Back Button Mobile */}
                                <button onClick={() => setSelectedResult(null)} className="lg:hidden w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold mb-2">عودة للقائمة</button>

                                {/* Score Card */}
                                <div className="bg-white rounded-[30px] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500"></div>
                                    
                                    <div className="flex-1 w-full">
                                        <h3 className="text-2xl font-black text-slate-800 mb-6 text-right">تقييم: {selectedResult.candidateName}</h3>
                                        <ProgressBar label="تطابق المهارات" labelEnglish="(Skills)" value={selectedResult.skillsScore} colorClass="bg-indigo-600" />
                                        <ProgressBar label="الخبرة والكلمات المفتاحية" labelEnglish="(Context)" value={selectedResult.experienceScore} colorClass="bg-purple-600" />
                                        <ProgressBar label="جودة التنسيق" labelEnglish="(Formatting)" value={selectedResult.formattingScore} colorClass="bg-emerald-500" />
                                    </div>
                                    
                                    <div className="shrink-0">
                                        <CircularProgress score={selectedResult.score} />
                                    </div>
                                </div>

                                {/* Keywords Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-rose-50 rounded-[30px] p-6 border border-rose-100">
                                        <h4 className="font-black text-rose-700 mb-4 flex items-center justify-between">
                                            <span><Icon name="x" size={18} className="inline ml-2"/> كلمات مفقودة (هام)</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResult.missingKeywords.length > 0 ? selectedResult.missingKeywords.map((k,i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white text-rose-600 rounded-xl text-xs font-bold shadow-sm">{k}</span>
                                            )) : <span className="text-xs text-rose-400">لا يوجد</span>}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 rounded-[30px] p-6 border border-emerald-100">
                                        <h4 className="font-black text-emerald-700 mb-4 flex items-center justify-between">
                                            <span><Icon name="check" size={18} className="inline ml-2"/> كلمات موجودة</span>
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedResult.foundKeywords.length > 0 ? selectedResult.foundKeywords.map((k,i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white text-emerald-600 rounded-xl text-xs font-bold shadow-sm">{k}</span>
                                            )) : <span className="text-xs text-emerald-400">لا يوجد</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div className="text-right">
                                        <h5 className="font-black text-slate-700 mb-2 flex items-center gap-2"><Icon name="contact" size={16}/> بيانات الاتصال</h5>
                                        <div className="flex gap-4">
                                            <span className={\`text-xs font-bold px-2 py-1 rounded \${selectedResult.phone !== "غير موجود" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}\`}>Phone {selectedResult.phone !== "غير موجود" ? "✓" : "✗"}</span>
                                            <span className={\`text-xs font-bold px-2 py-1 rounded \${selectedResult.email !== "غير موجود" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}\`}>Email {selectedResult.email !== "غير موجود" ? "✓" : "✗"}</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-10 bg-slate-100"></div>
                                    <div className="text-left">
                                        <h5 className="font-black text-slate-700 mb-2 flex items-center gap-2 justify-end">ملف <Icon name="file-search" size={16}/></h5>
                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[150px] block">{selectedResult.fileName}</span>
                                    </div>
                                </div>

                                {/* Main Buttons */}
                                <div className="flex gap-4">
                                    <button onClick={() => window.print()} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                                        طباعة التقرير
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT COLUMN (Inputs Display) */}
                            <div className="lg:col-span-4 space-y-6">
                                <button onClick={() => setSelectedResult(null)} className="hidden lg:flex w-full py-4 bg-slate-800 text-white rounded-[24px] font-black items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg">
                                    <Icon name="arrow-right" size={18}/> العودة لقائمة الموظفين
                                </button>

                                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 h-[300px] flex flex-col">
                                    <h4 className="font-bold text-slate-400 mb-4 flex items-center gap-2">
                                        <Icon name="briefcase" size={18}/> الوصف الوظيفي (Reference)
                                    </h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 flex-1 overflow-y-auto text-xs text-slate-500 leading-relaxed custom-scrollbar">
                                        {jobDesc}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-slate-100 h-[300px] flex flex-col">
                                    <h4 className="font-bold text-slate-400 mb-4 flex items-center gap-2">
                                        <Icon name="file-text" size={18}/> السيرة الذاتية (Source)
                                    </h4>
                                    <div className="bg-slate-50 rounded-2xl p-4 flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                                            <Icon name="check-square" size={32} />
                                        </div>
                                        <p className="font-black text-slate-700 text-center text-sm px-4 break-all">{selectedResult.fileName}</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            );
        };

        const Recruitment = () => {
            const [view, setView] = useState('home');

            return (
                <div className="min-h-screen">
                    <main>
                        {view === 'home' && <DashboardHome setView={setView} />}
                        {view === 'scanner' && <AdvancedScanner setView={setView} />}
                    </main>
                </div>
            );
        };
`;

const indexHtml = fs.readFileSync('index.html', 'utf8');
const startIdx = indexHtml.indexOf('const Recruitment = () => {');
const endIdx = indexHtml.indexOf('const App = () => {');

if (startIdx !== -1 && endIdx !== -1) {
    const newHtml = indexHtml.substring(0, startIdx) + atsCode + '\n        ' + indexHtml.substring(endIdx);
    fs.writeFileSync('index.html', newHtml);
    console.log('Successfully replaced Recruitment component');
} else {
    console.error('Could not find Recruitment or App component');
}
