// public/js/admin.js
import { initializeFirebase } from './firebase-init.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, orderBy, query } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

let db, storage, auth;

export async function initAdmin(opts = {}) {
  const cfg = await initializeFirebase();
  db = cfg.db;
  storage = cfg.storage;
  auth = cfg.auth;

  // Basic auth guard: check user is admin via users collection
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert('Not signed in. Redirecting to index');
      return window.location = 'index.html';
    }
    // Check role in Firestore
    try {
      const userDoc = await (await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js')).getDoc((await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js')).doc(db, 'users', user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;
      if (role !== 'admin') {
        alert('Not authorized');
        return window.location = 'index.html';
      }
      // load content
      loadProducts();
      loadOrders();
      setupAdminUI();
    } catch (e) {
      console.error('Auth role check error', e);
      alert('Authorization check failed');
      window.location = 'index.html';
    }
  });
}

async function loadProducts() {
  const el = document.getElementById('products-list');
  if (!el) return;
  try {
    const q = query(collection(db, 'products'), orderBy('title'));
    const snap = await getDocs(q);
    el.innerHTML = snap.docs.map(d => {
      const p = d.data();
      return `<div class="admin-row" data-id="${d.id}">
        <strong>${escapeHtml(p.title)}</strong> ₱${(p.price||0).toFixed(2)}
        <button class="btn small edit" data-id="${d.id}">Edit</button>
        <button class="btn small danger del" data-id="${d.id}">Delete</button>
      </div>`;
    }).join('');
    attachProductEvents();
  } catch (e) {
    el.textContent = 'Failed to load products';
    console.error(e);
  }
}

function attachProductEvents() {
  document.querySelectorAll('.admin-row .del').forEach(btn => btn.addEventListener('click', async (e) => {
    const id = e.currentTarget.dataset.id;
    if (!confirm('Delete product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }));
  // edit handlers omitted for brevity — can mirror add flow
}

async function loadOrders() {
  const el = document.getElementById('orders-list');
  if (!el) return;
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    el.innerHTML = snap.docs.map(d => {
      const o = d.data();
      return `<div class="order-row" data-id="${d.id}">
        <strong>Order ${d.id}</strong> — ${escapeHtml(o.status||'pending')}<div>Items: ${(o.items||[]).map(i=>escapeHtml(i.title)).join(', ')}</div>
      </div>`;
    }).join('');
  } catch (e) {
    el.textContent = 'Failed to load orders';
    console.error(e);
  }
}

function setupAdminUI() {
  document.getElementById('add-product-btn')?.addEventListener('click', () => {
    document.getElementById('product-modal').classList.remove('hidden');
  });
  document.getElementById('close-product-modal')?.addEventListener('click', () => {
    document.getElementById('product-modal').classList.add('hidden');
  });
  document.getElementById('product-form')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = ev.target;
    const title = form.title.value.trim();
    const price = Number(form.price.value || 0);
    const category = form.category.value;
    const desc = form.desc.value;
    const file = form.image.files[0];
    try {
      let imageUrl = '';
      if (file) {
        const r = storageRef(storage, `products/${Date.now()}_${file.name}`);
        await uploadBytes(r, file);
        imageUrl = await getDownloadURL(r);
      }
      await addDoc(collection(db, 'products'), { title, price, category, desc, image: imageUrl, createdAt: new Date() });
      form.reset();
      document.getElementById('product-modal').classList.add('hidden');
      loadProducts();
    } catch (e) {
      console.error(e);
      alert('Failed to save product');
    }
  });

  document.getElementById('admin-logout')?.addEventListener('click', async () => {
    try {
      await (await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js')).signOut((await import('./firebase-init.js')).auth);
      window.location = 'index.html';
    } catch (e) { console.warn(e); }
  });
}

function escapeHtml(s='') { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
