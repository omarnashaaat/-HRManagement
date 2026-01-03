
import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, LogOut, Calendar, ArrowLeft,
  Users, Clock, CalendarDays, Banknote, FolderArchive, 
  ShieldCheck, FileText, BarChart3, Settings as SettingsIcon
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import EmployeeTable from './components/EmployeeTable';
import Insurance from './components/Insurance';
import Contracts from './components/Contracts';
import Archive from './components/Archive';
import Leaves from './components/Leaves';
import Attendance from './components/Attendance';
import Payroll from './components/Payroll';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { Employee, InsuranceRecord, ContractRecord, TabId, AttendanceLog } from './types';

const INITIAL_EMPLOYEES: Employee[] = [
  { 
    id: '1', code: '101', name: 'أحمد محمد علي', 
    jobTitle: 'مدير مبيعات', department: 'المبيعات', status: 'نشط', 
    gender: 'ذكر',
    joinDate: '2023-01-15',
    accruedBalance: 21, additionalBalance: 0,
    casualBalance: 6, casualUsed: 0,
    annualBalance: 15, annualUsed: 0,
    ordinaryBalance: 0, ordinaryUsed: 0,
    monthlyLeaves: Array(12).fill(0),
    notes: '',
    nationalId: '29001011234567', phone: '01012345678', address: 'القاهرة - مدينة نصر',
    baseSalary: 12000, allowances: 2000
  },
  { 
    id: '2', code: '102', name: 'سارة محمود حسن', 
    jobTitle: 'محاسب مالي', department: 'المالية', status: 'نشط', 
    gender: 'أنثى',
    joinDate: '2022-05-10',
    accruedBalance: 30, additionalBalance: 5,
    casualBalance: 6, casualUsed: 1,
    annualBalance: 24, annualUsed: 3,
    ordinaryBalance: 10, ordinaryUsed: 2,
    monthlyLeaves: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    notes: 'موظفة متميزة',
    nationalId: '29505021234568', phone: '01122334455', address: 'الجيزة - الدقي',
    baseSalary: 8500, allowances: 1000
  },
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [insuranceRecords, setInsuranceRecords] = useState<Record<string, InsuranceRecord>>({});
  const [contractRecords, setContractRecords] = useState<Record<string, ContractRecord>>({});
  const [attendanceLog, setAttendanceLog] = useState<AttendanceLog>({});
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('companyName') || '');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('companyName', companyName);
  }, [companyName]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addEmployee = (d: any) => {
    setEmployees([...employees, { 
      ...d, 
      id: Date.now().toString(),
      accruedBalance: 21, additionalBalance: 0,
      casualBalance: 6, casualUsed: 0,
      annualBalance: 15, annualUsed: 0,
      ordinaryBalance: 0, ordinaryUsed: 0,
      monthlyLeaves: Array(12).fill(0),
      notes: '',
      baseSalary: d.baseSalary || 5000,
      allowances: d.allowances || 0
    }]);
  };

  const updateEmployee = (u: Employee) => {
    setEmployees(employees.map(e => e.id === u.id ? { ...e, ...u } : e));
  };

  const deleteEmployee = (id: string) => {
    if(confirm('هل أنت متأكد من حذف الموظف؟')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleRestore = (data: any) => {
    if (data.employees) setEmployees(data.employees);
    if (data.attendanceLog) setAttendanceLog(data.attendanceLog);
    if (data.insuranceRecords) setInsuranceRecords(data.insuranceRecords);
    if (data.contractRecords) setContractRecords(data.contractRecords);
  };

  const formattedDate = currentTime.toLocaleDateString('ar-EG', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const formattedTime = currentTime.toLocaleTimeString('ar-EG', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit' 
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="max-w-md w-full p-12 rounded-[60px] text-center border shadow-2xl bg-white border-slate-200">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl rotate-3">
            <LayoutGrid size={54} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">المنسق HR</h1>
          <p className="text-slate-500 mb-10 font-bold uppercase tracking-widest text-xs">نظام إدارة الموارد البشرية المتكامل</p>
          <form onSubmit={(e) => { e.preventDefault(); if(userName.trim()) setIsLoggedIn(true); }} className="space-y-6">
            <input required type="text" placeholder="اسمك إيه؟" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 px-8 text-slate-800 text-center text-xl font-bold focus:outline-none" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-xl hover:bg-indigo-700 transition-all">دخول النظام <ArrowLeft size={24} /></button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} userName={userName} employees={employees} contractRecords={contractRecords} />;
      case 'employees': return <EmployeeTable employees={employees} onAddEmployee={addEmployee} onUpdateEmployee={updateEmployee} onDeleteEmployee={deleteEmployee} onBulkAdd={(list) => setEmployees(p => [...p, ...list])} />;
      case 'attendance': return <Attendance employees={employees} attendanceLog={attendanceLog} setAttendanceLog={setAttendanceLog} />;
      case 'leaves': return <Leaves employees={employees} onUpdateEmployee={updateEmployee} />;
      case 'insurance': return <Insurance employees={employees} insuranceRecords={insuranceRecords} setInsuranceRecords={setInsuranceRecords} />;
      case 'contracts': return <Contracts employees={employees} contractRecords={contractRecords} setContractRecords={setContractRecords} />;
      case 'payroll': return <Payroll employees={employees} attendanceLog={attendanceLog} insuranceRecords={insuranceRecords} onUpdateEmployee={updateEmployee} />;
      case 'reports': return <Reports employees={employees} />;
      case 'archive': return <Archive employees={employees} />;
      case 'settings': return <Settings companyName={companyName} setCompanyName={setCompanyName} appData={{ employees, attendanceLog, insuranceRecords, contractRecords }} onRestore={handleRestore} />;
      default: return <div className="text-center py-40 text-slate-300 font-black text-4xl uppercase tracking-[0.2em] animate-pulse">قريباً إن شاء الله</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col desktop-container px-6 py-8">
      <header className="glass-card rounded-[35px] py-4 px-10 flex items-center justify-between mb-10 no-print sticky top-4 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="p-3 rounded-2xl shadow-xl bg-slate-900 text-white"><LayoutGrid size={24} /></div>
          <div className="flex flex-col text-right">
             <span className="text-2xl font-black tracking-tighter hidden sm:block text-slate-800 leading-none">المنسق HR</span>
             {companyName && <span className="text-[10px] font-black text-indigo-500 hidden sm:block truncate max-w-[150px]">{companyName}</span>}
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center gap-2 px-4">
          <nav className="hidden xl:flex items-center gap-1">
            {[
              {id: 'dashboard', icon: LayoutGrid, label: 'لوحة التحكم'}, 
              {id: 'employees', icon: Users, label: 'الموظفين'}, 
              {id: 'attendance', icon: Clock, label: 'الحضور'},
              {id: 'payroll', icon: Banknote, label: 'الرواتب'},
              {id: 'reports', icon: BarChart3, label: 'التقارير'},
              {id: 'insurance', icon: ShieldCheck, label: 'التأمينات'}, 
              {id: 'contracts', icon: FileText, label: 'العقود'}, 
              {id: 'archive', icon: FolderArchive, label: 'الأرشيف'},
              {id: 'settings', icon: SettingsIcon, label: 'الإعدادات'}
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as TabId)} 
                className={`p-2.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-md scale-110' : 'text-slate-400 hover:bg-slate-100'}`}
                title={item.label}
              >
                <item.icon size={20} />
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100 shadow-inner group hover:bg-white transition-all">
            <div className="flex flex-col text-right leading-tight">
               <span className="text-[13px] font-bold text-slate-700">{formattedDate}</span>
               <span className="text-[11px] font-black text-indigo-600 font-mono">{formattedTime}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
              <Calendar size={18} />
            </div>
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="text-rose-500 hover:bg-rose-50 p-3 rounded-2xl transition-all" title="تسجيل خروج"><LogOut size={24} /></button>
        </div>
      </header>
      <main className="flex-1">{renderContent()}</main>
      <footer className="mt-12 mb-6 text-center no-print text-slate-400 font-bold text-[12px] uppercase tracking-widest">تطوير: عمر نشأت &copy; {new Date().getFullYear()}</footer>
    </div>
  );
};

export default App;
