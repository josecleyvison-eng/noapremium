/* =====================================================
   NOÁ PREMIUM — firebase-config.js
   Preencha com as credenciais do seu projeto Firebase.
   Console: https://console.firebase.google.com
===================================================== */

const firebaseConfig = {
  apiKey:            "COLE_AQUI_SUA_apiKey",
  authDomain:        "COLE_AQUI_SEU_authDomain",
  projectId:         "COLE_AQUI_SEU_projectId",
  storageBucket:     "COLE_AQUI_SEU_storageBucket",
  messagingSenderId: "COLE_AQUI_SEU_messagingSenderId",
  appId:             "COLE_AQUI_SEU_appId"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
