import React, { useState } from 'react';
import { Icon } from '../components/Layout';

const SettlementModal = ({ emp, month, record, onSave, onClose }: any) => {
    const [settlements, setSettlements] = useState(record.settlements || []);
    
    const addItem = (suggestedTitle = '') => {
        setSettlements([...settlements, { id: Date.now(), title: suggestedTitle, amount: 0, type: 'addition' }]);
    };

    const updateItem = (id: number, field: string, value: any) => {
        setSettlements(settlements.map((s: any) => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeItem = (id: number) => {
        setSettlements(settlements.filter((s: any) => s.id !== id));
    };

    const handleSave = () => {
        const totalAdd = settlements.filter((s: any) => s.type === 'addition').reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
        const totalDed = settlements.filter((s: any) => s.type === 'deduction').reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
        onSave({ settlements, adjAddition: totalAdd, adjDeduction: totalDed });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden animate-fade-in border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">إدارة تسويات الموظف</h3>
                        <p className="text-slate-500 font-bold text-sm">{emp.name} - شهر {month}</p>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors">
                        <Icon name="x" size={24} />
                    </button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                    <div className="flex gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-400 w-full mb-1">تسويات سريعة:</span>
                        {['زيادة مرتب', 'مكافأة تميز', 'بدل سكن', 'تسوية فروقات', 'ساعات إضافية', 'خصم غياب', 'سلفة'].map(label => (
                            <button 
                                key={label} 
                                onClick={() => addItem(label)}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                + {label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {settlements.length === 0 ? (
                            <div className="text-center py-10 text-slate-300 font-bold italic">لا توجد تسويات مسجلة لهذا الشهر</div>
                        ) : (
                            settlements.map((s: any) => (
                                <div key={s.id} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center animate-fade-in">
                                    <select 
                                        value={s.type} 
                                        onChange={(e) => updateItem(s.id, 'type', e.target.value)}
                                        className={`w-full md:w-32 p-2 rounded-xl font-black text-xs outline-none border transition-colors ${s.type === 'addition' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
                                    >
                                        <option value="addition">إضافة (+)</option>
                                        <option value="deduction">خصم (-)</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        placeholder="وصف التسوية..."
                                        className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-sm outline-none font-bold"
                                        value={s.title}
                                        onChange={(e) => updateItem(s.id, 'title', e.target.value)}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="القيمة"
                                        className="w-full md:w-28 p-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-center outline-none"
                                        value={s.amount || ''}
                                        onChange={(e) => updateItem(s.id, 'amount', e.target.value)}
                                    />
                                    <button onClick={() => removeItem(s.id)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors">
                                        <Icon name="trash-2" size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <button 
                        onClick={() => addItem()}
                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all"
                    >
                        <Icon name="plus-circle" size={20} /> إضافة تسوية مخصصة
                    </button>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button onClick={handleSave} className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all">حفظ التسويات</button>
                    <button onClick={onClose} className="px-8 bg-white text-slate-500 font-black py-4 rounded-2xl border border-slate-200">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

const PayslipModal = ({ emp, month, record, onClose }: any) => {
    const calculateTotals = (r: any) => {
        const additions = (r.grossSalary || 0) + (r.adjAddition || 0);
        const deductions = (r.leaveVal || 0) + (r.penaltyVal || 0) + (r.absenceVal || 0) + (r.lateVal || 0) + (r.advanceInstallment || 0) + (r.adjDeduction || 0);
        return { additions, deductions, net: additions - deductions };
    };
    const { additions, deductions, net } = calculateTotals(record || {});

    const handlePrintSlip = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-fade-in border border-slate-200">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center no-print">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Icon name="file-text" size={24} className="text-indigo-600"/> معاينة كشف الراتب</h3>
                    <div className="flex gap-2">
                        <button onClick={handlePrintSlip} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg"><Icon name="printer" size={18}/> طباعة / PDF</button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"><Icon name="x" size={24}/></button>
                    </div>
                </div>

                <div className="p-10 payslip-box">
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                        <div className="text-right">
                            <h1 className="text-2xl font-black text-slate-900">إشعار صرف راتب</h1>
                            <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-xs">Payroll Advice Notice</p>
                        </div>
                        <div className="text-left font-bold text-sm">
                            <p>الفترة: {month}</p>
                            <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        <div className="space-y-2">
                            <p className="flex justify-between border-b pb-1 font-bold"><span>اسم الموظف:</span> <span>{emp.name}</span></p>
                            <p className="flex justify-between border-b pb-1"><span>الكود الوظيفي:</span> <span className="font-mono">{emp.code}</span></p>
                            <p className="flex justify-between border-b pb-1"><span>الوظيفة:</span> <span>{emp.jobTitle}</span></p>
                        </div>
                        <div className="space-y-2">
                            <p className="flex justify-between border-b pb-1"><span>الإدارة:</span> <span>{emp.department}</span></p>
                            <p className="flex justify-between border-b pb-1"><span>تاريخ التعيين:</span> <span className="font-mono">{emp.joinDate}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <h4 className="bg-slate-100 p-2 font-black text-center text-xs mb-3 border border-slate-200">المستحقات (+)</h4>
                            <div className="space-y-2 text-xs">
                                <p className="flex justify-between border-b pb-1"><span>الراتب الأساسي:</span> <span className="font-bold">{record.basicSalary?.toLocaleString() || '0'}</span></p>
                                {record.mobileAllowance > 0 && <p className="flex justify-between border-b pb-1"><span>بدل هاتف:</span> <span className="font-bold">{record.mobileAllowance.toLocaleString()}</span></p>}
                                {record.transportAllowance > 0 && <p className="flex justify-between border-b pb-1"><span>بدل مواصلات:</span> <span className="font-bold">{record.transportAllowance.toLocaleString()}</span></p>}
                                {record.overtimeAllowance > 0 && <p className="flex justify-between border-b pb-1"><span>بدل سهر:</span> <span className="font-bold">{record.overtimeAllowance.toLocaleString()}</span></p>}
                                {record.settlements?.filter((s: any) => s.type === 'addition').map((s: any) => (
                                    <p key={s.id} className="flex justify-between border-b pb-1"><span>{s.title || 'تسوية إضافية'}:</span> <span className="font-bold text-emerald-600">+{parseFloat(s.amount).toLocaleString()}</span></p>
                                ))}
                                <p className="flex justify-between pt-2 font-black text-sm text-indigo-700"><span>إجمالي المستحقات:</span> <span>{additions.toLocaleString()}</span></p>
                            </div>
                        </div>
                        <div>
                            <h4 className="bg-slate-100 p-2 font-black text-center text-xs mb-3 border border-slate-200">الاستقطاعات (-)</h4>
                            <div className="space-y-2 text-xs">
                                {record.leaveVal > 0 && <p className="flex justify-between border-b pb-1"><span>أجازات ({record.leaveCount} يوم):</span> <span className="text-rose-600">-{Math.round(record.leaveVal).toLocaleString()}</span></p>}
                                {record.penaltyVal > 0 && <p className="flex justify-between border-b pb-1"><span>جزاءات ({record.penaltyCount} يوم):</span> <span className="text-rose-600">-{record.penaltyVal.toLocaleString()}</span></p>}
                                {record.lateVal > 0 && <p className="flex justify-between border-b pb-1"><span>تأخيرات ({record.lateCount} ساعة):</span> <span className="text-rose-600">-{Math.round(record.lateVal).toLocaleString()}</span></p>}
                                {record.advanceInstallment > 0 && <p className="flex justify-between border-b pb-1"><span>قسط سلفة:</span> <span className="text-rose-600">-{record.advanceInstallment.toLocaleString()}</span></p>}
                                {record.settlements?.filter((s: any) => s.type === 'deduction').map((s: any) => (
                                    <p key={s.id} className="flex justify-between border-b pb-1"><span>{s.title || 'تسوية خصم'}:</span> <span className="text-rose-600">-{parseFloat(s.amount).toLocaleString()}</span></p>
                                ))}
                                <p className="flex justify-between pt-2 font-black text-sm text-rose-700"><span>إجمالي الاستقطاع:</span> <span>{deductions.toLocaleString()}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 bg-slate-900 text-white p-6 flex justify-between items-center rounded-2xl">
                        <span className="text-lg font-black uppercase tracking-widest">صافي الراتب المستحق</span>
                        <span className="text-3xl font-black">{Math.round(net).toLocaleString()} ج.م</span>
                    </div>

                    <div className="mt-12 flex justify-between text-[10px] font-bold text-slate-400 border-t pt-4">
                        <span>توقيع الموظف: ................................</span>
                        <span>توقيع المحاسب: ................................</span>
                        <span>توقيع الإدارة: ................................</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Payroll = ({ employees, payrollRecords, setPayrollRecords }: any) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
    const [settlementTarget, setSettlementTarget] = useState<any>(null);
    const [payslipTarget, setPayslipTarget] = useState<any>(null);

    const handlePrint = () => {
        window.print();
    };

    const updateField = (empId: string, field: string, value: any) => {
        const monthRecords = payrollRecords[selectedMonth] || {};
        const current = monthRecords[empId] || {
            basicSalary: 0,
            mobileAllowance: 0,
            transportAllowance: 0,
            overtimeAllowance: 0,
            grossSalary: 0,
            leaveCount: 0, leaveVal: 0,
            penaltyCount: 0, penaltyVal: 0,
            absenceCount: 0, absenceVal: 0,
            lateCount: 0, lateVal: 0,
            advanceInstallment: 0, advanceTotal: 0,
            adjDeduction: 0, adjAddition: 0,
            settlements: []
        };
        
        const updated = { ...current, [field]: value };
        
        if (field !== 'settlements') {
            const numVal = parseFloat(value) || 0;
            updated[field] = numVal;
            
            // Recalculate Gross Salary if any component changes
            if (['basicSalary', 'mobileAllowance', 'transportAllowance', 'overtimeAllowance'].includes(field)) {
                updated.grossSalary = (updated.basicSalary || 0) + (updated.mobileAllowance || 0) + (updated.transportAllowance || 0) + (updated.overtimeAllowance || 0);
            }

            const dayRate = (updated.grossSalary || 0) / 30;
            if (field === 'leaveCount' || field === 'basicSalary' || field === 'mobileAllowance' || field === 'transportAllowance' || field === 'overtimeAllowance') updated.leaveVal = (updated.leaveCount || 0) * dayRate;
            if (field === 'absenceCount' || field === 'basicSalary' || field === 'mobileAllowance' || field === 'transportAllowance' || field === 'overtimeAllowance') updated.absenceVal = (updated.absenceCount || 0) * dayRate;
            if (field === 'lateCount' || field === 'basicSalary' || field === 'mobileAllowance' || field === 'transportAllowance' || field === 'overtimeAllowance') updated.lateVal = (updated.lateCount || 0) * (dayRate / 8);
        }

        setPayrollRecords((prev: any) => ({
            ...prev,
            [selectedMonth]: { ...monthRecords, [empId]: updated }
        }));
    };

    const calculateTotals = (record: any) => {
        const r = record || {};
        const totalDeductions = (r.leaveVal || 0) + (r.penaltyVal || 0) + (r.absenceVal || 0) + (r.lateVal || 0) + (r.advanceInstallment || 0) + (r.adjDeduction || 0);
        const netSalary = (r.grossSalary || 0) + (r.adjAddition || 0) - totalDeductions;
        return { totalDeductions, netSalary };
    };

    const handleSaveSettlements = (data: any) => {
        updateField(settlementTarget.emp.id, 'settlements', data.settlements);
        updateField(settlementTarget.emp.id, 'adjAddition', data.adjAddition);
        updateField(settlementTarget.emp.id, 'adjDeduction', data.adjDeduction);
        setSettlementTarget(null);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {settlementTarget && (
                <SettlementModal 
                    emp={settlementTarget.emp} 
                    month={selectedMonth} 
                    record={settlementTarget.record} 
                    onSave={handleSaveSettlements}
                    onClose={() => setSettlementTarget(null)}
                />
            )}

            {payslipTarget && (
                <PayslipModal 
                    emp={payslipTarget.emp}
                    month={selectedMonth}
                    record={payslipTarget.record}
                    onClose={() => setPayslipTarget(null)}
                />
            )}
            
            <div className="print-only mb-6 text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-xl font-black mb-1">كشف رواتب الموظفين الشهري</h1>
                <p className="text-base font-bold">لشهر: {selectedMonth}</p>
                <div className="flex justify-between items-end mt-2 text-xs font-bold">
                    <span>اسم المنشأة: .................................</span>
                    <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Icon name="banknote" className="text-emerald-600" size={32} /> كشف الرواتب الشهري
                    </h2>
                    <p className="text-slate-500 font-bold tracking-wide text-xs">إدارة المستحقات، الاستقطاعات، والتسويات المالية لكل موظف</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all"
                    >
                        <Icon name="printer" size={18} /> طباعة الكشف الكامل
                    </button>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <Icon name="calendar-range" className="text-slate-400" size={20} />
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="outline-none font-bold text-slate-700 bg-transparent" />
                    </div>
                </div>
            </div>

            <div className="rounded-[30px] shadow-2xl overflow-hidden border bg-white border-slate-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-center payroll-table border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-700 font-black">
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100">م</th>
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100 min-w-[30px]">الكود</th>
                                <th rowSpan={2} className="px-2 py-2 bg-slate-100 min-w-[140px] text-right">اسم الموظف</th>
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100 min-w-[60px]">الراتب الأساسي</th>
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100 min-w-[60px]">بدل هاتف</th>
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100 min-w-[60px]">بدل مواصلات</th>
                                <th rowSpan={2} className="px-1 py-2 bg-slate-100 min-w-[60px]">بدل سهر</th>
                                <th rowSpan={2} className="px-2 py-2 bg-slate-100 min-w-[70px]">الراتب الإجمالي</th>
                                <th colSpan={2} className="bg-yellow-400 text-white">الأجازة بخصم</th>
                                <th colSpan={2} className="bg-rose-600 text-white">الجزاءات</th>
                                <th colSpan={2} className="bg-orange-500 text-white">الغياب</th>
                                <th colSpan={2} className="bg-sky-500 text-white">التأخير</th>
                                <th colSpan={2} className="bg-emerald-500 text-white">السُلف</th>
                                <th colSpan={2} className="bg-indigo-500 text-white">التسويات الشهرية</th>
                                <th rowSpan={2} className="px-2 py-2 bg-rose-50 text-rose-700 min-w-[70px]">إجمالي استقطاع</th>
                                <th rowSpan={2} className="px-2 py-2 bg-emerald-50 text-emerald-700 font-black text-xs min-w-[80px]">صافي الراتب</th>
                                <th rowSpan={2} className="px-2 py-2 bg-slate-50 no-print min-w-[60px]">إجراءات</th>
                            </tr>
                            <tr className="bg-slate-50 text-slate-600 font-bold">
                                <th className="bg-yellow-100">عدد</th><th className="bg-yellow-100">قيمة</th>
                                <th className="bg-rose-100">عدد</th><th className="bg-rose-100">قيمة</th>
                                <th className="bg-orange-100">عدد</th><th className="bg-orange-100">قيمة</th>
                                <th className="bg-sky-100">عدد</th><th className="bg-sky-100">قيمة</th>
                                <th className="bg-emerald-100">قسط</th><th className="bg-emerald-100">إجمالي</th>
                                <th className="bg-indigo-100">خصم (-)</th><th className="bg-indigo-100">إضافة (+)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {employees.map((emp: any, i: number) => {
                                const record = (payrollRecords[selectedMonth] && payrollRecords[selectedMonth][emp.id]) || { settlements: [] };
                                const { totalDeductions, netSalary } = calculateTotals(record);
                                return (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-1 py-2 font-bold text-slate-400">{i + 1}</td>
                                        <td className="px-1 py-2 font-mono font-black text-indigo-600">{emp.code}</td>
                                        <td className="px-2 py-2 text-right font-black text-slate-800">
                                            <div className="flex justify-between items-center gap-1">
                                                <span>{emp.name}</span>
                                                <button 
                                                    onClick={() => setSettlementTarget({ emp, record })}
                                                    className="no-print p-1 text-indigo-400 hover:text-indigo-600 transition-colors"
                                                    title="إضافة تسوية مالية"
                                                >
                                                    <Icon name="plus-square" size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-1 py-1"><input type="number" value={record.basicSalary || ''} onChange={e => updateField(emp.id, 'basicSalary', e.target.value)} className="w-full text-center bg-transparent focus:bg-white outline-none" /></td>
                                        <td className="px-1 py-1"><input type="number" value={record.mobileAllowance || ''} onChange={e => updateField(emp.id, 'mobileAllowance', e.target.value)} className="w-full text-center bg-transparent focus:bg-white outline-none" /></td>
                                        <td className="px-1 py-1"><input type="number" value={record.transportAllowance || ''} onChange={e => updateField(emp.id, 'transportAllowance', e.target.value)} className="w-full text-center bg-transparent focus:bg-white outline-none" /></td>
                                        <td className="px-1 py-1"><input type="number" value={record.overtimeAllowance || ''} onChange={e => updateField(emp.id, 'overtimeAllowance', e.target.value)} className="w-full text-center bg-transparent focus:bg-white outline-none" /></td>
                                        <td className="px-1 py-1 bg-slate-50"><input type="number" value={record.grossSalary || ''} readOnly className="w-full text-center bg-transparent outline-none font-bold cursor-default" /></td>
                                        
                                        <td className="px-1 py-1 bg-yellow-50/30"><input type="number" value={record.leaveCount || ''} onChange={e => updateField(emp.id, 'leaveCount', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        <td className="px-1 py-1 bg-yellow-50/30 font-bold"><input type="number" value={Math.round(record.leaveVal) || ''} onChange={e => updateField(emp.id, 'leaveVal', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        
                                        <td className="px-1 py-1 bg-rose-50/30"><input type="number" value={record.penaltyCount || ''} onChange={e => updateField(emp.id, 'penaltyCount', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        <td className="px-1 py-1 bg-rose-50/30 font-bold"><input type="number" value={record.penaltyVal || ''} onChange={e => updateField(emp.id, 'penaltyVal', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        
                                        <td className="px-1 py-1 bg-orange-50/30"><input type="number" value={record.absenceCount || ''} onChange={e => updateField(emp.id, 'absenceCount', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        <td className="px-1 py-1 bg-orange-50/30 font-bold"><input type="number" value={Math.round(record.absenceVal) || ''} onChange={e => updateField(emp.id, 'absenceVal', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        
                                        <td className="px-1 py-1 bg-sky-50/30"><input type="number" value={record.lateCount || ''} onChange={e => updateField(emp.id, 'lateCount', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        <td className="px-1 py-1 bg-sky-50/30 font-bold"><input type="number" value={Math.round(record.lateVal) || ''} onChange={e => updateField(emp.id, 'lateVal', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        
                                        <td className="px-1 py-1 bg-emerald-50/30"><input type="number" value={record.advanceInstallment || ''} onChange={e => updateField(emp.id, 'advanceInstallment', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        <td className="px-1 py-1 bg-emerald-50/30 font-bold"><input type="number" value={record.advanceTotal || ''} onChange={e => updateField(emp.id, 'advanceTotal', e.target.value)} className="w-full text-center bg-transparent outline-none" /></td>
                                        
                                        <td className="px-1 py-1 bg-indigo-50/50">
                                            <div className="flex flex-col items-center">
                                                <input type="number" value={record.adjDeduction || ''} readOnly className="w-full text-center bg-transparent outline-none text-rose-600 font-bold cursor-default" />
                                                {record.settlements?.filter((s: any) => s.type === 'deduction').length > 0 && <span className="text-[7px] text-slate-400 no-print">({record.settlements.filter((s: any) => s.type === 'deduction').length}) تفاصيل</span>}
                                            </div>
                                        </td>
                                        <td className="px-1 py-1 bg-indigo-50/50">
                                            <div className="flex flex-col items-center">
                                                <input type="number" value={record.adjAddition || ''} readOnly className="w-full text-center bg-transparent outline-none text-emerald-600 font-bold cursor-default" />
                                                {record.settlements?.filter((s: any) => s.type === 'addition').length > 0 && <span className="text-[7px] text-slate-400 no-print">({record.settlements.filter((s: any) => s.type === 'addition').length}) تفاصيل</span>}
                                            </div>
                                        </td>

                                        <td className="px-1 py-2 bg-rose-50 font-black text-rose-600">{Math.round(totalDeductions).toLocaleString()}</td>
                                        <td className="px-1 py-2 bg-emerald-50 font-black text-emerald-700 text-xs shadow-inner">{Math.round(netSalary).toLocaleString()}</td>
                                        <td className="px-1 py-2 no-print">
                                            <button 
                                                onClick={() => setPayslipTarget({ emp, record })}
                                                className="p-2 text-indigo-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                                                title="كشف راتب منفصل"
                                            >
                                                <Icon name="file-text" size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="print-only mt-10 print-signatures font-black text-sm">
                <div className="flex flex-col items-center">
                    <div className="border-t-2 border-slate-900 w-full pt-3">مدير حسابات</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t-2 border-slate-900 w-full pt-3">مدير الموارد البشرية</div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="border-t-2 border-slate-900 w-full pt-3">المدير التنفيذى</div>
                </div>
            </div>
        </div>
    );
};
