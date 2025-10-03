import { addStockHistory } from "../api/inventoryApi";

const historySubscribers = [];

// Subscribe
export function subscribeToHistory(fn) {
  historySubscribers.push(fn);
}

// Emit new history (save to backend + notify subscribers)
export async function emitHistory(entry) {
  try {
    const saved = await addStockHistory(entry); // save in MongoDB
    historySubscribers.forEach((fn) => fn(saved.history));
  } catch (error) {
    console.error("Error emitting stock history:", error);
  }
}

// We no longer rely on localStorage, history is in backend
export function getStoredStockHistory() {
  return [];
}
