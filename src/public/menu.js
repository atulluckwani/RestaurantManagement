(() => {
const shared = window.RestaurantShared || {};
const CART_KEY = "restaurant_cart_v1";

const formatMoney = (value) => {
  if (typeof shared.formatMoney === "function") {
    return shared.formatMoney(value);
  }
  return Number(value || 0).toLocaleString("en-IN");
};

const fallbackAddToCart = (item) => {
  let cart = [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cart = Array.isArray(parsed) ? parsed : [];
  } catch {
    cart = [];
  }

  const existing = cart.find((entry) => entry.itemId === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ itemId: item.id, name: item.name, price: item.price, quantity: 1 });
  }

  if (typeof shared.saveCart === "function") {
    shared.saveCart(cart);
    return;
  }

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Keep a last-resort cart in memory when storage is blocked.
    window.__restaurantCartMemory = cart;
  }
};

const addToCart = (item) => {
  if (typeof shared.addToCart === "function") {
    try {
      shared.addToCart(item);
      return;
    } catch {
      // Use local fallback if shared cart utility fails.
    }
  }

  fallbackAddToCart(item);
};

const fetchMenu = async () => {
  if (typeof shared.fetchMenu === "function") {
    return shared.fetchMenu();
  }

  const response = await fetch("/api/menu");
  if (!response.ok) {
    throw new Error("Failed to load menu");
  }

  return response.json();
};

const REQUIRED_MENU = {
  "North Indian": [
    { id: "ni-1", name: "Butter Chicken", price: 320 },
    { id: "ni-2", name: "Paneer Tikka", price: 260 },
    { id: "ni-3", name: "Dal Makhani", price: 220 },
    { id: "ni-4", name: "Naan Basket", price: 140 },
    { id: "ni-5", name: "Chole Bhature", price: 200 }
  ],
  "South Indian": [
    { id: "si-1", name: "Masala Dosa", price: 180 },
    { id: "si-2", name: "Idli Sambar", price: 140 },
    { id: "si-3", name: "Medu Vada", price: 150 },
    { id: "si-4", name: "Lemon Rice", price: 170 },
    { id: "si-5", name: "Curd Rice", price: 130 }
  ],
  Chinese: [
    { id: "ch-1", name: "Veg Hakka Noodles", price: 210 },
    { id: "ch-2", name: "Chilli Paneer", price: 250 },
    { id: "ch-3", name: "Schezwan Fried Rice", price: 230 },
    { id: "ch-4", name: "Spring Rolls", price: 190 },
    { id: "ch-5", name: "Manchurian Gravy", price: 240 }
  ]
};

const menuContainer = document.getElementById("menuContainer");
const info = document.getElementById("menuInfo");
let menuById = {};

const resolveItemFromButton = (button, itemId) => {
  const item = menuById[itemId];
  if (item) {
    return item;
  }

  const row = button.closest(".menu-item");
  if (!(row instanceof HTMLElement)) {
    return null;
  }

  const nameEl = row.querySelector("strong");
  const priceEl = row.querySelector("small");
  const name = nameEl ? nameEl.textContent.trim() : "";
  const priceText = priceEl ? priceEl.textContent : "";
  const match = priceText.match(/(\d[\d,]*)/);
  const price = match ? Number(match[1].replace(/,/g, "")) : 0;

  if (!name || price <= 0) {
    return null;
  }

  return { id: itemId, name, price };
};

const handleAddToCartClick = (button) => {
  if (!(info instanceof HTMLElement)) {
    return;
  }

  const itemId = button.dataset.itemId;
  if (!itemId) {
    return;
  }

  const resolvedItem = resolveItemFromButton(button, itemId);

  if (!resolvedItem) {
    info.textContent = "Could not add item. Please refresh and try again.";
    return;
  }

  try {
    addToCart(resolvedItem);
    info.textContent = `${resolvedItem.name} added to cart. Open Cart page to continue.`;
  } catch {
    info.textContent = "Add to cart failed due to browser storage restrictions.";
  }
};

const normalizeMenu = (menuByCuisine) => {
  const normalized = {};

  Object.entries(REQUIRED_MENU).forEach(([cuisine, fallbackItems]) => {
    const incoming = Array.isArray(menuByCuisine?.[cuisine]) ? menuByCuisine[cuisine] : [];
    const merged = [...incoming];

    fallbackItems.forEach((fallback) => {
      const exists = merged.some((item) => item.id === fallback.id);
      if (!exists) {
        merged.push({ ...fallback, cuisine });
      }
    });

    normalized[cuisine] = merged.slice(0, 5);
  });

  return normalized;
};

const indexMenu = (menuByCuisine) => {
  menuById = {};

  Object.values(menuByCuisine).forEach((items) => {
    items.forEach((item) => {
      menuById[item.id] = item;
    });
  });
};

const renderMenu = (rawMenuByCuisine) => {
  if (!(menuContainer instanceof HTMLElement)) {
    return;
  }

  const menuByCuisine = normalizeMenu(rawMenuByCuisine);
  indexMenu(menuByCuisine);
  menuContainer.innerHTML = "";

  Object.entries(menuByCuisine).forEach(([cuisine, items]) => {
    const group = document.createElement("div");
    group.className = "menu-group";
    group.innerHTML = `<h3>${cuisine}</h3>`;

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "menu-item";
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong><br />
          <small>Price: Rs ${formatMoney(item.price)}</small>
        </div>
        <button type="button" class="btn-primary" data-item-id="${item.id}">Add to cart</button>
      `;

      const button = row.querySelector("button[data-item-id]");
      if (button instanceof HTMLButtonElement) {
        button.onclick = () => {
          handleAddToCartClick(button);
        };
      }

      group.appendChild(row);
    });

    menuContainer.appendChild(group);
  });

};

const init = async () => {
  if (!(info instanceof HTMLElement)) {
    return;
  }

  info.textContent = "Menu ready. Tap Add to cart.";
  renderMenu(REQUIRED_MENU);

  try {
    const menuByCuisine = await fetchMenu();
    renderMenu(menuByCuisine);
  } catch (error) {
    info.textContent = `Menu API issue. Showing standard menu. ${error.message}`;
  }
};

init();
})();
