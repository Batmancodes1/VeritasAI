const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

function setStatus(msg) {
  statusEl.innerText = msg;
}

function showError(title, detail) {
  resultEl.innerHTML = `
    <div style="
      padding:10px;
      background:#FF3D5A12;
      border:1px solid #FF3D5A30;
      border-radius:6px;
      font-size:11px;
      color:#FF8FA0;
    ">
      <strong>${title}</strong><br>${detail}
    </div>
  `;
}

btn.addEventListener("click", async () => {
  btn.disabled = true;
  resultEl.innerHTML = "";
  setStatus("Getting page...");

  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      showError("Error", "No active tab found");
      setStatus("");
      btn.disabled = false;
      return;
    }

    // Extract clean article content
    setStatus("Extracting article...");
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const body =
          document.querySelector("article") ||
          document.querySelector('[role="main"]') ||
          document.querySelector("main");

        let text = body ? body.innerText : document.body.innerText;

        // Clean noise
        text = text
          .replace(/\s+/g, " ")
          .replace(/ADVERTISEMENT/gi, "")
          .replace(/Subscribe|Sign up|Login|Share|Comments/gi, "")
          .slice(0, 4000);

        return {
          text,
          title: document.title,
          url: window.location.href,
        };
      },
    });

    if (!result || !result.text || result.text.length < 20) {
      showError(
        "Not enough text",
        "This page does not contain enough readable article content.",
      );
      setStatus("");
      btn.disabled = false;
      return;
    }

    // Send to backend
    setStatus("Analyzing with AI...");
    let data;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch("http://127.0.0.1:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          text: result.text,
          headline: result.title,
          source_url: result.url,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        showError("Server Error", `Backend returned ${response.status}`);
        setStatus("");
        btn.disabled = false;
        return;
      }

      data = await response.json();
    } catch (err) {
      if (err.name === "AbortError") {
        showError(
          "Timeout",
          "Backend took too long. Make sure server is running.",
        );
      } else {
        showError(
          "Connection Error",
          "Cannot reach backend. Run python app.py",
        );
      }
      setStatus("");
      btn.disabled = false;
      return;
    }

    // Display results (FULL WEBSITE-LEVEL UI)
    setStatus("");

    const isReal = data.label === "REAL";

    resultEl.innerHTML = `
      <div style="
        background:#0D1117;
        border:1px solid #1E2D3D;
        border-radius:10px;
        padding:12px;
      ">

        <div style="
          font-size:18px;
          font-weight:800;
          color:${isReal ? "#00E5A0" : "#FF3D5A"};
        ">
          ${isReal ? "✅ Likely Real" : "🚨 Likely Fake"}
        </div>

        <div style="font-size:12px;color:#6B7F94;margin-bottom:10px;">
          Confidence: ${data.confidence}%
        </div>

        <hr style="margin:8px 0;border-color:#1E2D3D;">

        <div style="font-size:11px;margin-bottom:8px;">
          <strong>REAL:</strong> ${data.real_probability}%<br>
          <strong>FAKE:</strong> ${data.fake_probability}%
        </div>

        <hr style="margin:8px 0;border-color:#1E2D3D;">

        <div style="font-size:11px;margin-bottom:4px;">
          🛡️ Credibility: <strong>${data.credibility_score}</strong>
        </div>

        <div style="font-size:11px;margin-bottom:4px;">
          🎭 Bias: <strong>${data.emotional_bias}</strong> (${data.emotional_score}/100)
        </div>

        <div style="font-size:11px;margin-bottom:4px;">
          🎣 Clickbait: <strong>${data.clickbait_score}/100</strong>
        </div>

        <div style="font-size:11px;margin-bottom:8px;">
          ⚡ Intensity: <strong>${data.intensity_score}/100</strong>
        </div>

        <hr style="margin:8px 0;border-color:#1E2D3D;">

        <div style="font-size:11px;margin-bottom:6px;">
          🌐 Source: <strong>${data.source.status}</strong><br>
          <span style="color:#6B7F94;">${data.source.reason}</span>
        </div>

        <hr style="margin:8px 0;border-color:#1E2D3D;">

        <div style="font-size:11px;margin-bottom:6px;">
          📰 Headline Match: <strong>${data.headline_analysis.similarity_pct || 0}%</strong><br>
          <span style="color:#6B7F94;">${data.headline_analysis.reason}</span>
        </div>

        <hr style="margin:8px 0;border-color:#1E2D3D;">

        <div style="
          font-size:11px;
          color:#6B7F94;
          border-left:2px solid #1E2D3D;
          padding-left:8px;
          line-height:1.5;
        ">
          💡 ${data.explanation}
        </div>

      </div>
    `;
  } catch (error) {
    console.error(error);
    showError("Unexpected Error", error.message);
    setStatus("");
  }

  btn.disabled = false;
});
