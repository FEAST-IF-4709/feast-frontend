import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import VouchersTab from './loyalty/VouchersTab';

const TABS = [
  { key: 'vouchers', label: 'Voucher & Reward' },
];

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState('vouchers');

  return (
    <div className="min-h-screen bg-feast-bg">
      <PageHeader
        title="Loyalty & Marketing"
        subtitle="Kelola voucher, reward, dan program membership brand Anda"
      />
      <div className="px-6 pt-4">
        <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === 'vouchers' && <VouchersTab />}
        </div>
      </div>
    </div>
  );
}
