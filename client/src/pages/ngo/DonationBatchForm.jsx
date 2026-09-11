import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

import usePageTitle from '../../hooks/usePageTitle';

export default function DonationBatchForm() {
  usePageTitle('Submit Donation Batch');
  const [formData, setFormData] = useState({
    campName: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    bloodType: 'O_POS',
    units: 1,
    donorCount: 1,
    receivingBankId: '',
    lotRef: '',
    notes: ''
  });
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bloodbanks', { params: { page: 1, limit: 50 } })
      .then((res) => {
        // Server returns a paginated envelope: { banks, total, page, limit }
        const list = Array.isArray(res.data?.banks) ? res.data.banks : [];
        setBanks(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, receivingBankId: prev.receivingBankId || list[0].bloodBankId }));
        }
      })
      .catch((err) => console.error('Failed to fetch blood banks', err));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setFieldErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.campName.trim()) errs.campName = 'Camp name is required.';
    if (!formData.location.trim()) errs.location = 'Location is required.';
    const units = parseInt(formData.units, 10);
    if (isNaN(units) || units < 1) errs.units = 'Units must be at least 1.';
    const donors = parseInt(formData.donorCount, 10);
    if (isNaN(donors) || donors < 1) errs.donorCount = 'Donor count must be at least 1.';
    if (!formData.date) errs.date = 'Collection date is required.';
    else {
      const today = new Date(); today.setHours(23, 59, 59, 999);
      if (new Date(formData.date) > today) errs.date = 'Collection date cannot be in the future.';
    }
    if (!formData.receivingBankId) errs.receivingBankId = 'Select the receiving blood bank.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/tickets/donation', {
        ...formData,
        units: parseInt(formData.units),
        donorCount: parseInt(formData.donorCount),
        date: new Date(formData.date).toISOString()
      });
      navigate('/ngo/donation-batches');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit donation batch');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Submit Donation Batch</h1>
        <p className="text-muted-gray text-sm">Register collected blood units for dispatch to a regional blood bank.</p>
      </div>

      <Card>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-gray pb-6">
            <Input 
              label="Camp Name" 
              id="campName" 
              value={formData.campName} 
              onChange={handleChange} 
              placeholder="e.g. University Annual Drive"
              error={fieldErrors.campName}
              required 
            />
            <Input 
              label="Location" 
              id="location" 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Area/Building Name"
              error={fieldErrors.location}
              required 
            />
            <Input 
              label="Date of Collection" 
              id="date" 
              type="date"
              value={formData.date} 
              onChange={handleChange} 
              error={fieldErrors.date}
              required 
            />
            <Select 
              label="Receiving Blood Bank" 
              id="receivingBankId" 
              value={formData.receivingBankId} 
              onChange={handleChange} 
              options={
                banks.length > 0
                  ? banks.map((b) => ({ value: b.bloodBankId, label: `${b.name} (${b.cityDistrict})` }))
                  : [{ value: '', label: 'Loading banks…' }]
              }
              error={fieldErrors.receivingBankId}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
            <Select 
              label="Blood Type Collected" 
              id="bloodType" 
              value={formData.bloodType} 
              onChange={handleChange} 
              options={[
                { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
                { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
                { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
                { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' }
              ]}
              required
            />
            <Input 
              label="Total Units (Pints)" 
              id="units" 
              type="number" 
              min="1" 
              value={formData.units} 
              onChange={handleChange} 
              error={fieldErrors.units}
              required 
            />
            <Input 
              label="Total Donors" 
              id="donorCount" 
              type="number" 
              min="1" 
              value={formData.donorCount} 
              onChange={handleChange} 
              error={fieldErrors.donorCount}
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input 
                label="Batch Lot Reference" 
                id="lotRef" 
                value={formData.lotRef} 
                onChange={handleChange} 
                placeholder="Optional external tracking ID" 
              />
             <div>
              <label htmlFor="notes" className="text-xs font-semibold text-muted-gray uppercase tracking-wider mb-1.5 block">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-border-gray dark:border-white/10 rounded-lg text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-gray">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit to Blood Bank'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
