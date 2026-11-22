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

أسهل طريقة: ملف واحد فيه كل شيء (المخطط + ٣٦ لوحة + ٢٢٦ صورة):

```bash
# على جهازك، من جذر المشروع
pbcopy < supabase/go-live.sql
```

ثم في **SQL Editor → New query** الصق (⌘V) واضغط **Run**. آمن لإعادة التشغيل.

بديل خطوة بخطوة، بالترتيب:

1. `supabase/schema.sql` — الجداول، الصلاحيات (RLS)، دالة الإحصاءات، وحاوية الصور.
2. `supabase/seed-works.sql` — إدخال اللوحات الـ36 الحالية.
3. `supabase/seed-photos.sql` — إدخال الصور الفوتوغرافية الـ226 (مولّد آلياً من `photos.json`).

> صور المعرض تُخدَم من المستودع نفسه (`assets/`)، لا من حاوية التخزين،
> لذلك لا تحتاج رفع أي ملف إلى Supabase. الحاوية موجودة فقط لمن يريد
> لاحقاً نقل الصور إلى CDN الخاص بـSupabase.

## ٣) اربط الواجهة · Connect the front-end

Supabase الجديد لم يعد فيه قسم اسمه **API**؛ القيم في
**Project Settings → API Keys**:

| من Supabase | إلى الملف |
|---|---|
| Project URL | `js/config.js` → `SUPABASE_URL` |
| **Publishable key** (`sb_publishable_…`) | `js/config.js` → `SUPABASE_ANON_KEY` |

> الـpublishable key هو بديل مفتاح `anon` القديم ويقوم بنفس الدور. المفتاح القديم
> ما زال في الصفحة تحت **View legacy API keys** لكنه يتوقف في أوائل 2027.
> أي مفتاح من النوعين عام وآمن للنشر: الصلاحيات الفعلية تأتي من RLS + المنح
> على مستوى الأعمدة في `schema.sql`.

بعد الحفظ، يتحول الموقع تلقائياً من الوضع التجريبي إلى الحسابات الحقيقية.

## ٤) اضبط المصادقة · Auth settings

- **Authentication → Sign In / Providers → Email**: أوقف `Confirm email` إن أردت
  تسجيلاً فورياً بلا رسالة تأكيد. إبقاؤه مفعّلاً أكثر أماناً (يمنع الحسابات الوهمية)
  والموقع يعرض رسالة «راجع بريدك» في الحالتين.
- **Authentication → URL Configuration**:
  - `Site URL`: `https://ahmedissamramadan.github.io/human-machine-gallery/`
  - `Redirect URLs`: أضف نفس الرابط + `http://localhost:8732/` للتجربة المحلية.

## ٥) اجعل حسابك «الفنّان» · Make your account the artist

1. سجّل حساباً من الموقع نفسه.
2. في **SQL Editor** شغّل (بدّل البريد ببريدك):

```sql
update public.profiles
set role = 'artist'
where id = (select id from auth.users where email = 'ahmedissam.personal@gmail.com');
```

3. أعد تحميل الصفحة — ستظهر «رسائلي» بصندوق الفنّان.

حساب الفنّان وحده يستطيع:
- حذف أي تعليق.
- رؤية كل محادثات الزوّار في «رسائلي» والرد عليها.
- تعديل الكتالوج (RLS: `is_artist()`).

## ٦) أضف صوراً جديدة · Add new photography

```bash
# 1. أضف الإطار إلى photos.json (src = رقم الإطار، عنوانان، فصل، وسوم)
# 2. أعد بناء النسخ المضغوطة والمخطوطات:
python3 scripts/build-photos.py
# 3. أعد تشغيل supabase/seed-photos.sql (أو go-live.sql) في SQL Editor
```

`build-photos.py` ينتج `assets/thumb|full/` و`js/photos.js` و`supabase/seed-photos.sql`
من نفس المصدر، فلا تختلف النسخة المحلية عن السحابية.

> بديل متقدّم: `scripts/publish-photos.py` يرفع النسخ إلى حاوية `gallery`
> ويسجّل الصفوف بمفتاح `service_role`. يحتاج `.env` بمتغيّرين:
> `SUPABASE_URL` و`SUPABASE_SERVICE_KEY`.
>
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
