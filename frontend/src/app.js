import { useEffect, useState } from "react";
import { fetchMenu, placeOrder, fetchOrders } from "./api";

export default function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchMenu().then(setMenu).catch(()=>setMenu([]));
    fetchOrders().then(setOrders).catch(()=>setOrders([]));
  }, []);

  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));

  const checkout = async () => {
    const items = Object.entries(cart).filter(([,q]) => q>0).map(([id,q]) => ({ id: Number(id), qty: q }));
    if (items.length === 0) { setMsg("Add items first"); return; }
    const order = await placeOrder(items);
    setMsg(`Order #${order.id} placed (₹${order.total})`);
    setCart({});
    setOrders(await fetchOrders());
  };

  const total = Object.entries(cart).reduce((s,[id,q]) => {
    const it = menu.find(m => m.id === Number(id));
    return s + (it ? it.price * q : 0);
  },0);

  return (
    <div style={{maxWidth:900, margin:"2rem auto", fontFamily:"system-ui"}}>
      <h1>Smart Canteen</h1>

      <h2>Menu</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
        {menu.map(m => (
          <div key={m.id} style={{border:"1px solid #ddd", padding:12, borderRadius:8}}>
            <div style={{fontWeight:600}}>{m.name}</div>
            <div>₹{m.price}</div>
            <button onClick={() => addToCart(m.id)} style={{marginTop:8}}>Add</button>
          </div>
        ))}
      </div>

      <h2 style={{marginTop:24}}>Cart</h2>
      {Object.keys(cart).length===0 && <div>Cart is empty</div>}
      {Object.entries(cart).map(([id,qty]) => {
        const it = menu.find(m => m.id === Number(id));
        if (!it) return null;
        return <div key={id} style={{display:"flex", gap:12, alignItems:"center"}}>{it.name} × {qty} = ₹{it.price*qty}</div>;
      })}
      <div style={{marginTop:8}}>Total: <b>₹{total}</b></div>
      <button onClick={checkout} style={{marginTop:10}}>Place Order</button>
      {msg && <div style={{marginTop:10,color:"green"}}>{msg}</div>}

      <h2 style={{marginTop:24}}>Orders</h2>
      {orders.map(o => (
        <div key={o.id} style={{border:"1px solid #eee", padding:10, borderRadius:6, marginBottom:8}}>
          <div><b>Order #{o.id}</b> — {o.status}</div>
          <ul>
            {o.items.map((it,idx) => <li key={idx}>{it.name} × {it.qty} = ₹{it.lineTotal}</li>)}
          </ul>
          <div>Total: ₹{o.total}</div>
        </div>
      ))}
    </div>
  );
}
