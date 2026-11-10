/* SE7EN landing page. No data leaves the page unless a URL is set in config.js. */
(function () {
  "use strict";

  const CFG = window.SE7EN_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const NS = "http://www.w3.org/2000/svg";
  const fmt = (n) => Number(n).toLocaleString("en-CA");
  const PRICE = CFG.prices?.reset ?? 499;

  // Front-end names are deliberately simple; "formal" is the dimension the assessment scores (PMSVFIS).
  // problem = what people come in with (hero chips); covers = what the dimension spans (Why 7 cards)
  const DIMS = [
    { name: "Physical", formal: "Physical", problem: "Running on empty", covers: "Sleep, food, movement and the habits that won't stick." },
    { name: "Mental", formal: "Mental", problem: "Burnt out", covers: "Stress, focus, mood and the patterns that keep repeating." },
    { name: "Social", formal: "Social", problem: "No time for relationships", covers: "Partner, friends, family and the people you spend your days with." },
    { name: "Vocational", formal: "Vocational", problem: "Career plateau", covers: "Your career, your business and where it's heading." },
    { name: "Financial", formal: "Financial", problem: "Money stress", covers: "Income, runway and the money decisions you keep avoiding." },
    { name: "Intellectual", formal: "Intellectual", problem: "Stopped learning", covers: "The skills, knowledge and training your goal needs." },
    { name: "Spiritual", formal: "Spiritual", problem: "Lost the why", covers: "Your values, your why, and what success means to you." },
  ];

  /* ---------- The mark: a solid particle carrying a terminal prompt ">_" ---------- */
  // A sharp forward chevron (~53° between the arms) inside a solid circle: the "7" in SE7EN
  const COIN = `<circle class="body" cx="20" cy="20" r="19"/>` +
    `<path class="prompt" d="M13 8.8L28.6 20L13 31.2"/>`;
  $$("[data-coin]").forEach((s) => (s.innerHTML = COIN));

  // SE7EN wordmark drawn on a 5x7 pixel grid (unlit cells faintly visible, like an LCD), > coin in the middle
  const GLYPHS = {
    S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  };
  function pixelWordmark() {
    const P = 4, G = 1, C = P + G, LW = 5 * C - G, H = 7 * C - G, GAP = 9;
    let x = 0, out = "";
    const letter = (ch) => {
      GLYPHS[ch].forEach((row, r) => [...row].forEach((v, c) => {
        out += `<rect x="${x + c * C}" y="${r * C}" width="${P}" height="${P}" class="${v === "#" ? "px-on" : "px-off"}"/>`;
      }));
      x += LW + GAP;
    };
    letter("S"); letter("E");
    // the coin: solid circle with a pixel chevron
    const d = H + 2, cx = x + d / 2, cy = H / 2;
    out += `<circle cx="${cx}" cy="${cy}" r="${d / 2}" class="px-coin"/>`;
    [[0,0],[1,1],[2,2],[3,3],[2,4],[1,5],[0,6]].forEach(([c, r]) => {
      out += `<rect x="${cx - 7 + c * 4.2}" y="${cy - 13.7 + r * 4.2}" width="4" height="4" class="px-gt"/>`;
    });
    x += d + GAP;
    letter("E"); letter("N");
    return `<svg class="pxmark" viewBox="-1 -1 ${x - GAP + 2} ${H + 2}" aria-hidden="true">${out}</svg>`;
  }
  $$("[data-wordmark]").forEach((el) => (el.innerHTML = `<span class="wm">SE<svg class="coin" viewBox="0 0 40 40" aria-hidden="true">${COIN}</svg>EN</span>`));
  const SE_HTML = `<span class="se" role="img" aria-label="SEVEN">SE<svg class="coin" viewBox="0 0 40 40" aria-hidden="true">${COIN}</svg>EN</span>`;

  /* ---------- Analytics (06 §9). Never includes Check-In answers. ---------- */
  const utm = (() => {
    const out = {};
    try {
      const q = new URLSearchParams(location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "venue", "event"].forEach((k) => { if (q.get(k)) out[k] = q.get(k); });
      if (Object.keys(out).length) sessionStorage.setItem("se7en_utm", JSON.stringify(out));
      else Object.assign(out, JSON.parse(sessionStorage.getItem("se7en_utm") || "{}"));
    } catch (_) { /* storage blocked: attribution covers this page view only */ }
    return out;
  })();
  const variant = (() => {
    const q = new URLSearchParams(location.search).get("h"), n = parseInt(q, 10);
    const byKey = (CFG.headlines || []).findIndex((x) => x.key && x.key === q);
    if (byKey >= 0) return byKey + 1;
    return CFG.headlines && n >= 1 && n <= CFG.headlines.length ? n : 1;
  })();
  window.SE7EN_TRACK = (e, p) => track(e, p);
  function track(event, props = {}) {
    const payload = Object.assign({ event, headline: variant }, utm, props);
    (window.dataLayer = window.dataLayer || []).push(payload);
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) console.debug("[track]", payload);
  }
  function withUtm(url) {
    try {
      const u = new URL(url);
      Object.entries(utm).forEach(([k, v]) => { if (!u.searchParams.has(k)) u.searchParams.set(k, v); });
      return u.toString();
    } catch (_) { return url; }
  }

  /* ---------- Config-driven content ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  if (CFG.headlines && $("#heroH")) {
    const h = CFG.headlines[variant - 1];
    // A "|" in the headline splits it: the second part renders muted
    const [a, b] = h.h.split("|");
    $("#heroH").innerHTML = esc(a.trim()) + (b ? ` <span class="soft">${esc(b.trim())}</span>` : "");
    if (h.hook) ($("[data-hook]") || {}).textContent = h.hook;
    if (h.final && $("#finalH")) $("#finalH").textContent = h.final;
    if (h.worth && $("#worthA")) $("#worthA").textContent = h.worth;
    // ad visitors are cold: the free call leads, the $699 booking follows
    if (h.key && $("#heroCall") && $("#heroBook")) {
      $("#heroCall").className = "btn btn-primary"; $("#heroBook").className = "btn btn-ghost";
      $("#heroBook").parentNode.insertBefore($("#heroCall"), $("#heroBook"));
      document.body.classList.add("ad");
      if (h.provs) {
        const ul = $("#compare ul.prov"); if (ul) ul.innerHTML = h.provs.map(([n, , t, fee]) => `<li><b>${esc(n)}</b><span>${esc(t)}</span><i class="fee mono">${esc(fee)}</i></li>`).join("");
        const sm = $("#compare .cmp-sum"); if (sm && h.sum) sm.textContent = h.sum;
      }
      // compare against what this visitor would actually use instead (no prices), not the health-provider table
      if (false && h.alts && $("#compareH")) { // replaced by the "one direction vs change the field" block
        $("#compareH").insertAdjacentHTML("afterend", `<ul class="alts">${h.alts.map(([n, d]) => `<li><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join("")}<li class="us"><b>Karim Atassi, MD</b><span>sees all 7 areas of your life, and how they connect</span></li></ul>`);
      }
      // why an MD, for this goal, at the top of the open card
      if (h.why) { const p = $$(".pw-panel")[(h.card || 1) - 1]; if (p) p.insertAdjacentHTML("afterbegin", `<p class="pw-why">${esc(h.why)}</p>`); }
      // plain words instead of clinical ones
      $$("#how p, #offer p, #offer b").forEach((el) => { if (/biopsychosocial/i.test(el.textContent)) el.innerHTML = el.innerHTML.replace(/evidence-based biopsychosocial/gi, "evidence-based").replace(/biopsychosocial assessment/gi, "structured assessment").replace(/biopsychosocial /gi, ""); });
      // options after the questions, so the free call doesn't feel like a pitch for them
      const pr = $("#pricing"), fq = $("#faq"); if (pr && fq) fq.after(pr);
      $("#heroBook").parentNode.insertAdjacentHTML("afterend", '<p class="hero-call-note">Free call: 15 minutes by video, weekdays at lunch or evenings, or Saturday mornings. Tell Karim what\'s going on; he\'ll tell you honestly whether the RESET fits.</p>');
      // …and every other main button on the page offers the call too
      const toCall = (b, label) => { b.dataset.open = "infocall"; b.removeAttribute("href"); b.setAttribute("role", "button"); b.textContent = label; };
      const navBtn = $("#nav .btn"); if (navBtn) toCall(navBtn, "Free call");
      const st = $("#stickyCta"); if (st) { st.querySelector("span").innerHTML = "<b>Free 15-minute call</b><span class=\"st-extra\"> · with Karim</span>"; toCall(st.querySelector("button"), "Free call"); }
      $$(".pw-foot .btn-primary").forEach((b) => toCall(b, "Free 15-minute call"));
      $$("#how .cta-row .btn-primary, #karim .cta-row .btn-primary").forEach((b) => toCall(b, "Free 15-minute call"));
      const ob = $("#offer .of-buy .btn-primary"), oc = $("#offer .of-buy [data-open=\"infocall\"]"); if (ob && oc) { ob.className = "btn btn-ghost-dark btn-block"; oc.className = "btn btn-primary btn-block"; oc.textContent = "Free 15-minute call"; oc.after(ob); }
      const qs = $("#testimonials .wrap"); if (qs) qs.insertAdjacentHTML("beforeend", '<div class="cta-row center tst-cta"><button type="button" class="btn btn-primary" data-open="infocall" data-loc="quotes_call">Free 15-minute call</button></div>');
      const fin = $(".final .cta-row");
      if (fin) fin.insertAdjacentHTML("afterbegin", '<button type="button" class="btn btn-primary" data-open="infocall" data-loc="final_call">Free 15-minute call</button>'), (fin.querySelector('[data-open="checkout"]') || {}).className = "btn btn-ghost";
      const dup = $('.final-g [data-open="infocall"]'); if (dup) { dup.previousSibling && dup.previousSibling.nodeType === 3 && (dup.previousSibling.textContent = ""); dup.remove(); }
    }
    if (h.compare && $("#compareH")) { const [p, q] = h.compare.split("|"); $("#compareH").innerHTML = esc(p.trim()) + ` <span class="soft">${esc(q.trim())}</span>`; }
    $("#heroSub").innerHTML = h.sub.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]).replace(/\*$/, '<a href="#faq-guarantee" class="g-link" aria-label="See the guarantee conditions">*</a>');
  }
  // Workshop QR visitors already know Karim; greet them as such instead of with the cold pain hook
  if (CFG.workshopHook && (utm.utm_source === "workshop" || utm.venue || utm.event)) ($("[data-hook]") || {}).textContent = CFG.workshopHook;
  // While booking isn't live, never leave a dead end: offer whatever real contact route exists
  const contacts = [];
  if (CFG.contactEmail) contacts.push(`<a href="mailto:${esc(CFG.contactEmail)}">Email Karim</a>`);
  const SOC = CFG.socials || {};
  if (SOC.instagram) contacts.push(`<a href="${esc(SOC.instagram)}" target="_blank" rel="noopener">Message Karim on Instagram</a>`);
  $$("[data-contact-line]").forEach((el) => {
    el.innerHTML = contacts.length ? "Want in now? " + contacts.join(" · ") : "Want in now? Ask Karim directly at the workshop.";
  });
  $$("[data-price]").forEach((el) => (el.textContent = fmt(PRICE)));
  if (CFG.tiers?.grow?.price) $$('[data-tier-price="grow"]').forEach((el) => (el.textContent = fmt(CFG.tiers.grow.price)));
  if (CFG.tiers?.platinum?.priceLabel) $$('[data-tier-price="platinum"]').forEach((el) => (el.textContent = CFG.tiers.platinum.priceLabel));
  if (CFG.founderTitle) $$("[data-founder]").forEach((el) => (el.textContent = CFG.founderTitle));
  ($("#creds") || {}).innerHTML = (CFG.credentials || []).map((c) => `<li>${esc(c)}</li>`).join("");
  if (CFG.guarantee && CFG.guarantee.text) {
    ($("#guarantee") || {}).hidden = false;
    ($("#heroGuarantee") || {}).hidden = false;
    ($("#gTitle") || {}).textContent = CFG.guarantee.title;
    ($("#gText") || {}).textContent = CFG.guarantee.text;
    ($("#faqG") || {}).textContent = CFG.guarantee.text;
    ($("#finalG") || {}).textContent = CFG.guarantee.title + " — " + CFG.guarantee.text;
  }
  if (CFG.spotsThisMonth) { ($("#spots") || {}).hidden = false; ($("#spots") || {}).textContent = `${CFG.spotsThisMonth} spots left this month.`; }
  else if (CFG.resetsPerMonth) { ($("#spots") || {}).hidden = false; ($("#spots") || {}).textContent = `Karim takes on ${CFG.resetsPerMonth} RESETs a month.`; }
  if (CFG.resetsPerMonth) $$("[data-cap]").forEach((el) => (el.textContent = CFG.resetsPerMonth));
  // no public "payment not connected" banner (Karim, Nov 7 2026): "Get started" offers the free call until Stripe is live
  if (CFG.contactEmail) ($("#contactSlot") || {}).innerHTML = `<a href="mailto:${esc(CFG.contactEmail)}">${esc(CFG.contactEmail)}</a>`;
  $("#year").textContent = new Date().getFullYear();
  /* ---------- Karim's profiles: only the ones with a URL in config.js are shown ---------- */
  const ICONS = {
    instagram: ["Instagram", '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/>'],
    linkedin: ["LinkedIn", '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>'],
    youtube: ["YouTube", '<rect x="2.5" y="5.5" width="19" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>'],
    tiktok: ["TikTok", '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.4 2.6 2.2 4.4 5 4.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>'],
    x: ["X", '<path d="M4 4l16 16M20 4L4 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"/>'],
    linktree: ["Links", '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2"/>'],
    newsletter: ["Newsletter", '<rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 6l9 7 9-7" fill="none" stroke="currentColor" stroke-width="2"/>'],
    podcast: ["Podcast", '<rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2"/>'],
  };
  const socialItems = Object.keys(ICONS).filter((k) => SOC[k]).map((k) =>
    `<li><a href="${esc(SOC[k])}" target="_blank" rel="noopener" aria-label="Karim on ${ICONS[k][0]}" title="${ICONS[k][0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k][1]}</svg></a></li>`).join("");
  $$("[data-socials]").forEach((ul) => { ul.innerHTML = socialItems; ul.hidden = !socialItems; });

  ($("#dims") || {}).innerHTML = DIMS.map((d, i) => `<li><b>${i + 1}</b><div><h3>${d.name} <span class="formal">${d.formal}</span></h3><p>${d.covers}</p></div></li>`).join("");
  const GOALS = ["More energy at work", "Sleep through the night", "Manage stress and burnout", "Lose weight on a busy schedule", "Train for a marathon", "Feel less alone at the top"];
  ($("#problems") || {}).innerHTML = GOALS.map((g) => `<li><i aria-hidden="true"></i>${g}</li>`).join("");

  /* ---------- Board of health directors: a circle of care around you ---------- */
  (function boardDiagram() {
    const svg = $("#boardSvg");
    if (!svg) return;
    const ROLES = ["Physician", "Therapist", "Trainer", "Dietitian", "Career coach", "Financial planner", "Mentor"];
    const C = 240, R = 190, NR = 52;
    const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); svg.appendChild(n); return n; };
    add("circle", { class: "b-ring", cx: C, cy: C, r: R });
    add("circle", { class: "b-ring faint", cx: C, cy: C, r: R - 80 });
    ROLES.forEach((role, i) => {
      const a = (-90 + (360 / 7) * i) * (Math.PI / 180), x = C + R * Math.cos(a), y = C + R * Math.sin(a);
      add("line", { class: "b-spoke", x1: C + 56 * Math.cos(a), y1: C + 56 * Math.sin(a), x2: x - NR * Math.cos(a), y2: y - NR * Math.sin(a) });
      add("circle", { class: "b-node", cx: x, cy: y, r: NR });
      const words = role.split(" ");
      words.forEach((w, k) => add("text", { class: "b-role", x, y: y + (k - (words.length - 1) / 2) * 17 }).textContent = w);
    });
    add("circle", { class: "b-core", cx: C, cy: C, r: 54 });
    add("text", { class: "b-you", x: C, y: C - 9 }).textContent = "You";
    add("text", { class: "b-goal", x: C, y: C + 17 }).textContent = "one goal";
  })();

  /* ---------- Hero scope: a typical check-up sees 1 of 7, SE7EN maps all 7 ---------- */
  const scope = (() => {
    const svg = $("#scopeSvg");
    if (!svg) return null;
    const C = 240, R = 172, NR = 42;
    const add = (tag, attrs, parent = svg) => {
      const n = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
      parent.appendChild(n);
      return n;
    };
    const pts = DIMS.map((_, i) => {
      const a = (-90 + (360 / 7) * i) * (Math.PI / 180);
      return { a, x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
    });
    add("circle", { class: "ring", cx: C, cy: C, r: R });
    pts.forEach((p, i) => { const q = pts[(i + 1) % 7]; add("line", { class: "chord", x1: p.x, y1: p.y, x2: q.x, y2: q.y }); });
    const groups = pts.map((p, i) => {
      const g = add("g", {});
      add("line", { class: "spoke", x1: C + 48 * Math.cos(p.a), y1: C + 48 * Math.sin(p.a), x2: p.x - NR * Math.cos(p.a), y2: p.y - NR * Math.sin(p.a) }, g);
      add("circle", { class: "node", cx: p.x, cy: p.y, r: NR }, g);
      add("text", { class: "code", x: p.x, y: p.y, style: DIMS[i].name.length > 8 ? "font-size:11.5px" : "" }, g).textContent = DIMS[i].name;
      return g;
    });
    add("circle", { class: "core", cx: C, cy: C, r: 40 });
    add("text", { class: "core-txt", x: C, y: C }).textContent = "You";

    const title = $("#scopeTitle"), count = $("#scopeCount"), tabs = $$(".seg button");
    let mode = "one", timer = null;
    function set(m) {
      mode = m;
      groups.forEach((g, i) => g.classList.toggle("on", m === "all" || i === 0));
      svg.classList.toggle("all", m === "all");
      title.innerHTML = m === "all" ? `${SE_HTML} program` : "A typical check-up";
      count.textContent = m === "all" ? "7 of 7" : "1 of 7";
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.mode === m)));
    }
    tabs.forEach((t) => t.addEventListener("click", () => { clearInterval(timer); set(t.dataset.mode); track("scope_toggle", { mode: t.dataset.mode }); }));
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    set("one");
    if (reduce) set("all");
    else timer = setInterval(() => set(mode === "one" ? "all" : "one"), 2800);
    return { set };
  })();
  void scope;

  /* ---------- Founder reel: caption follows the montage's clips ---------- */
  const reel = $("#founderReel"), reelCap = $("#reelCap");
  if (reel && reelCap) {
    const CLIPS = [[0, "TEDxMcGill"], [1.3, "On the podcast"], [2.4, "TEDxMcGill"], [3.4, "McGill Medicine · White Coat Ceremony"], [4.6, "TEDxMcGill"], [5.8, "On the podcast"], [6.9, "TEDxMcGill"], [7.9, "On the podcast"], [9, "TEDxMcGill"], [10.3, "On the podcast"], [11.4, "TEDxMcGill"], [12.4, "On the podcast"], [13.5, "TEDxMcGill"], [14.7, "On the podcast"], [15.7, "TEDxMcGill"]];
    let last = "";
    reel.addEventListener("timeupdate", () => {
      const label = CLIPS.filter(([t]) => reel.currentTime >= t).pop()[1];
      if (label !== last) { last = label; reelCap.textContent = label; }
    });
  }

  /* ---------- "How it works" links open the guarantee answer ---------- */
  document.addEventListener("click", (e) => { if (e.target.closest('a[href="#faq-guarantee"]')) { const d = $("#faq-guarantee"); if (d) d.open = true; } });

  /* ---------- Founding seats: shows real availability from config.js ---------- */
  const SEATS = (CFG.tiers || {}).seatsLeft, seatEl = $("#seats");
  if ($("#heroSeats") && typeof SEATS === "number") $("#heroSeats").textContent = SEATS > 0 ? `TRANSFORM founding cohort · ${7 - SEATS} of 7 seats taken` : "TRANSFORM founding cohort · full";
  if (seatEl && typeof SEATS === "number" && SEATS < 7) {
    const TAKEN = 7 - SEATS;
    seatEl.querySelectorAll(".sm-dots i").forEach((d, n) => d.classList.toggle("taken", n < TAKEN));
    seatEl.querySelector(".sm-n").textContent = SEATS > 0 ? `${TAKEN} of 7 seats taken` : "Founding cohort full";
  }

  /* ---------- Testimonials: only real ones from config.js ---------- */
  // card: photo (or initials), first name, profession, topic tag, quote
  const tCard = (t, example) => `<figure class="quote t6${example ? " example" : ""}" data-topic="${esc(t.topic || "")}">${t.topic ? `<span class="t6-topic">${esc(t.topic)}</span>` : ""}
      <div class="t6-head">${t.photo ? `<img class="t6-av" src="${esc(t.photo)}" alt="" width="48" height="48">` : `<span class="t6-av t6-ini" aria-hidden="true">${esc((t.name || "").replace(/[^A-Za-z]/g, "").slice(0, 2))}</span>`}<figcaption><b>${esc(t.name)}</b><span>${esc(t.role || "")}${t.client === false ? " · worked with Karim" : ""}</span></figcaption></div>
      <blockquote>“${esc(t.quote)}”</blockquote>${example ? `<p class="t6-note mono">Example layout · replace with a real client's words</p>` : ""}
    </figure>`;
  if ((CFG.testimonials || []).length && $("#testimonials")) {
    $("#testimonials").hidden = false;
    // ad visitors see client quotes only
    const adKey = ((CFG.headlines || [])[variant - 1] || {}).key, isAd = !!adKey && adKey !== "solo"; // solo visitors keep the founder-colleague quotes as business proof
    $("#quotes").innerHTML = CFG.testimonials.filter((t) => !(isAd && t.client === false)).map((t) => tCard(t, false)).join("");
  }

  /* ---------- The 7D map: tap a dimension, it rotates to the top with full detail ---------- */
  (function wheel() {
    const svg = $("#wheelSvg"), box = $("#wheelList");
    if (!svg || !box) return;
    // [name, client-facing inquiry (doc 03), [[subject, what we look at]], measured with, evidence base]
    const W = [
      ["Physical", "How is your physical health affecting your goals?", [["Sleep", "Duration, quality, timing and daytime energy"], ["Exercise", "Movement vs the Canadian 24-Hour Movement Guidelines"], ["Nutrition", "Eating patterns and diet quality"], ["Energy", "When you have it, and what drains it"], ["Recreational substances", "Alcohol, cannabis, nicotine and caffeine"]], "Pittsburgh Sleep Quality Index (PSQI)", "Lifestyle medicine · sleep science"],
      ["Mental", "How are your emotions and coping patterns affecting your choices?", [["Stress", "Perceived stress"], ["Worry", "What keeps your mind busy"], ["Mood and motivation", "How you feel day to day"], ["Attention and focus", "Concentration and distractibility"], ["Resilience", "How you recover from setbacks"], ["Emotional regulation", "How you respond under pressure"], ["Confidence", "How you see yourself"], ["What's shaped you", "What still shapes how you react"]], "Perceived Stress Scale (PSS-10) · WHO-5 Well-Being Index", "Health psychology · positive psychology"],
      ["Social", "Are your relationships and social environments supporting your life goals?", [["Partner and dating", "What you want and what's in the way"], ["How you connect", "How you connect and react in relationships"], ["Friendships", "Depth and frequency of connection"], ["Feeling connected", "How connected you actually feel"], ["Family", "Dynamics and expectations"], ["Community and belonging", "Where you belong"], ["Social environments", "Whether you're in the right rooms"], ["Boundaries", "How you show up with people"]], "UCLA Loneliness Scale", "Social epidemiology · relationship science"],
      ["Vocational", "Is your work or career aligned with the direction you want to take?", [["Job satisfaction", "Role fit and engagement"], ["Burnout", "Exhaustion and detachment"], ["Workload and hours", "Hours, workload and recovery"], ["Career direction", "Where you want to go next"], ["Strengths", "What you do best"], ["Work-life boundaries", "Where work ends"], ["Leadership and visibility", "Influence and who knows your work"], ["Transitions", "Changing roles or building a business"]], "Copenhagen Burnout Inventory", "Organizational psychology · career development"],
      ["Financial", "Do your financial circumstances enable or constrain your choices?", [["Income and stability", "How secure your income is"], ["Spending and budget", "Where your money goes"], ["Debt", "What you owe, and what locks you in"], ["Savings and runway", "How long you could go without income"], ["Financial stress", "How money affects your mood and choices"], ["Financial literacy", "How well you manage it"], ["Investing and retirement", "Whether your future is funded"], ["Money goals", "What your money is for"]], "CFPB Financial Well-Being Scale", "Financial planning · behavioural economics"],
      ["Intellectual", "What do you need to learn or master to make progress?", [["Knowledge gaps", "What your goal requires that you don't know yet"], ["Skills", "What you can train"], ["Learning habits", "How and when you learn"], ["Focus and deep work", "Attention you can sustain"], ["Curiosity and creativity", "What you explore and make"], ["Reading", "Books and research worth your time"], ["Languages", "If your goal needs them"], ["Credentials and education", "Degrees, programs and certifications"]], "Structured skills-gap interview", "Educational psychology · cognitive science"],
      ["Spiritual", "What values, beliefs and sense of meaning guide your decisions?", [["Purpose", "What you're working toward"], ["Values", "What you won't compromise"], ["Meaning", "What makes it worth it"], ["Identity", "Who you are beyond your role"], ["Faith and practice", "If it's part of your life"], ["Gratitude and reflection", "Practices that ground you"], ["Moral compass", "How you decide what's right"], ["Legacy", "What you want to leave behind"]], "Meaning in Life Questionnaire", "Positive psychology"],
    ];
    // one line icon per item in the pop-up
    const IC = {
      moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", bolt: "M13 2L4 14h7l-1 8 9-12h-7z", act: "M22 12h-4l-3 9L9 3l-3 9H2",
      food: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-2 2-3 5-3 8h3v10", heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
      clip: "M9 3h6v3H9zM6 5H5v16h14V5h-1M9 12h6M9 16h6", gauge: "M12 14l4-4M4.9 19a9 9 0 1 1 14.2 0", wave: "M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0",
      cloud: "M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19 11a4 4 0 0 1-1.5 8z", shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z",
      sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6", users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
      home: "M3 10l9-7 9 7v11H3zM9 21v-6h6v6", frame: "M5 5h14v14H5zM9 9h6v6H9z", globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
      pin: "M12 22s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", star: "M12 2l3 7 7 .6-5.3 4.7 1.6 7.1L12 17.8 5.7 21.4l1.6-7.1L2 9.6 9 9z",
      target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
      battery: "M2 7h16v10H2zM22 11v2M5 10v4", flag: "M4 22V4M4 4h13l-2 4 2 4H4", shuffle: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5",
      lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4", card: "M2 5h20v14H2zM2 10h20", bag: "M6 2l-3 4v14h18V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0",
      book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5", glass: "M6 2h12M6 22h12M7 2c0 6 10 6 10 10S7 16 7 22M17 2c0 6-10 6-10 10s10 4 10 10",
      puzzle: "M9 3h6v4a2 2 0 1 0 4 0h2v14H3V7h2a2 2 0 1 0 4 0z", tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
      chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.2 13.9L7 23l5-3 5 3-1.2-9.1",
      cap: "M22 10L12 5 2 10l10 5zM6 12v5c3 2 9 2 12 0v-5", compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z",
      user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", gem: "M6 3h12l4 6-10 12L2 9zM2 9h20",
      sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4", spark: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z",
    };
    IC.pill = "M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7zM8.5 8.5l7 7"; IC.wine = "M8 22h8M12 15v7M6 2h12l-1 7a5 5 0 0 1-10 0z";
    IC.link = "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"; IC.chart = "M3 3v18h18M7 14l4-4 4 4 5-6";
    const ICON_FOR2 = { "Medical history": "clip", Medications: "pill", Exercise: "act", Nutrition: "food", "Recreational substances": "wine", "Vitals and labs": "heart",
      "Attention and focus": "target", Worry: "wave", "Mood and motivation": "cloud", Resilience: "shield", "Confidence": "user", "What's shaped you": "clock", "Partner and dating": "heart", "How you connect": "link", "Feeling connected": "user",
      "Community and belonging": "globe", "Social environments": "pin", "Job satisfaction": "star", "Workload and hours": "clock", "Career direction": "compass", Strengths: "bolt",
      "Work-life boundaries": "frame", "Leadership and visibility": "flag", "Income and stability": "lock", "Spending and budget": "bag", "Savings and runway": "glass", "Financial stress": "gauge",
      "Financial literacy": "book", "Investing and retirement": "chart", "Money goals": "target", "Learning habits": "cap", "Focus and deep work": "target", "Curiosity and creativity": "spark",
      "Credentials and education": "award", "Faith and practice": "sun", "Gratitude and reflection": "heart", Legacy: "star" };
    const ICON_FOR = { Sleep: "moon", Energy: "bolt", Activity: "act", Routines: "food", Symptoms: "heart", "Known conditions": "clip", Stress: "gauge", Anxiety: "wave", Mood: "cloud", Coping: "shield", "Emotional regulation": "sliders", Support: "users",
      "Partner goals": "heart", Friendships: "users", Family: "home", Boundaries: "frame", Community: "globe", "Social settings": "pin", Satisfaction: "star", Ambitions: "target", Time: "clock", Burnout: "battery", Leadership: "flag", Transitions: "shuffle",
      Stability: "lock", Debt: "card", Spending: "bag", Literacy: "book", Runway: "glass", Goals: "target", "Knowledge gaps": "puzzle", Skills: "tool", Reading: "book", Languages: "chat", Certifications: "award", Education: "cap",
      Purpose: "compass", Identity: "user", Values: "gem", Faith: "sun", "Moral compass": "compass", Meaning: "spark" };
    const icon = (l) => `<i class="wc-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${IC[ICON_FOR2[l] || ICON_FOR[l]] || IC.spark}"/></svg></i>`;
    // the 7 areas on one wheel around your goal; light flows from every area into the goal
    const C = 260, R = 200, N = 7, step = (2 * Math.PI) / N;
    // flat 2D wheel: the 7 areas on a circle, your goal at its centre
    const TILT = 1, GX = C, GY = C;
    let rot = 0, sel = null, anim = null, touched = false, paused = false;
    // the selected area sits at the top; every area is drawn at the same size and opacity
    const pos = (k) => { const t = -Math.PI / 2 + k * step + rot; return [C + R * Math.cos(t), C + R * Math.sin(t), t, 0.8]; };
    function draw() {
      const P = W.map((_, k) => pos(k));
      const ry = R * TILT;
      // technical look: perspective grid floor (radar), precise axis up to the goal
      let h = `<g class="k-gridg">`;
      [0.33, 0.66, 1, 1.18].forEach((f) => (h += `<ellipse class="k-grid${f === 1 ? " main" : ""}" cx="${C}" cy="${C}" rx="${R * f}" ry="${ry * f}"/>`));
      for (let i = 0; i < 24; i++) { const a = (i / 24) * 2 * Math.PI; h += `<line class="k-grid" x1="${C}" y1="${C}" x2="${C + R * 1.18 * Math.cos(a)}" y2="${C + ry * 1.18 * Math.sin(a)}"/>`; }
      h += `</g><defs><marker id="kArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="k-arrow"/></marker><marker id="kArrowOn" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="k-arrow on"/></marker></defs>`;
      // ring links, faded by depth
      P.forEach(([x, y, , d], k) => [1, 2, 3].forEach((dd) => { const m = (k + dd) % N, [x2, y2, , d2] = P[m], on = sel === "core" || k === sel || m === sel; h += `<line class="k-link${on ? " on" : ""}" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="opacity:${(0.25 + 0.75 * (d + d2) / 2).toFixed(2)}"/>`; }));
      const order = P.map((p, k) => [p[3], k]).sort((a, b) => a[0] - b[0]).map(([, k]) => k);
      const node = (k) => {
        const [x, y, t, d] = P[k], on = sel === "core" || k === sel, s = 0.62 + 0.62 * d, op = (0.38 + 0.62 * d).toFixed(2);
        const lx = C + (R + 34) * Math.cos(t), ly = C + (ry + 26) * Math.sin(t) + 5, anc = Math.abs(lx - C) < 14 ? "middle" : lx > C ? "start" : "end";
        const dx = GX - x, dy = GY - y, L = Math.hypot(dx, dy) || 1, ex = GX - dx / L * 24, ey = GY - dy / L * 24, sx = x + dx / L * 12 * s, sy = y + dy / L * 12 * s;
        return `<line class="k-spoke${on ? " on" : ""}" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" marker-end="url(#${on ? "kArrowOn" : "kArrow"})" style="opacity:${op}"/><line class="k-flow${on ? " on" : ""}" x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" style="opacity:${op};animation-delay:${(-k * 0.37).toFixed(2)}s"/>`
          + `<g class="seg-g${on ? " on" : ""}" data-i="${k}" tabindex="0" role="button" aria-label="${W[k][0]} health" style="opacity:${op}"><circle class="k-hit" cx="${x}" cy="${y}" r="${(30 * s).toFixed(1)}"/><circle class="k-halo" cx="${x}" cy="${y}" r="${(15 * s).toFixed(1)}"/><circle class="k-node" cx="${x}" cy="${y}" r="${(5.5 * s).toFixed(1)}"/><text class="k-lab" x="${lx}" y="${ly}" text-anchor="${anc}" style="font-size:${(10.5 + 3.5 * d).toFixed(1)}px"><tspan class="k-idx">${String(k + 1).padStart(2, "0")} </tspan>${W[k][0].toUpperCase()}</text></g>`;
      };
      const back = order.filter((k) => P[k][3] < 0.5), front = order.filter((k) => P[k][3] >= 0.5);
      back.forEach((k) => (h += node(k)));
      h += `<g class="core-g goal" tabindex="0" role="button" aria-label="Your goal"><circle class="k-hit" cx="${GX}" cy="${GY}" r="44"/><circle class="k-glow" cx="${GX}" cy="${GY}" r="19"/><g class="k-coin" transform="translate(${GX - 13} ${GY - 13}) scale(.65)"><circle class="k-coin-body" cx="20" cy="20" r="19"/><path class="k-coin-chev" d="M13 8.8L28.6 20L13 31.2"/></g><rect class="k-goal-bg" x="${GX - 46}" y="${GY - 50}" width="92" height="20" rx="4"/><text class="k-you goal" x="${GX}" y="${GY - 36}">YOUR GOAL</text></g>`;
      front.forEach((k) => (h += node(k)));
      svg.innerHTML = h;
      svg.classList.toggle("aligned", sel === "core");
    }
    function panel() {
      box.classList.toggle("show", sel !== null);
      if (sel === null) { box.innerHTML = ""; return; }
      if (sel === "core") { box.innerHTML = `<p class="wc-n mono">Alignment</p><p class="wc-why">When your physical, mental, social, vocational, financial, intellectual and spiritual health are all tuned toward your main goal.</p><p class="wc-items">That's what your transformation plan is built to reach.</p>`; return; }
      const [name, q, items, meas, ev] = W[sel];
      box.innerHTML = `<p class="wc-n mono">${sel + 1} / 7 · ${name} health</p><p class="wc-why">${q}</p><ul class="wc-list">${items.map(([l, d]) => `<li>${icon(l)}<b>${l}</b><span>${d}</span></li>`).join("")}</ul>`;
    }
    function choose(k, user, slow) {
      if (user) { touched = true; clearInterval(timer); if (navigator.vibrate) navigator.vibrate(12); }
      sel = k; panel();
      if (k === "core") { draw(); return; }
      // shortest rotation that brings dimension k to the top
      let target = -k * step, d = target - rot;
      d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
      if (slow && d > 0) d -= 2 * Math.PI; // the tour always turns counterclockwise
      const from = rot, t0 = performance.now(), dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : slow ? 1600 : 520;
      cancelAnimationFrame(anim);
      const tick = (now) => { const p = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - p, 3); rot = from + d * e; draw(); if (p < 1) anim = requestAnimationFrame(tick); };
      anim = requestAnimationFrame(tick);
    }
    svg.addEventListener("click", (e) => { if (moved) { moved = false; return; } const g = e.target.closest(".seg-g"), c = e.target.closest(".core-g"); if (g) choose(+g.dataset.i, true); else if (c) choose("core", true); });
    svg.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.target.closest(".seg-g, .core-g")?.dispatchEvent(new MouseEvent("click", { bubbles: true })); } if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const n = sel === "core" || sel === null ? 0 : (sel + (e.key === "ArrowRight" ? 1 : N - 1)) % N; choose(n, true); } });
    const timer = 0;
    draw(); panel();
    let last = 0, visible = true;
    svg.addEventListener("pointerenter", () => (paused = true));
    svg.addEventListener("pointerleave", () => (paused = false));
    svg.addEventListener("pointerdown", () => (paused = true));
    // the tour swaps the text every few seconds: hold the box at its tallest so the page below never jumps
    let lockedW = 0;
    const lock = () => {
      if (!box.offsetParent || box.offsetWidth === lockedW) return;
      const keep = sel; let m = 0;
      box.style.minHeight = "";
      [...W.keys(), "core"].forEach((k) => { sel = k; panel(); m = Math.max(m, box.offsetHeight); });
      sel = keep; panel(); box.style.minHeight = m + "px"; lockedW = box.offsetWidth;
    };
    if ("ResizeObserver" in window) new ResizeObserver(() => setTimeout(lock)).observe(svg);
    addEventListener("resize", lock);
    document.addEventListener("click", (e) => { if (e.target.closest('[data-expand="cmpWheel"]')) setTimeout(lock); });
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(svg);
    // the tour: Physical first, then the next area every few seconds, until someone takes over
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // ad variants open on the visitor's own area: Social for partner, Financial for going solo, Vocational for clarity
    choose({ partner: 2, solo: 4, clarity: 3 }[new URLSearchParams(location.search).get("h")] || 0, false);
    const tour = setInterval(() => { if (touched || new URLSearchParams(location.search).get("h")) return clearInterval(tour); if (!paused && visible && !reduce) choose(((sel === null || sel === "core" ? -1 : sel) + 1) % N, false, true); }, 4200);
    // hold and drag to turn the wheel; whichever area reaches the top is the one shown
    let drag = null, moved = false;
    const front = () => { let b = 0, best = -2; W.forEach((_, k) => { const c = Math.cos(k * step + rot); if (c > best) { best = c; b = k; } }); return b; };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      // a vertical swipe on a phone is the page scrolling, not a turn of the wheel
      if (!moved && e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx)) { onUp(true); return; }
      moved = true; touched = true;
      const ang = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx);
      rot = drag.rot + (ang - drag.a0);
      const f = front();
      if (f !== sel) { sel = f; panel(); if (navigator.vibrate) navigator.vibrate(6); }
      draw();
    };
    const onUp = (e) => {
      if (!drag) return;
      const start = drag.rot, cancelled = e === true || (e && e.type === "pointercancel");
      drag = null; svg.classList.remove("grabbing");
      removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp); removeEventListener("pointercancel", onUp);
      if (cancelled && !moved) return;
      if (cancelled) { rot = start; draw(); return; } // the browser took over to scroll: put the wheel back as it was
      if (moved) choose(front(), false);
    };
    svg.addEventListener("pointerdown", (e) => {
      const b = svg.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      drag = { x: e.clientX, y: e.clientY, rot, cx, cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx) }; moved = false; cancelAnimationFrame(anim); svg.classList.add("grabbing");
      addEventListener("pointermove", onMove); addEventListener("pointerup", onUp); addEventListener("pointercancel", onUp);
    });
  })();

  /* ---------- Nav state + sticky CTA ---------- */
  const nav = $("#nav"), sticky = $("#stickyCta"), offer = $("#offer") || $("#pricing");
  let offerVisible = false;
  if ("IntersectionObserver" in window && offer) {
    new IntersectionObserver(([e]) => { offerVisible = e.isIntersecting; onScroll(); }, { threshold: 0.1 }).observe(offer);
    const once = new IntersectionObserver(([e]) => { if (e.isIntersecting) { track("offer_view"); once.disconnect(); } }, { threshold: 0.3 });
    once.observe(offer);
  }
  function onScroll() {
    nav.classList.toggle("scrolled", scrollY > 8);
    sticky.classList.toggle("show", scrollY > 560 && !offerVisible && !$("dialog[open]"));
    document.body.classList.toggle("sticky-on", sticky.classList.contains("show"));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Dialogs ---------- */
  function openDialog(id) {
    const d = $("#dlg-" + id);
    $$("dialog[open]").forEach((x) => x !== d && x.close());
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    sticky.classList.remove("show");
  }
  $$("dialog").forEach((d) => {
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
    d.addEventListener("close", onScroll);
  });
  const LEGAL = {
    privacy: ["Privacy", `<p>${SE_HTML} collects only what's needed to coach you, and only Karim sees it.</p><p><b>What we collect.</b> Your name, email and phone; what you write when you book; your intake answers, session notes, 360° Life Report. Payments are handled by our payment provider; we never see your card.</p><p><b>How it's used.</b> Only to deliver your coaching. It is never sold, and never shared with your employer, insurer or anyone else.</p><p><b>Not a medical record.</b> ${SE_HTML} is coaching, not healthcare, so no health record is created.</p><p><b>AI.</b> We never put what you share into an AI tool. GROW's custom AI coach is set up only if you ask for it.</p><p><b>Your rights.</b> Ask for a copy of your information at any time, and when you finish, ask for it to be deleted; we'll delete it.</p>`],
    terms: ["Terms", `<p><b>What you buy.</b> The 72-Hour Executive Life Plan: a 90-minute assessment with Karim Atassi, MD by video, a written 360° Life Report within 72 hours, introductions and initial appointments with providers matched to your needs. $699 CAD plus HST. Provider fees are separate, paid directly to each provider.</p><p><b>Scope.</b> This engagement provides coaching, planning, and provider matching. It does not include medical diagnosis, treatment, or prescribing. Continue working with your healthcare providers for clinical care.</p><p><b>Questions.</b> Every client starts with a free 15-minute call.</p>`],
  };

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]");
    if (!t) return;
    e.preventDefault();
    const kind = t.dataset.open, loc = t.dataset.loc;
    if (kind === "checkout") {
      track("checkout_start", { location: loc });
      const live = !!CFG.resetCheckoutUrl;
      $("#ck-live").hidden = !live; $("#ck-off").hidden = live;
      if (live) $("#ck-go").href = withUtm(CFG.resetCheckoutUrl);
      openDialog("checkout");
    } else if (kind === "apply") {
      const tier = t.dataset.tier, T = (CFG.tiers || {})[tier] || {};
      const copy = {
        grow: ["Weekly support", "GROW", "Everything in the $699 program, plus 4 weekly 1-hour sessions with Karim over 30 days and an optional custom AI coach, with accountability standards to keep you on track toward your goal. Tell us your goal and we'll confirm fit."],
        platinum: ["Limited to 7 people", "TRANSFORM", "A seat among the 7 founding members: everything in GROW, plus a social concierge, a personalized Google Map of the restaurants, cafés and venues that fit your goal, a 30-day event calendar, members' dinners with Karim, the NYE Resolution Retreat and a direct line to Karim. $7,000. Tell us your goal and we'll confirm fit."],
      }[tier];
      $("#ap-kicker").textContent = copy[0]; $("#ap-title").textContent = copy[1]; $("#ap-body").textContent = copy[2];
      const live = !!T.applyUrl;
      $("#ap-live").hidden = !live; $("#ap-off").hidden = live;
      if (live) $("#ap-go").href = withUtm(T.applyUrl);
      track("apply_open", { tier, location: loc });
      openDialog("apply");
    } else if (kind === "infocall") {
      track("info_call_open", { location: loc });
      openDialog("infocall");
      if (window.SE7EN_BOOK) window.SE7EN_BOOK.open("intro");
    } else if (kind === "dissect") {
      openDialog("dissect");
    } else if (kind === "trad" || kind === "wheel") {
      track("compare_open", { which: kind });
      openDialog(kind);
    } else if (kind === "legal") {
      const [title, body] = LEGAL[t.dataset.doc];
      $("#lg-title").textContent = title; $("#lg-body").innerHTML = body;
      openDialog("legal");
    } else if (kind === "checkin") {
      track("quiz_start", { location: loc });
      Quiz.start();
      openDialog("checkin");
    }
  });
  $("#ck-go").addEventListener("click", () => track("checkout_redirect"));

  /* ---------- Life Check-In (06 §7) — answers live in memory only ---------- */
  const DIM_OPTS = DIMS.map((d, i) => ({ v: d.name, k: String(i + 1), label: d.name }));
  // Alignment quiz: each "link" answer connects two dimensions, so the result shows how they affect each other
  const DIM_ORDER = ["Physical", "Mental", "Social", "Vocational", "Financial", "Intellectual", "Spiritual"];
  const LINKS = {
    "When work gets heavy, my sleep and energy drop.": ["Vocational", "Physical"],
    "Money stress spills into my relationships.": ["Financial", "Social"],
    "Low energy keeps me from seeing people.": ["Physical", "Social"],
    "Anxiety holds me back at work.": ["Mental", "Vocational"],
    "I'm not sure my career fits my values.": ["Vocational", "Spiritual"],
    "I'm missing skills I need for my next step.": ["Intellectual", "Vocational"],
    "I know what to do, but I can't stay consistent.": ["Mental", "Physical"],
    "I stay in a role for the money, not the meaning.": ["Financial", "Spiritual"],
  };
  // what each answer actually means, so the quiz gives real value before anyone books
  const LINK_INSIGHT = {
    "When work gets heavy, my sleep and energy drop.": "Your work is borrowing from your recovery. Less sleep lowers mood, patience and willpower, so every other area, including your goal, gets harder to move.",
    "Money stress spills into my relationships.": "Money stress rarely stays in your bank account. It shows up as tension, avoidance or overwork, and quietly decides who you have time and energy for.",
    "Low energy keeps me from seeing people.": "When your energy drops, your world shrinks. Fewer plans means fewer chances: for a partner, for opportunities, for support.",
    "Anxiety holds me back at work.": "Anxiety makes you play it safe. You skip the conversation, the pitch or the second date, and it looks like a lack of options when it's really a lack of exposure.",
    "I'm not sure my career fits my values.": "When your work and your values don't match, success stops feeling like progress. That gap is often what “stuck” really means.",
    "I'm missing skills I need for my next step.": "A skills gap makes the next step feel bigger than it is. It's usually one or two specific skills, not a whole new you.",
    "I know what to do, but I can't stay consistent.": "Inconsistency is rarely a willpower problem. It's usually a missing structure: a plan, a weekly check-in and someone holding you to it.",
    "I stay in a role for the money, not the meaning.": "Golden handcuffs: your finances are making your career decisions for you. Building runway is often the first real step to change.",
  };
  const GOAL_INSIGHT = {
    "More energy at work": "Low energy at work is rarely just a sleep problem. It's your calendar (Vocational), what you eat and drink on meeting days (Physical) and the stress you carry home (Mental).",
    "Sleep through the night": "Broken sleep usually starts during the day: no protected hours (Vocational), decisions you replay at night (Mental) and late caffeine or screens (Physical).",
    "Manage stress and burnout": "Burnout builds where work has no edges (Vocational), recovery gets cut (Physical, Social) and you lose touch with why you do it (Spiritual).",
    "Lose weight on a busy schedule": "Weight goals break on travel weeks and late client dinners (Vocational), stress eating (Mental) and food-centred social plans (Social), not on knowledge.",
    "Train for a goal, like a marathon": "Training plans fail when they ignore your calendar (Vocational), your recovery (Physical) and the people who can train with you (Social).",
    "Feel less alone at the top": "Isolation at the top grows when work fills every evening (Vocational), friends drift (Social) and no one outside your company knows what you carry (Mental).",
    "Something else": "Whatever your goal is, it's being pulled on by more than one area of your life.",
  };
  const AREA_INSIGHT = {
    Physical: "Low sleep and energy shrink what every other area can give you.",
    Mental: "Stress and anxiety narrow the risks you're willing to take.",
    Social: "The people around you decide which doors open.",
    Vocational: "Your work sets your hours, your income and your energy.",
    Financial: "Money decides how many options you actually have.",
    Intellectual: "A missing skill quietly caps your next step.",
    Spiritual: "Without clear values, success stops feeling like progress.",
  };
  const QUESTIONS = [
    { id: "goal", title: "What are your main life goals right now?", hint: "Pick all that apply.", type: "many",
      opts: ["More energy at work", "Sleep through the night", "Manage stress and burnout", "Lose weight on a busy schedule", "Train for a goal, like a marathon", "Feel less alone at the top", "Something else"] },
    { id: "off", title: "Which areas of your life feel off right now?", hint: "Pick all that apply.", type: "many",
      opts: ["Physical: sleep, energy, body", "Mental: stress, mood, anxiety", "Social: partner, friends, family", "Vocational: work, career, direction", "Financial: money, debt, runway", "Intellectual: skills, learning, focus", "Spiritual: purpose, values, meaning"] },
    { id: "links", title: "Which of these sound like you?", hint: "Pick all that apply. Notice how one area pulls on another.", type: "many", opts: Object.keys(LINKS) },
    { id: "tried", title: "What have you already tried?", hint: "Pick all that apply, or skip.", type: "many", optional: true,
      opts: ["A doctor or specialist", "Therapy or counselling", "A coach", "Books, podcasts or courses", "Apps or trackers", "Not much yet"] },
    { id: "next", title: "How much support do you want?", hint: "Pick all that apply.", type: "many",
      opts: ["Clarity and a plan. I'll take it from there.", "Weekly sessions to help me carry it out.", "High-touch support, start to finish.", "I'm not sure yet."] },
  ];
  const PROMPTS = {
    Physical: "For one week, note when your energy is highest and lowest — and what came just before.",
    Mental: "Write down the one thought pattern that stalls you most this week. Just notice it.",
    Social: "Name one person who leaves you better than before, and book time with them in the next 7 days.",
    Vocational: "Write one sentence for where you want your work to be in a year — then one thing that moves it 1%.",
    Financial: "Find the exact value of the one number that matters most to your goal (runway, savings or debt).",
    Intellectual: "Pick the one skill your goal depends on most and block one hour for it this week.",
    Spiritual: "Write three values you'd want your next decision to reflect, and check your goal against them.",
  };
  const NEXT_COPY = {
    "Clarity on what matters": "That's exactly what the program does: all 7 dimensions mapped, and your top 3 priorities named.",
    "A concrete action plan": "The program ends with a transformation plan built around your top 3 priorities.",
    "Weekly accountability": "The program gives you a transformation plan with clear actions — and a results review to lock it in.",
    "The right professional support": "The program includes a specialist shortlist: which experts are worth seeing for your goal.",
  };

  const Quiz = (() => {
    let i = 0, ans = {};
    const root = () => $("#q-root");
    function start() { i = 0; ans = {}; render(); }
    function render() {
      const q = QUESTIONS[i];
      const opts = q.dims ? DIM_OPTS : q.opts.map((x, n) => ({ v: x, k: String.fromCharCode(65 + n), label: x }));
      const cur = ans[q.id] || (q.type === "many" ? [] : null);
      const sel = (v) => (q.type === "many" ? cur.includes(v) : cur === v);
      const valid = q.optional || (q.type === "many" ? cur.length > 0 : !!cur);
      root().innerHTML = `
        <p class="q-step mono">Alignment quiz · ${i + 1} of ${QUESTIONS.length}</p>
        <div class="q-progress" aria-hidden="true"><span style="width:${((i + 1) / QUESTIONS.length) * 100}%"></span></div>
        <h2 class="q-title dlg-title" id="q-title">${q.title}</h2>
        ${q.hint ? `<p class="q-hint">${q.hint}</p>` : ""}
        <div class="opts ${opts.length > 5 ? "two" : ""}" role="group" aria-labelledby="q-title">
          ${opts.map((x) => `<button type="button" class="opt" data-v="${x.v}" aria-pressed="${sel(x.v)}"><span class="k">${x.k}</span>${x.label}</button>`).join("")}
        </div>
        <div class="q-nav">
          <button type="button" class="btn btn-ghost btn-sm" data-q="back" ${i === 0 ? "hidden" : ""}>Back</button><span></span>
          <button type="button" class="btn btn-sm" data-q="next" ${valid ? "" : "disabled"}>${i === QUESTIONS.length - 1 ? "See my result" : q.optional && !(cur && cur.length) ? "Skip" : "Next"}</button>
        </div>
        <p class="q-privacy">Private — your answers stay in your browser unless you choose to email yourself the result.</p>`;
      root().onclick = onClick;
    }
    function onClick(e) {
      const q = QUESTIONS[i], opt = e.target.closest(".opt");
      if (opt) {
        const v = opt.dataset.v;
        if (q.type === "many") {
          const arr = ans[q.id] || [];
          ans[q.id] = arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v);
          render();
        } else {
          ans[q.id] = v; render();
          setTimeout(() => { if (QUESTIONS[i] === q) go(1); }, 220);
        }
        return;
      }
      const n = e.target.closest("[data-q]");
      if (n && !n.disabled) go(n.dataset.q === "next" ? 1 : -1);
    }
    function go(step) {
      i = Math.max(0, i + step);
      if (i >= QUESTIONS.length) return emailStep();
      render();
      root().querySelector(".opt")?.focus({ preventScroll: true });
    }
    const list = (a) => (a.length <= 1 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);
    // Last step: email, then the results appear on screen
    function emailStep() {
      root().innerHTML = `
        <p class="q-step mono">Alignment quiz · last step</p>
        <div class="q-progress" aria-hidden="true"><span style="width:100%"></span></div>
        <h2 class="q-title dlg-title" id="q-title">Your results are ready.</h2>
        <p class="q-hint">Want a copy by email? Add it below. Or go straight to your results.</p>
        <form class="email-form" id="ci-email" novalidate>
          <label class="ef-l" for="ci-name">First name <i>optional</i></label>
          <input type="text" id="ci-name" name="name" autocomplete="given-name">
          <label class="ef-l" for="ci-mail">Email <i>optional</i></label>
          <input type="email" id="ci-mail" name="email" autocomplete="email">
          <label><input type="checkbox" name="marketing"><span>Also send me occasional ${SE_HTML} updates.</span></label>
          <button class="btn btn-primary" type="submit">Show my results</button>
          <p class="q-privacy" id="ci-status" role="status">Your answers stay private. We never share your email.</p>
        </form>
        <div class="q-nav"><button type="button" class="btn btn-ghost btn-sm" data-q="back">Back</button></div>`;
      root().onclick = (e) => { if (e.target.closest('[data-q="back"]')) { i = QUESTIONS.length - 1; render(); } };
      const f = $("#ci-email");
      f.name.focus();
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        const mail = f.email.value.trim();
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { $("#ci-status").textContent = "That email doesn't look right. Fix it, or clear it to skip."; return; }
        f.querySelector("button[type=submit]").disabled = true;
        ans.email = mail; ans.name = f.name.value.trim();
        if (mail) track("quiz_email");
        if (mail && CFG.checkInEmailEndpoint) {
          try {
            await fetch(CFG.checkInEmailEndpoint, { method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: ans.name, email: ans.email, marketingConsent: f.marketing.checked, consentAt: new Date().toISOString(), goal: ans.goal, off: ans.off, links: ans.links, next: ans.next, source: utm }) });
          } catch (_) { /* results still show if the form service is down */ }
        }
        result();
      });
    }
    function result() {
      track("quiz_complete"); track("results_view");
      const off = (ans.off || []).map((o) => o.split(":")[0]);
      const links = (ans.links || []).map((l) => LINKS[l]).filter(Boolean);
      const hit = new Set(off.concat(...links));
      // draw their own 7D map: dimensions they flagged lit, their connections drawn
      const C = 110, R = 82, P = DIM_ORDER.map((_, k) => { const t = -Math.PI / 2 + (k * 2 * Math.PI) / 7; return [C + R * Math.cos(t), C + R * Math.sin(t), t]; });
      const at = (n) => P[DIM_ORDER.indexOf(n)];
      let svg = `<circle cx="${C}" cy="${C}" r="${R}" class="qa-orbit"/>`;
      links.forEach(([x, y]) => { const [x1, y1] = at(x), [x2, y2] = at(y); svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="qa-link"/>`; });
      P.forEach(([x, y, t], k) => { const n = DIM_ORDER[k], lx = C + (R + 16) * Math.cos(t), ly = C + (R + 16) * Math.sin(t) + 3, anc = Math.abs(lx - C) < 8 ? "middle" : lx > C ? "start" : "end"; svg += `<circle cx="${x}" cy="${y}" r="6" class="qa-node${hit.has(n) ? " on" : ""}"/><text x="${lx}" y="${ly}" text-anchor="${anc}" class="qa-lab">${n}</text>`; });
      svg += `<circle cx="${C}" cy="${C}" r="7" class="qa-core"/>`;
      const pairs = links.map(([x, y]) => `<li><b>${x}</b> ↔ <b>${y}</b></li>`).join("");
      const goals = [].concat(ans.goal || []);
      const linkRows = (ans.links || []).filter((l) => LINK_INSIGHT[l]).map((l) => `<li><span class="mono">${LINKS[l][0]} → ${LINKS[l][1]}</span><b>“${esc(l)}”</b><p>${LINK_INSIGHT[l]}</p></li>`).join("");
      const areaRows = off.map((a) => `<li><b>${a}</b><span>${AREA_INSIGHT[a] || ""}</span></li>`).join("");
      root().innerHTML = `
        <p class="q-step mono">Your alignment snapshot</p>
        <h2 class="dlg-title" id="q-title">${ans.name ? esc(ans.name) + ", " : ""}${hit.size > 1 ? `${hit.size} of your 7 dimensions are pulling on your goal.` : "Your dimensions are more connected than they look."}</h2>
        <div class="qa-wrap"><svg viewBox="-20 -10 260 240" class="qa-map" aria-hidden="true">${svg}</svg>
          <div><p class="qa-goal"><span class="mono">${[].concat(ans.goal || []).length > 1 ? "Your goals" : "Your goal"}</span>${[].concat(ans.goal || []).join(" · ")}</p>${pairs ? `<p class="mono qa-k">Connections you noticed</p><ul class="qa-pairs">${pairs}</ul>` : ""}</div></div>
        <div class="result-block insight"><h3>What your answers suggest</h3>
          ${goals.map((g) => GOAL_INSIGHT[g] ? `<p class="qi-goal"><span class="mono">${esc(g)}</span>${GOAL_INSIGHT[g]}</p>` : "").join("")}
          ${linkRows ? `<ul class="qi-list">${linkRows}</ul>` : ""}
          ${areaRows ? `<p class="mono qa-k">The areas you flagged</p><ul class="qi-areas">${areaRows}</ul>` : ""}
          <p class="qi-next">These aren't separate problems. Each one is pulling on the others, and all of them are pulling on your goal. Your 7-in-1 Assessment measures each area properly, uncovers the ones you can't see yet, and builds one plan that moves them together.</p>
        </div>
        ${recommend(ans.next)}
        <p class="q-privacy">A reflection on your own answers, not an assessment or diagnosis.</p>
        <div class="cta-row"><button type="button" class="btn btn-ghost btn-sm" data-open="infocall" data-loc="quiz_result">Still unsure? Book a call</button></div>
`;
      root().onclick = (e) => { if (e.target.closest('[data-q="restart"]')) start(); };
    }
    function recommend(next) {
      // several picks: recommend the most supportive level chosen
      const picks = [].concat(next || []);
      const tier = picks.includes("High-touch support, start to finish.") ? "platinum" : picks.includes("Weekly sessions to help me carry it out.") ? "grow" : "reset";
      const R = {
        grow: ["GROW", "$2,499 · 30 days", "Everything in the $699 program, plus your custom GPT, 4 weekly 1-hour sessions with Karim over 30 days, and Accountability Standards.", `<button type="button" class="btn btn-primary" data-open="apply" data-tier="grow" data-loc="checkin_result">Go for GROW</button>`],
        platinum: ["TRANSFORM", "$7,000 · 7 founding seats", "Everything in GROW, plus a founding seat in our private members' club: social concierge, personalized Google Map and event calendar, members' dinners, the NYE Resolution Retreat and a direct line to Karim.", `<button type="button" class="btn btn-primary" data-open="apply" data-tier="platinum" data-loc="checkin_result">Apply for TRANSFORM</button>`],
        reset: ["The 72-Hour Executive Life Plan", `$${fmt(PRICE)} · once`, "A 90-minute Life Assessment, your 360° Life Report within 72 hours and introductions to matched providers.", `<button type="button" class="btn btn-primary" data-open="checkout" data-loc="checkin_result">Get started — $${fmt(PRICE)}</button>`],
      };
      const [name, price, what, btn] = R[tier];
      return `<div class="result-block rec"><h3>Recommended for you</h3><p class="rec-name mono">${name} <span>${price}</span></p><p>${what}</p><div class="cta-row">${btn}</div></div>`;
    }
    function emailForm() {
      return `<form class="email-form result-block" id="ci-email">
          <h3>Email me this result</h3>
          <input type="email" name="email" required placeholder="you@example.com" autocomplete="email" aria-label="Email address">
          <label><input type="checkbox" name="marketing"><span>Also send me occasional ${SE_HTML} updates (optional).</span></label>
          <button class="btn btn-ghost btn-sm" type="submit">Send</button>
          <p class="q-privacy" id="ci-status" role="status"></p></form>`;
    }
    async function submitEmail(e, review, prompt) {
      e.preventDefault();
      const f = e.target, status = $("#ci-status");
      status.textContent = "Sending…";
      try {
        const res = await fetch(CFG.checkInEmailEndpoint, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: f.email.value, marketingConsent: f.marketing.checked, consentAt: new Date().toISOString(), areas: review, prompt, source: utm }),
        });
        if (!res.ok) throw new Error(res.status);
        status.textContent = "Sent. Check your inbox.";
        f.querySelector("button").disabled = true;
      } catch (_) { status.textContent = "Not sent. Please try again."; }
    }
    return { start };
  })();

  /* ---------- Pathway picker: accessible tabs (all panels stay visible without JS) ---------- */
  // the testimonial that matches the goal a visitor opens moves to the front
  const QUOTE_FOR = [[], ["Career", "Building"], [], ["Friendships"], ["Love", "Friendships", "Dating"]];
  function leadQuote(n) {
    const box = $("#quotes"); if (!box) return;
    const figs = $$("figure[data-topic]", box);
    // the first topic leads, the next one follows it
    [...(QUOTE_FOR[n] || [])].reverse().forEach((t) => { const q = figs.find((f) => f.dataset.topic === t); if (q) box.prepend(q); });
    box.scrollLeft = 0;
  }
  $$("[data-pw]").forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap), panels = tabs.map((t) => $("#" + t.getAttribute("aria-controls")));
    const show = (k, focus) => {
      tabs.forEach((t, n) => { const on = n === k; t.setAttribute("aria-selected", on ? "true" : "false"); t.tabIndex = on ? 0 : -1; panels[n].hidden = !on; });
      if (focus) tabs[k].focus();
    };
    tabs.forEach((t, n) => {
      t.addEventListener("click", (e) => {
        show(n); track("pathway_tab", { tab: t.id }); leadQuote(n);
        // on a phone the answer opens below the fold: bring it up so the tap visibly does something
        const top = panels[n].getBoundingClientRect().top;
        if (e.isTrusted && top > innerHeight * 0.62) window.scrollTo({ top: top + scrollY - innerHeight * 0.3, behavior: "smooth" });
      });
      t.addEventListener("keydown", (e) => {
        const last = tabs.length - 1, k = { ArrowRight: n === last ? 0 : n + 1, ArrowLeft: n === 0 ? last : n - 1, Home: 0, End: last }[e.key];
        if (k === undefined) return;
        e.preventDefault(); show(k, true);
      });
    });
    // start closed; tapping the open goal again closes it
    tabs.forEach((t, n) => t.addEventListener("click", (e) => { if (t.dataset.open === "1") { e.stopImmediatePropagation(); tabs.forEach((x, m) => { x.setAttribute("aria-selected", "false"); x.dataset.open = ""; panels[m].hidden = true; }); } else { tabs.forEach((x) => (x.dataset.open = "")); t.dataset.open = "1"; } }, true));
    wrap.classList.add("js");
    tabs.forEach((t, n) => { t.setAttribute("aria-selected", "false"); t.tabIndex = n === 0 ? 0 : -1; panels[n].hidden = true; });
    // ad variants (?h=partner …) open the matching goal card
    const { card, key: ad } = (CFG.headlines || [])[variant - 1] || {};
    if (card && tabs[card - 1]) tabs[card - 1].click();
    // …and point every sample link at the matching example goal
    const goal = { solo: "solo", clarity: "clarity" }[ad];
    // step 3 visual flags the area that blocks this visitor's kind of goal
    const flag = { solo: "Financial", clarity: "Vocational" }[ad], bars = $("#svBars");
    if (flag && bars) {
      const low = { Financial: 4, Vocational: 3 }[flag];
      $$("li", bars).forEach((li) => { li.classList.remove("flag", "flag2"); if (li.firstElementChild.textContent === flag) { li.classList.add("flag"); li.querySelector("i").style.setProperty("--v", low * 10 + "%"); li.querySelector("b").textContent = low; } });
      const soc = $$("li", bars).find((li) => li.firstElementChild.textContent === "Social"); if (soc) { soc.querySelector("i").style.setProperty("--v", "70%"); soc.querySelector("b").textContent = "7"; }
      $("#svFlag").textContent = flag;
    }
    // step 4 visual: this visitor's kind of week-one tasks
    const TASKS = { solo: ["Runway sheet, done", "Offer sent to 3 contacts", "Decision date set"], clarity: ["Saturday direction block", "Two experiments picked", "Decision date set"] }[ad], tl = $("#svTasks");
    if (TASKS && tl) $$("li", tl).forEach((li, i) => (li.textContent = TASKS[i]));
    const hl = $(".hero-how a.linkbtn"), sg = { partner: "", solo: "?goal=solo", clarity: "?goal=clarity" }[ad];
    if (hl && sg !== undefined) { hl.href = "sample.html" + sg; hl.textContent = "See a sample plan"; }
    if (goal) $$('#how a[href="sample.html"], #how a[href="sample.html#plan"], #offer a[href="sample.html"]').forEach((l) => (l.href = l.getAttribute("href").replace("sample.html", `sample.html?goal=${goal}`)));
  });

  /* ---------- Offer stack: values appear only when every item has a real one in config.js ---------- */
  (function stackValues() {
    const stack = $(".hz-stack");
    if (!stack) return;
    const SV = CFG.stackValues || {}, cells = $$("[data-val]", stack);
    const ready = cells.length && cells.every((el) => typeof SV[el.dataset.val] === "number");
    if (!ready) { stack.classList.add("no-values"); return; }
    let total = 0;
    cells.forEach((el) => { total += SV[el.dataset.val]; el.textContent = "$" + fmt(SV[el.dataset.val]); });
    const t = $("[data-stack-total]", stack);
    t.hidden = false; t.querySelector("b").textContent = "$" + fmt(total);
  })();

  track("page_view");
})();

/* ---------- Hero video: play the walk to the right once, then hold on the right-side part ---------- */
(function () {
  const v = document.getElementById("heroVid");
  if (!v) return;
  // second clip starts with Karim already on the right; it loops slower so he stays there
  const hold = document.getElementById("heroHold");
  if (!hold) return;
  hold.playbackRate = 0.8;
  let stopped = false;
  // phones and data-saver: skip the second clip (1.1 MB) and rest on the first clip's last frame
  const light = matchMedia("(max-width: 760px)").matches || (navigator.connection && navigator.connection.saveData);
  if (!light) v.addEventListener("playing", () => setTimeout(() => { hold.preload = "auto"; hold.load(); }, 600), { once: true });
  v.addEventListener("ended", () => { if (stopped || light) return; hold.playbackRate = 0.8; hold.play().catch(() => {}); hold.classList.add("on"); v.classList.add("off"); });
  // pause control for the moving background (WCAG 2.2.2)
  const btn = document.getElementById("heroPause");
  if (!btn) return;
  btn.hidden = false;
  // narrow layouts stack the video above the copy: keep the button on the video's corner
  const place = () => {
    const stacked = getComputedStyle(v).position !== "absolute";
    btn.style.top = stacked ? v.offsetTop + v.offsetHeight - 52 + "px" : "";
    btn.style.bottom = stacked ? "auto" : "";
    // the looping clip is absolute; line it up with the first clip so the hero doesn't jump
    hold.style.top = stacked ? v.offsetTop + "px" : "";
    hold.style.height = stacked ? v.offsetHeight + "px" : "";
    const shade = v.parentElement.querySelector(".vh-shade");
    if (shade) { shade.style.top = stacked ? v.offsetTop + "px" : ""; shade.style.height = stacked ? v.offsetHeight + "px" : ""; }
  };
  place(); addEventListener("resize", place); v.addEventListener("loadedmetadata", place);
  btn.addEventListener("click", () => {
    stopped = !stopped;
    const cur = v.classList.contains("off") ? hold : v;
    if (stopped) cur.pause(); else cur.play().catch(() => {});
    btn.setAttribute("aria-pressed", String(stopped));
    btn.setAttribute("aria-label", stopped ? "Play background video" : "Pause background video");
    btn.classList.toggle("is-paused", stopped);
  });
})();

/* ---------- Scroll reveal: cards and the sample report animate in ---------- */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { document.documentElement.classList.add("no-io"); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15 });
  els.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
})();

/* ---------- The 7 domains: tabs (all panels stay visible without JS) ---------- */
(function () {
  const tabs = document.querySelectorAll(".ptabs [data-p]"), panels = document.querySelectorAll(".ppanel");
  if (!tabs.length) return;
  const show = (i) => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.p === i ? "true" : "false"));
    panels.forEach((p) => (p.hidden = p.dataset.p !== i));
  };
  tabs.forEach((t) => t.addEventListener("click", () => show(t.dataset.p)));
  show("0");
})();

/* ---------- Difference diagram: 7 dimensions, every one connected ---------- */
(function () {
  const svg = document.getElementById("fvcNet");
  if (!svg) return;
  const names = ["Physical", "Mental", "Social", "Vocational", "Financial", "Intellectual", "Spiritual"];
  const C = [150, 132], R = 82;
  const P = names.map((_, i) => { const t = -Math.PI / 2 + (i / 7) * 2 * Math.PI; return [C[0] + R * Math.cos(t), C[1] + R * Math.sin(t), t]; });
  let h = "";
  P.forEach(([x, y], i) => P.forEach(([x2, y2], j) => { if (j > i) h += `<line class="fn-link" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="animation-delay:${(i * 7 + j) * 40}ms"/>`; }));
  P.forEach(([x, y]) => (h += `<line class="fn-spoke" x1="${C[0]}" y1="${C[1]}" x2="${x}" y2="${y}"/>`));
  P.forEach(([x, y, t], i) => {
    const side = Math.abs(Math.cos(t)) > 0.85, lx = side ? x : C[0] + (R + 18) * Math.cos(t), ly = side ? y + 20 : C[1] + (R + 18) * Math.sin(t) + 4, anc = side || Math.abs(lx - C[0]) < 6 ? "middle" : lx > C[0] ? "start" : "end";
    h += `<circle class="fn-node" cx="${x}" cy="${y}" r="6"/><text class="fn-lab" x="${lx}" y="${ly}" text-anchor="${anc}">${names[i]}</text>`;
  });
  h += `<circle class="fn-you" cx="${C[0]}" cy="${C[1]}" r="9"/>`;
  svg.innerHTML = h;
})();

/* ---------- Traditional care map: same canvas as the 7D map; four unaligned providers ---------- */
(function () {
  const svg = document.getElementById("tradSvg"), cap = document.getElementById("tradCap");
  if (!svg || !cap) return;
  const C = 260, R = 190;
  const VK = new URLSearchParams(location.search).get("h"), V = ((window.SE7EN_CONFIG || {}).headlines || []).find((x) => x.key && x.key === VK);
  const P = V && V.provs ? V.provs.map(([n, d, t], i) => [n, [-135, -45, 135, 45][i], d, t]).map(([n, deg, d, t]) => { const r = (deg * Math.PI) / 180; return [n, C + R * Math.cos(r), C + R * Math.sin(r), d, t, r]; }) : [
    ["Longevity MD", -135, "Physical", "Focused on your biomarkers and lifespan, not your relationships or your career."],
    ["Financial Planner", -45, "Financial", "Focused on your portfolio, not your health or your relationships."],
    ["Therapist", 135, "Mental", "Focused on your mind, not your money or your career."],
    ["Career Coach", 45, "Vocational", "Focused on your performance, not your health or your relationships."],
  ].map(([n, deg, d, t]) => { const r = (deg * Math.PI) / 180; return [n, C + R * Math.cos(r), C + R * Math.sin(r), d, t, r]; });
  let sel = null;
  function draw() {
    // four separate circles: one area each, a separate fee each, no line between them
    const S = 84;
    let h = "";
    P.forEach(([n, x, y, d], k) => {
      h += `<g class="seg-g tp-g silo${k === sel ? " on" : ""}" data-i="${k}" tabindex="0" role="button" aria-label="${n}, ${d} only, separate fee"><circle class="silo-c" cx="${x}" cy="${y}" r="${S}"/><text class="silo-n" x="${x}" y="${y - (n.includes(" ") ? 24 : 10)}">${n.includes(" ") ? n.split(" ").map((w, q) => `<tspan x="${x}" dy="${q ? "1.1em" : 0}">${w}</tspan>`).join("") : n}</text><text class="silo-a" x="${x}" y="${y + 24}">${d} only</text><text class="silo-fee" x="${x}" y="${y + 46}">$ separate fee</text></g>`;
    });
    h += `<circle class="silo-you-dot" cx="${C}" cy="${C}" r="6"/><text class="k-you" x="${C}" y="${C + 24}">YOU</text>`;
    h += `<text class="silo-note" x="${C}" y="${C + R + 116}">They don't talk to each other.</text>`;
    svg.innerHTML = h;
  }
  function choose(k) {
    sel = k; draw(); if (navigator.vibrate) navigator.vibrate(12);
    const [n, , , d, t] = P[k];
    cap.classList.add("show");
    cap.innerHTML = `<p class="wc-n mono">${n} · separate fee</p><p class="wc-why">${t}</p><p class="wc-items">A separate appointment, a separate bill, and nobody connecting the pieces.</p>`;
  }
  svg.addEventListener("click", (e) => { const g = e.target.closest(".tp-g"); if (g) choose(+g.dataset.i); });
  svg.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".tp-g")) { e.preventDefault(); choose(+e.target.closest(".tp-g").dataset.i); } });
  draw();
})();

