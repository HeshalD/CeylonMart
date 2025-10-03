import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { emitHistory } from "../utils/historyEmitter";
import {
  emitDashboardUpdate,
  subscribeToDashboardUpdates,
  unsubscribeFromDashboardUpdates,
} from "../utils/dashboardEmitter";

function Expiry() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleUpdate = () => {
      fetchProducts();
    };

    subscribeToDashboardUpdates(handleUpdate);
    return () => unsubscribeFromDashboardUpdates(handleUpdate);
  }, []);

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diff = Math.floor((exp - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const expiringProducts = products.filter(
    (p) => calculateDaysLeft(p.expiryDate) <= 10
  );

  const handleRemove = async (id, name) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${name}" permanently?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));

      const productRemoved = products.find((p) => p._id === id);
      if (productRemoved) {
        const historyEntry = {
          productName: productRemoved.productName,
          productCode: productRemoved.productCode || "",
          category: productRemoved.category,
          productImage: productRemoved.productImage || "",
          type: "expiry",
          quantity: productRemoved.currentStock || 0,
          previousQuantity: productRemoved.currentStock || 0,
          newQuantity: 0,
          reason: "Expired Products Removed",
        };

        await emitHistory(historyEntry);
      }

      alert(`"${name}" removed successfully!`);
      emitDashboardUpdate();
    } catch (err) {
      console.error("Failed to remove product", err);
      alert("Error removing product.");
    }
  };

  const handleSendWhatsApp = () => {
    const message =
      `🚨 *Expiry Alert Summary* 🚨\n\n` +
      `Total Products Expiring Soon: ${expiringProducts.length}\n\n` +
      expiringProducts
        .map((product) => {
          const daysLeft = calculateDaysLeft(product.expiryDate);
          const daysLeftText =
            daysLeft < 0 || daysLeft === 0
              ? "Expired"
              : daysLeft === 1
              ? "1 day left"
              : `${daysLeft} days left`;
          return (
            `📦 *${product.productName}*\n` +
            `   Category: ${product.category}\n` +
            `   Stock: ${product.currentStock}\n` +
            `   Expiry: ${new Date(
              product.expiryDate
            ).toLocaleDateString()}\n` +
            `   Status: ${daysLeftText}\n`
          );
        })
        .join("\n") +
      `\n💼 *CeylonMart Inventory Management*\n` +
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    navigator.clipboard
      .writeText(message)
      .then(() => {
        alert("Expiry alert message copied to clipboard! Paste it in WhatsApp.");
        window.open("https://web.whatsapp.com/", "_blank");
      })
      .catch(() => {
        alert("Please copy the message manually and paste in WhatsApp.");
        window.open("https://web.whatsapp.com/", "_blank");
      });
  };

  const handleExportPDF = async () => {
    try {
      // Create a temporary container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.background = 'white';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.width = '800px';
      document.body.appendChild(pdfContainer);

      // Create PDF content with borders and styling
      pdfContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937; margin-bottom: 20px; text-align: center;">Expiry Alerts Report</h1>
          <p style="color: #6b7280; margin-bottom: 20px; text-align: center;">Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          <p style="color: #1f2937; margin-bottom: 20px; font-weight: bold;">Total Products Expiring Soon: ${expiringProducts.length}</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: linear-gradient(to right, #059669, #0d9488, #0891b2); color: white;">
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Image</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Name</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Category</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Price</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Quantity</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Expiry Date</th>
                <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600;">Days Left</th>
              </tr>
            </thead>
            <tbody>
              ${expiringProducts.map((p, index) => {
                const daysLeft = calculateDaysLeft(p.expiryDate);
                const daysLeftText = daysLeft < 0 || daysLeft === 0 ? "Expired" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
                const rowColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                return `
                  <tr style="background-color: ${rowColor};">
                    <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">
                      ${p.productImage ? 
                        `<img src="http://localhost:5000/uploads/${p.productImage}" alt="${p.productName}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />` :
                        '<span style="color: #9ca3af;">No image</span>'
                      }
                    </td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: 500; color: #1f2937;">${p.productName}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #4b5563;">${p.category}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #4b5563;">Rs. ${p.price}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #4b5563;">${p.currentStock}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #4b5563;">${new Date(p.expiryDate).toLocaleDateString()}</td>
                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #dc2626; font-weight: 600;">${daysLeftText}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Wait for images to load
      const images = pdfContainer.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
      }));

      // Generate PDF
      const canvas = await html2canvas(pdfContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
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
      const fileName = `Expiry_Alerts_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleDownloadCSV = () => {
    const csvHeaders = "Product Name,Category,Price,Quantity,Expiry Date,Days Left\n";
    const csvData = expiringProducts
      .map((product) => {
        const daysLeft = calculateDaysLeft(product.expiryDate);
        const daysLeftText =
          daysLeft < 0 || daysLeft === 0
            ? "Expired"
            : daysLeft === 1
            ? "1 day left"
            : `${daysLeft} days left`;
        return `"${product.productName}","${product.category}","Rs. ${
          product.price
        }","${product.currentStock}","${new Date(
          product.expiryDate
        ).toLocaleDateString()}","${daysLeftText}"`;
      })
      .join("\n");

    const csvContent = csvHeaders + csvData;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Expiry_Alerts_Report_${new Date()
          .toLocaleDateString()
          .replace(/\//g, "-")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
          Expiry Alerts
          <span className="px-2 py-1 text-sm text-white bg-red-600 rounded-full">
            {expiringProducts.length}
          </span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleSendWhatsApp}
            className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
          >
            Send WhatsApp
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2 text-white transition-colors bg-orange-600 rounded-lg hover:bg-orange-700"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
              <th className="px-4 py-3 text-sm font-semibold text-left">Image</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Name</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Category</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Price</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Quantity</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Expiry Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Days Left</th>
              <th className="px-4 py-3 text-sm font-semibold text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {expiringProducts.map((p) => {
              const daysLeft = calculateDaysLeft(p.expiryDate);
              return (
                <tr
                  key={p._id}
                  className="transition-all duration-300 border-t hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 even:bg-gray-100"
                >
                  <td className="px-4 py-2">
                    {p.productImage ? (
                      <img
                        src={`http://localhost:5000/uploads/${p.productImage}`}
                        alt={p.productName}
                        className="object-cover w-12 h-12 rounded"
                      />
                    ) : (
                      <span className="text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {p.productName}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.category}</td>
                  <td className="px-4 py-2 text-gray-600">Rs. {p.price}</td>
                  <td className="px-4 py-2 text-gray-600">{p.currentStock}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(p.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {daysLeft < 0 || daysLeft === 0 ? (
                      <span className="px-2 py-1 font-semibold text-red-600 bg-red-100 rounded-full">
                        Expired
                      </span>
                    ) : daysLeft === 1 ? (
                      <span className="font-semibold text-red-600">
                        1 day left
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600">
                        {daysLeft} days left
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleRemove(p._id, p.productName)}
                      className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expiry;
