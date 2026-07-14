/* ==========================================================================
   LOCAL-LLM-ENGINE.JS
   On-device offline AI tier for QRaksha, using wllama (a WASM port of
   llama.cpp, MIT-licensed, maintained by a llama.cpp core contributor)
   running a small quantized Qwen2.5-1.5B-Instruct GGUF model
   (Apache 2.0 licensed weights) entirely in the browser — no server,
   no API key, no per-request cost, works with zero internet after the
   one-time model download.

   THIS IS TIER 2 in the AI fallback chain:
     Tier 1 — Mesh API (best quality, needs internet + your server key)
     Tier 2 — This file (on-device, works offline, needs a one-time
               ~700MB-1GB model download the first time it's used)
     Tier 3 — Pure local regex/signature engine (verification-engine.js,
               risk-engine-core.js) — always works, zero AI, zero download

   HONEST LIMITATIONS (told to the user before they download anything):
   - First-time download is large (~700MB-1GB) — the UI asks for
     explicit consent and recommends Wi-Fi before starting.
   - Inference is slower than Mesh API and quality is lower than a large
     cloud model — acceptable for short "why is this risky" explanations,
     not meant to replace Mesh API's accuracy.
   - Needs a reasonably modern mobile browser; very low-RAM devices
     (<3GB) may fail to load the model — this is caught and the caller
     falls back to Tier 3 automatically.
   ========================================================================== */

const WLLAMA_CDN = "https://cdn.jsdelivr.net/npm/@wllama/wllama@2/esm/index.js";
const WLLAMA_ASSETS_BASE = "https://cdn.jsdelivr.net/npm/@wllama/wllama@2/esm/";
// Small, Apache-2.0-licensed, instruction-tuned model — good balance of
// quality vs. download size vs. mobile CPU inference speed.
const MODEL_URL = "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf";
const MODEL_STORAGE_KEY = "qrv_local_model_consent_v1";

let wllamaInstance = null;
let loadingPromise = null;

function hasUserConsented() {
  return localStorage.getItem(MODEL_STORAGE_KEY) === "granted";
}

function setUserConsent(granted) {
  localStorage.setItem(MODEL_STORAGE_KEY, granted ? "granted" : "declined");
}

/**
 * Loads wllama + the GGUF model. Only actually downloads anything the
 * FIRST time it's called after consent; the browser's Cache Storage
 * keeps it for every future visit, offline included.
 */
async function ensureModelLoaded(onProgress) {
  if (wllamaInstance) return wllamaInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const { Wllama } = await import(WLLAMA_CDN);
    const instance = new Wllama(WLLAMA_ASSETS_BASE);
    await instance.loadModelFromUrl(MODEL_URL, {
      n_ctx: 1024, // short context — we only ever feed a few sentences of scam flags, not long documents
      progressCallback: onProgress
        ? ({ loaded, total }) => onProgress(total ? loaded / total : 0)
        : undefined,
    });
    wllamaInstance = instance;
    return instance;
  })();

  try {
    return await loadingPromise;
  } catch (err) {
    loadingPromise = null; // allow retry on next call instead of caching a failure forever
    throw err;
  }
}

/**
 * Generates a short, grounded explanation from a list of risk flags
 * already computed by the local regex/signature engine. Deliberately a
 * narrow, templated task (summarize these specific facts, don't invent
 * new ones) — this plays to a small on-device model's strengths and
 * avoids hallucinated reasoning.
 */
async function explainWithLocalModel(flags, languageLabel) {
  const instance = await ensureModelLoaded();
  const factList = flags.slice(0, 5).map((f) => `- ${f.message || f}`).join("\n");
  const prompt =
    `You are a calm, factual cyber-safety assistant. Using ONLY the facts below, write a 2-3 sentence explanation ` +
    `in ${languageLabel || "English"} of why this looks risky, and one clear next step. Do not invent any fact not listed.\n\n` +
    `Facts:\n${factList}\n\nExplanation:`;

  const output = await instance.createCompletion(prompt, {
    nPredict: 160,
    sampling: { temp: 0.3, top_p: 0.9 },
  });
  return (output || "").trim();
}

function isLikelyLowMemoryDevice() {
  // navigator.deviceMemory is a rough hint (GB, capped at 8 by spec) —
  // not available on all browsers, so treat "unknown" as "don't assume safe."
  if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
    return navigator.deviceMemory < 4;
  }
  return false; // unknown — let the user decide via the consent prompt instead of silently blocking
}

window.QRVLocalAI = {
  hasUserConsented,
  setUserConsent,
  isLikelyLowMemoryDevice,
  ensureModelLoaded,
  explainWithLocalModel,
  MODEL_URL,
};

window.dispatchEvent(new CustomEvent("qrv:local-ai-ready"));
