import React from 'react';
import GainedVsUsed from '../../components/dashboard/GainedVsUsed';

export default function HospitalAnalytics() {
  return (
    <GainedVsUsed
      gainedLabel="Blood Received"
      usedLabel="Blood Used"
      subtitle="Fridge stock in vs transfusion usage — track whether incoming supply covers clinical demand."
      backLink="/hospital/inventory"
      backLabel="Manage Inventory"
    />
  );
}
