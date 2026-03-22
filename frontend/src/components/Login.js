import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🛒 FreshCart</div>
        <p style={s.sub}>Your daily grocery store</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={s.input} type="email" placeholder="Email address" required
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input style={s.input} type="password" placeholder="Password" required
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <button style={s.btn} type="submit">Login</button>
        </form>
        <p style={s.link}>New customer? <Link to="/register" style={{color:"#16a34a"}}>Register here</Link></p>
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
  link: { textAlign:"center", marginTop:"1rem", fontSize:"13px", color:"#64748b" }
};