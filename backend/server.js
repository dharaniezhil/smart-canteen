import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const menu = [
  { id: 1, name: "Idli", price: 30 },
  { id: 2, name: "Dosa", price: 50 },
  { id: 3, name: "Veg Sandwich", price: 60 },
  { id: 4, name: "Tea", price: 12 }
];
let orders = [];

app.get("/api/menu", (req,res) => res.json(menu));
app.post("/api/order", (req,res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length===0) return res.status(400).json({message:"Items required"});
  let total = 0;
  const detailed = items.map(it => {
    const m = menu.find(x => x.id === it.id);
    if (!m) return null;
    const qty = it.qty || 1;
    total += m.price * qty;
    return { ...m, qty, lineTotal: m.price * qty };
  }).filter(Boolean);
  const order = { id: orders.length+1, items: detailed, total, status: "PLACED" };
  orders.push(order);
  res.status(201).json(order);
});
app.get("/api/orders", (req,res) => res.json(orders));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
