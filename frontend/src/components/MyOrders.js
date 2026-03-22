import React, { useEffect, useState } from "react";
import API from "../api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get("/orders/my").then(r => { setOrders(r.data); setLoading(false); });
  }, []);

  if (loading) return <div style={{padding:"2rem"}}>Loading orders...</div>;

  return (
    <div style={s.page}>
      <h2 style={s.title}>📦 My Orders</h2>
      {orders.length === 0 ? (
        <div style={s.empty}>
          <div style={{fontSize:"64px"}}>📦</div>
          <h3>No orders yet</h3>
          <p style={{color:"#94a3b8"}}>Your order history will appear here</p>
        </div>
      ) : (
        <div style={s.list}>
          {orders.map(o => (
            <div key={o.id} style={s.card}>
              <div style={s.cardHeader} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                <div>
                  <span style={s.orderId}>Order #{o.id}</span>
                  <span style={s.status}>✅ {o.status}</span>
                </div>
                <div style={s.cardRight}>
                  <span style={s.amount}>₹{o.total_amount}</span>
                  <span style={s.expand}>{expanded === o.id ? "▲" : "▼"}</span>
                </div>
              </div>
              <div style={s.cardMeta}>
                <span>🕐 {o.slot}</span>
                <span>💳 {o.payment_method}</span>
                <span>📅 {new Date(o.created_at).toLocaleDateString("en-IN")}</span>
              </div>
              {expanded === o.id && (
                <div style={s.itemsSection}>
                  <div style={s.address}>📍 {o.address}</div>
                  <h4 style={s.itemsTitle}>Items</h4>
                  {o.items?.map((item, i) => (
                    <div key={i} style={s.item}>
                      <span>{item.product_name} × {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding:"2rem", maxWidth:"800px", margin:"0 auto" },
  title: { marginBottom:"1.5rem", color:"#15803d" },
  empty: { textAlign:"center", padding:"4rem", background:"#fff",
           borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  list: { display:"flex", flexDirection:"column", gap:"12px" },
  card: { background:"#fff", borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
          overflow:"hidden" },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"16px", cursor:"pointer", background:"#f8fafc" },
  orderId: { fontWeight:"700", color:"#15803d", marginRight:"10px" },
  status: { background:"#dcfce7", color:"#16a34a", padding:"2px 10px",
            borderRadius:"12px", fontSize:"12px" },
  cardRight: { display:"flex", alignItems:"center", gap:"12px" },
  amount: { fontWeight:"800", color:"#16a34a", fontSize:"16px" },
  expand: { color:"#94a3b8", fontSize:"12px" },
  cardMeta: { display:"flex", gap:"1.5rem", padding:"8px 16px",
              fontSize:"12px", color:"#64748b", background:"#fff",
              borderTop:"1px solid #f0fdf4" },
  itemsSection: { padding:"16px", borderTop:"1px solid #f0fdf4" },
  address: { fontSize:"13px", color:"#475569", marginBottom:"10px" },
  itemsTitle: { fontSize:"13px", color:"#15803d", marginBottom:"8px" },
  item: { display:"flex", justifyContent:"space-between", fontSize:"13px",
          color:"#475569", marginBottom:"6px" }
};