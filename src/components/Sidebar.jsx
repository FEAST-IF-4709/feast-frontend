import React from 'react';
import { LayoutGrid, UtensilsCrossed, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-cardBg border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary tracking-wider">FEAST</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <a href="#" className="flex items-center gap-3 bg-gray-800/50 text-white px-4 py-3 rounded-lg border-l-4 border-primary">
          <LayoutGrid size={20} className="text-primary"/>
          <span className="font-medium">Dashboard</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg transition">
          <UtensilsCrossed size={20} />
          <span className="font-medium">Order</span>
        </a>
        <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg transition">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;