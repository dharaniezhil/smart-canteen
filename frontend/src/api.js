const API = process.env.REACT_APP_API || "http://localhost:4000";

export async function fetchMenu() {
  const r = await fetch(`${API}/api/menu`);
  return r.json();
}

export async function placeOrder(items) {
  const r = await fetch(`${API}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  return r.json();
}

export async function fetchOrders() {
  const r = await fetch(`${API}/api/orders`);
  return r.json();
}
