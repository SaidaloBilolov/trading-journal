import { ChecklistItem, Trade, UserSettings } from '../types/journal';
import { DEFAULT_CHECKLIST_ITEMS, DEFAULT_SETTINGS, INITIAL_TRADES } from '../constants/initialData';
import { getSupabaseClient } from './supabase';

const TRADES_STORAGE_KEY = 'trading_journal_sdelkalar_v2_tradovate';
const SETTINGS_STORAGE_KEY = 'trading_journal_sozlamalar_v2_tradovate';
const CHECKLIST_STORAGE_KEY = 'trading_journal_tekshiruv_v2_tradovate';

// Helper: LocalStorage
export const getLocalTrades = (): Trade[] => {
  try {
    const raw = localStorage.getItem(TRADES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(INITIAL_TRADES));
      return INITIAL_TRADES;
    }
    return JSON.parse(raw);
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
          // Cloud table is newly created and empty: auto-seed all Tradovate trades to Supabase
          const initialTrades = INITIAL_TRADES;
          const rows = initialTrades.map((t) => ({
            id: t.id,
            date: t.date,
            time: t.time,
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
            mental_state: t.mental_state,
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
          date: row.date,
          time: row.time || '12:00',
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
          mental_state: row.mental_state || 'Xotirjam',
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
          date: trade.date,
          time: trade.time,
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
          mental_state: trade.mental_state,
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
          date: trade.date,
          time: trade.time,
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
          mental_state: trade.mental_state,
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
