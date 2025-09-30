import React, { useState, useEffect } from 'react';
import { getCategories, getProducts, getLowStockProducts, getExpiringProducts } from '../api/inventoryApi';
import { subscribeToDashboardUpdates, unsubscribeFromDashboardUpdates } from '../utils/dashboardEmitter';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    categories: 0,
    totalProducts: 0,
    totalItems: 0,
    lowStockAlerts: 0,
    expiryAlerts: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await getCategories();
        const categoriesCount = categoriesResponse.data?.categories?.length || 0;

        // Fetch products
        const productsResponse = await getProducts();
        const products = productsResponse.data || [];
        const totalProducts = products.length;
        
        // Calculate total items (sum of all currentStock quantities)
        const totalItems = products.reduce((sum, product) => sum + (product.currentStock || 0), 0);

        // Fetch low stock products
        const lowStockResponse = await getLowStockProducts();
        const lowStockCount = lowStockResponse.data?.products?.length || 0;

        // Fetch expiring products
        const expiringResponse = await getExpiringProducts();
        const expiringCount = expiringResponse.data?.length || 0;

        setStats({
          categories: categoriesCount,
          totalProducts: totalProducts,
          totalItems: totalItems,
          lowStockAlerts: lowStockCount,
          expiryAlerts: expiringCount
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep current stats on error instead of overriding with fallback
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Subscribe to dashboard updates
    const handleDashboardUpdate = () => {
      fetchStats();
    };

    subscribeToDashboardUpdates(handleDashboardUpdate);

    // Cleanup subscription on unmount
    return () => {
      unsubscribeFromDashboardUpdates(handleDashboardUpdate);
    };
  }, []);

  const statBoxes = [
    {
      title: 'Categories',
      value: stats.categories,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
        </svg>
      ),
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockAlerts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Expiry Alerts',
      value: stats.expiryAlerts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-6 bg-white shadow-md rounded-xl animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-6 mb-2 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-5">
      {statBoxes.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgLight} ${stat.borderColor} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bgColor} text-white p-3 rounded-lg`}>
              {stat.icon}
            </div>
            <div className={`${stat.textColor} text-3xl font-bold`}>
              {stat.value}
            </div>
          </div>
          <h3 className={`${stat.textColor} text-lg font-semibold mb-2`}>
            {stat.title}
          </h3>
          <p className="text-sm text-gray-600">
            {stat.title === 'Categories' && 'Product categories available'}
            {stat.title === 'Total Products' && 'Different products in stock'}
            {stat.title === 'Total Items' && 'Total quantity in inventory'}
            {stat.title === 'Low Stock Alerts' && 'Items running low on stock'}
            {stat.title === 'Expiry Alerts' && 'Items expiring soon'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
