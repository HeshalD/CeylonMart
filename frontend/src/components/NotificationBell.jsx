import React, { useEffect, useState } from 'react';
import { notificationAPI, messageAPI } from '../api';

// When adminMode=true, shows supplier -> admin messages inbox
const NotificationBell = ({ supplierId, adminMode = false }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchData = async () => {
    try {
      if (adminMode) {
        const res = await messageAPI.getAdminInbox();
        setItems(res.data || []);
        setUnread((res.data || []).filter((m) => !m.isRead).length);
      } else {
        if (!supplierId) return;
        const res = await notificationAPI.getSupplierNotifications(supplierId);
        setItems(res.data || []);
        setUnread((res.data || []).filter((n) => !n.isRead).length);
      }
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, [supplierId, adminMode]);

  const markRead = async (id) => {
    try {
      if (adminMode) {
        await messageAPI.adminMarkRead(id);
      } else {
        await notificationAPI.markNotificationRead(id);
      }
      fetchData();
    } catch {}
  };

  const deleteMessage = async (id) => {
    try {
      if (!adminMode) return;
      await messageAPI.adminDeleteMessage(id);
      fetchData();
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      if (adminMode) return;
      await notificationAPI.deleteNotification(id);
      fetchData();
    } catch {}
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="relative p-2 rounded hover:bg-gray-100">
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1 min-w-[18px] text-center">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow z-10 max-h-96 overflow-auto">
          <div className="p-2 border-b font-semibold">{adminMode ? 'Inbox' : 'Notifications'}</div>
          {items.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No {adminMode ? 'messages' : 'notifications'}</div>
          ) : (
            items.map((n) => (
              <div key={n._id} className={`p-3 border-b ${n.isRead ? 'bg-white' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start">
                  <div className="pr-2">
                    <div className="font-medium text-sm">
                      {adminMode && n.supplierId?.companyName ? (
                        <span className="text-gray-700">{n.supplierId.companyName} • </span>
                      ) : null}
                      {n.title}
                    </div>
                    <div className="text-sm text-gray-700">{adminMode ? n.content : n.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!n.isRead && (
                      <button onClick={() => markRead(n._id)} className="text-blue-600 text-xs hover:underline">Mark read</button>
                    )}
                    {adminMode ? (
                      <button onClick={() => deleteMessage(n._id)} className="text-red-600 text-xs hover:underline">Delete</button>
                    ) : (
                      <button onClick={() => deleteNotification(n._id)} className="text-red-600 text-xs hover:underline">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;