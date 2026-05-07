import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ROBMS - Restaurant Management',
  description: 'Real-time Restaurant Order & Billing Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-screen bg-background text-foreground`}>
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-black/20 p-6 flex flex-col gap-4 hidden md:flex">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gradient tracking-tight">ROBMS</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Management System</p>
          </div>
          
          <a href="/dashboard" className="px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-300 hover:text-white font-medium border border-transparent hover:border-white/10">Floor Map</a>
          <a href="/menu" className="px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-300 hover:text-white font-medium border border-transparent hover:border-white/10">Take Order</a>
          <a href="/kds" className="px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-300 hover:text-white font-medium border border-transparent hover:border-white/10">Kitchen (KDS)</a>
          <a href="/billing" className="px-4 py-3 rounded-xl hover:bg-white/5 transition text-gray-300 hover:text-white font-medium border border-transparent hover:border-white/10">Billing</a>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
