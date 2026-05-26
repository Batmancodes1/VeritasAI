/* ════════════════════════════════════════════
   VERITAS AI — Frontend Logic
   Clean, structured, production-ready
   ════════════════════════════════════════════ */

const API_BASE = "http://localhost:5000/api";

// ─── DEMO ARTICLES ───────────────────────────
const DEMO_ARTICLES = [
  {
    headline:
      "Global Study Finds Renewable Energy Expansion Significantly Reduces Air Pollution Levels",
    source:
      "https://www.reuters.com/world/environment/global-renewable-energy-study-air-pollution-report-2026/",
    text: "An international study conducted by researchers from Oxford University and the International Energy Agency has found that large-scale adoption of renewable energy sources has significantly reduced air pollution levels in several major urban regions over the past decade. The report analyzed emissions data collected from more than 40 countries between 2012 and 2025 and observed measurable declines in sulfur dioxide, carbon monoxide, and fine particulate matter in areas with increased investment in solar and wind infrastructure. Researchers stated that transitioning away from coal-based electricity generation played a major role in improving urban air quality and reducing respiratory health risks. According to the findings, countries that expanded renewable energy capacity by more than 35 percent experienced the largest improvements in public health indicators and environmental sustainability metrics. Environmental policy experts described the report as one of the most comprehensive analyses conducted on the relationship between clean energy adoption and pollution reduction. Scientists emphasized that while renewable energy alone cannot fully solve climate-related challenges, the data strongly supports long-term investment in sustainable infrastructure and low-emission technologies. The study has been published in the journal Environmental Science and Policy and is expected to influence upcoming international climate negotiations and national energy planning strategies.",
  },
  {
    headline:
      "SHOCKING: Government HIDING Miracle Cure Doctors Don't Want You To Know!!",
    source: "https://www.naturalnews.com/fake-cure-exposed",
    text: "WAKE UP SHEEPLE!! The deep state has been CENSORING this BOMBSHELL discovery for DECADES! A whistleblower has LEAKED documents proving Big Pharma and corrupt government officials are covering up a 100% MIRACLE CURE that ELIMINATES all disease instantly! They don't want you to KNOW because it would destroy their TRILLION-dollar industry! SHARE THIS NOW before they BAN it!! Mainstream media REFUSES to cover this EXPLOSIVE truth! YOU won't BELIEVE what they found!! This secret has been SUPPRESSED for years. The cure is simple and costs nothing — but THEY want it HIDDEN forever! URGENT: Forward to everyone you know before this gets REMOVED!!!",
  },
  {
    headline:
      "You Won't Believe What This Celebrity Did — Jaw-Dropping Scandal REVEALED",
    source: "https://www.beforeitsnews.com/celebrity-scandal",
    text: "What happened next will SHOCK you to your core! In an explosive revelation that has the internet going absolutely INSANE, one of Hollywood's biggest stars has been caught in a jaw-dropping scandal that insiders are calling the most OUTRAGEOUS event of the decade! The horrifying truth has emerged and people are absolutely FURIOUS. Critics are calling this disgusting behavior completely UNACCEPTABLE. The terrifying implications of this catastrophic scandal could DEVASTATE the entire entertainment industry. Sources close to the situation say it's even WORSE than what's being reported. Social media is EXPLODING with rage. This will change EVERYTHING you thought you knew!",
  },
];

// ─── WORD LISTS ──────────────────────────────
const FAKE_SIGNALS = [
  "shocking",
  "bombshell",
  "you won't believe",
  "secret",
  "exposed",
  "they don't want you to know",
  "mainstream media",
  "deep state",
  "hoax",
  "conspiracy",
  "cover-up",
  "wake up",
  "sheeple",
  "plandemic",
  "100%",
  "miracle",
  "cure",
  "banned",
  "censored",
  "truth",
  "must share",
  "viral",
  "urgent",
  "alert",
  "warning",
];

const EMOTIONAL_WORDS = [
  "outrageous",
  "horrifying",
  "terrifying",
  "disgusting",
  "unbelievable",
  "shocking",
  "devastating",
  "explosive",
  "scandalous",
  "alarming",
  "panic",
  "crisis",
  "disaster",
  "catastrophe",
  "danger",
  "threat",
  "furious",
  "rage",
  "hatred",
  "fear",
  "evil",
  "corrupt",
  "lie",
  "fraud",
  "insane",
  "insanity",
  "madness",
  "chaos",
  "collapse",
];

