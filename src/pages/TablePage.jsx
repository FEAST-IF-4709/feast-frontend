import React from 'react';
import { Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const TablePage = () => {
  const qrLogs = [
    { id: '#QR-8821', table: 'Table 12', generatedAt: 'Today, 18:30', lastScanned: '10 mins ago', status: 'Active' },
    { id: '#QR-8820', table: 'Table 04', generatedAt: 'Today, 17:15', lastScanned: '45 mins ago', status: 'Active' },
    { id: '#QR-8819', table: 'Table 09', generatedAt: 'Yesterday, 19:00', lastScanned: 'Yesterday, 20:30', status: 'Expired' },
    { id: '#QR-8818', table: 'Table 22', generatedAt: 'Yesterday, 18:45', lastScanned: 'Yesterday, 19:10', status: 'Expired' },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg shadow-sm">
        <h2 className="text-xl font-bold font-jakarta text-feast-dark">Scan QR & Labeling</h2>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold font-jakarta text-feast-dark">QR Activity Log</h3>
              <p className="text-xs text-feast-dark-muted mt-1">Recent scans and code generation history.</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-feast-surface-low text-feast-dark font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors">
              <Filter size={14} /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-feast-bg">
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Code ID</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Table</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Generated At</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Last Scanned</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qrLogs.map((log, index) => (
                  <tr key={index} className="border-b border-feast-bg hover:bg-feast-surface-lowest transition-colors">
                    <td className="py-4 px-4 text-xs font-semibold text-[#fb7c4a]">{log.id}</td>
                    <td className="py-4 px-4 text-xs font-bold text-feast-dark">{log.table}</td>
                    <td className="py-4 px-4 text-xs text-feast-dark-muted">{log.generatedAt}</td>
                    <td className="py-4 px-4 text-xs text-feast-dark-muted">{log.lastScanned}</td>
                    <td className="py-4 px-4">
                      {log.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f7f2] text-[#659e41] text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#659e41]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {log.status === 'Active' ? (
                        <button className="text-[10px] font-bold text-[#fb7c4a] border border-[#fb7c4a] px-3 py-1 rounded hover:bg-[#fff5f0] transition-colors">
                          REGENERATE
                        </button>
                      ) : (
                        <button className="text-[10px] font-bold text-white bg-[#b54a1a] px-3 py-1 rounded hover:bg-[#963c13] transition-colors shadow-sm">
                          GENERATE
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-4 text-center">
            <motion.button whileHover={{ scale: 1.05 }} className="text-xs font-bold text-[#b54a1a] hover:underline">View All Logs</motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TablePage;
