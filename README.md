# إنسانٌ وآلة · Human × Machine

**معرض بصري تفاعلي عن عصر الذكاء الاصطناعي** — 36 لوحة + 226 صورة فوتوغرافية،
ثنائي اللغة، مع حسابات وإعجاب وحفظ وتعليقات ورسائل خاصة.
An **interactive bilingual gallery** (Arabic / English): 36 AI plates plus 226
photographs, with accounts, likes, saves, comments and private messages.

🔗 **المعرض:** https://ahmedissamramadan.github.io/human-machine-gallery/

---

## ما الذي يعمل الآن · What works

| | |
|---|---|
| 🖼 **المعرض** | ٢٦٢ عملاً في أربعة أساليب، شبكة متجاوبة 3/2/1، تصفية بالأسلوب، بحث عربي/إنجليزي، عارض كامل بلوحة المفاتيح والسحب |
| 📷 **التصوير** | 226 صورة من كاميرا واحدة في أربعة فصول: نهرٌ وسماء، طاولةٌ وقهوة، ليلٌ وحركة، أشياءُ صغيرة |
| 🌐 **ثنائي اللغة** | تبديل فوري عربي/إنجليزي مع قلب الاتجاه `rtl ↔ ltr` وحفظ التفضيل |
| 👤 **الحسابات** | تسجيل بالبريد وكلمة المرور، ملف شخصي، جلسة محفوظة |
| ❤️ **الإعجاب** | زر على كل عمل وفي العارض، مع عدّاد فوري |
| 🔖 **المفضلة** | حفظ الأعمال في مجموعتك الخاصة والرجوع إليها |
| 💬 **التعليقات** | نقاش عام على كل عمل، وحذف لصاحب التعليق أو الفنّان |
| ✉️ **الرسائل** | محادثة خاصة بين كل زائر والفنّان (صندوق موحّد للفنّان مع عدّاد غير المقروء) |
| 🔗 **روابط مباشرة** | `#p=14` يفتح العمل، `?lang=en` يفتح بالإنجليزية |

هناك وضعان، يُختاران تلقائياً من `js/config.js`:

- **سحابي (الحالي):** الحسابات والتعليقات والإعجاب والرسائل حقيقية ومشتركة،
  وقاعدة البيانات هي مصدر الأعمال الـ262.
- **تجريبي:** إذا فرّغت مفتاحي Supabase، تعود الحسابات إلى `localStorage`
  داخل المتصفح — مفيد للعرض بلا إنترنت.

## التشغيل · Run locally

```bash
open index.html                 # يقرأ الأعمال من قاعدة البيانات
# أو
python3 -m http.server 8732     # ثم: http://localhost:8732
```

## تفعيل الحسابات الحقيقية · Enable real accounts

1. أنشئ مشروعاً مجانياً على [supabase.com](https://supabase.com).
2. SQL Editor → الصق `supabase/go-live.sql` كاملاً → Run (المخطط + الـ262 عملاً).
3. **Project Settings → API Keys**: انسخ `Project URL` و **Publishable key**
   (`sb_publishable_…`) إلى `js/config.js`.
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
js/photos.js               بيانات سلسلة التصوير (مولّد آلياً — لا يُحرَّر يدوياً)
photos.json                قرار المونتاج: الصور المختارة وعناوينها ووسومها وفصولها
vendor/supabase-js.min.js  مكتبة Supabase (محليّة، بلا CDN)
assets/thumb|full/         نسخ العرض المضغوطة للأعمال الـ262
*.jpeg                     اللوحات الأصلية عالية الدقة
photos-inbox/              أصل صور الكاميرا (غير متتبَّع في git)
supabase/schema.sql        الجداول + صلاحيات RLS + حاوية الصور
supabase/seed-works.sql    إدخال اللوحات الـ36
supabase/seed-photos.sql   إدخال الصور الـ226
supabase/go-live.sql       المخطط + كل الأعمال في لصقة واحدة (مُولَّد)
supabase/README.md         دليل الربط خطوة بخطوة
scripts/build-photos.py    بناء نسخ العرض محلياً من photos.json
scripts/publish-photos.py  نشر صور جديدة إلى التخزين + قاعدة البيانات
scripts/shot.mjs           أداة لقطات شاشة للتطوير (بلا اعتماديات)
```

## إضافة صور جديدة · Add photography

سلسلة التصوير تُدار من ملف واحد: `photos.json`. كل صورة فيه تحتاج `src`
(رقم الإطار في `photos-inbox`)، و`slug`، وعنواناً عربياً وإنجليزياً، وفصلاً، ووسوماً.

```bash
cp -r "/path/to/Camera Roll/" photos-inbox/     # غير متتبَّع في git
python3 scripts/build-photos.py                 # نسخ 720px و1700px + js/photos.js
python3 scripts/publish-photos.py --manifest photos.json   # للسحابة لاحقاً
```

`build-photos.py` ينتج `assets/thumb|full/` و`js/photos.js` و`supabase/seed-photos.sql`
من نفس المصدر، فلا تختلف النسخة المحلية عن السحابية. إعادة الترميز بـ`sips` تزيل
بيانات الموقع (EXIF/GPS) قبل النشر.

## ملاحظات · Notes

- لوحات الآلة الـ36 **مولّدة بالذكاء الاصطناعي**؛ الصور الـ226 الأخرى فوتوغرافية من كاميرا المؤلف.
- مفتاح `Publishable` في `js/config.js` عام وآمن؛ الحماية الحقيقية في سياسات RLS
  والمنح على مستوى الأعمدة (لا يمكن لأحد تعديل `role` أو نص رسالة غيره).
- مفتاح `service_role` يبقى في `.env` فقط ولا يُنشر أبداً.
- المعرض يعمل بلا أي اعتمادية خارجية (لا خطوط ولا سكربتات من CDN).

---

صُنع للعرض المحلي والنشر الساكن · Built for local viewing and static hosting.
