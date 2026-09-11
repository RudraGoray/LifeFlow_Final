import React from 'react';
import GainedVsUsed from '../../components/dashboard/GainedVsUsed';

export default function BloodBankAnalytics() {
  return (
    <GainedVsUsed
      gainedLabel="Blood Gained"
      usedLabel="Blood Dispatched"
      subtitle="Confirmed collections in vs hospital dispatches out — monitor vault sustainability."
      backLink="/bloodbank/inventory"
      backLabel="Manage Inventory"
    />
  );
}
