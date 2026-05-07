'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function BillingPage() {
  const [tableId, setTableId] = useState<number>(1);
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/billing/table/${tableId}`);
      setBill(res.data);
    } catch (err) {
      alert("No active unbilled orders found for this table, or backend is offline.");
      setBill(null);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    try {
      await axios.post(`http://localhost:8080/api/billing/checkout/${tableId}`);
      alert("Payment processed! Table cleared.");
      setBill(null);
    } catch (err) {
      alert("Checkout failed.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-10 text-gradient">Billing & Checkout</h1>

      <div className="glass-card p-8 w-full max-w-2xl">
        <div className="flex gap-4 mb-8">
          <select 
            className="flex-1 bg-background border border-white/10 rounded-lg p-4 text-white text-lg"
            value={tableId}
            onChange={(e) => setTableId(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map(num => (
              <option key={num} value={num}>Table {num}</option>
            ))}
          </select>
          <button 
            onClick={fetchBill}
            className="px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
          >
            {loading ? 'Fetching...' : 'Fetch Bill'}
          </button>
        </div>

        {bill && (
          <div className="border border-white/10 rounded-xl p-6 bg-black/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center border-b border-white/10 pb-4">Invoice</h2>
            
            <div className="space-y-4 mb-8">
              {bill.orders.map((order: any, idx: number) => (
                <div key={idx}>
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-gray-300">
                      <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                      <span>₹{(item.priceAtOrderTime * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>₹{bill.sub.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tax (5%)</span>
                <span>₹{bill.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-emerald-400 mt-4 pt-4 border-t border-white/10">
                <span>Total Due</span>
                <span>₹{bill.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={processPayment}
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
            >
              Process Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
