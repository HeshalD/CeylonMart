import React, { useEffect, useRef, useState } from 'react';
import { messageAPI, notificationAPI, supplierAPI } from '../api';
import { useParams } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const AdminMessages = () => {
  const { supplierId } = useParams();
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [supplier, setSupplier] = useState(null);
  const bottomRef = useRef(null);

  const fetchData = async () => {
    try {
      const [threadRes, supplierRes] = await Promise.all([
        messageAPI.getAdminThread(supplierId),
        supplierAPI.getSupplierById(supplierId)
      ]);
      setMessages(threadRes.data || []);
      setSupplier(supplierRes.data || null);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, [supplierId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendAdminMessage = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      // Save as admin message and notification
      await notificationAPI.sendToSupplier({ supplierId, title, message: content });
      setTitle('');
      setContent('');
      fetchData();
    } catch {}
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Conversation</h1>
          {supplier && <div className="text-sm text-gray-600">{supplier.companyName || supplier.name} • {supplier.email}</div>}
        </div>
        <div className="bg-white rounded shadow p-4 h-[60vh] overflow-auto">
          {messages.map((m) => (
            <div key={m._id} className={`mb-3 ${m.sender === 'admin' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded ${m.sender === 'admin' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-xs opacity-80">{m.title}</div>
                <div>{m.content}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendAdminMessage} className="mt-4 grid grid-cols-1 gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subject" className="border rounded px-3 py-2" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message to supplier" rows={3} className="border rounded px-3 py-2"></textarea>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Send</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AdminMessages;


