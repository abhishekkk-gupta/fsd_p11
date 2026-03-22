import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart") || "[]"));
  const [added, setAdded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/products/categories").then(r => setCategories(r.data));
    loadProducts();
  }, []);

  useEffect(() => { loadProducts(); }, [selectedCat, search]);

  const loadProducts = () => {
    let url = "/products?";
    if (selectedCat) url += `category=${selectedCat}&`;
    if (search) url += `search=${search}`;
    API.get(url).then(r => setProducts(r.data));
  };

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i);
    } else {
      newCart = [...cart, {...product, quantity: 1}];
    }
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setAdded({...added, [product.id]: true});
    setTimeout(() => setAdded(a => ({...a, [product.id]: false})), 1000);
  };

  const getQty = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>🥦 Fresh Groceries Delivered to Your Door</h1>
        <p style={s.heroSub}>Order before 6 PM for same-day delivery</p>
        <input style={s.searchBox} placeholder="🔍 Search for vegetables, fruits, dairy..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={s.main}>
        {/* Categories sidebar */}
        <div style={s.sidebar}>
          <h3 style={s.sideTitle}>Categories</h3>
          <div style={{...s.catBtn, background: !selectedCat ? "#16a34a" : "#f0fdf4",
            color: !selectedCat ? "#fff" : "#16a34a"}}
            onClick={() => setSelectedCat("")}>All Products</div>
          {categories.map(c => (
            <div key={c} style={{...s.catBtn,
              background: selectedCat === c ? "#16a34a" : "#f0fdf4",
              color: selectedCat === c ? "#fff" : "#16a34a"}}
              onClick={() => setSelectedCat(c)}>{c}</div>
          ))}
        </div>

        {/* Products grid */}
        <div style={s.content}>
          <div style={s.topBar}>
            <span style={s.resultCount}>{products.length} products found</span>
            {totalItems > 0 && (
              <button style={s.viewCartBtn} onClick={() => navigate("/cart")}>
                🛒 View Cart ({totalItems} items)
              </button>
            )}
          </div>
          <div style={s.grid}>
            {products.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.imgWrap}>
                  <img src={p.image_url || "https://picsum.photos/200"} alt={p.name}
                    style={s.img} onError={e => { e.target.src = "https://picsum.photos/200"; }} />
                  <span style={s.catTag}>{p.category}</span>
                </div>
                <div style={s.cardBody}>
                  <h4 style={s.productName}>{p.name}</h4>
                  <p style={s.desc}>{p.description}</p>
                  <div style={s.cardFooter}>
                    <div>
                      <span style={s.price}>₹{p.price}</span>
                      <span style={s.unit}> / {p.unit}</span>
                    </div>
                    <span style={s.stock}>Stock: {p.quantity}</span>
                  </div>
                  {getQty(p.id) > 0 ? (
                    <div style={s.qtyRow}>
                      <span style={s.inCart}>✓ {getQty(p.id)} in cart</span>
                      <button style={s.addMoreBtn} onClick={() => addToCart(p)}>+ Add More</button>
                    </div>
                  ) : (
                    <button style={{...s.addBtn, background: added[p.id] ? "#15803d" : "#16a34a"}}
                      onClick={() => addToCart(p)}>
                      {added[p.id] ? "✓ Added!" : "+ Add to Cart"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {products.length === 0 && (
            <div style={s.empty}>No products found. Try a different search or category.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:"#f0fdf4", minHeight:"100vh" },
  hero: { background:"linear-gradient(135deg,#16a34a,#15803d)", color:"#fff",
          padding:"3rem 2rem", textAlign:"center" },
  heroTitle: { fontSize:"32px", fontWeight:"900", marginBottom:"8px" },
  heroSub: { fontSize:"16px", color:"#bbf7d0", marginBottom:"1.5rem" },
  searchBox: { width:"100%", maxWidth:"560px", padding:"14px 20px", borderRadius:"30px",
               border:"none", fontSize:"15px", outline:"none" },
  main: { display:"flex", maxWidth:"1200px", margin:"0 auto", padding:"2rem", gap:"1.5rem" },
  sidebar: { width:"180px", flexShrink:0 },
  sideTitle: { fontWeight:"700", marginBottom:"12px", color:"#15803d" },
  catBtn: { padding:"8px 14px", borderRadius:"8px", marginBottom:"6px", cursor:"pointer",
            fontSize:"13px", fontWeight:"600", transition:"all 0.15s" },
  content: { flex:1 },
  topBar: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
  resultCount: { color:"#64748b", fontSize:"13px" },
  viewCartBtn: { background:"#16a34a", color:"#fff", border:"none", padding:"8px 18px",
                 borderRadius:"20px", cursor:"pointer", fontWeight:"700", fontSize:"13px" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" },
  card: { background:"#fff", borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
          overflow:"hidden", transition:"transform 0.15s" },
  imgWrap: { position:"relative" },
  img: { width:"100%", height:"140px", objectFit:"cover" },
  catTag: { position:"absolute", top:"8px", left:"8px", background:"#16a34a", color:"#fff",
            padding:"2px 8px", borderRadius:"10px", fontSize:"10px", fontWeight:"700" },
  cardBody: { padding:"12px" },
  productName: { fontSize:"13px", fontWeight:"700", marginBottom:"4px", color:"#1a1a1a" },
  desc: { fontSize:"11px", color:"#94a3b8", marginBottom:"8px" },
  cardFooter: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" },
  price: { fontSize:"16px", fontWeight:"800", color:"#16a34a" },
  unit: { fontSize:"11px", color:"#94a3b8" },
  stock: { fontSize:"11px", color:"#94a3b8" },
  addBtn: { width:"100%", padding:"8px", color:"#fff", border:"none",
            borderRadius:"8px", cursor:"pointer", fontWeight:"700", fontSize:"13px" },
  qtyRow: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  inCart: { fontSize:"12px", color:"#16a34a", fontWeight:"600" },
  addMoreBtn: { background:"#dcfce7", color:"#16a34a", border:"none", padding:"5px 10px",
                borderRadius:"6px", cursor:"pointer", fontSize:"12px", fontWeight:"600" },
  empty: { textAlign:"center", padding:"3rem", color:"#94a3b8", background:"#fff",
           borderRadius:"12px" }
};