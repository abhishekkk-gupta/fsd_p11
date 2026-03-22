import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await API.post("/auth/register", form);
      setSuccess("Registered successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛒 FreshCart</div>
        <p style={s.sub}>Create your account</p>
        {error && <div style={s.err}>{error}</div>}
        {success && <div style={s.ok}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} placeholder="Full name" required
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input style={s.input} type="email" placeholder="Email address" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input style={s.input} type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <select style={s.input} value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <button style={s.btn} type="submit">Create Account</button>
        </form>
        <p style={s.link}>Already registered? <Link to="/login" style={{color:"#16a34a"}}>Login</Link></p>
      </div>
    </div>
  );
}

const s = {
  page: { display:"flex", justifyContent:"center", alignItems:"center", minHeight:"100vh",
          background:"linear-gradient(135deg,#dcfce7,#bbf7d0)" },
  card: { background:"#fff", padding:"2.5rem", borderRadius:"16px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.1)", width:"380px" },
  logo: { textAlign:"center", fontSize:"32px", fontWeight:"900", color:"#16a34a", marginBottom:"4px" },
  sub: { textAlign:"center", color:"#86efac", marginBottom:"1.5rem", fontSize:"14px" },
  input: { display:"block", width:"100%", padding:"11px 14px", marginBottom:"12px",
           border:"1px solid #d1fae5", borderRadius:"8px", fontSize:"14px", boxSizing:"border-box" },
  btn: { width:"100%", padding:"12px", background:"#16a34a", color:"#fff", border:"none",
         borderRadius:"8px", fontSize:"15px", cursor:"pointer", fontWeight:"700" },
  err: { background:"#fef2f2", color:"#dc2626", padding:"8px 12px", borderRadius:"6px",
         marginBottom:"12px", fontSize:"13px" },
  ok: { background:"#f0fdf4", color:"#16a34a", padding:"8px 12px", borderRadius:"6px",
        marginBottom:"12px", fontSize:"13px" },
  link: { textAlign:"center", marginTop:"1rem", fontSize:"13px", color:"#64748b" }
};