import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Layout';

export const Attendance = ({ employees, attendanceLog, setAttendanceLog, saveAttendance, fetchAttendance }: any) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (selectedDate && !attendanceLog[selectedDate]) {
            fetchAttendance(selectedDate);
        }
    }, [selectedDate]);

    const calculateDeduction = (arrival: string, departure: string) => {
        let lateDeduction = 0;
        if (arrival) {
            const [h, m] = arrival.split(':').map(Number);
            const totalMinutes = h * 60 + m;
            const limit915 = 9 * 60 + 15;
            const limit930 = 9 * 60 + 30;
            const limit1000 = 10 * 60;
            const limit1030 = 10 * 60 + 30;
            const limit1200 = 12 * 60;

            if (totalMinutes <= limit915) lateDeduction = 0;
            else if (totalMinutes <= limit930) lateDeduction = 0.5;
            else if (totalMinutes <= limit1000) lateDeduction = 1;
            else if (totalMinutes <= limit1030) lateDeduction = 1.5;
            else if (totalMinutes <= limit1200) lateDeduction = 4;
            else lateDeduction = 8;
        }

        let earlyDeduction = 0;
        if (departure) {
            const [h, m] = departure.split(':').map(Number);
            const totalMinutes = h * 60 + m;
            const limit1700 = 17 * 60;
            const limit1645 = 16 * 60 + 45;
            const limit1600 = 16 * 60;
            const limit1530 = 15 * 60 + 30;
            const limit1500 = 15 * 60;
            const limit1400 = 14 * 60;

            if (totalMinutes >= limit1700) earlyDeduction = 0;
            else if (totalMinutes >= limit1645) earlyDeduction = 0.5;
            else if (totalMinutes >= limit1600) earlyDeduction = 1;
            else if (totalMinutes >= limit1530) earlyDeduction = 1.5;
            else if (totalMinutes >= limit1500) earlyDeduction = 2;
            else if (totalMinutes >= limit1400) earlyDeduction = 4;
            else earlyDeduction = 8;
        }
        return lateDeduction + earlyDeduction;
    };

    const updateRecord = (empId: string, field: string, value: any) => {
        const dateRecords = attendanceLog[selectedDate] || {};
        const currentRecord = dateRecords[empId] || { arrivalTime: '', departureTime: '', deduction: 0, lateDeduction: 0, earlyDeduction: 0, shift: '', notes: '' };
        const newRecord = { ...currentRecord, [field]: value };
        
        if (field === 'lateDeduction' || field === 'earlyDeduction') {
            newRecord.deduction = (parseFloat(newRecord.lateDeduction) || 0) + (parseFloat(newRecord.earlyDeduction) || 0);
        }

        setAttendanceLog((prev: any) => ({
            ...prev,
            [selectedDate]: { ...dateRecords, [empId]: newRecord }
        }));

        // Sync with backend
        saveAttendance(empId, selectedDate, newRecord);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Icon name="clock" className="text-blue-600" size={32} /> الحضور والانصراف اليومي
                    </h2>
                    <p className="text-slate-500 font-bold">تسجيل المواعيد وتطبيق اللائحة</p>
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-xl">
                        <Icon name="info" size={16} className="text-blue-600" />
                        <span className="text-xs font-black text-blue-700">دورة الشهر: من يوم 26 حتى يوم 25 من الشهر التالي</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <Icon name="calendar" className="text-slate-400" size={20} />
                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="outline-none font-bold text-slate-700 bg-transparent" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl">
                        <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Icon name="info" size={20} /> لائحة التأخير</h3>
                        <ul className="space-y-2 text-xs font-bold opacity-90">
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>حتى 09:15 ص</span> <span>سماح</span></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>حتى 09:30 ص</span> <span>0.5 س</span></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>حتى 10:00 ص</span> <span>1 س</span></li>
                            <li className="flex justify-between"><span>بعد 12:00 م</span> <span>8 س</span></li>
                        </ul>
                    </div>
                    <div className="bg-slate-800 rounded-[40px] p-8 text-white shadow-xl">
                        <h3 className="font-black text-lg mb-4 flex items-center gap-2"><Icon name="alert-circle" size={20} /> انصراف مبكر</h3>
                        <ul className="space-y-2 text-xs font-bold opacity-90">
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>من 05:00 م</span> <span>طبيعي</span></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>04:45 م</span> <span>0.5 س</span></li>
                            <li className="flex justify-between border-b border-white/20 pb-1"><span>04:00 م</span> <span>1 س</span></li>
                            <li className="flex justify-between"><span>02:00 م</span> <span>4 س</span></li>
                        </ul>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <div className="rounded-[40px] shadow-2xl overflow-hidden border bg-white border-slate-100">
                        <table className="w-full text-right">
                            <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase border-b">
                                <tr>
                                    <th className="px-6 py-5">الموظف</th>
                                    <th className="px-4 py-5">الوردية</th>
                                    <th className="px-4 py-5">حضور</th>
                                    <th className="px-4 py-5">انصراف</th>
                                    <th className="px-4 py-5 text-center">تأخير (س)</th>
                                    <th className="px-4 py-5 text-center">مبكر (س)</th>
                                    <th className="px-4 py-5 text-center">إجمالي الخصم</th>
                                    <th className="px-4 py-5">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {employees.map((emp: any) => {
                                    const record = (attendanceLog[selectedDate] && attendanceLog[selectedDate][emp.id]) || { arrivalTime: '', departureTime: '', deduction: 0, lateDeduction: 0, earlyDeduction: 0, shift: '', notes: '' };
                                    return (
                                        <tr key={emp.id} className="hover:bg-blue-50/30">
                                            <td className="px-6 py-4">
                                                <span className="font-black block">{emp.name}</span>
                                                <span className="text-[10px] text-slate-400">كود: {emp.code}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="الوردية"
                                                    value={record.shift || ''} 
                                                    onChange={(e) => updateRecord(emp.id, 'shift', e.target.value)} 
                                                    className="w-20 bg-slate-50 p-2 rounded-xl text-xs font-bold border border-slate-100" 
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input type="time" value={record.arrivalTime} onChange={(e) => updateRecord(emp.id, 'arrivalTime', e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold border border-slate-100" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <input type="time" value={record.departureTime} onChange={(e) => updateRecord(emp.id, 'departureTime', e.target.value)} className="bg-slate-50 p-2 rounded-xl text-xs font-bold border border-slate-100" />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input 
                                                    type="number" 
                                                    step="0.5"
                                                    value={record.lateDeduction || 0} 
                                                    onChange={(e) => updateRecord(emp.id, 'lateDeduction', e.target.value)} 
                                                    className="w-16 bg-slate-50 p-2 rounded-xl text-xs font-bold border border-slate-100 text-center" 
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <input 
                                                    type="number" 
                                                    step="0.5"
                                                    value={record.earlyDeduction || 0} 
                                                    onChange={(e) => updateRecord(emp.id, 'earlyDeduction', e.target.value)} 
                                                    className="w-16 bg-slate-50 p-2 rounded-xl text-xs font-bold border border-slate-100 text-center" 
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-4 py-2 rounded-full font-black text-xs ${record.deduction > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {record.deduction} س
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <input type="text" value={record.notes} onChange={(e) => updateRecord(emp.id, 'notes', e.target.value)} className="w-full bg-transparent border-b text-xs" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
