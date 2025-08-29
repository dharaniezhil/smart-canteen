import { useEffect, useState } from "react";
import { fetchMenu, placeOrder, fetchOrders } from "./api";

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); // id -> qty
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchMenu().then(setMenu);
    fetchOrders().then(setOrders);
  }, []);

  const addToCart = (id) => {
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };

  const updateQty = (id, qty) => {
    setCart(c => ({ ...c, [id]: Math.max(0, qty) }));
  };

  const checkout = async () => {
    const items = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id: Number(id), qty }));
    if (items.length === 0) return setMsg("Add something first 🙂");
    const order = await placeOrder(items);
    setMsg(`Order #${order.id} placed! Total ₹${order.total}`);
    setCart({});
    setOrders(await fetchOrders());
  };

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menu.find(m => m.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Smart Canteen</h1>
      <p style={{ color: "#555" }}>Select items and place your order.</p>

      <h2>Menu</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {menu.map(m => (
          <div key={m.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>{m.name}</div>
            <div>₹{m.price}</div>
            <button onClick={() => addToCart(m.id)} style={{ marginTop: 8 }}>
              Add
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 24 }}>Cart</h2>
      {Object.keys(cart).length === 0 && <div>Cart is empty.</div>}
      {Object.entries(cart).map(([id, qty]) => {
        const item = menu.find(m => m.id === Number(id));
        if (!item) return null;
        return (
          <div key={id} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
            <div style={{ width: 180 }}>{item.name}</div>
            <input
              type="number"
              min="0"
              value={qty}
              onChange={e => updateQty(Number(id), Number(e.target.value))}
              style={{ width: 80 }}
            />
            <div>₹{item.price * qty}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 8 }}>Total: <b>₹{total}</b></div>
      <button onClick={checkout} style={{ marginTop: 10 }}>Place Order</button>
      {msg && <div style={{ marginTop: 10, color: "green" }}>{msg}</div>}

      <h2 style={{ marginTop: 24 }}>Orders</h2>
      {orders.map(o => (
        <div key={o.id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <div><b>Order #{o.id}</b> — {o.status}</div>
          <ul style={{ margin: "6px 0" }}>
            {o.items.map((it, idx) => (
              <li key={idx}>{it.name} × {it.qty} = ₹{it.lineTotal}</li>
            ))}
          </ul>
          <div>Total: <b>₹{o.total}</b></div>
        </div>
      ))}
    </div>
  );
}
