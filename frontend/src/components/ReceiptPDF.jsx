import React from 'react';
import jsPDF from 'jspdf';

const ReceiptPDF = ({ orderData, paymentData, isVisible = false }) => {
  const generatePDF = () => {
    // Debug logging
    console.log('Order Data:', orderData);
    console.log('Payment Data:', paymentData);
    
    const doc = new jsPDF();
    
    // CeylonMart Logo (only text)
    doc.setFontSize(24);
    doc.setTextColor(0, 120, 0);
    doc.text('CeylonMart', 20, 30);
    
    // Receipt title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 20, 50);
    
    // Order details
    doc.setFontSize(12);
    const orderId = orderData?._id || paymentData?.orderId || 'N/A';
    const createdAt = orderData?.createdAt || paymentData?.createdAt || new Date().toISOString();
    const orderDate = new Date(createdAt).toLocaleDateString();
    const orderTime = new Date(createdAt).toLocaleTimeString();
    const totalAmount = orderData?.totalAmount || paymentData?.amount || 0;
    
    doc.text(`Order ID: ${orderId}`, 20, 70);
    doc.text(`Date: ${orderDate}`, 20, 80);
    doc.text(`Time: ${orderTime}`, 20, 90);
    doc.text(`Payment Method: ${paymentData?.paymentMethod || 'N/A'}`, 20, 100);
    doc.text(`Delivery District: ${paymentData?.district || 'N/A'}`, 20, 110);
    doc.text(`Status: ${paymentData?.status || 'N/A'}`, 20, 120);
    
    // Items table header
    doc.text('Items:', 20, 140);
    doc.text('Product', 20, 150);
    doc.text('Qty', 100, 150);
    doc.text('Price', 130, 150);
    doc.text('Total', 160, 150);
    
    // Draw line under header
    doc.line(20, 155, 190, 155);
    
    // Items
    let yPosition = 165;
    const items = orderData?.items || [];
    
    if (items.length === 0) {
      doc.text('No items found in order', 20, yPosition);
      yPosition += 10;
    } else {
      items.forEach((item, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        const productName = item.productName || item.name || 'Unknown Product';
        const quantity = item.quantity || item.qty || 0;
        const price = Number(item.price || 0);
        const itemTotal = price * quantity;
        
        doc.text(productName, 20, yPosition);
        doc.text(quantity.toString(), 100, yPosition);
        doc.text(`Rs. ${price.toFixed(2)}`, 130, yPosition);
        doc.text(`Rs. ${itemTotal.toFixed(2)}`, 160, yPosition);
        yPosition += 10;
      });
    }
    
    // Total
    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: Rs. ${Number(totalAmount).toFixed(2)}`, 20, yPosition);
    
    // Footer
    yPosition += 20;
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', 20, yPosition);
    doc.text('CeylonMart - Your trusted shopping partner', 20, yPosition + 10);
    
    // Generate filename with timestamp if no order ID
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = orderId !== 'N/A' ? `receipt-${orderId}.pdf` : `receipt-${timestamp}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  };

  return (
    <div style={{ display: isVisible ? 'block' : 'none' }}>
      <button 
        onClick={generatePDF}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md font-semibold flex items-center gap-2 mx-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download PDF Receipt
      </button>
    </div>
  );
};

export default ReceiptPDF;
