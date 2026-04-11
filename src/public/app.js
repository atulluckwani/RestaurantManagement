const menuContainer = document.getElementById("menuContainer");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const billingToggle = document.getElementById("billingToggle");
const billingForm = document.getElementById("billingForm");
const addressInput = document.getElementById("address");
const orderPlacedInfo = document.getElementById("orderPlacedInfo");

const trackInput = document.getElementById("trackInput");
const trackButton = document.getElementById("trackButton");
const trackingResult = document.getElementById("trackingResult");

const managerLoginForm = document.getElementById("managerLoginForm");
const managerUsername = document.getElementById("managerUsername");
const managerPassword = document.getElementById("managerPassword");
const managerStatus = document.getElementById("managerStatus");
const managerTableWrapper = document.getElementById("managerTableWrapper");
const managerOrdersBody = document.getElementById("managerOrdersBody");
const managerRefresh = document.getElementById("managerRefresh");
const managerLogout = document.getElementById("managerLogout");

let menuByCuisine = {};
let menuById = {};
let cart = [];

const formatMoney = (value) => value.toLocaleString("en-IN");

const renderMenu = () => {
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
          <small>Rs ${formatMoney(item.price)}</small>
        </div>
        <button class="btn-primary" data-item-id="${item.id}">Add to cart</button>
      `;
      group.appendChild(row);
    });

    menuContainer.appendChild(group);
  });
};

const renderCart = () => {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No items in cart yet.";
    cartList.appendChild(empty);
  }

  let total = 0;
  cart.forEach((entry) => {
    const line = entry.price * entry.quantity;
    total += line;
    const li = document.createElement("li");
    li.textContent = `${entry.name} x ${entry.quantity} = Rs ${formatMoney(line)}`;
    cartList.appendChild(li);
  });

  cartTotal.textContent = formatMoney(total);
};

const addToCart = (itemId) => {
  const item = menuById[itemId];
  if (!item) {
    return;
  }

  const existing = cart.find((entry) => entry.itemId === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ itemId, name: item.name, price: item.price, quantity: 1 });
  }

  renderCart();
};

const loadMenu = async () => {
  const response = await fetch("/api/menu");
  const data = await response.json();
  menuByCuisine = data;

  menuById = {};
  Object.values(data).flat().forEach((item) => {
    menuById[item.id] = item;
  });

  renderMenu();
};

const placeOrder = async (address) => {
  const items = cart.map((item) => ({ itemId: item.itemId, quantity: item.quantity }));
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, items })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Order failed");
  }

  return response.json();
};

const trackOrder = async (orderId) => {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  if (!response.ok) {
    throw new Error("Order not found");
  }

  return response.json();
};

const loadManagerOrders = async () => {
  const response = await fetch("/api/manager/orders", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  const orders = await response.json();
  managerOrdersBody.innerHTML = "";

  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.orderId}</td>
      <td>${order.address}</td>
      <td>${order.items.map((it) => `${it.name} x ${it.quantity}`).join(", ")}</td>
      <td>Rs ${formatMoney(order.totalPrice)}</td>
      <td>${order.status}</td>
      <td>${new Date(order.createdAt).toLocaleString()}</td>
    `;
    managerOrdersBody.appendChild(tr);
  });
};

menuContainer.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const itemId = target.dataset.itemId;
  if (itemId) {
    addToCart(itemId);
  }
});

billingToggle.addEventListener("click", () => {
  if (cart.length === 0) {
    orderPlacedInfo.textContent = "Add at least one item before billing.";
    return;
  }

  billingForm.classList.toggle("hidden");
});

billingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const order = await placeOrder(addressInput.value.trim());
    orderPlacedInfo.textContent = `Order placed. Your Order ID is ${order.orderId}. Current status: ${order.status}`;
    cart = [];
    billingForm.reset();
    billingForm.classList.add("hidden");
    renderCart();
    trackInput.value = order.orderId;
  } catch (error) {
    orderPlacedInfo.textContent = error.message;
  }
});

trackButton.addEventListener("click", async () => {
  const orderId = trackInput.value.trim();
  if (!orderId) {
    trackingResult.textContent = "Please enter an order id.";
    return;
  }

  try {
    const order = await trackOrder(orderId);
    trackingResult.innerHTML = `
      <strong>Order:</strong> ${order.orderId}<br />
      <strong>Status:</strong> ${order.status}<br />
      <strong>Total:</strong> Rs ${formatMoney(order.totalPrice)}<br />
      <strong>Address:</strong> ${order.address}
    `;
  } catch (error) {
    trackingResult.textContent = error.message;
  }
});

managerLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    username: managerUsername.value.trim(),
    password: managerPassword.value.trim()
  };

  const response = await fetch("/api/manager/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    managerStatus.textContent = "Invalid credentials.";
    managerTableWrapper.classList.add("hidden");
    return;
  }

  managerStatus.textContent = "Manager login successful.";
  managerTableWrapper.classList.remove("hidden");
  loadManagerOrders();
});

managerRefresh.addEventListener("click", async () => {
  try {
    await loadManagerOrders();
  } catch {
    managerStatus.textContent = "Session expired. Please login again.";
    managerTableWrapper.classList.add("hidden");
  }
});

managerLogout.addEventListener("click", async () => {
  await fetch("/api/manager/logout", { method: "POST", credentials: "include" });
  managerStatus.textContent = "Logged out.";
  managerTableWrapper.classList.add("hidden");
});

const init = async () => {
  await loadMenu();
  renderCart();
};

init();
