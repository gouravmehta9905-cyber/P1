'use client';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Armchair, RefreshCw, Users, Utensils, WalletCards } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const MOCK_TABLES = [
  { id: 1, name: 'Table 1', status: 'occupied', capacity: 4, amount: 'Rs 124.50' },
  { id: 2, name: 'Table 2', status: 'available', capacity: 2, amount: 'Rs 0.00' },
  { id: 3, name: 'Table 3', status: 'billed', capacity: 6, amount: 'Rs 342.00' },
  { id: 4, name: 'Table 4', status: 'reserved', capacity: 4, amount: 'Rs 0.00' },
  { id: 5, name: 'Table 5', status: 'available', capacity: 2, amount: 'Rs 0.00' },
  { id: 6, name: 'Table 6', status: 'occupied', capacity: 8, amount: 'Rs 89.20' },
];

export default function DashboardPage() {
  const router = useRouter();
  const clientRef = useRef<Client | null>(null);
  const [tables, setTables] = useState<any[]>(MOCK_TABLES);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAvailableTables, setShowAvailableTables] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBilledTable, setSelectedBilledTable] = useState<any>(null);
  const [billedOrder, setBilledOrder] = useState<any>(null);
  const [isSettlingBill, setIsSettlingBill] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/tables`);
      if (response.data && response.data.length > 0) {
        setTables(response.data);
        setIsLive(true);
      } else {
        setTables(MOCK_TABLES);
        setIsLive(false);
      }
    } catch (error) {
      console.warn('Backend is not running. Falling back to mock data.');
      setIsLive(false);
      setTables(MOCK_TABLES);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/orders/active`);
      setOrders(response.data || []);
    } catch (error) {
      console.warn('Failed to fetch orders');
    }
  };

  const getOrderForTable = (tableId: number) => {
    return orders.find(o => o.table?.id === tableId && !['billed', 'cancelled'].includes(o.status));
  };

  const handleTableClick = (tableId: number, tableName: string) => {
    if (tables.find(t => t.id === tableId)?.status?.toLowerCase() === 'available') {
      router.push(`/menu?tableId=${tableId}&tableName=${encodeURIComponent(tableName)}`);
    }
  };

  const handleBilledTableClick = async (table: any) => {
    setSelectedBilledTable(table);
    try {
      const response = await axios.get(`${API_BASE}/api/orders/table/${table.id}/ready`);
      setBilledOrder(response.data);
      setShowBillingModal(true);
    } catch (error) {
      console.error('Failed to fetch billing order', error);
    }
  };

  const settleBill = async () => {
    if (!billedOrder) return;
    setIsSettlingBill(true);
    try {
      await axios.put(`${API_BASE}/api/orders/${billedOrder.id}/status?status=billed`);
      setShowBillingModal(false);
      setSelectedBilledTable(null);
      setBilledOrder(null);
      fetchTables();
    } catch (error) {
      console.error('Failed to settle bill', error);
    } finally {
      setIsSettlingBill(false);
    }
  };

  useEffect(() => {
    fetchTables();
    fetchOrders();

    // WebSocket for real-time order updates
    const socket = new SockJS(`${API_BASE}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
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
      onStompError: () => {
        console.warn('WebSocket connection failed');
      }
    });
    client.activate();
    clientRef.current = client;

    const interval = setInterval(fetchTables, 10000);
    return () => {
      clearInterval(interval);
      client.deactivate();
    };
  }, []);

  const availableTables = tables.filter((table) => table.status?.toLowerCase() === 'available');

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'occupied':
        return 'border-red-400/50 bg-red-500/10 text-red-200 shadow-[0_0_28px_rgba(239,68,68,0.14)]';
      case 'available':
        return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.14)]';
      case 'billed':
        return 'border-blue-400/50 bg-blue-500/10 text-blue-200 shadow-[0_0_28px_rgba(59,130,246,0.14)]';
      case 'reserved':
        return 'border-amber-400/50 bg-amber-500/10 text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.14)]';
      default:
        return 'border-gray-500/40 bg-gray-500/10 text-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'occupied':
        return 'bg-red-400';
      case 'available':
        return 'bg-emerald-400';
      case 'billed':
        return 'bg-blue-400';
      case 'reserved':
        return 'bg-amber-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getTableSizeClass = (capacity: number) => {
    if (capacity >= 8) return 'lg:col-span-2 xl:col-span-2 min-h-[260px]';
    if (capacity >= 6) return 'md:col-span-2 xl:col-span-2 min-h-[235px]';
    if (capacity <= 2) return 'min-h-[190px]';
    return 'min-h-[215px]';
  };

  const getTableShapeClass = (capacity: number) => {
    if (capacity >= 8) return 'h-24 w-44 rounded-[28px]';
    if (capacity >= 6) return 'h-22 w-36 rounded-[26px]';
    if (capacity <= 2) return 'h-24 w-24 rounded-full';
    return 'h-28 w-28 rounded-3xl';
  };

  const getBillText = (table: any) => {
    if (table.currentBillAmount) {
      return `Rs ${Number(table.currentBillAmount).toFixed(2)}`;
    }

    return table.amount || 'Rs 0.00';
  };

  const statusCounts = tables.reduce((acc: Record<string, number>, table) => {
    const status = table.status?.toLowerCase() || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
            Dining Room Control
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">Floor Map</h1>
          <p className="mt-2 text-muted-foreground">
            Track table size, status, seating capacity, and active bills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold ${isLive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-amber-500/20 text-amber-300 border-amber-500/50'}`}>
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            {isLive ? 'Live DB Connected' : 'Mock Data Mode'}
          </div>
          <button
            onClick={fetchTables}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-white transition hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync Status'}
          </button>
          <button
            onClick={() => setShowAvailableTables(true)}
            className="rounded-lg bg-primary px-5 py-2 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] transition hover:bg-primary/90"
          >
            New Walk-in
          </button>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Available', value: statusCounts.available || 0, color: 'text-emerald-300', icon: Users },
          { label: 'Occupied', value: statusCounts.occupied || 0, color: 'text-red-300', icon: Utensils },
          { label: 'Billed', value: statusCounts.billed || 0, color: 'text-blue-300', icon: WalletCards },
          { label: 'Reserved', value: statusCounts.reserved || 0, color: 'text-amber-300', icon: Armchair },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className={`mt-3 text-3xl font-bold ${item.color}`}>{item.value}</div>
            </div>
          );
        })}
      </section>

      {showAvailableTables && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-6">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Available Tables</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {availableTables.length} tables ready for walk-ins
                </p>
              </div>
              <button
                onClick={() => setShowAvailableTables(false)}
                className="rounded-lg bg-white/10 px-4 py-2 text-white transition hover:bg-white/15"
              >
                Close
              </button>
            </div>

            {availableTables.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No tables are currently available.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availableTables.map((table) => (
                  <div key={table.id} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-white">{table.name}</h3>
                      <span className="text-xs uppercase tracking-wider text-emerald-300">Available</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-300">
                      Capacity: {table.capacity} Pax
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] p-4 shadow-2xl md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Main Dining Area</h2>
            <p className="text-sm text-muted-foreground">Small tables stay compact. Large tables span wider floor space.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {['available', 'occupied', 'billed', 'reserved'].map((status) => (
              <span key={status} className="inline-flex items-center gap-2 capitalize">
                <span className={`h-2.5 w-2.5 rounded-full ${getStatusDot(status)}`} />
                {status}
              </span>
            ))}
          </div>
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tables.map((table) => {
            const displayedSeats = Math.min(table.capacity || 0, 10);
            const currentOrder = getOrderForTable(table.id);
            const isAvailable = table.status?.toLowerCase() === 'available';
            
            return (
              <div
                key={table.id}
                onClick={() => {
                  if (isAvailable) handleTableClick(table.id, table.name);
                  if (table.status?.toLowerCase() === 'billed') handleBilledTableClick(table);
                }}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:bg-white/[0.08] ${getStatusStyle(table.status)} ${getTableSizeClass(table.capacity)} ${(isAvailable || table.status?.toLowerCase() === 'billed') ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="absolute right-4 top-4 flex flex-col gap-2 items-end">
                  <span className="inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    <span className={`h-2 w-2 rounded-full ${getStatusDot(table.status)}`} />
                    {table.status}
                  </span>
                  {currentOrder && (
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${
                      currentOrder.status === 'pending' ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50' :
                      currentOrder.status === 'preparing' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/50' :
                      'bg-emerald-500/30 text-emerald-200 border border-emerald-400/50'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${
                        currentOrder.status === 'pending' ? 'bg-amber-400 animate-pulse' :
                        currentOrder.status === 'preparing' ? 'bg-blue-400 animate-pulse' :
                        'bg-emerald-400'
                      }`} />
                      {currentOrder.status}
                    </span>
                  )}
                </div>

                <div className="flex h-full flex-col justify-between gap-5 pt-7">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{table.name}</h3>
                    <p className="mt-1 text-sm opacity-80">
                      {table.capacity <= 2 ? 'Compact seating' : table.capacity >= 8 ? 'Large party table' : 'Dining table'}
                    </p>
                  </div>

                  <div className="flex flex-1 items-center justify-center py-3">
                    <div className="relative flex items-center justify-center">
                      <div className={`${getTableShapeClass(table.capacity)} border border-white/20 bg-black/30 shadow-inner transition group-hover:bg-black/20`} />
                      <div className="absolute text-center">
                        <div className="text-3xl font-black text-white">{table.capacity}</div>
                        <div className="text-xs uppercase tracking-wider opacity-70">Pax</div>
                      </div>
                      {Array.from({ length: displayedSeats }).map((_, index) => {
                        const angle = (index / displayedSeats) * Math.PI * 2;
                        const radiusX = table.capacity >= 6 ? 112 : 80;
                        const radiusY = table.capacity >= 6 ? 68 : 78;
                        return (
                          <span
                            key={index}
                            className="absolute h-3 w-3 rounded-full bg-white/35"
                            style={{
                              transform: `translate(${Math.cos(angle) * radiusX}px, ${Math.sin(angle) * radiusY}px)`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider opacity-60">Capacity</p>
                      <p className="mt-1 font-bold text-white">{table.capacity} Pax</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider opacity-60">Current Bill</p>
                      <p className="mt-1 font-bold text-white">{getBillText(table)}</p>
                    </div>
                  </div>

                  {isAvailable && (
                    <button
                      onClick={() => handleTableClick(table.id, table.name)}
                      className="mt-3 w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-semibold rounded-lg transition text-sm"
                    >
                      Take Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {showBillingModal && selectedBilledTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-8">
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Billing</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selectedBilledTable.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowBillingModal(false);
                  setSelectedBilledTable(null);
                  setBilledOrder(null);
                }}
                className="rounded-lg bg-white/10 px-4 py-2 text-white transition hover:bg-white/15"
              >
                Close
              </button>
            </div>

            {billedOrder ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {billedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-white pb-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="font-semibold">{item.quantity}x {item.menuItem?.name || 'Item'}</p>
                          {item.specialInstructions && (
                            <p className="text-xs text-amber-300 mt-1">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <p className="font-bold text-primary">₹{(item.priceAtOrderTime * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="text-white">₹{(billedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-emerald-500/20 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">Total Amount:</span>
                      <span className="text-2xl font-bold text-emerald-300">₹{(billedOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowBillingModal(false);
                      setSelectedBilledTable(null);
                      setBilledOrder(null);
                    }}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={settleBill}
                    disabled={isSettlingBill}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {isSettlingBill ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No ready order found for this table.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
