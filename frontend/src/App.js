import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderConfirmation from "./components/OrderConfirmation";
import MyOrders from "./components/MyOrders";
import AdminDashboard from "./components/AdminDashboard";
import Navbar from "./components/Navbar";

function PrivateRoute({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Navbar /><Home /></PrivateRoute>} />
        <Route path="/cart" element={<PrivateRoute><Navbar /><Cart /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Navbar /><Checkout /></PrivateRoute>} />
        <Route path="/order-confirmation" element={<PrivateRoute><Navbar /><OrderConfirmation /></PrivateRoute>} />
        <Route path="/my-orders" element={<PrivateRoute><Navbar /><MyOrders /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Navbar /><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;