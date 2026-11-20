import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AppUser } from '../types/journal';
import { getStoredUsers, loginUser } from '../services/auth';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [selectedUsername, setSelectedUsername] = useState<'said' | 'shaxzod' | string>('said');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const users = getStoredUsers();

  const handleSelectUser = (u: AppUser) => {
    setSelectedUsername(u.username);
    setErrorMsg('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = loginUser(selectedUsername, password);
      setIsLoading(false);

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Login yoki parol noto‘g‘ri kiritildi');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300 font-sans relative overflow-hidden">
      
      {/* Background ambient glow circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Brand Bar */}
      <header className="p-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Trading Journal By Said <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-semibold">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Professional Savdo Jurnali va Intizom Nazoratchisi
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloud Supabase Online</span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-[#0b101b] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Tizimga Kirish
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Savdo jurnalingizga kirish uchun profilingizni tanlang:
            </p>
          </div>

          {/* User Selection Profile Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {users.slice(0, 2).map((u) => {
              const isSelected = selectedUsername.toLowerCase() === u.username.toLowerCase();
              const isSaid = u.username.toLowerCase() === 'said';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? isSaid
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                        : 'bg-cyan-950/60 border-cyan-500 shadow-xl shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSaid
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    }`}>
                      {u.avatar || u.name[0]}
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className={`w-5 h-5 ${isSaid ? 'text-emerald-400' : 'text-cyan-400'}`} />
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-slate-700" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block leading-tight">
                      {u.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                      {isSaid ? 'Asosiy hisob (Owner)' : 'Do‘st (Treydir)'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Foydalanuvchi logini:
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  placeholder="said yoki shaxzod"
                  className="w-full bg-[#131b2e] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Parol:
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedUsername === 'shaxzod' ? 'shaxzod2026 yoki 1234' : 'said2026 yoki 1234'}
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting..."
                  className="w-full bg-[#131b2e] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Kirilmoqda...</span>
              ) : (
                <>
                  <span>Kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Explanatory Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Alohida Mustaqil Savdo Jurnallari</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Saida'lo</strong> kirganda barcha 116 ta sdelkalar ochiladi. <br />
              <strong>Shaxzod</strong> kirganda esa unga yangi toza hisob ochiladi va u o‘z sdelkalarini kiritadi.
            </p>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="p-4 text-center text-xs text-slate-600">
        © 2026 Trading Journal By Said. Barcha huquqlar himoyalangan.
      </footer>

    </div>
  );
};
