export type TradeDirection = 'Long' | 'Short';

export type DisciplineLevel = 'A_PLUS' | 'PARTIAL' | 'RULE_VIOLATION';

export type MentalState = 
  | 'Xotirjam'
  | 'Yurak siqildi'
  | 'Bozor ochilishiga shoshilish'
  | 'Asab / Alam olish'
  | 'NO'
  | string;

export type ResultTag = 'PROFIT' | 'LOSS' | 'BE';

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  full_time?: string; // HH:mm:ss
  instrument: string; // MNQZ6, MGCZ6, MESZ6, NAS100, etc.
  direction: TradeDirection;
  quantity: number; // Kontrakt / Lot
  entry_price: number;
  stop_loss: number;
  exit_price: number;
  gross_pnl: number;
  commission: number;
  net_pnl: number;
  duration: string; // masalan: "12m 30s"
  checklist_score: number;
  checklist_total: number;
  discipline: DisciplineLevel;
  session_sweep: boolean;
  mental_state: MentalState;
  notes: string;
  chart_url: string; // Asosiy grafik havolasi
  created_at: string;

  // Notion-style exact fields (from User Screenshots 1-4)
  risk_percent?: number; // masalan: 0.2
  sl_pips?: number; // masalan: -1 yoki 0
  rr_ratio?: number; // masalan: 2.1, 4.0, -1.0
  followed_rules?: boolean; // ДА / НЕТ
  pnl_percent?: number; // masalan: 0%, -0.32%
  result_tag?: ResultTag; // БУ / Прибыльная / Убыточная
  before_photo?: string; // Before Trade / Photo URL
  in_trade_photo?: string; // In Trade Photo URL
  after_photo?: string; // After Trade / Photo URL
  entry_reason?: string; // Причины сделки (masalan: Trend Buy edi...)
  sl_reason?: string; // Причины Stop Loss (masalan: bozor yurmadi...)
  trading_session?: string; // Торговая сессия (masalan: После открытия рынка (9:30)...)
  news?: string; // Сегодня какие новости
  mistake_category?: string; // Категория ошибки (masalan: 🟢 Нет ошибки (TP)...)
  htf_trend?: string; // HTF Trend (masalan: 🟢 Bullish / 🔴 Bearish)
  smt_divergence?: string; // SMT Divergence about (masalan: Silver uje sweep...)
  smt_nq?: string; // SMT Divergence NQ (link)
  smt_es?: string; // SMT Divergence ES (link)

  // Account attribution
  account_id?: string; // masalan: 'acc-tradify'
  account_name?: string; // masalan: 'Tradify 50K'

  // Specific setup checklists (galochkalar)
  asia_sweep?: boolean;
  london_sweep?: boolean;
  htf_fvg_ob?: boolean;
  ltf_confirmation?: boolean;
  clear_target?: boolean;
  risk_shield_ok?: boolean;
}

export interface PropAccount {
  id: string;
  name: string;
  firm: string; // Tradify, Apex, Topstep, FundedNext, MyFundedFutures, Shaxsiy, Boshqa
  initial_balance: number; // masalan: 50000
  trailing_drawdown_amount: number; // masalan: 2000 (pikdan 2k pastda)
  daily_loss_limit: number; // masalan: 1000
  max_contracts: number; // masalan: 5
  created_at: string;
  is_active?: boolean;
  description?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  is_mandatory: boolean;
  enabled: boolean;
}

export interface UserSettings {
  initial_balance: number;
  max_drawdown_limit: number;
  max_daily_loss: number;
  max_daily_trades: number;
  risk_per_trade: number;
  min_checklist_score: number;
  require_session_sweep: boolean;
  supabase_url: string;
  supabase_anon_key: string;
}

export interface DailySummary {
  date: string;
  net_pnl: number;
  trade_count: number;
  win_count: number;
  loss_count: number;
}
