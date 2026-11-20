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
  { symbol: 'MNQ', name: 'MNQ (Nasdaq)' },
  { symbol: 'MES', name: 'MES (ES / SPX 500)' },
  { symbol: 'MGC', name: 'MGC (Gold)' },
  { symbol: 'CUSTOM', name: '✏️ Boshqa instrument (qo‘lda yozish)' },
];

export const SESSION_OPTIONS = [
  // ICT NY Macros (Boshlanishi va tugashi bilan)
  { value: '08:50 – 09:10 EST (Pre-Market Macro)', label: '⏰ 08:50 – 09:10 EST (Pre-Market Macro)' },
  { value: 'После открытия рынка (9:30)', label: '🔔 После открытия рынка (9:30 Open)' },
  { value: '09:50 – 10:10 EST (NY AM Open Macro)', label: '⏰ 09:50 – 10:10 EST (NY AM Open Macro)' },
  { value: '10:50 – 11:10 EST (NY AM Continuation Macro)', label: '⏰ 10:50 – 11:10 EST (NY AM Macro)' },
  { value: '11:50 – 12:10 EST (NY Lunch Macro)', label: '⏰ 11:50 – 12:10 EST (NY Lunch Macro)' },
  { value: '13:10 – 13:40 EST (NY Afternoon Macro)', label: '⏰ 13:10 – 13:40 EST (Post-Lunch Macro)' },
  { value: '13:50 – 14:10 EST (NY PM Continuation Macro)', label: '⏰ 13:50 – 14:10 EST (NY PM Macro)' },
  { value: '15:15 – 15:45 EST (Market Close Macro)', label: '⏰ 15:15 – 15:45 EST (Market Close Macro)' },
  
  // ICT London Macros
  { value: '02:33 – 03:00 EST (London AM Macro)', label: '🇬🇧 02:33 – 03:00 EST (London AM Macro)' },
  { value: '04:03 – 04:30 EST (London Open Macro)', label: '🇬🇧 04:03 – 04:30 EST (London Open Macro)' },
  
  // Standart Sessiyalar
  { value: 'New York AM (09:30 - 11:30)', label: '🇺🇸 New York AM (09:30 - 11:30)' },
  { value: 'New York PM (13:30 - 16:00)', label: '🇺🇸 New York PM (13:30 - 16:00)' },
  { value: 'London sessiyasi (London Open)', label: '🇬🇧 London sessiyasi (03:00 - 11:30)' },
  { value: 'Asia / Osiyo sessiyasi', label: '🌏 Asia / Osiyo sessiyasi (20:00 - 02:00)' },
  { value: 'Pre-Market (08:30 - 09:30)', label: '⚡ Pre-Market (08:30 - 09:30)' },
  { value: 'CUSTOM', label: '✏️ Boshqa sessiya (qo‘lda yozish)' },
];

