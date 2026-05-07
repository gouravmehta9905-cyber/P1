'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  const fetchActiveOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/orders/active`);
      setOrders(res.data);
    } catch (err) {
      console.warn("Backend offline, using empty state");
    }
  };

  useEffect(() => {
    fetchActiveOrders();

    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        client.subscribe('/topic/orders', (message) => {
          const updatedOrder = JSON.parse(message.body);
          setOrders(prev => {
            const exists = prev.find(o => o.id === updatedOrder.id);
            if (exists) {
              if (updatedOrder.status === 'billed' || updatedOrder.status === 'cancelled') {
                return prev.filter(o => o.id !== updatedOrder.id);
              }
              return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            }
            if (updatedOrder.status !== 'billed' && updatedOrder.status !== 'cancelled') {
               return [...prev, updatedOrder];
            }
            return prev;
          });
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        setIsConnected(false);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      await axios.put(`${API_BASE}/api/orders/${id}/status?status=${newStatus}`);
    } catch (err) {
      console.error("Failed to update status", err);
      // Optimistic update if backend is off
      setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight text-gradient">Kitchen Display System</h1>
          <p className="text-muted-foreground">Live Order Queue (Auto-syncs via WebSockets)</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${isConnected ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? 'WebSocket Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-[50vh] text-muted-foreground text-xl">
          No active orders in the queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="glass-card p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Order #{order.id}</h3>
                  <p className="text-primary font-medium">{order.table?.name || 'Table X'} • {order.status}</p>
                </div>
              </div>
              
              <div className="flex-grow space-y-4 mb-8">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-lg text-white">{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                    </div>
                    {item.specialInstructions && (
                      <p className="text-sm text-red-400 bg-red-400/10 px-3 py-1 rounded-md inline-block">
                        ⚠️ Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
                {order.status === 'pending' ? (
                  <button 
                    onClick={() => updateStatus(order.id, 'preparing')}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                    Start Preparing
                  </button>
                ) : order.status === 'preparing' ? (
                  <button 
                    onClick={() => updateStatus(order.id, 'ready')}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  >
                    Mark as Ready
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-white/10 text-white/70 font-bold rounded-xl cursor-default"
                  >
                    Waiting for Billing
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
