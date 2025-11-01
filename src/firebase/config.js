// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAoYusW8DLdobGA3UhpEHzpEwtfDeh1_TM",
  authDomain: "work-model-3e122.firebaseapp.com",
  projectId: "work-model-3e122",
  storageBucket: "work-model-3e122.firebasestorage.app",
  messagingSenderId: "239715006018",
  appId: "1:239715006018:web:e6cfdf6104f311ffb39fdb",
  measurementId: "G-TS9NRV7H7K"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Storage
export const storage = getStorage(app)

// Initialize Authentication
export const auth = getAuth(app)

export default app
