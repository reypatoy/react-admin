// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnJj0DaI9ncHp1LM9u8mFUIch_FMdk9dI",
  authDomain: "talairon-water-billing.firebaseapp.com",
  projectId: "talairon-water-billing",
  storageBucket: "talairon-water-billing.appspot.com",
  messagingSenderId: "1014971639507",
  appId: "1:1014971639507:web:b9bd409b6cf5e395711626"
};
const fb = initializeApp(firebaseConfig);
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);
