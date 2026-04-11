(() => {
const {
  INDIAN_STATES,
  formatMoney,
  getCart,
  saveCart,
  removeFromCart,
  placeOrder
} = window.RestaurantShared;

const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const billingToggle = document.getElementById("billingToggle");
const billingForm = document.getElementById("billingForm");
const orderPlacedInfo = document.getElementById("orderPlacedInfo");
const stateSelect = document.getElementById("state");

const addressFields = {
  flatHomeDetails: document.getElementById("flatHomeDetails"),
  area: document.getElementById("area"),
  landmark: document.getElementById("landmark"),
  pinCode: document.getElementById("pinCode"),
  city: document.getElementById("city"),
  state: stateSelect
};

const populateStates = () => {
  stateSelect.innerHTML = '<option value="">Select state</option>';
  INDIAN_STATES.forEach((state) => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
};

const renderCart = () => {
  const cart = getCart();
  cartList.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "No items in cart yet.";
    cartList.appendChild(empty);
  }

  let total = 0;

  cart.forEach((entry) => {
    const lineTotal = entry.price * entry.quantity;
    total += lineTotal;

    const li = document.createElement("li");
    li.className = "cart-row";
    li.innerHTML = `
      <div>
        <strong>${entry.name}</strong><br />
        <small>${entry.quantity} x Rs ${formatMoney(entry.price)} = Rs ${formatMoney(lineTotal)}</small>
      </div>
      <button class="btn-danger" data-remove-item="${entry.itemId}">Delete</button>
    `;
    cartList.appendChild(li);
  });

  cartTotal.textContent = formatMoney(total);
};

cartList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const itemId = target.dataset.removeItem;
  if (!itemId) {
    return;
  }

  removeFromCart(itemId);
  renderCart();
});

billingToggle.addEventListener("click", () => {
  const cart = getCart();
  if (cart.length === 0) {
    orderPlacedInfo.textContent = "Add at least one item before billing.";
    return;
  }

  billingForm.classList.toggle("hidden");
});

billingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    orderPlacedInfo.textContent = "Cart is empty.";
    return;
  }

  const address = {
    flatHomeDetails: addressFields.flatHomeDetails.value.trim(),
    area: addressFields.area.value.trim(),
    landmark: addressFields.landmark.value.trim(),
    pinCode: addressFields.pinCode.value.trim(),
    city: addressFields.city.value.trim(),
    state: addressFields.state.value
  };

  const items = cart.map((item) => ({ itemId: item.itemId, quantity: item.quantity }));

  try {
    const order = await placeOrder({ address, items });
    orderPlacedInfo.textContent = `Order placed. Your Order ID is ${order.orderId}. Current status: ${order.status}`;
    saveCart([]);
    billingForm.reset();
    billingForm.classList.add("hidden");
    renderCart();
  } catch (error) {
    orderPlacedInfo.textContent = error.message;
  }
});

populateStates();
renderCart();
})();
