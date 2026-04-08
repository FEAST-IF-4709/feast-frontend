import React from 'react';
import Sidebar from './components/Sidebar';
import { 
  Search, Bell, Grip, Banknote, ClipboardList, 
  Users, Filter, MoreHorizontal, Plus 
} from 'lucide-react';

import spicyNoodlesImg from './assets/Spicy Seafood Noodles.jpg';
import grilledChickenImg from './assets/Grilled Chicken.jpg';
import saltedPastaImg from './assets/Salted Pasta.jpg';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-darkBg text-white font-sans overflow-hidden">
      
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        
        <header className="flex justify-between items-center p-6 bg-darkBg sticky top-0 z-10 border-b border-gray-800/50">
          <h2 className="text-2xl font-semibold text-white">FEAST Dashboard</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative bg-cardBg rounded-lg flex items-center px-4 py-2 border border-gray-800">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search data..." 
                className="bg-transparent border-none outline-none text-sm text-white ml-2 placeholder-gray-500"
              />
            </div>
            
            <Bell size={20} className="text-gray-400 hover:text-white cursor-pointer" />
            <Grip size={20} className="text-gray-400 hover:text-white cursor-pointer" />
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" 
              alt="Profile" 
              className="w-9 h-9 bg-gray-700 rounded-full cursor-pointer"
            />
          </div>
        </header>

        <div className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<Banknote />} title="TOTAL REVENUE" value="$128,430.00" percent="+12.5%" isUp={true} />
            <StatCard icon={<ClipboardList />} title="TOTAL ORDERS" value="1,240" percent="+8.2%" isUp={true} />
            <StatCard icon={<Users />} title="TOTAL CUSTOMERS" value="3,842" percent="-2.4%" isUp={false} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-2 bg-cardBg rounded-xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Order Report</h3>
                <button className="flex items-center gap-2 bg-darkBg border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white">
                  <Filter size={16} /> Filter Order
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-gray-400 border-b border-gray-800 pb-2">
                    <tr>
                      <th className="pb-4 font-medium">CUSTOMER</th>
                      <th className="pb-4 font-medium">MENU</th>
                      <th className="pb-4 font-medium">TOTAL PAYMENT</th>
                      <th className="pb-4 font-medium">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <TableRow name="Marco Veratti" menu="Spicy Seasoned Seafood Pasta" price="$125.00" status="COMPLETED" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco" />
                    <TableRow name="Elena Rodriguez" menu="Salted Pasta with Mushroom Sauce" price="$145.00" status="PREPARING" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" />
                    <TableRow name="Kenji Takahashi" menu="Beef Dumplings in Hot Soup" price="$105.00" status="PENDING" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji" />
                    <TableRow name="Sophie Martin" menu="Hot Spicy Beef Ramen" price="$112.50" status="COMPLETED" avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie" />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              
              <div className="bg-cardBg rounded-xl p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Most Ordered</h3>
                  <a href="#" className="text-primary text-sm hover:underline">View all</a>
                </div>
                <div className="space-y-4">

                  <MostOrderedItem name="Spicy Seafood Noodles" qty="200 dishes ordered" img={spicyNoodlesImg} />
                  <MostOrderedItem name="Grilled Herb Chicken" qty="150 dishes ordered" img={grilledChickenImg} />
                  <MostOrderedItem name="Salted Pasta" qty="120 dishes ordered" img={saltedPastaImg} />
                </div>
              </div>

              <div className="bg-cardBg rounded-xl p-6 border border-gray-800 relative">
                 <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Type of Order</h3>
                  <MoreHorizontal size={20} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-full border-[12px] border-gray-700 flex items-center justify-center relative border-t-primary border-r-primary border-b-[#ea7c69]">
                    <div className="text-center">
                      <p className="text-xl font-bold">1.2k</p>
                      <p className="text-xs text-gray-400">TOTAL</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <LegendItem color="bg-primary" title="Dine In" sub="540 orders" />
                    <LegendItem color="bg-[#ea7c69]" title="To Go" sub="420 orders" />
                    <LegendItem color="bg-gray-500" title="Delivery" sub="280 orders" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-purple-600 transition-colors z-50">
          <Plus size={28} />
        </button>

      </main>
    </div>
  );
};


const StatCard = ({ icon, title, value, percent, isUp }) => (
  <div className="bg-cardBg p-6 rounded-xl border border-gray-800 relative">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-800/50 rounded-lg text-primary">
        {icon}
      </div>
      <span className={`text-sm flex items-center gap-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
        {percent} {isUp ? '↗' : '↘'}
      </span>
    </div>
    <h4 className="text-gray-400 text-sm mb-1">{title}</h4>
    <h2 className="text-3xl font-bold text-white">{value}</h2>
  </div>
);

const TableRow = ({ name, menu, price, status, avatar }) => {
  const statusStyles = {
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    PREPARING: 'bg-primary/10 text-primary border-primary/20',
    PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  return (
    <tr className="border-b border-gray-800/50 last:border-0 hover:bg-white/5 transition-colors">
      <td className="py-4 flex items-center gap-3">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full bg-gray-700" />
        <span>{name}</span>
      </td>
      <td className="py-4 text-gray-400 w-1/3">{menu}</td>
      <td className="py-4">{price}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

const MostOrderedItem = ({ name, qty, img }) => (
  <div className="flex items-center gap-4">
    <img src={img} alt={name} className="w-14 h-14 rounded-xl object-cover" />
    <div>
      <h4 className="text-sm font-medium text-white">{name}</h4>
      <p className="text-xs text-gray-400 mt-1">{qty}</p>
    </div>
  </div>
);

const LegendItem = ({ color, title, sub }) => (
  <div className="flex items-start gap-2">
    <div className={`w-3 h-3 rounded-full mt-1 ${color}`}></div>
    <div>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  </div>
);

export default Dashboard;