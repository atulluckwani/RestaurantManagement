import { randomUUID } from "node:crypto";

const activeSessions = new Set<string>();

export const createSession = () => {
  const token = randomUUID();
  activeSessions.add(token);
  return token;
};

export const hasSession = (token: string) => activeSessions.has(token);

export const deleteSession = (token: string) => {
  activeSessions.delete(token);
};
