// Dashboard stats emitter for automatic updates
const dashboardSubscribers = [];

export function subscribeToDashboardUpdates(fn) {
  dashboardSubscribers.push(fn);
}

export function unsubscribeFromDashboardUpdates(fn) {
  const index = dashboardSubscribers.indexOf(fn);
  if (index > -1) {
    dashboardSubscribers.splice(index, 1);
  }
}

export function emitDashboardUpdate(type = 'all') {
  // Notify all subscribers to refresh their data
  dashboardSubscribers.forEach(fn => fn(type));
}

// Helper functions to emit specific types of updates
export function emitProductUpdate() {
  emitDashboardUpdate('products');
}

export function emitCategoryUpdate() {
  emitDashboardUpdate('categories');
}

export function emitStockUpdate() {
  emitDashboardUpdate('stock');
}

export function emitLowStockUpdate() {
  emitDashboardUpdate('lowstock');
}

export function emitExpiryUpdate() {
  emitDashboardUpdate('expiry');
}