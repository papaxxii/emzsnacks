// public/js/auth.js
const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const closeAuth = document.getElementById('close-auth');
const authForm = document.getElementById('auth-form');

if (authBtn) authBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
if (closeAuth) closeAuth.addEventListener('click', () => authModal.classList.add('hidden'));

if (authForm) {
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authForm.email.value;
    const password = authForm.password.value;
    try {
      const userCred = await auth.signInWithEmailAndPassword(email, password);
      // Optional: check role in Firestore
      const doc = await db.collection('users').doc(userCred.user.uid).get();
      const role = doc.exists ? doc.data().role : 'customer';
      if (role === 'admin') window.location = 'admin.html';
      else window.location = 'shop.html';
    } catch (err) {
      // If login fails, attempt register
      try {
        const reg = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection('users').doc(reg.user.uid).set({ email, role: 'customer', createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        window.location = 'shop.html';
      } catch (err2) {
        alert(err2.message);
      }
    }
  });
}
