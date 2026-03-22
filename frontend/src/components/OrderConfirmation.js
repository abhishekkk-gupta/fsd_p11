import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const order = JSON.parse(localStorage.getItem("lastOrder") || "{}");

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Success animation */}
        <div style={s.successCircle}>✓</div>
        <h2 style={s.title}>Order Placed Successfully!</h2>
        <p style={s.sub}>Thank you for shopping with FreshCart 🛒</p>

        <div style={s.orderIdBox}>
          Order ID: <strong>#{order.order_id || "—"}</strong>
        </div>

        {/* Order details */}
        <div style={s.details}>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>🕐 Delivery Slot</span>
            <span style={s.detailValue}>{order.slot || "—"}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>💳 Payment</span>
            <span style={s.detailValue}>{order.paymentMethod || "—"}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>📍 Address</span>
            <span style={s.detailValue}>{order.address || "—"}</span>
          </div>
          <div style={s.detailRow}>
            <span style={s.detailLabel}>💰 Total Paid</span>
            <span style={{...s.detailValue, color:"#16a34a", fontWeight:"800", fontSize:"18px"}}>
              ₹{order.total?.toFixed(2) || "—"}
            </span>
          </div>
        </div>

        {/* Items ordered */}
        {order.items && order.items.length > 0 && (
          <div style={s.itemsSection}>
            <h4 style={s.itemsTitle}>Items Ordered</h4>
            {order.items.map((item, i) => (
              <div key={i} style={s.item}>
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Payment simulation note */}
        <div style={s.payNote}>
          {order.paymentMethod === "COD"
            ? "💵 Please keep exact change ready for delivery."
            : `✅ Payment of ₹${order.total?.toFixed(2)} via ${order.paymentMethod} was simulated successfully.`
          }
        </div>

        <div style={s.actions}>
          <button style={s.trackBtn} onClick={() => navigate("/my-orders")}>
            📦 Track My Orders
          </button>
          <button style={s.shopBtn} onClick={() => navigate("/")}>
            🛒 Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding:"2rem", display:"flex", justifyContent:"center",
          background:"#f0fdf4", minHeight:"100vh" },
  card: { background:"#fff", borderRadius:"16px", padding:"2.5rem",
          boxShadow:"0 4px 20px rgba(0,0,0,0.08)", maxWidth:"520px", width:"100%",
          textAlign:"center", height:"fit-content", marginTop:"2rem" },
  successCircle: { width:"80px", height:"80px", background:"#16a34a", color:"#fff",
                   borderRadius:"50%", fontSize:"40px", display:"flex", alignItems:"center",
                   justifyContent:"center", margin:"0 auto 1.5rem", fontWeight:"900" },
  title: { color:"#15803d", marginBottom:"8px" },
  sub: { color:"#64748b", marginBottom:"1.5rem" },
  orderIdBox: { background:"#f0fdf4", color:"#15803d", padding:"10px 20px",
                borderRadius:"8px", fontSize:"14px", marginBottom:"1.5rem",
                display:"inline-block" },
  details: { background:"#f8fafc", borderRadius:"10px", padding:"1rem",
             marginBottom:"1.5rem", textAlign:"left" },
  detailRow: { display:"flex", justifyContent:"space-between", alignItems:"flex-start",
               padding:"8px 0", borderBottom:"1px solid #f0fdf4" },
  detailLabel: { color:"#64748b", fontSize:"13px" },
  detailValue: { color:"#1a1a1a", fontSize:"13px", fontWeight:"600",
                 maxWidth:"240px", textAlign:"right" },
  itemsSection: { background:"#f8fafc", borderRadius:"10px", padding:"1rem",
                  marginBottom:"1.5rem", textAlign:"left" },
  itemsTitle: { color:"#15803d", marginBottom:"10px", fontSize:"14px" },
  item: { display:"flex", justifyContent:"space-between", fontSize:"13px",
          color:"#475569", marginBottom:"6px" },
  payNote: { background:"#f0fdf4", color:"#16a34a", padding:"10px 14px",
             borderRadius:"8px", fontSize:"13px", marginBottom:"1.5rem" },
  actions: { display:"flex", gap:"10px", justifyContent:"center" },
  trackBtn: { background:"#16a34a", color:"#fff", border:"none", padding:"10px 20px",
              borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"14px" },
  shopBtn: { background:"#f0fdf4", color:"#16a34a", border:"none", padding:"10px 20px",
             borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"14px" }
};