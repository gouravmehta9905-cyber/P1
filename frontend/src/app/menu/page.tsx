'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function MenuPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [tableId, setTableId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let paramTableId: string | null = null;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      paramTableId = params.get('tableId');
    }
    if (paramTableId) {
      setTableId(Number(paramTableId));
    }

    axios.get(`${API_BASE}/api/menu/available`)
      .then(res => setMenu(res.data))
      .catch(() => {
        setMenu([
          { id: 1, name: 'Coca Cola', price: 203.59, category: 'Beverages' },
          { id: 2, name: 'Fanta', price: 203.59, category: 'Beverages' },
          { id: 3, name: 'Cola', price: 203.59, category: 'Beverages' },
          { id: 4, name: 'Lemon Soda', price: 204.20, category: 'Beverages' },
          { id: 5, name: 'Ice Coffee', price: 208.39, category: 'Beverages' },
          { id: 6, name: 'Cold Tea', price: 203.59, category: 'Beverages' },
          { id: 7, name: 'Oreo Shake', price: 210.79, category: 'Beverages' },
          { id: 8, name: 'Fried Rice', price: 223.99, category: 'Main Course' },
          { id: 9, name: 'Jeera Rice', price: 220.39, category: 'Main Course' },
          { id: 10, name: 'Veg Rice', price: 219.19, category: 'Main Course' },
          { id: 11, name: 'Butter Roti', price: 205.99, category: 'Main Course' },
          { id: 12, name: 'Naan', price: 207.19, category: 'Main Course' },
          { id: 13, name: 'Garlic Naan', price: 209.59, category: 'Main Course' },
          { id: 14, name: 'Paneer Butter Masala', price: 226.39, category: 'Main Course' },
          { id: 15, name: 'Chicken Curry', price: 227.59, category: 'Main Course' },
          { id: 16, name: 'Dal Fry', price: 220.39, category: 'Main Course' },
          { id: 17, name: 'French Fries', price: 205.99, category: 'Snacks' },
          { id: 18, name: 'Burger', price: 217.99, category: 'Snacks' },
          { id: 19, name: 'Sandwich', price: 216.79, category: 'Snacks' },
          { id: 20, name: 'Ice Cream', price: 208.39, category: 'Desserts' },
          { id: 21, name: 'Brownie', price: 211.99, category: 'Desserts' },
          { id: 22, name: 'Gulab Jamun', price: 210.79, category: 'Desserts' },
        ]);
      });

    axios.get(`${API_BASE}/api/tables`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setTables(res.data);
          if (paramTableId) {
            setTableId(Number(paramTableId));
          } else {
            setTableId(res.data[0].id);
          }
        }
      })
      .catch(() => {
        const fallbackTables = Array.from({ length: 12 }, (_, idx) => ({
          id: idx + 1,
          name: `Table ${idx + 1}`,
          status: 'available',
        }));
          setTables(fallbackTables);
        if (paramTableId) {
          setTableId(Number(paramTableId));
        } else {
          setTableId(1);
        }
      });
  }, []);

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1, specialInstructions: '', priceAtOrderTime: item.price }];
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const payload = {
      table: { id: tableId },
      items: cart
    };

    try {
      await axios.post(`${API_BASE}/api/orders`, payload);
      setCart([]);
      alert('Order sent to kitchen!');
    } catch (err) {
      alert('Failed to connect to backend. Ensure Spring Boot is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.priceAtOrderTime * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background p-8 flex gap-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-white mb-8">Digital Menu</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menu.map(item => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-gray-400">{item.category}</p>
                <h2 className="text-xl font-semibold text-white">{item.name}</h2>
                <p className="text-white/70">₹{item.price}</p>
              </div>
              <button
                onClick={() => addToCart(item)}
                className="rounded-xl bg-primary px-4 py-2 text-white"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="w-96 glass-card p-6 flex flex-col h-[90vh] sticky top-8">
        <h2 className="text-2xl font-bold text-white mb-6">Current Order</h2>

        <div className="mb-6">
          <label className="text-sm text-gray-400">Select Table</label>
          <select
            className="w-full mt-1 bg-background border border-white/10 rounded-lg p-3 text-white"
            value={tableId}
            onChange={(e) => setTableId(Number(e.target.value))}
          >
            {tables.map(table => (
              <option key={table.id} value={table.id}>
                {table.name} - {table.status}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between text-white border-b border-white/5 pb-2">
              <div>
                <p className="font-semibold">{item.quantity}x {item.menuItem.name}</p>
              </div>
              <p>₹{(item.priceAtOrderTime * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {cart.length === 0 && <p className="text-gray-500 text-center mt-10">Cart is empty</p>}
        </div>

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between text-xl font-bold text-white mb-6">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send to Kitchen'}
          </button>
        </div>
      </div>
    </div>
  );
}