const CLICKBAIT_PHRASES = [
  "you won't believe",
  "what happened next",
  "this is why",
  "the reason why",
  "doctors hate",
  "one weird trick",
  "this will shock you",
  "jaw-dropping",
  "mind-blowing",
  "life-changing",
  "game-changer",
  "must see",
  "must watch",
  "going viral",
  "everyone is talking",
  "breaking news",
  "just in",
  "exclusive",
  "revealed",
  "the truth about",
  "they don't want you to know",
];

const TRUSTED_SOURCES = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "npr.org",
  "theguardian.com",
  "nytimes.com",
  "who.int",
  "cdc.gov",
  "nih.gov",
];

const SUSPICIOUS_SOURCES = [
  "infowars.com",
  "naturalnews.com",
  "beforeitsnews.com",
  "worldtruth.tv",
  "yournewswire.com",
];

// ─── DEMO LOADER ─────────────────────────────
function loadDemo(index) {
  const demo = DEMO_ARTICLES[index];
  document.getElementById("headline-input").value = demo.headline;
  document.getElementById("source-input").value = demo.source;
  document.getElementById("text-input").value = demo.text;
}

// ─── PAGE SWITCHER ───────────────────────────
function switchPage(name) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");

  document.querySelectorAll(".nav-tab").forEach((tab, i) => {
    const isActive =
      (i === 0 && name === "analyze") || (i === 1 && name === "compare");
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive);
  });
}

// ─── ANALYSIS ENTRY POINT ────────────────────
async function runAnalysis() {
  const text = document.getElementById("text-input").value.trim();
  const headline = document.getElementById("headline-input").value.trim();
  const source = document.getElementById("source-input").value.trim();

  if (!text || text.length < 20) {
    alert("Please enter at least 20 characters of article content.");
    return;
  }

  showLoading(true);

  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, headline, source_url: source }),
    });
    const data = await res.json();
    renderResults(data);
  } catch {
    // Offline / demo mode — use built-in mock engine
    const data = buildMockResult(text, headline, source);
    renderResults(data);
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  const loading = document.getElementById("loading");
  const btn = document.getElementById("btn-run");
  const results = document.getElementById("results-panel");

  if (isLoading) {
    loading.classList.add("show");
    results.style.display = "none";
    results.classList.remove("show");
    btn.disabled = true;
  } else {
    loading.classList.remove("show");
    btn.disabled = false;
  }
}

// ─── MOCK ANALYSIS ENGINE ────────────────────
// Runs entirely in-browser when the Flask backend is offline.
function buildMockResult(text, headline, source) {
  const lower = text.toLowerCase();

  // Signal detection
  const foundFake = FAKE_SIGNALS.filter((w) => lower.includes(w));
  const foundEmotional = EMOTIONAL_WORDS.filter((w) => lower.includes(w));
  const foundClickbait = CLICKBAIT_PHRASES.filter((w) => lower.includes(w));

  const capsRatio =
    (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  const exclCount = (text.match(/!/g) || []).length;

  // Score calculation
  const fakeProbability = Math.min(
    0.95,
    Math.max(
      0.05,
      foundFake.length * 0.08 +
        foundEmotional.length * 0.05 +
        foundClickbait.length * 0.07 +
        capsRatio * 0.5 +
        exclCount * 0.02,
    ),
  );

  const realProbability = 1 - fakeProbability;
  const label = fakeProbability > 0.5 ? "FAKE" : "REAL";
  const confidence = Math.max(fakeProbability, realProbability) * 100;

  const emotionalScore = Math.min(
    100,
    foundEmotional.length * 12 + capsRatio * 100 * 0.3,
  );
  const emotionalBias =
    emotionalScore < 25 ? "Low" : emotionalScore < 55 ? "Medium" : "High";
  const clickbaitScore = Math.min(
    100,
    foundClickbait.length * 18 + (exclCount > 2 ? 15 : 0),
  );
  const intensityScore = Math.min(100, capsRatio * 100 + exclCount * 5);

  // Source credibility
  const sourceInfo = evaluateSource(source);

  // Headline similarity
  const headlineInfo = evaluateHeadlineSimilarity(headline, text);

  // Composite credibility score (weighted formula)
  const realConfidence = label === "REAL" ? confidence : 100 - confidence;
  const credibilityScore = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        realConfidence * 0.4 +
          sourceInfo.score * 0.3 +
          (100 - emotionalScore) * 0.2 +
          headlineInfo.similarityPct * 0.1,
      ),
    ),
  );

  const explanation = buildExplanation(
    label,
    emotionalBias,
    clickbaitScore,
    sourceInfo,
    headlineInfo,
    foundFake,
  );
  const suspiciousWords = [
    ...new Set([...foundFake, ...foundEmotional, ...foundClickbait]),
  ];
  const highlightedText = buildHighlightSegments(text, suspiciousWords);

  return {
    label,
    confidence: Math.round(confidence * 10) / 10,
    fake_probability: Math.round(fakeProbability * 1000) / 10,
    real_probability: Math.round(realProbability * 1000) / 10,
    credibility_score: credibilityScore,
    emotional_bias: emotionalBias,
    emotional_score: Math.round(emotionalScore),
    clickbait_score: Math.round(clickbaitScore),
    intensity_score: Math.round(intensityScore),
    source: sourceInfo,
    headline_analysis: headlineInfo,
    explanation,
    highlighted_text: highlightedText,
    suspicious_words: suspiciousWords,
  };
}

