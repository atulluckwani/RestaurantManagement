import { MenuItem } from "../types";

export const menuCatalog: MenuItem[] = [
  { id: "ni-1", name: "Butter Chicken", cuisine: "North Indian", price: 320 },
  { id: "ni-2", name: "Paneer Tikka", cuisine: "North Indian", price: 260 },
  { id: "ni-3", name: "Dal Makhani", cuisine: "North Indian", price: 220 },
  { id: "ni-4", name: "Naan Basket", cuisine: "North Indian", price: 140 },
  { id: "ni-5", name: "Chole Bhature", cuisine: "North Indian", price: 200 },

  { id: "si-1", name: "Masala Dosa", cuisine: "South Indian", price: 180 },
  { id: "si-2", name: "Idli Sambar", cuisine: "South Indian", price: 140 },
  { id: "si-3", name: "Medu Vada", cuisine: "South Indian", price: 150 },
  { id: "si-4", name: "Lemon Rice", cuisine: "South Indian", price: 170 },
  { id: "si-5", name: "Curd Rice", cuisine: "South Indian", price: 130 },

  { id: "ch-1", name: "Veg Hakka Noodles", cuisine: "Chinese", price: 210 },
  { id: "ch-2", name: "Chilli Paneer", cuisine: "Chinese", price: 250 },
  { id: "ch-3", name: "Schezwan Fried Rice", cuisine: "Chinese", price: 230 },
  { id: "ch-4", name: "Spring Rolls", cuisine: "Chinese", price: 190 },
  { id: "ch-5", name: "Manchurian Gravy", cuisine: "Chinese", price: 240 }
];

export const menuByCuisine = {
  "North Indian": menuCatalog.filter((item) => item.cuisine === "North Indian"),
  "South Indian": menuCatalog.filter((item) => item.cuisine === "South Indian"),
  Chinese: menuCatalog.filter((item) => item.cuisine === "Chinese")
};
