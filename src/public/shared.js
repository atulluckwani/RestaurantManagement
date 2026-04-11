const CART_KEY = "restaurant_cart_v1";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const formatMoney = (value) => Number(value || 0).toLocaleString("en-IN");

const getCartItemCount = () =>
  getCart().reduce((total, entry) => total + Number(entry.quantity || 0), 0);

const syncCartNavCount = () => {
  const cartLinks = document.querySelectorAll('a[href="/cart.html"], a[href="cart.html"]');
  const count = getCartItemCount();

  cartLinks.forEach((link) => {
    link.textContent = `Cart (${count})`;
  });
};

const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  syncCartNavCount();
};

const addToCart = (item) => {
  const cart = getCart();
  const existing = cart.find((entry) => entry.itemId === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ itemId: item.id, name: item.name, price: item.price, quantity: 1 });
  }
  saveCart(cart);
};

const removeFromCart = (itemId) => {
  const cart = getCart().filter((entry) => entry.itemId !== itemId);
  saveCart(cart);
  return cart;
};

const fetchMenu = async () => {
  const response = await fetch("/api/menu");
  if (!response.ok) {
    throw new Error("Failed to load menu");
  }
  return response.json();
};

const fetchOrder = async (orderId) => {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
  if (!response.ok) {
    throw new Error("Order not found");
  }
  return response.json();
};

const placeOrder = async (payload) => {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Order failed");
  }

  return response.json();
};

const loginManager = async (username, password) => {
  const response = await fetch("/api/manager/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }
};

const fetchManagerOrders = async () => {
  const response = await fetch("/api/manager/orders", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json();
};

const logoutManager = async () => {
  await fetch("/api/manager/logout", { method: "POST", credentials: "include" });
};

const formatAddress = (address) => {
  if (typeof address === "string") {
    return address;
  }

  return [
    address.flatHomeDetails,
    address.area,
    address.landmark,
    `${address.city} - ${address.pinCode}`,
    address.state
  ]
    .filter(Boolean)
    .join(", ");
};

window.RestaurantShared = {
  INDIAN_STATES,
  formatMoney,
  getCart,
  getCartItemCount,
  saveCart,
  addToCart,
  removeFromCart,
  fetchMenu,
  fetchOrder,
  placeOrder,
  loginManager,
  fetchManagerOrders,
  logoutManager,
  formatAddress,
  syncCartNavCount
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncCartNavCount, { once: true });
} else {
  syncCartNavCount();
}
