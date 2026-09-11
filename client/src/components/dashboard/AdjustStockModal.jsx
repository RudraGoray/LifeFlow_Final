import React, { useState } from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { BLOOD_TYPE_ORDER, BLOOD_TYPE_LABELS } from './InventoryGrid';

const REASONS = {
  hospital: [
    { value: 'MANUAL_RECEIPT', label: 'Received from blood bank (+)' },
    { value: 'DEMAND_RECEIVED', label: 'Demand ticket fulfilled (+)' },
    { value: 'TRANSFUSION_USED', label: 'Used in transfusion (−)' },
    { value: 'EXPIRED', label: 'Expired / discarded (−)' },
    { value: 'ADJUSTMENT', label: 'Stock correction (±)' },
  ],
  bloodbank: [
    { value: 'MANUAL_RECEIPT', label: 'Walk-in / camp receipt (+)' },
    { value: 'DONATION_CONFIRMED', label: 'Donation batch confirmed (+)' },
    { value: 'DISPATCH_TO_HOSPITAL', label: 'Dispatched to hospital (−)' },
    { value: 'EXPIRED', label: 'Expired / discarded (−)' },
    { value: 'ADJUSTMENT', label: 'Stock correction (±)' },
  ],
};

/**
 * Modal dialog for recording a stock movement.
 * Props: owner ('hospital' | 'bloodbank'), initialType, onSubmit(payload), onClose, saving, error
 */
export default function AdjustStockModal({ owner, initialType, onSubmit, onClose, saving, error }) {
  const [bloodType, setBloodType] = useState(initialType || 'O_POS');
  const [units, setUnits] = useState('');
  const [direction, setDirection] = useState('IN');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [localError, setLocalError] = useState(null);

  const reasons = REASONS[owner] || REASONS.hospital;

  const handleSubmit = (e) => {
    e.preventDefault();
    const n = parseInt(units, 10);
    if (isNaN(n) || n < 1) { setLocalError('Enter units of at least 1.'); return; }
    if (!reason) { setLocalError('Select a reason for this movement.'); return; }
    setLocalError(null);
    onSubmit({ bloodType, units: direction === 'IN' ? n : -n, reason, note: note.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Card className="w-full max-w-md dark:bg-[#1C1917] dark:border-white/10">
          <h3 className="text-lg font-bold text-charcoal dark:text-white mb-1">Record Stock Movement</h3>
          <p className="text-xs text-muted-gray dark:text-gray-400 mb-5">
            {owner === 'hospital' ? 'Hospital fridge stock' : 'Blood bank inventory'} ·{' '}
            <span className="font-semibold">{BLOOD_TYPE_LABELS[bloodType]}</span>
          </p>

          {(error || localError) && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-lg">
              {['IN', 'OUT'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all ${
                    direction === d
                      ? 'bg-white dark:bg-white/10 shadow-sm text-charcoal dark:text-white'
                      : 'text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
                  }`}
                >
                  {d === 'IN' ? 'Stock In (+)' : 'Stock Out (−)'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Blood Type"
                id="adj-type"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                options={BLOOD_TYPE_ORDER.map((t) => ({ value: t, label: BLOOD_TYPE_LABELS[t] }))}
                required
              />
              <Input
                label="Units"
                id="adj-units"
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="e.g. 10"
                required
              />
            </div>

            <Select
              label="Reason"
              id="adj-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={[{ value: '', label: 'Select reason…' }, ...reasons]}
              required
            />

            <div>
              <label htmlFor="adj-note" className="text-xs font-semibold text-muted-gray uppercase tracking-wider mb-1.5 block">
                Note (optional)
              </label>
              <input
                id="adj-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ticket ID, donor drive, etc."
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-border-gray dark:border-white/10 rounded-lg text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Saving…' : `Record ${direction === 'IN' ? 'Receipt' : 'Usage'}`}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
