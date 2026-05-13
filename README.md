# VeritasAI — Misinformation Analyzer

> AI-powered fake news detection, emotional manipulation scoring, and source credibility analysis — in under 200ms.

---

## What It Does

VeritasAI analyzes any news article across **9 parallel signal detectors** and returns a verdict in under a second:

| Module | What It Detects |
|---|---|
| **ML Classifier** | TF-IDF + Logistic Regression trained on 44,000 articles (~96% accuracy) |
| **Emotional Scanner** | 30 emotionally charged words (horrifying, catastrophe, etc.) |
| **Intensity Detector** | ALL-CAPS ratio and exclamation mark frequency |
| **Clickbait Matcher** | Phrases like "you won't believe", "doctors hate this" |
| **Credibility Score** | Weighted formula combining all signals (0–100) |
| **Source Lookup** | Trusted vs suspicious domain database (Reuters, InfoWars, etc.) |
| **Headline Analyzer** | Cosine similarity between headline and article body |
| **Text Highlighter** | Marks every suspicious word inline in red |
| **Comparison Mode** | Side-by-side credibility battle between two articles |

---

## Features

- **Works offline** — full mock analysis engine runs in-browser when Flask isn't running
- **Chrome Extension** — analyze any webpage with one click
- **Demo Mode** — 3 preloaded articles (credible, fake, clickbait) for instant demos
- **Zero dependencies** — pure HTML/CSS/JS frontend, no build step required

---

## Tech Stack

| Layer | Tech |
|---|---|
| ML Model | scikit-learn — TF-IDF + Logistic Regression |
| Backend | Python + Flask + flask-cors |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Fonts | Syne (display) · DM Sans (body) · DM Mono (mono) |
| Extension | Chrome Manifest V3 |

---

## Getting Started

### Option A — Frontend only (no setup)

```bash
# Just open in your browser — the mock engine handles everything
open frontend/index.html
```

### Option B — With the real ML backend

**1. Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

**2. Start the Flask server**
```bash
python app.py
```

**3. Open the frontend**
```bash
# In another terminal or just open in your browser
open ../frontend/index.html
```

The frontend auto-detects the backend. If Flask isn't running, it falls back to the offline mock engine seamlessly.

---

## Training the ML Model (Optional)

The mock engine is accurate enough for demos. For the real 96% accuracy model:

1. Download `Fake.csv` and `True.csv` from [Kaggle](https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset)
2. Place both files in `backend/`
3. Run training:
```bash
cd backend
python train_model.py
```
4. This saves `model.pkl` — Flask picks it up automatically on next start

Training takes ~30–60 seconds on a normal laptop.

---

## Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `chrome-extension/` folder
4. Start the Flask backend
5. Click the VeritasAI icon on any news article

---

## Project Structure

```
veritas-ai/
├── frontend/
│   ├── index.html        UI — single-page app with Analyze + Compare tabs
│   ├── styles.css        Design system, responsive layout, animations
│   └── script.js         Analysis logic, mock engine, renderers
│
├── backend/
│   ├── app.py            Flask API with all 9 analysis modules
│   ├── train_model.py    TF-IDF + LogReg training script
│   └── requirements.txt  Python deps
│
├── chrome-extension/
│   ├── manifest.json     Chrome Manifest V3 config
│   ├── popup.html        Extension popup UI
│   └── content.js        Page content extractor
│
└── README.md
```

---

## How the Credibility Score Works

```
Credibility = (ML confidence  × 0.40)
            + (Source trust   × 0.30)
            + (100 − Emotion  × 0.20)
            + (Headline sim   × 0.10)
```

Weights reflect actual predictive value: the ML model is the strongest signal, source accountability is second, emotional manipulation is a meaningful but noisy signal, and headline mismatch catches a specific deceptive pattern.

---

## Known Limitations

- Training data is US political news from 2016–2017 — may not generalize to all domains
- A skilled author avoiding emotional language can reduce fake scores
- Source list is static — new misinformation sites won't be flagged automatically
- Does not browse the internet or cross-reference factual claims

Best used as a **first-pass filter**, not a definitive verdict.

---

## Dataset

**Kaggle Fake and Real News Dataset** by Clément Bisaillon
- `Fake.csv` — 23,481 fake news articles
- `True.csv` — 21,417 real Reuters articles
- Combined: ~44,000 labeled examples

Link: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