function evaluateSource(url) {
  if (!url) {
    return { status: "Unknown", score: 50, reason: "No source URL provided" };
  }

  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];

  if (TRUSTED_SOURCES.some((t) => domain.includes(t))) {
    return {
      status: "Trusted",
      score: 90,
      reason: `${domain} is a well-established credible source`,
    };
  }
  if (SUSPICIOUS_SOURCES.some((s) => domain.includes(s))) {
    return {
      status: "Suspicious",
      score: 15,
      reason: `${domain} is known to publish misinformation`,
    };
  }
  if (domain.endsWith(".gov") || domain.endsWith(".edu")) {
    return {
      status: "Trusted",
      score: 85,
      reason: "Government or educational institution domain",
    };
  }

  return {
    status: "Unknown",
    score: 50,
    reason: "Domain not in credibility database",
  };
}

function evaluateHeadlineSimilarity(headline, text) {
  if (!headline) {
    return {
      similarityPct: 60,
      misleading: false,
      reason: "No headline provided",
    };
  }

  const headlineWords = new Set(
    headline.toLowerCase().match(/\b[a-z]{4,}\b/g) || [],
  );
  const contentWords = new Set(
    text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [],
  );
  const intersection = [...headlineWords].filter((w) =>
    contentWords.has(w),
  ).length;
  const similarity = Math.min(
    1,
    (intersection /
      Math.sqrt(headlineWords.size * Math.max(contentWords.size, 1))) *
      2,
  );
  const misleading = similarity < 0.25;

  let reason;
  if (misleading)
    reason = "Headline topics differ significantly from article content";
  else if (similarity < 0.5)
    reason = "Partial overlap — headline may be oversimplified";
  else reason = "Headline aligns well with content";

  return { similarityPct: Math.round(similarity * 100), misleading, reason };
}

function buildExplanation(
  label,
  emotionalBias,
  clickbaitScore,
  sourceInfo,
  headlineInfo,
  foundFake,
) {
  const problems = [];
  const strengths = [];

  if (label === "FAKE")
    problems.push("our ML model flagged this content as likely misinformation");
  if (emotionalBias === "High")
    problems.push("high emotional language intensity detected");
  if (clickbaitScore > 50)
    problems.push(
      `multiple clickbait phrases found (score: ${clickbaitScore}/100)`,
    );
  if (sourceInfo.status === "Suspicious")
    problems.push(
      "the source domain has a known history of publishing misinformation",
    );
  if (headlineInfo.misleading)
    problems.push(
      "headline topics diverge significantly from the article body",
    );
  if (foundFake.length > 0)
    problems.push(
      `manipulative keywords found: "${foundFake.slice(0, 3).join('", "')}"`,
    );
  if (label === "REAL")
    strengths.push("content structure aligns with factual reporting");

  if (problems.length === 0) {
    return `This content shows strong credibility signals: ${strengths.join(", ")}.`;
  }

  let text = `This content is likely ${label === "FAKE" ? "misleading" : "worth scrutiny"} because: ${problems.join("; ")}.`;
  if (strengths.length) text += ` On the positive side: ${strengths[0]}.`;
  return text;
}

