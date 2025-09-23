import React, { useState } from "react";
import axios from "axios";

const LoginForm = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", form);
      setMessage("Login successful! Role: " + res.data.role);
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      {message && <p className="mb-2 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full border p-2 rounded" />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="w-full border p-2 rounded" />
        <button type="submit" className="bg-green-600 text-white w-full p-2 rounded">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
