// public/js/auth.js
import { initializeFirebase } from './firebase-init.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

let auth, db;
export async function initAuth() {
  const cfg = await initializeFirebase();
  auth = cfg.auth;
  db = cfg.db;

  onAuthStateChanged(auth, async (user) => {
    const btn = document.getElementById('auth-toggle');
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      btn.textContent = 'Account';
      // Optionally show profile menu
    } else {
      btn.textContent = 'Sign In';
    }
  });

  // simple sign-in flow (replace with modal)
  document.getElementById('auth-toggle')?.addEventListener('click', () => {
    const email = prompt('Email');
    const pass = prompt('Password');
    if (!email || !pass) return;
    signInWithEmailAndPassword(auth, email, pass).catch(async (err) => {
      // try register
      if (confirm('User not found. Register instead?')) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          await setDoc(doc(db, 'users', cred.user.uid), { email, role: 'customer', createdAt: new Date() });
          alert('Registered & signed in');
        } catch (e) { alert(e.message); }
      } else alert(err.message);
    });
  });
}
