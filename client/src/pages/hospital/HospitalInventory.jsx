import React from 'react';
import StockManager from '../../components/dashboard/StockManager';

import usePageTitle from '../../hooks/usePageTitle';

export default function HospitalInventory() {
  usePageTitle('Hospital Inventory');
  return (
    <StockManager
      owner="hospital"
      title="Fridge Inventory"
      subtitle="Track ward fridge stock — record receipts from banks and transfusion usage."
      analyticsLink="/hospital/analytics"
    />
  );
}
