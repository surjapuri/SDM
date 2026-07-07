/* ==========================================================================
   FIREBASE-INIT.JS
   Initializes the Firebase client SDK (v10, modular, loaded as ES modules
   directly from the CDN in index.html) and exposes `db` + the Firestore
   helpers story-submit.js needs, so success stories can be written
   straight from the browser instead of depending on the un-deployed
   `submitStory` Cloud Function.

   ⚠️ ACTION NEEDED: replace the placeholder values below with your real
   Firebase Web App config. Find it at:
   Firebase Console → Project Settings (⚙️) → General tab → "Your apps" →
   Web app → SDK setup and configuration → "Config".
   This config is safe to be public (it's not a secret key) — it only
   identifies which Firebase project to talk to. Actual data access is
   controlled by firestore.rules, not by hiding this object.
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "qraksha-india.firebaseapp.com",
  projectId: "qraksha-india",
  storageBucket: "qraksha-india.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.QRVFirebase = {
  async addSuccessStory(payload) {
    const ref = collection(db, "success_stories");
    return addDoc(ref, { ...payload, submittedAt: serverTimestamp() });
  },
};

window.dispatchEvent(new CustomEvent("qrv:firebase-ready"));
