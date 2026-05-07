'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.trim().toLowerCase() === 'gourav') {
      router.push('/dashboard');
      return;
    }

    setError('Invalid access code. Use the demo code shown below.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.18),transparent_28%)]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-2xl backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
          <section className="flex min-h-[520px] flex-col justify-between border-b border-white/10 p-8 md:border-b-0 md:border-r md:p-10">
            <div>
              <div className="mb-8 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                Restaurant Operations Console
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                Restaurant Order and Billing Management System
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-gray-300">
                Manage floor status, live orders, kitchen preparation, and checkout from one focused workspace.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {['Floor Map', 'Kitchen Queue', 'Billing Desk'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center p-8 md:p-10">
            <div className="w-full">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Secure Access</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-muted-foreground">Enter your staff access code to continue.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Staff Access Code</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setError('');
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-4 text-lg text-white outline-none transition placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="Enter access code"
                    autoComplete="current-password"
                  />
                  {error && (
                    <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-4 font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] transition hover:bg-primary/90 active:scale-[0.99]"
                >
                  Access Dashboard
                </button>
              </form>

              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                Demo access code: <span className="font-semibold text-white">gourav</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
