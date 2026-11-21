/* ============================================================
   إنسانٌ وآلة · Human × Machine — interactive layer
   accounts · likes · saves · comments · private messages
   ============================================================ */
(function () {
  "use strict";

  var G = window.__gallery;
  var S = window.GalleryStore;
  if (!G || !S) return;

  /* ------------------------------------------------------------
     strings
     ------------------------------------------------------------ */
  var A = {
    ar: {
      signIn: "دخول",
      signUp: "حساب جديد",
      authTitle: "حسابك في المعرض",
      authSub: "معرض تفاعلي",
      name: "الاسم",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      continueIn: "دخول",
      continueUp: "إنشاء الحساب",
      forgot: "نسيت كلمة المرور؟",
      switchUp: "ليس لديك حساب؟ أنشئ حساباً",
      switchIn: "لديك حساب؟ سجّل الدخول",
      confirm: "أرسلنا رابط تأكيد إلى بريدك. افتحه ثم سجّل الدخول.",
      welcome: "أهلاً بعودتك",
      welcomeNew: "تم إنشاء حسابك — أهلاً بك",
      errFields: "املأ البريد وكلمة المرور.",
      errName: "اكتب اسمك.",
      errPass: "كلمة المرور 6 أحرف على الأقل.",
      errInvalid: "البريد أو كلمة المرور غير صحيحة.",
      errExists: "هذا البريد مسجّل مسبقاً — سجّل الدخول.",
      errUnconfirmed: "لم يتم تأكيد بريدك بعد. تحقق من صندوق الوارد.",
      errGeneric: "حدث خطأ، حاول مرة أخرى.",
      resetSent: "أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك.",
      resetNeed: "اكتب بريدك أولاً ثم اضغط «نسيت كلمة المرور؟».",
      favorites: "مفضلتي",
      messages: "رسائلي",
      logout: "تسجيل الخروج",
      artist: "الفنّان",
      like: "إعجاب",
      save: "حفظ",
      askAbout: "اسأل عن العمل",
      comments: "التعليقات",
      noComments: "كن أول من يعلّق.",
      commentPh: "اكتب تعليقاً…",
      send: "إرسال",
      loginToComment: "سجّل دخولك لتشارك رأيك في العمل.",
      loginFirst: "سجّل دخولك أولاً",
      emptyFavs: "لم تحفظ عملاً بعد. افتح أي عمل واضغط «حفظ».",
      demoNote: "وضع تجريبي: الحسابات محفوظة في هذا المتصفح فقط، وأول حساب يصبح مالك المعرض. اربط Supabase لتشغيل الحسابات الحقيقية.",
      noThreads: "لا رسائل بعد.",
      pickThread: "اختر محادثة",
      chatEmpty: "ابدأ الحديث — اسأل عن عمل أو اطلب طبعة.",
      msgPh: "اكتب رسالتك…",
      msgAbout: "بخصوص عمل",
      you: "أنت",
      delete: "حذف",
      confirmDelete: "حذف هذا التعليق؟",
      fail: "تعذّر إكمال العملية",
      unread: "رسائل جديدة",
      saved: "أُضيفت إلى مفضلتك",
      unsaved: "أُزيلت من مفضلتك",
      dbError: "قاعدة البيانات غير مهيّأة على هذا الموقع بعد.",
      me: "أنا"
    },
    en: {
      signIn: "Sign in",
      signUp: "Create account",
      authTitle: "Your gallery account",
      authSub: "Interactive gallery",
      name: "Name",
      email: "Email",
      password: "Password",
      continueIn: "Sign in",
      continueUp: "Create account",
      forgot: "Forgot your password?",
      switchUp: "No account yet? Create one",
      switchIn: "Already have an account? Sign in",
      confirm: "We sent a confirmation link to your email. Open it, then sign in.",
      welcome: "Welcome back",
      welcomeNew: "Account created — welcome",
      errFields: "Fill in your email and password.",
      errName: "Please type your name.",
      errPass: "Password must be at least 6 characters.",
      errInvalid: "Wrong email or password.",
      errExists: "This email is already registered — sign in instead.",
      errUnconfirmed: "Your email is not confirmed yet. Check your inbox.",
      errGeneric: "Something went wrong, try again.",
      resetSent: "We sent a password reset link to your email.",
      resetNeed: "Type your email first, then press “Forgot your password?”.",
      favorites: "My saves",
      messages: "Messages",
      logout: "Sign out",
      artist: "Artist",
      like: "Like",
      save: "Save",
      askAbout: "Ask about this work",
      comments: "Comments",
      noComments: "Be the first to comment.",
      commentPh: "Write a comment…",
      send: "Send",
      loginToComment: "Sign in to share your thoughts on this work.",
      loginFirst: "Sign in first",
      emptyFavs: "Nothing saved yet. Open a work and hit “Save”.",
      demoNote: "Demo mode: accounts live in this browser only and the first account owns the gallery. Connect Supabase for real accounts.",
      noThreads: "No messages yet.",
      pickThread: "Pick a conversation",
      chatEmpty: "Start the conversation — ask about a work or request a print.",
      msgPh: "Write your message…",
      msgAbout: "About the work",
      you: "You",
      delete: "Delete",
      confirmDelete: "Delete this comment?",
      fail: "Could not complete that",
      unread: "New messages",
      saved: "Added to your saves",
      unsaved: "Removed from your saves",
      dbError: "The database is not set up on this site yet.",
      me: "Me"
    }
  };

  var ICON = {
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.7C19 15.6 12 20 12 20z"/></svg>',
    heartOn: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.7C19 15.6 12 20 12 20z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M7 4h10v16l-5-4-5 4z"/></svg>',
    bookmarkOn: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4h10v16l-5-4-5 4z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6.5 8.5 6 8.5-6"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h9"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M4 12l16-8-6 8 6 8z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>'
  };

  /* ------------------------------------------------------------
     state
     ------------------------------------------------------------ */
  var me = null;
  var stats = {};
  var liked = new Set();
  var faved = new Set();
  var current = null;
  var comments = [];
  var threadUser = null;
  var convs = [];
  var pollId = 0;
  var authMode = "in";
  var dbBroken = false;
  var draft = "";

  /* ------------------------------------------------------------
     helpers
     ------------------------------------------------------------ */
  function L() { return G.getLang() === "en" ? "en" : "ar"; }
  function t(k) { var d = A[L()] || A.ar; return d[k] != null ? d[k] : (A.en[k] || k); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function idOf(it) { return it.id || it.f; }
  function workById(id) { return G.ITEMS.filter(function (x) { return idOf(x) === id; })[0] || null; }
  function initials(name) {
    var parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0); }).join("") || "?";
  }
  function rel(ts) {
    if (!ts) return "";
    var d = new Date(ts), diff = (Date.now() - d.getTime()) / 1000;
    var ar = L() === "ar";
    if (diff < 60) return ar ? "الآن" : "now";
    if (diff < 3600) { var m = Math.floor(diff / 60); return ar ? "قبل " + m + " د" : m + "m"; }
    if (diff < 86400) { var h = Math.floor(diff / 3600); return ar ? "قبل " + h + " س" : h + "h"; }
    if (diff < 172800) return ar ? "أمس" : "yesterday";
    try {
      return new Intl.DateTimeFormat(ar ? "ar" : "en", { day: "numeric", month: "short" }).format(d);
    } catch (e) { return d.toISOString().slice(0, 10); }
  }

  var toastTimer;
  function toast(msg) {
    var box = $("#toast");
    if (!box) return;
    box.firstElementChild.textContent = msg;
    box.firstElementChild.dataset.on = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.firstElementChild.dataset.on = "false"; }, 2600);
  }

  /* ------------------------------------------------------------
     shell
     ------------------------------------------------------------ */
  function build() {
    var acct = $("#acct");
    if (acct) acct.innerHTML = '<button class="acct-btn is-guest" id="acctBtn" type="button"></button>';

    document.body.insertAdjacentHTML("beforeend", [
      '<div class="sheet" id="authSheet" data-open="false">',
      '<div class="sheet-card" role="dialog" aria-modal="true">',
      '<div class="sheet-head"><div><h3 data-tx="authTitle"></h3><span class="sub" data-tx="authSub"></span></div>',
      '<button class="sheet-close" type="button" data-close="authSheet" data-txaria="close">' + ICON.x + "</button></div>",
      '<div class="sheet-body">',
      '<div class="demo-banner" id="demoBanner" hidden></div>',
      '<div class="auth-tabs" role="tablist">',
      '<button class="auth-tab" type="button" data-mode="in" role="tab" aria-selected="true" data-tx="signIn"></button>',
      '<button class="auth-tab" type="button" data-mode="up" role="tab" aria-selected="false" data-tx="signUp"></button>',
      "</div>",
      '<div class="form-msg" id="authMsg"></div>',
      '<form id="authForm" novalidate>',
      '<div class="field" id="nameField" hidden><label data-tx="name"></label><input id="afName" autocomplete="name"></div>',
      '<div class="field"><label data-tx="email"></label><input id="afEmail" type="email" dir="ltr" autocomplete="email"></div>',
      '<div class="field"><label data-tx="password"></label><input id="afPass" type="password" dir="ltr" autocomplete="current-password"></div>',
      '<button class="btn btn-primary auth-submit" id="afSubmit" type="submit" data-tx="continueIn"></button>',
      "</form>",
      '<p class="auth-alt"><button type="button" id="afReset" data-tx="forgot"></button></p>',
      '<p class="auth-alt"><button type="button" id="afSwitch" data-tx="switchUp"></button></p>',
      "</div></div></div>",

      '<div class="sheet" id="favSheet" data-open="false">',
      '<div class="sheet-card wide" role="dialog" aria-modal="true">',
      '<div class="sheet-head"><div><h3 data-tx="favorites"></h3><span class="sub" id="favCount"></span></div>',
      '<button class="sheet-close" type="button" data-close="favSheet" data-txaria="close">' + ICON.x + "</button></div>",
      '<div class="sheet-body" id="favBody"></div>',
      "</div></div>",

      '<div class="sheet" id="msgSheet" data-open="false">',
      '<div class="sheet-card wide" role="dialog" aria-modal="true">',
      '<div class="sheet-head"><div><h3 data-tx="messages"></h3><span class="sub" id="msgSub"></span></div>',
      '<button class="sheet-close" type="button" data-close="msgSheet" data-txaria="close">' + ICON.x + "</button></div>",
      '<div class="sheet-body" id="msgBody" style="padding:0"></div>',
      "</div></div>",

      '<div class="toast" id="toast"><span></span></div>'
    ].join(""));

    applyText(document);
    wire();
  }

  function applyText(root) {
    $$("[data-tx]", root).forEach(function (n) { n.textContent = t(n.dataset.tx); });
    $$("[data-txaria]", root).forEach(function (n) { n.setAttribute("aria-label", t(n.dataset.txaria)); });
    var banner = $("#demoBanner");
    if (banner) {
      if (S.mode === "demo") { banner.hidden = false; banner.textContent = t("demoNote"); }
      else banner.hidden = true;
    }
  }

  /* ------------------------------------------------------------
     account widget
     ------------------------------------------------------------ */
  function renderAcct() {
    var box = $("#acct");
    if (!box) return;
    if (!me) {
      box.innerHTML = '<button class="acct-btn is-guest" id="acctBtn" type="button">' + esc(t("signIn")) + "</button>";
      return;
    }
    var artist = me.role === "artist";
    box.innerHTML = [
      '<button class="acct-btn" id="acctBtn" type="button" aria-expanded="false">',
      '<span class="avatar' + (artist ? " is-artist" : "") + '">' + esc(initials(me.name)) + "</span>",
      '<span class="who">' + esc(me.name) + "</span>",
      '<span class="dot" hidden></span>',
      "</button>",
      '<div class="acct-menu" id="acctMenu" data-open="false">',
      '<div class="who"><span class="avatar' + (artist ? " is-artist" : "") + '">' + esc(initials(me.name)) + "</span>",
      "<div><b>" + esc(me.name) + "</b><span>" + esc(me.email || "") + "</span></div>",
      artist ? '<span class="role">' + esc(t("artist")) + "</span>" : "",
      "</div>",
      '<button type="button" data-act="favs">' + ICON.bookmark + esc(t("favorites")) + '<span class="badge" id="favBadge" hidden>0</span></button>',
      '<button type="button" data-act="msgs">' + ICON.mail + esc(t("messages")) + '<span class="badge" id="msgBadge" hidden>0</span></button>',
      '<div class="sep"></div>',
      '<button type="button" data-act="out">' + ICON.out + esc(t("logout")) + "</button>",
      S.mode === "demo" ? '<div class="demo-note">' + esc(t("demoNote")) + "</div>" : "",
      "</div>"
    ].join("");
    paintBadges();
  }

  function paintBadges() {
    var fav = $("#favBadge");
    if (fav) {
      fav.hidden = faved.size === 0;
      fav.textContent = faved.size;
    }
  }

  async function refreshUnread() {
    if (!me || me.role !== "artist") return;
    try {
      var rows = await S.inbox();
      var n = rows.reduce(function (a, r) { return a + (r.unread || 0); }, 0);
      var badge = $("#msgBadge"), dot = $(".acct-btn .dot"), acctBtn = $("#acctBtn");
      if (badge) { badge.hidden = n === 0; badge.textContent = n; }
      if (acctBtn) acctBtn.setAttribute("aria-expanded", "false");
      var d = $(".acct-btn .dot");
      if (d) d.hidden = n === 0;
    } catch (e) {}
  }

  function toggleMenu(force) {
    var menu = $("#acctMenu");
    if (!menu) return;
    var open = typeof force === "boolean" ? force : menu.dataset.open !== "true";
    menu.dataset.open = open ? "true" : "false";
    var btn = $("#acctBtn");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) refreshUnread();
  }

  /* ------------------------------------------------------------
     sheets
     ------------------------------------------------------------ */
  function openSheet(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.dataset.open = "true";
    document.body.classList.add("locked");
    var f = el.querySelector("input, textarea, button.sheet-close");
    if (f) setTimeout(function () { try { f.focus(); } catch (e) {} }, 40);
  }
  function closeSheet(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.dataset.open = "false";
    if (!$$(".sheet[data-open='true']").length && !$("#lb")?.dataset.open?.includes("true")) {
      document.body.classList.remove("locked");
    }
    if (id === "msgSheet") stopPoll();
  }

  /* ------------------------------------------------------------
     auth
     ------------------------------------------------------------ */
  function openAuth(mode) {
    setAuthMode(mode || "in");
    openSheet("authSheet");
    $("#authMsg").removeAttribute("data-kind");
    $("#authMsg").textContent = "";
    setTimeout(function () { var e = $("#afEmail"); if (e) e.focus(); }, 80);
  }

  function setAuthMode(mode) {
    authMode = mode;
    $$(".auth-tab").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.mode === mode ? "true" : "false"); });
    $("#nameField").hidden = mode !== "up";
    $("#afSubmit").textContent = t(mode === "up" ? "continueUp" : "continueIn");
    $("#afSwitch").textContent = t(mode === "up" ? "switchIn" : "switchUp");
    $("#afPass").autocomplete = mode === "up" ? "new-password" : "current-password";
  }

  function authMsg(kind, text) {
    var el = $("#authMsg");
    el.dataset.kind = kind;
    el.textContent = text;
  }

  function mapAuthErr(err) {
    var c = err && err.code;
    if (c === "invalid") return t("errInvalid");
    if (c === "exists") return t("errExists");
    if (c === "unconfirmed") return t("errUnconfirmed");
    if (c === "weakpass") return t("errPass");
    return t("errGeneric");
  }

  async function submitAuth(e) {
    e.preventDefault();
    var email = $("#afEmail").value.trim();
    var pass = $("#afPass").value;
    var name = $("#afName").value.trim();

    if (!email || !pass) return authMsg("err", t("errFields"));
    if (authMode === "up" && !name) return authMsg("err", t("errName"));
    if (pass.length < 6) return authMsg("err", t("errPass"));

    var btn = $("#afSubmit");
    btn.disabled = true;
    try {
      var r = authMode === "in"
        ? await S.signIn(email, pass)
        : await S.signUp(email, pass, name);

      if (r && r.needsConfirm) {
        authMsg("ok", t("confirm"));
        btn.disabled = false;
        return;
      }
      me = (r && r.user) || (await S.user());
      await refreshAll();
      closeSheet("authSheet");
      toast(authMode === "in" ? t("welcome") : t("welcomeNew"));
      $("#afPass").value = "";
      $("#authMsg").removeAttribute("data-kind");
    } catch (err) {
      authMsg("err", mapAuthErr(err));
    }
    btn.disabled = false;
  }

  /* ------------------------------------------------------------
     data
     ------------------------------------------------------------ */
  async function loadWorks() {
    var rows = null;
    try {
      rows = await S.loadWorks();
    } catch (e) {
      dbBroken = true;
      console.warn("[gallery] loadWorks:", e);
    }
    if (rows && rows.length) {
      var items = rows.map(function (r, idx) {
        return {
          f: r.slug,
          t: r.title_ar,
          en: r.title_en,
          c: r.cat,
          tags: r.tags || [],
          id: r.id,
          thumb: r.thumb_url,
          full: r.full_url,
          sort: r.sort != null ? r.sort : idx,
          i: idx
        };
      });
      items.sort(function (a, b) { return a.sort - b.sort; });
      items.forEach(function (it, i) { it.i = i; });
      // make sure the UI knows every category and tag that comes from the database
      var CAT_LABELS = { photo: { ar: "تصويري", en: "Photography", short: "Ph." } };
      items.forEach(function (it) {
        if (!G.CATS[it.c]) G.CATS[it.c] = CAT_LABELS[it.c] || { ar: it.c, en: it.c, short: it.c.slice(0, 3) + "." };
        (it.tags || []).forEach(function (k) {
          if (!G.TAGS[k]) G.TAGS[k] = { ar: k, en: k };
        });
      });
      G.ITEMS.length = 0;
      Array.prototype.push.apply(G.ITEMS, items);
      G.refresh();
    } else {
      G.ITEMS.forEach(function (it) { if (!it.id) it.id = it.f; });
    }
  }

  async function refreshAll() {
    try {
      stats = (await S.stats()) || {};
    } catch (e) {
      dbBroken = true;
      console.warn("[gallery] stats:", e);
    }
    liked = new Set();
    faved = new Set();
    if (me) {
      try { liked = new Set(await S.myLikes()); } catch (e) {}
      try { faved = new Set(await S.myFavorites()); } catch (e) {}
    }
    renderAcct();
    syncPills();
    if (current) { renderReactions(); printCounts(); }
    refreshUnread();
  }

  async function onAuthChange() {
    try { me = await S.user(); } catch (e) { me = null; }
    await refreshAll();
    if (document.getElementById("msgSheet").dataset.open === "true") {
      if (me) openMsgs();
    }
  }

  /* ------------------------------------------------------------
     like pills on cards
     ------------------------------------------------------------ */
  function syncPills() {
    $$(".card").forEach(function (card) {
      var btn = card.querySelector(".card-btn");
      if (!btn) return;
      var it = G.ITEMS[Number(btn.dataset.i)];
      if (!it) return;
      var id = idOf(it);
      var pill = card.querySelector(".like-pill");
      if (!pill) {
        pill = document.createElement("button");
        pill.type = "button";
        pill.className = "like-pill";
        card.appendChild(pill);
      }
      pill.dataset.id = id;
      var st = stats[id] || { likes: 0 };
      var on = liked.has(id);
      pill.dataset.on = on ? "true" : "false";
      pill.setAttribute("aria-pressed", on ? "true" : "false");
      pill.setAttribute("aria-label", t("like"));
      pill.innerHTML = (on ? ICON.heartOn : ICON.heart) + '<span class="n">' + (st.likes || 0) + "</span>";
    });
  }

  function bump(id, field, delta) {
    if (!stats[id]) stats[id] = { likes: 0, favorites: 0, comments: 0 };
    stats[id][field] = Math.max(0, (stats[id][field] || 0) + delta);
  }

  async function toggleLike(id) {
    if (!me) return requireLogin();
    var on = !liked.has(id);
    optimisticLike(id, on);
    try {
      await S.toggleLike(id, on);
    } catch (e) {
      optimisticLike(id, !on);
      toast(t("fail"));
    }
  }

  async function toggleSave(id) {
    if (!me) return requireLogin();
    var on = !faved.has(id);
    optimisticSave(id, on);
    toast(on ? t("saved") : t("unsaved"));
    try {
      await S.toggleFavorite(id, on);
    } catch (e) {
      optimisticSave(id, !on);
      toast(t("fail"));
    }
  }

  function optimisticLike(id, on) {
    if (on) liked.add(id); else liked.delete(id);
    bump(id, "likes", on ? 1 : -1);
    syncPills();
    if (current && idOf(current) === id) { renderReactions(); }
  }
  function optimisticSave(id, on) {
    if (on) faved.add(id); else faved.delete(id);
    bump(id, "favorites", on ? 1 : -1);
    paintBadges();
    if (current && idOf(current) === id) renderReactions();
    if (document.getElementById("favSheet").dataset.open === "true") renderFavs();
  }

  function requireLogin() {
    toast(t("loginFirst"));
    openAuth("in");
  }

  /* ------------------------------------------------------------
     lightbox reactions + comments
     ------------------------------------------------------------ */
  function onLbRender(e) {
    current = e.detail.item;
    renderReactions();
    loadComments();
  }

  function onLbClose() {
    current = null;
    comments = [];
    draft = "";
  }

  function renderReactions() {
    var box = $("#lbReact");
    if (!box || !current) return;
    var id = idOf(current);
    var st = stats[id] || { likes: 0, favorites: 0, comments: 0 };
    var on = liked.has(id), fav = faved.has(id);
    box.innerHTML = [
      '<button type="button" data-react="like" data-on="' + (on ? "true" : "false") + '" aria-pressed="' + (on ? "true" : "false") + '">',
      on ? ICON.heartOn : ICON.heart, "<span>" + (st.likes || 0) + "</span></button>",
      '<button type="button" data-react="save" data-on="' + (fav ? "true" : "false") + '">',
      fav ? ICON.bookmarkOn : ICON.bookmark, "<span>" + (st.favorites || 0) + "</span></button>",
      (me && me.role === "artist" ? "" : '<span class="sep-dot" aria-hidden="true"></span>' +
        '<button type="button" data-react="ask">' + ICON.mail + "<span>" + esc(t("askAbout")) + "</span></button>")
    ].join("");
  }

  function printCounts() {
    var box = $("#lbReact");
    if (!box || !current) return;
    var st = stats[idOf(current)] || { likes: 0, favorites: 0 };
    var like = box.querySelector('[data-react="like"] span');
    var save = box.querySelector('[data-react="save"] span');
    if (like) like.textContent = st.likes || 0;
    if (save) save.textContent = st.favorites || 0;
  }

  async function loadComments() {
    if (!current) return;
    var id = idOf(current);
    try {
      comments = await S.comments(id);
    } catch (e) {
      comments = [];
    }
    renderComments();
  }

  function renderComments() {
    var box = $("#lbComments");
    if (!box || !current) return;
    var id = idOf(current);
    var st = stats[id] || { comments: 0 };
    var n = comments.length;

    var list = comments.map(function (c) {
      var mine = me && c.user_id === me.id;
      var canDel = me && (mine || me.role === "artist");
      return '<div class="cmt">' +
        '<span class="avatar' + (c.is_artist ? " artist" : "") + '">' + esc(initials(c.display_name)) + "</span>" +
        '<div class="body"><div class="meta"><b>' + esc(c.display_name) + "</b><time>" + esc(rel(c.created_at)) + "</time>" +
        (canDel ? '<button class="del" type="button" data-del="' + esc(c.id) + '">' + esc(t("delete")) + "</button>" : "") +
        "</div><p>" + esc(c.body) + "</p></div></div>";
    }).join("");

    var form = me
      ? '<form class="cmt-form" id="cmtForm"><textarea id="cmtInput" rows="1" placeholder="' + esc(t("commentPh")) + '"></textarea>' +
        '<button type="submit" id="cmtSend">' + esc(t("send")) + "</button></form>"
      : '<div class="cmt-gate"><span>' + esc(t("loginToComment")) + '</span><button type="button" data-act="signin">' + esc(t("signIn")) + "</button></div>";

    box.innerHTML = "<h4>" + esc(t("comments")) + ' <span class="n">' + n + "</span></h4>" +
      '<div class="cmt-list">' + (n ? list : '<p class="cmt-empty">' + esc(t("noComments")) + "</p>") + "</div>" + form;

    var input = $("#cmtInput");
    if (input) {
      input.value = draft;
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); submitComment(); }
      });
    }
    st.comments = n;
  }

  async function submitComment() {
    if (!me) return requireLogin();
    var input = $("#cmtInput");
    var body = (input && input.value || "").trim();
    if (!body) return;
    var id = idOf(current);
    var btn = $("#cmtSend");
    if (btn) btn.disabled = true;
    try {
      await S.addComment(id, body);
      draft = "";
      await loadComments();
      bump(id, "comments", 1);
      if (document.getElementById("lbComments")) renderComments();
      var h = $("#lbComments h4 .n");
      if (h) h.textContent = comments.length;
    } catch (e) {
      toast(t("fail"));
    }
    if (btn) btn.disabled = false;
  }

  async function deleteComment(cid) {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await S.deleteComment(cid);
      await loadComments();
    } catch (e) { toast(t("fail")); }
  }

  /* ------------------------------------------------------------
     favorites sheet
     ------------------------------------------------------------ */
  async function openFavs() {
    if (!me) return openAuth("in");
    openSheet("favSheet");
    renderFavs();
  }

  function renderFavs() {
    var items = Array.from(faved).map(workById).filter(Boolean);
    var c = $("#favCount");
    if (c) c.textContent = items.length ? (L() === "ar" ? items.length + " عملاً" : items.length + " works") : "";
    var body = $("#favBody");
    if (!items.length) {
      body.innerHTML = '<div class="fav-empty">' + esc(t("emptyFavs")) + "</div>";
      return;
    }
    body.innerHTML = '<div class="fav-grid">' + items.map(function (it) {
      var title = L() === "ar" ? it.t : it.en;
      return '<button class="fav-item" type="button" data-id="' + esc(idOf(it)) + '">' +
        '<img src="' + esc(G.thumbOf(it)) + '" alt="' + esc(title) + '" loading="lazy"' +
        (it.w && it.h ? ' style="aspect-ratio:' + it.w + '/' + it.h + '"' : "") + '>' +
        "<span>" + esc(title) + "</span></button>";
    }).join("") + "</div>";
  }

  /* ------------------------------------------------------------
     messages
     ------------------------------------------------------------ */
  function startPoll() {
    stopPoll();
    pollId = setInterval(function () {
      if (!me) return;
      if (document.getElementById("msgSheet").dataset.open !== "true") return stopPoll();
      syncThread();
      if (me.role === "artist") refreshUnread();
    }, 6000);
  }
  function stopPoll() {
    if (pollId) { clearInterval(pollId); pollId = 0; }
  }

  async function openMsgs(prefill) {
    if (!me) return openAuth("in");
    openSheet("msgSheet");
    if (prefill) draft = prefill;
    if (me.role === "artist") await renderInbox();
    else { threadUser = me.id; await renderVisitorThread(); }
    startPoll();
  }

  async function renderInbox() {
    try { convs = await S.inbox(); } catch (e) { convs = []; }
    var body = $("#msgBody");
    body.innerHTML = '<div class="msg-layout">' +
      '<div class="msg-list" id="msgList">' +
      (convs.length ? convs.map(function (c) {
        return '<button class="msg-conv" type="button" data-uid="' + esc(c.user_id) + '">' +
          "<b>" + esc(c.display_name) + "</b><span>" + esc(c.last_body || "") + "</span>" +
          (c.unread ? '<span class="unread">' + c.unread + "</span>" : "") +
          "</button>";
      }).join("") : '<div class="msg-empty">' + esc(t("noThreads")) + "</div>") +
      '</div><div class="msg-thread" id="msgThread"><div class="msg-empty">' + esc(t("pickThread")) + "</div></div></div>";

    if (convs.length) await selectThread(convs[0].user_id, true);
  }

  async function selectThread(uid, first) {
    threadUser = uid;
    $$(".msg-conv").forEach(function (b) {
      b.setAttribute("aria-current", b.dataset.uid === uid ? "true" : "false");
      if (b.dataset.uid === uid) {
        var u = b.querySelector(".unread");
        if (u) u.remove();
      }
    });
    await renderThreadInto($("#msgThread"));
    if (first) {
      try { await S.markThreadRead(uid); } catch (e) {}
      refreshUnread();
    }
  }

  async function renderVisitorThread() {
    var body = $("#msgBody");
    body.innerHTML = '<div class="msg-thread" id="msgThread"></div>';
    await renderThreadInto($("#msgThread"));
  }

  async function renderThreadInto(container) {
    if (!container) return;
    var rows = [];
    try { rows = await S.thread(threadUser); } catch (e) { rows = []; }
    var keep = container.querySelector("#msgInput");
    if (keep) draft = keep.value;

    container.innerHTML = '<div class="msg-scroll" id="msgScroll">' +
      (rows.length ? rows.map(function (m) {
        var mine = m.sender_id === me.id || m.sender_id === "me";
        return '<div class="msg-bubble ' + (mine ? "me" : "them") + '">' + esc(m.body) +
          "<time>" + esc(rel(m.created_at)) + (mine ? " · " + esc(t("you")) : "") + "</time></div>";
      }).join("") : '<div class="msg-empty">' + esc(t("chatEmpty")) + "</div>") +
      '</div><form class="msg-form" id="msgForm"><textarea id="msgInput" rows="1" placeholder="' + esc(t("msgPh")) + '"></textarea>' +
      '<button type="submit" id="msgSend">' + esc(t("send")) + "</button></form>";

    var input = $("#msgInput");
    if (input) {
      input.value = draft || "";
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); sendMsg(); }
      });
      if (!draft) input.focus();
    }
    var sc = $("#msgScroll");
    if (sc) sc.scrollTop = sc.scrollHeight;
  }

  async function syncThread() {
    if (!threadUser) return;
    try { await S.markThreadRead(threadUser); } catch (e) {}
    var c = $("#msgThread");
    if (c) await renderThreadInto(c);
    else if ($("#msgBody .msg-thread")) await renderThreadInto($("#msgBody .msg-thread"));
  }

  async function sendMsg() {
    var input = $("#msgInput");
    var body = (input && input.value || "").trim();
    if (!body || !threadUser) return;
    var btn = $("#msgSend");
    if (btn) btn.disabled = true;
    try {
      await S.sendMessage(body, threadUser);
      draft = "";
      var c = $("#msgThread") || $("#msgBody .msg-thread");
      await renderThreadInto(c);
    } catch (e) {
      toast(t("fail"));
    }
    if (btn) btn.disabled = false;
  }

  /* ------------------------------------------------------------
     events
     ------------------------------------------------------------ */
  function wire() {
    $("#acct").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.id === "acctBtn") {
        if (me) toggleMenu();
        else openAuth("in");
        return;
      }
      var act = b.dataset.act;
      if (!act) return;
      toggleMenu(false);
      if (act === "out") {
        S.signOut().then(function () { me = null; return refreshAll(); });
      } else if (act === "favs") openFavs();
      else if (act === "msgs") openMsgs();
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest("#acct")) toggleMenu(false);
      var closeBtn = e.target.closest("[data-close]");
      if (closeBtn) closeSheet(closeBtn.dataset.close);
      var sheet = e.target.classList.contains("sheet") ? e.target : null;
      if (sheet) closeSheet(sheet.id);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var open = $$(".sheet[data-open='true']");
      if (open.length) { e.stopPropagation(); closeSheet(open[open.length - 1].id); }
    }, true);

    // auth sheet
    document.addEventListener("click", function (e) {
      var tab = e.target.closest(".auth-tab");
      if (tab) { setAuthMode(tab.dataset.mode); return; }
      if (e.target.closest("#afSwitch")) { setAuthMode(authMode === "in" ? "up" : "in"); return; }
      if (e.target.closest("#afReset")) {
        var email = $("#afEmail").value.trim();
        if (!email) return authMsg("err", t("resetNeed"));
        S.resetPassword(email).then(function () { authMsg("ok", t("resetSent")); })
          .catch(function () { authMsg("err", t("errGeneric")); });
      }
    });
    $("#authForm").addEventListener("submit", submitAuth);

    // cards: like pills
    $("#grid").addEventListener("click", function (e) {
      var pill = e.target.closest(".like-pill");
      if (!pill) return;
      e.preventDefault();
      e.stopPropagation();
      toggleLike(pill.dataset.id);
      pill.classList.remove("pop");
      void pill.offsetWidth;
      pill.classList.add("pop");
    }, true);

    // lightbox reactions
    document.addEventListener("click", function (e) {
      var r = e.target.closest("[data-react]");
      if (!r || !current) return;
      var id = idOf(current);
      if (r.dataset.react === "like") toggleLike(id);
      else if (r.dataset.react === "save") toggleSave(id);
      else if (r.dataset.react === "ask") {
        var title = L() === "ar" ? current.t : current.en;
        G.closeLightbox();
        openMsgs(t("msgAbout") + " «" + title + "» — ");
      }
    });

    // comments
    document.addEventListener("submit", function (e) {
      if (e.target.id === "cmtForm") { e.preventDefault(); submitComment(); }
      if (e.target.id === "msgForm") { e.preventDefault(); sendMsg(); }
    });
    document.addEventListener("click", function (e) {
      var del = e.target.closest("[data-del]");
      if (del) deleteComment(del.dataset.del);
      var gate = e.target.closest(".cmt-gate [data-act='signin']");
      if (gate) openAuth("in");
    });
    document.addEventListener("input", function (e) {
      if (e.target.id === "cmtInput") draft = e.target.value;
    });

    // favorites list
    $("#favBody").addEventListener("click", function (e) {
      var b = e.target.closest("[data-id]");
      if (!b) return;
      closeSheet("favSheet");
      G.openById(b.dataset.id);
    });

    // inbox list
    $("#msgBody").addEventListener("click", function (e) {
      var c = e.target.closest(".msg-conv");
      if (c) { draft = ""; selectThread(c.dataset.uid, true); }
    });

    // re-render on language switch
    document.addEventListener("lang:changed", function () {
      applyText(document);
      renderAcct();
      syncPills();
      if (current) { renderReactions(); renderComments(); }
      if (document.getElementById("favSheet").dataset.open === "true") renderFavs();
      if (document.getElementById("msgSheet").dataset.open === "true") {
        if (me && me.role === "artist") renderInbox(); else if (me) renderVisitorThread();
      }
    });

    document.addEventListener("cards:rendered", syncPills);
    document.addEventListener("lb:render", onLbRender);
    document.addEventListener("lb:close", onLbClose);
  }

  /* ------------------------------------------------------------
     boot
     ------------------------------------------------------------ */
  async function boot() {
    // tags for the personal photography set
    var photoTags = {
      street: { ar: "الشارع", en: "Street" },
      portrait: { ar: "بورتريه", en: "Portrait" },
      light: { ar: "الضوء", en: "Light" },
      shadow: { ar: "الظل", en: "Shadow" },
      texture: { ar: "الملمس", en: "Texture" },
      motion: { ar: "الحركة", en: "Motion" },
      detail: { ar: "التفاصيل", en: "Detail" },
      night: { ar: "الليل", en: "Night" },
      sea: { ar: "البحر", en: "Sea" },
      sky: { ar: "السماء", en: "Sky" },
      everyday: { ar: "اليومي", en: "Everyday" },
      memory: { ar: "الذاكرة", en: "Memory" },
      solitude: { ar: "العزلة", en: "Solitude" },
      hands: { ar: "الأيدي", en: "Hands" },
      window: { ar: "النافذة", en: "Window" },
      travel: { ar: "السفر", en: "Travel" }
    };
    Object.keys(photoTags).forEach(function (k) { if (!G.TAGS[k]) G.TAGS[k] = photoTags[k]; });

    build();
    try { await S.init(); } catch (e) { console.warn("[gallery] init:", e); }
    try { me = await S.user(); } catch (e) { me = null; }
    S.onChange(function () { onAuthChange(); });
    await loadWorks();
    await refreshAll();
    // a deep link (#p=12) opens the lightbox before this script boots
    if (G.isOpen() && G.current()) onLbRender({ detail: { item: G.current() } });
    if (dbBroken && S.mode === "cloud") {
      setTimeout(function () { toast(t("dbError")); }, 1200);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
