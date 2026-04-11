import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");

const ensureFile = (fileName: string) => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }

  return filePath;
};

const readJsonArray = <T>(fileName: string): T[] => {
  const filePath = ensureFile(fileName);
  const raw = fs.readFileSync(filePath, "utf-8").trim();

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const writeJsonArray = <T>(fileName: string, data: T[]) => {
  const filePath = ensureFile(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

export const taskStore = {
  read: () => readJsonArray<any>("tasks.json"),
  write: (data: any[]) => writeJsonArray("tasks.json", data)
};

export const orderStore = {
  read: () => readJsonArray<any>("orders.json"),
  write: (data: any[]) => writeJsonArray("orders.json", data)
};
