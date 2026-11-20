import { ChecklistItem, Trade, UserSettings, PropAccount } from '../types/journal';
import { DEFAULT_CHECKLIST_ITEMS, DEFAULT_SETTINGS, INITIAL_TRADES } from '../constants/initialData';
import { getSupabaseClient } from './supabase';

const TRADES_STORAGE_KEY = 'trading_journal_sdelkalar_v2_tradovate';
const SETTINGS_STORAGE_KEY = 'trading_journal_sozlamalar_v2_tradovate';
const CHECKLIST_STORAGE_KEY = 'trading_journal_tekshiruv_v2_tradovate';
const PROP_ACCOUNTS_STORAGE_KEY = 'trading_journal_prop_accounts_v1';
const ACTIVE_ACCOUNT_STORAGE_KEY = 'trading_journal_active_account_id_v1';

export const DEFAULT_PROP_ACCOUNTS: PropAccount[] = [
  {
    id: 'acc-tradify',
    name: 'Tradify 50K',
    firm: 'Tradify',
    market_type: 'futures',
    drawdown_type: 'trailing',
    initial_balance: 50000,
    trailing_drawdown_amount: 2000,
    daily_loss_limit: 1000,
    max_contracts: 5,
    created_at: '2026-10-01T00:00:00Z',
    is_active: true,
    description: 'Tradovate MNQ / MGC mikro sdelkalar hisobi (Trailing DD ko‘tariladi)',
  },
  {
    id: 'acc-backtest',
    name: 'Backtest (FxReplay / Sim)',
    firm: 'Backtest',
    market_type: 'backtest',
    drawdown_type: 'trailing',
    initial_balance: 50000,
    trailing_drawdown_amount: 2000,
    daily_loss_limit: 1000,
    max_contracts: 5,
    created_at: '2026-10-01T00:00:00Z',
    is_active: false,
    description: 'owner:said | Tarixiy testlar, FxReplay va strategiya backtest Notion jurnali',
  },
];

export const SHAXZOD_DEFAULT_ACCOUNTS: PropAccount[] = [
  {
    id: 'acc-shaxzod-prop',
    name: 'Shaxzod Prop 50K',
    firm: 'Tradify',
    market_type: 'futures',
    drawdown_type: 'trailing',
    initial_balance: 50000,
    trailing_drawdown_amount: 2000,
    daily_loss_limit: 1000,
    max_contracts: 5,
    created_at: '2026-11-20T00:00:00Z',
    is_active: true,
    description: 'owner:shaxzod | Shaxzodning prop hisobi',
  },
  {
    id: 'acc-shaxzod-backtest',
    name: 'Shaxzod Backtest',
    firm: 'Backtest',
    market_type: 'backtest',
    drawdown_type: 'trailing',
    initial_balance: 50000,
    trailing_drawdown_amount: 2000,
    daily_loss_limit: 1000,
    max_contracts: 5,
    created_at: '2026-11-20T00:00:00Z',
    is_active: false,
    description: 'owner:shaxzod | Shaxzodning tarixiy testlar Notion jurnali',
  },
];

export const getUserFilteredAccounts = (allAccounts: PropAccount[], username: string): PropAccount[] => {
  const cleanUser = (username || 'said').toLowerCase();
  if (cleanUser === 'shaxzod') {
    const shaxzodAccs = allAccounts.filter(
      (a) => (a.description && a.description.includes('owner:shaxzod')) || a.id.includes('shaxzod')
    );
    if (shaxzodAccs.length > 0) return shaxzodAccs;
    return SHAXZOD_DEFAULT_ACCOUNTS;
  }

  // Saida'lo (Said) accounts
  return allAccounts.filter(
    (a) => !a.id.includes('shaxzod') && (!a.description || !a.description.includes('owner:shaxzod'))
  );
};

