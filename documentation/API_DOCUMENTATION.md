# QRaksha — API & Cloud Service Documentation

Every external service QRaksha touches, whether it's mandatory, and exactly what it's used for.

## Summary table

| Service | Mandatory? | Needs a key? | Where the key lives | Used for |
|---|---|---|---|---|
| Firebase Hosting/Functions/Firestore | Yes (core backend) | Project config only (not a secret) | `docs/js/firebase-init.js` (public-safe) | Success stories, community scam-signature reports, Mesh/Numverify proxies |
| Mesh API | Optional (Tier 1 AI) | Yes — secret | Firebase Secret Manager, via `functions/scamCheck.js` | Deep AI explanation of a message/screenshot |
| Numverify | Optional | Yes — secret | Firebase Secret Manager, via `functions/phoneLookup.js` | Carrier/VoIP lookup for phone numbers |
| phishunt.io | Optional but free | **No** | Called directly from the browser | Live phishing-URL feed cross-check |
| RDAP (rdap.org) | Optional but free | **No** | Called directly from the browser | Domain-age check |
| wllama + Qwen2.5-1.5B GGUF | Optional (Tier 2 AI) | **No** | Model fetched from Hugging Face's public CDN | Offline on-device AI explanation |
| Google Safe Browsing | Not yet integrated | Yes | — | See "Not yet integrated" below |
| AbuseIPDB | Not yet integrated | Yes | — | See "Not yet integrated" below |
| WHOIS (raw) | Not used — replaced by RDAP | — | — | RDAP is WHOIS's free, CORS-friendly, structured successor |

## Mandatory: Firebase project config
Not a secret — Firebase's own docs explicitly state the Web SDK config (`apiKey`, `authDomain`, `projectId`, etc. in `firebase-init.js`) is safe to be public; access control is enforced by `firestore.rules`, not by hiding this object. Get it from **Firebase Console → Project Settings → General → Your apps → Web app → SDK setup and configuration**.

## Optional: Mesh API (Tier 1 AI)
- **What it does:** deep, cloud-based scam explanation for pasted messages/screenshots.
- **Key location:** `firebase functions:secrets:set MESH_API_KEY` — never in any repo file.
- **Failure mode:** `functions/aiStatus.js` reports availability to the client; if unreachable, the UI automatically shows the Tier 2 (on-device AI) or Tier 3 (pure local) fallback instead of erroring.

## Optional: Numverify (phone carrier lookup)
- **What it does:** returns carrier, location, and line-type (flagging VoIP/toll-free numbers as higher risk).
- **Key location:** `firebase functions:secrets:set NUMVERIFY_API_KEY`.
- **Why a Cloud Function proxy is required (not optional):** Numverify's free tier only supports the plain `http://` endpoint; a browser on QRaksha's `https://` site is blocked by the browser itself from calling an `http://` endpoint (mixed-content policy). `functions/phoneLookup.js` calls it server-side, where this restriction doesn't apply, and returns the result to the browser over HTTPS.
- **Get a key:** register free at https://numverify.com — 100 lookups/month free tier.
- **Failure mode:** any non-200 from the function (including "key not configured yet") is silently absorbed; the client always still gets its local pattern-analysis result.

## Optional (free, no key): phishunt.io
- Free, no signup, CORS-enabled, aggregates PhishTank + OpenPhish + Google Safe Browsing + urlscan.io internally. Called directly from `verification-engine.js`'s `checkPhishuntFeed()`. PhishTank's own direct API has been closed to new registrations since 2020, which is why this aggregator is used instead of PhishTank directly.

## Optional (free, no key): RDAP domain-age check
- `rdap.org` is a free public gateway to every TLD registry's RDAP service (WHOIS's structured, CORS-friendlier modern replacement). Used in `checkDomainAge()` to flag domains registered in the last 30/180 days as higher risk. No key, no rate-limit registration needed for reasonable use.

## Optional (free, no key): On-device AI — wllama + Qwen2.5-1.5B-Instruct-GGUF
See `OFFLINE_AI_GUIDE.md` for the full explanation. No API key at all — the model file is fetched once from Hugging Face's public CDN and cached in the browser.

## Not yet integrated (would need a key you'd have to obtain)
These two were mentioned in project planning but aren't wired in yet — adding them is a future task, not something silently missing by accident:
- **Google Safe Browsing API** — free tier via Google Cloud Console (enable "Safe Browsing API", create an API key, restrict it to that API). Would slot into `verifyWebsiteLink()` as another optional cross-check, following the same "skip silently if no key configured" pattern as Numverify.
- **AbuseIPDB** — free tier (1,000 checks/day) via https://www.abuseipdb.com/register — useful for IP-reputation checks if QRaksha ever resolves a domain to an IP and wants to check that IP's abuse history specifically (currently not done — domain-level checks only).

## Rate limits & abuse protection already in place
- `functions/rateLimiter.js` applies a per-IP rate limit to every Cloud Function (Mesh AI check, phone lookup) — protects your Firebase budget from being drained by a single abusive client even before you touch billing alerts.
- `firestore.rules` restricts `success_stories` and `verified_scam_signatures` to validated, schema-checked **creates only** — no client can read/update/delete arbitrary Firestore data.
