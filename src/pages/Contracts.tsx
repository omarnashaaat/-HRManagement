import React, { useState } from 'react';
import { Icon } from '../components/Layout';

export const Contracts = ({ employees, contractRecords, setContractRecords }: any) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    const startEditing = (emp: any) => {
        const record = contractRecords[emp.id] || {
            companyName: '',
            branch: '',
            hiringEntity: '',
            startDate: emp.joinDate || '',
            endDate: '',
            type: 'محدد المدة'
        };
        setFormData(record);
        setEditingId(emp.id);
    };

    const saveRecord = (empId: string) => {
        setContractRecords((prev: any) => ({ ...prev, [empId]: formData }));
        setEditingId(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">إدارة عقود العمل</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">تفاصيل التعيين والعقود القانونية</p>
                </div>
            </div>

            <div className="rounded-[40px] shadow-2xl overflow-hidden border bg-white border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-teal-50 text-teal-700 text-[11px] font-black uppercase tracking-wider border-b border-teal-100">
                            <tr>
                                <th className="px-4 py-5">الموظف</th>
                                <th className="px-4 py-5">نوع العقد</th>
                                <th className="px-4 py-5">بيانات المنشأة</th>
                                <th className="px-4 py-5">فترة التعاقد</th>
                                <th className="px-4 py-5 text-center no-print">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employees.map((emp: any) => {
                                const record = contractRecords[emp.id] || {};
                                const isEditing = editingId === emp.id;

                                return (
                                    <tr key={emp.id} className="hover:bg-teal-500/5 transition-colors group">
                                        <td className="px-4 py-4 align-top">
                                            <div className="space-y-1">
                                                <p className="font-black text-slate-800 text-base">{emp.name}</p>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">الكود الرقمي: <span className="text-teal-600">{emp.code}</span></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">الرقم القومي: <span className="text-slate-600">{emp.nationalId || '---'}</span></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{emp.department} | {emp.jobTitle}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 block uppercase">نوع العقد</label>
                                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded-xl text-xs font-bold outline-none bg-white">
                                                        <option value="محدد المدة">محدد المدة</option>
                                                        <option value="غير محدد المدة">غير محدد المدة</option>
                                                        <option value="عقد عمل مؤقت">عقد عمل مؤقت</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black">{record.type || 'محدد المدة'}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            {isEditing ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    <input type="text" placeholder="اسم الشركة" className="p-2 border rounded-xl text-xs outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                                                    <input type="text" placeholder="الفرع" className="p-2 border rounded-xl text-xs outline-none" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} />
                                                    <input type="text" placeholder="جهة التعيين" className="p-2 border rounded-xl text-xs outline-none" value={formData.hiringEntity} onChange={e => setFormData({...formData, hiringEntity: e.target.value})} />
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-700">{record.companyName || '---'}</p>
                                                    <p className="text-[10px] text-slate-500">{record.branch ? `فرع: ${record.branch}` : ''}</p>
                                                    <p className="text-[10px] text-slate-400">{record.hiringEntity ? `جهة: ${record.hiringEntity}` : ''}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top">
                                            {isEditing ? (
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">بداية العقد</label>
                                                        <input type="date" className="w-full p-2 border rounded-xl text-xs outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase">نهاية العقد</label>
                                                        <input type="date" className="w-full p-2 border rounded-xl text-xs outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="calendar" size={12} className="text-teal-500" />
                                                        <span className="text-[11px] font-mono font-bold text-slate-600">البداية: {record.startDate || emp.joinDate}</span>
                                                    </div>
                                                    {record.endDate && (
                                                        <div className="flex items-center gap-2">
                                                            <Icon name="clock" size={12} className="text-rose-400" />
                                                            <span className="text-[11px] font-mono font-bold text-slate-600">النهاية: {record.endDate}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center no-print align-middle">
                                            {isEditing ? (
                                                <button onClick={() => saveRecord(emp.id)} className="p-3 bg-teal-600 text-white rounded-2xl shadow-lg hover:bg-teal-700 transition-all">
                                                    <Icon name="check" size={18} />
                                                </button>
                                            ) : (
                                                <button onClick={() => startEditing(emp)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-teal-600 hover:text-white transition-all">
                                                    <Icon name="edit-3" size={18} />
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
