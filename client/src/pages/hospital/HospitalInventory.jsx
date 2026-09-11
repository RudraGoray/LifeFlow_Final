import React from 'react';
import StockManager from '../../components/dashboard/StockManager';

export default function HospitalInventory() {
  return (
    <StockManager
      owner="hospital"
      title="Fridge Inventory"
      subtitle="Track ward fridge stock — record receipts from banks and transfusion usage."
      analyticsLink="/hospital/analytics"
    />
  );
}
