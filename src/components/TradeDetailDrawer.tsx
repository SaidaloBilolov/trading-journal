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

  // 3-Stage Photo states
  const [editingPhotoStage, setEditingPhotoStage] = useState<'before' | 'inTrade' | 'after' | null>(null);
  const [photoInputUrl, setPhotoInputUrl] = useState('');

  const handleSavePhotoUrl = (field: 'before_photo' | 'in_trade_photo' | 'after_photo', url: string) => {
    if (!trade) return;
    const updatedTrade: Trade = {
      ...trade,
      [field]: url.trim(),
    };
    if (field === 'before_photo') {
      updatedTrade.chart_url = url.trim();
    }
    onEdit(updatedTrade);
    setEditingPhotoStage(null);
    setLinkSavedToast(true);
    setTimeout(() => setLinkSavedToast(false), 2500);
  };

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
              <span className="text-xl font-bold text-white font-mono bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Sof Natija (Net P&L)
              </span>
              <div className="text-4xl font-bold font-mono tracking-tight">
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

            {/* ⭐ FOYDALANUVCHI RASMLARI: BEFORE, IN-TRADE, AFTER TRADE (UZUN VA CHIROYLI) ⭐ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sdelka Skrinshotlari & Grafiklar</h4>
                    <p className="text-[11px] text-slate-400">Before Trade, In Trade va After Trade tahlillari</p>
                  </div>
                </div>
                {linkSavedToast && (
                  <span className="text-[10px] bg-emerald-500 text-slate-950 px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                    Saqlandi!
                  </span>
                )}
              </div>

              {/* STAGE 1: BEFORE TRADE */}
              <div className="rounded-3xl border-2 border-cyan-500/30 bg-[#090e1a] p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <h5 className="font-bold text-white text-xs tracking-wide uppercase">
                      1. Before Trade (Kirishdan oldin - Setup)
                    </h5>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPhotoStage('before');
                      setPhotoInputUrl(trade.before_photo || trade.chart_url || '');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30 transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{(trade.before_photo || trade.chart_url) ? 'O‘zgartirish' : 'Rasm qo‘yish'}</span>
                  </button>
                </div>

                {editingPhotoStage === 'before' ? (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] text-slate-300 block">Before Trade skrinshot havolasi (URL):</label>
                    <input
                      type="url"
                      placeholder="https://www.tradingview.com/x/... yoki rasm linki"
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingPhotoStage(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={() => handleSavePhotoUrl('before_photo', photoInputUrl)}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Saqlash
                      </button>
                    </div>
                  </div>
                ) : (trade.before_photo || trade.chart_url) ? (
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 relative group">
                      <img
                        src={trade.before_photo || trade.chart_url}
                        alt="Before Trade Chart"
                        className="w-full max-h-72 object-contain hover:scale-102 transition-transform duration-300 cursor-zoom-in"
                        onClick={() => window.open(trade.before_photo || trade.chart_url, '_blank')}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="truncate max-w-[280px] font-mono text-cyan-400">
                        {trade.before_photo || trade.chart_url}
                      </span>
                      <a
                        href={trade.before_photo || trade.chart_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Kattalashtirish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 p-4">
                    {/* TradingView-style dark SVG representation of Before trade */}
                    <div className="h-44 w-full relative flex flex-col justify-between select-none">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{trade.instrument} • 1M Chart</span>
                        <span className="text-cyan-400 font-bold">Liquidity Sweep & FVG Setup</span>
                      </div>
                      {/* Candlestick illustration */}
                      <svg viewBox="0 0 400 120" className="w-full h-28 my-auto">
                        {/* Support / Liquidity line */}
                        <line x1="10" y1="90" x2="390" y2="90" stroke="#06b6d4" strokeDasharray="4 4" strokeWidth="1.5" />
                        <text x="15" y="82" fill="#06b6d4" fontSize="10" fontFamily="monospace">Asia / London Low Sweep</text>
                        {/* Candlesticks */}
                        <line x1="50" y1="20" x2="50" y2="80" stroke="#64748b" strokeWidth="1.5" />
                        <rect x="44" y="35" width="12" height="35" fill="#ef4444" rx="2" />
                        <line x1="110" y1="30" x2="110" y2="95" stroke="#ef4444" strokeWidth="1.5" />
                        <rect x="104" y="45" width="12" height="40" fill="#ef4444" rx="2" />
                        <line x1="170" y1="40" x2="170" y2="105" stroke="#06b6d4" strokeWidth="2" />
                        <rect x="164" y="60" width="12" height="38" fill="#ef4444" rx="2" />
                        {/* FVG box */}
                        <rect x="210" y="30" width="60" height="40" fill="#06b6d4" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                        <text x="220" y="55" fill="#06b6d4" fontSize="10" fontFamily="monospace">iFVG Zone</text>
                        {/* Confirmation candle */}
                        <line x1="240" y1="15" x2="240" y2="85" stroke="#10b981" strokeWidth="2" />
                        <rect x="234" y="25" width="12" height="45" fill="#10b981" rx="2" />
                        <line x1="300" y1="10" x2="300" y2="70" stroke="#10b981" strokeWidth="2" />
                        <rect x="294" y="15" width="12" height="45" fill="#10b981" rx="2" />
                      </svg>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Setup: {trade.direction === 'Long' ? 'Bullish Reversal' : 'Bearish Reversal'}</span>
                        <button
                          onClick={() => {
                            setEditingPhotoStage('before');
                            setPhotoInputUrl('');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                          + O‘z skrinshotingizni yuklang
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 2: IN TRADE */}
              <div className="rounded-3xl border-2 border-amber-500/30 bg-[#090e1a] p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h5 className="font-bold text-white text-xs tracking-wide uppercase">
                      2. In Trade (Pozitsiyada - Jarayon)
                    </h5>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPhotoStage('inTrade');
                      setPhotoInputUrl(trade.in_trade_photo || '');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-[11px] font-semibold border border-amber-500/30 transition"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{trade.in_trade_photo ? 'O‘zgartirish' : 'Rasm qo‘yish'}</span>
                  </button>
                </div>

                {editingPhotoStage === 'inTrade' ? (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] text-slate-300 block">In-Trade skrinshot havolasi (URL):</label>
                    <input
                      type="url"
                      placeholder="https://www.tradingview.com/x/... yoki rasm linki"
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingPhotoStage(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={() => handleSavePhotoUrl('in_trade_photo', photoInputUrl)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Saqlash
                      </button>
                    </div>
                  </div>
                ) : trade.in_trade_photo ? (
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 relative group">
                      <img
                        src={trade.in_trade_photo}
                        alt="In Trade Chart"
                        className="w-full max-h-72 object-contain hover:scale-102 transition-transform duration-300 cursor-zoom-in"
                        onClick={() => window.open(trade.in_trade_photo, '_blank')}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className="truncate max-w-[280px] font-mono text-amber-400">
                        {trade.in_trade_photo}
                      </span>
                      <a
                        href={trade.in_trade_photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Kattalashtirish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 p-4">
                    <div className="h-44 w-full relative flex flex-col justify-between select-none">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Pozitsiya: <strong className="text-white">{trade.direction}</strong></span>
                        <span className="text-amber-400 font-bold">Entry & Trailing Risk</span>
                      </div>
                      <svg viewBox="0 0 400 120" className="w-full h-28 my-auto">
                        {/* Entry line */}
                        <line x1="10" y1="65" x2="390" y2="65" stroke="#10b981" strokeWidth="1.5" />
                        <text x="15" y="58" fill="#10b981" fontSize="10" fontFamily="monospace">KIRISH (Entry Price)</text>
                        {/* Stop Loss line */}
                        <line x1="10" y1="95" x2="390" y2="95" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="15" y="110" fill="#ef4444" fontSize="10" fontFamily="monospace">Stop Loss (Risk 0.2%)</text>
                        {/* Target line */}
                        <line x1="10" y1="20" x2="390" y2="20" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="15" y="15" fill="#10b981" fontSize="10" fontFamily="monospace">Take Profit Target</text>
                        {/* In-trade candles */}
                        <line x1="180" y1="45" x2="180" y2="85" stroke="#10b981" strokeWidth="2" />
                        <rect x="174" y="50" width="12" height="30" fill="#10b981" rx="2" />
                        <line x1="240" y1="35" x2="240" y2="70" stroke="#10b981" strokeWidth="2" />
                        <rect x="234" y="40" width="12" height="25" fill="#10b981" rx="2" />
                        <line x1="300" y1="20" x2="300" y2="55" stroke="#10b981" strokeWidth="2" />
                        <rect x="294" y="25" width="12" height="25" fill="#10b981" rx="2" />
                      </svg>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>R:R Nisbat: <strong className="text-white">{trade.rr_ratio || '1:2.1'}</strong></span>
                        <button
                          onClick={() => {
                            setEditingPhotoStage('inTrade');
                            setPhotoInputUrl('');
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold"
                        >
                          + O‘z skrinshotingizni yuklang
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STAGE 3: AFTER TRADE */}
              <div className={`rounded-3xl border-2 ${isProfit ? 'border-emerald-500/40' : 'border-rose-500/40'} bg-[#090e1a] p-4 sm:p-5 shadow-xl space-y-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isProfit ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <h5 className="font-bold text-white text-xs tracking-wide uppercase">
                      3. After Trade (Natija - Chiqish tahlili)
                    </h5>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPhotoStage('after');
                      setPhotoInputUrl(trade.after_photo || '');
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 ${isProfit ? 'text-emerald-300 border-emerald-500/30' : 'text-rose-300 border-rose-500/30'} text-[11px] font-semibold border transition`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{trade.after_photo ? 'O‘zgartirish' : 'Rasm qo‘yish'}</span>
                  </button>
                </div>

                {editingPhotoStage === 'after' ? (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] text-slate-300 block">After Trade skrinshot havolasi (URL):</label>
                    <input
                      type="url"
                      placeholder="https://www.tradingview.com/x/... yoki rasm linki"
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingPhotoStage(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={() => handleSavePhotoUrl('after_photo', photoInputUrl)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Saqlash
                      </button>
                    </div>
                  </div>
                ) : trade.after_photo ? (
                  <div className="space-y-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black/60 relative group">
                      <img
                        src={trade.after_photo}
                        alt="After Trade Chart"
                        className="w-full max-h-72 object-contain hover:scale-102 transition-transform duration-300 cursor-zoom-in"
                        onClick={() => window.open(trade.after_photo, '_blank')}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span className={`truncate max-w-[280px] font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.after_photo}
                      </span>
                      <a
                        href={trade.after_photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${isProfit ? 'text-emerald-400' : 'text-rose-400'} hover:underline flex items-center gap-1 font-semibold`}
                      >
                        <span>Kattalashtirish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 p-4">
                    <div className="h-44 w-full relative flex flex-col justify-between select-none">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Yakuniy Sof P&L:</span>
                        <span className={`font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}${trade.net_pnl.toFixed(2)}
                        </span>
                      </div>
                      <svg viewBox="0 0 400 120" className="w-full h-28 my-auto">
                        <line x1="10" y1="20" x2="390" y2="20" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                        <text x="15" y="15" fill="#10b981" fontSize="10" fontFamily="monospace">Take Profit TARGET HIT ✓</text>
                        <line x1="260" y1="15" x2="260" y2="60" stroke="#10b981" strokeWidth="2.5" />
                        <rect x="252" y="20" width="16" height="35" fill="#10b981" rx="2" />
                        {/* Target badge */}
                        <circle cx="260" cy="20" r="6" fill="#10b981" />
                        <text x="275" y="24" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          +{trade.rr_ratio || '2.1'}R Target
                        </text>
                      </svg>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Davomiyligi: <strong className="text-white">{trade.duration || '12m'}</strong></span>
                        <button
                          onClick={() => {
                            setEditingPhotoStage('after');
                            setPhotoInputUrl('');
                          }}
                          className={`${isProfit ? 'text-emerald-400 hover:text-emerald-300' : 'text-rose-400 hover:text-rose-300'} font-bold`}
                        >
                          + O‘z skrinshotingizni yuklang
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Checkmarks Summary (Galochkalar) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Strategiya Shartlari ({trade.checklist_score}/{trade.checklist_total || 5})</span>
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
