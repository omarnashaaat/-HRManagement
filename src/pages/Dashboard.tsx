import React from 'react';
import { Icon } from '../components/Layout';

export const Dashboard = ({ setActiveTab, userName }: { setActiveTab: (tab: string) => void, userName: string }) => {
    const menuItems = [
        { id: 'employees', title: 'فريق العمل', sub: 'جميع ملفات الموظفين', icon: 'users', color: 'bg-indigo-600' },
        { id: 'attendance', title: 'الحضور والإنصراف', sub: 'سجلات الحضور اليومية', icon: 'clock', color: 'bg-blue-600' },
        { id: 'payroll', title: 'المرتبات والمكافآت', sub: 'إدارة كشوف الرواتب', icon: 'banknote', color: 'bg-emerald-600' },
        { id: 'leaves', title: 'الإجازات', sub: 'رصيد غيابات الشهور', icon: 'calendar-days', color: 'bg-pink-600' },
        { id: 'archive', title: 'الأرشيف والمستندات', sub: 'مسوغات التعيين والملفات', icon: 'folder-archive', color: 'bg-amber-600' },
        { id: 'insurance', title: 'التأمينات الاجتماعية', sub: 'إدارة التغطية التأمينية', icon: 'shield-check', color: 'bg-sky-600' },
        { id: 'contracts', title: 'عقود العمل', sub: 'إدارة وتجديد العقود', icon: 'file-text', color: 'bg-teal-600' },
        { id: 'recruitment', title: 'التوظيف والتعيين', sub: 'إدارة طلبات التوظيف', icon: 'briefcase', color: 'bg-violet-600' },
        { id: 'settings', title: 'إعدادات النظام', sub: 'النسخ الاحتياطي والتهيئة', icon: 'settings', color: 'bg-slate-600' },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex justify-between items-end">
                <div className="pr-4">
                    <h1 className="text-4xl font-black text-slate-800 mb-2">مرحباً بك يا {userName} 👋</h1>
                    <p className="text-slate-500 font-bold tracking-wide">إدارة أسهل… لقرارات أدق.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)}
                        className="group p-8 rounded-[45px] shadow-sm transition-all duration-300 flex flex-col items-center text-center border bg-white border-slate-100 hover:bg-slate-900 hover:-translate-y-2"
                    >
                        <div className={`${item.color} text-white p-6 rounded-[28px] mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500 flex items-center justify-center`}>
                            <Icon name={item.icon} size={36} />
                        </div>
                        <h3 className="text-2xl font-black mb-1 transition-colors text-slate-800 group-hover:text-white">{item.title}</h3>
                        <p className="text-slate-400 group-hover:text-slate-500 text-xs font-bold uppercase tracking-widest">{item.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};
