// app.js
document.addEventListener("DOMContentLoaded", () => {
  const catalog = document.querySelector("[data-emnz-catalog]");
  const search = document.querySelector("[data-emnz-search]");
  const cartContainer = document.querySelector("[data-emnz-cart]");
  const totalEl = document.querySelector("[data-emnz-cart-total]");
  
  const snacks = [
    { name: "Banana Chips", price: 45 },
    { name: "Chicharon", price: 60 },
    { name: "Otap", price: 30 },
    { name: "Kwek-Kwek", price: 25 },
    { name: "Fishball", price: 35 }
  ];
  
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  function renderCatalog(filter = "") {
    catalog.innerHTML = "";
    snacks
      .filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach(s => {
        const div = document.createElement("div");
        div.className = "panel";
        div.innerHTML = `
          <div class="panel-heading">${s.name}</div>
          <div class="panel-body">
            <div class="h4">₱${s.price}</div>
            <button class="btn btn-success">Add to cart</button>
          </div>
        `;
        div.querySelector("button").onclick = () => {
          cart.push(s);
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart();
        };
        catalog.appendChild(div);
      });
  }

  function renderCart() {
    cartContainer.innerHTML = "";
    let total = 0;
    cart.forEach((item, i) => {
      total += item.price;
      const div = document.createElement("div");
      div.className = "panel";
      div.innerHTML = `
        <div class="panel-heading">${item.name}</div>
        <div class="panel-body">₱${item.price}</div>
      `;
      cartContainer.appendChild(div);
    });
    totalEl.textContent = `₱${total.toFixed(2)}`;
  }

  search?.addEventListener("input", e => renderCatalog(e.target.value));
  renderCatalog();
  renderCart();

  // Mobile menu toggle: toggle sidebar open state for small screens
  const menuTrigger = document.querySelector('.menu-trigger');
  const sidebarEl = document.querySelector('.sidebar');
  if (menuTrigger && sidebarEl) {
    // Ensure accessible state
    menuTrigger.setAttribute('aria-expanded', 'false');
    menuTrigger.addEventListener('click', () => {
      const expanded = menuTrigger.getAttribute('aria-expanded') === 'true';
      menuTrigger.setAttribute('aria-expanded', String(!expanded));
      sidebarEl.classList.toggle('open');
    });

    // Close sidebar when a menu link is clicked (mobile)
    sidebarEl.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a && window.innerWidth < 900) {
        sidebarEl.classList.remove('open');
        menuTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