// Helper: Prop Accounts
export const getLocalPropAccounts = (): PropAccount[] => {
  try {
    const raw = localStorage.getItem(PROP_ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROP_ACCOUNTS_STORAGE_KEY, JSON.stringify(DEFAULT_PROP_ACCOUNTS));
      return DEFAULT_PROP_ACCOUNTS;
    }
    const parsed: PropAccount[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PROP_ACCOUNTS;
    }
    // Ensure default Backtest account exists in the list
    if (!parsed.some((a) => a.id === 'acc-backtest' || a.firm === 'Backtest')) {
      const backtestAcc = DEFAULT_PROP_ACCOUNTS.find((a) => a.id === 'acc-backtest');
      if (backtestAcc) {
        parsed.push(backtestAcc);
        localStorage.setItem(PROP_ACCOUNTS_STORAGE_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch (e) {
    console.error('Lokal prop hisoblarni o‘qishda xatolik:', e);
    return DEFAULT_PROP_ACCOUNTS;
  }
};

export const setLocalPropAccounts = (accounts: PropAccount[]): void => {
  try {
    localStorage.setItem(PROP_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Lokal prop hisoblarni saqlashda xatolik:', e);
  }
};

export const getActiveAccountId = (): string => {
  try {
    const saved = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
    if (saved) return saved;
  } catch (e) {
    // fallback
  }
  return 'acc-tradify';
};

export const setActiveAccountId = (id: string): void => {
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, id);
  } catch (e) {
    console.error('Faol hisobni saqlashda xatolik:', e);
  }
};

// Helper: LocalStorage
export const getLocalTrades = (): Trade[] => {
  try {
    const raw = localStorage.getItem(TRADES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(INITIAL_TRADES));
      return INITIAL_TRADES;
    }
    const parsed: Trade[] = JSON.parse(raw);
    // Ensure all trades have account_id
    const normalized = parsed.map((t) => ({
      ...t,
      account_id: t.account_id || 'acc-tradify',
      account_name: t.account_name || 'Tradify 50K',
    }));
    return normalized;
  } catch (e) {
    console.error('Lokal sdelkalarni o‘qishda xatolik:', e);
    return INITIAL_TRADES;
  }
};

export const setLocalTrades = (trades: Trade[]): void => {
  try {
    localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
  } catch (e) {
    console.error('Lokal sdelkalarni saqlashda xatolik:', e);
  }
};

export const getLocalSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Lokal sozlamalarni o‘qishda xatolik:', e);
    return DEFAULT_SETTINGS;
  }
};

export const setLocalSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Lokal sozlamalarni saqlashda xatolik:', e);
  }
};

export const getLocalChecklistItems = (): ChecklistItem[] => {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
      return DEFAULT_CHECKLIST_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Lokal checklist shartlarini o‘qishda xatolik:', e);
    return DEFAULT_CHECKLIST_ITEMS;
  }
};

export const setLocalChecklistItems = (items: ChecklistItem[]): void => {
  try {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Lokal checklist shartlarini saqlashda xatolik:', e);
  }
};

