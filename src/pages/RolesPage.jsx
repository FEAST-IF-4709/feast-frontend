import React, { useState, useEffect } from 'react';
import { ShieldCheck, Pencil, Plus, CircleDot, Loader2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState(null); // role being edited for permissions
  const [selectedPermIds, setSelectedPermIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/rbac/roles/'),
        api.get('/rbac/permissions/'),
      ]);
      setRoles(rolesRes.data.data || []);
      setAllPermissions(permsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch roles/permissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setIsSaving(true);
    try {
      await api.post('/rbac/roles/', { name: newRoleName.trim() });
      setNewRoleName('');
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat role.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Yakin ingin hapus role ini?')) return;
    try {
      await api.delete(`/rbac/roles/${roleId}/`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus role. Role sistem tidak bisa dihapus.');
    }
  };

  const handleEditPermissions = (role) => {
    setEditingRole(role);
    // Pre-select current permissions
    const currentIds = new Set((role.permissions || []).map(p => p.id || p));
    setSelectedPermIds(currentIds);
  };

  const togglePermission = (permId) => {
    setSelectedPermIds(prev => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!editingRole) return;
    setIsSaving(true);
    try {
      await api.put(`/rbac/roles/${editingRole.id}/permissions/`, {
        permission_ids: Array.from(selectedPermIds),
      });
      setEditingRole(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by module prefix (kitchen.*, cashier.*, etc.)
  const groupedPermissions = allPermissions.reduce((groups, perm) => {
    const codename = perm.codename || perm.name || perm;
    const module = codename.split('.')[0] || 'other';
    if (!groups[module]) groups[module] = [];
    groups[module].push(perm);
    return groups;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const getRoleColor = (index) => {
    const colors = ['bg-feast-dark', 'bg-feast-dark-secondary', 'bg-feast-dark-muted', 'bg-feast-sunset', 'bg-feast-amber', 'bg-feast-beetroot'];
    return colors[index % colors.length];
  };

  return (
    <>
      {/* Top Bar */}
      <header className="flex justify-between items-center px-8 py-5 bg-white sticky top-0 z-40">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-feast-dark-muted">
            Access Control
          </p>
          <h2 className="text-2xl font-bold font-jakarta text-feast-dark mt-1">Role Matrix</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-all duration-200 hover:shadow-lg hover:shadow-feast-sunset/20"
        >
          <Plus size={16} />
          Add New Role
        </button>
      </header>

      <div className="px-8 py-6">
        {/* Create Role Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <form onSubmit={handleCreateRole} className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-feast-dark-muted mb-1">Role Name</label>
                  <input
                    type="text" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Supervisor"
                    className="w-full bg-feast-bg rounded-xl px-4 py-2.5 text-sm text-feast-dark font-vietnam focus:outline-none focus:ring-2 focus:ring-feast-sunset/20"
                    required autoFocus
                  />
                </div>
                <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-feast-amber text-white font-semibold text-sm rounded-xl hover:bg-[#c29837] transition-colors disabled:opacity-50">
                  {isSaving ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-2.5 text-feast-dark-muted hover:text-feast-dark transition-colors">
                  <X size={18} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-feast-sunset" />
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {roles.map((role, i) => {
              const perms = role.permissions || [];
              const permNames = perms.map(p => p.codename || p.name || p);

              return (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  key={role.id || i}
                  className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 group relative border border-transparent hover:border-feast-bg"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getRoleColor(i)} rounded-xl flex items-center justify-center`}>
                        <ShieldCheck size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-jakarta text-feast-dark">{role.name}</h3>
                        <p className="text-xs text-feast-dark-muted">{perms.length} permissions</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditPermissions(role)} className="p-1.5 text-feast-dark-muted hover:text-feast-sunset rounded-lg hover:bg-feast-bg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 text-feast-dark-muted hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Key Permissions */}
                  <div className="mb-5">
                    <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-feast-dark-muted mb-3">
                      Permissions
                    </h4>
                    <div className="space-y-2">
                      {permNames.length > 0 ? (
                        permNames.slice(0, 5).map((perm, pi) => (
                          <div key={pi} className="flex items-center gap-2">
                            <CircleDot size={12} className="text-feast-sunset flex-shrink-0" />
                            <span className="text-xs font-medium text-feast-dark-secondary font-mono">{perm}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-feast-dark-muted italic">No permissions assigned</p>
                      )}
                      {permNames.length > 5 && (
                        <p className="text-xs text-feast-dark-muted">+{permNames.length - 5} more</p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-2 pt-4 border-t border-feast-bg">
                    <div className={`w-7 h-7 ${getRoleColor(i)} rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold`}>
                      {role.name?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                    <span className="text-xs text-feast-dark-muted">
                      {role.is_system_role ? 'System Role' : 'Custom Role'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Edit Permissions Modal */}
      <AnimatePresence>
        {editingRole && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-feast-bg">
                <h3 className="text-lg font-bold font-jakarta text-feast-dark">
                  Edit Permissions — {editingRole.name}
                </h3>
                <p className="text-xs text-feast-dark-muted mt-1">{selectedPermIds.size} selected</p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-feast-dark-muted mb-3 capitalize">{module}</h4>
                    <div className="space-y-2">
                      {perms.map((perm) => {
                        const permId = perm.id || perm;
                        const codename = perm.codename || perm.name || perm;
                        const isSelected = selectedPermIds.has(permId);
                        return (
                          <label key={permId} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-feast-sunset/5' : 'hover:bg-feast-bg'}`}>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-feast-sunset border-feast-sunset' : 'border-feast-dark-muted/30'}`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-feast-dark font-mono">{codename}</span>
                            <input type="checkbox" checked={isSelected} onChange={() => togglePermission(permId)} className="sr-only" />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-feast-bg flex gap-3">
                <button onClick={() => setEditingRole(null)} className="flex-1 py-3 bg-feast-bg text-feast-dark font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSavePermissions} disabled={isSaving} className="flex-1 py-3 bg-feast-sunset text-white font-semibold text-sm rounded-xl hover:bg-feast-sunset-dark transition-colors disabled:opacity-50">
                  {isSaving ? 'Saving...' : 'Save Permissions'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RolesPage;
