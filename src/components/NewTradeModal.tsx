import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  Calendar, 
  Clock, 
  DollarSign, 
  Link as LinkIcon, 
  ShieldCheck, 
  AlertTriangle,
  Brain,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  HelpCircle,
  Building2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { 
  Trade, 
  TradeDirection, 
  DisciplineLevel, 
  MentalState, 
  ResultTag, 
  PropAccount 
} from '../types/journal';

interface NewTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  editTrade?: Trade | null;
  accounts: PropAccount[];
  activeAccountId: string;
  prefillChecklistScore?: number;
  prefillChecklistTotal?: number;
  prefillSessionSweep?: boolean;
}

export const POPULAR_INSTRUMENTS = [
  { symbol: 'MNQZ6', name: 'MNQZ6 (Nasdaq Micro Futures)' },
  { symbol: 'MNQ', name: 'MNQ (Nasdaq 100 Micro)' },
  { symbol: 'NQ', name: 'NQ (Nasdaq 100 E-mini)' },
  { symbol: 'NAS100', name: 'NAS100 (Nasdaq 100 Index)' },
  { symbol: 'MESZ6', name: 'MESZ6 (SPX 500 Micro Futures)' },
  { symbol: 'MES', name: 'MES (SPX 500 Micro)' },
  { symbol: 'ES', name: 'ES (SPX 500 E-mini)' },
  { symbol: 'SPX500', name: 'SPX 500 (S&P 500 Index)' },
  { symbol: 'MGCZ6', name: 'MGCZ6 (Gold Micro Futures)' },
  { symbol: 'MGC', name: 'MGC (Gold Micro)' },
  { symbol: 'GC', name: 'GC (Gold Futures)' },
  { symbol: 'XAU/USD', name: 'XAU/USD (Gold Spot)' },
  { symbol: 'MYM', name: 'MYM (Dow Jones Micro)' },
  { symbol: 'YM', name: 'YM (Dow Jones E-mini)' },
  { symbol: 'M2K', name: 'M2K (Russell 2000 Micro)' },
  { symbol: 'CL', name: 'CL (Crude Oil / Neft)' },
  { symbol: 'CUSTOM', name: '✏️ Boshqa instrument (qo‘lda yozish)' },
];

