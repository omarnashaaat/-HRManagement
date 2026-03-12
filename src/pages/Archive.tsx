import React, { useState } from 'react';
import { Icon } from '../components/Layout';

export const Archive = ({ employees }: any) => {
    const [view, setView] = useState('folders');
    const [docsState, setDocsState] = useState<any>({});
    const docHeaders = ["صورة البطاقة", "إقرار استلام العمل", "أصل المؤهل الدراسي", "أصل شهادة الميلاد", "الكشف الطبي (111)", "صحيفة الحالة الجنائية", "الموقف من التجنيد", "الصور الشخصية (6)", "كعب العمل", "أصل العقد الموقع", "استمارة س1", "شهادة قياس المهارة", "تراخيص / نقابة", "الشهادة الصحية"];
    
    const toggleDoc = (empId: string, docIdx: number) => { 
        const key = `${empId}-${docIdx}`; 
        setDocsState((prev: any) => ({ ...prev, [key]: !prev[key] })); 
    };

    const folders = [
        { id: 'hiring_docs', title: 'مسوغات التعيين', icon: 'folder-open', color: 'bg-amber-600' }, 
        { id: 'contracts', title: 'أرشيف العقود', icon: 'file-text', color: 'bg-indigo-600' }, 
        { id: 'insurance', title: 'مستندات التأمينات', icon: 'shield-check', color: 'bg-sky-600' }, 
        { id: 'payroll_archive', title: 'سجلات الرواتب', icon: 'banknote', color: 'bg-emerald-600' }
    ];

    if (view === 'folders') {
        return (
            <div className="space-y-10 animate-fade-in">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">الأرشيف الرقمي</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">إدارة الوثائق والملفات الرسمية</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {folders.map(f => (
                        <button key={f.id} onClick={() => f.id === 'hiring_docs' && setView('hiring_matrix')} className="group p-8 rounded-[50px] border-2 transition-all flex flex-col items-center text-center bg-white border-slate-100 hover:border-amber-400">
                            <div className={`${f.color} p-6 rounded-[30px] text-white shadow-xl mb-6 group-hover:scale-110 transition-transform`}>
                                <Icon name={f.icon} size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">{f.title}</h3>
                            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase">اضغط للفتح</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in" key="archive-matrix">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">سجل استلام مسوغات التعيين</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">متابعة الوثائق المكتملة لكل موظف</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setView('folders')} className="px-6 py-3 bg-white text-slate-800 border-2 border-slate-200 rounded-2xl font-black">العودة للمجلدات</button>
                </div>
            </div>
            <div className="rounded-[30px] shadow-2xl overflow-hidden border bg-white border-slate-200 print-container">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead className="bg-slate-50 text-slate-700 text-[10px] font-black uppercase">
                            <tr>
                                <th className="px-3 py-6 border-b border-l min-w-[60px] sticky right-0 z-20 bg-slate-50 text-center leading-none">كود<br/>الموظف</th>
                                <th className="px-4 py-6 border-b border-l min-w-[250px] sticky right-[60px] z-20 bg-slate-50 text-right">الاســــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــم</th>
                                <th className="px-2 py-6 border-b border-l min-w-[100px]">الإدارة</th>
                                <th className="px-2 py-6 border-b border-l min-w-[120px]">الوظيفة</th>
                                <th className="px-2 py-6 border-b border-l min-w-[90px]">التوظيف</th>
                                {docHeaders.map((h, i) => (
                                    <th key={i} className="p-0 border-b border-l min-w-[50px] relative">
                                        <div className="writing-mode-vertical transform -rotate-180 h-48 flex items-center justify-center font-black leading-tight px-1 text-[9px]">{h}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {employees.map((emp: any) => (
                                <tr key={emp.id} className="hover:bg-amber-500/5 transition-colors group">
                                    <td className="px-2 py-4 border-l font-mono font-bold text-indigo-500 sticky right-0 z-10 bg-white group-hover:bg-amber-50/50">{emp.code}</td>
                                    <td className="px-4 py-4 border-l font-black text-right sticky right-[60px] z-10 bg-white group-hover:bg-amber-50/50 text-slate-800">{emp.name}</td>
                                    <td className="px-2 py-4 border-l text-[11px] font-bold text-slate-500">{emp.department}</td>
                                    <td className="px-2 py-4 border-l text-[11px] font-bold text-slate-500">{emp.jobTitle}</td>
                                    <td className="px-2 py-4 border-l text-[11px] font-mono text-slate-400">{emp.joinDate}</td>
                                    {docHeaders.map((_, i) => { 
                                        const key = `${emp.id}-${i}`; 
                                        const checked = docsState[key]; 
                                        return (
                                            <td key={i} onClick={() => toggleDoc(emp.id, i)} className={`px-1 py-4 border-l cursor-pointer transition-all hover:bg-emerald-500/10 ${checked ? 'bg-emerald-500/10' : ''}`}>
                                                <div className="flex justify-center items-center h-8">
                                                    {checked ? (
                                                        <div className="text-emerald-500 animate-fade-in"><Icon name="check" size={24} /></div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-lg border-2 border-slate-200 opacity-20 no-print"></div>
                                                    )}
                                                </div>
                                            </td>
                                        ); 
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
