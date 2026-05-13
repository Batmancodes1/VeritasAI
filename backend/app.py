"""
VeritasAI — Flask Backend
Loads the real TF-IDF + LogisticRegression model (model.pkl) when available,
falls back to the rule-based engine if not trained yet.

Run:  python app.py
Then: open frontend/index.html
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import math
import os
import pickle
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────────────────────────
# MODEL LOADING
# Tries to load the real trained pipeline from train_model.py.
# If model.pkl doesn't exist yet, uses the rule-based fallback.
# ─────────────────────────────────────────────────────────────────

MODEL = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def load_model():
    global MODEL
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            MODEL = pickle.load(f)
        print("✅ Loaded trained model from model.pkl — using real ML predictions")
    else:
        print("⚠️  model.pkl not found — using rule-based fallback engine")
        print("   To train: download Fake.csv + True.csv from Kaggle, then run: python train_model.py")

load_model()

# ─────────────────────────────────────────────────────────────────
# WORD LISTS
# ─────────────────────────────────────────────────────────────────

FAKE_SIGNALS = [
    "shocking", "bombshell", "you won't believe", "secret", "exposed",
    "they don't want you to know", "mainstream media", "deep state",
    "hoax", "conspiracy", "cover-up", "wake up", "sheeple", "plandemic",
    "100%", "miracle", "cure", "banned", "censored", "truth", "must share",
    "viral", "breaking", "urgent", "alert", "warning", "proof",
    "undeniable", "irrefutable", "leaked", "whistleblower",
]

EMOTIONAL_WORDS = [
    "outrageous", "horrifying", "terrifying", "disgusting", "unbelievable",
    "shocking", "devastating", "explosive", "scandalous", "alarming",
    "panic", "crisis", "disaster", "catastrophe", "danger", "threat",
    "furious", "rage", "hatred", "fear", "evil", "corrupt", "lie", "fraud",
    "insane", "insanity", "madness", "chaos", "collapse",
]

CLICKBAIT_PHRASES = [
    "you won't believe", "what happened next", "this is why", "the reason why",
    "doctors hate", "one weird trick", "this will shock you", "jaw-dropping",
    "mind-blowing", "life-changing", "game-changer", "must see", "must watch",
    "going viral", "everyone is talking", "breaking news", "just in",
    "exclusive", "revealed", "the truth about", "they don't want you to know",
]

TRUSTED_DOMAINS = [
    "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "npr.org",
    "theguardian.com", "nytimes.com", "washingtonpost.com", "economist.com",
    "nature.com", "science.org", "who.int", "cdc.gov", "nih.gov",
    "harvard.edu", "mit.edu", "stanford.edu", "britannica.com",
    "pbs.org", "theatlantic.com", "scientificamerican.com",
]

SUSPICIOUS_DOMAINS = [
    "infowars.com", "naturalnews.com", "beforeitsnews.com", "worldtruth.tv",
    "yournewswire.com", "newspunch.com", "zerohedge.com", "breitbart.com",
    "thegatewaypundit.com", "activistpost.com", "collective-evolution.com",
    "geopolitics.co", "veteranstoday.com",
]

# ─────────────────────────────────────────────────────────────────
# TEXT PREPROCESSOR (mirrors train_model.py so vectorizer input matches)
# ─────────────────────────────────────────────────────────────────

def preprocess(text):
    text = str(text).lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ─────────────────────────────────────────────────────────────────
# ML PREDICTION — real model or rule-based fallback
# ─────────────────────────────────────────────────────────────────

def ml_predict(text, headline=""):
    """
    Returns (label, fake_prob, real_prob, confidence).
    Uses real sklearn pipeline when available.
    """
    if MODEL is not None:
        combined = preprocess(headline + " " + text)
        probs = MODEL.predict_proba([combined])[0]
        fake_prob, real_prob = float(probs[1]), float(probs[0])
        label = "FAKE" if fake_prob > 0.5 else "REAL"
        confidence = max(fake_prob, real_prob) * 100
        return label, fake_prob, real_prob, confidence

    # Rule-based fallback
    lower = text.lower()
    fake_count = sum(1 for s in FAKE_SIGNALS if s in lower)
    em_count   = sum(1 for w in EMOTIONAL_WORDS if w in lower)
    cb_count   = sum(1 for p in CLICKBAIT_PHRASES if p in lower)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    excl_count = text.count("!")

    fake_prob = min(0.95, max(0.05,
        fake_count * 0.08 +
        em_count   * 0.05 +
        cb_count   * 0.07 +
        caps_ratio * 0.50 +
        excl_count * 0.02
    ))
    real_prob  = 1 - fake_prob
    label      = "FAKE" if fake_prob > 0.5 else "REAL"
    confidence = max(fake_prob, real_prob) * 100
    return label, fake_prob, real_prob, confidence

# ─────────────────────────────────────────────────────────────────
# NLP ANALYSIS MODULES
# ─────────────────────────────────────────────────────────────────

def analyze_text(text, headline=""):
    lower      = text.lower()
    words      = text.split()
    word_count = len(words)

    label, fake_prob, real_prob, confidence = ml_predict(text, headline)

    emotional_matches = [w for w in EMOTIONAL_WORDS if w in lower]
    clickbait_matches = [p for p in CLICKBAIT_PHRASES if p in lower]
    fake_matches      = [s for s in FAKE_SIGNALS if s in lower]

    caps_ratio      = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    excl_count      = text.count("!")
    intensity_score = min(caps_ratio * 100 + excl_count * 5, 100)
    clickbait_score = min(len(clickbait_matches) * 15 + (5 if text.count("?") > 2 else 0), 100)
    emotional_score = min(len(emotional_matches) * 10 + intensity_score * 0.3, 100)
    emotional_bias  = "Low" if emotional_score < 25 else "Medium" if emotional_score < 55 else "High"

    suspicious_words = list(set(fake_matches + emotional_matches + clickbait_matches))

    return {
        "label":                   label,
        "fake_probability":        round(fake_prob  * 100, 1),
        "real_probability":        round(real_prob  * 100, 1),
        "confidence":              round(confidence, 1),
        "emotional_bias":          emotional_bias,
        "emotional_score":         round(emotional_score, 1),
        "clickbait_score":         round(clickbait_score, 1),
        "intensity_score":         round(intensity_score, 1),
        "suspicious_words":        suspicious_words,
        "emotional_words_found":   emotional_matches,
        "clickbait_phrases_found": clickbait_matches,
        "word_count":              word_count,
        "using_real_model":        MODEL is not None,
    }


def check_source_credibility(url):
    if not url or not url.strip():
        return {"status": "Unknown", "score": 50, "reason": "No source URL provided"}
    try:
        domain = urlparse(url).netloc.lower().replace("www.", "")
    except Exception:
        return {"status": "Unknown", "score": 50, "reason": "Invalid URL format"}

    if any(t in domain for t in TRUSTED_DOMAINS):
        return {"status": "Trusted",    "score": 90, "reason": f"{domain} is a well-established credible source"}
    if any(s in domain for s in SUSPICIOUS_DOMAINS):
        return {"status": "Suspicious", "score": 15, "reason": f"{domain} is known to publish misinformation"}
    if domain.endswith(".gov") or domain.endswith(".edu"):
        return {"status": "Trusted",    "score": 85, "reason": "Government or educational institution"}
    if any(x in domain for x in ["news", "press", "media", "times", "post", "herald"]):
        return {"status": "Unknown",    "score": 55, "reason": "News-like domain but not in verified list"}
    return {"status": "Unknown", "score": 45, "reason": "Domain not in credibility database"}


def compute_headline_similarity(headline, content):
    if not headline or not content:
        return {"similarity": 1.0, "similarity_pct": 60, "misleading": False, "reason": "No headline provided"}

    STOPWORDS = {
        "the","and","for","are","but","not","you","all","can","had","her",
        "was","one","our","out","day","get","has","him","his","how","its",
        "may","new","now","old","see","two","way","who","did","this","that",
        "with","have","from","they","will","been","more","when","said","each",
        "she","which","their","there","were","about","what","into","than",
    }

    def tokenize(text):
        return set(re.findall(r'\b[a-z]{3,}\b', text.lower())) - STOPWORDS

    h_words = tokenize(headline)
    c_words = tokenize(content)
    if not h_words or not c_words:
        return {"similarity": 0.5, "similarity_pct": 50, "misleading": False, "reason": "Insufficient words"}

    intersection = h_words & c_words
    similarity   = min((len(intersection) / math.sqrt(len(h_words) * len(c_words))) * 2, 1.0)
    misleading   = similarity < 0.25

    if misleading:          reason = "Headline topics differ significantly from article content"
    elif similarity < 0.5:  reason = "Partial overlap — headline may be oversimplified"
    else:                   reason = "Headline aligns well with content"

    return {
        "similarity":     round(similarity, 3),
        "similarity_pct": round(similarity * 100, 1),
        "misleading":     misleading,
        "reason":         reason,
    }


def compute_credibility_score(confidence, label, emotional_score, source_score, similarity_pct):
    real_confidence = confidence if label == "REAL" else (100 - confidence)
    score = (
        real_confidence   * 0.40 +
        source_score      * 0.30 +
        (100 - emotional_score) * 0.20 +
        similarity_pct    * 0.10
    )
    return round(max(0, min(100, score)), 1)


def generate_explanation(label, confidence, emotional_bias, clickbait_score,
                         source_status, headline_sim, suspicious_words):
    reasons   = []
    positives = []

    if label == "FAKE":
        reasons.append("our ML model flagged this as likely misinformation")
    else:
        positives.append("content structure aligns with factual reporting patterns")

    if emotional_bias == "High":
        reasons.append("high emotional language designed to bypass critical thinking")
    elif emotional_bias == "Medium":
        reasons.append("moderate emotionally charged language detected")
    else:
        positives.append("low emotional manipulation detected")

    if clickbait_score > 50:
        reasons.append(f"multiple clickbait phrases found (score: {int(clickbait_score)}/100)")
    elif clickbait_score > 25:
        reasons.append("some clickbait-style phrasing present")

    if source_status == "Suspicious":
        reasons.append("source domain has a known history of misinformation")
    elif source_status == "Trusted":
        positives.append("source is a recognized credible publication")
    else:
        reasons.append("source credibility could not be verified")

    if headline_sim.get("misleading"):
        reasons.append("headline diverges significantly from article body")

    if suspicious_words:
        sample = ", ".join(f'"{w}"' for w in suspicious_words[:3])
        reasons.append(f"manipulative keywords found: {sample}")

    if reasons:
        tone = "misleading" if label == "FAKE" else "worth scrutiny"
        text = f"This content is likely {tone} because: {'; '.join(reasons)}."
    else:
        text = "This content shows strong credibility signals: " + "; ".join(positives) + "."

    if positives and reasons:
        text += f" On the positive side: {positives[0]}."

    return text


def highlight_text(text, suspicious_words):
    if not suspicious_words:
        return [{"text": text, "highlight": False}]

    pattern = r'(' + '|'.join(re.escape(w) for w in suspicious_words) + r')'
    parts   = re.split(pattern, text, flags=re.IGNORECASE)
    sw_set  = {w.lower() for w in suspicious_words}
    return [{"text": p, "highlight": p.lower() in sw_set} for p in parts]

# ─────────────────────────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────────────────────────

@app.route('/api/analyze', methods=['POST'])
def analyze():
    data       = request.get_json()
    text       = data.get('text', '').strip()
    headline   = data.get('headline', '').strip()
    source_url = data.get('source_url', '').strip()

    if not text or len(text) < 20:
        return jsonify({"error": "Text too short. Provide at least 20 characters."}), 400

    nlp              = analyze_text(text, headline)
    source           = check_source_credibility(source_url)
    headline_info    = compute_headline_similarity(headline, text)
    credibility      = compute_credibility_score(
        nlp['confidence'], nlp['label'],
        nlp['emotional_score'], source['score'],
        headline_info['similarity_pct']
    )
    explanation      = generate_explanation(
        nlp['label'], nlp['confidence'], nlp['emotional_bias'],
        nlp['clickbait_score'], source['status'], headline_info,
        nlp['suspicious_words']
    )
    highlighted      = highlight_text(text, nlp['suspicious_words'])

    return jsonify({
        "label":             nlp['label'],
        "confidence":        nlp['confidence'],
        "fake_probability":  nlp['fake_probability'],
        "real_probability":  nlp['real_probability'],
        "credibility_score": credibility,
        "emotional_bias":    nlp['emotional_bias'],
        "emotional_score":   nlp['emotional_score'],
        "clickbait_score":   nlp['clickbait_score'],
        "intensity_score":   nlp['intensity_score'],
        "source":            source,
        "headline_analysis": headline_info,
        "explanation":       explanation,
        "highlighted_text":  highlighted,
        "suspicious_words":  nlp['suspicious_words'],
        "word_count":        nlp['word_count'],
        "using_real_model":  nlp['using_real_model'],
    })


@app.route('/api/compare', methods=['POST'])
def compare():
    data = request.get_json()

    def score_article(article):
        text       = article.get('text', '')
        headline   = article.get('headline', '')
        source_url = article.get('source_url', '')
        nlp        = analyze_text(text, headline)
        source     = check_source_credibility(source_url)
        hl         = compute_headline_similarity(headline, text)
        cred       = compute_credibility_score(
            nlp['confidence'], nlp['label'],
            nlp['emotional_score'], source['score'], hl['similarity_pct']
        )
        return {
            "label":             nlp['label'],
            "credibility_score": cred,
            "emotional_bias":    nlp['emotional_bias'],
            "clickbait_score":   nlp['clickbait_score'],
            "source":            source,
            "confidence":        nlp['confidence'],
        }

    r1 = score_article(data.get('article1', {}))
    r2 = score_article(data.get('article2', {}))

    more_credible = "Article 1" if r1['credibility_score'] >= r2['credibility_score'] else "Article 2"
    more_biased   = "Article 1" if r1['clickbait_score']   >= r2['clickbait_score']   else "Article 2"
    diff          = round(abs(r1['credibility_score'] - r2['credibility_score']), 1)

    return jsonify({
        "article1": r1,
        "article2": r2,
        "verdict": {
            "more_credible":    more_credible,
            "more_biased":      more_biased,
            "credibility_diff": diff,
            "summary":          f"{more_credible} is more credible by {diff} points.",
        }
    })


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status":            "ok",
        "model":             "TF-IDF + LogisticRegression",
        "model_loaded":      MODEL is not None,
        "version":           "2.0.0",
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