/* ---------- What you get: tabs ---------- */
(function () {
  const tabs = document.querySelectorAll(".gtabs [data-g]"), panels = document.querySelectorAll(".gpanel");
  if (!tabs.length) return;
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-selected", x === t ? "true" : "false"));
    panels.forEach((p) => (p.hidden = p.dataset.g !== t.dataset.g));
    if (navigator.vibrate) navigator.vibrate(8);
  }));
})();

/* ---------- Journey: tap a step, reveal what you get at that step ---------- */
(function () {
  const steps = document.querySelectorAll(".jsteps [data-s]"), panels = document.querySelectorAll(".jpanels .spanel");
  if (!steps.length) return;
  const show = (k) => {
    steps.forEach((x) => { x.setAttribute("aria-selected", x.dataset.s === k ? "true" : "false"); x.classList.toggle("done", +x.dataset.s < +k); });
    panels.forEach((p) => (p.hidden = p.dataset.s !== k));
  };
  steps.forEach((x) => {
    x.addEventListener("click", () => { show(x.dataset.s); if (navigator.vibrate) navigator.vibrate(8); });
    x.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(x.dataset.s); } });
  });
})();

/* ---------- Hero: a slowly turning 7D constellation ---------- */
(function () {
  const svg = document.getElementById("heroNet");
  if (!svg) return;
  const N = ["Physical", "Mental", "Social", "Vocational", "Financial", "Intellectual", "Spiritual"], C = 260, R = 200;
  const P = N.map((_, k) => { const t = -Math.PI / 2 + (k * 2 * Math.PI) / 7; return [C + R * Math.cos(t), C + R * Math.sin(t), t]; });
  let h = `<g class="hn-spin"><circle class="k-orbit" cx="${C}" cy="${C}" r="${R}"/><circle class="k-orbit in" cx="${C}" cy="${C}" r="${R * 0.55}"/>`;
  P.forEach(([x, y], i) => P.forEach(([x2, y2], j) => { if (j > i) h += `<line class="hn-link" x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" style="animation-delay:${((i * 7 + j) % 9) * 0.45}s"/>`; }));
  P.forEach(([x, y]) => (h += `<line class="k-spoke" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/>`));
  P.forEach(([x, y], i) => (h += `<circle class="hn-node" cx="${x}" cy="${y}" r="7" style="animation-delay:${i * 0.4}s"/>`));
  h += `</g>`;
  P.forEach(([x, y, t], i) => { const lx = C + (R + 30) * Math.cos(t), ly = C + (R + 30) * Math.sin(t) + 5, anc = Math.abs(lx - C) < 14 ? "middle" : lx > C ? "start" : "end"; h += `<text class="k-lab hn-lab" x="${lx}" y="${ly}" text-anchor="${anc}">${N[i]}</text>`; });
  h += `<circle class="k-core" cx="${C}" cy="${C}" r="12"/><circle class="hn-pulse" cx="${C}" cy="${C}" r="12"/><text class="k-you" x="${C}" y="${C + 42}">YOUR GOAL</text>`;
  svg.innerHTML = h;
})();

