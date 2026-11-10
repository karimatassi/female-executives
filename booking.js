/* SE7EN session booking: the free 15-min call (landing page) and the paid sessions (book.html?type=…).
 * Session types and weekly hours live in config.js → booking (Toronto time).
 * With booking.endpoint set (the Google Apps Script web app in /booking), busy times are read from
 * Karim's Google Calendar and each booking creates an event with a Google Meet link.
 * Empty endpoint = preview mode: the picker works, nothing is sent. */
(function () {
  const CFG = (window.SE7EN_CONFIG || {}).booking || {};
  // Shared preview links (Claude artifacts) can't reach Google, so they run in preview mode.
  const SHARED_PREVIEW = /claudeusercontent\.com$/.test(location.hostname);
  if (SHARED_PREVIEW) CFG.endpoint = "";
  const TZ = CFG.tz || "America/Toronto";
  const DAYS = CFG.days || 21;
  const NOTICE = (CFG.noticeHours == null ? 12 : CFG.noticeHours) * 3600e3;
  const HOURS = CFG.hours || {};
  const TYPES = CFG.types || { intro: { label: "Free 15-min call", minutes: 15, step: 15, public: true } };
  const COPY = {
    intro: { kicker: "Free · 15 minutes · video", title: "Talk to Karim first", lede: "15 minutes by video, about your goal. You'll leave knowing whether the program is right for you. No preparation needed.", ask: "What's the biggest thing you want to solve?", askReq: true, ph: "e.g. I want to meet a partner, but work takes all my time." },
    assessment: { kicker: "Program · 90 minutes · video", title: "Book your 7-in-1 assessment", lede: "Your 90-minute assessment with Karim. Use the email you paid with.", ask: "Anything Karim should know before your session?", askReq: false, ph: "Optional" },
    review: { kicker: "Program · 30 minutes · video", title: "Book your 1:1 review", lede: "Walk through your 360° Life Report and set your first actions. Book at least 3 days after your assessment, so your report is ready.", ask: "Anything you'd like to focus on?", askReq: false, ph: "Optional" },
    coaching: { kicker: "GROW · 60 minutes · video", title: "Book a coaching session", lede: "Your weekly 1-hour session with Karim. Use the email you signed up with.", ask: "What do you want to work on this session?", askReq: false, ph: "Optional" },
  };
  const $ = (s, r = document) => r.querySelector(s);

  // Offset (ms) of TZ from UTC at instant t
  function tzOffset(t) {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(t)).forEach((x) => (p[x.type] = x.value));
    return Date.UTC(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - t;
  }
  // Toronto wall-clock time -> UTC ms
  function zoned(y, m, d, hh, mm) {
    const guess = Date.UTC(y, m - 1, d, hh, mm);
    return guess - tzOffset(guess - tzOffset(guess));
  }
  // Toronto calendar date for an instant
  function parts(t) {
    const p = {};
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", weekday: "short" })
      .formatToParts(new Date(t)).forEach((x) => (p[x.type] = x.value));
    return { y: +p.year, m: +p.month, d: +p.day, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
  }
  const fmt = (o) => (t) => new Intl.DateTimeFormat("en-CA", Object.assign({ timeZone: TZ }, o)).format(new Date(t));
  const fmtDay = fmt({ weekday: "short", month: "short", day: "numeric" });
  const fmtLong = fmt({ weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  const fmtTime = fmt({ hour: "numeric", minute: "2-digit" });

  // Every open start time for the next DAYS days, grouped by Toronto date
  function buildDays(T, busy) {
    const now = Date.now(), earliest = now + NOTICE, len = T.minutes, step = T.step || 15, out = [];
    for (let i = 0; i <= DAYS; i++) {
      const p = parts(now + i * 864e5), wins = HOURS[p.wd] || [];
      const slots = [];
      wins.forEach(([a, b]) => {
        const [ah, am] = a.split(":").map(Number), [bh, bm] = b.split(":").map(Number);
        for (let m = ah * 60 + am; m + len <= bh * 60 + bm; m += step) {
          const s = zoned(p.y, p.m, p.d, Math.floor(m / 60), m % 60), e = s + len * 6e4;
          if (s >= earliest && !busy.some(([bs, be]) => s < be && e > bs)) slots.push(s);
        }
      });
      if (slots.length) out.push({ label: fmtDay(slots[0]), slots });
    }
    return out;
  }

  let type = "intro", days = [], chosen = null, sel = 0, req = 0;

  async function fetchBusy() {
    if (!CFG.endpoint) return [];
    const j = await (await fetch(`${CFG.endpoint}?action=busy`)).json();
    return (j.busy || []).map(([a, b]) => [Date.parse(a), Date.parse(b)]);
  }

  function renderDays() {
    $("#bkDays").innerHTML = days.map((d, i) => `<button type="button" role="tab" aria-selected="${i === sel}" data-i="${i}">${d.label.replace(", ", "<b>")}</b></button>`).join("");
    const d = days[sel];
    $("#bkSlots").innerHTML = d ? d.slots.map((s) => `<button type="button" data-s="${s}">${fmtTime(s)}</button>`).join("") : "";
  }
  function view(name) {
    $("#bkPick").hidden = name !== "pick"; $("#bkForm").hidden = name !== "form"; $("#bkDone").hidden = name !== "done";
  }
  function showForm(s) {
    chosen = s;
    $("#bkWhen").textContent = `${fmtLong(s)} · Toronto time`;
    $("#bkErr").hidden = true; view("form");
    setTimeout(() => $("#bkForm [name=name]").focus({ preventScroll: true }), 30);
  }

  async function open(t) {
    type = TYPES[t] ? t : "intro";
    const C = COPY[type] || COPY.intro, f = $("#bkForm");
    $("#bkKicker").textContent = C.kicker; $("#bkTitle").textContent = C.title; $("#bkLede").textContent = C.lede;
    const PH = { solo: "e.g. I want to leave corporate and start my own consultancy, but I'm scared of the money.", clarity: "e.g. I'm doing well on paper, but I don't know what I actually want next." };
    $("#bkAsk").textContent = C.ask; f.pain.required = C.askReq;
    f.pain.placeholder = (type === "intro" && PH[new URLSearchParams(location.search).get("h")]) || C.ph;
    view("pick");
    const status = $("#bkStatus"), mine = ++req;
    status.textContent = "Loading available times…"; status.hidden = false; $("#bkDays").innerHTML = $("#bkSlots").innerHTML = "";
    let busy = [];
    try { busy = await fetchBusy(); } catch (e) { busy = []; }
    if (mine !== req) return;
    days = buildDays(TYPES[type], busy); sel = 0;
    status.hidden = !!days.length;
    status.textContent = "No open times in the next three weeks. Email Karim and he'll find one.";
    renderDays();
  }

  function init() {
    if (!$("#bkDays")) return;
    $("#bkDays").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]"); if (b) { sel = +b.dataset.i; renderDays(); }
    });
    $("#bkSlots").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-s]"); if (b) showForm(+b.dataset.s);
    });
    $("#bkChange").addEventListener("click", () => view("pick"));
    $("#bkForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, err = $("#bkErr"), btn = $("#bkSubmit");
      if (!f.reportValidity()) return;
      const data = Object.assign(Object.fromEntries(new FormData(f)), { type, start: new Date(chosen).toISOString() });
      if (!CFG.endpoint) { err.textContent = SHARED_PREVIEW ? "This is a preview link, so nothing was booked. Booking works on the live site." : "Preview: online booking isn't connected yet, so nothing was sent."; err.hidden = false; return; }
      btn.disabled = true; btn.textContent = "Booking…"; err.hidden = true;
      try {
        const j = await (await fetch(CFG.endpoint, { method: "POST", body: JSON.stringify(data) })).json();
        if (j.ok) {
          $("#bkDoneWhen").textContent = `${fmtLong(chosen)} · Toronto time`;
          view("done"); f.reset();
          if (window.SE7EN_TRACK) window.SE7EN_TRACK("session_booked", { type });
        } else {
          const msg = { taken: "Someone just took that time. Please pick another.", not_client: "We couldn't find a booking for that email. Use the email you paid with, or reply to your receipt and Karim will book you in." }[j.error];
          err.textContent = msg || "Something went wrong. Please try again."; err.hidden = false;
          if (j.error === "taken") setTimeout(() => open(type), 1500);
        }
      } catch (x) {
        err.textContent = "Couldn't reach the calendar. Please try again in a minute."; err.hidden = false;
      }
      btn.disabled = false; btn.textContent = "Confirm";
    });
    const q = new URLSearchParams(location.search).get("type");
    if (document.body.dataset.bookPage !== undefined) open(q);
  }

  window.SE7EN_BOOK = { open };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
