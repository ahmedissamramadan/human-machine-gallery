/* ============================================================
   GalleryStore — one small data layer, two engines:
     • cloud : Supabase (accounts, database, storage)
     • demo  : localStorage (works with no account, labelled clearly)
   Every method returns a Promise so the UI never cares which one runs.
   ============================================================ */
(function () {
  "use strict";

  var CFG = window.GALLERY_CONFIG || {};
  var CLOUD = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);

  /* ------------------------------------------------------------
     helpers
     ------------------------------------------------------------ */
  function uid() {
    return "d" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function readDB() {
    try {
      return JSON.parse(localStorage.getItem("gallery:demo:v1") || "null") || {
        users: {}, artist: null, session: null,
        likes: {}, favs: {}, comments: [], messages: []
      };
    } catch (e) {
      return { users: {}, artist: null, session: null, likes: {}, favs: {}, comments: [], messages: [] };
    }
  }
  function writeDB(db) {
    try { localStorage.setItem("gallery:demo:v1", JSON.stringify(db)); } catch (e) {}
  }
  function b64(s) { try { return btoa(unescape(encodeURIComponent(s))); } catch (e) { return s; } }

  /* ------------------------------------------------------------
     DEMO engine
     ------------------------------------------------------------ */
  var Demo = {
    mode: "demo",

    async init() {},

    async user() {
      var db = readDB();
      if (!db.session) return null;
      var u = db.users[db.session];
      if (!u) return null;
      return {
        id: u.email,
        email: u.email,
        name: u.name || u.email.split("@")[0],
        role: db.artist === u.email ? "artist" : "visitor"
      };
    },

    onChange(cb) { Demo._cb = cb; },

    _fire() { if (Demo._cb) Demo._cb(); },

    async signIn(email, password) {
      var db = readDB();
      var u = db.users[email.toLowerCase()];
      if (!u || u.pass !== b64(password)) {
        var e = new Error("Invalid login credentials");
        e.code = "invalid";
        throw e;
      }
      db.session = u.email;
      writeDB(db);
      Demo._fire();
      return { user: await Demo.user() };
    },

    async signUp(email, password, name) {
      var db = readDB();
      email = email.toLowerCase();
      if (db.users[email]) {
        var e = new Error("User already registered");
        e.code = "exists";
        throw e;
      }
      db.users[email] = { email: email, pass: b64(password), name: name || email.split("@")[0], created_at: new Date().toISOString() };
      if (!db.artist) db.artist = email; // in demo mode the first account owns the gallery
      db.session = email;
      writeDB(db);
      Demo._fire();
      return { user: await Demo.user(), demoFirst: db.artist === email };
    },

    async signOut() {
      var db = readDB();
      db.session = null;
      writeDB(db);
      Demo._fire();
    },

    async resetPassword(email) { return true; },

    async loadWorks() { return null; }, // demo keeps the plates bundled in the page

    async stats() {
      var db = readDB(), out = {};
      Object.keys(db.likes).forEach(function (k) { out[k] = out[k] || { likes: 0, favorites: 0, comments: 0 }; out[k].likes = db.likes[k].length; });
      Object.keys(db.favs).forEach(function (k) { out[k] = out[k] || { likes: 0, favorites: 0, comments: 0 }; out[k].favorites = db.favs[k].length; });
      db.comments.forEach(function (c) { out[c.workId] = out[c.workId] || { likes: 0, favorites: 0, comments: 0 }; out[c.workId].comments++; });
      return out;
    },

    async myLikes() {
      var db = readDB(), me = db.session, out = [];
      Object.keys(db.likes).forEach(function (k) { if (db.likes[k].indexOf(me) >= 0) out.push(k); });
      return out;
    },

    async myFavorites() {
      var db = readDB(), me = db.session, out = [];
      Object.keys(db.favs).forEach(function (k) { if (db.favs[k].indexOf(me) >= 0) out.push(k); });
      return out;
    },

    async toggleLike(workId, on) {
      var db = readDB(), me = db.session;
      if (!me) throw new Error("not signed in");
      var arr = db.likes[workId] || (db.likes[workId] = []);
      var i = arr.indexOf(me);
      if (on && i < 0) arr.push(me);
      if (!on && i >= 0) arr.splice(i, 1);
      writeDB(db);
    },

    async toggleFavorite(workId, on) {
      var db = readDB(), me = db.session;
      if (!me) throw new Error("not signed in");
      var arr = db.favs[workId] || (db.favs[workId] = []);
      var i = arr.indexOf(me);
      if (on && i < 0) arr.push(me);
      if (!on && i >= 0) arr.splice(i, 1);
      writeDB(db);
    },

    async comments(workId) {
      var db = readDB();
      return db.comments
        .filter(function (c) { return c.workId === workId; })
        .map(function (c) {
          var u = db.users[c.email] || {};
          return {
            id: c.id, user_id: c.email,
            display_name: u.name || c.email.split("@")[0],
            body: c.body, created_at: c.created_at,
            is_artist: db.artist === c.email
          };
        });
    },

    async addComment(workId, body) {
      var db = readDB(), me = db.session;
      if (!me) throw new Error("not signed in");
      db.comments.push({ id: uid(), workId: workId, email: me, body: body, created_at: new Date().toISOString() });
      writeDB(db);
    },

    async deleteComment(id) {
      var db = readDB();
      db.comments = db.comments.filter(function (c) { return c.id !== id; });
      writeDB(db);
    },

    async artistComments(workId) { return []; },

    async inbox() {
      var db = readDB(), me = db.session, map = {};
      if (db.artist !== me) return [];
      db.messages.forEach(function (m) {
        var k = m.userEmail;
        var u = db.users[k] || {};
        map[k] = map[k] || { user_id: k, display_name: u.name || k.split("@")[0], last_body: m.body, last_at: m.created_at, unread: 0 };
        if (m.created_at >= map[k].last_at) { map[k].last_body = m.body; map[k].last_at = m.created_at; }
        if (!m.read_at && m.senderEmail !== me) map[k].unread++;
      });
      return Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return a.last_at < b.last_at ? 1 : -1; });
    },

    async thread(threadUser) {
      var db = readDB(), me = db.session;
      return db.messages
        .filter(function (m) { return m.userEmail === threadUser; })
        .map(function (m) {
          return {
            id: m.id, user_id: m.userEmail, sender_id: m.senderEmail,
            body: m.body, read_at: m.read_at, created_at: m.created_at
          };
        })
        .sort(function (a, b) { return a.created_at < b.created_at ? -1 : 1; });
    },

    async sendMessage(body, threadUser) {
      var db = readDB(), me = db.session;
      if (!me) throw new Error("not signed in");
      db.messages.push({
        id: uid(), userEmail: threadUser || me, senderEmail: me,
        body: body, created_at: new Date().toISOString(), read_at: null
      });
      writeDB(db);
    },

    async markThreadRead(threadUser) {
      var db = readDB(), me = db.session;
      var changed = false;
      db.messages.forEach(function (m) {
        if (m.userEmail === threadUser && m.senderEmail !== me && !m.read_at) { m.read_at = new Date().toISOString(); changed = true; }
      });
      if (changed) writeDB(db);
    }
  };

  /* ------------------------------------------------------------
     CLOUD engine (Supabase)
     ------------------------------------------------------------ */
  var sb = null;
  var Cloud = {
    mode: "cloud",
    _cb: null,
    _me: null,

    async init() {
      sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      sb.auth.onAuthStateChange(function () {
        Cloud._me = null;
        if (Cloud._cb) setTimeout(function () { Cloud._cb(); }, 0);
      });
    },

    onChange(cb) { Cloud._cb = cb; },

    async user() {
      var res = await sb.auth.getUser();
      if (res.error || !res.data || !res.data.user) return null;
      var au = res.data.user;
      var p = await sb.from("profiles").select("display_name, role, avatar_url").eq("id", au.id).maybeSingle();
      var row = (p && p.data) || {};
      return {
        id: au.id,
        email: au.email,
        name: row.display_name || (au.email || "").split("@")[0],
        role: row.role || "visitor"
      };
    },

    async _need() {
      if (Cloud._me) return Cloud._me;
      Cloud._me = await Cloud.user();
      if (!Cloud._me) throw new Error("not signed in");
      return Cloud._me;
    },

    async signIn(email, password) {
      var r = await sb.auth.signInWithPassword({ email: email, password: password });
      if (r.error) throw mapErr(r.error);
      Cloud._me = await Cloud.user();
      return { user: Cloud._me };
    },

    async signUp(email, password, name) {
      var r = await sb.auth.signUp({
        email: email, password: password,
        options: { data: { display_name: name } }
      });
      if (r.error) throw mapErr(r.error);
      if (!r.data.session) return { needsConfirm: true };
      Cloud._me = await Cloud.user();
      return { user: Cloud._me };
    },

    async signOut() { await sb.auth.signOut(); Cloud._me = null; },

    async resetPassword(email) {
      var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (r.error) throw mapErr(r.error);
      return true;
    },

    async loadWorks() {
      var r = await sb.from("works").select("*").eq("published", true).order("sort", { ascending: true });
      if (r.error) throw r.error;
      return r.data || [];
    },

    async stats() {
      var r = await sb.rpc("work_stats");
      if (r.error) throw r.error;
      var out = {};
      (r.data || []).forEach(function (row) {
        out[row.work_id] = { likes: row.likes, favorites: row.favorites, comments: row.comments };
      });
      return out;
    },

    async myLikes() {
      var r = await sb.from("likes").select("work_id");
      if (r.error) throw r.error;
      return (r.data || []).map(function (x) { return x.work_id; });
    },

    async myFavorites() {
      var r = await sb.from("favorites").select("work_id");
      if (r.error) throw r.error;
      return (r.data || []).map(function (x) { return x.work_id; });
    },

    async toggleLike(workId, on) {
      var me = await Cloud._need();
      var r = on
        ? await sb.from("likes").insert({ user_id: me.id, work_id: workId })
        : await sb.from("likes").delete().eq("user_id", me.id).eq("work_id", workId);
      if (r.error && r.error.code !== "23505") throw r.error;
    },

    async toggleFavorite(workId, on) {
      var me = await Cloud._need();
      var r = on
        ? await sb.from("favorites").insert({ user_id: me.id, work_id: workId })
        : await sb.from("favorites").delete().eq("user_id", me.id).eq("work_id", workId);
      if (r.error && r.error.code !== "23505") throw r.error;
    },

    async comments(workId) {
      var r = await sb.rpc("work_comments", { p_work: workId });
      if (r.error) throw r.error;
      return r.data || [];
    },

    async addComment(workId, body) {
      var me = await Cloud._need();
      var r = await sb.from("comments").insert({ work_id: workId, user_id: me.id, body: body });
      if (r.error) throw r.error;
    },

    async deleteComment(id) {
      var r = await sb.from("comments").delete().eq("id", id);
      if (r.error) throw r.error;
    },

    async inbox() {
      var r = await sb.rpc("inbox");
      if (r.error) throw r.error;
      return r.data || [];
    },

    async thread(threadUser) {
      var r = await sb.from("messages")
        .select("id,user_id,sender_id,body,read_at,created_at")
        .eq("user_id", threadUser)
        .order("created_at", { ascending: true });
      if (r.error) throw r.error;
      return r.data || [];
    },

    async sendMessage(body, threadUser) {
      var me = await Cloud._need();
      var r = await sb.from("messages").insert({
        user_id: threadUser || me.id,
        sender_id: me.id,
        body: body
      });
      if (r.error) throw r.error;
    },

    async markThreadRead(threadUser) {
      var me = await Cloud._need();
      await sb.from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", threadUser)
        .neq("sender_id", me.id)
        .is("read_at", null);
    }
  };

  function mapErr(e) {
    var msg = (e && e.message) || "error";
    var err = new Error(msg);
    err.code = "supabase";
    var low = msg.toLowerCase();
    if (low.indexOf("invalid login") >= 0) err.code = "invalid";
    else if (low.indexOf("already registered") >= 0 || low.indexOf("already exists") >= 0) err.code = "exists";
    else if (low.indexOf("email not confirmed") >= 0) err.code = "unconfirmed";
    else if (low.indexOf("password") >= 0 && low.indexOf("characters") >= 0) err.code = "weakpass";
    return err;
  }

  /* Holds the active engine; the UI talks to GalleryStore only. */
  var active = CLOUD ? Cloud : Demo;
  window.GalleryStore = {
    get mode() { return active.mode; },
    setMe: function (u) { if (active === Cloud) Cloud._me = u; },
    init: function () { return active.init(); },
    onChange: function (cb) { return active.onChange(cb); },
    user: function () { return active.user(); },
    signIn: function (e, p) { return active.signIn(e, p); },
    signUp: function (e, p, n) { return active.signUp(e, p, n); },
    signOut: function () { return active.signOut(); },
    resetPassword: function (e) { return active.resetPassword(e); },
    loadWorks: function () { return active.loadWorks(); },
    stats: function () { return active.stats(); },
    myLikes: function () { return active.myLikes(); },
    myFavorites: function () { return active.myFavorites(); },
    toggleLike: function (id, on) { return active.toggleLike(id, on); },
    toggleFavorite: function (id, on) { return active.toggleFavorite(id, on); },
    comments: function (id) { return active.comments(id); },
    addComment: function (id, b) { return active.addComment(id, b); },
    deleteComment: function (id) { return active.deleteComment(id); },
    inbox: function () { return active.inbox(); },
    thread: function (u) { return active.thread(u); },
    sendMessage: function (b, u) { return active.sendMessage(b, u); },
    markThreadRead: function (u) { return active.markThreadRead(u); }
  };
})();
