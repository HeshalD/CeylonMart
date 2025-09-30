// A simple event bus for stock history updates with localStorage persistence
const historySubscribers = [];
const STORAGE_KEY = 'stockHistory';

// Get history from localStorage
const getStoredHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};

// Save history to localStorage
const saveHistoryToStorage = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export function subscribeToHistory(fn) {
  historySubscribers.push(fn);
}

export function emitHistory(entry) {
  // Add to localStorage
  const currentHistory = getStoredHistory();
  const newHistory = [entry, ...currentHistory];
  saveHistoryToStorage(newHistory);
  
  // Notify subscribers
  historySubscribers.forEach(fn => fn(entry));
}

export function getStoredStockHistory() {
  return getStoredHistory();
}
