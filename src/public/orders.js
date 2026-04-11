(() => {
const { fetchOrder, formatMoney, formatAddress } = window.RestaurantShared;

const trackInput = document.getElementById("trackInput");
const trackButton = document.getElementById("trackButton");
const trackingResult = document.getElementById("trackingResult");

trackButton.addEventListener("click", async () => {
  const orderId = trackInput.value.trim();
  if (!orderId) {
    trackingResult.textContent = "Please enter an order id.";
    return;
  }

  try {
    const order = await fetchOrder(orderId);
    trackingResult.innerHTML = `
      <strong>Order:</strong> ${order.orderId}<br />
      <strong>Status:</strong> ${order.status}<br />
      <strong>Total:</strong> Rs ${formatMoney(order.totalPrice)}<br />
      <strong>Address:</strong> ${formatAddress(order.address)}
    `;
  } catch (error) {
    trackingResult.textContent = error.message;
  }
});
})();
