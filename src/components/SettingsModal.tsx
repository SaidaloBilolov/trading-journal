import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  Shield, 
  ListChecks, 
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { ChecklistItem, UserSettings } from '../types/journal';
import { testSupabaseConnection } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  checklistItems: ChecklistItem[];
  onSaveSettings: (newSettings: UserSettings) => void;
  onSaveChecklistItems: (newItems: ChecklistItem[]) => void;
  onResetDemo: () => void;
}

const SUPABASE_SQL_SCRIPT = `-- SUPABASE SQL SCHEMA: Trading Journal & Intizom Qalqoni
CREATE TABLE IF NOT EXISTS public.sdelkalar (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT DEFAULT '12:00',
    instrument TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
    quantity NUMERIC DEFAULT 1,
    entry_price NUMERIC NOT NULL,
    stop_loss NUMERIC NOT NULL,
    exit_price NUMERIC NOT NULL,
    gross_pnl NUMERIC DEFAULT 0,
    commission NUMERIC DEFAULT 0,
    net_pnl NUMERIC DEFAULT 0,
    duration TEXT DEFAULT '0m',
    checklist_score INTEGER DEFAULT 0,
    checklist_total INTEGER DEFAULT 5,
    discipline TEXT DEFAULT 'PARTIAL',
    session_sweep BOOLEAN DEFAULT false,
    mental_state TEXT DEFAULT 'Xotirjam',
    notes TEXT,
    chart_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sozlamalar (
    id TEXT PRIMARY KEY DEFAULT 'user_settings',
    initial_balance NUMERIC DEFAULT 50000,
    max_drawdown_limit NUMERIC DEFAULT 48000,
    max_daily_loss NUMERIC DEFAULT 300,
    max_daily_trades INTEGER DEFAULT 3,
    risk_per_trade NUMERIC DEFAULT 45,
    min_checklist_score INTEGER DEFAULT 4,
    require_session_sweep BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sdelkalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sozlamalar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barchaga sdelkalarni o‘qish va yozish ruxsati" ON public.sdelkalar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga sozlamalarni o‘qish va yozish ruxsati" ON public.sozlamalar FOR ALL USING (true) WITH CHECK (true);
`;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  checklistItems,
  onSaveSettings,
  onSaveChecklistItems,
  onResetDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'checklist' | 'supabase'>('risk');
  const [formSettings, setFormSettings] = useState<UserSettings>({ ...settings });
  const [items, setItems] = useState<ChecklistItem[]>([...checklistItems]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDesc, setNewChecklistDesc] = useState('');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(formSettings.supabase_url, formSettings.supabase_anon_key);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      title: newChecklistTitle.trim(),
      description: newChecklistDesc.trim() || 'Foydalanuvchi maxsus sharti',
      is_mandatory: false,
      enabled: true,
    };
    setItems([...items, newItem]);
    setNewChecklistTitle('');
    setNewChecklistDesc('');
  };

  const handleToggleItemEnabled = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it)));
  };

  const handleDeleteItem = (id: string) => {
    if (id === 'session-sweep') {
      alert('Sessiya Sweep asosiy shart bo‘lgani uchun uni o‘chirib bo‘lmaydi!');
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  const handleSave = () => {
    onSaveSettings(formSettings);
    onSaveChecklistItems(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 z-10">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Dastur va Hisob Sozlamalari</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Risk parametrlari, Pre-Trade checklist va Supabase ulanishi
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2">
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'risk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Balans & Risk</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Checklist Shartlari</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Ulanishi</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: Balans va Risk */}
          {activeTab === 'risk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Boshlang‘ich Balans ($)
                  </label>
                  <input
                    type="number"
                    value={formSettings.initial_balance}
                    onChange={(e) => setFormSettings({ ...formSettings, initial_balance: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Standart: $50,000 (prop/futures hisob)</span>
                </div>

                <div>
                  <label className="text-xs text-rose-400 block mb-1.5 font-medium">
                    Maksimal Drawdown / Sliv Chegarasi ($)
                  </label>
                  <input
                    type="number"
                    value={formSettings.max_drawdown_limit}
                    onChange={(e) => setFormSettings({ ...formSettings, max_drawdown_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-rose-300 focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Ushbu narxdan pastga tushsa qat’iy qizil ogohlantirish beriladi</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Kunlik Maksimal Zarar Limiti ($)
                  </label>
                  <input
                    type="number"
                    value={formSettings.max_daily_loss}
                    onChange={(e) => setFormSettings({ ...formSettings, max_daily_loss: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Kunlik zararga yetganda qalqon savdoni bloklaydi</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Kunlik Maksimal Sdelkalar Soni
                  </label>
                  <input
                    type="number"
                    value={formSettings.max_daily_trades}
                    onChange={(e) => setFormSettings({ ...formSettings, max_daily_trades: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Overtradingdan saqlovchi limit (masalan: 3 ta)</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    1 ta Sdelkadagi O‘rtacha Risk ($)
                  </label>
                  <input
                    type="number"
                    value={formSettings.risk_per_trade}
                    onChange={(e) => setFormSettings({ ...formSettings, risk_per_trade: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">1 mikro kontrakt uchun ~$40-$45</span>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                    Yashil Ruxsat Uchun Minimal Ball
                  </label>
                  <select
                    value={formSettings.min_checklist_score}
                    onChange={(e) => setFormSettings({ ...formSettings, min_checklist_score: parseInt(e.target.value) || 4 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={5}>5 ta shart (Faqat A+ Setup)</option>
                    <option value={4}>4 ta shart (Standart ruxsat)</option>
                    <option value={3}>3 ta shart (Yumshoqroq)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Checklist Shartlari */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Pre-trade tekshiruvi uchun shartlarni yoqish, o‘chirish yoki yangi qoida qo‘shish:
              </p>

              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{it.title}</span>
                        {it.is_mandatory && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Majburiy
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{it.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleItemEnabled(it.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                          it.enabled
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                      >
                        {it.enabled ? 'Faol' : 'O‘chirilgan'}
                      </button>

                      {!it.is_mandatory && (
                        <button
                          onClick={() => handleDeleteItem(it.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Item */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">+ Yangi Tekshiruv Sharti Qo‘shish</span>
                <input
                  type="text"
                  placeholder="Shart nomi (masalan: Yangiliklar taqvimi tekshirildimi?)"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Qisqacha tavsifi"
                  value={newChecklistDesc}
                  onChange={(e) => setNewChecklistDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition-colors"
                >
                  Shartni Ro‘yxatga Qo‘shish
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Supabase Ulanishi */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <strong>Supabase Bulut Bazasi:</strong>
                <p className="text-slate-300">
                  Ma’lumotlaringiz xavfsiz PostgreSQL bazasida saqlanishi uchun Supabase loyihangiz ma’lumotlarini kiriting.
                </p>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={formSettings.supabase_url}
                  onChange={(e) => setFormSettings({ ...formSettings, supabase_url: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  value={formSettings.supabase_anon_key}
                  onChange={(e) => setFormSettings({ ...formSettings, supabase_anon_key: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  {isTesting ? 'Tekshirilmoqda...' : 'Ulanishni Sinab Ko‘rish'}
                </button>

                {testResult && (
                  <span className={`text-xs font-medium ${testResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testResult.message}
                  </span>
                )}
              </div>

              {/* SQL Schema Preview & Copy */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    Supabase SQL Skripti (Jadvallarni yaratish uchun)
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Nusxalandi!' : 'Kodni Nusxalash'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-400 overflow-x-auto max-h-40">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ushbu kodni Supabase &gt; SQL Editor bo‘limiga tashlab "Run" tugmasini bosing.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('Barcha ma’lumotlarni standart demo holatiga qaytarmoqchimisiz?')) {
                onResetDemo();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Demo Ma’lumotlarni Qaytarish</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Bekor Qilish
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40"
            >
              <Save className="w-4 h-4" />
              <span>Saqlash</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
