import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen,
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  onConfirm,
  onCancel,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  danger = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {danger && (
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-jakarta text-base font-bold text-feast-dark mb-1">{title}</h3>
            <p className="font-vietnam text-sm text-feast-dark-secondary">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-feast-bg text-feast-dark text-sm font-semibold font-vietnam rounded-xl hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-white text-sm font-semibold font-vietnam rounded-xl transition-colors ${
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-feast-sunset hover:bg-feast-sunset-dark'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
