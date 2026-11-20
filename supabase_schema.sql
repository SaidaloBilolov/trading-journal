-- ==============================================================================
-- TRADING JOURNAL & DISCIPLINE NAZORATCHISI - TO'LIQ SUPABASE SQL KODI
-- Ushbu SQL kodni Supabase boshqaruv panelining "SQL Editor" bo'limiga qo'yib,
-- "RUN" tugmasini bosing.
-- ==============================================================================

-- 1. Sdelkalar jadvali (Savdo jurnali yozuvlari)
CREATE TABLE IF NOT EXISTS public.sdelkalar (
    id TEXT PRIMARY KEY,
    account_id TEXT DEFAULT 'acc-tradify',
    account_name TEXT DEFAULT 'Tradify 50K',
    date DATE NOT NULL,
    time TEXT DEFAULT '',
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
    asia_sweep BOOLEAN DEFAULT false,
    london_sweep BOOLEAN DEFAULT false,
    htf_fvg_ob BOOLEAN DEFAULT false,
    ltf_confirmation BOOLEAN DEFAULT false,
    clear_target BOOLEAN DEFAULT false,
    risk_shield_ok BOOLEAN DEFAULT false,
    mental_state TEXT DEFAULT 'NO',
    risk_percent NUMERIC DEFAULT 0.2,
    sl_pips NUMERIC DEFAULT 0,
    rr_ratio NUMERIC DEFAULT 0,
    followed_rules BOOLEAN DEFAULT true,
    pnl_percent NUMERIC DEFAULT 0,
    result_tag TEXT DEFAULT 'PROFIT',
    before_photo TEXT,
    in_trade_photo TEXT,
    after_photo TEXT,
    entry_reason TEXT,
    sl_reason TEXT,
    trading_session TEXT,
    news TEXT,
    mistake_category TEXT,
    htf_trend TEXT,
    smt_divergence TEXT,
    smt_nq TEXT,
    smt_es TEXT,
    notes TEXT,
    chart_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tezkor qidiruv indekslari
CREATE INDEX IF NOT EXISTS idx_sdelkalar_date ON public.sdelkalar(date DESC);
CREATE INDEX IF NOT EXISTS idx_sdelkalar_account ON public.sdelkalar(account_id);
CREATE INDEX IF NOT EXISTS idx_sdelkalar_instrument ON public.sdelkalar(instrument);

-- 2. Prop Hisoblar jadvali
CREATE TABLE IF NOT EXISTS public.prop_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    firm TEXT NOT NULL,
    market_type TEXT DEFAULT 'futures',
    drawdown_type TEXT DEFAULT 'trailing',
    initial_balance NUMERIC DEFAULT 50000,
    trailing_drawdown_amount NUMERIC DEFAULT 2000,
    daily_loss_limit NUMERIC DEFAULT 1000,
    max_contracts INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standart prop hisoblarni kiritish
INSERT INTO public.prop_accounts (id, name, firm, market_type, drawdown_type, initial_balance, trailing_drawdown_amount, is_active, description)
VALUES 
  ('acc-tradify', 'Tradify 50K', 'Tradify', 'futures', 'trailing', 50000, 2000, true, 'Tradovate Futures hisobi'),
  ('acc-backtest', 'Backtest (FxReplay / Sim)', 'Backtest', 'backtest', 'trailing', 50000, 2000, false, 'Backtest Notion jurnali')
ON CONFLICT (id) DO NOTHING;

-- 3. Foydalanuvchi sozlamalari jadvali
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

INSERT INTO public.sozlamalar (id, initial_balance, max_drawdown_limit, max_daily_loss, max_daily_trades, risk_per_trade, min_checklist_score, require_session_sweep)
VALUES ('user_settings', 50000, 48000, 300, 3, 45, 4, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Savdodan oldingi tekshiruv shartlari (Checklist)
CREATE TABLE IF NOT EXISTS public.tekshiruv_shartlari (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 1
);

INSERT INTO public.tekshiruv_shartlari (id, title, description, is_mandatory, enabled, sort_order)
VALUES
  ('session-sweep', 'Sessiya High / Low Sweep (Asosiy Shart)', 'Osiyo yoki London likvidligi olindimi?', true, true, 1),
  ('htf-zone', 'H4 / H1 Zona (FVG yoki OB)', 'Yuqori taymfreymdagi mos POI zonasi bormi?', false, true, 2),
  ('ltf-confirmation', 'M1 / M3 / M5 Tasdiq (FVG yoki iFVG)', 'Kichik taymfreymda bozor strukturasi sinishi (MSS) bormi?', false, true, 3),
  ('clear-target', 'Aniq Target (Eng yaqin Low yoki High)', 'Likvidlik nishoni aniq belgilandimi?', false, true, 4),
  ('risk-and-shield', 'Risk va Kunlik Qalqon', '1 mikro kontrakt, maksimal risk ~$40-$45, limit buzilmaganmi?', false, true, 5)
ON CONFLICT (id) DO NOTHING;

-- 5. Row Level Security (RLS) va Ruxsatlar (Grants)
ALTER TABLE public.sdelkalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sozlamalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tekshiruv_shartlari ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.sdelkalar TO anon, authenticated, service_role;
GRANT ALL ON public.prop_accounts TO anon, authenticated, service_role;
GRANT ALL ON public.sozlamalar TO anon, authenticated, service_role;
GRANT ALL ON public.tekshiruv_shartlari TO anon, authenticated, service_role;

CREATE POLICY "Barchaga sdelkalarni o‘qish va yozish ruxsati" ON public.sdelkalar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga prop hisoblarni o‘qish va yozish ruxsati" ON public.prop_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga sozlamalarni o‘qish va yozish ruxsati" ON public.sozlamalar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga shartlarni o‘qish va yozish ruxsati" ON public.tekshiruv_shartlari FOR ALL USING (true) WITH CHECK (true);
