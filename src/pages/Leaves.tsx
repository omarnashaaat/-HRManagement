import React, { useState } from 'react';
import { Icon } from '../components/Layout';

export const Leaves = ({ employees, onUpdateEmployee }: any) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const startEditing = (emp: any) => {
        setEditingId(emp.id);
        setEditData({ ...emp });
    };

    const saveEdit = () => {
        onUpdateEmployee(editData);
        setEditingId(null);
    };

    const calculateTotalConsumed = (monthlyLeaves: number[]) => (monthlyLeaves || []).reduce((acc, curr) => acc + (parseFloat(curr as any) || 0), 0);

    const handleQuickAdd = (idx: number) => {
        const newMonthly = [...editData.monthlyLeaves];
        newMonthly[idx] = (parseFloat(newMonthly[idx]) || 0) + 0.5;
        setEditData({...editData, monthlyLeaves: newMonthly});
    };

    const handleClear = (idx: number) => {
        const newMonthly = [...editData.monthlyLeaves];
        newMonthly[idx] = 0;
        setEditData({...editData, monthlyLeaves: newMonthly});
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Icon name="calendar-days" className="text-pink-600" size={32} /> سجل غيابات الموظفين السنوي
                    </h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">إدارة الرصيد واستهلاك الأيام والكسور (0.5)</p>
                </div>
                {editingId ? (
                    <div className="flex gap-3">
                        <button onClick={saveEdit} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-pink-600 transition-all flex items-center gap-2">
                            <Icon name="save" size={18} /> حفظ التعديلات
                        </button>
                        <button onClick={() => setEditingId(null)} className="bg-white text-slate-500 px-6 py-3 rounded-2xl font-black border-2 border-slate-100 hover:bg-slate-50 transition-all">إلغاء</button>
                    </div>
                ) : (
                   <div className="bg-pink-50 text-pink-700 px-4 py-2 rounded-2xl border border-pink-100 flex items-center gap-2 animate-pulse">
                       <Icon name="info" size={16} />
                       <span className="text-xs font-black">يمكنك إضافة نصف يوم (0.5) في وضع التعديل</span>
                   </div>
                )}
            </div>

            <div className="rounded-[40px] shadow-2xl overflow-hidden border bg-white border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse text-[11px]">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-6 border-l border-slate-200 sticky right-0 z-30 bg-slate-50 min-w-[150px] text-right">الموظف</th>
                                <th className="px-2 py-6 border-l border-slate-200 min-w-[80px] bg-slate-50/50">الرصيد الكلي</th>
                                {months.map((m, i) => (
                                    <th key={i} className="px-1 py-6 border-l border-slate-200 min-w-[60px]">{m}</th>
                                ))}
                                <th className="px-2 py-6 border-l border-slate-200 min-w-[80px] bg-slate-50/50">المتبقي</th>
                                <th className="px-4 py-6 border-l border-slate-200 min-w-[180px]">ملاحظات</th>
                                <th className="px-4 py-6 no-print min-w-[80px]">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp: any) => {
                                const isEditing = editingId === emp.id;
                                const data = isEditing ? editData : emp;
                                const consumed = calculateTotalConsumed(data.monthlyLeaves);
                                const remaining = (parseFloat(data.totalLeaves) || 0) - consumed;

                                return (
                                    <tr key={emp.id} className={`${isEditing ? 'bg-pink-50/30' : 'hover:bg-slate-50/50'} transition-all group`}>
                                        <td className="px-4 py-4 border-l font-black text-right sticky right-0 z-20 bg-inherit shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                                            <div className="flex flex-col">
                                                <span className="text-slate-800 text-xs">{emp.name}</span>
                                                <span className="text-[9px] text-slate-400 font-mono">CODE: {emp.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 border-l bg-slate-50/30">
                                            {isEditing ? (
                                                <input 
                                                    type="number" 
                                                    step="0.5"
                                                    className="w-full text-center bg-white border border-slate-200 rounded-lg py-1.5 font-black text-slate-900 focus:ring-2 focus:ring-pink-500 outline-none" 
                                                    value={data.totalLeaves} 
                                                    onChange={e => setEditData({...editData, totalLeaves: e.target.value})} 
                                                />
                                            ) : (
                                                <span className="font-black text-slate-700 text-sm">{emp.totalLeaves || 0}</span>
                                            )}
                                        </td>
                                        {(data.monthlyLeaves || Array(12).fill(0)).map((val: number, idx: number) => (
                                            <td key={idx} className={`px-1 py-4 border-l transition-all ${val > 0 ? 'bg-pink-500/5' : ''}`}>
                                                {isEditing ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <input 
                                                            type="number" 
                                                            step="0.5"
                                                            className="w-full text-center bg-transparent border-none outline-none text-rose-600 font-black text-sm p-0 focus:bg-white focus:ring-1 focus:ring-pink-200 rounded" 
                                                            value={val === 0 ? '' : val} 
                                                            placeholder="0"
                                                            onChange={e => {
                                                                const newMonthly = [...data.monthlyLeaves];
                                                                newMonthly[idx] = parseFloat(e.target.value) || 0;
                                                                setEditData({...editData, monthlyLeaves: newMonthly});
                                                            }} 
                                                        />
                                                        <div className="flex gap-0.5 no-print">
                                                            <button onClick={() => handleQuickAdd(idx)} className="p-0.5 rounded bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors" title="إضافة نصف يوم">
                                                                <Icon name="plus" size={10} />
                                                            </button>
                                                            <button onClick={() => handleClear(idx)} className="p-0.5 rounded bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors" title="تصفير">
                                                                <Icon name="rotate-ccw" size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`font-black text-sm ${val > 0 ? 'text-rose-500' : 'text-slate-300'}`}>{val || '-'}</span>
                                                )}
                                            </td>
                                        ))}
                                        <td className={`px-2 py-4 border-l font-black text-sm bg-slate-50/30 ${remaining < 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {remaining % 1 === 0 ? remaining : remaining.toFixed(1)}
                                        </td>
                                        <td className="px-4 py-4 border-l text-right">
                                            {isEditing ? (
                                                <textarea 
                                                    rows={1}
                                                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] outline-none focus:ring-2 focus:ring-pink-500 resize-none" 
                                                    value={data.notes} 
                                                    onChange={e => setEditData({...editData, notes: e.target.value})} 
                                                    placeholder="أضف ملاحظات..."
                                                />
                                            ) : (
                                                <span className="text-slate-400 font-bold text-[10px] line-clamp-2 leading-relaxed">{emp.notes || 'لا توجد ملاحظات'}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center no-print">
                                            {!isEditing && (
                                                <button 
                                                    onClick={() => startEditing(emp)} 
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-pink-600 hover:text-white transition-all shadow-sm border border-slate-100 group-hover:scale-105"
                                                >
                                                    <Icon name="edit-3" size={14} />
                                                    <span className="text-[10px] font-black">تعديل</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
