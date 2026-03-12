import React, { useRef } from 'react';
import { Icon } from '../components/Layout';

export const Settings = ({ appData, onRestore }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        const dataStr = JSON.stringify(appData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `HR_Coordinator_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRestore = (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            try {
                const json = JSON.parse(e.target.result);
                if (confirm('هل أنت متأكد من استعادة البيانات؟ سيؤدي ذلك إلى استبدال كافة البيانات الحالية.')) {
                    onRestore(json);
                    alert('تمت استعادة البيانات بنجاح!');
                }
            } catch (err) {
                alert('خطأ في ملف النسخة الاحتياطية. يرجى التأكد من صحة الملف.');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-slate-800">إعدادات النظام</h2>
            </div>

            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl space-y-10">
                <div className="bg-slate-50/50 rounded-[30px] p-8 border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Icon name="save" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">النسخ الاحتياطي والاستعادة</h3>
                            <p className="text-slate-400 text-xs font-bold">قم بتصدير قاعدة البيانات كاملة (JSON) لحفظها بأمان أو نقلها لجهاز آخر.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button 
                            onClick={handleBackup}
                            className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-[30px] hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <Icon name="download" size={32} className="text-slate-300 group-hover:text-blue-500 mb-4 transition-colors" />
                            <span className="text-lg font-black text-slate-700">تحميل نسخة (Backup)</span>
                        </button>

                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-[30px] hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                        >
                            <Icon name="upload" size={32} className="text-slate-300 group-hover:text-indigo-500 mb-4 transition-colors" />
                            <span className="text-lg font-black text-slate-700">استعادة (Restore)</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleRestore} 
                                accept=".json" 
                                className="hidden" 
                            />
                        </button>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <Icon name="shield-check" size={18} />
                        <span className="text-xs font-black">النظام محدث ومؤمن بالكامل</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        إصدار النظام v2.6.0 - TIBA COORDINATOR
                    </div>
                </div>
            </div>

            <div className="bg-amber-50 rounded-[30px] p-6 border border-amber-100 flex gap-4 items-start">
                <Icon name="alert-circle" className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    تنبيه: لا تقم بمشاركة ملف النسخة الاحتياطية مع أي شخص غير مخول، حيث يحتوي الملف على كافة البيانات الشخصية والرواتب الخاصة بالموظفين.
                </p>
            </div>
        </div>
    );
};
