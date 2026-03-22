from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import sqlite3
import bcrypt
import os

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "grocery_secret_2024")
jwt = JWTManager(app)
CORS(app)

# ─────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────
def get_db():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "grocery.db")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT DEFAULT 'General',
            price REAL NOT NULL,
            quantity INTEGER DEFAULT 0,
            unit TEXT DEFAULT 'piece',
            image_url TEXT DEFAULT '',
            description TEXT DEFAULT ''
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount REAL,
            slot TEXT,
            status TEXT DEFAULT 'confirmed',
            payment_method TEXT DEFAULT 'UPI',
            address TEXT DEFAULT '',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER,
            price REAL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        );
    """)

    # Seed sample products if empty
    existing = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if existing == 0:
        products = [
            ("Amul Milk 1L", "Dairy", 62.0, 50, "packet", "https://picsum.photos/seed/milk/200/200", "Fresh pasteurized milk"),
            ("Britannia Bread", "Bakery", 40.0, 30, "pack", "https://picsum.photos/seed/bread/200/200", "Soft sandwich bread"),
            ("Basmati Rice 5kg", "Grains", 350.0, 20, "bag", "https://picsum.photos/seed/rice/200/200", "Premium aged basmati"),
            ("Toor Dal 1kg", "Pulses", 140.0, 25, "packet", "https://picsum.photos/seed/dal/200/200", "Fresh toor dal"),
            ("Tomatoes 1kg", "Vegetables", 35.0, 40, "kg", "https://picsum.photos/seed/tomato/200/200", "Fresh red tomatoes"),
            ("Onions 1kg", "Vegetables", 30.0, 60, "kg", "https://picsum.photos/seed/onion/200/200", "Fresh onions"),
            ("Potatoes 1kg", "Vegetables", 28.0, 55, "kg", "https://picsum.photos/seed/potato/200/200", "Farm fresh potatoes"),
            ("Bananas 1 dozen", "Fruits", 45.0, 30, "dozen", "https://picsum.photos/seed/banana/200/200", "Ripe yellow bananas"),
            ("Apples 1kg", "Fruits", 120.0, 20, "kg", "https://picsum.photos/seed/apple/200/200", "Shimla apples"),
            ("Aashirvaad Atta 5kg", "Grains", 265.0, 15, "bag", "https://picsum.photos/seed/atta/200/200", "Whole wheat flour"),
            ("Sunflower Oil 1L", "Oil & Ghee", 145.0, 25, "bottle", "https://picsum.photos/seed/oil/200/200", "Refined sunflower oil"),
            ("Amul Butter 500g", "Dairy", 245.0, 20, "pack", "https://picsum.photos/seed/butter/200/200", "Salted butter"),
            ("Maggi Noodles 12pk", "Snacks", 132.0, 35, "pack", "https://picsum.photos/seed/maggi/200/200", "Masala noodles"),
            ("Parle-G Biscuits", "Snacks", 30.0, 50, "pack", "https://picsum.photos/seed/biscuit/200/200", "Classic glucose biscuits"),
            ("Coca-Cola 2L", "Beverages", 95.0, 30, "bottle", "https://picsum.photos/seed/cola/200/200", "Chilled cola drink"),
            ("Green Tea 25 bags", "Beverages", 99.0, 20, "box", "https://picsum.photos/seed/tea/200/200", "Organic green tea"),
        ]
        conn.executemany(
            "INSERT INTO products (name, category, price, quantity, unit, image_url, description) VALUES (?,?,?,?,?,?,?)",
            products
        )

    conn.commit()
    conn.close()

# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    role = data.get("role", "customer")
    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    try:
        conn = get_db()
        conn.execute("INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)",
                     (name, email, hashed, role))
        conn.commit()
        conn.close()
        return jsonify({"message": "Registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (data.get("email"),)).fetchone()
    conn.close()
    if not user or not bcrypt.checkpw(data.get("password", "").encode(), user["password"].encode()):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_access_token(identity=str(user["id"]))
    return jsonify({
        "access_token": token,
        "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}
    })

@app.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    conn = get_db()
    user = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return jsonify(dict(user))

# ─────────────────────────────────────────
# PRODUCTS
# ─────────────────────────────────────────
@app.route("/products", methods=["GET"])
def get_products():
    conn = get_db()
    category = request.args.get("category")
    search = request.args.get("search")
    query = "SELECT * FROM products WHERE quantity > 0"
    params = []
    if category:
        query += " AND category=?"
        params.append(category)
    if search:
        query += " AND name LIKE ?"
        params.append(f"%{search}%")
    items = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(i) for i in items])

@app.route("/products/categories", methods=["GET"])
def get_categories():
    conn = get_db()
    cats = conn.execute("SELECT DISTINCT category FROM products").fetchall()
    conn.close()
    return jsonify([c["category"] for c in cats])

@app.route("/products", methods=["POST"])
@jwt_required()
def add_product():
    data = request.json
    conn = get_db()
    conn.execute(
        "INSERT INTO products (name, category, price, quantity, unit, image_url, description) VALUES (?,?,?,?,?,?,?)",
        (data["name"], data.get("category","General"), data["price"],
         data["quantity"], data.get("unit","piece"), data.get("image_url",""), data.get("description",""))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product added"}), 201

@app.route("/products/<int:pid>", methods=["PUT"])
@jwt_required()
def update_product(pid):
    data = request.json
    conn = get_db()
    conn.execute(
        "UPDATE products SET name=?, price=?, quantity=?, category=?, unit=? WHERE id=?",
        (data["name"], data["price"], data["quantity"], data.get("category","General"), data.get("unit","piece"), pid)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Product updated"})

@app.route("/products/<int:pid>", methods=["DELETE"])
@jwt_required()
def delete_product(pid):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id=?", (pid,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Product deleted"})

# ─────────────────────────────────────────
# ORDERS
# ─────────────────────────────────────────
@app.route("/orders", methods=["POST"])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    data = request.json
    conn = get_db()
    cur = conn.execute(
        "INSERT INTO orders (user_id, total_amount, slot, payment_method, address) VALUES (?,?,?,?,?)",
        (user_id, data["total"], data["slot"], data.get("payment_method","UPI"), data.get("address",""))
    )
    order_id = cur.lastrowid
    for item in data.get("items", []):
        conn.execute(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)",
            (order_id, item["id"], item["quantity"], item["price"])
        )
        # Reduce inventory
        conn.execute("UPDATE products SET quantity = quantity - ? WHERE id=?", (item["quantity"], item["id"]))
    conn.commit()
    conn.close()
    return jsonify({"message": "Order placed successfully", "order_id": order_id}), 201

@app.route("/orders/my", methods=["GET"])
@jwt_required()
def my_orders():
    user_id = get_jwt_identity()
    conn = get_db()
    orders = conn.execute(
        "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC", (user_id,)
    ).fetchall()
    result = []
    for o in orders:
        order = dict(o)
        items = conn.execute("""
            SELECT oi.*, p.name as product_name
            FROM order_items oi JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id=?
        """, (o["id"],)).fetchall()
        order["items"] = [dict(i) for i in items]
        result.append(order)
    conn.close()
    return jsonify(result)

@app.route("/orders/all", methods=["GET"])
@jwt_required()
def all_orders():
    conn = get_db()
    orders = conn.execute("""
        SELECT o.*, u.name as customer_name, u.email
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    """).fetchall()
    conn.close()
    return jsonify([dict(o) for o in orders])

# ─────────────────────────────────────────
# DELIVERY SLOTS
# ─────────────────────────────────────────
@app.route("/slots", methods=["GET"])
def get_slots():
    slots = [
        {"id": 1, "time": "9:00 AM - 12:00 PM", "label": "Morning"},
        {"id": 2, "time": "12:00 PM - 3:00 PM", "label": "Afternoon"},
        {"id": 3, "time": "3:00 PM - 6:00 PM", "label": "Evening"},
        {"id": 4, "time": "6:00 PM - 9:00 PM", "label": "Night"},
    ]
    return jsonify(slots)

# ─────────────────────────────────────────
# ADMIN STATS
# ─────────────────────────────────────────
@app.route("/admin/stats", methods=["GET"])
@jwt_required()
def admin_stats():
    conn = get_db()
    total_orders = conn.execute("SELECT COUNT(*) FROM orders").fetchone()[0]
    total_revenue = conn.execute("SELECT COALESCE(SUM(total_amount),0) FROM orders").fetchone()[0]
    total_products = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    total_users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    low_stock = conn.execute("SELECT * FROM products WHERE quantity < 10").fetchall()
    conn.close()
    return jsonify({
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "total_products": total_products,
        "total_users": total_users,
        "low_stock": [dict(p) for p in low_stock]
    })

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)