# QRaksha

**Scan with privacy. Verify before you trust.**

QRaksha is a privacy-first web app that helps everyday users — in India and worldwide — catch scams before they fall for them: QR codes, suspicious messages, screenshots, phone numbers, and more, with a permanent one-tap emergency panic mode built in. It runs entirely in the browser for its core checks, with Advance AI Opinion and Analysis available for deeper insight.

---

## What it does

### 🔍 QR Code Check
Scan a QR code with your camera or upload an image. The code is decoded and risk-analyzed **entirely in your browser** — nothing is sent anywhere for the free/offline check. You get an instant risk score, a plain-language explanation, and the exact decoded content (including UPI payee/amount/VPA details when it's a payment QR) before you ever tap a link or enter a UPI PIN.

### 💬 Message & Screenshot Check
Paste a suspicious SMS or WhatsApp message, or upload a screenshot, and get a risk breakdown. Text checks run offline/free by default; Advance AI Opinion and Analysis (via Mesh API) is available with explicit user consent for a deeper, sharper verdict.

### 🗂️ Check by Category
Dedicated flows for websites/URLs, WhatsApp/Telegram handles, phone numbers, email addresses, SMS headers, and social media profiles — plus a **"Verify with Government Data"** card that routes deepfake-media and untrusted/modded mobile app (`.apk`) reports straight to the official Cyber Crime Portal, since QRaksha doesn't run its own detection engine for those yet.

### 🚨 Panic Mode
A permanent, always-visible emergency banner at the top of the screen. One tap opens a zero-network, zero-ad screen with India's **Stop → Think → Act** guidance, a direct `tel:1930` dialer link to the official Cyber Fraud Helpline, and a link to report at **cybercrime.gov.in**.

### 📣 Report Directly to a Platform
One-tap links to each platform's own official abuse/report form (Google, X, WhatsApp, Telegram, Facebook, Instagram) — QRaksha never processes these reports itself, it just gets you to the right place faster.

### 🧾 QR Code Generator
Generate your own QR codes for campaigns, review links, Maps locations, or app store links.

### 🌐 Multi-language support
The interface is available in Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, and Kannada (with more of India's Eighth Schedule languages listed and clearly marked "beta" where translation isn't complete yet — QRaksha shows English rather than guessing at safety-critical text).

### 🏆 Success Stories
Users who avoided a scam using QRaksha can share their story for public awareness, reviewed by a human before publication.

---

## Why it's built this way

- **Offline-first.** The core QR decode and risk scoring happens on-device. No network round trip stands between you and a safety verdict.
- **Global + local threat-intel.** Offline checks combine worldwide phishing/malware feeds (OpenPhish, PhishTank, URLhaus) with an India-specific scam-keyword list, so both international and Indian users get relevant, up-to-date signals.
- **Consent before AI.** Anything sent to a server (Advance AI Opinion and Analysis, or screenshot text extraction) requires explicit, informed opt-in — off by default.
- **No fake authority.** QRaksha never impersonates a bank, platform, or government body, and never claims to run detection it doesn't actually have (see the Government Data card above).
- **Transparent about the roadmap.** QRaksha is free today. Sustainability plans (non-intrusive ads, an optional premium tier, B2B API licensing) are disclosed openly in-app — core safety features (offline QR check, Panic Mode, basic scam detection) are intended to always remain free.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, Tailwind CSS, vanilla JavaScript (PWA, installable) |
| QR decoding | [html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| QR generation | qrcodejs, jsPDF |
| Backend | Firebase Cloud Functions (Node.js 20) |
| Database | Firebase Firestore |
| Advance AI Opinion and Analysis | Mesh API |
| Hosting | Firebase Hosting / GitHub Pages, serving the `docs/` directory |

## Project structure

```
qr-verify-scam-shield/
├── docs/                     ← the deployed frontend (Firebase Hosting public dir)
│   ├── index.html            ← main app shell
│   ├── css/                  ← styling (qr-verify-core.css, ai-mode.css)
│   ├── js/                   ← app logic (scanner, risk engine, i18n, AI pipeline, etc.)
│   ├── data/                 ← awareness content, blocklists, platform report links
│   ├── icons/, manifest.json, sw.js  ← PWA assets
│   └── SECURITY.md           ← threat model & mitigations for this project
├── functions/                ← Firebase Cloud Functions (message/screenshot checks, phone lookup, story submission)
├── firestore.rules, firestore.indexes.json, firebase.json
├── rag-corpus/                ← reference material backing Advance AI Opinion and Analysis
├── LICENSE
└── README.md                  ← this file
```

## Getting started

```bash
# install root dependencies
npm install

# install Cloud Functions dependencies
cd functions && npm install && cd ..

# serve the frontend locally (any static file server works)
npx serve docs

# deploy (requires the Firebase CLI and project access)
firebase deploy
```

Advance AI Opinion and Analysis requires a `MESH_API_KEY` configured as a Firebase secret — see `docs/SECURITY.md` for how secrets are handled. Everything else (QR check, Panic Mode, category checks against local blocklists) works with no backend configuration at all.

## Security & privacy

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full threat model — secret handling, XSS mitigations, prompt-injection defenses, rate limiting, and known limitations, documented file-by-file rather than just claimed.

## License

See [`LICENSE`](LICENSE).

## Credits

Built by **Imtiyaz Surjapuri** — Founder & Lead Developer. Powered by Mesh API.
