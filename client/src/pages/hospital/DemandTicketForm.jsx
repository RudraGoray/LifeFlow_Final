import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

// Default required-by date from the clock (tomorrow, same time), mirroring
// DonationBatchForm's auto-filled collection date. Still editable below.
function defaultRequiredBy() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DemandTicketForm() {
  const [formData, setFormData] = useState(() => ({
    bloodType: 'O_POS',
    units: 1,
    urgency: 'MEDIUM',
    department: '',
    requiredBy: defaultRequiredBy(),
    patientRefId: '',
    diagnosis: '',
    notes: ''
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setFieldErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const errs = {};
    const units = parseInt(formData.units, 10);
    if (isNaN(units) || units < 1) errs.units = 'Units must be at least 1.';
    if (!formData.department.trim()) errs.department = 'Department is required.';
    if (!formData.requiredBy) errs.requiredBy = 'Required-by date is required.';
    else if (new Date(formData.requiredBy) <= new Date()) errs.requiredBy = 'Required-by must be in the future.';
    if (formData.bloodType === 'ALL') errs.bloodType = 'Select a blood type.';
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
      await api.post('/tickets/demand', {
        ...formData,
        units: parseInt(formData.units)
      });
      navigate('/hospital/demand-tickets');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit demand ticket');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Raise Demand Ticket</h1>
        <p className="text-muted-gray text-sm">Request blood units from regional blood banks.</p>
      </div>

      <Card>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-border-gray pb-6">
            <Select 
              label="Blood Type" 
              id="bloodType" 
              value={formData.bloodType} 
              onChange={handleChange} 
              options={[
                { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
                { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
                { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
                { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' }
              ]}
              error={fieldErrors.bloodType}
              required
            />
            <Input 
              label="Units Required" 
              id="units" 
              type="number" 
              min="1" 
              value={formData.units} 
              onChange={handleChange} 
              error={fieldErrors.units}
              required 
            />
            <Select 
              label="Urgency Level" 
              id="urgency" 
              value={formData.urgency} 
              onChange={handleChange} 
              options={[
                { value: 'LOW', label: 'Low (Routine)' },
                { value: 'MEDIUM', label: 'Medium (Within 24h)' },
                { value: 'HIGH', label: 'High (Within 6h)' },
                { value: 'CRITICAL', label: 'Critical (Immediate)' }
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <Input 
              label="Department" 
              id="department" 
              value={formData.department} 
              onChange={handleChange} 
              placeholder="e.g. ICU, Surgery" 
              error={fieldErrors.department}
              required 
            />
            <Input 
              label="Required By (Date/Time)" 
              id="requiredBy" 
              type="datetime-local" 
              value={formData.requiredBy} 
              onChange={handleChange} 
              error={fieldErrors.requiredBy}
              required 
            />
            <Input 
              label="Patient Reference ID" 
              id="patientRefId" 
              value={formData.patientRefId} 
              onChange={handleChange} 
              placeholder="Optional" 
            />
            <Input 
              label="Diagnosis" 
              id="diagnosis" 
              value={formData.diagnosis} 
              onChange={handleChange} 
              placeholder="Optional" 
            />
          </div>

          <div>
            <label htmlFor="notes" className="text-xs font-semibold text-muted-gray uppercase tracking-wider mb-1.5 block">
              Additional Notes
            </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 bg-white dark:bg-white/5 border border-border-gray dark:border-white/10 rounded-lg text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-crimson"
                placeholder="Any specific instructions for the blood bank..."
              ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-gray">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Demand Ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
