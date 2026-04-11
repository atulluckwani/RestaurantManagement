import { Router } from "express";
import { menuCatalog, menuByCuisine } from "../data/menuCatalog";
import { orderStore } from "../data/fileStore";
import { managerAuth } from "../middleware/managerAuth";
import { createSession, deleteSession, hasSession } from "../services/sessionStore";
import { CartItemInput, DeliveryAddress, Order, OrderItem } from "../types";

export const restaurantRouter = Router();

const INDIAN_STATES = new Set([
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
]);

const isValidAddress = (address: unknown): address is DeliveryAddress => {
  if (typeof address !== "object" || address === null) {
    return false;
  }

  const payload = address as Record<string, unknown>;
  const flatHomeDetails = typeof payload.flatHomeDetails === "string" ? payload.flatHomeDetails.trim() : "";
  const area = typeof payload.area === "string" ? payload.area.trim() : "";
  const landmark = typeof payload.landmark === "string" ? payload.landmark.trim() : "";
  const pinCode = typeof payload.pinCode === "string" ? payload.pinCode.trim() : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const state = typeof payload.state === "string" ? payload.state.trim() : "";

  return (
    flatHomeDetails.length > 0 &&
    area.length > 0 &&
    landmark.length > 0 &&
    /^\d{6}$/.test(pinCode) &&
    city.length > 0 &&
    INDIAN_STATES.has(state)
  );
};

const generateOrderId = (orders: Order[]): string => {
  const used = new Set(orders.map((order) => order.orderId));

  for (let attempt = 0; attempt < 2000; attempt += 1) {
    const candidate = String(Math.floor(10000 + Math.random() * 90000));
    if (!used.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Could not generate unique order id");
};

restaurantRouter.get("/menu", (_req, res) => {
  res.json(menuByCuisine);
});

restaurantRouter.post("/orders", (req, res) => {
  const { address, items } = req.body as {
    address?: DeliveryAddress;
    items?: CartItemInput[];
  };

  if (!isValidAddress(address)) {
    res.status(400).json({ message: "Valid delivery address is required" });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ message: "At least one cart item is required" });
    return;
  }

  const normalizedItems: OrderItem[] = [];

  for (const input of items) {
    const item = menuCatalog.find((entry) => entry.id === input.itemId);

    if (!item) {
      res.status(400).json({ message: `Unknown item id: ${input.itemId}` });
      return;
    }

    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      res.status(400).json({ message: `Invalid quantity for ${input.itemId}` });
      return;
    }

    normalizedItems.push({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity,
      lineTotal: item.price * quantity
    });
  }

  const orders = orderStore.read() as Order[];
  const order: Order = {
    orderId: generateOrderId(orders),
    address: {
      flatHomeDetails: address.flatHomeDetails.trim(),
      area: address.area.trim(),
      landmark: address.landmark.trim(),
      pinCode: address.pinCode.trim(),
      city: address.city.trim(),
      state: address.state.trim()
    },
    items: normalizedItems,
    totalPrice: normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    status: "In process",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  orderStore.write(orders);

  res.status(201).json(order);
});

restaurantRouter.get("/orders/:orderId", (req, res) => {
  const orders = orderStore.read() as Order[];
  const order = orders.find((entry) => entry.orderId === req.params.orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }

  res.json(order);
});

restaurantRouter.post("/manager/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (username !== "Admin" || password !== "Admin") {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = createSession();
  res.cookie("managerToken", token, {
    httpOnly: true,
    sameSite: "lax"
  });

  res.json({ message: "Login successful" });
});

restaurantRouter.get("/manager/session", (req, res) => {
  const token = req.cookies?.managerToken as string | undefined;
  const active = Boolean(token && hasSession(token));

  res.json({ active });
});

restaurantRouter.post("/manager/logout", (req, res) => {
  const token = req.cookies?.managerToken as string | undefined;
  if (token) {
    deleteSession(token);
  }

  res.clearCookie("managerToken");
  res.json({ message: "Logged out" });
});

restaurantRouter.get("/manager/orders", managerAuth, (_req, res) => {
  const orders = orderStore.read() as Order[];
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(sorted);
});