/* ---------- How it works: pill switch between the two maps ---------- */
(function () {
  const pills = document.querySelectorAll(".pill [data-v]"), cols = document.querySelectorAll(".fvc-col[data-v]");
  if (!pills.length) return;
  pills.forEach((p) => p.addEventListener("click", () => {
    pills.forEach((x) => x.setAttribute("aria-selected", x === p ? "true" : "false"));
    p.closest(".pill").dataset.on = p.dataset.v;
    cols.forEach((c) => (c.hidden = c.dataset.v !== p.dataset.v));
    if (navigator.vibrate) navigator.vibrate(8);
  }));
})();

/* ---------- Infographic: tap an area to see how it pulls on your goal ---------- */
(function () {
  const svg = document.querySelector(".igraph svg"), cap = document.getElementById("igCap");
  if (!svg || !cap) return;
  const T = ["Sleep and energy set your focus, mood and drive.", "Stress and anxiety shape the risks you take and the people you meet.", "Who you spend time with decides which doors open.", "Your work sets your hours, your income and your energy.", "Money decides how many options you actually have.", "Missing skills quietly cap your next step.", "Knowing what matters decides what you will commit to."];
  const N = ["Physical", "Mental", "Social", "Vocational", "Financial", "Intellectual", "Spiritual"];
  const set = (k) => { svg.querySelectorAll(".ig-a").forEach((g) => g.classList.toggle("on", +g.dataset.k === k)); cap.innerHTML = `<b>${N[k]}</b> ${T[k]}`; };
  svg.querySelectorAll(".ig-a").forEach((g) => ["click", "mouseenter", "focus"].forEach((ev) => g.addEventListener(ev, () => { set(+g.dataset.k); if (ev === "click" && navigator.vibrate) navigator.vibrate(8); })));
  set(0);
})();

