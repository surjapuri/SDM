# QRaksha — User Guide

QRaksha is a free, privacy-first anti-scam tool. Live at: **https://imtiyazkth.github.io/QRaksha/**

## What QRaksha does
- **Scan** any QR code (UPI/BharatQR payment codes, URLs, WiFi codes, contact cards) and get an instant risk verdict.
- **Check** a suspicious Website URL, WhatsApp/Telegram link, Phone number, Email, SMS header, or Social media profile — paste it and get a plain-language verdict.
- **Message & Screenshot Check** — paste a suspicious SMS/WhatsApp message, or upload a screenshot of one, and get the same analysis.
- **Panic Mode** — a permanent red banner ("Being scammed right now?") that instantly surfaces the 1930 national cyber-fraud helpline (tap to call) and the National Cyber Crime Portal.
- **Report Directly to a Platform** — one-tap links to Google, X, WhatsApp, Telegram, Facebook, and Instagram's own official abuse-report pages.
- **Success Stories** — share how QRaksha helped you (optionally anonymous), to help build public awareness.

## Installing QRaksha as an app (no app store needed)
QRaksha is a Progressive Web App (PWA):
- **Android (Chrome):** open the site → tap the browser menu (⋮) → "Add to Home screen" / "Install app". It then opens full-screen like a native app, works offline for the local checks, and shows on your home screen.
- **iOS (Safari):** open the site → tap the Share icon → "Add to Home Screen".
- **Desktop (Chrome/Edge):** an install icon (⊕) appears in the address bar — click it to install as a desktop app window.
- **APK:** if you were given a `.apk`, it's a TWA (Trusted Web Activity) wrapper around this same website — install it like any Android app; it needs no separate updates since it always loads the live site.

## Changing language
Tap the **文/A** button on the Home screen, or go to **Settings → Language**. Supported: English, Hindi, Bengali, Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada (fully translated) plus 13 more Indian constitutional languages currently marked "(beta)" — those fall back to English for any string not yet translated, rather than guessing.

## Understanding a result card
- **Green / Low Risk:** no known red flags found. Still use your own judgment — this is a screening tool, not a guarantee.
- **Yellow / Suspicious:** some caution signals found — read the listed reasons.
- **Red / Confirmed or High Risk:** strong, specific red flags found (e.g., a payee name impersonating "Customer Care" combined with a large payment amount, or a link matching a live phishing feed). Do not proceed.
- **"[AI Analysis Result]"** vs **"[Internet Source Data / Offline Mode]"**: tells you whether the verdict used a live AI check or fell back to local/offline pattern matching — both are shown transparently so you know which one you got.
- Every result ends with the same disclaimer: this is an automated screening tool, not a legal or financial authority — always double-check with official channels before making a decision involving money.

## Offline use
Most of QRaksha works with **no internet at all** — QR/URL/phone/email pattern checks, the local scam-signature database, and Panic Mode's helpline number are all bundled with the app. Only the optional "Analyze with AI" deep-check needs a connection (or, once downloaded, the offline on-device AI model — see the Offline AI Guide).

## Getting help
- Cyber fraud right now: dial **1930** (India's national cyber-fraud helpline) or visit **cybercrime.gov.in**.
- App feedback/bugs: use the Report Directly to a Platform links, or reach the founder via the Connect section in "About the Founder."
