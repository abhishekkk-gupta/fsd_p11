import React, { useEffect, useState } from "react";
import API from "../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("overview");
  const [form, setForm] = useState({ name:"", category:"", price:"", quantity:"", unit:"piece", description:"" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadAll = () => {
    API.get("/admin/stats").then(r => setStats(r.data));
    API.get("/products?").then(r => setProducts(r.data));
    API.get("/orders/all").then(r => setOrders(r.data));
  };

  useEffect(() => { loadAll(); }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    if (editId) {
      await API.put(`/products/${editId}`, form);
    } else {
      await API.post("/products", form);
    }
    setForm({ name:"", category:"", price:"", quantity:"", unit:"piece", description:"" });
    setEditId(null); setShowForm(false);
    loadAll();
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await API.delete(`/products/${id}`);
      loadAll();
    }
  };

  const startEdit = (p) => {
    setForm({ name:p.name, category:p.category, price:p.price,
              quantity:p.quantity, unit:p.unit, description:p.description });
    setEditId(p.id); setShowForm(true); setTab("products");
  };

  return (
    <div style={s.page}>
      <h2 style={s.title}>⚙️ Admin Dashboard</h2>

      {/* Tabs */}
      <div style={s.tabs}>
        {["overview","products","orders"].map(t => (
          <button key={t} style={{...s.tab, background: tab===t?"#16a34a":"#fff",
            color: tab===t?"#fff":"#64748b"}} onClick={() => setTab(t)}>
            {t==="overview"?"📊 Overview":t==="products"?"📦 Products":"🧾 Orders"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && stats && (
        <div>
          <div style={s.statsRow}>
            <StatCard icon="📦" label="Total Orders" value={stats.total_orders} color="#16a34a" />
            <StatCard icon="💰" label="Total Revenue" value={`₹${stats.total_revenue}`} color="#d97706" />
            <StatCard icon="🥦" label="Products" value={stats.total_products} color="#0891b2" />
            <StatCard icon="👥" label="Customers" value={stats.total_users} color="#7c3aed" />
          </div>
          {stats.low_stock?.length > 0 && (
            <div style={s.alertBox}>
              <h4 style={{color:"#dc2626", marginBottom:"8px"}}>⚠️ Low Stock Alert</h4>
              {stats.low_stock.map(p => (
                <div key={p.id} style={s.alertItem}>
                  <span>{p.name}</span>
                  <span style={{color:"#dc2626", fontWeight:"700"}}>Only {p.quantity} left!</span>
                  <button style={s.editSmBtn} onClick={() => startEdit(p)}>Update Stock</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div>
          <div style={s.tableHeader}>
            <span>{products.length} products</span>
            <button style={s.addBtn} onClick={() => { setShowForm(!showForm); setEditId(null);
              setForm({name:"",category:"",price:"",quantity:"",unit:"piece",description:""}); }}>
              {showForm ? "Cancel" : "+ Add Product"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={saveProduct} style={s.form}>
              <h4 style={{marginBottom:"12px", color:"#15803d"}}>
                {editId ? "Edit Product" : "Add New Product"}
              </h4>
              <div style={s.formGrid}>
                <input style={s.input} placeholder="Product name *" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input style={s.input} placeholder="Category (e.g. Vegetables)"
                  value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                <input style={s.input} type="number" placeholder="Price (₹) *" required
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                <input style={s.input} type="number" placeholder="Quantity *" required
                  value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                <input style={s.input} placeholder="Unit (kg, piece, packet)"
                  value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
                <input style={s.input} placeholder="Description"
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button style={s.saveBtn} type="submit">
                {editId ? "Save Changes" : "Add Product"}
              </button>
            </form>
          )}

          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Unit</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={s.tr}>
                  <td>{p.name}</td>
                  <td><span style={s.catTag}>{p.category}</span></td>
                  <td style={{fontWeight:"700",color:"#16a34a"}}>₹{p.price}</td>
                  <td>
                    <span style={{color: p.quantity < 10 ? "#dc2626" : "#16a34a", fontWeight:"600"}}>
                      {p.quantity}
                    </span>
                  </td>
                  <td style={{color:"#94a3b8"}}>{p.unit}</td>
                  <td>
                    <button style={s.editBtn} onClick={() => startEdit(p)}>✏️ Edit</button>
                    <button style={s.delBtn} onClick={() => deleteProduct(p.id)}>🗑 Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div>
          <p style={{color:"#64748b", marginBottom:"1rem"}}>{orders.length} total orders</p>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th>Order ID</th><th>Customer</th><th>Amount</th><th>Slot</th><th>Payment</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={s.tr}>
                  <td><strong>#{o.id}</strong></td>
                  <td>
                    <div style={{fontWeight:"600"}}>{o.customer_name}</div>
                    <div style={{fontSize:"11px",color:"#94a3b8"}}>{o.email}</div>
                  </td>
                  <td style={{fontWeight:"700",color:"#16a34a"}}>₹{o.total_amount}</td>
                  <td style={{fontSize:"12px"}}>{o.slot}</td>
                  <td><span style={s.payTag}>{o.payment_method}</span></td>
                  <td style={{fontSize:"12px",color:"#94a3b8"}}>
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{textAlign:"center",padding:"2rem",color:"#94a3b8"}}>No orders yet</div>}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background:"#fff", borderRadius:"12px", padding:"1.2rem 1.5rem",
      boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flex:1, borderTop:`4px solid ${color}` }}>
      <div style={{fontSize:"28px"}}>{icon}</div>
      <div style={{fontSize:"28px", fontWeight:"900", color}}>{value}</div>
      <div style={{color:"#64748b", fontSize:"13px"}}>{label}</div>
    </div>
  );
}

const s = {
  page: { padding:"2rem", maxWidth:"1100px", margin:"0 auto" },
  title: { marginBottom:"1.5rem", color:"#15803d" },
  tabs: { display:"flex", gap:"8px", marginBottom:"1.5rem" },
  tab: { padding:"8px 20px", border:"1px solid #e2e8f0", borderRadius:"8px",
         cursor:"pointer", fontSize:"14px", fontWeight:"600" },
  statsRow: { display:"flex", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  alertBox: { background:"#fef2f2", borderRadius:"12px", padding:"1.2rem",
              border:"1px solid #fecaca", marginBottom:"1rem" },
  alertItem: { display:"flex", justifyContent:"space-between", alignItems:"center",
               padding:"6px 0", borderBottom:"1px solid #fecaca", fontSize:"13px" },
  editSmBtn: { background:"#fef9c3", color:"#d97706", border:"none", padding:"4px 10px",
               borderRadius:"6px", cursor:"pointer", fontSize:"12px" },
  tableHeader: { display:"flex", justifyContent:"space-between", alignItems:"center",
                 marginBottom:"1rem" },
  addBtn: { background:"#16a34a", color:"#fff", border:"none", padding:"8px 18px",
            borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"14px" },
  form: { background:"#f0fdf4", borderRadius:"12px", padding:"1.5rem", marginBottom:"1.5rem" },
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" },
  input: { padding:"9px 12px", border:"1px solid #bbf7d0", borderRadius:"8px",
           fontSize:"13px", width:"100%", boxSizing:"border-box" },
  saveBtn: { background:"#16a34a", color:"#fff", border:"none", padding:"9px 22px",
             borderRadius:"8px", cursor:"pointer", fontWeight:"700" },
  table: { width:"100%", borderCollapse:"collapse", background:"#fff",
           borderRadius:"12px", overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  thead: { background:"#f0fdf4", fontSize:"12px", fontWeight:"700", color:"#15803d" },
  tr: { borderBottom:"1px solid #f0fdf4", fontSize:"13px" },
  catTag: { background:"#dcfce7", color:"#15803d", padding:"2px 8px",
            borderRadius:"10px", fontSize:"11px" },
  payTag: { background:"#e0f2fe", color:"#0369a1", padding:"2px 8px",
            borderRadius:"10px", fontSize:"11px" },
  editBtn: { background:"#e0e7ff", color:"#4f46e5", border:"none", padding:"4px 8px",
             borderRadius:"6px", cursor:"pointer", fontSize:"12px", marginRight:"4px" },
  delBtn: { background:"#fef2f2", color:"#dc2626", border:"none", padding:"4px 8px",
            borderRadius:"6px", cursor:"pointer", fontSize:"12px" }
};