export const NewTradeModal: React.FC<NewTradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTrade,
  accounts,
  activeAccountId,
  prefillChecklistScore = 5,
  prefillChecklistTotal = 5,
  prefillSessionSweep = true,
}) => {
  // Active Tab inside modal
  const [activeTab, setActiveTab] = useState<'main' | 'checklist' | 'notion' | 'photos'>('main');

  // Account
  const [accountId, setAccountId] = useState(activeAccountId || 'acc-tradify');

  // Order Name
  const [orderName, setOrderName] = useState('Order');
  const [instrument, setInstrument] = useState('MNQZ6');
  const [isCustomInstrument, setIsCustomInstrument] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [quantity, setQuantity] = useState(1);
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [grossPnl, setGrossPnl] = useState<string>('');
  const [commission, setCommission] = useState<string>('1.24');
  const [netPnl, setNetPnl] = useState<string>('');
  const [duration, setDuration] = useState('12m 30s');

  // Notion-style fields
  const [riskPercent, setRiskPercent] = useState<number>(0.2);
  const [slPips, setSlPips] = useState<string>('0');
  const [rrRatio, setRrRatio] = useState<string>('2.1');
  const [followedRules, setFollowedRules] = useState<boolean>(true);
  const [pnlPercent, setPnlPercent] = useState<string>('');
  const [resultTag, setResultTag] = useState<ResultTag>('PROFIT');
  const [mentalState, setMentalState] = useState<MentalState>('NO');

  // Checklist Checkboxes (galochkalar)
  const [asiaSweep, setAsiaSweep] = useState(true);
  const [londonSweep, setLondonSweep] = useState(true);
  const [sessionSweep, setSessionSweep] = useState(true);
  const [htfFvgOb, setHtfFvgOb] = useState(true);
  const [ltfConfirmation, setLtfConfirmation] = useState(true);
  const [clearTarget, setClearTarget] = useState(true);
  const [riskShieldOk, setRiskShieldOk] = useState(true);

  // Notion Context & Reasons
  const [entryReason, setEntryReason] = useState('');
  const [slReason, setSlReason] = useState('');
  const [tradingSession, setTradingSession] = useState('После открытия рынка (9:30)');
  const [news, setNews] = useState('');
  const [mistakeCategory, setMistakeCategory] = useState('🟢 Нет ошибки (TP)');
  const [htfTrend, setHtfTrend] = useState('🟢 Bullish');
  const [smtDivergence, setSmtDivergence] = useState('');
  const [smtNq, setSmtNq] = useState('');
  const [smtEs, setSmtEs] = useState('');

  // Links & Photos
  const [chartUrl, setChartUrl] = useState('');
  const [beforePhoto, setBeforePhoto] = useState('');
  const [inTradePhoto, setInTradePhoto] = useState('');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [notes, setNotes] = useState('');

  // Auto calculate checklist score
  const currentCheckScore = [
    asiaSweep,
    londonSweep,
    sessionSweep,
    htfFvgOb,
    ltfConfirmation,
    clearTarget,
    riskShieldOk,
  ].filter(Boolean).length;
  const currentCheckTotal = 7;

  // Sync state when editing or opening
  useEffect(() => {
    if (editTrade) {
      setAccountId(editTrade.account_id || activeAccountId || 'acc-tradify');
      setOrderName('Order');
      setInstrument(editTrade.instrument || 'MNQZ6');
      setDate(editTrade.date);
      setTime(editTrade.time);
      setDirection(editTrade.direction);
      setQuantity(editTrade.quantity);
      setEntryPrice(editTrade.entry_price ? String(editTrade.entry_price) : '');
      setStopLoss(editTrade.stop_loss ? String(editTrade.stop_loss) : '');
      setExitPrice(editTrade.exit_price ? String(editTrade.exit_price) : '');
      setGrossPnl(String(editTrade.gross_pnl));
      setCommission(String(editTrade.commission));
      setNetPnl(String(editTrade.net_pnl));
      setDuration(editTrade.duration || '12m 30s');
      
      setRiskPercent(editTrade.risk_percent !== undefined ? editTrade.risk_percent : 0.2);
      setSlPips(editTrade.sl_pips !== undefined ? String(editTrade.sl_pips) : '0');
      setRrRatio(editTrade.rr_ratio !== undefined ? String(editTrade.rr_ratio) : '2.1');
      setFollowedRules(editTrade.followed_rules !== undefined ? editTrade.followed_rules : true);
      setPnlPercent(editTrade.pnl_percent !== undefined ? String(editTrade.pnl_percent) : '');
      setResultTag(editTrade.result_tag || (editTrade.net_pnl > 0 ? 'PROFIT' : editTrade.net_pnl < 0 ? 'LOSS' : 'BE'));
      setMentalState(editTrade.mental_state || 'NO');

      setAsiaSweep(editTrade.asia_sweep !== undefined ? editTrade.asia_sweep : true);
      setLondonSweep(editTrade.london_sweep !== undefined ? editTrade.london_sweep : true);
      setSessionSweep(editTrade.session_sweep !== undefined ? editTrade.session_sweep : true);
      setHtfFvgOb(editTrade.htf_fvg_ob !== undefined ? editTrade.htf_fvg_ob : true);
      setLtfConfirmation(editTrade.ltf_confirmation !== undefined ? editTrade.ltf_confirmation : true);
      setClearTarget(editTrade.clear_target !== undefined ? editTrade.clear_target : true);
      setRiskShieldOk(editTrade.risk_shield_ok !== undefined ? editTrade.risk_shield_ok : true);

      setEntryReason(editTrade.entry_reason || '');
      setSlReason(editTrade.sl_reason || '');
      setTradingSession(editTrade.trading_session || 'После открытия рынка (9:30)');
      setNews(editTrade.news || '');
      setMistakeCategory(editTrade.mistake_category || (editTrade.net_pnl >= 0 ? '🟢 Нет ошибки (TP)' : 'Fomo / Shoshilish'));
      setHtfTrend(editTrade.htf_trend || '🟢 Bullish');
      setSmtDivergence(editTrade.smt_divergence || '');
      setSmtNq(editTrade.smt_nq || '');
      setSmtEs(editTrade.smt_es || '');

      setChartUrl(editTrade.chart_url || '');
      setBeforePhoto(editTrade.before_photo || '');
      setInTradePhoto(editTrade.in_trade_photo || '');
      setAfterPhoto(editTrade.after_photo || '');
      setNotes(editTrade.notes || '');
    } else {
      setAccountId(activeAccountId || 'acc-tradify');
      setOrderName('Order');
      setInstrument('MNQZ6');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDirection('Long');
      setQuantity(1);
      setEntryPrice('');
      setStopLoss('');
      setExitPrice('');
      setGrossPnl('');
      setCommission('1.24');
      setNetPnl('');
      setDuration('12m 30s');

      setRiskPercent(0.2);
      setSlPips('0');
      setRrRatio('2.1');
      setFollowedRules(true);
      setPnlPercent('');
      setResultTag('PROFIT');
      setMentalState('NO');

      setAsiaSweep(true);
      setLondonSweep(true);
      setSessionSweep(prefillSessionSweep);
      setHtfFvgOb(true);
      setLtfConfirmation(true);
      setClearTarget(true);
      setRiskShieldOk(true);

      setEntryReason('');
      setSlReason('');
      setTradingSession('После открытия рынка (9:30)');
      setNews('');
      setMistakeCategory('🟢 Нет ошибки (TP)');
      setHtfTrend('🟢 Bullish');
      setSmtDivergence('');
      setSmtNq('');
      setSmtEs('');

      setChartUrl('');
      setBeforePhoto('');
      setInTradePhoto('');
      setAfterPhoto('');
      setNotes('');
    }
  }, [editTrade, isOpen, activeAccountId, prefillSessionSweep]);

  if (!isOpen) return null;

  // Auto-calculate P&L
  const handleAutoCalculate = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const comm = parseFloat(commission) || 0;
    const qty = quantity || 1;

    if (!isNaN(entry) && !isNaN(exit)) {
      const diff = direction === 'Long' ? exit - entry : entry - exit;
      let pointVal = 2; // MNQ
      if (instrument.startsWith('MNQ')) pointVal = 2;
      else if (instrument.startsWith('MES')) pointVal = 5;
      else if (instrument.startsWith('MGC')) pointVal = 10;
      else if (instrument.startsWith('NQ')) pointVal = 20;
      else if (instrument.startsWith('ES')) pointVal = 50;

      const calcGross = diff * pointVal * qty;
      const calcNet = calcGross - comm;
      setGrossPnl(calcGross.toFixed(2));
      setNetPnl(calcNet.toFixed(2));

      // Calculate % of 50k
      const pnlPct = (calcNet / 50000) * 100;
      setPnlPercent(`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`);

      if (calcNet > 0) setResultTag('PROFIT');
      else if (calcNet < 0) setResultTag('LOSS');
      else setResultTag('BE');
    }
  };

  const handleGrossChange = (val: string) => {
    setGrossPnl(val);
    const g = parseFloat(val);
    const c = parseFloat(commission) || 0;
    if (!isNaN(g)) {
      const n = g - c;
      setNetPnl(n.toFixed(2));
      const pnlPct = (n / 50000) * 100;
      setPnlPercent(`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`);
      if (n > 0) setResultTag('PROFIT');
      else if (n < 0) setResultTag('LOSS');
      else setResultTag('BE');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalGross = parseFloat(grossPnl) || 0;
    const finalComm = parseFloat(commission) || 0;
    const finalNet = parseFloat(netPnl) || (finalGross - finalComm);

    const activeAccObj = accounts.find((a) => a.id === accountId);

    const newTrade: Trade = {
      id: editTrade ? editTrade.id : `tr-${Date.now()}`,
      account_id: accountId,
      account_name: activeAccObj ? activeAccObj.name : 'Tradify 50K',
      date,
      time,
      instrument: instrument.trim().toUpperCase(),
      direction,
      quantity: Number(quantity) || 1,
      entry_price: parseFloat(entryPrice) || 0,
      stop_loss: parseFloat(stopLoss) || 0,
      exit_price: parseFloat(exitPrice) || 0,
      gross_pnl: finalGross,
      commission: finalComm,
      net_pnl: finalNet,
      duration: duration.trim() || '10m',
      checklist_score: currentCheckScore,
      checklist_total: currentCheckTotal,
      discipline: sessionSweep && currentCheckScore >= 5 ? 'A_PLUS' : sessionSweep ? 'PARTIAL' : 'RULE_VIOLATION',
      session_sweep: sessionSweep,
      mental_state: mentalState,
      notes: notes.trim(),
      chart_url: chartUrl.trim() || beforePhoto.trim() || '',
      created_at: editTrade ? editTrade.created_at : new Date().toISOString(),

      // Notion properties
      risk_percent: Number(riskPercent) || 0.2,
      sl_pips: parseFloat(slPips) || 0,
      rr_ratio: parseFloat(rrRatio) || 0,
      followed_rules: followedRules,
      pnl_percent: parseFloat(pnlPercent.replace('%', '')) || 0,
      result_tag: resultTag,
      before_photo: beforePhoto.trim(),
      in_trade_photo: inTradePhoto.trim(),
      after_photo: afterPhoto.trim(),
      entry_reason: entryReason.trim(),
      sl_reason: slReason.trim(),
      trading_session: tradingSession.trim(),
      news: news.trim(),
      mistake_category: mistakeCategory.trim(),
      htf_trend: htfTrend.trim(),
      smt_divergence: smtDivergence.trim(),
      smt_nq: smtNq.trim(),
      smt_es: smtEs.trim(),

      // Specific checklist checkmarks
      asia_sweep: asiaSweep,
      london_sweep: londonSweep,
      htf_fvg_ob: htfFvgOb,
      ltf_confirmation: ltfConfirmation,
      clear_target: clearTarget,
      risk_shield_ok: riskShieldOk,
    };

    onSave(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#070b14] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editTrade ? 'Sdelkani Tahrirlash' : '+ Yangi Sdelka Qo‘shish (Notion)'}
                <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {orderName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Notion jurnali va Tradify hisoboti uchun barcha maydonlar va strategiya galochkalari
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-[#070b14]/70 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'main'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Asosiy & Narxlar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" /> Strategiya Galochkalari ({currentCheckScore}/7)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notion')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'notion'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Sabablar & Xatolar
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Rasm & Grafik Linklari
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 custom-scrollbar text-xs">

            {/* TAB 1: ASOSIY & NARXLAR */}
            {activeTab === 'main' && (
              <div className="space-y-4">
                
                {/* Prop Account & Instrument Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Prop Hisob <span className="text-cyan-400">*</span>
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.firm})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                      <span>Пара (Instrument) <span className="text-emerald-400">*</span></span>
                      {instrument && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          {instrument}
                        </span>
                      )}
                    </label>

                    {/* Instrument Selector Dropdown */}
                    <select
                      value={
                        POPULAR_INSTRUMENTS.some((i) => i.symbol === instrument)
                          ? instrument
                          : 'CUSTOM'
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'CUSTOM') {
                          setInstrument(e.target.value);
                          setIsCustomInstrument(false);
                        } else {
                          setIsCustomInstrument(true);
                        }
                      }}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {POPULAR_INSTRUMENTS.map((inst) => (
                        <option key={inst.symbol} value={inst.symbol}>
                          {inst.name}
                        </option>
                      ))}
                    </select>

                    {/* Custom input if "CUSTOM" or custom ticker entered */}
                    {(isCustomInstrument || !POPULAR_INSTRUMENTS.some((i) => i.symbol === instrument)) && (
                      <input
                        type="text"
                        required
                        placeholder="Katirovkani kiriting: masalan MNQH7, SILVER..."
                        value={instrument}
                        onChange={(e) => setInstrument(e.target.value.toUpperCase())}
                        className="w-full mt-1.5 bg-[#131b2e] border border-cyan-500/60 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 animate-in fade-in duration-100"
                      />
                    )}

                    {/* Quick Select Badges */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        { s: 'MNQZ6', l: 'MNQ (Nasdaq)' },
                        { s: 'MESZ6', l: 'MES (SPX 500)' },
                        { s: 'MGCZ6', l: 'MGC (Gold)' },
                        { s: 'XAU/USD', l: 'XAU (Gold)' },
                      ].map((item) => (
                        <button
                          key={item.s}
                          type="button"
                          onClick={() => {
                            setInstrument(item.s);
                            setIsCustomInstrument(false);
                          }}
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded-lg border transition ${
                            instrument === item.s
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Позиция (Yo‘nalish)
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDirection('Long')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                          direction === 'Long'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Long (Buy)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirection('Short')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                          direction === 'Short'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <ArrowDownRight className="w-3.5 h-3.5" /> Short (Sell)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Date, Time, Qty, Emotion */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Дата (Sana)
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Время (Vaqt)
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Qty (Kontrakt)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Эмоция какая была?
                    </label>
                    <select
                      value={mentalState}
                      onChange={(e) => setMentalState(e.target.value as MentalState)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="NO">NO (Neytral)</option>
                      <option value="Xotirjam">Xotirjam</option>
                      <option value="Bozor ochilishiga shoshilish">Shoshilish</option>
                      <option value="Yurak siqildi">Yurak siqildi (Fomo)</option>
                      <option value="Asab / Alam olish">Asab / Alam olish</option>
                    </select>
                  </div>
                </div>

                {/* Notion Risk & R:R */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Риск (masalan: 0.2%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value))}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      SL (Pips / ball: 0 yoki -1)
                    </label>
                    <input
                      type="text"
                      value={slPips}
                      onChange={(e) => setSlPips(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      R:R (masalan: 2.1, 4, -1)
                    </label>
                    <input
                      type="text"
                      value={rrRatio}
                      onChange={(e) => setRrRatio(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Результат
                    </label>
                    <select
                      value={resultTag}
                      onChange={(e) => setResultTag(e.target.value as ResultTag)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    >
                      <option value="PROFIT">Прибыльная</option>
                      <option value="LOSS">Убыточная</option>
                      <option value="BE">БУ (Bezubitok)</option>
                    </select>
                  </div>
                </div>

                {/* Prices & Calculations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Вход (Kirish narxi)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="31198.75"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Stop Loss narxi
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="31183.75"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Выход (Chiqish narxi)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="31350.50"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Auto calc button */}
                {entryPrice && exitPrice && (
                  <button
                    type="button"
                    onClick={handleAutoCalculate}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Calculator className="w-3.5 h-3.5" /> Narxlar orqali P&L va R:R ni avtomatik hisoblash
                  </button>
                )}

                {/* P&L Outputs */}
                <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Итог (Yalpi Gross P&L $)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="302.65"
                      value={grossPnl}
                      onChange={(e) => handleGrossChange(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Комиссия ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={commission}
                      onChange={(e) => {
                        setCommission(e.target.value);
                        const g = parseFloat(grossPnl) || 0;
                        const c = parseFloat(e.target.value) || 0;
                        setNetPnl((g - c).toFixed(2));
                      }}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Чистый P&L ($) <span className="text-emerald-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="+301.41 yoki -100.09"
                      value={netPnl}
                      onChange={(e) => {
                        setNetPnl(e.target.value);
                        const n = parseFloat(e.target.value) || 0;
                        const pct = (n / 50000) * 100;
                        setPnlPercent(`${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`);
                      }}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold text-xs"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: STRATEGIYA CHECKLISTI & GALOCHKALAR */}
            {activeTab === 'checklist' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" /> Savdodan Oldingi Shartlar (Galochkalar)
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {currentCheckScore} / {currentCheckTotal} bajarildi
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-4">
                    Har bir shartni tekshirib galochka qo‘ying. Agar sessiya sweep bo‘lmagan bo‘lsa, qoidani buzmang!
                  </p>

                  <div className="space-y-2.5">
                    
                    {/* 1. Asia Sweep */}
                    <div 
                      onClick={() => setAsiaSweep(!asiaSweep)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        asiaSweep ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {asiaSweep ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">1. Asia Sweep (Osiyo sessiyasi High / Low sweep bo‘ldimi?)</strong>
                          <span className="text-[11px] text-slate-400">Osiyo likvidligi yechilganmi yoki yo‘q</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${asiaSweep ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {asiaSweep ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                    {/* 2. London Sweep */}
                    <div 
                      onClick={() => setLondonSweep(!londonSweep)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        londonSweep ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {londonSweep ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">2. London Sweep (London sessiyasi High / Low sweep bo‘ldimi?)</strong>
                          <span className="text-[11px] text-slate-400">London sessiyasi likvidligi olindimi</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${londonSweep ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {londonSweep ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                    {/* 3. Session Sweep (Asosiy) */}
                    <div 
                      onClick={() => setSessionSweep(!sessionSweep)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        sessionSweep ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-rose-950/20 border-rose-500/40 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {sessionSweep ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-rose-500 shrink-0" />}
                        <div>
                          <strong className="block text-xs flex items-center gap-1.5">
                            3. Sessiya High / Low Sweep (Asosiy Shart)
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-mono">Majburiy</span>
                          </strong>
                          <span className="text-[11px] text-slate-400">Sweep bo‘lmasa savdoga kirmaslik kerak!</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sessionSweep ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {sessionSweep ? 'SWEEP BOR' : 'SWEEP YO‘Q'}
                      </span>
                    </div>

                    {/* 4. H4 / H1 FVG yoki OB */}
                    <div 
                      onClick={() => setHtfFvgOb(!htfFvgOb)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        htfFvgOb ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {htfFvgOb ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">4. H4 / H1 Zona (FVG yoki OB bormi?)</strong>
                          <span className="text-[11px] text-slate-400">Katta taymfreymda mos POI zonasi mavjudligi</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${htfFvgOb ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {htfFvgOb ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                    {/* 5. M1 / M3 / M5 Tasdiq */}
                    <div 
                      onClick={() => setLtfConfirmation(!ltfConfirmation)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        ltfConfirmation ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ltfConfirmation ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">5. M1 / M3 / M5 Tasdiq (FVG yoki iFVG)</strong>
                          <span className="text-[11px] text-slate-400">Kichik taymfreymda bozor strukturasi sinishi</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${ltfConfirmation ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {ltfConfirmation ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                    {/* 6. Aniq Target */}
                    <div 
                      onClick={() => setClearTarget(!clearTarget)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        clearTarget ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {clearTarget ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">6. Aniq Target (Eng yaqin Low yoki High)</strong>
                          <span className="text-[11px] text-slate-400">Likvidlik maqsadi aniq belgilangan</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${clearTarget ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {clearTarget ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                    {/* 7. Risk va Kunlik Qalqon */}
                    <div 
                      onClick={() => setRiskShieldOk(!riskShieldOk)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        riskShieldOk ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {riskShieldOk ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs">7. Risk va Kunlik Qalqon (~$40-$45 risk, 1 mikro)</strong>
                          <span className="text-[11px] text-slate-400">Kunlik zarar chegarasi va risk qoidasi</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${riskShieldOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {riskShieldOk ? 'HA' : 'YO‘Q'}
                      </span>
                    </div>

                  </div>
                </div>

                {/* Followed Rules Switcher (Соблюдал ли ты правила?) */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <strong className="text-white block text-xs">Соблюдал ли ты правила? (Qoidaga amal qildingizmi?)</strong>
                    <span className="text-slate-400 text-[11px]">Notion jadvalida DA yoki NET belgisi chiqadi</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFollowedRules(true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                        followedRules 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      ДА
                    </button>
                    <button
                      type="button"
                      onClick={() => setFollowedRules(false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                        !followedRules 
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      НЕТ
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: NOTION SABABLAR & TAHLIL */}
            {activeTab === 'notion' && (
              <div className="space-y-4">
                
                {/* Kirish sababi */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Причины сделки (Kirish sababi)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="masalan: Trend Buy edi va tepadagi Daily FVG ga intilayotgan edi, M1 da iFVG tasdiqlandi..."
                    value={entryReason}
                    onChange={(e) => setEntryReason(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Stop Loss sababi */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Причины Stop Loss (Agar SL urgan bo‘lsa)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="masalan: bozor yurmadi umuman pastga, sababi bozor 9:30 da ochilgandan keyin katta sham berdi..."
                    value={slReason}
                    onChange={(e) => setSlReason(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Sessiya va Xatolar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Торговая сессия
                    </label>
                    <input
                      type="text"
                      placeholder="После открытия рынка (9:30), 13:10 – 13:40 EST..."
                      value={tradingSession}
                      onChange={(e) => setTradingSession(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Категория ошибки
                    </label>
                    <input
                      type="text"
                      placeholder="🟢 Нет ошибки (TP), 9:30 Open Stock market, Fomo..."
                      value={mistakeCategory}
                      onChange={(e) => setMistakeCategory(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>

                {/* HTF Trend va Yangiliklar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      HTF Trend
                    </label>
                    <select
                      value={htfTrend}
                      onChange={(e) => setHtfTrend(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="🟢 Bullish">🟢 Bullish</option>
                      <option value="🔴 Bearish">🔴 Bearish</option>
                      <option value="⚪ Range / Choppy">⚪ Range / Choppy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Сегодня какие новости
                    </label>
                    <input
                      type="text"
                      placeholder="CPI, NFP, FOMC yoki Yangiliksiz..."
                      value={news}
                      onChange={(e) => setNews(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>

                {/* SMT Divergence */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      SMT Divergence about (Tavsif)
                    </label>
                    <input
                      type="text"
                      placeholder="masalan: Silver uje sweep qilib bo‘lgan edi, ES esa low olmadi..."
                      value={smtDivergence}
                      onChange={(e) => setSmtDivergence(e.target.value)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">
                        SMT Divergence NQ (Link)
                      </label>
                      <input
                        type="url"
                        placeholder="tradingview.com/x/... yoki fxreplay.com..."
                        value={smtNq}
                        onChange={(e) => setSmtNq(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">
                        SMT Divergence ES (Link)
                      </label>
                      <input
                        type="url"
                        placeholder="tradingview.com/x/... yoki fxreplay.com..."
                        value={smtEs}
                        onChange={(e) => setSmtEs(e.target.value)}
                        className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: RASM & GRAFIK LINKLARI */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs">
                  💡 TradingView, FxReplay yoki rasm hosting (ibb.co, Lightshot, Imgur) havolalarini qo‘ying.
                  Jadvaldagi sdelkani bosganingizda rasm va grafik to‘g‘ridan-to‘g‘ri dastur ichida ochiladi!
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Asosiy Grafik Havolasi (URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.tradingview.com/x/... yoki https://fxreplay.com/..."
                    value={chartUrl}
                    onChange={(e) => setChartUrl(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Before Trade / Photo (Savdodan oldingi tahlil rasmi URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://fxreplay.com/s/... yoki https://ibb.co/..."
                    value={beforePhoto}
                    onChange={(e) => setBeforePhoto(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    In Trade Photo (Savdo davomidagi holat URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://fxreplay.com/s/... yoki https://tradingview.com/x/..."
                    value={inTradePhoto}
                    onChange={(e) => setInTradePhoto(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    After Trade / Photo (Savdo yakunlanganidan keyingi rasm URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://fxreplay.com/s/... yoki https://ibb.co/..."
                    value={afterPhoto}
                    onChange={(e) => setAfterPhoto(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Qo‘shimcha Izoh (Notes)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Sdelka haqida xulosangiz..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 px-6 border-t border-slate-800 bg-[#070b14] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                sessionSweep 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {sessionSweep ? '✓ Sweep Tasdiqlangan' : '⚠ Diqqat: Sweep bo‘lmagan!'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-4 h-4" /> Sdelkani Saqlash
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
