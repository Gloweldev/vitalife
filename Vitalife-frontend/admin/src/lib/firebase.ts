import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyChZmWlnpNjbUPuASixfBP_0XOkPc7NOmI",
    authDomain: "vitalife-98ec1.firebaseapp.com",
    projectId: "vitalife-98ec1",
    storageBucket: "vitalife-98ec1.firebasestorage.app",
    messagingSenderId: "344791102570",
    appId: "1:344791102570:web:2666fc782810d5ec818613"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };
