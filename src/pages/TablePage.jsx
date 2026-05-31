import React, { useState, useEffect } from 'react';
import { Plus, Loader2, RefreshCw, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';
import { getOutletId } from '../api/auth';
import { TableQRModal } from '../components/TableQRModal';

const TablePage = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [qrModalTable, setQrModalTable] = useState(null);

  const fetchTables = async () => {
    try {
      const outletId = getOutletId();
      const res = await api.get(`/outlets/${outletId}/tables/`);
      setTables(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleRotateQR = async (tableId) => {
    setActionId(tableId);
    try {
      await api.post(`/tables/${tableId}/rotate-qr/`);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal regenerate QR.');
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Yakin ingin hapus meja ini?')) return;
    setActionId(tableId);
    try {
      await api.delete(`/tables/${tableId}/`);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus meja.');
    } finally {
      setActionId(null);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    try {
      const outletId = getOutletId();
      await api.post(`/outlets/${outletId}/tables/`, {
        label: newLabel.trim(),
        capacity: newCapacity,
        is_active: true,
      });
      setNewLabel('');
      setNewCapacity(4);
      setShowAddForm(false);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah meja.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-40 border-b border-feast-bg shadow-sm">
        <h2 className="text-xl font-bold font-jakarta text-feast-dark">Scan QR & Labeling</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchTables} className="flex items-center gap-2 px-4 py-2 bg-feast-surface-low text-feast-dark font-semibold text-xs rounded-xl hover:bg-gray-200 transition-colors">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 bg-feast-sunset text-white font-semibold text-xs rounded-xl hover:bg-feast-sunset-dark transition-colors">
            <Plus size={14} /> Add Table
          </button>
        </div>
      </header>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-8">
        {/* Add Table Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-sm font-bold font-jakarta text-feast-dark mb-4">Add New Table</h3>
            <form onSubmit={handleAddTable} className="flex items-end gap-4">
              <div>
                <label className="block text-xs font-semibold text-feast-dark-muted mb-1">Label</label>
                <input
                  type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Meja 5"
                  className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/20 w-48"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-feast-dark-muted mb-1">Capacity</label>
                <input
                  type="number" value={newCapacity} onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)} min={1}
                  className="bg-feast-bg rounded-xl px-4 py-2.5 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/20 w-24"
                />
              </div>
              <button type="submit" className="px-6 py-2.5 bg-feast-amber text-white font-semibold text-sm rounded-xl hover:bg-[#c29837] transition-colors">
                Create
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold font-jakarta text-feast-dark">QR Activity Log</h3>
                <p className="text-xs text-feast-dark-muted mt-1">{tables.length} tables registered.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-feast-bg">
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">QR Token</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Table</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Capacity</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Created At</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Updated At</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted">Status</th>
                    <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-feast-dark-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table.id} className="border-b border-feast-bg hover:bg-feast-surface-lowest transition-colors">
                      <td className="py-4 px-4 text-xs font-semibold text-[#fb7c4a] font-mono">
                        {table.qr_token ? table.qr_token.slice(0, 12) + '...' : '-'}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-feast-dark">{table.label}</td>
                      <td className="py-4 px-4 text-xs text-feast-dark-muted">{table.capacity} seats</td>
                      <td className="py-4 px-4 text-xs text-feast-dark-muted">{formatDate(table.created_at)}</td>
                      <td className="py-4 px-4 text-xs text-feast-dark-muted">{formatDate(table.updated_at)}</td>
                      <td className="py-4 px-4">
                        {table.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f7f2] text-[#659e41] text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#659e41]" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-feast-surface-low text-feast-dark-muted text-[10px] font-bold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => setQrModalTable(table)}
                          className="text-feast-sunset hover:text-feast-sunset-dark inline-flex items-center align-middle mr-1"
                          title="Lihat QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRotateQR(table.id)}
                          disabled={actionId === table.id}
                          className="text-[10px] font-bold text-[#fb7c4a] border border-[#fb7c4a] px-3 py-1 rounded hover:bg-[#fff5f0] transition-colors disabled:opacity-50"
                        >
                          {actionId === table.id ? '...' : 'REGENERATE'}
                        </button>
                        <button
                          onClick={() => handleDeleteTable(table.id)}
                          disabled={actionId === table.id}
                          className="text-[10px] font-bold text-red-400 border border-red-300 px-3 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tables.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-feast-dark-muted">
                        Belum ada meja. Klik "Add Table" untuk menambah.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      <TableQRModal
        table={qrModalTable}
        isOpen={!!qrModalTable}
        onClose={() => setQrModalTable(null)}
      />
    </>
  );
};

export default TablePage;
