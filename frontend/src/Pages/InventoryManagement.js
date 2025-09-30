import React, { useState } from 'react';
import MainHeader from '../components/MainHeader';
import DashboardStats from '../components/DashboardStats';
import InventoryNav from '../components/InventoryNav';
import ProductInventory from './ProductsInventory/ProductInventory';
import LowStock from './LowStockAlerts/LowStock';
import StockHistory from './StockHistory/StockHistory';
import Expiry from './Expiry';
import Reports from './Reports/Reports';
import Trends from './SalesTrends/Trends';
import Reorder from './Reorder/Reorder';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('products');

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductInventory />;
      case 'low-stock':
        return <LowStock />;
      case 'stock-history':
        return <StockHistory />;
      case 'expires':
        return <Expiry />;
      case 'reports':
        return <Reports />;
      case 'sales-trends':
        return <Trends />;
      case 'reorder':
        return <Reorder />;
      default:
        return <ProductInventory />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <MainHeader />

      <div className="px-4 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-10 text-left">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-emerald-800">
            Storekeeper Dashboard
          </h1>
          <p className="text-lg text-teal-700">
            Manage your inventory efficiently and effectively
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="mb-10">
          <DashboardStats />
        </div>

        {/* Navigation and Content */}
        <div className="space-y-8">
          <div className="p-4 border shadow-lg bg-white/90 border-emerald-200 rounded-2xl">
            <InventoryNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Content Area */}
          <div className="p-6 border shadow-xl bg-white/95 border-emerald-200 rounded-2xl min-h-96">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
