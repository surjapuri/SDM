# QRaksha — Termux Setup Guide

Everything needed to develop and deploy QRaksha entirely from an Android phone, no laptop required.

## One-time setup

```bash
# Update packages
pkg update -y && pkg upgrade -y

# Core tools
pkg install -y git nodejs python openssh

# Let Termux access your phone's shared storage (Downloads folder etc.)
termux-setup-storage

# Firebase CLI (via npx, no global install needed each time)
npm install -g firebase-tools
```

## Clone the project (first time only)
```bash
cd ~
git clone https://github.com/imtiyazkth/QRaksha.git qr-verify-scam-shield
cd qr-verify-scam-shield
```

## Everyday workflow: pull latest, make changes, push
```bash
cd ~/qr-verify-scam-shield
git pull origin main
```

### Applying a zip of changes (the pattern used throughout this project)
```bash
cd ~
cp ~/storage/downloads/<the-zip-file>.zip ~/
unzip -o <the-zip-file>.zip -d qraksha-temp
cp -r ~/qraksha-temp/qr-verify-scam-shield/* ~/qr-verify-scam-shield/
cd ~/qr-verify-scam-shield
git status
```
Always run `git status` before `git add .` — it shows exactly which files changed, which is your chance to catch anything unexpected before it's committed.

### Commit and push
```bash
git add .
git commit -m "describe what changed"
git push origin main
```

### Firebase login (first time only, needs a browser to complete)
```bash
npx firebase-tools login --no-localhost
```
This prints a URL — open it in your phone's browser, sign in, and paste the confirmation code back into Termux.

### Deploy Firebase Functions/rules
```bash
npx firebase-tools deploy --only functions --project qraksha-india
npx firebase-tools deploy --only firestore:rules --project qraksha-india
```

### Setting a secret (Mesh API key, Numverify key)
```bash
firebase functions:secrets:set MESH_API_KEY --project qraksha-india
# it will prompt you to paste the key value — paste and press Enter
```

## Editing files directly in Termux
```bash
nano docs/js/dashboard.js
```
`nano` shortcuts: `Ctrl+O` then `Enter` to save, `Ctrl+X` to exit. `Ctrl+K` cuts a line, `Ctrl+U` pastes it — useful for quick edits without a mouse.

## Validating before you push (catches the most common class of bug)
```bash
cd ~/qr-verify-scam-shield
for f in $(find docs/js functions -name "*.js"); do
  node --check "$f" || echo "SYNTAX ERROR: $f"
done
for f in $(find docs/data -name "*.json"); do
  python3 -c "import json; json.load(open('$f'))" || echo "JSON ERROR: $f"
done
```

## Common Termux gotchas specific to this project
- **`cd` fails with "No such file or directory"**: you're not inside the actual project folder — run `pwd` to check where you are, and `ls ~` to see your actual folder name (it might be `qr-verify-scam-shield` or something you renamed it to).
- **`firebase deploy` gives a 403 permission error mentioning the wrong project name**: run `npx firebase-tools use qraksha-india` to explicitly select the right project before deploying — Firebase CLI can default to a stale cached project alias.
- **A file edited in a text-messaging app (WhatsApp/keyboard autocorrect) breaks syntax**: always run the validation commands above after any manual edit, especially edits made by copy-pasting from a chat app, since autocorrect/smart-quotes can silently corrupt code (curly quotes `"..."` instead of straight `"..."` is the most common one).
