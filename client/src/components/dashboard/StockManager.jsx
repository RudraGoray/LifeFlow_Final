import React, { useState, useCallback } from 'react';
import api from '../../utils/api';
import usePolling from '../../hooks/usePolling';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PageHeader from './PageHeader';
import InventoryGrid from './InventoryGrid';
import AdjustStockModal from './AdjustStockModal';
import MovementTable from './MovementTable';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Full inventory management view.
 * Props: owner ('hospital'|'bloodbank'), title, subtitle, analyticsLink, bankName
 */
export default function StockManager({ owner, title, subtitle, analyticsLink, bankName }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [presetType, setPresetType] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [version, setVersion] = useState(0);

  const fetchAll = useCallback(async () => {
    const [invRes, movRes] = await Promise.all([
      api.get(`/inventory/${owner}`),
      api.get('/inventory/movements?months=3'),
    ]);
    return { inventory: invRes.data, movements: movRes.data };
  }, [owner]);

  const { data, loading, lastUpdated } = usePolling(fetchAll, 30000, [owner, version]);

  const rows = data?.inventory?.rows || [];
  const totalUnits = data?.inventory?.totalUnits ?? rows.reduce((s, r) => s + r.units, 0);
  const critical = rows.filter((r) => r.statusLevel === 'CRITICAL').length;
  const recent = data?.movements?.recent || [];

  const openModal = (row) => {
    setPresetType(row?.bloodType || null);
    setModalError(null);
    setModalOpen(true);
  };

  const handleAdjust = async (payload) => {
    setSaving(true);
    setModalError(null);
    try {
      await api.patch(`/inventory/${owner}/adjust`, payload);
      setModalOpen(false);
      setVersion((v) => v + 1);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to record movement');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={bankName ? `${bankName} · ${subtitle}` : subtitle}
        lastUpdated={lastUpdated}
        actions={
          <div className="flex items-center gap-2">
            <Link to={analyticsLink}>
              <Button variant="secondary">View Analytics</Button>
            </Link>
            <Button variant="primary" onClick={() => openModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Record Movement
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Total Units</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">{totalUnits}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Types Critical</div>
          <div className={`text-4xl font-extrabold my-1 ${critical > 0 ? 'text-danger-red' : 'text-success-green dark:text-emerald-400'}`}>
            {critical}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Blood Types Tracked</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">{rows.length}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Stock by Blood Type</h3>
        <InventoryGrid rows={rows} onAdjust={openModal} />
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-charcoal dark:text-white mb-4">Recent Movements</h3>
        <MovementTable movements={recent} />
      </Card>

      {modalOpen && (
        <AdjustStockModal
          owner={owner}
          initialType={presetType}
          onSubmit={handleAdjust}
          onClose={() => setModalOpen(false)}
          saving={saving}
          error={modalError}
        />
      )}
    </div>
  );
}
