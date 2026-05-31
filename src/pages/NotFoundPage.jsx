import React from 'react';
import { Link } from 'react-router-dom';
import { Home, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-feast-bg flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full shadow-sm animate-[fadeIn_0.4s_ease-out]">
        <div className="w-16 h-16 bg-feast-surface-low rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SearchX size={28} className="text-feast-dark-muted" />
        </div>
        <h1 className="font-jakarta text-5xl font-bold text-feast-dark mb-2">404</h1>
        <h2 className="font-jakarta text-xl font-bold text-feast-dark mb-3">Halaman tidak ditemukan</h2>
        <p className="font-vietnam text-sm text-feast-dark-muted mb-8">
          Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-feast-sunset text-white text-sm font-semibold font-vietnam rounded-full hover:bg-feast-sunset-dark transition-colors"
        >
          <Home size={16} />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
