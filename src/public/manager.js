(() => {
const { loginManager, fetchManagerOrders, logoutManager, formatMoney, formatAddress } = window.RestaurantShared;

const managerLoginForm = document.getElementById("managerLoginForm");
const managerUsername = document.getElementById("managerUsername");
const managerPassword = document.getElementById("managerPassword");
const managerStatus = document.getElementById("managerStatus");
const managerTableWrapper = document.getElementById("managerTableWrapper");
const managerOrdersBody = document.getElementById("managerOrdersBody");
const managerRefresh = document.getElementById("managerRefresh");
const managerLogout = document.getElementById("managerLogout");

const renderOrders = async () => {
  const orders = await fetchManagerOrders();
  managerOrdersBody.innerHTML = "";

  orders.forEach((order) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.orderId}</td>
      <td>${formatAddress(order.address)}</td>
      <td>${order.items.map((it) => `${it.name} x ${it.quantity}`).join(", ")}</td>
      <td>Rs ${formatMoney(order.totalPrice)}</td>
      <td>${order.status}</td>
      <td>${new Date(order.createdAt).toLocaleString()}</td>
    `;
    managerOrdersBody.appendChild(tr);
  });
};

managerLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await loginManager(managerUsername.value.trim(), managerPassword.value.trim());
    managerStatus.textContent = "Manager login successful.";
    managerTableWrapper.classList.remove("hidden");
    await renderOrders();
  } catch (error) {
    managerStatus.textContent = error.message;
    managerTableWrapper.classList.add("hidden");
  }
});

managerRefresh.addEventListener("click", async () => {
  try {
    await renderOrders();
  } catch {
    managerStatus.textContent = "Session expired. Please login again.";
    managerTableWrapper.classList.add("hidden");
  }
});

managerLogout.addEventListener("click", async () => {
  await logoutManager();
  managerStatus.textContent = "Logged out.";
  managerTableWrapper.classList.add("hidden");
});
})();
