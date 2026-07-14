# QRaksha — Developer Guide

## Architecture at a glance

QRaksha is a **vanilla HTML/CSS/JS PWA** — no build step, no framework, no bundler. It's served directly from the `docs/` folder via GitHub Pages, with a thin Firebase Cloud Functions backend for the few operations that genuinely need a server (proxying a secret API key, or a Firestore-backed community layer).

```
qr-verify-scam-shield/
├── docs/                          # The live site (GitHub Pages root)
│   ├── index.html                 # Single-page app shell; all tabs live here
│   ├── manifest.json              # PWA manifest (installability)
│   ├── sw.js                      # Service worker (offline caching)
│   ├── css/
│   │   └── qr-verify-core.css     # All custom styles (Tailwind via CDN + this file)
│   ├── js/
│   │   ├── sanitize.js            # HTML-escaping helper, loaded first
│   │   ├── config.js              # Firebase Functions base URL, AI-availability state
│   │   ├── lang.js                # 22-language i18n dictionary + picker
│   │   ├── risk-engine-core.js    # QR payload parsing + risk scoring (window.QRVEngine)
│   │   ├── free-intel-check.js    # Local blocklist/keyword text checker
│   │   ├── verification-engine.js # Category-specific checks (URL/phone/email/SMS/social) — window.QRVVerification
│   │   ├── local-llm-engine.js    # NEW: on-device AI via wllama — window.QRVLocalAI
│   │   ├── ad-gate.js             # Interstitial ad gate before non-critical actions
│   │   ├── consent.js             # One-time consent modal before any AI/network call
│   │   ├── panic-mode.js          # Panic Mode modal (1930 helpline, portal link)
│   │   ├── ai-scam-check.js       # Orchestrates offline + free-intel + Mesh AI + local AI tiers
│   │   ├── mobile-scanner.js      # html5-qrcode wrapper, camera lifecycle
│   │   ├── dashboard.js           # Home tab category grid + inline input panel
│   │   ├── story-submit.js        # Success-story form → direct Firestore write
│   │   ├── firebase-init.js       # Firebase Web SDK init (ES module)
│   │   └── mobile-app.js          # Top-level wiring: tabs, QR-decode listener, settings, founder modal
│   ├── data/
│   │   ├── cyber-resources.json         # Home category list + awareness banners/booklets
│   │   ├── global-scam-signatures.json  # International govt-agency scam-signature DB
│   │   └── blocklists/*.json            # Free threat-intel feeds (refreshed by a GitHub Action)
│   └── icons/                     # PWA icons
├── functions/                     # Firebase Cloud Functions (only where a secret is truly needed)
│   ├── scamCheck.js                # Mesh AI proxy for message checks
│   ├── screenshotCheck.js          # Mesh AI proxy for screenshot OCR+check
│   ├── aiStatus.js                 # Reports whether Mesh AI is currently reachable
│   ├── submitStory.js              # (legacy — client now writes to Firestore directly)
│   └── phoneLookup.js              # Numverify proxy (their free tier is HTTP-only; browsers can't call it directly over HTTPS)
├── firestore.rules                 # Firestore security rules (success_stories, verified_scam_signatures)
└── .github/workflows/              # update-blocklists.yml — weekly free threat-feed refresh
```

## Why no framework/build step?
The project deliberately stays framework-free so it: (a) deploys with zero build tooling directly to GitHub Pages, (b) can be edited and pushed entirely from a phone via Termux, and (c) has no `node_modules` dependency chain to break. `functions/` is the one place Node.js is used, because Cloud Functions requires it.

## The 3-tier AI fallback pattern
This is the core architectural idea running through `ai-scam-check.js`:
1. **Tier 1 — Mesh API** (cloud, best quality, needs internet + your server-side key).
2. **Tier 2 — On-device AI** (`local-llm-engine.js`, wllama + Qwen2.5-1.5B-Instruct GGUF, works offline after a one-time model download, lower quality but zero cost/zero data leaving the device).
3. **Tier 3 — Pure local regex/signature engine** (`verification-engine.js` + `risk-engine-core.js`, always works, zero AI, zero download, zero network).

Every new "smart" feature should follow this pattern: try the best option, degrade gracefully, never leave the user with a blank screen or an uncaught error.

## Local development
There's no dev server requirement — any static file server works:
```bash
cd qr-verify-scam-shield/docs
python3 -m http.server 8080
# open http://localhost:8080
```
Camera access (for QR scanning) requires either `https://` or `localhost` — plain `http://192.168.x.x` from another device on your LAN will NOT get camera permission; use `localhost` on the same machine, or deploy to test camera features on a phone.

## Firebase Functions development
```bash
cd functions
npm install
firebase emulators:start --only functions,firestore
```

## Coding conventions
- Every `js/*.js` file is an IIFE exposing one `window.QRVxxx` namespace — avoid adding new globals outside this pattern.
- Every network call must have a `try/catch` and a defined fallback — see `verification-engine.js`'s `checkPhishuntFeed`/`checkDomainAge` for the pattern (silent `return null` on failure, caller treats absence of a signal as "inconclusive," never as "safe").
- New category checks go in `verification-engine.js`'s `INTEL` object + a new `verifyXxx()` function, registered in `handleVerificationCheck`'s `switch`.
- New languages/strings go in `lang.js`'s `DICTIONARIES` object — add the language to `LANGUAGES` array too, or it'll silently fall back to English (which is the intended safe default, not a bug).

## Contribution guidelines
- Keep commits scoped — one feature/fix per commit.
- Run the validation checklist before pushing (see `DEPLOYMENT_GUIDE.md`).
- Never commit a real API key — Mesh API and Numverify keys live only in Firebase Secret Manager (`firebase functions:secrets:set`), never in any file in this repo.
