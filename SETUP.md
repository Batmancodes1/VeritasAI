# VeritasAI — Complete Setup & Training Guide

---

## Project Layout

```
veritas-ai/
├── backend/
│   ├── app.py            ← Flask API server
│   ├── train_model.py    ← ML training script
│   ├── requirements.txt  ← Python deps
│   └── model.pkl         ← created after training
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
└── chrome-extension/
    ├── manifest.json
    ├── popup.html
    └── content.js
```

---

## Step 1 — Install Python dependencies

You need Python 3.9+. Check with: `python --version`

```bash
cd backend
pip install -r requirements.txt
```

If you hit permission errors:
```bash
pip install --user -r requirements.txt
# or inside a virtual environment:
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
pip install -r requirements.txt
```

---

## Step 2 — Run without training (instant, demo mode)

The frontend has a full offline mock engine built in. You can demo everything without Flask running at all:

```bash
# Just open this file in any browser — no server needed
open frontend/index.html          # Mac
start frontend/index.html         # Windows
xdg-open frontend/index.html      # Linux
```

Or run Flask with the rule-based fallback (no training required):

```bash
cd backend
python app.py
```

Then open `frontend/index.html` in your browser. Flask will print:
```
⚠️  model.pkl not found — using rule-based fallback engine
```
Everything works — predictions are just less accurate than the trained model.

---

## Step 3 — Train the real ML model (recommended)

### 3a. Download the dataset

Go to: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset

You need a free Kaggle account. Download the zip, extract it.
You'll get two files: `Fake.csv` and `True.csv`

**Place both files inside the `backend/` folder:**
```
backend/
├── Fake.csv          ← put here
├── True.csv          ← put here
├── app.py
├── train_model.py
└── requirements.txt
```

### 3b. Run training

```bash
cd backend
python train_model.py
```

Expected output:
```
╔══════════════════════════════════╗
║  VeritasAI — Model Training      ║
╚══════════════════════════════════╝

📂 Loading dataset...
   Total articles : 44,898
   Fake           : 23,481
   Real           : 21,417

📊 Train size : 38,163
   Test size  :  6,735

⚙️  Training pipeline (this takes ~60 seconds)...
   Done in 54.2s

══════════════════════════════════════════════════
  Accuracy  : 98.94%
  ROC-AUC   : 0.9991
══════════════════════════════════════════════════

✅ Model saved → model.pkl
```

Training takes **30–90 seconds** on a normal laptop. It saves `model.pkl` (~150 MB).

### 3c. Start the server with real model

```bash
python app.py
```

You'll now see:
```
✅ Loaded trained model from model.pkl — using real ML predictions
 * Running on http://127.0.0.1:5000
```

Open `frontend/index.html` — all analysis now uses the ~99% accuracy classifier.

---

## Step 4 — Verify everything works

### Check the API is alive:

```bash
curl http://localhost:5000/api/health
```

Expected:
```json
{
  "model_loaded": true,
  "model": "TF-IDF + LogisticRegression",
  "status": "ok",
  "version": "2.0.0"
}
```

### Test a prediction:

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Scientists confirm vaccine safe after large clinical trials", "headline": "Vaccine confirmed safe", "source_url": "https://reuters.com"}'
```

---

## Step 5 — Chrome Extension (optional)

1. Open Chrome → address bar → `chrome://extensions`
2. Toggle **Developer mode** ON (top right)
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder
5. VeritasAI icon appears in your toolbar
6. Make sure `python app.py` is running
7. Go to any news article → click the extension → click **Analyze This Page**

---

## Why the accuracy is ~99%

The model achieves very high accuracy on this specific dataset because:

- The Kaggle dataset has a strong stylistic divide — fake articles use sensationalist phrasing, real Reuters articles use neutral wire-service style
- Title doubling in the training input (`title + title + body`) weights headline features more heavily
- Trigrams (`ngram_range=(1,3)`) capture exact manipulative phrases as single features
- `C=10.0` uses less regularization, letting the model fit the strong patterns tightly
- 85/15 train/test split gives more training signal

**Real-world caveat:** This dataset is mostly US political news from 2016–2017. On articles from other domains or newer dates, accuracy will be lower — treat results as signals, not verdicts.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError: flask` | Run `pip install -r requirements.txt` inside `backend/` |
| `FileNotFoundError: Fake.csv` | Place `Fake.csv` and `True.csv` inside the `backend/` folder |
| `Address already in use` on port 5000 | Kill the old process: `lsof -ti:5000 \| xargs kill` (Mac/Linux) or change port in `app.py` |
| Frontend shows "Backend offline" | Make sure `python app.py` is running and visit `http://localhost:5000/api/health` to confirm |
| Chrome extension can't connect | Backend must be running. Chrome extensions can't reach `localhost` if Flask isn't started |
| Training is slow | Normal — 60–90 seconds on a laptop. The vectorizer is building a 100k-feature matrix |
| `pip` is Python 2 pip | Use `pip3` instead |

---

## Quick reference

```bash
# One-time setup
cd backend && pip install -r requirements.txt

# Train (do once after downloading the CSVs)
python train_model.py

# Start server
python app.py

# Open frontend (in a separate terminal or just double-click)
open ../frontend/index.html
```
