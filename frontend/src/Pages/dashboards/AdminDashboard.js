import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role === "admin") {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingUser(u._id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${editingUser}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(
        users.map((u) => (u._id === editingUser ? { ...u, ...editForm } : u))
      );
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const now = new Date();

      // CeylonMart Brand Colors
      const primaryGreen = [5, 150, 105]; // #059669
      const darkGreen = [44, 85, 48]; // #2c5530
      const lightTeal = [110, 231, 183]; // #6ee7b7
      const lightGreen = [200, 255, 215]; // #c8ffd7

      // Header Section with Brand Colors
      doc.setFillColor(...primaryGreen);
      doc.rect(0, 0, 210, 45, 'F');
      
      // Company Logo/Title - Centered
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text("CeylonMart", 105, 18, { align: 'center' });
      
      // Company Tagline - Centered
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Smart shopping • Happy living", 105, 26, { align: 'center' });
      
      // Report Subtitle - Centered
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Users Management Report", 105, 36, { align: 'center' });

      // Generation Info Box
      doc.setFillColor(...lightGreen);
      doc.rect(10, 50, 190, 15, 'F');
      doc.setTextColor(...darkGreen);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 105, 60, { align: 'center' });

      // Total Users Count with Styling
      doc.setFillColor(...lightTeal);
      doc.rect(10, 70, 190, 12, 'F');
      doc.setTextColor(...darkGreen);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Users: ${filteredUsers.length}`, 105, 78, { align: 'center' });

      // Prepare table data with error handling
      const tableData = filteredUsers.map((user) => [
        user.name || "N/A",
        user.email || "N/A",
        user.role ? user.role.replace("_", " ") : "N/A",
        user.phone || "N/A",
        user.address || "N/A",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
      ]);

      // Enhanced table with CeylonMart branding
      autoTable(doc, {
        head: [["Name", "Email", "Role", "Phone", "Address", "Created Date"]],
        body: tableData,
        startY: 90,
        styles: {
          fontSize: 9,
          cellPadding: 4,
          font: "helvetica",
          textColor: [31, 41, 55], // Dark gray text
        },
        headStyles: {
          fillColor: primaryGreen,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Very light gray
        },
        columnStyles: {
          0: { cellWidth: 32, halign: 'left', overflow: 'linebreak' },
          1: { cellWidth: 45, halign: 'left', overflow: 'linebreak' },
          2: { cellWidth: 28, halign: 'center', overflow: 'linebreak' },
          3: { cellWidth: 30, halign: 'center', overflow: 'linebreak' },
          4: { cellWidth: 32, halign: 'left', overflow: 'linebreak' },
          5: { cellWidth: 23, halign: 'center', overflow: 'linebreak' },
        },
        margin: { left: 10, right: 10 },
        tableLineColor: [229, 231, 235], // Light border
        tableLineWidth: 0.5,
      });

      // Summary Statistics Section with Enhanced Styling
      const finalY = doc.lastAutoTable.finalY + 25;
      
      // Summary Header
      doc.setFillColor(...darkGreen);
      doc.rect(10, finalY - 5, 190, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 20, finalY + 2);

      // Stats Grid Layout
      const stats = [
        { label: "Total Users", value: users.length, color: primaryGreen },
        { label: "Customers", value: users.filter((u) => u.role === "customer").length, color: [34, 197, 94] },
        { label: "Shop Owners", value: users.filter((u) => u.role === "shop_owner").length, color: [59, 130, 246] },
        { label: "Suppliers", value: users.filter((u) => u.role === "supplier_admin").length, color: [168, 85, 247] },
        { label: "Inventory Managers", value: users.filter((u) => u.role === "inventory_manager").length, color: [245, 158, 11] },
        { label: "Delivery Managers", value: users.filter((u) => u.role === "delivery_admin").length, color: [239, 68, 68] },
        { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: [107, 114, 128] },
      ];

      let currentY = finalY + 15;
      const statsPerRow = 2;
      const statWidth = 85;
      const statHeight = 20;

      stats.forEach((stat, index) => {
        const row = Math.floor(index / statsPerRow);
        const col = index % statsPerRow;
        const x = 20 + (col * (statWidth + 10));
        const y = currentY + (row * (statHeight + 5));

        // Stat box background
        doc.setFillColor(...lightGreen);
        doc.rect(x, y, statWidth, statHeight, 'F');
        
        // Stat value (large)
        doc.setTextColor(...stat.color);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(stat.value.toString(), x + 5, y + 8);
        
        // Stat label (small)
        doc.setTextColor(...darkGreen);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(stat.label, x + 5, y + 15);
      });

      // Footer with CeylonMart branding
      const footerY = 280;
      doc.setFillColor(...primaryGreen);
      doc.rect(0, footerY, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CeylonMart - Your Gateway to Authentic Sri Lankan Products", 20, footerY + 10);
      doc.text("www.ceylonmart.com", 150, footerY + 10);

      // Save the PDF with enhanced filename
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      doc.save(`CeylonMart-Users-Report-${dateStr}-${timeStr}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const filteredUsers = users.filter((u) => {
    // Check search filter
    const matchesSearch = !search || 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());
    
    // Check role filter
    const matchesRole = !roleFilter || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Total Users
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {users.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Customers
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {users.filter((u) => u.role === "customer").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Shop Owners
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {users.filter((u) => u.role === "shop_owner").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Suppliers
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {users.filter((u) => u.role === "supplier_admin").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Inventory
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {
                        users.filter((u) => u.role === "inventory_manager")
                          .length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Delivery
                    </h3>
                    <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      {users.filter((u) => u.role === "delivery_admin").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white/50 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="lg:w-64">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                  <option value="shop_owner">Shop Owner</option>
                  <option value="supplier_admin">Supplier</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="delivery_admin">Delivery Manager</option>
                </select>
              </div>

              <div className="lg:w-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Actions
                </label>
                <button
                  onClick={generatePDF}
                  className="w-full lg:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Generate PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/70 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-white/20">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    All Users
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 font-medium">
                    Manage all registered users in the system ({filteredUsers.length} of {users.length} users)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="px-6 py-12 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 font-medium">
                    Loading users...
                  </span>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600 mb-4">
                  {search || roleFilter 
                    ? "Try adjusting your search criteria to see all users."
                    : "No users are registered in the system yet."
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200/50">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    className="px-6 py-6 hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    {editingUser === u._id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Role
                            </label>
                            <select
                              name="role"
                              value={editForm.role}
                              onChange={handleEditChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="admin">Admin</option>
                              <option value="customer">Customer</option>
                              <option value="shop_owner">Shop Owner</option>
                              <option value="supplier_admin">Supplier</option>
                              <option value="inventory_manager">
                                Inventory Manager
                              </option>
                              <option value="delivery_admin">
                                Delivery Manager
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleEditSave}
                            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2.5 rounded-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                              <span className="text-xl font-bold text-white">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {u.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {u.email}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {u.phone && `📞 ${u.phone}`}
                              {u.address && ` • 📍 ${u.address}`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
                              u.role === "admin"
                                ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                                : u.role === "shop_owner"
                                ? "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                                : u.role === "supplier_admin"
                                ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                                : u.role === "inventory_manager"
                                ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
                                : u.role === "delivery_admin"
                                ? "bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800"
                                : "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                            }`}
                          >
                            {u.role.replace("_", " ")}
                          </span>
                          <button
                            onClick={() => handleEditClick(u)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
