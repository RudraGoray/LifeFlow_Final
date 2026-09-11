import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import StockManager from '../../components/dashboard/StockManager';

export default function BloodBankInventory() {
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    api.get('/inventory/bloodbank')
      .then((r) => setBankName(r.data?.bank?.name || ''))
      .catch(() => {});
  }, []);

  return (
    <StockManager
      owner="bloodbank"
      title="Bank Inventory"
      subtitle="Track vault stock — receipts, hospital dispatches and write-offs."
      analyticsLink="/bloodbank/analytics"
      bankName={bankName}
    />
  );
}
