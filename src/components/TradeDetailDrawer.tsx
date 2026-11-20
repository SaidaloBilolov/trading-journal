import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2,
  Brain,
  Target,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Sparkles,
  CheckSquare,
  Square,
  Building2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Trade } from '../types/journal';

interface TradeDetailDrawerProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  onUpdateLink?: (tradeId: string, newUrl: string) => void;
}

export const TradeDetailDrawer: React.FC<TradeDetailDrawerProps> = ({
  trade,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdateLink,
}) => {
  const [chartLinkInput, setChartLinkInput] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkSavedToast, setLinkSavedToast] = useState(false);

  useEffect(() => {
    if (trade) {
      setChartLinkInput(trade.chart_url || trade.before_photo || '');
      setIsEditingLink(false);
    }
  }, [trade]);

  if (!isOpen || !trade) return null;

  const isProfit = trade.net_pnl > 0;
  const isLoss = trade.net_pnl < 0;

  // Calculate points gained / lost
  const pointDiff = trade.direction === 'Long' 
    ? trade.exit_price - trade.entry_price 
    : trade.entry_price - trade.exit_price;

  // Calculate theoretical risk (SL distance)
  const riskPoints = Math.abs(trade.entry_price - trade.stop_loss);

  const handleSaveLink = () => {
    if (onUpdateLink) {
      onUpdateLink(trade.id, chartLinkInput.trim());
      setIsEditingLink(false);
      setLinkSavedToast(true);
      setTimeout(() => setLinkSavedToast(false), 2500);
    }
  };

  const handleClearLink = () => {
    setChartLinkInput('');
    if (onUpdateLink) {
      onUpdateLink(trade.id, '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-black text-white font-mono bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                {trade.instrument}
              </span>
              {trade.account_name && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-mono font-medium">
                  {trade.account_name}
                </span>
              )}
              {trade.direction === 'Long' ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Long (Buy)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Short (Sell)
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar text-xs">
            
            {/* Net P&L Hero Card */}
            <div className={`p-6 rounded-3xl border-2 text-center transition-all ${
              isProfit 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                : isLoss
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Sof Natija (Net P&L)
              </span>
              <div className="text-4xl font-black font-mono tracking-tight">
                {isProfit ? '+' : ''}${trade.net_pnl.toFixed(2)}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Yalpi: ${trade.gross_pnl.toFixed(2)}</span>
                <span>•</span>
                <span>Komissiya: -${trade.commission.toFixed(2)}</span>
                <span>•</span>
                <span>Risk: {trade.risk_percent !== undefined ? `${trade.risk_percent}%` : '0.2%'}</span>
                <span>•</span>
                <span>R:R: {trade.rr_ratio !== undefined ? `${trade.rr_ratio}` : '1:2.1'}</span>
              </div>
            </div>

            {/* ⭐ FOYDALANUVCHI LINKI VA GRAFIK KO'RINIShI ⭐ */}
            <div className="bg-slate-900/90 border-2 border-emerald-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Sdelka Grafiki / Skrinshot Havolasi</span>
                      {linkSavedToast && (
                        <span className="text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          Saqlandi!
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">TradingView yoki rasm havolasini qo‘yish</p>
                  </div>
                </div>

                {!isEditingLink && (
                  <button
                    onClick={() => setIsEditingLink(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{trade.chart_url ? 'O‘zgartirish' : 'Link qo‘yish'}</span>
                  </button>
                )}
              </div>

              {/* Editing URL Input */}
              {isEditingLink ? (
                <div className="mt-4 space-y-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <label className="text-xs font-medium text-slate-300 block">
                    Grafik havolasini kiriting (TradingView, FxReplay yoki rasm):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="https://www.tradingview.com/x/... yoki https://fxreplay.com/..."
                      value={chartLinkInput}
                      onChange={(e) => setChartLinkInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {trade.chart_url && (
                      <button
                        onClick={handleClearLink}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs"
                      >
                        O‘chirish
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditingLink(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleSaveLink}
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Saqlash
                    </button>
                  </div>
                </div>
              ) : trade.chart_url || trade.before_photo ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div className="flex items-center gap-2 truncate mr-2">
                      <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-mono text-emerald-400 truncate underline cursor-pointer" onClick={() => window.open(trade.chart_url || trade.before_photo, '_blank')}>
                        {trade.chart_url || trade.before_photo}
                      </span>
                    </div>
                    <a
                      href={trade.chart_url || trade.before_photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1 shrink-0 transition border border-emerald-500/40"
                    >
                      <span>Ochish</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Inline visual preview for images */}
                  {(trade.chart_url || trade.before_photo)?.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || 
                   (trade.chart_url || trade.before_photo)?.includes('ibb.co') ||
                   (trade.chart_url || trade.before_photo)?.includes('prnt.sc') ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 relative group">
                      <img 
                        src={trade.chart_url || trade.before_photo} 
                        alt="Trade Chart Preview"
                        className="w-full max-h-60 object-contain hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center">
                  <p className="text-xs text-slate-400 mb-2">Hali grafik havolasi kiritilmagan</p>
                  <button
                    onClick={() => setIsEditingLink(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold inline-flex items-center gap-1.5 transition border border-emerald-500/30"
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> Havola qo‘shish
                  </button>
                </div>
              )}
            </div>

            {/* Strategy Checkmarks Summary (Galochkalar) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Strategiya Shartlari ({trade.checklist_score}/{trade.checklist_total || 7})</span>
                </h4>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  (trade.followed_rules !== undefined ? trade.followed_rules : trade.session_sweep)
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  Qoida bo‘yicha: {(trade.followed_rules !== undefined ? trade.followed_rules : trade.session_sweep) ? 'ДА' : 'НЕТ'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">1. Asia Sweep:</span>
                  <span className={trade.asia_sweep !== false ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {trade.asia_sweep !== false ? '✓ Bajarildi' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">2. London Sweep:</span>
                  <span className={trade.london_sweep !== false ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {trade.london_sweep !== false ? '✓ Bajarildi' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 font-medium">3. Sessiya Sweep (Asosiy):</span>
                  <span className={trade.session_sweep ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {trade.session_sweep ? '✓ SWEEP BOR' : '✗ SWEEP YO‘Q'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">4. H4 / H1 FVG/OB:</span>
                  <span className={trade.htf_fvg_ob !== false ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {trade.htf_fvg_ob !== false ? '✓ Bajarildi' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">5. M1/M3/M5 Tasdiq:</span>
                  <span className={trade.ltf_confirmation !== false ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {trade.ltf_confirmation !== false ? '✓ Bajarildi' : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300">6. Aniq Target:</span>
                  <span className={trade.clear_target !== false ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {trade.clear_target !== false ? '✓ Bajarildi' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notion Reasons & Errors */}
            {(trade.entry_reason || trade.sl_reason || trade.trading_session || trade.mistake_category) && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Notion Tahlil & Sabablar
                </h4>
                
                {trade.entry_reason && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Причины сделки (Kirish sababi):</span>
                    <p className="text-slate-200">{trade.entry_reason}</p>
                  </div>
                )}

                {trade.sl_reason && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-900/40">
                    <span className="text-rose-400 block text-[11px] mb-0.5">Причины Stop Loss:</span>
                    <p className="text-rose-200">{trade.sl_reason}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {trade.trading_session && (
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Sessiya:</span>
                      <span className="text-purple-300 font-medium">{trade.trading_session}</span>
                    </div>
                  )}
                  {trade.mistake_category && (
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">Xato / Kategoriya:</span>
                      <span className="text-slate-200 font-medium">{trade.mistake_category}</span>
                    </div>
                  )}
                  {trade.htf_trend && (
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">HTF Trend:</span>
                      <span className="font-medium text-slate-200">{trade.htf_trend}</span>
                    </div>
                  )}
                  {trade.smt_divergence && (
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">SMT Divergence:</span>
                      <span className="text-slate-200">{trade.smt_divergence}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Execution Details Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Savdo Ijrosi Tafsilotlari
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Sana va Vaqt</span>
                  <span className="text-white font-bold mt-0.5 block">{trade.date} {trade.time}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Davomiyligi</span>
                  <span className="text-white font-bold mt-0.5 block">{trade.duration}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Kontrakt Miqdori</span>
                  <span className="text-white font-bold mt-0.5 block">{trade.quantity} mikro kontrakt</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Kirish Narxi</span>
                  <span className="text-white font-bold mt-0.5 block">{trade.entry_price.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-rose-400 block text-[10px]">Stop Loss</span>
                  <span className="text-rose-300 font-bold mt-0.5 block">{trade.stop_loss.toLocaleString()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 block text-[10px]">Chiqish (TP)</span>
                  <span className="text-emerald-300 font-bold mt-0.5 block">{trade.exit_price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Notes & Reflection */}
            {trade.notes && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Qo‘shimcha Izoh
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80 whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </div>
            )}

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (window.confirm('Haqiqatan ham bu sdelkani o‘chirmoqchimisiz?')) {
                  onDelete(trade.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-xs font-semibold text-rose-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>O‘chirish</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onEdit(trade);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Tahrirlash</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
