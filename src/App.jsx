import { useState, useEffect } from "react";

const questions = [
  {
    id: 1,
    question: "Why are you looking for a hobby right now?",
    subtitle: "This is the most important question — be real with yourself.",
    options: [
      { label: "I'm bored and need something exciting in my life", icon: "🔥" },
      { label: "I want to meet new people and build connections", icon: "🤝" },
      { label: "I need an escape from stress and work", icon: "🧘" },
      { label: "I want to grow a skill or become good at something", icon: "🎯" }
    ]
  },
  {
    id: 2,
    question: "How would your friends describe your energy?",
    subtitle: "Be honest — this shapes everything.",
    options: [
      { label: "High energy, always moving", icon: "⚡" },
      { label: "Calm and steady, I like flow", icon: "🌊" },
      { label: "Bursts of energy, then recharge", icon: "🔋" },
      { label: "Laid back, I prefer low effort", icon: "😌" }
    ]
  },
  {
    id: 3,
    question: "What does your ideal free time look like?",
    subtitle: "Not what you think you should do — what you actually want.",
    options: [
      { label: "Getting outside, moving my body", icon: "🏕️" },
      { label: "Creating something with my hands", icon: "🎨" },
      { label: "Learning or exploring something new", icon: "🔍" },
      { label: "Relaxing, zoning out, recharging", icon: "🛋️" }
    ]
  },
  {
    id: 4,
    question: "How do you feel about learning curves?",
    subtitle: "This tells us how fast you want to feel good at something.",
    options: [
      { label: "I want results fast — instant gratification", icon: "🚀" },
      { label: "Some learning is fine, not too steep", icon: "📈" },
      { label: "I enjoy mastering something over time", icon: "🏆" },
      { label: "I like exploring without pressure to improve", icon: "🌸" }
    ]
  },
  {
    id: 5,
    question: "Where do you spend most of your time?",
    subtitle: "Your environment shapes what hobbies are actually realistic.",
    options: [
      { label: "City — apartments, gyms, cafes", icon: "🌆" },
      { label: "Suburbs — house, backyard, nearby parks", icon: "🏡" },
      { label: "Near nature — trails, water, open space", icon: "🌲" },
      { label: "Mostly indoors, doesn't matter", icon: "🏠" }
    ]
  },
  {
    id: 6,
    question: "How social do you want this hobby to be?",
    subtitle: "Honest answer leads to a better match.",
    options: [
      { label: "Solo only — my time, my pace", icon: "🧘" },
      { label: "Occasional group, mostly solo", icon: "👤" },
      { label: "Mix of solo and social", icon: "👥" },
      { label: "The more people the better", icon: "🎉" }
    ]
  },
  {
    id: 7,
    question: "What's your honest relationship with consistency?",
    subtitle: "This helps us match you to something you'll actually stick with.",
    options: [
      { label: "I stick to things once I start", icon: "🎯" },
      { label: "Good for a few weeks, then it fades", icon: "📅" },
      { label: "I need variety or I get bored", icon: "🔀" },
      { label: "I do things whenever the mood hits", icon: "🌙" }
    ]
  }
];

const teaserHobbies = [
  { match: 97 }, { match: 93 }, { match: 88 }, { match: 84 }, { match: 79 }
];

const aiSteps = [
  { icon: "🧠", title: "Deep Personality Analysis", desc: "Reads all 7 answers together holistically — not just keywords" },
  { icon: "🔗", title: "Cross-Pattern Matching", desc: "Connects your energy, lifestyle, goals and environment simultaneously" },
  { icon: "🎯", title: "Specificity Engine", desc: "Returns 'urban bouldering' not 'climbing' — tailored to your actual life" },
  { icon: "🗺️", title: "Full Starter Roadmap", desc: "Generates a custom action plan, gear list and 30-day journey for each match" },
];

