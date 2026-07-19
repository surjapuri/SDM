/* ==========================================================================
   LOCAL-LLM-ENGINE.JS
   The ONLY AI tier in QRaksha now — runs entirely on-device via wllama
   (WASM port of llama.cpp, MIT-licensed) + Qwen2.5-1.5B-Instruct GGUF
   (Apache 2.0 weights). No server, no API key, no per-request cost, no
   data ever leaves the device.

   Cloud/Mesh AI has been intentionally removed from this app. This file
   is now the primary (and only) AI explanation source, used AFTER the
   instant local regex/signature checks (verification-engine.js,
   risk-engine-core.js, free-intel-check.js) — those always run first
   and are never replaced by this; this only adds a plain-language
   explanation on top of facts they already found.
   ========================================================================== */

const WLLAMA_ESM = "https://cdn.jsdelivr.net/npm/@wllama/wllama@2/esm/index.js";
// wllama's own documented no-build-tools pattern: this helper resolves the
// correct single-thread/multi-thread .wasm asset paths from the same CDN
// automatically. (A plain URL string passed to `new Wllama(...)` is NOT a
// valid config and silently fails every load — that was a real bug fixed
// in this file; it was never a device/RAM limitation.)
const WLLAMA_CDN_WASM_HELPER = "https://cdn.jsdelivr.net/npm/@wllama/wllama@2/esm/wasm-from-cdn.js";
const MODEL_STORAGE_KEY = "qrv_local_model_consent_v1";
const SELECTED_MODEL_KEY = "qrv_local_model_choice_v1";

/* ------------------------------------------------------------------
   Model catalog — 4 open-source, Apache-2.0/MIT-licensed instruct
   models, all quantized to GGUF (Q4_K_M — the standard "good quality,
   small size" quantization). User picks one; the app never silently
   downloads a huge model without an explicit choice.

   These 4 were chosen because they're proven to already run well on
   real budget/mid-range Android hardware via PocketPal AI (same
   underlying llama.cpp engine, just native instead of WASM) — so if
   PocketPal ran them smoothly on a given phone, wllama should too,
   just somewhat slower since WASM has more overhead than native code.
------------------------------------------------------------------ */
const MODEL_CATALOG = [
  {
    id: "qwen2.5-1.5b",
    name: "Qwen2.5-1.5B-Instruct",
    size: "~1.0 GB",
    speed: "Fast",
    quality: "Good",
    license: "Apache 2.0",
    url: "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf",
    recommended: true,
  },
  {
    id: "llama-3.2-1b",
    name: "Llama-3.2-1B-Instruct",
    size: "~0.8 GB",
    speed: "Fastest",
    quality: "Basic",
    license: "Llama 3.2 Community License",
    url: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf",
  },
  {
    id: "smollm2-1.7b",
    name: "SmolLM2-1.7B-Instruct",
    size: "~1.1 GB",
    speed: "Fast",
    quality: "Good",
    license: "Apache 2.0",
    url: "https://huggingface.co/bartowski/SmolLM2-1.7B-Instruct-GGUF/resolve/main/SmolLM2-1.7B-Instruct-Q4_K_M.gguf",
  },
  {
    id: "gemma-2-2b",
    name: "Gemma-2-2B-it",
    size: "~1.6 GB",
    speed: "Moderate",
    quality: "Best",
    license: "Gemma Terms of Use (custom, has usage restrictions — check before commercial use)",
    url: "https://huggingface.co/bartowski/gemma-2-2b-it-GGUF/resolve/main/gemma-2-2b-it-Q4_K_M.gguf",
  },
];

function getSelectedModel() {
  const savedId = localStorage.getItem(SELECTED_MODEL_KEY);
  return MODEL_CATALOG.find((m) => m.id === savedId) || MODEL_CATALOG.find((m) => m.recommended) || MODEL_CATALOG[0];
}
function setSelectedModel(modelId) {
  localStorage.setItem(SELECTED_MODEL_KEY, modelId);
  // Changing model means the old loaded instance (if any) no longer
  // matches the user's choice — force a fresh load next time.
  wllamaInstance = null;
  loadingPromise = null;
}

let wllamaInstance = null;
let loadingPromise = null;

function hasUserConsented() {
  return localStorage.getItem(MODEL_STORAGE_KEY) === "granted";
}
function setUserConsent(granted) {
  localStorage.setItem(MODEL_STORAGE_KEY, granted ? "granted" : "declined");
}

async function ensureModelLoaded(onProgress) {
  if (wllamaInstance) return wllamaInstance;
  if (loadingPromise) return loadingPromise;

  const model = getSelectedModel();

  loadingPromise = (async () => {
    const { Wllama } = await import(WLLAMA_ESM);
    const { default: WasmFromCDN } = await import(WLLAMA_CDN_WASM_HELPER);
    const instance = new Wllama(WasmFromCDN);
    await instance.loadModelFromUrl(model.url, {
      n_ctx: 1024,
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
    console.error(`QRVLocalAI: model load failed for "${model.name}" —`, err);
    loadingPromise = null;
    throw err;
  }
}

async function explainWithLocalModel(flags, languageLabel) {
  const instance = await ensureModelLoaded();
  const factList = flags.slice(0, 5).map((f) => `- ${f.message || f}`).join("\n");
  const prompt =
    `You are a calm, factual cyber-safety assistant. Using ONLY the facts below, write a 2-3 sentence explanation ` +
    `in ${languageLabel || "English"} of why this looks risky (or reassuring, if the facts suggest low risk), and one clear next step. ` +
    `Do not invent any fact not listed.\n\nFacts:\n${factList || "- No specific risk flags were found."}\n\nExplanation:`;

  const output = await instance.createCompletion(prompt, {
    nPredict: 160,
    sampling: { temp: 0.3, top_p: 0.9 },
  });
  return (output || "").trim();
}

function isLikelyLowMemoryDevice() {
  if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
    return navigator.deviceMemory < 4;
  }
  return false;
}

window.QRVLocalAI = {
  hasUserConsented,
  setUserConsent,
  isLikelyLowMemoryDevice,
  ensureModelLoaded,
  explainWithLocalModel,
  MODEL_CATALOG,
  getSelectedModel,
  setSelectedModel,
};

window.dispatchEvent(new CustomEvent("qrv:local-ai-ready"));
