import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const PAYMENT_METHODS = [
  { id: "UPI", label: "UPI", icon: "📱", desc: "Pay via GPay, PhonePe, Paytm" },
  { id: "Card", label: "Credit/Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay" },
  { id: "COD", label: "Cash on Delivery", icon: "💵", desc: "Pay when order arrives" },
  { id: "NetBanking", label: "Net Banking", icon: "🏦", desc: "All major banks supported" },
];

export default function Checkout() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [address, setAddress] = useState("");
  const [cart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/slots").then(r => setSlots(r.data));
    if (cart.length === 0) navigate("/cart");
  }, []);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    if (!selectedSlot) { setError("Please select a delivery slot"); return; }
    if (!address.trim()) { setError("Please enter your delivery address"); return; }
    setError(""); setLoading(true);
    try {
      const res = await API.post("/orders", {
        items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
        total: total,
        slot: selectedSlot,
        payment_method: paymentMethod,
        address: address
      });
      localStorage.setItem("cart", JSON.stringify([]));
      localStorage.setItem("lastOrder", JSON.stringify({
        order_id: res.data.order_id,
        total, slot: selectedSlot, paymentMethod, address,
        items: cart
      }));
      navigate("/order-confirmation");
    } catch (err) {
      setError("Failed to place order. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <h2 style={s.title}>🏠 Checkout</h2>
      <div style={s.layout}>
        <div style={s.left}>

          {/* Delivery Address */}
          <div style={s.section}>
            <h3 style={s.secTitle}>📍 Delivery Address</h3>
            <textarea style={s.textarea} rows={3}
              placeholder="Enter your full delivery address (House no, Street, Area, City, Pincode)"
              value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          {/* Delivery Slot */}
          <div style={s.section}>
            <h3 style={s.secTitle}>🕐 Select Delivery Slot</h3>
            <div style={s.slotsGrid}>
              {slots.map(slot => (
                <div key={slot.id}
                  style={{...s.slotCard, border: selectedSlot === slot.time
                    ? "2px solid #16a34a" : "2px solid #e2e8f0",
                    background: selectedSlot === slot.time ? "#f0fdf4" : "#fff"}}
                  onClick={() => setSelectedSlot(slot.time)}>
                  <div style={s.slotLabel}>{slot.label}</div>
                  <div style={s.slotTime}>{slot.time}</div>
                  {selectedSlot === slot.time && <div style={s.slotCheck}>✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div style={s.section}>
            <h3 style={s.secTitle}>💳 Payment Method</h3>
            <div style={s.payGrid}>
              {PAYMENT_METHODS.map(pm => (
                <div key={pm.id}
                  style={{...s.payCard, border: paymentMethod === pm.id
                    ? "2px solid #16a34a" : "2px solid #e2e8f0",
                    background: paymentMethod === pm.id ? "#f0fdf4" : "#fff"}}
                  onClick={() => setPaymentMethod(pm.id)}>
                  <span style={s.payIcon}>{pm.icon}</span>
                  <div>
                    <div style={s.payLabel}>{pm.label}</div>
                    <div style={s.payDesc}>{pm.desc}</div>
                  </div>
                  {paymentMethod === pm.id && <span style={s.payCheck}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {error && <div style={s.err}>{error}</div>}
        </div>

        {/* Order summary */}
        <div style={s.summary}>
          <h3 style={s.sumTitle}>Order Summary</h3>
          {cart.map(i => (
            <div key={i.id} style={s.sumItem}>
              <span>{i.name} × {i.quantity}</span>
              <span>₹{(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={s.divider}></div>
          <div style={s.sumRow}><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div style={s.sumRow}>
            <span>Delivery</span>
            <span style={{color: deliveryFee===0?"#16a34a":"#1a1a1a"}}>
              {deliveryFee===0?"FREE":`₹${deliveryFee}`}
            </span>
          </div>
          <div style={s.divider}></div>
          <div style={{...s.sumRow, fontWeight:"800", fontSize:"18px", color:"#16a34a"}}>
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
          {selectedSlot && (
            <div style={s.slotInfo}>📦 Delivery: {selectedSlot}</div>
          )}
          {paymentMethod && (
            <div style={s.slotInfo}>💳 Payment: {paymentMethod}</div>
          )}
          <button style={{...s.placeBtn, opacity: loading ? 0.7 : 1}}
            onClick={placeOrder} disabled={loading}>
            {loading ? "Placing Order..." : "Place Order 🎉"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding:"2rem", maxWidth:"1100px", margin:"0 auto" },
  title: { marginBottom:"1.5rem", color:"#15803d" },
  layout: { display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.5rem" },
  left: {},
  section: { background:"#fff", borderRadius:"12px", padding:"1.5rem",
             boxShadow:"0 2px 8px rgba(0,0,0,0.06)", marginBottom:"1.2rem" },
  secTitle: { marginBottom:"1rem", color:"#15803d", fontSize:"16px" },
  textarea: { width:"100%", padding:"12px", border:"1px solid #d1fae5", borderRadius:"8px",
              fontSize:"14px", fontFamily:"inherit", resize:"none", boxSizing:"border-box" },
  slotsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  slotCard: { padding:"14px", borderRadius:"10px", cursor:"pointer", position:"relative",
              transition:"all 0.15s" },
  slotLabel: { fontWeight:"700", fontSize:"14px", color:"#15803d", marginBottom:"4px" },
  slotTime: { fontSize:"13px", color:"#64748b" },
  slotCheck: { position:"absolute", top:"10px", right:"12px", color:"#16a34a",
               fontWeight:"900", fontSize:"16px" },
  payGrid: { display:"flex", flexDirection:"column", gap:"10px" },
  payCard: { display:"flex", alignItems:"center", gap:"12px", padding:"12px",
             borderRadius:"10px", cursor:"pointer", transition:"all 0.15s" },
  payIcon: { fontSize:"24px" },
  payLabel: { fontWeight:"600", fontSize:"14px" },
  payDesc: { fontSize:"12px", color:"#94a3b8" },
  payCheck: { marginLeft:"auto", color:"#16a34a", fontWeight:"900", fontSize:"18px" },
  err: { background:"#fef2f2", color:"#dc2626", padding:"10px 14px",
         borderRadius:"8px", fontSize:"13px" },
  summary: { background:"#fff", borderRadius:"12px", padding:"1.5rem",
             boxShadow:"0 2px 8px rgba(0,0,0,0.06)", height:"fit-content" },
  sumTitle: { marginBottom:"1rem", color:"#15803d" },
  sumItem: { display:"flex", justifyContent:"space-between", fontSize:"13px",
             marginBottom:"6px", color:"#475569" },
  divider: { borderTop:"1px solid #f0fdf4", margin:"10px 0" },
  sumRow: { display:"flex", justifyContent:"space-between", fontSize:"14px", marginBottom:"6px" },
  slotInfo: { background:"#f0fdf4", color:"#16a34a", padding:"6px 10px",
              borderRadius:"6px", fontSize:"12px", marginBottom:"6px" },
  placeBtn: { width:"100%", padding:"14px", background:"#16a34a", color:"#fff", border:"none",
              borderRadius:"8px", cursor:"pointer", fontWeight:"800", fontSize:"16px",
              marginTop:"12px" }
};