export default function FindMyHobby() {
  const [screen, setScreen] = useState("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [results, setResults] = useState(null);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const loadingMessages = [
    "Analyzing your personality...",
    "Thinking beyond the obvious...",
    "Finding your perfect matches...",
    "Almost there..."];
  const handleAnswer = (option) => {
    setAnimating(true);
    setTimeout(() => {
      const newAnswers = [...answers, { question: questions[currentQ].question, answer: option.label }];
      setAnswers(newAnswers);
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setAnimating(false);
      } else {
        setScreen("paywall");
        setAnimating(false);
      }
    }, 250);
  };

  const handleBack = () => {
    if (currentQ === 0) { setScreen("landing"); setAnswers([]); }
    else {
      setAnimating(true);
      setTimeout(() => { setCurrentQ(currentQ - 1); setAnswers(answers.slice(0, -1)); setAnimating(false); }, 200);
    }
  };

  const handlePurchase = async (selectedPlan) => {
  setPlan(selectedPlan);
  setPaymentLoading(true);
  localStorage.setItem("answers", JSON.stringify(answers));
  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: selectedPlan })
  });
  const { url } = await response.json();
  window.location.href = url;
};
  const fetchRecommendations = async (finalAnswers, selectedPlan) => {
    setScreen("loading");
    setError(null);
    setLoadingMsg(0);
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = Math.min(msgIndex + 1, loadingMessages.length - 1);
      setLoadingMsg(msgIndex);
    }, 1400);

    const answersText = finalAnswers.map(a => `- ${a.question}: ${a.answer}`).join("\n");
    const isDeep = selectedPlan === "deep";

    const prompt = `You are an expert hobby matchmaker. Based on these quiz answers, recommend exactly 5 hobbies that are genuinely well-matched to this person.

Quiz answers:
${answersText}

CRITICAL RULES:
- The FIRST answer about WHY they want a hobby is the most important signal. Prioritize it heavily.
- Be SPECIFIC. Not "running" — say "trail running" or "urban 5K training". Not "painting" — say "gouache illustration" or "urban sketching".
- All 5 hobbies must be meaningfully DIFFERENT from each other.
- Include at least 1 unexpected creative suggestion.
- Match #1 = strongest fit. Match #5 = creative wild card.

${isDeep ? `This is DEEP RESEARCH. Provide extended content including 30-day plan, common mistakes, and level-up sign.` : ""}

Respond ONLY with valid JSON, no markdown:
{
  "hobbies": [
    {
      "name": "Specific Hobby Name",
      "emoji": "single emoji",
      "match": 97,
      "tagline": "one punchy sentence why this fits them",
      "description": "2-3 sentences about what this hobby is",
      "whyYou": "1-2 sentences why this matches their specific answers",
      "budget": "$X–$Y to get started",
      "timeCommitment": "X hours per week",
      "difficulty": "Beginner-friendly / Moderate / Takes dedication",
      "starterKit": [
        { "item": "Item name", "price": "$XX", "note": "why this item" }
      ],
      "firstWeek": ["Day 1: action", "Day 3: action", "Day 7: milestone"],
      ${isDeep ? `"thirtyDayPlan": ["Week 1: focus", "Week 2: focus", "Week 3: focus", "Week 4: achievement"],
      "commonMistakes": ["Mistake and how to avoid it"],
      "levelUpSign": "How to know you're ready to go deeper",` : ""}
      "proTip": "One insider tip a beginner would never know"
    }
  ]
}`;

    try {
      const response = await fetch("/api/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt })
});
      const data = await response.json();
      clearInterval(msgInterval);
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed.hobbies);
      setScreen("results");
    } catch (err) {
      clearInterval(msgInterval);
      setError("Something went wrong. Please try again.");
      setScreen("paywall");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const savedPlan = params.get("plan");
      const savedAnswers = JSON.parse(localStorage.getItem("answers") || "[]");
      if (savedAnswers.length > 0) {
        setPlan(savedPlan);
        fetchRecommendations(savedAnswers, savedPlan);
      }
    }
  }, []);

  const resetAll = () => {
    setScreen("landing"); setCurrentQ(0); setAnswers([]);
    setSelectedHobby(null); setResults(null); setError(null);
    setLoadingMsg(0); setPlan(null); setPaymentLoading(false);
  };

  // Slightly brighter blue
  const B  = "#5B8FFF";
  const BL = "#92BFFF";
  const BS = "#C8E0FF";
  const BG = "rgba(91,143,255,0.25)";
  const BD = "rgba(91,143,255,0.12)";
  const BB = "rgba(91,143,255,0.36)";
  const progress = ((currentQ + 1) / questions.length) * 100;
  const badgeColors = ["#7AAEFF","#89B6FF","#98C2FF","#A7CEFF","#B6DAFF"];
  const cardStyle = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "26px 28px", marginBottom: 16 };

  return (
    <div style={{ minHeight: "100vh", background: "#060A14", fontFamily: "'Georgia', serif", color: "#FFFFFF", overflowX: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 80% 55% at 50% -5%, rgba(75,127,245,0.14) 0%, transparent 65%),
                     radial-gradient(ellipse 40% 30% at 85% 85%, rgba(122,174,255,0.06) 0%, transparent 60%)` }} />

      {/* ── LANDING ── */}
      {screen === "landing" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

          {/* Nav — logo only, no button */}
          <nav style={{ padding: "28px 44px", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${B}, #1A3FA0)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>✦</div>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.04em", color: BL }}>FindMyHobby</span>
            </div>
          </nav>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px 24px 60px" }}>

            {/* AI badge */}
            <div style={{ background: BD, border: `1px solid ${BB}`, borderRadius: 100, padding: "7px 22px", fontSize: 11, letterSpacing: "0.18em", color: BL, marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: BL, display: "inline-block", boxShadow: `0 0 8px ${BL}` }} />
              POWERED BY ADVANCED AI — NOT GOOGLE SEARCH
            </div>

            <h1 style={{ fontSize: "clamp(42px, 7.5vw, 86px)", fontWeight: 700, lineHeight: 1.06, margin: "0 0 22px", maxWidth: 840 }}>
              Find the hobby<br />
              <span style={{ background: `linear-gradient(135deg, ${BL} 0%, ${BS} 50%, ${BL} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                made for you.
              </span>
            </h1>

            <p style={{ fontSize: "clamp(16px, 2.2vw, 19px)", color: "rgba(255,255,255,0.72)", maxWidth: 540, lineHeight: 1.8, margin: "0 0 16px" }}>
              Our AI doesn't just match keywords — it reads your personality, lifestyle and goals together to recommend hobbies you'd never find on your own.
            </p>

            {/* AI vs Google comparison line */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 100, padding: "6px 16px" }}>
                <span style={{ fontSize: 13 }}>❌</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.62)" }}>Google: "hobbies for introverts"</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 18 }}>vs</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: BD, border: `1px solid ${BB}`, borderRadius: 100, padding: "6px 16px" }}>
                <span style={{ fontSize: 13 }}>✦</span>
                <span style={{ fontSize: 13, color: BL }}>AI: 5 hobbies built around your exact life</span>
              </div>
            </div>

            <button onClick={() => setScreen("quiz")}
              style={{ background: `linear-gradient(135deg, ${B}, #2550CC)`, border: "none", color: "#fff", padding: "18px 56px", borderRadius: 100, fontSize: 16, fontWeight: 700, cursor: "pointer", letterSpacing: "0.03em", boxShadow: `0 0 56px ${BG}`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 84px rgba(75,127,245,0.55)"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 0 56px ${BG}`; }}>
              Find My Hobby
            </button>
            <p style={{ marginTop: 14, fontSize: 13, color: "rgba(255,255,255,0.42)", letterSpacing: "0.06em" }}>7 questions · Results from $1.99</p>

            {/* How the AI works */}
            <div style={{ width: "100%", maxWidth: 860, marginTop: 72 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", letterSpacing: "0.16em", marginBottom: 28 }}>HOW OUR AI WORKS</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {aiSteps.map((step, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: "22px 20px", textAlign: "left" }}>
                    <div style={{ fontSize: 26, marginBottom: 12 }}>{step.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BL, marginBottom: 8, lineHeight: 1.3 }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", lineHeight: 1.6 }}>{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing preview */}
            <div style={{ width: "100%", maxWidth: 500, marginTop: 56 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", letterSpacing: "0.16em", marginBottom: 24 }}>SIMPLE PRICING</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { price: "$1.99", title: "Basic Results", perks: ["5 matched hobbies", "Starter kit", "First week plan"], highlight: false },
                  { price: "$3.99", title: "Deep Research", perks: ["Everything in Basic", "30-day action plan", "Mistakes to avoid"], highlight: true }
                ].map(tier => (
                  <div key={tier.price} style={{ background: BD, border: `1px solid ${BB}`, borderRadius: 18, padding: "22px 20px", textAlign: "left" }}>

                    <div style={{ fontSize: 30, fontWeight: 700, color: BL, marginBottom: 4 }}>{tier.price}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: BL }}>{tier.title}</div>
                    {tier.perks.map(p => (
                      <div key={p} style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", marginBottom: 6, display: "flex", gap: 8 }}>
                        <span style={{ color: BL }}>✓</span>{p}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {screen === "quiz" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "100%", maxWidth: 640, marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <button onClick={handleBack}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.55)", fontSize: 14, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.color = BL}
                onMouseOut={e => e.currentTarget.style.color = "rgba(228,238,255,0.35)"}>
                ← {currentQ === 0 ? "Home" : "Back"}
              </button>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", letterSpacing: "0.1em" }}>{currentQ + 1} / {questions.length}</span>
                <span style={{ fontSize: 12, color: BL, fontWeight: 600 }}>{Math.round(progress)}%</span>
              </div>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ height: "100%", background: `linear-gradient(90deg, ${B}, ${BS})`, borderRadius: 2, width: `${progress}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: 640, opacity: animating ? 0 : 1, transition: "opacity 0.25s" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              {currentQ === 0 && (
                <div style={{ background: BD, border: `1px solid ${BB}`, borderRadius: 100, padding: "5px 16px", fontSize: 11, letterSpacing: "0.14em", color: BL, marginBottom: 16, display: "inline-block" }}>
                  MOST IMPORTANT QUESTION
                </div>
              )}
              <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 700, margin: "0 0 10px", lineHeight: 1.35 }}>{questions[currentQ].question}</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", margin: 0 }}>{questions[currentQ].subtitle}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {questions[currentQ].options.map((option, i) => (
                <button key={i} onClick={() => handleAnswer(option)}
                  style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "#FFFFFF", overflow: "hidden", position: "relative" }}
                  onMouseOver={e => { e.currentTarget.style.background = BD; e.currentTarget.style.borderColor = BB; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${BG}`; }}
                  onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{option.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.45 }}>{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PAYWALL ── */}
      {screen === "paywall" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 680, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: BL, letterSpacing: "0.18em", marginBottom: 12 }}>QUIZ COMPLETE ✓</div>
              <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700, marginBottom: 10 }}>Your results are ready.</h2>
              <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 15 }}>Our AI matched you to 5 hobbies. Unlock to see them.</p>
            </div>

            {/* Blurred teaser */}
            <div style={{ position: "relative", marginBottom: 36 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}>
                {teaserHobbies.map((h, i) => (
                  <div key={i} style={{ background: i === 0 ? BD : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? BB : "rgba(255,255,255,0.06)"}`, borderRadius: 16, padding: "16px 22px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 14, width: 150, background: "rgba(255,255,255,0.12)", borderRadius: 4, marginBottom: 8 }} />
                      <div style={{ height: 10, width: 220, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: badgeColors[i] }}>{h.match}%</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.50)" }}>MATCH</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "rgba(7,11,22,0.88)", borderRadius: 16, padding: "18px 30px", textAlign: "center", border: `1px solid ${BB}`, backdropFilter: "blur(4px)" }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>🔒</div>
                  <p style={{ margin: 0, fontSize: 14, color: BL, fontWeight: 600 }}>Choose a plan to unlock</p>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "12px 20px", marginBottom: 20, color: "#FCA5A5", fontSize: 14, textAlign: "center" }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              {/* Basic */}
              <div style={{ background: BD, border: `1px solid ${BB}`, borderRadius: 20, padding: "24px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 13, color: BL, marginBottom: 6 }}>Basic Results</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: BL, marginBottom: 4 }}>$1.99</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", marginBottom: 18 }}>one-time · instant</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22, flex: 1 }}>
                  {["5 matched hobbies", "Why each fits you", "Starter kit per hobby", "First week action plan", "Amazon product links"].map(p => (
                    <div key={p} style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", display: "flex", gap: 8 }}>
                      <span style={{ color: BL }}>✓</span>{p}
                    </div>
                  ))}
                </div>
                <button onClick={() => !paymentLoading && handlePurchase("basic")}
                  style={{ background: `linear-gradient(135deg, ${B}, #2550CC)`, border: "none", color: "#fff", padding: "13px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: paymentLoading ? "not-allowed" : "pointer", opacity: paymentLoading ? 0.6 : 1, boxShadow: `0 0 24px ${BG}`, transition: "all 0.2s" }}
                  onMouseOver={e => { if (!paymentLoading) e.currentTarget.style.boxShadow = `0 0 40px rgba(75,127,245,0.5)`; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = `0 0 24px ${BG}`; }}>
                  {paymentLoading && plan === "basic" ? "Processing..." : "Unlock $1.99"}
                </button>
              </div>

              {/* Deep */}
              <div style={{ background: BD, border: `1px solid ${BB}`, borderRadius: 20, padding: "24px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

                <div style={{ fontSize: 13, color: BL, marginBottom: 6 }}>Deep Research</div>
                <div style={{ fontSize: 34, fontWeight: 700, color: BL, marginBottom: 4 }}>$3.99</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.48)", marginBottom: 18 }}>one-time · instant</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 22, flex: 1 }}>
                  {["Everything in Basic", "Full 30-day plan", "Common mistakes guide", "Level-up roadmap", "Advanced pro tips", "6+ starter items"].map(p => (
                    <div key={p} style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", display: "flex", gap: 8 }}>
                      <span style={{ color: BL }}>✓</span>{p}
                    </div>
                  ))}
                </div>
                <button onClick={() => !paymentLoading && handlePurchase("deep")}
                  style={{ background: `linear-gradient(135deg, ${B}, #2550CC)`, border: "none", color: "#fff", padding: "13px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: paymentLoading ? "not-allowed" : "pointer", opacity: paymentLoading ? 0.6 : 1, boxShadow: `0 0 24px ${BG}`, transition: "all 0.2s" }}
                  onMouseOver={e => { if (!paymentLoading) e.currentTarget.style.boxShadow = `0 0 40px rgba(75,127,245,0.5)`; }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = `0 0 24px ${BG}`; }}>
                  {paymentLoading && plan === "deep" ? "Processing..." : "Unlock $3.99"}
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={resetAll} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.42)", fontSize: 13, cursor: "pointer" }}>← Retake quiz</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOADING ── */}
      {screen === "loading" && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: `2px solid ${BD}`, borderTop: `2px solid ${BL}`, animation: "spin 0.9s linear infinite" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✦</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 20, color: BL, fontWeight: 600, margin: "0 0 8px" }}>{loadingMessages[loadingMsg]}</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", margin: 0 }}>Our AI is thinking beyond the obvious</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {loadingMessages.map((_, i) => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i <= loadingMsg ? BL : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === "results" && results && !selectedHobby && (
        <div style={{ minHeight: "100vh", padding: "60px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontSize: 11, color: BL, letterSpacing: "0.18em", marginBottom: 12 }}>{plan === "deep" ? "DEEP RESEARCH RESULTS" : "YOUR AI RESULTS"}</div>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, marginBottom: 12 }}>Your 5 Perfect Hobbies</h2>
              <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15 }}>{plan === "deep" ? "Complete with 30-day plans, mistakes to avoid & level-up roadmap" : "Personally matched to your purpose, personality & lifestyle"}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {results.map((hobby, i) => (
                <div key={i} onClick={() => setSelectedHobby(hobby)}
                  style={{ background: i === 0 ? "rgba(75,127,245,0.07)" : "rgba(255,255,255,0.02)", border: `1px solid ${i === 0 ? BB : "rgba(255,255,255,0.06)"}`, borderRadius: 20, padding: "22px 24px", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = BD; e.currentTarget.style.borderColor = BB; e.currentTarget.style.boxShadow = `0 8px 32px ${BG}`; }}
                  onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = i === 0 ? "rgba(75,127,245,0.07)" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = i === 0 ? BB : "rgba(255,255,255,0.06)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                    <div style={{ fontSize: 38, flexShrink: 0, marginTop: 2 }}>{hobby.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{hobby.name}</h3>
                        <span style={{ background: i === 0 ? BD : "rgba(255,255,255,0.04)", border: `1px solid ${i === 0 ? BB : "rgba(255,255,255,0.08)"}`, color: badgeColors[i], fontSize: 10, padding: "2px 9px", borderRadius: 100, letterSpacing: "0.08em" }}>
                          #{i + 1} {i === 0 ? "BEST MATCH" : i === 4 ? "WILD CARD 🎲" : "MATCH"}
                        </span>
                      </div>
                      <p style={{ color: badgeColors[i], fontSize: 13, margin: "0 0 5px", fontStyle: "italic" }}>{hobby.tagline}</p>
                      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{hobby.description}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                        {[["💰", hobby.budget], ["⏱️", hobby.timeCommitment], ["📊", hobby.difficulty]].map(([icon, val]) => (
                          <span key={val} style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: 100 }}>{icon} {val}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: badgeColors[i] }}>{hobby.match}%</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.46)", letterSpacing: "0.1em" }}>MATCH</div>
                    </div>
                    <div style={{ color: "rgba(228,238,255,0.16)", fontSize: 15, flexShrink: 0, marginTop: 4 }}>→</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button onClick={resetAll} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.52)", padding: "11px 26px", borderRadius: 100, fontSize: 13, cursor: "pointer" }}>↺ Start Over</button>
            </div>
          </div>
        </div>
      )}

      {/* ── STARTER GUIDE ── */}
      {screen === "results" && selectedHobby && (
        <div style={{ minHeight: "100vh", padding: "60px 24px", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 660, margin: "0 auto" }}>
            <button onClick={() => setSelectedHobby(null)}
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.50)", fontSize: 14, cursor: "pointer", marginBottom: 36, padding: 0, display: "flex", alignItems: "center", gap: 8, transition: "color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.color = BL}
              onMouseOut={e => e.currentTarget.style.color = "rgba(228,238,255,0.3)"}>
              ← Back to all 5 results
            </button>

            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 58, marginBottom: 14 }}>{selectedHobby.emoji}</div>
              <h2 style={{ fontSize: "clamp(26px, 4.5vw, 42px)", fontWeight: 700, marginBottom: 8 }}>{selectedHobby.name}</h2>
              <p style={{ color: BL, fontSize: 14, fontStyle: "italic", marginBottom: 10 }}>{selectedHobby.tagline}</p>
              <p style={{ color: "rgba(228,238,255,0.46)", fontSize: 14, lineHeight: 1.75, maxWidth: 480, margin: "0 auto" }}>{selectedHobby.whyYou}</p>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              {[["💰 Budget", selectedHobby.budget], ["⏱️ Time", selectedHobby.timeCommitment], ["📊 Level", selectedHobby.difficulty]].map(([label, val]) => (
                <div key={label} style={{ flex: 1, minWidth: 120, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.48)", marginBottom: 5 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: BL }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 18, color: BL, letterSpacing: "0.15em" }}>🛒 STARTER KIT</h3>
              {selectedHobby.starterKit?.map((item, i) => (
                <div key={i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: i < selectedHobby.starterKit.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{item.item}</span>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 10, alignItems: "center" }}>
                      <span style={{ color: BL, fontWeight: 700, fontSize: 13 }}>est. {item.price}</span>
                      <a href={`https://www.amazon.com/s?k=${encodeURIComponent(item.item)}&tag=findmyhobby06-20`} target="_blank" rel="noopener noreferrer"
  style={{ background: BD, border: `1px solid ${BB}`, color: BL, padding: "4px 11px", borderRadius: 100, fontSize: 11, cursor: "pointer", textDecoration: "none" }}>
  Amazon →
</a>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.5 }}>{item.note}</p>
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 18, color: BL, letterSpacing: "0.15em" }}>📅 FIRST WEEK PLAN</h3>
              {selectedHobby.firstWeek?.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: BD, border: `1px solid ${BB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: BL, flexShrink: 0, fontWeight: 700 }}>{i + 1}</div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.76)", paddingTop: 2 }}>{step}</p>
                </div>
              ))}
            </div>

            {plan === "deep" && selectedHobby.thirtyDayPlan && (
              <div style={cardStyle}>
                <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 18, color: BL, letterSpacing: "0.15em" }}>🗓️ 30-DAY PLAN</h3>
                {selectedHobby.thirtyDayPlan.map((week, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: BD, border: `1px solid ${BB}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: BL, flexShrink: 0, fontWeight: 700 }}>W{i+1}</div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.76)", paddingTop: 2 }}>{week}</p>
                  </div>
                ))}
              </div>
            )}

            {plan === "deep" && selectedHobby.commonMistakes && (
              <div style={cardStyle}>
                <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 18, color: BL, letterSpacing: "0.15em" }}>⚠️ MISTAKES TO AVOID</h3>
                {selectedHobby.commonMistakes.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ color: "#F87171", fontSize: 13, flexShrink: 0, marginTop: 2 }}>✗</span>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.74)" }}>{m}</p>
                  </div>
                ))}
              </div>
            )}

            {plan === "deep" && selectedHobby.levelUpSign && (
              <div style={{ ...cardStyle, background: BD, border: `1px solid ${BB}` }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: BL, letterSpacing: "0.15em" }}>🚀 WHEN TO LEVEL UP</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.80)" }}>{selectedHobby.levelUpSign}</p>
              </div>
            )}

            {selectedHobby.proTip && (
              <div style={{ background: "rgba(75,127,245,0.07)", border: `1px solid ${BB}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 14, color: BL, lineHeight: 1.7 }}>
                  <span style={{ fontWeight: 700 }}>💡 Pro tip: </span>{selectedHobby.proTip}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setSelectedHobby(null)}
                style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.72)", padding: "13px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ← See All 5
              </button>
              <button onClick={resetAll}
                style={{ flex: 2, background: `linear-gradient(135deg, ${B}, #2550CC)`, border: "none", color: "#fff", padding: "13px", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 28px ${BG}` }}>
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    {/* FOOTER */}
    {screen === "landing" && (
      <footer style={{ textAlign: "center", padding: "24px", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 8px" }}>© 2025 FindMyHobby. All rights reserved.</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          <button onClick={() => setModal("privacy")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</button>
          <button onClick={() => setModal("terms")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Terms of Service</button>
          <button onClick={() => setModal("refund")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Refund Policy</button>
        </div>
      </footer>
    )}

    {/* MODALS */}
    {modal && (
      <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#0D1526", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "36px", maxWidth: 600, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
          <button onClick={() => setModal(null)} style={{ float: "right", background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer" }}>✕</button>

          {modal === "privacy" && <>
            <h2 style={{ color: "#92BFFF", marginBottom: 8 }}>Privacy Policy</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 13, marginBottom: 20 }}>Last updated: March 2026</p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>Your privacy matters to us. FindMyHobby.org ("we", "us") operates findmyhobby.org. We collect only what is necessary to provide our service and do not sell your data to third parties.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Information We Collect</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>We collect your quiz answers to generate personalised hobby recommendations. Payments are processed securely by Stripe — we never store your card details. We may collect your email address if you opt in to save your results. We collect anonymised, aggregated usage data to improve the site.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>How We Use Your Information</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>Your quiz answers are sent to Anthropic's Claude API solely to generate your results. We do not store your answers beyond your session unless you explicitly opt in. We use aggregated, anonymised data to improve recommendation quality over time.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Third-Party Services</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>We use Stripe (payments), Anthropic (AI generation), Vercel (hosting), and Amazon Associates (affiliate links). Each operates under its own privacy policy. Clicking Amazon affiliate links may result in us earning a small commission at no extra cost to you.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Cookies & Tracking</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>We use session storage to temporarily hold your quiz answers during your visit. This is cleared when you close the tab. We do not use advertising cookies or cross-site trackers.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Your Rights</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>You have the right to access, correct, or request deletion of any personal data we hold about you. Email us and we will respond within 30 days.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Children's Privacy</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>FindMyHobby.org is not directed at children under 13. We do not knowingly collect data from children under 13.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Data Security</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>We use HTTPS encryption and secure API key management via Vercel environment variables. No internet transmission is 100% secure, but we take all reasonable measures to protect your data.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Contact</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>For privacy questions: support@findmyhobby.org</p>
          </>}

          {modal === "terms" && <>
            <h2 style={{ color: "#92BFFF", marginBottom: 8 }}>Terms of Service</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 13, marginBottom: 20 }}>Last updated: March 2026</p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>By accessing or using FindMyHobby.org (the "Service"), you agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>The Service</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>FindMyHobby.org provides AI-powered hobby recommendations in three tiers: Free (basic suggestions), Basic ($1.99 one-time), and Deep Research ($3.99 one-time). Results are for your personal, non-commercial use only.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Eligibility</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>You must be at least 13 years old to use the Service. Users under 18 must have parental or guardian consent.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Payments & Billing</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>All payments are one-time fees processed securely by Stripe, Inc. Prices are in USD. There are no subscriptions or recurring charges. We do not store your card details — all payment data is handled by Stripe, which is PCI-DSS compliant.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>AI-Generated Content Disclaimer</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>Recommendations are generated by AI and may occasionally be incomplete or not suited to your specific circumstances. All suggestions should be independently verified before making purchasing decisions or lifestyle changes.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Affiliate Links</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>FindMyHobby.org participates in the Amazon Services LLC Associates Programme. We may earn a commission on qualifying purchases at no extra cost to you. Affiliate relationships do not influence our AI recommendations.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Prohibited Uses</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>You may not scrape or extract data from the Service, resell or redistribute results, attempt to reverse-engineer our systems, or use the Service for any unlawful purpose.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Limitation of Liability</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>To the fullest extent permitted by law, FindMyHobby.org shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 30 days preceding any claim.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Changes to These Terms</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>We may update these Terms at any time. Continued use of the Service after changes constitutes your acceptance of the revised Terms.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Contact</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>Questions about these Terms: support@findmyhobby.org</p>
          </>}

          {modal === "refund" && <>
            <h2 style={{ color: "#92BFFF", marginBottom: 8 }}>Refund Policy</h2>
            <p style={{ color: "rgba(255,255,255,0.45)", lineHeight: 1.8, fontSize: 13, marginBottom: 20 }}>Last updated: March 2026</p>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14, marginBottom: 16 }}>We want you to be genuinely satisfied with your FindMyHobby experience. Because results are delivered instantly as digital content, our refund policy is designed to be fair for both sides.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>You Are Eligible for a Full Refund If:</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>• Your results were not generated due to a technical error on our end.<br/>• You were charged but never received access to your paid results.<br/>• You were charged more than once for the same purchase.<br/>• You are a first-time user genuinely unsatisfied with your results — request within 7 days of purchase.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Refunds Will Not Be Issued If:</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>• You changed your mind after receiving complete, fully generated results.<br/>• More than 14 days have passed since the date of purchase.<br/>• You have previously received a refund from FindMyHobby.org.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Upgrades</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>If you purchased Basic ($1.99) and want to upgrade to Deep Research ($3.99), email us and we will credit your $1.99 — you only pay the $2.00 difference.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>How to Request a Refund</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>Email support@findmyhobby.org with your purchase email, date of purchase, amount charged, and a brief description of the issue. We respond within 2 business days. Approved refunds are returned to your original payment method within 5–10 business days.</p>
            <h3 style={{ color: "#92BFFF", marginTop: 20, marginBottom: 8 }}>Payment Processing</h3>
            <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8, fontSize: 14 }}>All refunds are processed through Stripe back to your original payment method. We do not have access to your full card details and cannot process refunds outside of the Stripe system.</p>
          </>}
        </div>
      </div>
    )}

    </div>
  );
}
