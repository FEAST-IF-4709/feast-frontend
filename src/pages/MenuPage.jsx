import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CategoriesTab from './menu/CategoriesTab';
import BrandProductsTab from './menu/BrandProductsTab';
import OutletProductsTab from './menu/OutletProductsTab';
import PromotionsTab from './menu/PromotionsTab';

const TABS = [
  { key: 'categories', label: 'Kategori' },
  { key: 'brand-products', label: 'Menu Brand' },
  { key: 'outlet-products', label: 'Menu Outlet' },
  { key: 'promotions', label: 'Promosi' },
];

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState('categories');

  return (
    <div className="min-h-screen bg-feast-bg">
      <PageHeader
        title="Menu Management"
        subtitle="Kelola kategori, menu, harga per outlet, dan promosi"
      />
      <div className="px-6 pt-4">
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'brand-products' && <BrandProductsTab />}
          {activeTab === 'outlet-products' && <OutletProductsTab />}
          {activeTab === 'promotions' && <PromotionsTab />}
        </div>
      </div>
    </div>
  );
}
