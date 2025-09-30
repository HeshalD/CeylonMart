import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InventoryManagement from "./Pages/InventoryManagement";
import AddCategory from "./Pages/AddCategory";
import EditCategory from "./Pages/EditCategory";
import ProductTable from "./Pages/ProductTable";
import AddProductForm from "./Pages/AddProductForm";
import UpdateProductForm from "./Pages/UpdateProductForm";
import Shop from "./Pages/Shop/Shop";


function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to inventory */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        <Route path="/dashboard" element={<InventoryManagement />} />
        <Route path="/add-category" element={<AddCategory />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/products" element={<ProductTable />} />
        <Route path="/add-product" element={<AddProductForm />} />
        <Route path="/update-product" element={<UpdateProductForm />} />
        <Route path="/shop" element={<Shop />} />


        {/* Add routes for edit/view later */}
      </Routes>
    </Router>
  );
}

export default App;
