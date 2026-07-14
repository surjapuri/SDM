# QRaksha — Deployment Guide

## Environments
QRaksha uses a simple two-environment model, matched to how it's actually built (no build step, no staging server needed for the frontend):

| Environment | What it is | How to deploy |
|---|---|---|
| **Local preview** | Your own machine/phone, before pushing | `python3 -m http.server` inside `docs/`, or just open `index.html` directly for non-camera features |
| **Production** | `https://imtiyazkth.github.io/QRaksha/` (GitHub Pages) + Firebase Functions/Firestore (`qraksha-india` project) | `git push origin main` (frontend) + `firebase deploy` (backend) |

There is no separate "staging" site today — if you want one before a risky change, the simplest option is a second GitHub repo (or a branch + GitHub Pages preview via a second `gh-pages`-style branch) pointed at Firebase's free "preview channels" (`firebase hosting:channel:deploy`) — not currently set up, listed here as a future option rather than assumed to exist.

## Pre-push validation checklist
Run these before every push — they catch the exact class of bugs (missing script tags, broken HTML, invalid JSON) that have bitten this project before:
```bash
cd qr-verify-scam-shield

# 1. Every JS file must parse
for f in $(find docs/js functions -name "*.js"); do
  node --check "$f" || echo "SYNTAX ERROR: $f"
done

# 2. Every JSON file must be valid
for f in $(find docs/data -name "*.json"); do
  python3 -c "import json; json.load(open('$f'))" || echo "JSON ERROR: $f"
done

# 3. HTML tags should balance (rough but catches real breakage)
cd docs
echo "div open/close:"; grep -c "<div" index.html; grep -c "</div>" index.html
echo "section open/close:"; grep -c "<section" index.html; grep -c "</section>" index.html

# 4. Every script tag referenced must exist as a file
grep -oP '(?<=src=")js/[a-zA-Z0-9_\-]+\.js' index.html | while read -r f; do
  [ -f "$f" ] || echo "MISSING FILE REFERENCED IN index.html: $f"
done
```

## Frontend deployment (GitHub Pages)
```bash
git add .
git commit -m "your message"
git push origin main
```
GitHub Pages redeploys automatically from the `docs/` folder 1–2 minutes after the push. No build step, no CI needed for the frontend itself (the only GitHub Action in this repo is `update-blocklists.yml`, which refreshes the free threat-intel feeds weekly — unrelated to deploying code changes).

## Backend deployment (Firebase Functions + Firestore rules)
```bash
# Functions (only needed when you change files under functions/)
npx firebase-tools deploy --only functions --project qraksha-india

# Firestore security rules (only needed when firestore.rules changes)
npx firebase-tools deploy --only firestore:rules --project qraksha-india

# Both hosting config + functions + rules in one go, if ever needed
npx firebase-tools deploy --project qraksha-india
```

## Secrets — set once, persist across deploys
```bash
firebase functions:secrets:set MESH_API_KEY --project qraksha-india
firebase functions:secrets:set NUMVERIFY_API_KEY --project qraksha-india
```
These never live in any file in this repo — Firebase Secret Manager holds them, and `functions/*.js` reference them via `defineSecret(...)`.

## Docker / containerization
This project has no server process to containerize on the frontend side — it's static files, and Firebase Functions are already a managed serverless environment (no Docker needed, no server to patch/maintain). If you ever add a custom backend service outside Firebase Functions, that would be the point to introduce a `Dockerfile` — not needed for the current architecture.

## CI/CD (current state, and what's optional to add later)
Currently: none for the app code itself (relying on the pre-push validation checklist above, run manually). The one existing workflow (`update-blocklists.yml`) only refreshes data files, not code.

**Optional future addition** (not yet implemented — a real "would help" suggestion, not something already there): a GitHub Action that runs the same `node --check`/JSON-validation steps above automatically on every push, failing the build before a broken `index.html` or syntax error ever reaches GitHub Pages. This is a genuinely valuable next step given how many of the bugs found in this project so far were exactly this class of error.

## Rollback
Since GitHub Pages serves directly from `main`, rollback is a plain git revert:
```bash
git log --oneline          # find the last known-good commit
git revert <bad-commit-sha>
git push origin main
```

## Post-deploy smoke test (do this after every push, takes under a minute)
1. Open `https://imtiyazkth.github.io/QRaksha/` in an incognito/private window (avoids any stale cache confusion).
2. Confirm the Home tab loads with the category grid.
3. Scan any QR code (or paste a UPI string into a QR-testing tool) and confirm a result card renders.
4. Switch language via the 文/A button and confirm the UI text changes.
5. Check the browser console (F12 → Console) for any red errors — a clean console is the single fastest way to catch a missing-script-tag class of bug before a user reports it.
