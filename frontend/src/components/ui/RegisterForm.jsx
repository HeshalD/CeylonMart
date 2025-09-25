import React, { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    address: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/register", form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} className="w-full border p-2 rounded" />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} className="w-full border p-2 rounded" />
        
        <select name="role" onChange={handleChange} className="w-full border p-2 rounded">
          <option value="customer">Customer</option>
          <option value="shop_owner">Shop Owner</option>
          <option value="supplier_admin">Supplier Admin</option>
          <option value="inventory_manager">Inventory Manager</option>
          <option value="delivery_admin">Delivery Manager</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
