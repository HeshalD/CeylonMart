import React, { useEffect, useRef, useState } from 'react';
import { messageAPI } from '../api';
import Header from '../Header';
import Footer from '../Footer';

const SupplierMessages = () => {
  const [supplierId, setSupplierId] = useState(localStorage.getItem('supplierId'));
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const bottomRef = useRef(null);

  const fetchData = async () => {
    try {
      if (!supplierId) return;
      const res = await messageAPI.getSupplierThread(supplierId);
      setMessages(res.data || []);
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

  const sendReply = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await messageAPI.supplierReply(supplierId, { title, content });
      setTitle('');
      setContent('');
      fetchData();
    } catch {}
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="bg-white rounded shadow p-4 h-[60vh] overflow-auto">
          {messages.map((m) => (
            <div key={m._id} className={`mb-3 ${m.sender === 'supplier' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded ${m.sender === 'supplier' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <div className="text-xs opacity-80">{m.title}</div>
                <div>{m.content}</div>
                <div className="text-[10px] opacity-60 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={sendReply} className="mt-4 grid grid-cols-1 gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subject" className="border rounded px-3 py-2" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your message" rows={3} className="border rounded px-3 py-2"></textarea>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SupplierMessages;


