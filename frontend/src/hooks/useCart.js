import { useCallback, useEffect, useMemo, useState } from "react";
import { OrdersAPI } from "../api/client";

export default function useCart(customerId) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!customerId) return;
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.getCart(customerId);
      setCart(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const addItem = useCallback(async (item) => {
    if (!customerId) return;
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.addItemToCart(customerId, item);
      setCart(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const updateItemQuantity = useCallback(async (productId, quantity) => {
    if (!cart?._id) return;
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.updateItemQuantity(cart._id, productId, quantity);
      setCart(data);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [cart]);

  const removeItem = useCallback(async (productId) => {
    if (!cart?._id) return;
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.removeItem(cart._id, productId);
      setCart(data.order || data);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [cart]);

  const clearCart = useCallback(async () => {
    if (!cart?._id) return;
    setLoading(true); setError(null);
    try {
      const data = await OrdersAPI.clearCart(cart._id);
      setCart(data.order || data);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [cart]);

  useEffect(() => { refresh(); }, [refresh]);

  const total = useMemo(() => cart?.totalAmount || 0, [cart]);
  const items = useMemo(() => cart?.items || [], [cart]);

  return { cart, items, total, loading, error, refresh, addItem, updateItemQuantity, removeItem, clearCart };
}


