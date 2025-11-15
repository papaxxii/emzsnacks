// public/js/cart.js
import { initializeFirebase } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

export async function initCartPage(opts={}) {
  const cfg = await initializeFirebase();
  const db = cfg.db;
  const auth = cfg.auth;
  const container = document.getElementById(opts.containerId||'cart-container');
  renderCart(container);

  async function renderCart(el) {
    const cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
    if (!cart.length) { el.innerHTML = '<div class="loading-placeholder">Your cart is empty</div>'; return; }
    el.innerHTML = cart.map(item=>`
      <div class="product-row">
        <img src="${item.image||'assets/images/placeholder.png'}">
        <div style="flex:1">
          <strong>${escape(item.title)}</strong>
          <div>₱${(item.price||0).toFixed(2)} x <input class="qty" data-id="${item.id}" type="number" value="${item.qty}" min="1" style="width:60px"/></div>
        </div>
        <div><button class="btn" data-id="${item.id}" data-action="remove">Remove</button></div>
      </div>
    `).join('') + `<div style="margin-top:1rem"><strong>Total: ₱${cart.reduce((s,i)=>s+(i.qty*(i.price||0)),0).toFixed(2)}</strong></div>
      <div style="margin-top:1rem">
        <button id="checkout-btn" class="btn primary">Checkout</button>
      </div>`;

    el.querySelectorAll('button[data-action="remove"]').forEach(b=>b.addEventListener('click', removeItem));
    el.querySelectorAll('.qty').forEach(inp=>inp.addEventListener('change', updateQty));
    document.getElementById('checkout-btn').addEventListener('click', checkout);
  }

  function removeItem(e) {
    const id = e.currentTarget.dataset.id;
    let cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
    cart = cart.filter(i=>i.id!==id);
    localStorage.setItem('emz_cart', JSON.stringify(cart));
    renderCart(container);
  }

  function updateQty(e) {
    const id = e.currentTarget.dataset.id; const val = Number(e.currentTarget.value||1);
    const cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
    const idx = cart.findIndex(i=>i.id===id);
    if (idx>=0) cart[idx].qty = val;
    localStorage.setItem('emz_cart', JSON.stringify(cart));
    renderCart(container);
  }

  async function checkout() {
    const user = auth.currentUser;
    if (!user) {
      if (!confirm('You must sign in to checkout. Sign in now?')) return;
      location.href = 'shop.html'; // minimal flow; implement proper login modal in future
      return;
    }
    const cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
    if (!cart.length) return alert('Cart empty');
    try {
      await addDoc(collection(db,'orders'), { userId: user.uid, items: cart, total: cart.reduce((s,i)=>s+(i.qty*(i.price||0)),0), status:'pending', createdAt: serverTimestamp() });
      localStorage.removeItem('emz_cart');
      alert('Order placed! Thank you.');
      location.href = 'index.html';
    } catch (e) {
      console.error(e);
      alert('Failed to place order');
    }
  }
}

function escape(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
