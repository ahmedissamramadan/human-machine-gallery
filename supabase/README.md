# تشغيل الحسابات وقاعدة البيانات · Enabling accounts & database

المعرض يعمل الآن في **وضع تجريبي** (حسابات محفوظة داخل المتصفح). لتفعيل حسابات حقيقية
وتعليقات ورسائل مشتركة بين الزوّار، اربط مشروع Supabase مجاني.

The gallery currently runs in **demo mode** (accounts stored in the browser). To enable
real accounts, shared comments and private messages, connect a free Supabase project.

---

## ١) أنشئ المشروع · Create the project

1. اذهب إلى [supabase.com](https://supabase.com) → **New project**.
2. الاسم: `human-machine-gallery` — المنطقة: أقرب منطقة لك (مثلاً Frankfurt).
3. كلمة مرور قاعدة البيانات: احفظها في مكان آمن (لا تحتاجها في الكود).

## ٢) شغّل المخطط · Run the schema

في **SQL Editor** شغّل الملفات بالترتيب:

1. `supabase/schema.sql` — الجداول، الصلاحيات (RLS)، دالة الإحصاءات، وحاوية الصور.
2. `supabase/seed-works.sql` — إدخال اللوحات الـ36 الحالية.

كلاهما آمن لإعادة التشغيل (idempotent).

## ٣) اربط الواجهة · Connect the front-end

**Project Settings → API** وانسخ:

| من Supabase | إلى الملف |
|---|---|
| Project URL | `js/config.js` → `SUPABASE_URL` |
| anon public key | `js/config.js` → `SUPABASE_ANON_KEY` |

> مفتاح `anon` عام وآمن للنشر: الصلاحيات الفعلية تأتي من سياسات RLS في `schema.sql`.

بعد الحفظ، يتحول الموقع تلقائياً من الوضع التجريبي إلى الحسابات الحقيقية.

## ٤) اضبط المصادقة · Auth settings

- **Authentication → Providers → Email**: أوقف `Confirm email` إن أردت تسجيلاً فورياً
  بدون رسالة تأكيد (مناسب لمعرض فني).
- **Authentication → URL Configuration**:
  - `Site URL`: `https://ahmedissamramadan.github.io/human-machine-gallery/`
  - `Redirect URLs`: أضف نفس الرابط + `http://localhost:8732/` للتجربة المحلية.

## ٥) اجعل حسابك «الفنّان» · Make your account the artist

1. سجّل حساباً من الموقع نفسه (أول حساب).
2. في **SQL Editor** شغّل:

```sql
update public.profiles
set role = 'artist'
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

حساب الفنّان وحده يستطيع:
- رفع الصور إلى حاوية `gallery` (عبر `scripts/publish-photos.py`).
- حذف أي تعليق.
- رؤية كل محادثات الزوّار في «رسائلي» والرد عليها.

## ٦) أضف صوراً جديدة · Add new photography

```bash
# 1. انسخ الصور إلى مجلد داخل المشروع (مثلاً photos-inbox/)
# 2. أنشئ ملف .env في جذر المشروع:
#    SUPABASE_URL=https://xxxx.supabase.co
#    SUPABASE_SERVICE_KEY=eyJ...   ← service_role (سري، لا تنشره)
# 3. بعد تجهيز البيان (manifest.json) شغّل:
python3 scripts/publish-photos.py --manifest photos.json
```

السكربت يحوّل الصور إلى نسختين (720px و1700px)، يرفعهما إلى التخزين،
ثم يسجّل صفاً في جدول `works` مع العنوانين العربي والإنجليزي والوسوم.

> ⚠️ مفتاح `service_role` يعمل بصلاحيات كاملة. ضعه في `.env` فقط
> (مستثنى في `.gitignore`) ولا تضعه في `js/config.js` أبداً.

---

## ما الذي يُنشأ؟

| الجدول / الدالة | الوظيفة |
|---|---|
| `profiles` | اسم العرض ودور الحساب (`visitor` / `artist`) — يُنشأ تلقائياً عند التسجيل |
| `works` | اللوحات: عنوانان، تصنيف، وسوم، رابطا الصورة |
| `likes` / `favorites` | إعجاب وحفظ — كل مستخدم يرى صفوفه فقط |
| `comments` | تعليقات عامة مع حذف لصاحب التعليق أو الفنّان |
| `messages` | محادثة خاصة لكل زائر مع الفنّان |
| `work_stats()` | عدّادات الإعجاب/الحفظ/التعليق دون كشف هويات المستخدمين |
| `work_comments(work_id)` | التعليقات مع أسماء أصحابها |
| `inbox()` | صندوق الفنّان: محادثة لكل زائر مع عدد غير المقروء |
| Storage bucket `gallery` | قراءة عامة، كتابة للفنّان فقط |
