import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, UserPlus, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { AppUser } from '../types/journal';
import { getStoredUsers, loginUser, registerNewUser } from '../services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('said');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const users = getStoredUsers();

  const handleSelectQuickUser = (u: AppUser) => {
    setUsername(u.username);
    setErrorMsg('');
    // Auto-fill friendly default password for 1-click convenience
    setPassword(u.password || '1234');
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const res = loginUser(username, password);
    if (res.success && res.user) {
      onSuccess(res.user);
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message || 'Kirishda xatolik yuz berdi');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = registerNewUser(regName, regUsername, regPassword);
    if (res.success && res.user) {
      onSuccess(res.user);
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header with Glowing Shield */}
        <div className="p-6 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-950">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 mb-3 shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Trading Journal By Said
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Xush kelibsiz! Savdo jurnalidan foydalanish uchun profilingizga kiring
          </p>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Quick Profile Cards */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Profilingizni tanlang:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {users.slice(0, 2).map((u) => {
                const isSelected = username.toLowerCase() === u.username.toLowerCase();
                const isSaid = u.username.toLowerCase() === 'said';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectQuickUser(u)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? isSaid
                          ? 'bg-emerald-950/50 border-emerald-500/80 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                          : 'bg-cyan-950/50 border-cyan-500/80 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSaid
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {u.avatar || u.name[0]}
                      </div>
                      {isSelected && <CheckCircle2 className={`w-4 h-4 ${isSaid ? 'text-emerald-400' : 'text-cyan-400'}`} />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block leading-tight">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                        @{u.username}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!showRegister ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Login (Foydalanuvchi nomi)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="said yoki shaxzod"
                    className="w-full bg-[#0b101b] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Parol
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Standart: 1234 yoki login2026
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolni kiriting..."
                    className="w-full bg-[#0b101b] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Tizimga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(true);
                    setErrorMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Boshqa yangi do‘stingiz bormi? Profil qo‘shish</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs">
                Yangi foydalanuvchi profilini yarating. U o‘zining shaxsiy hisoblariga ega bo‘ladi.
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Ism (To‘liq)
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="masalan: Diyorbek"
                  className="w-full bg-[#0b101b] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Login (Kichik harflarda)
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="masalan: diyor"
                  className="w-full bg-[#0b101b] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Yangi Parol
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Parol yarating..."
                  className="w-full bg-[#0b101b] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setErrorMsg('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/50"
                >
                  Profilni Yaratish
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-900 text-center text-[11px] text-slate-500">
            🔒 Har bir treydirning sdelkalari va statistikasi alohida saqlanadi.
          </div>

        </div>

      </div>
    </div>
  );
};
