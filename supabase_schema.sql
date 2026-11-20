-- ==============================================================================
-- TRADING JOURNAL & DISCIPLINE NAZORATCHISI - SUPABASE SQL SCHEMA
-- 100% O'zbek tilidagi sharhlar bilan
-- Ushbu SQL kodni Supabase boshqaruv panelining "SQL Editor" bo'limida ishga tushiring
-- ==============================================================================

-- 1. Sdelkalar jadvali (Savdo jurnali yozuvlari)
CREATE TABLE IF NOT EXISTS public.sdelkalar (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    time TEXT DEFAULT '12:00',
    instrument TEXT NOT NULL, -- MNQZ6, MGCZ6, MESZ6, XAU/USD va h.k.
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
    discipline TEXT DEFAULT 'PARTIAL' CHECK (discipline IN ('A_PLUS', 'PARTIAL', 'RULE_VIOLATION')),
    session_sweep BOOLEAN DEFAULT false,
    mental_state TEXT DEFAULT 'Xotirjam',
    notes TEXT,
    chart_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tezkor qidiruv va tartiblash uchun indekslar
CREATE INDEX IF NOT EXISTS idx_sdelkalar_date ON public.sdelkalar(date DESC);
CREATE INDEX IF NOT EXISTS idx_sdelkalar_instrument ON public.sdelkalar(instrument);
CREATE INDEX IF NOT EXISTS idx_sdelkalar_discipline ON public.sdelkalar(discipline);

-- 2. Foydalanuvchi sozlamalari jadvali (Balans va Qalqon parametrlari)
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

-- Standart sozlamalarni kiritish (agar mavjud bo'lmasa)
INSERT INTO public.sozlamalar (id, initial_balance, max_drawdown_limit, max_daily_loss, max_daily_trades, risk_per_trade, min_checklist_score, require_session_sweep)
VALUES ('user_settings', 50000, 48000, 300, 3, 45, 4, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Savdodan oldingi tekshiruv shartlari (Checklist)
CREATE TABLE IF NOT EXISTS public.tekshiruv_shartlari (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 1
);

-- Standart strategiya shartlarini kiritish
INSERT INTO public.tekshiruv_shartlari (id, title, description, is_mandatory, enabled, sort_order)
VALUES
  ('session-sweep', 'Sessiya High / Low Sweep (Asosiy Shart)', 'Osiyo, London yoki avvalgi sessiya High/Low likvidligi aniq olindimi? Belgilanmasa, kirish man etiladi!', true, true, 1),
  ('htf-zone', 'H4 / H1 Zona (FVG yoki OB)', 'Sweep yo‘nalishiga mos yuqori taymfreymdagi kuchli Fair Value Gap (FVG) yoki Order Block (OB) bormi?', false, true, 2),
  ('ltf-confirmation', 'M1 / M3 / M5 Tasdiq (FVG yoki iFVG)', 'Kichik taymfreymda bozor strukturasi sinishi (MSS/BOS) va yangi FVG yoki inversion FVG (iFVG) shakllandimi?', false, true, 3),
  ('clear-target', 'Aniq Target (Eng yaqin Low yoki High)', 'Chiqish maqsadi (TP) eng yaqin likvidlik hovuzi yoki qarama-qarshi FVG chegarasiga aniq belgilandimi?', false, true, 4),
  ('risk-and-shield', 'Risk va Kunlik Qalqon', '1 mikro kontrakt (MNQ/MGC), bitta sdelkadagi maksimal risk ~$40–$45, kunlik zarar va limit buzilmaganmi?', false, true, 5)
ON CONFLICT (id) DO NOTHING;

-- 4. Row Level Security (RLS) xavfsizlik qoidalari
-- Dastlab ochiq anonim o'qish va yozish ruxsati beriladi (Vite Anon Key orqali)
ALTER TABLE public.sdelkalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sozlamalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tekshiruv_shartlari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barchaga sdelkalarni o‘qish va yozish ruxsati" ON public.sdelkalar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga sozlamalarni o‘qish va yozish ruxsati" ON public.sozlamalar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Barchaga shartlarni o‘qish va yozish ruxsati" ON public.tekshiruv_shartlari FOR ALL USING (true) WITH CHECK (true);
