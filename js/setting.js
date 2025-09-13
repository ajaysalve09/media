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

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();

  // Redirect if not logged in
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.replace("../ac/login.html");
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      auth.signOut()
        .then(() => {
          window.location.replace("../ac/login.html");
        })
        .catch(err => {
          console.error("Sign out error:", err);
          alert("Failed to logout. Try again.");
        });
    });
  });
