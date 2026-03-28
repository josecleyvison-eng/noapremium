/* =====================================================
   NOÁ PREMIUM — firebase-config.js
   Preencha com as credenciais do seu projeto Firebase.
   Console: https://console.firebase.google.com
===================================================== */

const firebaseConfig = {
  apiKey:            "AIzaSyDR7TMD0244gWBvp7DAZ2e6UEQwXgvFV8M",
  authDomain:        "noa-premium.firebaseapp.com",
  projectId:         "noa-premium",
  storageBucket:     "noa-premium.firebasestorage.app",
  messagingSenderId: "93291865887",
  appId:             "1:93291865887:web:44675e760dbf352304f22a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
