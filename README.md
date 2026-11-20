# Savdo Jurnali va Intizom Qalqoni (Trading Journal & Discipline)

Ushbu veb-ilova **100% o‘zbek tilida** ishlab chiqilgan bo‘lib, treyderlarga hissiyotlarni chetga surib, qat’iy intizom va **Session Sweep & FVG** strategiyasi asosida savdo qilishga yordam beradi.

---

## 🚀 Asosiy Imkoniyatlar

1. **Kirishdan Oldingi Majburiy Tekshiruv (Pre-Trade Checklist):**
   - **Sessiya High / Low Sweep** (Asosiy shart; Osiyo, London yoki avvalgi sessiya likvidligi olingan bo‘lishi shart). Belgilanmasa: *"DIQQAT: SWEEP BO‘LMAGAN — KIRMA, SWEEP BO‘LGUNCHA KUT!"*
   - **H4 / H1 Zona (FVG yoki OB)** (Yuqori taymfreymdagi mos zona).
   - **M1 / M3 / M5 Tasdiq (FVG yoki iFVG)** (Kichik taymfreymdagi strukturaviy tasdiq).
   - **Aniq Target (Eng yaqin Low yoki High)** (Likvidlik maqsadi).
   - **Risk va Kunlik Qalqon** (1 mikro kontrakt, ~$40–$45 risk).
   - **Yashil Ruxsat Holat Banneri:** Shartlar to‘liq bo‘lgandagina sdelkaga ruxsat beriladi va bir tugma orqali sdelka oynasiga ballar ko‘chiriladi.

2. **Kunlik Qalqon (Daily Shield):**
   - Kunlik sdelkalar soni (masalan: 3 ta limit) va kunlik zarar chegarasini (masalan: -$300) nazorat qiladi.
   - Limit oshganda avtomatik qulflanadi va overtradingdan saqlaydi.

3. **Notion Uslubidagi Savdo Jurnali:**
   - Qidiruv, tezkor filtrlar (Yutuq, Zarar, A+ qoida, Qoidasiz, Instrument).
   - Har bir sdelka uchun slide-over tafsilotlar paneli (Detail Drawer).
   - Avtomatik nuqta, R:R (Risk-to-Reward) va sof P&L hisoblagich.

4. **Balans va Statistika (Equity Curve):**
   - Balansning o‘sishi va tushishi grafigi (Equity Curve).
   - Maksimal Drawdown / Sliv chegarasi gorizontal chizig‘i.
   - Qolgan xavfsiz bufer ($) hisobi.
   - Kunlik P&L ustunli grafigi (Yashil/Qizil kunlar).
   - **Intizom tahlili:** Qoida bo‘yicha (A+) sdelkalar natijasi va qoidabuzarliklar natijasi solishtiruvi.

5. **Excel (.xlsx) Eksport:**
   - Barcha sdelkalar va to‘liq statistikani ikki varaqli (Sheets) formatlangan `.xlsx` fayliga yuklab beradi.

6. **Supabase Bulut Bazasi & Mahalliy Rejim (Demo):**
   - `.env` orqali Supabase ulanganda to‘liq bulutda sinxronlanadi.
   - Ulanmagan holatda brauzerning xotirasida (localStorage) avtonom ishlaydi.

---

## 🛠 O‘rnatish va Ishga Tushirish

### 1-qadam: Kutubxonalarni o‘rnatish
```bash
npm install
```

### 2-qadam: Dasturni ishlab chiquvchi rejimida ishga tushirish
```bash
npm run dev
```
Brauzerda `http://localhost:5173` manzilini oching.

### 3-qadam: Loyihani yig‘ish (Production Build)
```bash
npm run build
```

---

## 🗄 Supabase Bazasini Sozlash

1. [Supabase](https://supabase.com) saytida yangi bepul loyiha (Project) yarating.
2. Chap paneldagi **SQL Editor** bo‘limiga kiring.
3. Loyihadagi `supabase_schema.sql` fayli ichidagi barcha SQL kodni nusxalab, SQL Editor oynasiga tashlang va **Run** tugmasini bosing.
4. Supabase panelidan **Project Settings -> API** bo‘limiga o‘tib:
   - `Project URL`
   - `anon public key` qiymatlarini oling.
5. Loyiha ildizida `.env` faylini yarating (yoki `.env.example` dan nusxa oling):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
6. Yoki dastur ichidagi **"Sozlamalar"** (Tishli g‘ildirak belgisi) -> **"Supabase Ulanishi"** bo‘limiga kirib to‘g‘ridan-to‘g‘ri interfeys orqali kiriting va **"Ulanishni Sinab Ko‘rish"** tugmasini bosing!

---

## 📊 Excel (.xlsx) Eksportni Tekshirish

- Yuqori paneldagi **"Excel (.xlsx)"** tugmasini bosing.
- Kompyuteringizga `Savdo_Jurnali_YYYY-MM-DD.xlsx` fayli yuklanadi.
- Ushbu fayl ikkita varaqdan iborat:
  1. `Sdelkalar Jurnali`: Barcha sdelkalar (narxlar, SL, TP, Sof P&L, intizom, ruhiy holat).
  2. `Hisobot va Statistika`: Joriy balans, Drawdown buferi, Win rate, A+ vs Qoidasiz sdelkalar intizom tahlili.
