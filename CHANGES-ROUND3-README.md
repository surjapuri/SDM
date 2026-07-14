# QRaksha — Upgrade Round 3 (based on your annotated screenshots)

## ⚠️ ONE THING YOU MUST DO before Success Story submission will work
`docs/js/firebase-init.js` has placeholder Firebase config values
(`apiKey`, `messagingSenderId`, `appId`). Replace them with your real values
from: **Firebase Console → ⚙️ Project Settings → General → Your apps → Web
app → SDK setup and configuration**. This config is safe to be public — it
only tells the browser which Firebase project to talk to; real protection
comes from `firestore.rules` (also added in this zip). Then deploy the
rules once:
```bash
npx firebase-tools deploy --only firestore:rules
```

## 1. Full multilingual system (real-time)
- `js/lang.js`: added **Urdu, Gujarati, Kannada** as fully real-translated
  languages (on top of the existing English/Hindi/Bengali/Telugu/Marathi/
  Tamil) — that's all 9 you asked for, no "(beta)" tag.
- Expanded the dictionary to cover nav labels, Home headings, category
  input prompts, the panic banner, and the new AI-chat prompt.
- Picking a language now fires a `qrv:lang-changed` event and instantly
  re-applies every `data-i18n` element on the page — no reload needed.
- Note: category card labels/descriptions (from `cyber-resources.json`)
  and AI-generated verdict text are not yet part of this dictionary system
  — translating dynamic/AI content is a larger follow-up, flagged so it
  doesn't get missed.

## 2. Founder card refactor
- OneSearch removed entirely.
- Remaining projects — QRVerify, TeleprompterPro, SM 10X, School
  Management System — are now large gradient icon-tile cards, not plain
  text buttons. Project links updated to your real URLs:
  - QRVerify → https://imtiyazkth.github.io/QRVerify/
  - TeleprompterPro → https://imtiyazkth.github.io/Teleprompter/
- Connect section now uses real inline-SVG brand icons (Facebook,
  Instagram, X, **YouTube added** → https://youtube.com/@imtiyazvedio).

## 3. Back/Home navigation
- Settings modal, About/Founder modal, and the About & Transparency
  section each now have a "Back to Home" button that closes the modal and
  jumps straight to the Home tab.

## 4. Scanning engine
- fps bumped 10 → 15, added `experimentalFeatures.useBarCodeDetectorIfSupported`
  so browsers with the native BarcodeDetector API (most current Android
  Chrome) decode noticeably faster and more reliably than the pure-JS path.
- Audio: replaced "new AudioContext() per beep" (silently unreliable on
  iOS/mobile after the first sound) with a **single shared AudioContext**
  that's unlocked via `.resume()` on the very first tap anywhere in the
  app, then reused for every beep — fixes the "beep stops working" issue.
  Added a soft distinct chime for successful *safe* scans too (previously
  silent), alongside the existing double-beep for risky ones.
- UPI/BharatQR scans now show a dedicated **Payment request details**
  block: Receiver/Payee name, Amount, and the raw UPI address — separate
  from the general "exact decoded content" box.
- A **"Chat with AI" safety-assistant prompt** now appears under every
  scan verdict, pre-filled with the decoded content, routing into the
  existing AI message-check + consent pipeline.

## 5. Complain page
- Panic banner ("Being scammed right now?") is now bold, white text on a
  flashing red background (`qrv-flash-banner` CSS animation).
- Platform report grid now renders real inline-SVG brand marks (Google,
  X, WhatsApp, Telegram, Facebook, Instagram) with correct brand colors
  instead of plain text buttons.

## 6. Category input interaction
- Clicking Website URL / WhatsApp-Telegram / Phone Number / Email /
  SMS Header / Social Media URL now expands an inline input panel right
  on the Home tab (not a separate page) asking for the relevant paste —
  "Check now" hands it straight to the existing message-check engine and
  jumps you to the result.
- Deepfake and Mobile App (.apk) still correctly route to the official
  report portal since QRaksha doesn't have detection engines for those yet
  (was already honestly labeled "Coming soon" — kept as-is).

## 7. Local fallback data / advisories
- `data/cyber-resources.json`: added an **NPCI UPI-safety advisory**
  entry ("Scanning a QR Never Gives You Money") alongside the existing
  RBI / cybercrime.gov.in / I4C advisory cards.
- Added the requested transparency line under the Revenue & Growth
  Roadmap: *"We are actively working toward establishing direct API
  integrations and formal partnerships with Government Law Enforcement
  Authorities as soon as possible."*
- Offline blocklists (`data/blocklists/*.json`) and keyword-based
  free-intel checks were already local-first per the previous upgrade —
  no network dependency for the base check.

## 8. Firestore success-story fix
- Removed the dependency on the un-deployed `submitStory` Cloud Function.
- `js/story-submit.js` now writes directly to the `success_stories`
  Firestore collection via the client SDK (`js/firebase-init.js`).
- Added `firestore.rules`: allows only well-formed, consented,
  length-validated **creates** — no public reads/updates/deletes, so a
  malicious client can't spam or scrape the collection.
- Connection drops are caught and shown as a clear, non-crashing message
  instead of blaming a Cloud Function that was never the real cause.

## Also fixed (found during this pass)
- `UPI risk scoring` in `js/risk-engine-core.js` (the file the live app
  actually loads) already had the stricter deceptive-VPA / support-name /
  urgency checks from the previous round — verified intact, untouched.
- Confirmed `js/qr-verify-core.js` is a legacy file **not loaded** by the
  live `index.html` (only `index-old-backup.html` may reference it) — a
  parallel edit was made there for consistency but has no effect on the
  live site; flagging so it isn't mistaken for a live fix.

## Sanity-checked before zipping
- All `.js` files: `node --check` clean.
- All `.json` files (including the updated `cyber-resources.json`,
  `firebase.json`, `firestore.indexes.json`): valid.
- `index.html`: `<div>` 66/66, `<section>` 4/4 balanced.
- Every new element ID referenced from JS (`btnSettingsHome`,
  `btnFounderHome`, `btnAboutHome`, `btnAskAiSafety`, `upiSummaryBlock`,
  etc.) confirmed present in the HTML.

## Still needs real assets from you (can't fabricate these)
- Firebase Web config (see top of this file).
- If you want pixel-perfect official logo files instead of the inline-SVG
  brand marks I built (which already use correct brand colors/shapes),
  download the actual SVGs from each platform's brand press kit and swap
  them into `PLATFORM_ICONS` in `js/dashboard.js` and the Connect section
  in `index.html`.
