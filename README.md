E&M'z Minute Snacks — Local demo

Setup and deployment

1. Local preview
   - Serve the folder and open in browser:
     ```powershell
     cd 'C:\websites\E&M''z\Hinunangan'
     python -m http.server 8000
     # open http://localhost:8000
     ```

2. Firebase configuration (optional but required for production features)
   - Open your Firebase project (e.g. https://console.firebase.google.com)
   - In Project settings -> General, register a Web App and copy the firebaseConfig object.
   - Edit `js/firebase-config.js` and replace the placeholder with your config, e.g.:
     ```js
     window.EMNZ_FIREBASE_CONFIG = {
       apiKey: "...",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       appId: "1:...",
       storageBucket: "your-project.appspot.com"
     };
     ```
   - In Firebase Console > Authentication > Sign-in method: enable Email/Password.
   - In Firestore: Create database (start with test rules while seeding). After seeding, replace rules with `firestore.rules` from this repo.

3. Seeding sample snacks
   - After configuring Firebase and opening the site, run the `seed-snacks.js` snippet in the browser console (or paste its contents and run) to populate a few sample snacks.

4. Admin users
   - For security, create admin users via the Firebase Console (edit the `users/{uid}` document and set `role: 'admin'`) or implement a secure Cloud Function that sets admin role after server-side verification. Do NOT hard-code admin secrets in the client.

Security notes
- The repository contains a local demo fallback so you can try login/sign-up locally without Firebase (data is stored in localStorage). For production, enable real Firebase and use secure Firestore rules (see `firestore.rules`).
- Do not store secrets or admin keys client-side. Use Cloud Functions or server APIs for privileged operations.

Accessibility & SEO
- The site includes improved SEO meta tags (title, description, Open Graph) and a sitemap (`sitemap.xml`) and `robots.txt` file.
- Basic accessibility improvements: skip-to-content link, aria-labels for controls, sr-only helper, visible focus outlines.

Next steps you can ask me to do
- Wire an image upload path (Firebase Storage) for snack images and update the catalog UI.
- Build a small admin UI for CRUD on snacks (requires secure server or Cloud Functions).
- Implement payment integration (GCash) for checkout.
- Clean up remaining legacy content and polish responsive CSS for specific breakpoints.
