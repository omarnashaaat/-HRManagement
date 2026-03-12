import React, { useState, useRef } from 'react';
import { Icon } from './Icon'; // Assuming an Icon component exists

const ATS = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
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

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button className="p-3 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all">
                        <Icon name="arrow-right" size={24} />
                    </button>
                    <h2 className="text-3xl font-black text-slate-800">الماسح الذكي (Smart ATS)</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Right Card: Job Description */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Icon name="briefcase" size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">1. الوصف الوظيفي</h3>
                        </div>
                    </div>
                    <textarea 
                        className="w-full h-[300px] p-6 rounded-3xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-right font-bold text-slate-700 resize-none"
                        placeholder="أدخل الوصف الوظيفي هنا (سيتم استخدامه لتقييم جميع الموظفين)..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </div>

                {/* Left Card: Employee Files */}
                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-slate-50 space-y-6 flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Icon name="users" size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">2. ملفات الموظفين</h3>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-black">{files.length} ملفات</span>
                    </div>

                    <div 
                        className="flex-1 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-12 space-y-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            multiple 
                            accept=".pdf,.docx,.doc" 
                            onChange={handleFileChange}
                        />
                        <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:scale-110 transition-transform">
                            <Icon name="upload-cloud" size={48} />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-slate-600">اسحب ملفات جميع الموظفين هنا</p>
                            <p className="text-xs text-slate-400 font-bold mt-1">يدعم PDF, DOCX</p>
                        </div>
                    </div>

                    <button className="w-full bg-indigo-400 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-3">
                        <Icon name="sparkles" size={20} />
                        بدء التحليل الجماعي
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ATS;