// Async Unified Operations with Supabase Sync
export const fetchAllTrades = async (settings?: UserSettings): Promise<{ trades: Trade[]; isSupabase: boolean }> => {
  const currentSettings = settings || getLocalSettings();
  const client = getSupabaseClient(currentSettings.supabase_url, currentSettings.supabase_anon_key);

  if (client) {
    try {
      const { data, error } = await client
        .from('sdelkalar')
        .select('*')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (!error && data) {
        if (data.length === 0) {
          // Cloud table is newly created and empty: auto-seed trades to Supabase
          const initialTrades = getLocalTrades().length > 0 ? getLocalTrades() : INITIAL_TRADES;
          const rows = initialTrades.map((t) => ({
            id: t.id,
            account_id: t.account_id || 'acc-tradify',
            account_name: t.account_name || 'Tradify 50K',
            date: t.date,
            time: t.time || '',
            instrument: t.instrument,
            direction: t.direction,
            quantity: t.quantity,
            entry_price: t.entry_price,
            stop_loss: t.stop_loss,
            exit_price: t.exit_price,
            gross_pnl: t.gross_pnl,
            commission: t.commission,
            net_pnl: t.net_pnl,
            duration: t.duration,
            checklist_score: t.checklist_score,
            checklist_total: t.checklist_total,
            discipline: t.discipline,
            session_sweep: t.session_sweep,
            asia_sweep: t.asia_sweep,
            london_sweep: t.london_sweep,
            htf_fvg_ob: t.htf_fvg_ob,
            ltf_confirmation: t.ltf_confirmation,
            clear_target: t.clear_target,
            risk_shield_ok: t.risk_shield_ok,
            mental_state: t.mental_state,
            risk_percent: t.risk_percent,
            sl_pips: t.sl_pips,
            rr_ratio: t.rr_ratio,
            followed_rules: t.followed_rules,
            pnl_percent: t.pnl_percent,
            result_tag: t.result_tag,
            before_photo: t.before_photo,
            in_trade_photo: t.in_trade_photo,
            after_photo: t.after_photo,
            entry_reason: t.entry_reason,
            sl_reason: t.sl_reason,
            trading_session: t.trading_session,
            news: t.news,
            mistake_category: t.mistake_category,
            htf_trend: t.htf_trend,
            smt_divergence: t.smt_divergence,
            smt_nq: t.smt_nq,
            smt_es: t.smt_es,
            notes: t.notes,
            chart_url: t.chart_url,
            created_at: t.created_at,
          }));
          await client.from('sdelkalar').insert(rows);
          setLocalTrades(initialTrades);
          return { trades: initialTrades, isSupabase: true };
        }

        // Map snake_case to Trade object
        const mapped: Trade[] = data.map((row: any) => ({
          id: row.id,
          account_id: row.account_id || 'acc-tradify',
          account_name: row.account_name || 'Tradify 50K',
          date: row.date,
          time: row.time || '',
          instrument: row.instrument,
          direction: row.direction,
          quantity: Number(row.quantity) || 1,
          entry_price: Number(row.entry_price) || 0,
          stop_loss: Number(row.stop_loss) || 0,
          exit_price: Number(row.exit_price) || 0,
          gross_pnl: Number(row.gross_pnl) || 0,
          commission: Number(row.commission) || 0,
          net_pnl: Number(row.net_pnl) || 0,
          duration: row.duration || '0m',
          checklist_score: Number(row.checklist_score) || 0,
          checklist_total: Number(row.checklist_total) || 5,
          discipline: row.discipline || 'PARTIAL',
          session_sweep: Boolean(row.session_sweep),
          asia_sweep: row.asia_sweep !== undefined ? Boolean(row.asia_sweep) : false,
          london_sweep: row.london_sweep !== undefined ? Boolean(row.london_sweep) : false,
          htf_fvg_ob: row.htf_fvg_ob !== undefined ? Boolean(row.htf_fvg_ob) : false,
          ltf_confirmation: row.ltf_confirmation !== undefined ? Boolean(row.ltf_confirmation) : false,
          clear_target: row.clear_target !== undefined ? Boolean(row.clear_target) : false,
          risk_shield_ok: row.risk_shield_ok !== undefined ? Boolean(row.risk_shield_ok) : false,
          mental_state: row.mental_state || 'NO',
          risk_percent: Number(row.risk_percent) || 0.2,
          sl_pips: Number(row.sl_pips) || 0,
          rr_ratio: Number(row.rr_ratio) || 0,
          followed_rules: row.followed_rules !== undefined ? Boolean(row.followed_rules) : true,
          pnl_percent: Number(row.pnl_percent) || 0,
          result_tag: row.result_tag || 'PROFIT',
          before_photo: row.before_photo || '',
          in_trade_photo: row.in_trade_photo || '',
          after_photo: row.after_photo || '',
          entry_reason: row.entry_reason || '',
          sl_reason: row.sl_reason || '',
          trading_session: row.trading_session || '',
          news: row.news || '',
          mistake_category: row.mistake_category || '',
          htf_trend: row.htf_trend || '',
          smt_divergence: row.smt_divergence || '',
          smt_nq: row.smt_nq || '',
          smt_es: row.smt_es || '',
          notes: row.notes || '',
          chart_url: row.chart_url || '',
          created_at: row.created_at || new Date().toISOString(),
        }));

        setLocalTrades(mapped); // Cache locally
        return { trades: mapped, isSupabase: true };
      }
    } catch (err) {
      console.warn('Supabase’dan sdelkalarni olishda xatolik, lokal xotiraga o‘tilmoqda:', err);
    }
  }

  // Fallback to local
  return { trades: getLocalTrades(), isSupabase: false };
};

export const createTradeRecord = async (trade: Trade, settings?: UserSettings): Promise<{ success: boolean; isSupabase: boolean }> => {
  const currentSettings = settings || getLocalSettings();
  const client = getSupabaseClient(currentSettings.supabase_url, currentSettings.supabase_anon_key);

  // Update local storage first
  const currentLocal = getLocalTrades();
  const updatedLocal = [trade, ...currentLocal.filter((t) => t.id !== trade.id)];
  setLocalTrades(updatedLocal);

  if (client) {
    try {
      const { error } = await client.from('sdelkalar').insert([
        {
          id: trade.id,
          account_id: trade.account_id || 'acc-tradify',
          account_name: trade.account_name || 'Tradify 50K',
          date: trade.date,
          time: trade.time || '',
          instrument: trade.instrument,
          direction: trade.direction,
          quantity: trade.quantity,
          entry_price: trade.entry_price,
          stop_loss: trade.stop_loss,
          exit_price: trade.exit_price,
          gross_pnl: trade.gross_pnl,
          commission: trade.commission,
          net_pnl: trade.net_pnl,
          duration: trade.duration,
          checklist_score: trade.checklist_score,
          checklist_total: trade.checklist_total,
          discipline: trade.discipline,
          session_sweep: trade.session_sweep,
          asia_sweep: trade.asia_sweep,
          london_sweep: trade.london_sweep,
          htf_fvg_ob: trade.htf_fvg_ob,
          ltf_confirmation: trade.ltf_confirmation,
          clear_target: trade.clear_target,
          risk_shield_ok: trade.risk_shield_ok,
          mental_state: trade.mental_state,
          risk_percent: trade.risk_percent,
          sl_pips: trade.sl_pips,
          rr_ratio: trade.rr_ratio,
          followed_rules: trade.followed_rules,
          pnl_percent: trade.pnl_percent,
          result_tag: trade.result_tag,
          before_photo: trade.before_photo,
          in_trade_photo: trade.in_trade_photo,
          after_photo: trade.after_photo,
          entry_reason: trade.entry_reason,
          sl_reason: trade.sl_reason,
          trading_session: trade.trading_session,
          news: trade.news,
          mistake_category: trade.mistake_category,
          htf_trend: trade.htf_trend,
          smt_divergence: trade.smt_divergence,
          smt_nq: trade.smt_nq,
          smt_es: trade.smt_es,
          notes: trade.notes,
          chart_url: trade.chart_url,
          created_at: trade.created_at,
        },
      ]);

      if (!error) {
        return { success: true, isSupabase: true };
      }
      console.warn('Supabase insert xatosi:', error.message);
    } catch (err) {
      console.warn('Supabase insert bajarilmadi:', err);
    }
  }

  return { success: true, isSupabase: false };
};

