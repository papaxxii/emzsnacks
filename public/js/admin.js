// js/admin.js
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-storage.js";

export async function initAdmin({ productsListId, ordersListId }) {
  const { auth, db, storage } = await import('./firebase-init.js').then(m => m.initializeFirebase());

  const productsList = document.getElementById(productsListId);
  const ordersList = document.getElementById(ordersListId);

  const productModal = document.getElementById("product-modal");
  const closeModalBtn = document.getElementById("close-product-modal");
  const addProductBtn = document.getElementById("add-product-btn");
  const productForm = document.getElementById("product-form");

  let editingProductId = null;

  // Logout
  document.getElementById("admin-logout").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin-login.html"; // redirect to login
  });

  // Auth guard
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "admin-login.html";
  });

  // Show modal
  addProductBtn.addEventListener("click", () => {
    editingProductId = null;
    productForm.reset();
    productModal.classList.remove("hidden");
  });

  // Close modal
  closeModalBtn.addEventListener("click", () => productModal.classList.add("hidden"));

  // Load Snacks
  async function loadProducts() {
    productsList.innerHTML = "Loading…";
    const snacksSnapshot = await getDocs(collection(db, "snacks"));
    productsList.innerHTML = "";

    snacksSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("admin-item");
      div.innerHTML = `
        <strong>${data.title}</strong> - ₱${data.price}<br/>
        Category: ${data.category}<br/>
        <img src="${data.imageUrl}" width="80"/><br/>
        ${data.desc}<br/>
        <button class="edit-btn" data-id="${docSnap.id}">Edit</button>
        <button class="delete-btn" data-id="${docSnap.id}">Delete</button>
      `;
      productsList.appendChild(div);
    });

    // Edit & Delete buttons
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const docRef = doc(db, "snacks", btn.dataset.id);
        const docSnap = await getDocs(collection(db, "snacks"));
        const snackDoc = await getDoc(docRef);
        const data = snackDoc.data();

        editingProductId = btn.dataset.id;
        productForm.title.value = data.title;
        productForm.price.value = data.price;
        productForm.category.value = data.category;
        productForm.desc.value = data.desc;
        productModal.classList.remove("hidden");
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("Delete this snack?")) {
          await deleteDoc(doc(db, "snacks", btn.dataset.id));
          loadProducts();
        }
      });
    });
  }

  await loadProducts();

  // Submit Product Form
  productForm.addEventListener("submit", async e => {
    e.preventDefault();
    const title = productForm.title.value;
    const price = parseFloat(productForm.price.value);
    const category = productForm.category.value;
    const desc = productForm.desc.value;
    const imageFile = productForm.image.files[0];

    let imageUrl = "";
    if (imageFile) {
      const storageRef = ref(storage, `snacks/${Date.now()}-${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    if (editingProductId) {
      // Update
      const docRef = doc(db, "snacks", editingProductId);
      await updateDoc(docRef, { title, price, category, desc, ...(imageUrl && { imageUrl }) });
    } else {
      // Add new
      await addDoc(collection(db, "snacks"), { title, price, category, desc, imageUrl });
    }

    productModal.classList.add("hidden");
    productForm.reset();
    loadProducts();
  });

  // Load Orders (simple list)
  async function loadOrders() {
    ordersList.innerHTML = "Loading…";
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    ordersList.innerHTML = "";

    ordersSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("admin-item");
      div.innerHTML = `
        <strong>Order #${docSnap.id}</strong><br/>
        Customer: ${data.customerEmail}<br/>
        Total: ₱${data.totalPrice}<br/>
        Items: ${data.items.map(i=>i.title).join(", ")}<br/>
        Status: ${data.status || "Pending"}<br/>
      `;
      ordersList.appendChild(div);
    });
  }

  await loadOrders();
}
