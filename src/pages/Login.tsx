import React, { useState } from 'react';
import { Button } from '../components/Layout';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    
    // Allow variations of 'نشأت' (with or without Hamza)
    const isValidUser = trimmedUser === 'عمر نشأت' || trimmedUser === 'عمر نشات';
    const isValidPass = trimmedPass === '1234' || trimmedPass === '١٢٣٤';

    if (isValidUser && isValidPass) {
      onLogin(trimmedUser);
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center relative overflow-hidden font-['Cairo']" dir="rtl">
      {/* Background Large Letters */}
      <div className="absolute inset-0 flex items-center justify-between pointer-events-none select-none overflow-hidden">
        <div className="absolute -left-[15%] top-1/2 -translate-y-1/2 text-[#2b59ff] opacity-[0.07] font-black text-[1000px] leading-none select-none">
          D
        </div>
        <div className="absolute -right-[15%] top-1/2 -translate-y-1/2 text-[#ff7a2b] opacity-[0.07] font-black text-[1000px] leading-none select-none">
          P
        </div>
      </div>

      <div className="w-full max-w-md px-8 py-12 relative z-10 flex flex-col items-center">
        {/* Logo Circle */}
        <div className="w-48 h-48 rounded-full bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)] mb-12 flex items-center justify-center relative">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3b66ff] to-[#f27121] flex items-center justify-center">
            <span className="text-7xl font-black text-white tracking-tighter">DP</span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-slate-700">
            مرحباً بك في نظام <span className="text-[#3b66ff]">Dynamic</span> <span className="text-[#f27121]">Plus</span>
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="relative">
            <input 
              type="text" 
              placeholder="اسم المستخدم" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-right font-bold text-slate-600 placeholder:text-slate-300"
              required
            />
          </div>
          <div className="relative">
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white border-none rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all text-right font-bold text-slate-600 placeholder:text-slate-300"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 mt-8 bg-gradient-to-r from-[#2b59ff] to-[#ff7a2b] text-white font-black text-xl rounded-2xl shadow-[0_10px_30px_rgba(43,89,255,0.3)] hover:shadow-[0_15px_40px_rgba(43,89,255,0.4)] transition-all active:scale-[0.98]"
          >
            تسجيل الدخول
          </button>
        </form>

        {/* Footer Text */}
        <p className="mt-12 text-slate-400 font-bold text-xs opacity-80">
          نظام إدارة الموارد البشرية المتطور
        </p>
      </div>
    </div>
  );
};
