// public/js/shop.js
import { initializeFirebase } from './firebase-init.js';
import { collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

let db, products = [];

export async function initShop(opts = {}) {
  const cfg = await initializeFirebase();
  db = cfg.db;
  const grid = document.getElementById(opts.productGridId || 'product-grid');
  const search = document.getElementById(opts.searchId || 'search');
  const catList = document.getElementById(opts.categoryListId || 'category-list');
  const cartCountEl = document.getElementById(opts.cartCountId || 'cart-count');

  try {
    const q = query(collection(db,'products'), orderBy('title'));
    const snap = await getDocs(q);
    products = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    render(products, grid);
    updateCartCount(cartCountEl);
  } catch (e) {
    console.error(e);
    if (grid) grid.innerHTML = '<div class="loading-placeholder">Failed to load products.</div>';
  }

  search?.addEventListener('input', e => {
    const term = e.target.value.trim().toLowerCase();
    render(products.filter(p => (p.title||'').toLowerCase().includes(term) || (p.desc||'').toLowerCase().includes(term)), grid);
  });

  catList?.addEventListener('click', e => {
    const li = e.target.closest('li[data-cat]');
    if (!li) return;
    Array.from(catList.children).forEach(c=>c.classList.remove('active'));
    li.classList.add('active');
    const cat = li.dataset.cat;
    render(cat==='all'?products:products.filter(p=>p.category===cat), grid);
  });
}

function render(list, grid) {
  if (!grid) return;
  if (!list.length) { grid.innerHTML = '<div class="loading-placeholder">No products found</div>'; return; }
  grid.innerHTML = list.map(p=>`
    <article class="card" data-id="${p.id}">
      <img src="${p.image||'assets/images/placeholder.png'}" alt="${escapeHtml(p.title)}">
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">${escapeHtml(p.category||'')}</div>
      <div class="price">₱${(p.price||0).toFixed(2)}</div>
      <div style="display:flex;gap:.5rem;justify-content:center;margin-top:.6rem">
        <button class="btn" data-action="view" data-id="${p.id}">View</button>
        <button class="btn primary" data-action="add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>`).join('');
  attachEvents(grid);
}

function attachEvents(grid) {
  grid.querySelectorAll('button[data-action="add"]').forEach(btn=>btn.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    const item = products.find(p=>p.id===id);
    if (!item) return;
    addToCart(item);
  }));
  grid.querySelectorAll('button[data-action="view"]').forEach(btn=>btn.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    location.href = `product.html?id=${encodeURIComponent(id)}`;
  }));
}

function addToCart(item) {
  const cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
  const idx = cart.findIndex(c=>c.id===item.id);
  if (idx>=0) cart[idx].qty += 1;
  else cart.push({id:item.id,title:item.title,price:item.price||0,qty:1,image:item.image||''});
  localStorage.setItem('emz_cart', JSON.stringify(cart));
  updateCartCount(document.getElementById('cart-count'));
  showMessage('Added to cart');
}

function updateCartCount(el) {
  if (!el) return;
  const cart = JSON.parse(localStorage.getItem('emz_cart')||'[]');
  el.textContent = cart.reduce((s,i)=>s+(i.qty||0),0);
}

function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showMessage(msg){const t=document.createElement('div');t.className='loading-placeholder';t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),900);}
