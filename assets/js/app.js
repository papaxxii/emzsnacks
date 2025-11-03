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
        // choose an image by simple mapping
        const imageMap = {
          'banana chips': 'images/banana_chips.jpg',
          'chicharon': 'images/chicharon.jpg',
          'otap': 'images/otap.jpg',
          'kwek-kwek': 'images/kwek-kwek.jpg',
          'fishball': 'images/fishball.jpg'
        };
        const key = s.name.toLowerCase();
        const img = imageMap[key] || 'images/banana_chips.jpg';
        const description = (s.name === 'Banana Chips') ? 'Crispy, lightly salted banana chips — small batch.' : 'Delicious local favorite.';
        div.innerHTML = `
          <div class="panel-heading">${s.name}</div>
          <div class="product-media"><img src="${img}" alt="${s.name}"></div>
          <div class="panel-body">
            <div class="product-desc">${description}</div>
            <div class="product-meta">
              <div class="price-badge">₱${s.price}</div>
              <button class="btn btn-success">Add to cart</button>
            </div>
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
      // overlay for mobile
      let overlay = document.querySelector('.menu-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', () => {
          sidebarEl.classList.remove('open');
          menuTrigger.setAttribute('aria-expanded', 'false');
          overlay.classList.remove('visible');
        });
      }
      // toggle overlay visibility
      if (sidebarEl.classList.contains('open')) {
        overlay.classList.add('visible');
        // move focus into first sidebar link for accessibility
        const firstLink = sidebarEl.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        overlay.classList.remove('visible');
      }
    });

    // Close sidebar when a menu link is clicked (mobile)
    sidebarEl.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a && window.innerWidth < 900) {
        sidebarEl.classList.remove('open');
        menuTrigger.setAttribute('aria-expanded', 'false');
        // update active menu state
        updateActiveMenu();
      }
    });
  }

  // Keep sidebar/main menu aria-current in sync with the location.hash
  function updateActiveMenu() {
    const menuLinks = document.querySelectorAll('.mainMenu .menu a');
    const currentHash = (window.location.hash || '#section-intro').toLowerCase();
    menuLinks.forEach(a => {
      try {
        const href = a.getAttribute('href') || '';
        if (href.trim().toLowerCase() === currentHash) {
          a.setAttribute('aria-current', 'true');
        } else {
          a.removeAttribute('aria-current');
        }
      } catch (e) { /* ignore malformed hrefs */ }
    });
  }

  // update on load and when hash changes
  updateActiveMenu();
  window.addEventListener('hashchange', updateActiveMenu);

  // Enhanced navigation: smooth scroll with header offset + IntersectionObserver for active link
  const headerEl = document.querySelector('.pageHeader');
  const navLinks = Array.from(document.querySelectorAll('.mainMenu .menu a[href^="#"]'));

  function getHeaderHeight() {
    if (!headerEl) return 0;
    return Math.max(headerEl.offsetHeight, 56); // fallback
  }

  navLinks.forEach(a => {
    a.addEventListener('click', (ev) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        ev.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight() - 8;
        window.scrollTo({top: y, behavior: 'smooth'});
        // update hash without jumping
        history.replaceState(null, '', '#' + id);
        // close mobile sidebar if open
        if (window.innerWidth < 900 && sidebarEl) {
          sidebarEl.classList.remove('open');
          menuTrigger && menuTrigger.setAttribute('aria-expanded', 'false');
          const overlay = document.querySelector('.menu-overlay');
          if (overlay) overlay.classList.remove('visible');
        }
        // update UI active state
        updateActiveMenu();
      }
    });
  });

  // Observe sections to update active link on scroll
  const sectionEls = Array.from(document.querySelectorAll('main section[id], section[id]'));
  if ('IntersectionObserver' in window && sectionEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          // set hash without scrolling
          history.replaceState(null, '', '#' + id);
          updateActiveMenu();
        }
      });
    }, {root: null, rootMargin: `-${getHeaderHeight() + 8}px 0px -40% 0px`, threshold: 0.25});
    sectionEls.forEach(s => io.observe(s));
  }
});