/* ---------- Karim media wall: load each clip only when it scrolls into view, pause when it leaves ---------- */
(function () {
  const vids = document.querySelectorAll(".km video[data-src]");
  if (!vids.length) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !("IntersectionObserver" in window)) return; // posters stay as stills
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src) v.src = v.dataset.src;
      v.play().catch(() => {});
    } else if (v.src) v.pause();
  }), { rootMargin: "120px 0px", threshold: 0.25 });
  vids.forEach((v) => io.observe(v));
})();

/* ---------- Goal cards: gentle 3D tilt that follows the cursor (mouse only) ---------- */
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("#outcome .pw-tabs button, .wwd-dark .rflow .bx, #pricing .tier").forEach((card) => {
    const k = card.classList.contains("tier") ? 0.5 : 1;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", ((x - 0.5) * 12 * k).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - y) * 10 * k).toFixed(2) + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
    });
    card.addEventListener("pointerleave", () => { ["--rx", "--ry"].forEach((p) => card.style.setProperty(p, "0deg")); card.style.setProperty("--mx", "50%"); card.style.setProperty("--my", "30%"); });
  });
})();

/* ---------- 7D wheel: tilts toward the cursor (mouse only) ---------- */
(function () {
  const svg = document.getElementById("wheelSvg"), stage = svg && svg.closest(".cmp-map");
  if (!stage || !matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  stage.addEventListener("pointermove", (e) => {
    const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    svg.style.setProperty("--wy", (x * 10).toFixed(2) + "deg");
    svg.style.setProperty("--wx", (-y * 8).toFixed(2) + "deg");
  });
  stage.addEventListener("pointerleave", () => { svg.style.setProperty("--wy", "0deg"); svg.style.setProperty("--wx", "0deg"); });
})();

/* ---------- Step 1 visual: the example goal rotates through the three kinds of goal ---------- */
(function () {
  const g = document.getElementById("svGoal"); if (!g) return;
  const chips = g.closest(".sv").querySelectorAll(".sv-chips li");
  const goals = ["More energy at work", "Lose 15 pounds", "Run a marathon"];
  // ad variants start on their own goal
  const start = { solo: 1, clarity: 2 }[new URLSearchParams(location.search).get("h")] || 0;
  let i = start;
  g.textContent = goals[i]; chips.forEach((c, n) => c.classList.toggle("on", n === i));
  setInterval(() => {
    if (document.hidden || new URLSearchParams(location.search).get("h")) return;
    i = (i + 1) % goals.length; g.textContent = goals[i];
    chips.forEach((c, n) => c.classList.toggle("on", n === i));
  }, 2600);
})();

/* ---------- How we're different: each card opens its explanation right below the cards ---------- */
(function () {
  const btns = document.querySelectorAll("[data-expand]");
  if (!btns.length) return;
  btns.forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.expand, panel = document.getElementById(id);
    if (!panel) return;
    const opening = panel.hidden || !b.matches(".cv-card");
    document.querySelectorAll(".cmp-expand").forEach((p) => (p.hidden = !(opening && p.id === id)));
    document.querySelectorAll(".cv-card[data-expand]").forEach((c) => c.setAttribute("aria-expanded", String(opening && c.dataset.expand === id)));
    // phones stack the cards: open the explanation right under the card that was tapped
    const card = document.querySelector(`.cv-card[data-expand="${id}"]`), cmpv = card && card.parentElement;
    if (cmpv) {
      if (matchMedia("(max-width: 600px)").matches) card.after(panel);
      else cmpv.after(...["cmpWheel", "cmpTrad"].map((x) => document.getElementById(x)).filter(Boolean));
    }
    if (opening && card) window.scrollTo({ top: card.getBoundingClientRect().top + scrollY - 84, behavior: "smooth" });
  }));
})();