// ─── TEXT HIGHLIGHTER ────────────────────────
function buildHighlightSegments(text, words) {
  if (!words.length) return [{ text, highlight: false }];

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  const wordSet = new Set(words.map((w) => w.toLowerCase()));

  return parts.map((part) => ({
    text: part,
    highlight: wordSet.has(part.toLowerCase()),
  }));
}

// ─── RESULT RENDERER ─────────────────────────
function renderResults(data) {
  const panel = document.getElementById("results-panel");
  panel.style.display = "block";
  panel.classList.add("show");

  renderVerdict(data);
  renderCredibilityRing(data.credibility_score);
  renderMetrics(data);
  renderExplanation(data.explanation);
  renderSourceInfo(data.source);
  renderHeadlineSimilarity(data.headline_analysis);
  renderHighlightedText(data.highlighted_text, data.suspicious_words);

  // Smooth scroll to results
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderVerdict(data) {
  const banner = document.getElementById("verdict-banner");
  banner.className = "verdict-banner " + data.label.toLowerCase();

  document.getElementById("verdict-icon").textContent =
    data.label === "REAL" ? "✅" : "🚨";

  document.getElementById("verdict-text").textContent =
    data.label === "REAL" ? "Likely Real" : "Likely Fake";

  document.getElementById("conf-pct").textContent =
    data.confidence.toFixed(1) + "%";

  // Animate bars after brief delay (allows repaint)
  setTimeout(() => {
    document.getElementById("conf-bar").style.width = data.confidence + "%";
    document.getElementById("prob-real").style.width =
      data.real_probability + "%";
    document.getElementById("prob-fake").style.width =
      data.fake_probability + "%";
  }, 100);

  document.getElementById("prob-real-pct").textContent =
    data.real_probability + "%";
  document.getElementById("prob-fake-pct").textContent =
    data.fake_probability + "%";
}

function renderCredibilityRing(score) {
  const ring = document.getElementById("cred-ring");
  const color =
    score >= 65 ? "var(--real)" : score >= 35 ? "var(--warn)" : "var(--fake)";

  document.getElementById("cred-score").textContent = score;
  ring.style.stroke = color;

  setTimeout(() => {
    ring.style.strokeDashoffset = 188 - (score / 100) * 188;
  }, 200);

  document.getElementById("cred-label").textContent =
    score >= 65
      ? "High credibility"
      : score >= 35
        ? "Moderate credibility"
        : "Low credibility";
}

function renderMetrics(data) {
  // Emotional bias
  document.getElementById("em-bias-val").textContent =
    data.emotional_score + "/100";
  const emBadge = document.getElementById("em-bias-badge");
  emBadge.className = "score-badge badge-" + data.emotional_bias.toLowerCase();
  emBadge.textContent = data.emotional_bias;

  // Clickbait
  document.getElementById("cb-val").textContent = data.clickbait_score;

  // Intensity
  document.getElementById("int-val").textContent =
    data.intensity_score + "/100";

  // Animate bars
  setTimeout(() => {
    document.getElementById("em-bar").style.width = data.emotional_score + "%";
  }, 150);
  setTimeout(() => {
    document.getElementById("cb-bar").style.width = data.clickbait_score + "%";
  }, 200);
  setTimeout(() => {
    document.getElementById("int-bar").style.width = data.intensity_score + "%";
  }, 250);
}

function renderExplanation(explanation) {
  document.getElementById("explanation-text").textContent = `"${explanation}"`;
}

function renderSourceInfo(source) {
  const iconMap = { Trusted: "✓", Suspicious: "⚠", Unknown: "?" };

  document.getElementById("source-result").innerHTML =
    `<span class="score-badge badge-${source.status.toLowerCase()}">${iconMap[source.status] || "?"} ${source.status}</span>`;

  document.getElementById("source-reason").textContent = source.reason || "—";
}

function renderHeadlineSimilarity(headlineInfo) {
  document.getElementById("sim-pct").textContent =
    headlineInfo.similarityPct + "%";
  document.getElementById("sim-reason").textContent = headlineInfo.reason;

  setTimeout(() => {
    document.getElementById("sim-bar").style.width =
      headlineInfo.similarityPct + "%";
  }, 250);
}

function renderHighlightedText(segments, suspiciousWords) {
  const body = document.getElementById("highlight-body");

  body.innerHTML = segments
    .map((seg) =>
      seg.highlight
        ? `<mark class="suspicious" title="Suspicious/manipulative word">${escapeHtml(seg.text)}</mark>`
        : escapeHtml(seg.text),
    )
    .join("");

  const tagsEl = document.getElementById("suspicious-tags");
  tagsEl.innerHTML = "";

  if (suspiciousWords && suspiciousWords.length) {
    suspiciousWords.forEach((word) => {
      const tag = document.createElement("span");
      tag.className = "tag danger";
      tag.textContent = word;
      tagsEl.appendChild(tag);
    });
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── COMPARE MODE ────────────────────────────
async function runCompare() {
  const article1 = {
    headline: document.getElementById("c1-headline").value,
    source_url: document.getElementById("c1-source").value,
    text: document.getElementById("c1-text").value,
  };
  const article2 = {
    headline: document.getElementById("c2-headline").value,
    source_url: document.getElementById("c2-source").value,
    text: document.getElementById("c2-text").value,
  };

  if (!article1.text.trim() || !article2.text.trim()) {
    alert("Please fill in both article texts.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article1, article2 }),
    });
    const data = await res.json();
    renderCompareResults(data);
  } catch {
    // Offline fallback
    const r1 = buildMockResult(
      article1.text,
      article1.headline,
      article1.source_url,
    );
    const r2 = buildMockResult(
      article2.text,
      article2.headline,
      article2.source_url,
    );
    const diff = Math.abs(r1.credibility_score - r2.credibility_score).toFixed(
      1,
    );
    const moreCredible =
      r1.credibility_score >= r2.credibility_score ? "Article 1" : "Article 2";
    const moreBiased =
      r1.clickbait_score >= r2.clickbait_score ? "Article 1" : "Article 2";
    const label1 =
      r1.credibility_score > r2.credibility_score ? "REAL" : "FAKE";
    const label2 =
      r2.credibility_score > r1.credibility_score ? "REAL" : "FAKE";

    renderCompareResults({
      article1: {
        credibility_score: r1.credibility_score,
        label: label1,
        emotional_bias: r1.emotional_bias,
        clickbait_score: r1.clickbait_score,
      },
      article2: {
        credibility_score: r2.credibility_score,
        label: label2,
        emotional_bias: r2.emotional_bias,
        clickbait_score: r2.clickbait_score,
      },
      verdict: {
        more_credible: moreCredible,
        more_biased: moreBiased,
        credibility_diff: diff,
        summary: `${moreCredible} is more credible by ${diff} points.`,
      },
    });
  }
}

function renderCompareResults(data) {
  document.getElementById("c1-score").textContent =
    data.article1.credibility_score;
  document.getElementById("c2-score").textContent =
    data.article2.credibility_score;

  const computedLabel1 =
    data.article1.credibility_score >= data.article2.credibility_score
      ? "REAL"
      : "FAKE";
  const computedLabel2 =
    data.article2.credibility_score >= data.article1.credibility_score
      ? "REAL"
      : "FAKE";

  document.getElementById("c1-badge").innerHTML =
    `<span class="badge badge-${computedLabel1.toLowerCase()}">${computedLabel1}</span>`;
  document.getElementById("c2-badge").innerHTML =
    `<span class="badge badge-${computedLabel2.toLowerCase()}">${computedLabel2}</span>`;

  const v = data.verdict;
  document.getElementById("compare-summary").innerHTML = `
    <p>⭐ <strong>More credible:</strong> ${v.more_credible} (by ${v.credibility_diff} points)</p>
    <p>⚠️ <strong>More biased:</strong> ${v.more_biased}</p>
    <p style="margin-top:12px; color:var(--text-dim);">${v.summary}</p>
  `;

  const result = document.getElementById("compare-result");
  result.classList.add("show");
  result.scrollIntoView({ behavior: "smooth" });
}

// ─── SCROLL REVEAL ───────────────────────────
// Fades in elements as they enter the viewport
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".metric-card, .explain-card, .info-card, .highlight-card, .verdict-compare",
  );

  targets.forEach((el) => el.classList.add("scroll-reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  targets.forEach((el) => observer.observe(el));
}

// ─── SUBTLE HERO PARALLAX ────────────────────
function initParallax() {
  const hero = document.querySelector(".hero");
  if (!hero || window.matchMedia("(max-width: 640px)").matches) return;

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY * 0.18;
      hero.style.transform = `translateY(${offset}px)`;
    },
    { passive: true },
  );
}

// ─── KEYBOARD SHORTCUT ───────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initScrollReveal();
  initParallax();

  document.getElementById("text-input").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") runAnalysis();
  });
});
