/*
 * SE7EN site configuration — the only file you need to edit to go live.
 * Leave a URL empty ("") and the site shows an honest "not connected yet" state.
 */
window.SE7EN_CONFIG = {
  // Stripe Payment Link (or other hosted checkout) for RESET.
  resetCheckoutUrl: "",
  // Session booking. endpoint = the Google Apps Script web-app URL (see booking/SETUP.md).
  // Empty endpoint = preview: visitors can pick a time, nothing is sent.
  // hours: Toronto time, by weekday (0 = Sun … 6 = Sat). Keep in sync with HOURS in booking/Code.gs.
  booking: {
    endpoint: "https://script.google.com/macros/s/AKfycbyIas9uzJcXmro8E8pMTbyov8wJHQS9FOkZAOlL0vJb8TZoZSvEYhzHcIEhXOL4iil6/exec",
    tz: "America/Toronto",
    days: 21,          // how far ahead people can book
    noticeHours: 12,   // minimum notice
    // Paid types (no "public") can only be booked by emails on the Clients tab of the bookings Sheet.
    // Booking links: book.html?type=assessment · book.html?type=review · book.html?type=coaching
    types: {
      intro:      { label: "Free 15-min call",            minutes: 15, step: 15, public: true },
      assessment: { label: "90-min 7-in-1 assessment",    minutes: 90, step: 30 },
      review:     { label: "30-min 1:1 review",           minutes: 30, step: 15 },
      coaching:   { label: "60-min coaching session",     minutes: 60, step: 30 }
    },
    hours: {
      1: [["12:00", "15:00"], ["18:00", "21:00"]],
      2: [["12:00", "15:00"], ["18:00", "21:00"]],
      3: [["12:00", "15:00"], ["18:00", "21:00"]],
      4: [["12:00", "15:00"], ["18:00", "21:00"]],
      5: [["12:00", "15:00"], ["18:00", "21:00"]],
      6: [["10:00", "12:00"]]
    }
  },
  // Optional POST endpoint for "email me my Check-In result". Empty = hidden.
  checkInEmailEndpoint: "",
  contactEmail: "karim.atassi@medportal.ca",
  // Karim's profiles. Paste a full URL to show that icon in the founder section and footer;
  // empty ones stay hidden. Instagram also becomes the "Want in now?" contact while booking isn't live.
  socials: {
    instagram: "https://www.instagram.com/karimatassimd/",
    linkedin: "",    // https://www.linkedin.com/in/...
    youtube: "",     // https://youtube.com/@...
    tiktok: "",      // https://tiktok.com/@...
    x: "",           // https://x.com/...
    linktree: "",    // https://linktr.ee/... (or any link-in-bio page)
    newsletter: "",  // Substack / newsletter signup
    podcast: "",     // podcast page
  },

  // Shown instead of the pain hook when the visitor arrives from a workshop QR
  // (?utm_source=workshop or ?venue=...). Leave "" to always show the pain hook.
  workshopHook: "You heard Karim at the workshop. Here's the next step.",

  prices: { reset: 699, currency: "CAD" },  // back to 699 (Karim, Nov 6 2026)

  // The offer ladder. RESET is booked directly; GROW and PLATINUM open by application.
  // applyUrl = a form (Tally / Typeform / Google Form). Empty = "Applications open shortly" + contact line.
  // platinum.priceLabel is the anchor shown on the card ("By application", or e.g. "From $10,000").
  tiers: {
    grow: { price: 2499, applyUrl: "" },  // 30 days: 4 weekly 1-hour sessions (Karim, Oct 28 2026)
    platinum: { priceLabel: "7,000", seats: 7, applyUrl: "" },
    // Founding seats still open. Two were sold before launch (Oct 2026). Lower it as each real seat sells.
    seatsLeft: 5,
  },

  // Hero A/B test. Visit ?h=2, ?h=3 ... to preview a variant; put the workshop QR on the winner.
  // hook = pain line above the headline. A "|" in h splits it; the part after renders muted.
  headlines: [
    { hook: "The MD-led executive performance coaching clinic",
      h: "Outperform every executive in the room. | Get your own wellness care team, built for exactly your goals.",
      sub: "Vetted specialists working on every area of your wellness to boost your performance and hit your life goals, mapped out by Karim Atassi, MD." },
    { hook: "Get an MD as your life coach",
      h: "Your doctor treats your health. | This MD uncovers how your social habits are impacting it.",
      sub: "Get an MD-built plan that tells you exactly what to change each week, next. It starts with one 90-minute conversation." },
    { hook: "Get an MD as your life coach",
      h: "Successful on paper. Stuck in real life. | An MD finds what's holding you back in 90 minutes.",
      sub: "Uncover the hidden areas of your wellness that are limiting you from achieving your goal." },
    { hook: "Get an MD as your life coach",
      h: "Your life, assessed like a clinical case. | 7 dimensions. 90 minutes. Your plan in 72 hours.",
      sub: "Uncover the hidden areas of your wellness that are limiting you from achieving your goal." },
    { hook: "MD-led life assessment · Toronto",
      h: "Find what's blocking your goal. | A 90-minute MD-led assessment of your whole life.",
      sub: "Evidence-based assessment with Karim Atassi, MD · written report in 72 hours · transformation plan · your personalized wellness care team." },
    { hook: "MD-led life coaching · Toronto",
      h: "Your doctor treats your health. | An MD life coach helps you care for your life as a whole.",
      sub: "Evidence-based assessment with Karim Atassi, MD · written report in 72 hours · transformation plan · your personalized wellness care team." },
    // Ad variants by segment: index.html?h=partner · ?h=solo · ?h=clarity (also opens the matching problem card)
    { key: "partner", card: 5,
      why: "Why an MD? Doctors are trained to find the one cause behind many symptoms. Here, that means finding which areas of your life are holding your goal back.",
      worth: "Seeing separate providers for each area of your life easily costs $3,000+, and none of them connects the pieces. The program looks at all seven and shows which one is limiting your goal. Covered by the guarantee.",
      alts: [["A therapist", "sees your mind"], ["A career coach", "sees your job"], ["A dating app", "sees who you swipe on"]],
      hook: "MD-led life coaching for corporate professionals",
      compare: "Most help looks at one area of your life. | We assess all 7 to uncover what's limiting your goal, then change your environment so you reach it.",
      h: "Want a partner, but something keeps getting in the way? | Find out what in your life is limiting you, and change your environment to meet them.",
      sub: "One 90-minute whole-life assessment uncovers the areas of your life limiting your goal: your hours, energy, circle and environment. Your 360° Life Report and transformation plan show exactly what to change. Or receive 100% of your money back.*" },
    { key: "solo", card: 2, sum: "Thousands to start, and nobody connecting the pieces.", provs: [["Business Coach", "Vocational", "Works on the business, not your runway, energy or household.", "~$300 / session"], ["Financial Planner", "Financial", "Sees your portfolio, not whether your offer will sell.", "$1,500+ / plan"], ["Employment Lawyer", "Vocational", "Reads your contract, not your plan.", "~$400 / hour"], ["Career Coach", "Vocational", "Helps you find the next job, not build your own.", "~$200 / session"]], why: "Why an MD? Most people don't fail on the idea; they run out of runway or energy first. Karim assesses both, and he has co-founded a company himself.", alts: [["A financial planner", "sees your money"], ["A career coach", "sees your next job"], ["Mentors", "see their own path"]], worth: "One month of runway in our sample is $7,800. A fee-only planner starts around $1,500 and only sees your money. Timing the leap wrong costs far more than $699, and you're covered by the guarantee.", compare: "Planners, mentors and career coaches each see one piece. | We assess all 7 dimensions of your life to find what's really holding your launch back.", hook: "Leaving corporate? With Karim Atassi, MD · xCo-founder of Zatiq ($1.6M raised)",
      h: "Ten years in corporate. | Ready to build your own, without blowing up your finances?",
      sub: "One 90-minute whole-life assessment finds what's really holding you back: your runway, your energy, your network. Your 360° Life Report and transformation plan take you to a tested next step and a decision date. Or receive 100% of your money back.*" },
    { key: "clarity", sum: "Hundreds spent, and still no direction.", provs: [["Personality Tests", "Intellectual", "Tell you your type, not what to try next.", "~$100 / test"], ["Career Coach", "Vocational", "Sees your job, not the rest of your week.", "~$200 / session"], ["Online Courses", "Intellectual", "More learning, no decision.", "$500+ / course"], ["Therapist", "Mental", "Essential for your mind, but not set up to test a direction.", "~$170 / session"]], why: "Why an MD? Feeling all over the place is often a sleep, energy or workload problem that looks like a purpose problem. Karim looks at those first, so you don't chase a new direction to fix a tired week.", alts: [["Personality tests", "see your type"], ["Self-help books", "see someone else's life"], ["A career coach", "sees your job"]], worth: "A career coach is about $200 a session and only sees your job. The program looks at all seven areas and ends with two tested directions and a decision date. Covered by the guarantee.", compare: "Tests and books each see one piece. | We assess all 7 dimensions of your life to show where your time, money and energy actually go.", hook: "MD-led life coaching for corporate professionals",
      h: "Successful on paper. | Not sure what you actually want?",
      sub: "One 90-minute whole-life assessment shows where your time, money and energy really go. Your 360° Life Report and transformation plan turn that into two experiments and one clear direction. Or receive 100% of your money back.*" }
  ],

  // Credential strip under the hero. Edit to exactly what you're cleared to publish.
  credentials: [
    "MDCM · McGill University",
    "Family Medicine · McMaster",
    "World Economic Forum Global Shaper",
    "G20 Young Entrepreneurs' Alliance Delegate",
    "TEDx Speaker",
  ],
  // Proof numbers Karim confirmed (Oct 28 2026). Keep them true.
  proof: { peopleHelped: "100+", workshops: "Dozens of" },
  // How the founder is named on the page.
  founderTitle: "Karim Atassi, MD",

  // Risk reversal. Set to "" to hide. Have counsel review before taking payment.
  guarantee: {
    title: "Results or 100% money back",
    text: "Attend your assessment and work through your plan. If you still don't feel it helped you make a transformational change within 90 days, get a full refund, no questions asked.",  // Karim, Oct 28 2026: conditional on attending both sessions and working the plan; the client judges, claims by email
  },

  // Real client testimonials only (with written permission). Each: { quote, name, role, photo }.
  // photo is a path like "assets/t-anna.jpg". The section stays hidden while this list is empty.
  // Quotes reflect each client's real outcome, written with their permission (Karim, Oct 28 2026).
  // Each: { name: "First name", role: "Profession", topic: "Career" | "Purpose" | "Partner" | ..., quote: "...", photo: "assets/....jpg" }
  // Only real clients, in their own words, with written permission to publish name, photo and quote.
  // Source: SE7EN_Testimonials.md (Karim, Oct 28 2026), first name + role only.
  // client: true = coaching; false = worked with Karim on a project (shown with a "Worked together" tag).
  testimonials: [
    { name: "N.S.", photo: "assets/clients/nour.jpg?v=2", role: "VP, Sales & Operations", topic: "Burnout & stress", client: true, quote: "I was pretty burnt out in sales and kept going back and forth on leaving. Karim didn't push me either way. He helped me figure out what I actually wanted and a plan I could afford. That alone was worth it." },
    { name: "J.H.", photo: "assets/clients/juliet.jpg?v=2", role: "VP, Business Development", topic: "Love", client: true, quote: "I went in thinking my problem was dating. Turns out I was just around the same people all the time, mostly from work. Karim had me change where I spend my evenings and honestly my whole social life changed. Wish I'd done it two years ago." },
    { name: "J.P.", photo: "assets/clients/justin.jpg?v=2", role: "VP, Business Development", topic: "Building", client: true, quote: "I'd been talking about starting something on the side for years. Karim helped me stop talking and start. It's live now." },
    { name: "S.M.", photo: "assets/clients/sultan.jpg?v=2", role: "FinTech Entrepreneur", topic: "Building", client: true, quote: "Karim knows how to connect people. A couple of his introductions completely changed where my company went." },
    { name: "A.A.", photo: "assets/clients/ajamu.jpg?v=2", role: "EdTech Entrepreneur", topic: "Building", client: true, quote: "Karim helped me take a big idea and actually make it real. He knows how to get the right people in a room. We ended up closing a major institutional partner." },
    { name: "L.R.", photo: "assets/clients/lara.jpg?v=2", role: "Consultant", topic: "Loneliness", client: true, quote: "Moved to Toronto for work and realized all my “friends” were coworkers. The plan was super practical, like which places to go and when. I have a real group now." },
    { name: "A.A.", photo: "assets/clients/abdullatif.jpg?v=2", role: "Consultant", topic: "Focus", client: true, quote: "I overthink everything. Karim made me pick one thing and put a date on it. That's it. It worked." },
    { name: "R.M.", photo: "assets/clients/rami.jpg?v=2", role: "Physician", topic: "Sleep", client: true, quote: "As a doctor I'm terrible at taking my own advice. This gave me structure. I'm sleeping more and I actually have my evenings back." },
    { name: "L.A.", photo: "assets/clients/lydia.jpg?v=2", role: "Dentist", topic: "Clarity", client: true, quote: "Short and to the point. He caught two things I'd been avoiding for years. I still have the list on my fridge." },
    { name: "A.J.", photo: "assets/clients/andrea.jpg?v=2", role: "Fashion Influencer", topic: "Dating", client: true, quote: "He picked up on how I communicate when I'm stressed within about 20 minutes. Kind of annoying how right he was. It's helped with my partner, my family, everyone." },
  ],

  // Honest scarcity only: a real number of open spots this month, or null to hide.
  spotsThisMonth: null,
  // Real capacity (Karim, Oct 28 2026): about 4 Resets a month. null hides the line.
  resetsPerMonth: null,  // Karim, Oct 28 2026: don't show capacity on the page

  // Value column in the offer stack. Fill in a number ONLY for items you would genuinely sell on
  // their own at that price. The column and the total stay hidden until every item has a value.
  stackValues: { intake: null, deepdive: null, report: null, plan: null, review: null, md: null },
};