/* ---------- Hero: always leave room for the "As seen on" strip, however tall it wraps ---------- */
(function () {
  const hero = document.querySelector(".mhero.vhero"), strip = hero && hero.querySelector(".press-hero");
  if (!hero || !strip || !("ResizeObserver" in window)) return;
  const fit = () => hero.style.setProperty("--press-h", `${strip.offsetHeight}px`);
  new ResizeObserver(fit).observe(strip);
  fit();
})();

/* ---------- Traditional care wheel: tap an area to see who covers it (and what they miss) ---------- */
(function () {
  const svg = document.querySelector("#cmpTrad .tw-svg"), cap = document.getElementById("twCap");
  if (!svg || !cap) return;
  const AREAS = [
    ["Physical", "Doctor", "Focused on your body.", "Essential for your health. A short visit rarely has time for your workload, relationships or goals."],
    ["Mental", "Therapist", "Focused on your mind.", "Thoughts, emotions and patterns. Your schedule and finances usually sit outside the session."],
    ["Social", "", "Often no one's focus.", "Who you spend time with, and where, rarely sits with any one provider."],
    ["Vocational", "Career coach", "Focused on your work.", "Performance and next roles. Your health and relationships usually sit outside it."],
    ["Financial", "Financial planner", "Focused on your money.", "Your portfolio and taxes. Your energy and time usually sit outside it."],
    ["Intellectual", "", "Often no one's focus.", "How you learn and grow outside work rarely has an owner."],
    ["Spiritual", "", "Often no one's focus.", "Your values and sense of purpose rarely come up."],
  ];
  const nodes = [...svg.querySelectorAll(".tw-node")], labs = [...svg.querySelectorAll(".tw-lab")];
  const show = (i) => {
    const [area, prov, t, d] = AREAS[i];
    cap.innerHTML = `<p class="tw-cap-k mono">${area} · ${prov || "No one"}</p><p class="tw-cap-t">${t}</p><p class="tw-cap-d">${d}</p>`;
    cap.classList.toggle("none", !prov);
    nodes.forEach((n, j) => n.classList.toggle("sel", j === i));
    labs.forEach((l, j) => l.classList.toggle("sel", j === i));
  };
  nodes.forEach((n, i) => {
    const cx = n.getAttribute("cx"), cy = n.getAttribute("cy");
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hit.setAttribute("cx", cx); hit.setAttribute("cy", cy); hit.setAttribute("r", "34");
    hit.setAttribute("class", "tw-hit"); hit.setAttribute("tabindex", "0"); hit.setAttribute("role", "button");
    hit.setAttribute("aria-label", `${AREAS[i][0]}: ${AREAS[i][1] || "no one"}`);
    svg.appendChild(hit);
    [hit, labs[i]].forEach((el) => el && el.addEventListener("click", () => show(i)));
    hit.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); } });
    if (labs[i]) labs[i].style.cursor = "pointer";
  });
  show(0);
})();

/* ---------- Bonus offers: hidden until asked for, so the page leads with one offer ---------- */
(function () {
  const btn = document.getElementById("boBtn"), box = document.getElementById("boTiers");
  if (!btn || !box) return;
  btn.addEventListener("click", () => {
    const open = box.hidden;
    box.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "Hide GROW and TRANSFORM" : "Compare GROW and TRANSFORM";
  });
  // "See bonus offers" links open it
  document.querySelectorAll('a[href="#pricing"]').forEach((a) => a.addEventListener("click", () => { if (box.hidden) btn.click(); }));
})();

/* ---------- Links like karim.html#story land on that section, even after late layout shifts ---------- */
(function () {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || id === "plan") return;
  window.addEventListener("load", () => setTimeout(() => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: "instant" });
  }, 80));
})();
