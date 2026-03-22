import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ cartCount = 0 }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>🛒 FreshCart</Link>
      <div style={s.links}>
        <Link to="/" style={s.link}>🏠 Home</Link>
        <Link to="/my-orders" style={s.link}>📦 My Orders</Link>
        {user.role === "admin" && <Link to="/admin" style={s.link}>⚙️ Admin</Link>}
        <Link to="/cart" style={s.cartBtn}>
          🛒 Cart {totalItems > 0 && <span style={s.badge}>{totalItems}</span>}
        </Link>
        <span style={s.user}>👤 {user.name}</span>
        <button onClick={logout} style={s.logout}>Logout</button>
      </div>
    </nav>
  );
}

const s = {
  nav: { background:"#16a34a", color:"#fff", display:"flex", justifyContent:"space-between",
         alignItems:"center", padding:"0 2rem", height:"58px",
         boxShadow:"0 2px 12px rgba(22,163,74,0.3)", position:"sticky", top:0, zIndex:100 },
  logo: { color:"#fff", fontWeight:"900", fontSize:"22px" },
  links: { display:"flex", alignItems:"center", gap:"1rem" },
  link: { color:"#dcfce7", fontSize:"14px" },
  cartBtn: { background:"#fff", color:"#16a34a", padding:"6px 14px", borderRadius:"20px",
             fontWeight:"700", fontSize:"14px", position:"relative" },
  badge: { background:"#dc2626", color:"#fff", borderRadius:"50%", padding:"1px 6px",
           fontSize:"11px", marginLeft:"4px" },
  user: { color:"#bbf7d0", fontSize:"13px" },
  logout: { background:"rgba(255,255,255,0.15)", border:"none", color:"#fff",
            padding:"5px 14px", borderRadius:"6px", cursor:"pointer", fontSize:"13px" }
};