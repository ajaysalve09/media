// appConfig.js 

// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app-check.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDx_-Bknqnak0TQ8aiGvl3U9Y-xukLRfPE",
  authDomain: "explore-app-cf813.firebaseapp.com",
  projectId: "explore-app-cf813",
  storageBucket: "explore-app-cf813.firebasestorage.app",
  messagingSenderId: "820998359374",
  appId: "1:820998359374:web:efb6d9da40c7c68382761f",
  measurementId: "G-P1D2Y4FMQX"
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Initialize AppCheck (optional, but recommended)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("6Lf5C8ErAAAAAIno4YL7-I5NzEY7owYNU57EJEsi"),
  isTokenAutoRefreshEnabled: true
});

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Utility: show messages on page
export function showMessage(elementId, message, type = "error") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.style.color = type === "error" ? "red" : "green";
  el.textContent = message;
}
