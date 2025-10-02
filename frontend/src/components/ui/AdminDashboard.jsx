import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [newMessage, setNewMessage] = useState({ supplierId: "", title: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  console.log('AdminDashboard: Component mounted');

  useEffect(() => {
    console.log('AdminDashboard: Starting to fetch data');
    fetchUsers();
    fetchSuppliers();
    fetchMessages();
  }, [token]);

  const fetchUsers = async () => {
    try {
      console.log('AdminDashboard: Fetching users...');
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('AdminDashboard: Users fetched:', res.data.length);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users");
    }
  };

  const fetchSuppliers = async () => {
    try {
      console.log('AdminDashboard: Fetching suppliers...');
      const res = await axios.get("http://localhost:5000/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('AdminDashboard: Suppliers fetched:', res.data.length);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to fetch suppliers");
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('AdminDashboard: Fetching messages...');
      const res = await axios.get("http://localhost:5000/api/admin/inbox", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('AdminDashboard: Messages fetched:', res.data.length);
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierAction = async (supplierId, action) => {
    try {
      const endpoint = action === "approve" ? "approve" : "reject";
      await axios.patch(`http://localhost:5000/api/suppliers/${supplierId}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotification({ show: true, message: `Supplier ${action}d successfully`, type: "success" });
      fetchSuppliers(); // Refresh the list
    } catch (err) {
      setNotification({ show: true, message: `Failed to ${action} supplier`, type: "error" });
      console.error(`Error ${action}ing supplier:`, err);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/send-notification", newMessage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNotification({ show: true, message: "Notification sent successfully", type: "success" });
      setNewMessage({ supplierId: "", title: "", message: "" });
    } catch (err) {
      setNotification({ show: true, message: "Failed to send notification", type: "error" });
      console.error("Error sending notification:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "text-green-600 bg-green-100";
      case "rejected": return "text-red-600 bg-red-100";
      case "pending approval": return "text-yellow-600 bg-yellow-100";
      case "pending": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto bg-white shadow-md rounded p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-white shadow-md rounded p-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${
          notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          <span>{notification.message}</span>
          <button onClick={closeNotification} className="ml-4 font-bold">×</button>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-2 px-4 ${activeTab === "users" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`pb-2 px-4 ${activeTab === "suppliers" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`pb-2 px-4 ${activeTab === "messages" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-2 px-4 ${activeTab === "notifications" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
        >
          Send Notification
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Users Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="p-2 border">{u.name}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === "suppliers" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Suppliers Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Company</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="p-2 border">{supplier.companyName}</td>
                    <td className="p-2 border">{supplier.contactName}</td>
                    <td className="p-2 border">{supplier.email}</td>
                    <td className="p-2 border">{supplier.phone}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(supplier.status)}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {supplier.status === "pending approval" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSupplierAction(supplier._id, "approve")}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleSupplierAction(supplier._id, "reject")}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Messages from Suppliers</h3>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message._id} className="border rounded p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{message.title}</h4>
                    <p className="text-sm text-gray-600">
                      From: {message.supplierId?.companyName} ({message.supplierId?.contactName})
                    </p>
                    <p className="text-sm text-gray-500">{message.supplierId?.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2">{message.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-gray-500 text-center py-8">No messages from suppliers</p>
            )}
          </div>
        </div>
      )}

      {/* Send Notification Tab */}
      {activeTab === "notifications" && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Send Notification to Supplier</h3>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Supplier
              </label>
              <select
                value={newMessage.supplierId}
                onChange={(e) => setNewMessage({ ...newMessage, supplierId: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.companyName} - {supplier.contactName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                rows="4"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
            >
              Send Notification
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
