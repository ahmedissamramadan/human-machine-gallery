# إنسانٌ وآلة · Human × Machine

**معرض بصري تفاعلي عن عصر الذكاء الاصطناعي** — 36 لوحة، ثنائي اللغة، مع حسابات
وإعجاب وحفظ وتعليقات ورسائل خاصة.
An **interactive bilingual gallery** (Arabic / English): 36 plates, accounts, likes,
saves, comments and private messages.

🔗 **المعرض:** https://ahmedissamramadan.github.io/human-machine-gallery/

---

## ما الذي يعمل الآن · What works

| | |
|---|---|
| 🖼 **المعرض** | 36 لوحة، شبكة متجاوبة 3/2/1، تصفية بالأسلوب، بحث عربي/إنجليزي، عارض كامل بلوحة المفاتيح والسحب |
| 🌐 **ثنائي اللغة** | تبديل فوري عربي/إنجليزي مع قلب الاتجاه `rtl ↔ ltr` وحفظ التفضيل |
| 👤 **الحسابات** | تسجيل بالبريد وكلمة المرور، ملف شخصي، جلسة محفوظة |
| ❤️ **الإعجاب** | زر على كل لوحة وفي العارض، مع عدّاد فوري |
| 🔖 **المفضلة** | حفظ اللوحات في مجموعتك الخاصة والرجوع إليها |
| 💬 **التعليقات** | نقاش عام على كل لوحة، وحذف لصاحب التعليق أو الفنّان |
| ✉️ **الرسائل** | محادثة خاصة بين كل زائر والفنّان (صندوق موحّد للفنّان مع عدّاد غير المقروء) |
| 🔗 **روابط مباشرة** | `#p=14` يفتح اللوحة، `?lang=en` يفتح بالإنجليزية |

هناك وضعان:

- **تجريبي (افتراضي):** الحسابات والتعليقات تُحفظ في متصفحك فقط — يعمل بلا إنترنت ولا حساب.
- **سحابي:** بعد إضافة مفاتيح Supabase في `js/config.js` تصبح الحسابات والتعليقات
  والرسائل حقيقية ومشتركة بين كل الزوّار.

## التشغيل · Run locally

```bash
open index.html                 # الوضع التجريبي يعمل مباشرة
# أو
python3 -m http.server 8732     # ثم: http://localhost:8732
```

## تفعيل الحسابات الحقيقية · Enable real accounts

1. أنشئ مشروعاً مجانياً على [supabase.com](https://supabase.com).
2. شغّل `supabase/schema.sql` ثم `supabase/seed-works.sql` في محرر SQL.
3. انسخ `Project URL` و `anon key` إلى `js/config.js`.
4. سجّل حسابك ثم ارفع صلاحيتك إلى `artist` (الأمر في `supabase/README.md`).

الدليل الكامل خطوة بخطوة: **[supabase/README.md](supabase/README.md)**

---

## بنية المشروع · Structure

```
index.html                 الصفحة كاملة (تصميم + معرض + عارض)
css/app.css                تنسيقات طبقة التفاعل (حسابات، تعليقات، رسائل)
js/config.js               مفاتيح Supabase (عامة)
js/store.js                طبقة البيانات: Supabase أو localStorage
js/app.js                  الحسابات، الإعجاب، الحفظ، التعليقات، الرسائل
vendor/supabase-js.min.js  مكتبة Supabase (محليّة، بلا CDN)
assets/thumb|full/         نسخ العرض المضغوطة للوحات الـ36
*.jpeg                     الصور الأصلية عالية الدقة
supabase/schema.sql        الجداول + صلاحيات RLS + حاوية الصور
supabase/seed-works.sql    إدخال اللوحات الـ36
supabase/README.md         دليل الربط خطوة بخطوة
scripts/publish-photos.py  نشر صور جديدة إلى التخزين + قاعدة البيانات
scripts/shot.mjs           أداة لقطات شاشة للتطوير (بلا اعتماديات)
```

## إضافة صور جديدة · Add photography

```bash
cp -r "/path/to/Camera Roll/" photos-inbox/     # غير متتبَّع في git
python3 scripts/publish-photos.py --manifest photos.json
```

كل صورة تحتاج: `slug`، عنواناً عربياً وإنجليزياً، تصنيفاً (`photo`)، ووسوماً.

## ملاحظات · Notes

- كل الصور **مولّدة بالذكاء الاصطناعي** (ما عدا مجموعة التصوير الشخصي عند إضافتها).
- مفتاح `anon` في `js/config.js` عام وآمن؛ الحماية الحقيقية في سياسات RLS.
- مفتاح `service_role` يبقى في `.env` فقط ولا يُنشر أبداً.
- المعرض يعمل بلا أي اعتمادية خارجية (لا خطوط ولا سكربتات من CDN).

---

صُنع للعرض المحلي والنشر الساكن · Built for local viewing and static hosting.
