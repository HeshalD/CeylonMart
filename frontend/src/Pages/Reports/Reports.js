import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getCategories } from "../../api/inventoryApi";
import {
  subscribeToDashboardUpdates,
  unsubscribeFromDashboardUpdates,
} from "../../utils/dashboardEmitter";

const Reports = () => {
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [noteAboutDateFiltering, setNoteAboutDateFiltering] = useState("");

  const highlightHeaderColors = [
    "#e0f7fa", "#f1f8e9", "#fff9c4", "#ffe0b2", "#f8bbd0", "#d1c4e9"
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const cats = res.data?.categories ?? res.data ?? [];
        setCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        setCategories([]);
      }
    };
    fetchCategories();

    // Subscribe to dashboard updates to refresh data when products change
    const handleUpdate = () => {
      // Clear current report to force regeneration with updated data
      setGeneratedReport(null);
    };

    subscribeToDashboardUpdates(handleUpdate);
    return () => unsubscribeFromDashboardUpdates(handleUpdate);
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/products");
    return res.data?.products ?? [];
  };

  const computeDateRange = (days) => {
    const now = new Date();
    const to = new Date(now);
    const from = new Date(now);
    from.setDate(now.getDate() - Number(days) + 1);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { from, to };
  };

  const getProductCreatedDate = (p) => {
    const candidates = ["createdAt", "created", "dateAdded", "addedAt", "timestamp"];
    for (const c of candidates) {
      if (p[c]) return new Date(p[c]);
    }
    return null;
  };

  const handleGenerateReport = useCallback(async () => {
    try {
      setLoading(true);
      setGeneratedReport(null);
      setNoteAboutDateFiltering("");

      const products = await fetchProducts();
      const { from, to } = computeDateRange(dateRange);
      const fromLabel = from.toLocaleDateString();
      const toLabel = to.toLocaleDateString();
      const timestamp = new Date();

      let productsWithDateFlag = products.map((p) => {
        const created = getProductCreatedDate(p);
        return { ...p, __createdDate: created };
      });

      const productsMissingDates = productsWithDateFlag.filter((p) => !p.__createdDate);

      let filtered = productsWithDateFlag;
      if (selectedCategory) {
        filtered = filtered.filter((p) => p.category === selectedCategory);
      }

      const filteredByDate = filtered.filter((p) => {
        if (!p.__createdDate) return true;
        return p.__createdDate >= from && p.__createdDate <= to;
      });

      if (productsMissingDates.length > 0) {
        setNoteAboutDateFiltering(
          "Note: Some products do not have creation timestamps; those rows are included because date filtering cannot be applied to them."
        );
      } else {
        setNoteAboutDateFiltering("");
      }

      const rowsByCategory = {};
      filteredByDate.forEach((p) => {
        const cat = p.category || "Uncategorized";
        if (!rowsByCategory[cat]) rowsByCategory[cat] = [];
        rowsByCategory[cat].push({
          productName: p.productName ?? p.name ?? "",
          category: cat,
          unitType: p.unitType ?? "",
          minStock: p.minimumStockLevel ?? p.minStock ?? 0,
          currentStock: typeof p.currentStock !== "undefined" ? Math.max(0, p.currentStock) : 0,
          price: typeof p.price !== "undefined" ? p.price : 0,
        });
      });

      const report = {
        dateFrom: from,
        dateTo: to,
        dateFromLabel: fromLabel,
        dateToLabel: toLabel,
        generatedAt: timestamp,
        rowsByCategory,
        selectedCategory,
        totalCategories: Object.keys(rowsByCategory).length,
        totalProducts: filteredByDate.length,
      };

      setGeneratedReport(report);
    } catch (err) {
      console.error("Failed to generate report", err);
      alert("Failed to generate report. See console for details.");
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedCategory]);

  const downloadCSV = () => {
    if (!generatedReport) {
      alert("Please generate a report first.");
      return;
    }
    const { rowsByCategory, dateFromLabel, dateToLabel, generatedAt } = generatedReport;
    const reportName = `Inventory_Summary_Report_${dateFromLabel}_to_${dateToLabel}`.replace(/\s+/g, "_");
    const lines = [];

    lines.push([`Inventory Summary Report`].join(","));
    lines.push([`Date Range: ${dateFromLabel} - ${dateToLabel}`].join(","));
    lines.push([`Generated At: ${new Date(generatedAt).toLocaleString()}`].join(","));
    lines.push([]);

    Object.keys(rowsByCategory).forEach((cat) => {
      lines.push([`Category: ${cat}`].join(","));
      lines.push(["Product Name", "Category", "Unit Type", "Min Stock", "Current Stock", "Price", "Status"].join(","));
      rowsByCategory[cat].forEach((r) => {
        const status = r.currentStock === 0 ? "Out of Stock" : (r.minStock >= r.currentStock ? "Low Stock" : "Active");
        const row = [
          `"${r.productName}"`,
          `"${r.category}"`,
          `"${r.unitType}"`,
          r.minStock,
          r.currentStock,
          r.price,
          `"${status}"`,
        ];
        lines.push(row.join(","));
      });
      lines.push([]);
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `${reportName}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("CSV report downloaded successfully.");
  };

  const downloadPDF = async () => {
    if (!generatedReport) {
      alert("Please generate a report first.");
      return;
    }

    try {
      const { rowsByCategory, dateFromLabel, dateToLabel, generatedAt, totalProducts, totalCategories } = generatedReport;
      
      // Create a temporary container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.width = '800px';
      document.body.appendChild(pdfContainer);

      // Create beautiful PDF content with proper styling
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; background: white;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #059669; padding-bottom: 20px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">📊 Inventory Summary Report</h1>
            <p style="color: #6b7280; margin: 10px 0; font-size: 14px;">Generated on: ${new Date(generatedAt).toLocaleDateString()} at ${new Date(generatedAt).toLocaleTimeString()}</p>
            <p style="color: #059669; margin: 0; font-size: 16px; font-weight: 600;">Date Range: ${dateFromLabel} - ${dateToLabel}</p>
          </div>
          
          <div style="margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Report Summary</h3>
            <div style="display: flex; gap: 30px;">
              <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Total Categories:</strong> ${totalCategories}</p>
              <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Total Products:</strong> ${totalProducts}</p>
              <p style="color: #4b5563; margin: 5px 0; font-size: 14px;"><strong>Category Filter:</strong> ${generatedReport.selectedCategory || 'All Categories'}</p>
            </div>
          </div>`;

      // Add each category section
      Object.keys(rowsByCategory).forEach((cat, idx) => {
        const rows = rowsByCategory[cat];
        const outOfStockCount = rows.filter(r => r.currentStock === 0).length;
        const lowStockCount = rows.filter(r => r.minStock >= r.currentStock && r.currentStock > 0).length;
        const activeCount = rows.filter(r => r.currentStock > r.minStock).length;

        htmlContent += `
          <div style="margin-bottom: 30px; page-break-inside: avoid;">
            <div style="background: linear-gradient(to right, #059669, #0d9488, #0891b2); color: white; padding: 12px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
              <h2 style="margin: 0; font-size: 18px; font-weight: bold;">${cat} (${rows.length} products)</h2>
              <div style="margin-top: 5px; font-size: 12px; opacity: 0.9;">
                Active: ${activeCount} | Low Stock: ${lowStockCount} | Out of Stock: ${outOfStockCount}
              </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <thead>
                <tr style="background: #f1f5f9; color: #1e293b;">
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: 600; font-size: 12px;">Product Name</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-weight: 600; font-size: 12px;">Unit Type</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: 600; font-size: 12px;">Min Stock</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: 600; font-size: 12px;">Current Stock</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: 600; font-size: 12px;">Price (Rs.)</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: 600; font-size: 12px;">Status</th>
                </tr>
              </thead>
              <tbody>`;
        
        rows.forEach((r, rowIdx) => {
          const status = r.currentStock === 0 ? "Out of Stock" : (r.minStock >= r.currentStock ? "Low Stock" : "Active");
          const statusColor = status === "Out of Stock" ? "#dc2626" : status === "Low Stock" ? "#ea580c" : "#059669";
          const statusBg = status === "Out of Stock" ? "#fef2f2" : status === "Low Stock" ? "#fff7ed" : "#f0fdf4";
          const rowColor = rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
          
          htmlContent += `
            <tr style="background-color: ${rowColor};">
              <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: 500; color: #1f2937; font-size: 11px;">${r.productName}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; color: #4b5563; font-size: 11px;">${r.unitType}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #4b5563; font-size: 11px; font-weight: 500;">${r.minStock}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #1f2937; font-size: 11px; font-weight: 600;">${r.currentStock}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #1f2937; font-size: 11px; font-weight: 500;">${r.price}</td>
              <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: ${statusColor}; background-color: ${statusBg}; font-weight: 600; font-size: 11px; border-radius: 4px;">${status}</td>
            </tr>`;
        });
        
        htmlContent += `
              </tbody>
            </table>
          </div>`;
      });

      // Add note if present
      if (noteAboutDateFiltering) {
        htmlContent += `
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-size: 12px; font-weight: 500;">Note: ${noteAboutDateFiltering}</p>
          </div>`;
      }

      // Add footer
      htmlContent += `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 11px; margin: 0;">Generated by CeylonMart Inventory Management System</p>
            <p style="color: #9ca3af; font-size: 10px; margin: 5px 0 0 0;">This report contains confidential business information</p>
          </div>
        </div>`;

      pdfContainer.innerHTML = htmlContent;

      // Generate PDF using html2canvas
      const canvas = await html2canvas(pdfContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: pdfContainer.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(pdfContainer);

      // Download PDF
      const fileName = `Inventory_Summary_Report_${dateFromLabel.replace(/\//g, '-')}_to_${dateToLabel.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
      alert('PDF report downloaded successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        <button
          onClick={() => handleGenerateReport()}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 text-white transition-all duration-200 transform rounded-lg shadow bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:shadow-lg disabled:opacity-50 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-800 hover:scale-105"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* Report Settings */}
      <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Report Settings</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 font-semibold text-gray-900 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 hover:shadow-md"
              style={{ color: '#1f2937 !important' }}
            >
              <option value="" className="py-2 font-semibold text-gray-900 bg-white" style={{ color: '#1f2937 !important' }}>All Categories</option>
              {categories.map((c) => (
                <option 
                  key={c._id ?? c.id ?? c.categoryName} 
                  value={c.categoryName ?? c.name ?? c._id ?? c.id} 
                  className="py-2 font-semibold text-gray-900 bg-white"
                  style={{ color: '#1f2937 !important' }}
                >
                  {c.categoryName ?? c.name ?? "Unnamed"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 font-semibold text-gray-900 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 hover:shadow-md"
              style={{ color: '#1f2937 !important' }}
            >
              <option value="7" className="py-2 font-semibold text-gray-900 bg-white" style={{ color: '#1f2937 !important' }}>Last 7 days</option>
              <option value="30" className="py-2 font-semibold text-gray-900 bg-white" style={{ color: '#1f2937 !important' }}>Last 30 days</option>
              <option value="90" className="py-2 font-semibold text-gray-900 bg-white" style={{ color: '#1f2937 !important' }}>Last 90 days</option>
              <option value="365" className="py-2 font-semibold text-gray-900 bg-white" style={{ color: '#1f2937 !important' }}>Last year</option>
            </select>
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold text-gray-900">📊 Inventory Summary Report</h2>
      {noteAboutDateFiltering && (
        <div className="p-3 mb-4 border-l-4 border-yellow-400 rounded-r-lg bg-yellow-50">
          <p className="text-sm font-medium text-yellow-800">{noteAboutDateFiltering}</p>
        </div>
      )}

      {generatedReport ? (
        <>
          <div className="p-6 mb-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Inventory Summary — {selectedCategory || "All Categories"}
                </h3>
                <p className="text-sm font-medium text-gray-700">
                  Date Range: {generatedReport.dateFromLabel} — {generatedReport.dateToLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  Generated at: {new Date(generatedReport.generatedAt).toLocaleString()}
                </p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="px-2 py-1 font-medium text-blue-800 bg-blue-100 rounded-full">
                    {generatedReport.totalProducts} Products
                  </span>
                  <span className="px-2 py-1 font-medium text-green-800 bg-green-100 rounded-full">
                    {generatedReport.totalCategories} Categories
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={downloadPDF} 
                  className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 transform bg-red-600 rounded-lg shadow hover:bg-red-700 hover:shadow-lg hover:scale-105"
                >
                  Download PDF
                </button>
                <button 
                  onClick={downloadCSV} 
                  className="flex items-center gap-2 px-4 py-2 text-white transition-all duration-200 transform bg-green-600 rounded-lg shadow hover:bg-green-700 hover:shadow-lg hover:scale-105"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {Object.keys(generatedReport.rowsByCategory).length === 0 ? (
            <div className="py-8 text-center text-gray-500">No products found for this selection.</div>
          ) : (
            Object.keys(generatedReport.rowsByCategory).map((cat, idx) => {
              const rows = generatedReport.rowsByCategory[cat];
              const highlight = highlightHeaderColors[idx % highlightHeaderColors.length];

              return (
                <div key={cat} className={`bg-white rounded-lg shadow-sm border p-4 mb-6`}>
                  <h4 className="mb-3 text-lg font-semibold text-gray-900">{cat} — {rows.length} product(s)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border border-gray-200">
                      <thead className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-white border border-gray-300">Product Name</th>
                          <th className="px-4 py-3 font-semibold text-white border border-gray-300">Category</th>
                          <th className="px-4 py-3 font-semibold text-white border border-gray-300">Unit Type</th>
                          <th className="px-4 py-3 font-semibold text-right text-white border border-gray-300">Min Stock</th>
                          <th className="px-4 py-3 font-semibold text-right text-white border border-gray-300">Current Stock</th>
                          <th className="px-4 py-3 font-semibold text-right text-white border border-gray-300">Price</th>
                          <th className="px-4 py-3 font-semibold text-center text-white border border-gray-300">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, ridx) => {
                          const status = r.currentStock === 0 ? "Out of Stock" : (r.minStock >= r.currentStock ? "Low Stock" : "Active");
                          const statusColor = status === "Out of Stock" ? "text-red-600 font-semibold" : status === "Low Stock" ? "text-orange-600 font-semibold" : "text-green-600 font-semibold";
                          return (
                            <tr key={`${cat}-${ridx}`} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800 border border-gray-300">{r.productName}</td>
                              <td className="px-4 py-3 text-gray-700 border border-gray-300">{r.category}</td>
                              <td className="px-4 py-3 text-gray-700 border border-gray-300">{r.unitType}</td>
                              <td className="px-4 py-3 font-medium text-right text-gray-800 border border-gray-300">{r.minStock}</td>
                              <td className="px-4 py-3 font-medium text-right text-gray-800 border border-gray-300">{r.currentStock}</td>
                              <td className="px-4 py-3 font-medium text-right text-gray-800 border border-gray-300">Rs. {r.price}</td>
                              <td className={`px-4 py-3 border border-gray-300 text-center ${statusColor}`}>{status}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500">Click "Generate Report" to build inventory summary for the selected category and date range.</div>
      )}
    </div>
  );
};

export default Reports;
