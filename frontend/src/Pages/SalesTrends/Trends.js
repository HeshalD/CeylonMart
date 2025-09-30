import React, { useState, useEffect, useCallback } from "react";
import { getCategories, getProducts } from "../../api/inventoryApi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Trends = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [chartData, setChartData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await getCategories();
      const categoryList = categoriesResponse.data?.categories || categoriesResponse.data || [];
      setCategories(categoryList);
      
      // Fetch products
      const productsResponse = await getProducts();
      const productList = productsResponse.data || [];
      setProducts(productList);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generate chart data for selected category
  useEffect(() => {
    if (selectedCategory && products.length > 0) {
      const categoryProducts = products.filter(product => 
        product.category === selectedCategory
      );
      
      if (categoryProducts.length > 0) {
        const chartLabels = categoryProducts.map(product => product.productName);
        const stockData = categoryProducts.map(product => product.currentStock || 0);
        
        // Create background colors based on stock status
        const backgroundColors = categoryProducts.map(product => {
          const currentStock = product.currentStock || 0;
          const minStock = product.minimumStockLevel || product.minStock || 0;
          
          // Red for out of stock or low stock, green for others
          if (currentStock === 0 || currentStock <= minStock) {
            return 'rgba(239, 68, 68, 0.7)'; // Red
          } else {
            return 'rgba(34, 197, 94, 1)'; // Green
          }
        });
        
        const borderColors = categoryProducts.map(product => {
          const currentStock = product.currentStock || 0;
          const minStock = product.minimumStockLevel || product.minStock || 0;
          
          if (currentStock === 0 || currentStock <= minStock) {
            return 'rgba(239, 68, 68, 1)'; // Red border
          } else {
            return 'rgba(34, 197, 94, 1)'; // Green border
          }
        });
        
        setChartData({
          labels: chartLabels,
          datasets: [
            {
              label: 'Current Stock',
              data: stockData,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              borderWidth: 1
            }
          ]
        });
      } else {
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Category-wise Inventory Analysis</h1>
        <p className="text-gray-600">Analyze product stock levels within each category</p>
      </div>

      {/* Category Selector */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 font-semibold text-gray-900 transition-all duration-200 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 hover:shadow-md md:w-1/3"
        >
          <option value="">Choose a category...</option>
          {categories.map((category, index) => {
            const categoryName = category.categoryName || category.name || category;
            return (
              <option key={index} value={categoryName}>
                {categoryName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Category Products Bar Chart */}
      {selectedCategory ? (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            {selectedCategory} - Product Stock Levels
          </h2>
          
          {chartData ? (
            <>
              {/* Legend */}
              <div className="flex gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium text-green-700">Normal Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="font-medium text-red-700">Low Stock / Out of Stock</span>
                </div>
              </div>
              
              <div className="h-96">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false // Hide default legend since we have custom one
                      },
                      title: {
                        display: true,
                        text: `Stock Levels for ${selectedCategory} Products`
                      },
                      tooltip: {
                        callbacks: {
                          afterLabel: function(context) {
                            const productIndex = context.dataIndex;
                            const categoryProducts = products.filter(product => 
                              product.category === selectedCategory
                            );
                            const product = categoryProducts[productIndex];
                            const currentStock = product.currentStock || 0;
                            const minStock = product.minimumStockLevel || product.minStock || 0;
                            
                            if (currentStock === 0) {
                              return 'Status: Out of Stock';
                            } else if (currentStock <= minStock) {
                              return `Status: Low Stock (Min: ${minStock})`;
                            } else {
                              return `Status: Normal Stock (Min: ${minStock})`;
                            }
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Stock Quantity'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Products'
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45
                        }
                      }
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No products found in {selectedCategory} category</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Please select a category to view product stock levels</p>
          </div>
        </div>
      )}

      {/* Product Details Table for Selected Category */}
      {selectedCategory && chartData && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="mb-4 text-xl font-bold text-gray-900">{selectedCategory} - Product Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Minimum Stock
                    </th>
                    <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products
                    .filter(product => product.category === selectedCategory)
                    .map((product, index) => {
                      const currentStock = product.currentStock || 0;
                      const minStock = product.minimumStockLevel || product.minStock || 0;
                      
                      let status, statusClass;
                      if (currentStock === 0) {
                        status = 'Out of Stock';
                        statusClass = 'bg-red-100 text-red-800';
                      } else if (currentStock <= minStock) {
                        status = 'Low Stock';
                        statusClass = 'bg-red-100 text-red-800';
                      } else {
                        status = 'Normal';
                        statusClass = 'bg-green-100 text-green-800';
                      }
                      
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {product.productName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {currentStock}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {minStock}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trends;