export const NewTradeModal: React.FC<NewTradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTrade,
  accounts,
  activeAccountId,
  prefillChecklistScore = 0,
  prefillChecklistTotal = 7,
  prefillSessionSweep = false,
}) => {
  // Active Tab inside modal
  const [activeTab, setActiveTab] = useState<'main' | 'checklist' | 'notion' | 'photos'>('main');

  // Account
  const [accountId, setAccountId] = useState(activeAccountId || 'acc-tradify');

  // Order Name
  const [orderName, setOrderName] = useState('Order');
  const [instrument, setInstrument] = useState('MNQ');
  const [isCustomInstrument, setIsCustomInstrument] = useState(false);
  const [isCustomSession, setIsCustomSession] = useState(false);
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

  // Checklist Checkboxes (galochkalar - barchasi boshida belgilanmagan)
  const [asiaSweep, setAsiaSweep] = useState(false);
  const [londonSweep, setLondonSweep] = useState(false);
  const [sessionSweep, setSessionSweep] = useState(false);
  const [htfFvgOb, setHtfFvgOb] = useState(false);
  const [ltfConfirmation, setLtfConfirmation] = useState(false);
  const [clearTarget, setClearTarget] = useState(false);
  const [riskShieldOk, setRiskShieldOk] = useState(false);

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
      const isKnownInst = POPULAR_INSTRUMENTS.some((i) => i.symbol === editTrade.instrument);
      setInstrument(editTrade.instrument || 'MNQ');
      setIsCustomInstrument(!isKnownInst && !!editTrade.instrument);
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
      const isKnownSess = SESSION_OPTIONS.some((s) => s.value === editTrade.trading_session);
      setTradingSession(editTrade.trading_session || 'После открытия рынка (9:30)');
      setIsCustomSession(!isKnownSess && !!editTrade.trading_session);
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
      setInstrument('MNQ');
      setIsCustomInstrument(false);
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

      setAsiaSweep(false);
      setLondonSweep(false);
      setSessionSweep(prefillSessionSweep || false);
      setHtfFvgOb(false);
      setLtfConfirmation(false);
      setClearTarget(false);
      setRiskShieldOk(false);

      setEntryReason('');
      setSlReason('');
      setTradingSession('После открытия рынка (9:30)');
      setIsCustomSession(false);
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
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        { s: 'MNQ', l: 'MNQ (Nasdaq)' },
                        { s: 'MES', l: 'MES (ES / SPX 500)' },
                        { s: 'MGC', l: 'MGC (Gold)' },
                      ].map((item) => (
                        <button
                          key={item.s}
                          type="button"
                          onClick={() => {
                            setInstrument(item.s);
                            setIsCustomInstrument(false);
                          }}
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-lg border transition ${
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

                {/* Date & Emotion (Vaqt va Kontrakt avtomatik olinadi, ortiqcha yuk yo'q) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Дата (Sana) <span className="text-emerald-400">*</span>
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
                      Эмоция какая была?
                    </label>
                    <select
                      value={mentalState}
                      onChange={(e) => setMentalState(e.target.value as MentalState)}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="NO">NO (Neytral / Xotirjam)</option>
                      <option value="Xotirjam">Xotirjam (Reja bo‘yicha)</option>
                      <option value="Bozor ochilishiga shoshilish">Shoshilish (Open rush)</option>
                      <option value="Yurak siqildi">Yurak siqildi (Fomo)</option>
                      <option value="Asab / Alam olish">Asab / Alam olish (Revenge)</option>
                    </select>
                  </div>
                </div>

                {/* Notion Risk & R:R & Natija */}
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
                      SL (0 yoki -1)
                    </label>
                    <input
                      type="text"
                      value={slPips}
                      onChange={(e) => setSlPips(e.target.value)}
                      placeholder="0 yoki -1"
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
                      placeholder="2.1"
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
                      <option value="PROFIT">Прибыльная (TP)</option>
                      <option value="LOSS">Убыточная (SL)</option>
                      <option value="BE">БУ (Bezubitok)</option>
                    </select>
                  </div>
                </div>

                {/* Asosiy Sof Foyda / Zarar (Net P&L) */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-2 border-emerald-500/40 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-slate-200 font-bold mb-1 text-xs flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Чистый P&L ($)</span>
                        <span className="text-emerald-400 font-bold">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        placeholder="+301.41 yoki -100"
                        value={netPnl}
                        onChange={(e) => {
                          setNetPnl(e.target.value);
                          if (!grossPnl) setGrossPnl(e.target.value);
                          const n = parseFloat(e.target.value) || 0;
                          const pct = (n / 50000) * 100;
                          setPnlPercent(`${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`);
                          if (n > 0) setResultTag('PROFIT');
                          else if (n < 0) setResultTag('LOSS');
                        }}
                        className="w-full bg-[#131b2e] border border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-white font-mono font-black text-sm focus:outline-none focus:border-emerald-400 shadow-inner"
                      />
                    </div>

                    <div className="sm:w-44 flex flex-col justify-end">
                      <span className="text-[11px] text-slate-400 block mb-1">P&L Foizi (Balansdan):</span>
                      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono font-bold text-xs text-center text-emerald-400">
                        {pnlPercent || (netPnl ? `${((parseFloat(netPnl) || 0) / 500).toFixed(2)}%` : '+0.00%')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qo'shimcha narxlar va parametrlar (Ixtiyoriy yashirin quti) */}
                <details className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 group">
                  <summary className="cursor-pointer text-[11px] font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-between select-none">
                    <span>⚙️ Qo‘shimcha narxlar va kontrakt (ixtiyoriy)</span>
                    <span className="text-[10px] text-slate-500 font-mono group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Vaqt:</label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Kontrakt (Qty):</label>
                        <input
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Komissiya ($):</label>
                        <input
                          type="number"
                          step="0.01"
                          value={commission}
                          onChange={(e) => setCommission(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Yalpi Gross ($):</label>
                        <input
                          type="number"
                          step="0.01"
                          value={grossPnl}
                          onChange={(e) => setGrossPnl(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Kirish narxi:</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="31198.75"
                          value={entryPrice}
                          onChange={(e) => setEntryPrice(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Stop Loss narxi:</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="31183.75"
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Chiqish narxi:</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="31350.50"
                          value={exitPrice}
                          onChange={(e) => setExitPrice(e.target.value)}
                          className="w-full bg-[#131b2e] border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </details>

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
                        sessionSweep ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {sessionSweep ? <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-600 shrink-0" />}
                        <div>
                          <strong className="block text-xs flex items-center gap-1.5">
                            3. Sessiya High / Low Sweep (Asosiy Shart)
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-mono">Majburiy</span>
                          </strong>
                          <span className="text-[11px] text-slate-400">Sweep bo‘lsa belgilang (eng muhim signal)</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sessionSweep ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {sessionSweep ? 'SWEEP BOR' : 'YO‘Q'}
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-medium">
                        Торговая сессия
                      </label>
                      {tradingSession && (
                        <span className="text-[10px] text-cyan-400 font-medium truncate max-w-[140px]">
                          {tradingSession}
                        </span>
                      )}
                    </div>

                    {/* Session Dropdown */}
                    <select
                      value={
                        SESSION_OPTIONS.some((s) => s.value === tradingSession)
                          ? tradingSession
                          : 'CUSTOM'
                      }
                      onChange={(e) => {
                        if (e.target.value !== 'CUSTOM') {
                          setTradingSession(e.target.value);
                          setIsCustomSession(false);
                        } else {
                          setIsCustomSession(true);
                        }
                      }}
                      className="w-full bg-[#131b2e] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {SESSION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {/* Custom input if "CUSTOM" or not in predefined list */}
                    {(isCustomSession || !SESSION_OPTIONS.some((s) => s.value === tradingSession)) && (
                      <input
                        type="text"
                        placeholder="Sessiyani kiriting: masalan 11:30 - 12:30 Lunch..."
                        value={tradingSession}
                        onChange={(e) => setTradingSession(e.target.value)}
                        className="w-full mt-1.5 bg-[#131b2e] border border-cyan-500/60 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400 animate-in fade-in duration-100"
                      />
                    )}

                    {/* Quick Session & Macro Badges */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        { v: 'После открытия рынка (9:30)', l: '9:30 Open' },
                        { v: '09:50 – 10:10 EST (NY AM Open Macro)', l: '09:50-10:10 Macro' },
                        { v: '10:50 – 11:10 EST (NY AM Continuation Macro)', l: '10:50-11:10 Macro' },
                        { v: '13:10 – 13:40 EST (NY Afternoon Macro)', l: '13:10-13:40 Macro' },
                        { v: '13:50 – 14:10 EST (NY PM Continuation Macro)', l: '13:50-14:10 Macro' },
                        { v: 'London sessiyasi (London Open)', l: 'London' },
                      ].map((s) => (
                        <button
                          key={s.v}
                          type="button"
                          onClick={() => {
                            setTradingSession(s.v);
                            setIsCustomSession(false);
                          }}
                          className={`text-[9.5px] px-2 py-0.5 rounded-lg border transition ${
                            tradingSession === s.v
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {s.l}
                        </button>
                      ))}
                    </div>
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
