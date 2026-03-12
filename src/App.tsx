import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { TopNav, Icon } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { EmployeeTable } from './pages/Employees';
import { Attendance } from './pages/Attendance';
import { Payroll } from './pages/Payroll';
import { Leaves } from './pages/Leaves';
import { Archive } from './pages/Archive';
import { Insurance } from './pages/Insurance';
import { Contracts } from './pages/Contracts';
import { Recruitment } from './pages/Recruitment';
import { Settings } from './pages/Settings';

const INITIAL_EMPLOYEES = [
    { id: '1', code: '101', name: 'أحمد محمد علي', jobTitle: 'مدير مبيعات', department: 'المبيعات', status: 'نشط', joinDate: '2023-01-15', totalLeaves: 21, monthlyLeaves: Array(12).fill(0), notes: '', nationalId: '29001011234567', phone: '01012345678', address: 'القاهرة - مدينة نصر' },
    { id: '2', code: '102', name: 'سارة محمود حسن', jobTitle: 'محاسب مالي', department: 'المالية', status: 'نشط', joinDate: '2023-03-10', totalLeaves: 30, monthlyLeaves: [1.5, 2, 0, 0.5, 0, 0, 0, 0, 0, 0, 0, 0], notes: 'مجتهدة جداً', nationalId: '29505021234568', phone: '01122334455', address: 'الجيزة - الدقي' },
];

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
    const [insuranceRecords, setInsuranceRecords] = useState({});
    const [contractRecords, setContractRecords] = useState({});
    const [attendanceLog, setAttendanceLog] = useState({});
    const [payrollRecords, setPayrollRecords] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const addEmployee = (d: any) => setEmployees([...employees, { ...d, id: Date.now().toString(), status: 'نشط', totalLeaves: 21, monthlyLeaves: Array(12).fill(0) }]);
    const bulkAddEmployees = (list: any[]) => setEmployees(p => [...p, ...list]);
    const updateEmployee = (u: any) => setEmployees(employees.map(e => e.id === u.id ? { ...e, ...u } : e));
    const deleteEmployee = (id: string) => setEmployees(employees.filter(e => e.id !== id));

    const handleRestore = (data: any) => {
        if (data.employees) setEmployees(data.employees);
        if (data.attendanceLog) setAttendanceLog(data.attendanceLog);
        if (data.insuranceRecords) setInsuranceRecords(data.insuranceRecords);
        if (data.contractRecords) setContractRecords(data.contractRecords);
        if (data.payrollRecords) setPayrollRecords(data.payrollRecords);
    };

    const formattedDate = currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 font-['Cairo']" dir="rtl">
                <div className="max-w-md w-full p-12 rounded-[60px] text-center border shadow-2xl bg-white border-slate-200">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl rotate-3">
                        <Icon name="user-circle-2" size={54} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">المنسق HR</h1>
                    <p className="text-slate-500 mb-10 font-bold uppercase tracking-widest text-xs">نظام إدارة الموارد البشرية المتكامل</p>
                    <form onSubmit={(e) => { 
                        e.preventDefault(); 
                        if(password === '2362001') {
                            setIsLoggedIn(true);
                        } else {
                            alert('كلمة السر غير صحيحة');
                        }
                    }} className="space-y-6">
                        <input required type="password" placeholder="كلمة السر" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-8 text-slate-800 text-center text-xl font-bold focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-xl">دخول النظام <Icon name="arrow-left" size={24} /></button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <div className="min-h-screen flex flex-col desktop-container px-6 py-8 font-['Cairo']" dir="rtl">
                <TopNav 
                    onLogout={() => setIsLoggedIn(false)} 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                />
                <main className="flex-1">
                    {activeTab === 'dashboard' ? (
                        <Dashboard setActiveTab={setActiveTab} userName="المدير" />
                    ) : activeTab === 'employees' ? (
                        <EmployeeTable employees={employees} onAddEmployee={addEmployee} onUpdateEmployee={updateEmployee} onDeleteEmployee={deleteEmployee} onBulkAdd={bulkAddEmployees} />
                    ) : activeTab === 'attendance' ? (
                        <Attendance employees={employees} attendanceLog={attendanceLog} setAttendanceLog={setAttendanceLog} />
                    ) : activeTab === 'payroll' ? (
                        <Payroll employees={employees} payrollRecords={payrollRecords} setPayrollRecords={setPayrollRecords} />
                    ) : activeTab === 'leaves' ? (
                        <Leaves employees={employees} onUpdateEmployee={updateEmployee} />
                    ) : activeTab === 'archive' ? (
                        <Archive employees={employees} />
                    ) : activeTab === 'insurance' ? (
                        <Insurance employees={employees} insuranceRecords={insuranceRecords} setInsuranceRecords={setInsuranceRecords} />
                    ) : activeTab === 'contracts' ? (
                        <Contracts employees={employees} contractRecords={contractRecords} setContractRecords={setContractRecords} />
                    ) : activeTab === 'recruitment' ? (
                        <Recruitment />
                    ) : activeTab === 'settings' ? (
                        <Settings appData={{ employees, attendanceLog, insuranceRecords, contractRecords, payrollRecords }} onRestore={handleRestore} />
                    ) : (
                        <div className="text-center py-40 text-slate-300 font-black text-4xl uppercase tracking-[0.2em] animate-pulse">سيتم التفعيل قريباً</div>
                    )}
                </main>
                <footer className="mt-12 mb-6 text-center no-print text-slate-500 font-bold text-[12px] uppercase tracking-wide">تطوير: عمر نشأت &copy; {new Date().getFullYear()}</footer>
            </div>
        </Router>
    );
}
