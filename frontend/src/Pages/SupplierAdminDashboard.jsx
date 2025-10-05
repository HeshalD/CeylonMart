import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supplierAPI, notificationAPI } from "../api";
import NotificationBell from "../components/NotificationBell";
import Header from "../Header";
import Footer from "../Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [query, setQuery] = useState("");
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [deletedCount, setDeletedCount] = useState(0);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierAPI.getAllSuppliers();
      setSuppliers(response.data);
      setDeletedCount(0); // Reset deleted count when fetching fresh data
      setError(null);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const isApprove = newStatus === "approved";
    const statusText = isApprove ? "approve" : "reject & delete";
    if (
      !window.confirm(`Are you sure you want to ${statusText} this supplier?`)
    )
      return;
    try {
      setActionLoading(id);
      if (isApprove) {
        await supplierAPI.approveSupplier(id);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
        );
      } else {
        // On reject, delete supplier entirely
        await supplierAPI.deleteSupplier(id);
        setSuppliers((prev) => prev.filter((s) => s._id !== id));
        setDeletedCount((prev) => prev + 1);
      }
    } catch (err) {
      setError(`Failed to ${isApprove ? "approve" : "reject/delete"} supplier`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickMessage = async (supplier) => {
    try {
      const title = window.prompt("Title for message", "Admin Message");
      if (title === null) return;
      const message = window.prompt(
        "Enter message to send to: " +
          (supplier.companyName || supplier.contactName)
      );
      if (!message) return;
      await notificationAPI.sendToSupplier({
        supplierId: supplier._id,
        title,
        message,
      });
      // optional: lightweight feedback
      alert("Message sent");
    } catch (err) {
      alert("Failed to send message");
    }
  };
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const filteredSuppliers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) => {
      const company = s.companyName?.toLowerCase() || "";
      const contact = s.contactName?.toLowerCase() || "";
      const categoryStr = Array.isArray(s.categories)
        ? s.categories.join(" ").toLowerCase()
        : (s.categories || "").toLowerCase();
      const productsStr = Array.isArray(s.products)
        ? s.products.join(" ").toLowerCase()
        : (s.products || "").toLowerCase();
      return (
        company.includes(q) ||
        contact.includes(q) ||
        categoryStr.includes(q) ||
        productsStr.includes(q)
      );
    });
  }, [query, suppliers]);

  const approvedFilteredSuppliers = useMemo(() => {
    return filteredSuppliers.filter((s) => s.status === "approved");
  }, [filteredSuppliers]);

  const groupedByCategory = useMemo(() => {
    const map = {};
    approvedFilteredSuppliers.forEach((s) => {
      const cats = Array.isArray(s.categories)
        ? s.categories
        : [s.categories || "Uncategorized"];
      cats.forEach((c) => {
        const key = c || "Uncategorized";
        if (!map[key]) map[key] = [];
        map[key].push(s);
      });
    });
    return map;
  }, [approvedFilteredSuppliers]);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage supplier approvals</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Admin inbox bell (supplier -> admin messages) - force admin mode on this admin page */}
            <NotificationBell adminMode={true} />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {suppliers.length + deletedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {suppliers.filter((s) => s.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {suppliers.filter((s) => s.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Rejected & Deleted
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {deletedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Alerts (placeholder UI) */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Inventory Alerts
            </h2>
            <span className="text-sm text-gray-500">
              {inventoryAlerts.length} alerts
            </span>
          </div>
          {inventoryAlerts.length === 0 ? (
            <div className="text-sm text-gray-600">
              No inventory alerts right now.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {inventoryAlerts.map((a) => (
                <li
                  key={a.id}
                  className="py-3 flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-600">{a.description}</div>
                  </div>
                  <span className="text-xs text-gray-500">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-medium text-gray-900">All Suppliers</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company, category, products..."
                className="flex-1 md:w-80 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setGroupByCategory((v) => !v)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md"
              >
                {groupByCategory ? "Show Table" : "Sort By Category"}
              </button>
            </div>
          </div>

          {(
            groupByCategory
              ? approvedFilteredSuppliers.length === 0
              : filteredSuppliers.length === 0
          ) ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                No suppliers found
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {!groupByCategory ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {supplier.companyName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {supplier.contactName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {supplier.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {supplier.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(supplier.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://wa.me/${supplier.phone}?text=Need%20stock`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                            >
                              WhatsApp
                            </a>
                            <a
                              href={`mailto:${supplier.email}?subject=Stock%20Request&body=Please%20send%20the%20required%20stock`}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                            >
                              Email
                            </a>
                            <button
                              onClick={() =>
                                navigate(`/admin/suppliers/${supplier._id}`)
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleQuickMessage(supplier)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded"
                            >
                              Quick Msg
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  supplier._id,
                                  supplier.status === "approved"
                                    ? "rejected"
                                    : "approved"
                                )
                              }
                              disabled={actionLoading === supplier._id}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                            >
                              {supplier.status === "approved"
                                ? "Reject & Delete"
                                : "Approve"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4">
                  {Object.entries(groupedByCategory).map(([category, list]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-xl font-semibold mb-3">{category}</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {list.map((supplier) => (
                          <div
                            key={supplier._id}
                            className="border rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">
                                {supplier.companyName}
                              </h4>
                              {getStatusBadge(supplier.status)}
                            </div>
                            <p className="text-sm text-gray-700">
                              {supplier.contactName}
                            </p>
                            <p className="text-sm text-gray-700">
                              {supplier.email}
                            </p>
                            <p className="text-sm text-gray-700">
                              {supplier.phone}
                            </p>
                            {supplier.products && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Products:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {(Array.isArray(supplier.products)
                                    ? supplier.products
                                    : [supplier.products]
                                  ).map((p, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                                    >
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={`https://wa.me/${supplier.phone}?text=Need%20stock`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                              >
                                WhatsApp
                              </a>
                              <a
                                href={`mailto:${supplier.email}?subject=Stock%20Request&body=Please%20send%20the%20required%20stock`}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                              >
                                Email
                              </a>
                              <button
                                onClick={() =>
                                  navigate(`/admin/suppliers/${supplier._id}`)
                                }
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    supplier._id,
                                    supplier.status === "approved"
                                      ? "rejected"
                                      : "approved"
                                  )
                                }
                                disabled={actionLoading === supplier._id}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                              >
                                {supplier.status === "approved"
                                  ? "Reject & Delete"
                                  : "Approve"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
