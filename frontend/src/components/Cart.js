import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const navigate = useNavigate();

  const updateQty = (id, delta) => {
    const newCart = cart.map(i => i.id === id ? {...i, quantity: i.quantity + delta} : i)
                        .filter(i => i.quantity > 0);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (id) => {
    const newCart = cart.filter(i => i.id !== id);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;

  return (
    <div style={s.page}>
      <h2 style={s.title}>🛒 Your Cart</h2>

      {cart.length === 0 ? (
        <div style={s.empty}>
          <div style={{fontSize:"64px"}}>🛒</div>
          <h3>Your cart is empty</h3>
          <p style={{color:"#94a3b8", margin:"8px 0 1.5rem"}}>Add some groceries to get started!</p>
          <button style={s.shopBtn} onClick={() => navigate("/")}>Start Shopping</button>
        </div>
      ) : (
        <div style={s.layout}>
          {/* Cart items */}
          <div style={s.itemsSection}>
            <div style={s.cartHeader}>
              <span style={s.itemCount}>{cart.length} item(s)</span>
              <button style={s.clearBtn} onClick={clearCart}>Clear All</button>
            </div>
            {cart.map(item => (
              <div key={item.id} style={s.item}>
                <img src={item.image_url || "https://picsum.photos/80"} alt={item.name}
                  style={s.itemImg} onError={e => { e.target.src="https://picsum.photos/80"; }} />
                <div style={s.itemInfo}>
                  <div style={s.itemName}>{item.name}</div>
                  <div style={s.itemUnit}>{item.unit}</div>
                  <div style={s.itemPrice}>₹{item.price} each</div>
                </div>
                <div style={s.qtyControl}>
                  <button style={s.qtyBtn} onClick={() => updateQty(item.id, -1)}>−</button>
                  <span style={s.qty}>{item.quantity}</span>
                  <button style={s.qtyBtn} onClick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <div style={s.itemTotal}>₹{(item.price * item.quantity).toFixed(2)}</div>
                <button style={s.removeBtn} onClick={() => removeItem(item.id)}>🗑</button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div style={s.summary}>
            <h3 style={s.sumTitle}>Order Summary</h3>
            <div style={s.sumRow}>
              <span>Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={s.sumRow}>
              <span>Delivery Fee</span>
              <span style={{color: deliveryFee === 0 ? "#16a34a" : "#1a1a1a"}}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </div>
            {deliveryFee > 0 && (
              <div style={s.freeMsg}>Add ₹{(500-subtotal).toFixed(0)} more for free delivery</div>
            )}
            <div style={s.divider}></div>
            <div style={{...s.sumRow, fontWeight:"800", fontSize:"18px"}}>
              <span>Total</span>
              <span style={{color:"#16a34a"}}>₹{total.toFixed(2)}</span>
            </div>
            <button style={s.checkoutBtn} onClick={() => navigate("/checkout")}>
              Proceed to Checkout →
            </button>
            <button style={s.contBtn} onClick={() => navigate("/")}>← Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding:"2rem", maxWidth:"1000px", margin:"0 auto" },
  title: { marginBottom:"1.5rem", color:"#15803d" },
  empty: { textAlign:"center", padding:"4rem", background:"#fff",
           borderRadius:"16px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  shopBtn: { background:"#16a34a", color:"#fff", border:"none", padding:"12px 28px",
             borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"15px" },
  layout: { display:"grid", gridTemplateColumns:"1fr 340px", gap:"1.5rem" },
  itemsSection: { background:"#fff", borderRadius:"12px",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.06)", padding:"1.5rem" },
  cartHeader: { display:"flex", justifyContent:"space-between", alignItems:"center",
                marginBottom:"1rem", paddingBottom:"12px", borderBottom:"1px solid #f0fdf4" },
  itemCount: { fontWeight:"700", color:"#15803d" },
  clearBtn: { background:"#fef2f2", color:"#dc2626", border:"none", padding:"5px 12px",
              borderRadius:"6px", cursor:"pointer", fontSize:"12px" },
  item: { display:"flex", alignItems:"center", gap:"12px", padding:"12px 0",
          borderBottom:"1px solid #f8fafc" },
  itemImg: { width:"64px", height:"64px", borderRadius:"8px", objectFit:"cover" },
  itemInfo: { flex:1 },
  itemName: { fontWeight:"600", fontSize:"14px", marginBottom:"2px" },
  itemUnit: { fontSize:"11px", color:"#94a3b8" },
  itemPrice: { fontSize:"12px", color:"#64748b" },
  qtyControl: { display:"flex", alignItems:"center", gap:"10px" },
  qtyBtn: { width:"28px", height:"28px", background:"#f0fdf4", border:"1px solid #bbf7d0",
            borderRadius:"6px", cursor:"pointer", fontWeight:"700", color:"#16a34a", fontSize:"16px" },
  qty: { fontWeight:"700", minWidth:"20px", textAlign:"center" },
  itemTotal: { fontWeight:"700", color:"#16a34a", minWidth:"70px", textAlign:"right" },
  removeBtn: { background:"none", border:"none", cursor:"pointer", fontSize:"16px" },
  summary: { background:"#fff", borderRadius:"12px", padding:"1.5rem",
             boxShadow:"0 2px 8px rgba(0,0,0,0.06)", height:"fit-content" },
  sumTitle: { marginBottom:"1rem", color:"#15803d" },
  sumRow: { display:"flex", justifyContent:"space-between", marginBottom:"10px", fontSize:"14px" },
  freeMsg: { background:"#f0fdf4", color:"#16a34a", padding:"6px 10px", borderRadius:"6px",
             fontSize:"12px", marginBottom:"10px" },
  divider: { borderTop:"2px solid #f0fdf4", margin:"12px 0" },
  checkoutBtn: { width:"100%", padding:"13px", background:"#16a34a", color:"#fff", border:"none",
                 borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"15px",
                 marginBottom:"8px" },
  contBtn: { width:"100%", padding:"10px", background:"#f0fdf4", color:"#16a34a", border:"none",
             borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"13px" }
};