export const updateTradeRecord = async (trade: Trade, settings?: UserSettings): Promise<{ success: boolean; isSupabase: boolean }> => {
  const currentSettings = settings || getLocalSettings();
  const client = getSupabaseClient(currentSettings.supabase_url, currentSettings.supabase_anon_key);

  const currentLocal = getLocalTrades();
  const updatedLocal = currentLocal.map((t) => (t.id === trade.id ? trade : t));
  setLocalTrades(updatedLocal);

  if (client) {
    try {
      const { error } = await client
        .from('sdelkalar')
        .update({
          account_id: trade.account_id || 'acc-tradify',
          account_name: trade.account_name || 'Tradify 50K',
          date: trade.date,
          time: trade.time || '',
          instrument: trade.instrument,
          direction: trade.direction,
          quantity: trade.quantity,
          entry_price: trade.entry_price,
          stop_loss: trade.stop_loss,
          exit_price: trade.exit_price,
          gross_pnl: trade.gross_pnl,
          commission: trade.commission,
          net_pnl: trade.net_pnl,
          duration: trade.duration,
          checklist_score: trade.checklist_score,
          checklist_total: trade.checklist_total,
          discipline: trade.discipline,
          session_sweep: trade.session_sweep,
          asia_sweep: trade.asia_sweep,
          london_sweep: trade.london_sweep,
          htf_fvg_ob: trade.htf_fvg_ob,
          ltf_confirmation: trade.ltf_confirmation,
          clear_target: trade.clear_target,
          risk_shield_ok: trade.risk_shield_ok,
          mental_state: trade.mental_state,
          risk_percent: trade.risk_percent,
          sl_pips: trade.sl_pips,
          rr_ratio: trade.rr_ratio,
          followed_rules: trade.followed_rules,
          pnl_percent: trade.pnl_percent,
          result_tag: trade.result_tag,
          before_photo: trade.before_photo,
          in_trade_photo: trade.in_trade_photo,
          after_photo: trade.after_photo,
          entry_reason: trade.entry_reason,
          sl_reason: trade.sl_reason,
          trading_session: trade.trading_session,
          news: trade.news,
          mistake_category: trade.mistake_category,
          htf_trend: trade.htf_trend,
          smt_divergence: trade.smt_divergence,
          smt_nq: trade.smt_nq,
          smt_es: trade.smt_es,
          notes: trade.notes,
          chart_url: trade.chart_url,
        })
        .eq('id', trade.id);

      if (!error) {
        return { success: true, isSupabase: true };
      }
    } catch (err) {
      console.warn('Supabase update xatosi:', err);
    }
  }

  return { success: true, isSupabase: false };
};

export const deleteTradeRecord = async (id: string, settings?: UserSettings): Promise<{ success: boolean; isSupabase: boolean }> => {
  const currentSettings = settings || getLocalSettings();
  const client = getSupabaseClient(currentSettings.supabase_url, currentSettings.supabase_anon_key);

  const currentLocal = getLocalTrades();
  const updatedLocal = currentLocal.filter((t) => t.id !== id);
  setLocalTrades(updatedLocal);

  if (client) {
    try {
      const { error } = await client.from('sdelkalar').delete().eq('id', id);
      if (!error) {
        return { success: true, isSupabase: true };
      }
    } catch (err) {
      console.warn('Supabase delete xatosi:', err);
    }
  }

  return { success: true, isSupabase: false };
};

export const resetAllToDemo = (): void => {
  localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(INITIAL_TRADES));
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(DEFAULT_CHECKLIST_ITEMS));
};
