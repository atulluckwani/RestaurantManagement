import { orderStore } from "../data/fileStore";
import { Order } from "../types";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;

export const updateOrderStatuses = () => {
  const now = Date.now();
  const orders = orderStore.read() as Order[];

  let changed = false;

  for (const order of orders) {
    if (order.status !== "In process") {
      continue;
    }

    const createdAt = new Date(order.createdAt).getTime();
    if (!Number.isFinite(createdAt)) {
      continue;
    }

    if (now - createdAt >= THIRTY_MINUTES_MS) {
      order.status = "Delivered";
      order.deliveredAt = new Date(now).toISOString();
      changed = true;
    }
  }

  if (changed) {
    orderStore.write(orders);
  }
};

export const startOrderStatusScheduler = () => {
  updateOrderStatuses();
  setInterval(updateOrderStatuses, 60 * 1000);
};
