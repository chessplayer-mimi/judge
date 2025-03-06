// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTGQMyAEXaznNzoOTwAfhKX8vevLQP76U",
  authDomain: "judge-959d3.firebaseapp.com",
  projectId: "judge-959d3",
  storageBucket: "judge-959d3.firebasestorage.app",
  messagingSenderId: "349303635393",
  appId: "1:349303635393:web:b3908027173411a23f8340",
  measurementId: "G-6SSVCN9NHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);