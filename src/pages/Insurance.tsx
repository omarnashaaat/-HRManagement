import React, { useState, useMemo } from 'react';
import { Icon } from '../components/Layout';

export const Insurance = ({ employees, insuranceRecords, setInsuranceRecords, saveInsurance }: any) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    const startEditing = (emp: any) => {
        const record = insuranceRecords[emp.id] || {
            status: 'غير مؤمن عليه',
            insuranceNumber: '',
            startDate: '',
            insuranceSalary: '',
            insuranceOffice: '',
            ratioCompany: '18.75',
            ratioEmployee: '11'
        };
        setFormData(record);
        setEditingId(emp.id);
    };

    const saveRecord = (empId: string) => {
        setInsuranceRecords((prev: any) => ({ ...prev, [empId]: formData }));
        setEditingId(null);
        saveInsurance(empId, formData);
    };

    const stats = useMemo(() => {
        const vals: any[] = Object.values(insuranceRecords);
        return {
            insured: vals.filter(v => v.status === 'مؤمن عليه').length,
            notInsured: employees.length - vals.filter(v => v.status === 'مؤمن عليه' || v.status === 'جاري التنفيذ').length,
            processing: vals.filter(v => v.status === 'جاري التنفيذ').length
        };
    }, [insuranceRecords, employees]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800">التأمينات الاجتماعية</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">إدارة ملفات التأمين وحصص المساهمة</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500 p-8 rounded-[40px] text-white shadow-xl shadow-emerald-200">
                    <Icon name="shield-check" size={32} className="mb-4 opacity-50" />
                    <h4 className="text-sm font-black uppercase tracking-widest">مؤمن عليه</h4>
                    <p className="text-5xl font-black">{stats.insured}</p>
                </div>
                <div className="bg-rose-500 p-8 rounded-[40px] text-white shadow-xl shadow-rose-200">
                    <Icon name="shield-x" size={32} className="mb-4 opacity-50" />
                    <h4 className="text-sm font-black uppercase tracking-widest">غير مؤمن عليه</h4>
                    <p className="text-5xl font-black">{stats.notInsured}</p>
                </div>
                <div className="bg-amber-500 p-8 rounded-[40px] text-white shadow-xl shadow-amber-200">
                    <Icon name="clock" size={32} className="mb-4 opacity-50" />
                    <h4 className="text-sm font-black uppercase tracking-widest">جاري التنفيذ</h4>
                    <p className="text-5xl font-black">{stats.processing}</p>
                </div>
            </div>
            <div className="rounded-[40px] shadow-2xl overflow-hidden border bg-white border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-5">الكود</th>
                                <th className="px-6 py-5">الاسم</th>
                                <th className="px-4 py-5">الحالة</th>
                                <th className="px-4 py-5">الرقم التأميني</th>
                                <th className="px-4 py-5">تاريخ الاشتراك</th>
                                <th className="px-4 py-5">الأجر التأميني</th>
                                <th className="px-4 py-5">مكتب التأمينات</th>
                                <th className="px-4 py-5 text-center">النسبة (شركة/موظف)</th>
                                <th className="px-4 py-5 text-center no-print">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employees.map((emp: any) => {
                                const record = insuranceRecords[emp.id] || { status: 'غير مؤمن عليه' };
                                const isEditing = editingId === emp.id;
                                return (
                                    <tr key={emp.id} className="hover:bg-sky-500/5 transition-colors group">
                                        <td className="px-4 py-4 font-mono font-black text-sky-600">{emp.code}</td>
                                        <td className="px-6 py-4 font-black text-slate-800">{emp.name}</td>
                                        <td className="px-4 py-4">
                                            {isEditing ? (
                                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="bg-white border p-1 rounded font-bold text-xs">
                                                    <option value="مؤمن عليه">مؤمن عليه</option>
                                                    <option value="غير مؤمن عليه">غير مؤمن عليه</option>
                                                    <option value="جاري التنفيذ">جاري التنفيذ</option>
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                                                    record.status === 'مؤمن عليه' ? 'bg-emerald-100 text-emerald-600' :
                                                    record.status === 'جاري التنفيذ' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-rose-100 text-rose-600'
                                                }`}>{record.status}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">{isEditing ? <input type="text" className="w-24 p-1 border rounded text-xs font-mono" value={formData.insuranceNumber} onChange={e => setFormData({...formData, insuranceNumber: e.target.value})} /> : <span className="font-mono text-xs text-slate-500">{record.insuranceNumber || '---'}</span>}</td>
                                        <td className="px-4 py-4">{isEditing ? <input type="date" className="w-32 p-1 border rounded text-xs" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /> : <span className="font-mono text-[10px] text-slate-400">{record.startDate || '---'}</span>}</td>
                                        <td className="px-4 py-4">{isEditing ? <input type="number" className="w-20 p-1 border rounded text-xs font-bold" value={formData.insuranceSalary} onChange={e => setFormData({...formData, insuranceSalary: e.target.value})} /> : <span className="font-bold text-sky-700">{record.insuranceSalary ? `${record.insuranceSalary} ج.م` : '---'}</span>}</td>
                                        <td className="px-4 py-4">{isEditing ? <input type="text" className="w-28 p-1 border rounded text-xs" value={formData.insuranceOffice} onChange={e => setFormData({...formData, insuranceOffice: e.target.value})} /> : <span className="text-xs text-slate-500">{record.insuranceOffice || '---'}</span>}</td>
                                        <td className="px-4 py-4 text-center">{isEditing ? <div className="flex items-center gap-1 justify-center"><input type="text" className="w-10 p-1 border rounded text-[10px]" value={formData.ratioCompany} onChange={e => setFormData({...formData, ratioCompany: e.target.value})} /><span className="text-slate-300">/</span><input type="text" className="w-10 p-1 border rounded text-[10px]" value={formData.ratioEmployee} onChange={e => setFormData({...formData, ratioEmployee: e.target.value})} /></div> : <span className="text-[10px] font-bold text-slate-400">{record.ratioCompany || '18.75'}% / {record.ratioEmployee || '11'}%</span>}</td>
                                        <td className="px-4 py-4 text-center no-print">{isEditing ? <button onClick={() => saveRecord(emp.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"><Icon name="check" size={14} /></button> : <button onClick={() => startEditing(emp)} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-sky-500 hover:text-white transition-all"><Icon name="edit" size={14} /></button>}</td>
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
