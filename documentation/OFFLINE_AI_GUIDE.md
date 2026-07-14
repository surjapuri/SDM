# QRaksha — Offline AI Guide (wllama + Qwen2.5-1.5B-Instruct-GGUF)

## What this is
QRaksha's Tier 2 AI fallback runs a small language model **entirely inside the user's browser** — no server, no API key, no per-request cost, and no data ever leaves the device. It activates automatically when Mesh API (Tier 1) is unreachable and the user has at least one risk flag worth explaining in plain language.

- **Engine:** [`wllama`](https://github.com/ngxson/wllama) — a WebAssembly port of `llama.cpp`, MIT-licensed, maintained by one of `llama.cpp`'s own core contributors. Runs the model inside a Web Worker so the scanning UI never freezes.
- **Model:** `Qwen2.5-1.5B-Instruct`, quantized to GGUF format (`Q4_K_M` — the standard "good quality, small size" quantization level), Apache 2.0-licensed weights, hosted on Hugging Face.
- **File:** `docs/js/local-llm-engine.js`, wired into `docs/js/ai-scam-check.js`.

## Why this specific engine/model pair
- `llama.rn` (what the PocketPal AI reference app uses) is a **React Native native binding** — it cannot run inside a website, PWA, or TWA-wrapped APK, since there's no React Native runtime for it to attach to. `wllama` is the correct browser-native equivalent: same `llama.cpp` engine underneath, compiled to WASM instead of a native binary, so it runs unmodified inside QRaksha's existing website architecture.
- Qwen2.5-1.5B was chosen over larger models (3B+) because: (a) it's small enough to be realistic to download on Indian mobile data (~700MB–1GB at Q4_K_M vs 2GB+ for a 3B model), (b) it's fast enough on mid-range Android CPUs to give an answer in a few seconds rather than tens of seconds, and (c) its quality is sufficient for the narrow task it's asked to do here (see "Prompting strategy" below) — it is **not** asked to do open-ended reasoning.

## How consent and download work
1. The "🧠 Explain offline with on-device AI" button only appears when Mesh API is unavailable and there's something to explain.
2. First tap shows a plain-language consent prompt stating the download size and recommending Wi-Fi. Nothing downloads until the user accepts.
3. Consent choice is remembered in `localStorage` (`qrv_local_model_consent_v1`) so it isn't asked every time.
4. The model file is fetched once from Hugging Face's CDN and cached by the browser (Cache Storage, managed internally by `wllama`) — every subsequent use, including fully offline, reuses the cached copy with no re-download.
5. If the device is likely low on memory (`navigator.deviceMemory < 4`, where the browser reports it), the consent prompt adds a warning — but the choice still stays with the user rather than silently blocking the feature, since `navigator.deviceMemory` is an imprecise, optional browser signal.

## Prompting strategy — why this stays accurate instead of hallucinating
The model is **never** asked "is this a scam?" from scratch. It's only ever asked to summarize, in 2–3 sentences and the user's selected language, a short list of **facts your regex/signature engine already found** (e.g., "VPA contains the word 'refund'", "domain registered 3 days ago", "matches a live phishing feed entry"). This retrieval-then-summarize pattern is deliberately chosen because:
- Small on-device models are weak at open-ended reasoning but reasonably good at short, templated rewriting of given facts.
- It prevents the classic small-model failure mode of confidently inventing a plausible-sounding but false justification.
- If the on-device explanation ever looks wrong, the underlying flags shown above it (from the deterministic regex/signature engine) are still the actual source of truth — the AI text is presented as an *additional* explanation, not a replacement verdict.

## Performance expectations (realistic, not benchmarked in this environment)
| Device tier | Expected experience |
|---|---|
| Budget Android (≤4GB RAM) | Usable but slow; a few seconds per short explanation; may fail to load on very old/low-RAM devices — falls back gracefully to "flags shown, no AI summary" |
| Mid-range Android (4–6GB RAM) | Comfortable; a few seconds to first output |
| Flagship Android / recent iPhone / laptop / desktop | Fast, near-real-time |

## Known limitations (told honestly, not hidden)
- Multilingual generation quality for a 1.5B model is noticeably weaker than Mesh API's presumed larger backend, especially for languages with less training data representation. Test each of QRaksha's 9 fully-translated languages individually before fully trusting on-device output in that language for production.
- This is a **fallback**, not a replacement for Mesh API — the hybrid design in `ai-scam-check.js` always prefers Tier 1 when available.
- Cross-origin isolation headers (`Cross-Origin-Embedder-Policy`/`Cross-Origin-Opener-Policy`) unlock `wllama`'s faster multi-threaded mode but **cannot be set on GitHub Pages** (no custom response headers there). QRaksha currently runs in `wllama`'s automatic single-thread fallback mode as a result — works everywhere, just not at the fastest possible speed. If maximum speed matters more than GitHub Pages' simplicity, serving `index.html` from Firebase Hosting instead (which *can* set these headers via `firebase.json`) is the upgrade path — this hasn't been done yet, flagged here as a known future improvement, not a hidden bug.

## Updating the model in the future
To swap in a different/newer GGUF model, change exactly one constant in `docs/js/local-llm-engine.js`:
```js
const MODEL_URL = "https://huggingface.co/<org>/<model>-GGUF/resolve/main/<file>.gguf";
```
Always check the new model's own license on its Hugging Face model card before shipping — model weight licenses are separate from and don't automatically match the `wllama`/`llama.cpp` engine's MIT license (see `LICENSING.md`).
