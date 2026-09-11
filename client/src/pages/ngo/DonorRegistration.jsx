import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const BLOOD_TYPE_OPTIONS = [
  { value: 'A_POS', label: 'A+' }, { value: 'A_NEG', label: 'A-' },
  { value: 'B_POS', label: 'B+' }, { value: 'B_NEG', label: 'B-' },
  { value: 'AB_POS', label: 'AB+' }, { value: 'AB_NEG', label: 'AB-' },
  { value: 'O_POS', label: 'O+' }, { value: 'O_NEG', label: 'O-' }
];

const EMPTY_FORM = {
  name: '',
  contactNumber: '',
  bloodType: 'O_POS',
  state: '',
  cityDistrict: ''
};

import usePageTitle from '../../hooks/usePageTitle';

export default function DonorRegistration() {
  usePageTitle('Register Donor');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [registeredDonor, setRegisteredDonor] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Donor name is required.';
    const digits = formData.contactNumber.replace(/\D/g, '');
    if (!formData.contactNumber.trim()) errs.contactNumber = 'Contact number is required.';
    else if (digits.length < 10) errs.contactNumber = 'Enter a valid contact number (min 10 digits).';
    if (!BLOOD_TYPE_OPTIONS.some((o) => o.value === formData.bloodType)) {
      errs.bloodType = 'Select a valid blood type.';
    }
    if (!formData.state.trim()) errs.state = 'State is required.';
    if (!formData.cityDistrict.trim()) errs.cityDistrict = 'City / District is required.';
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
      const res = await api.post('/auth/register-donor', {
        name: formData.name.trim(),
        contactNumber: formData.contactNumber.trim(),
        bloodType: formData.bloodType,
        state: formData.state.trim(),
        cityDistrict: formData.cityDistrict.trim()
      });
      setRegisteredDonor(res.data?.donor || null);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register donor');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredDonor(null);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Register Donor</h1>
        <p className="text-muted-gray text-sm">Enroll a new blood donor into the regional donor registry.</p>
      </div>

      {registeredDonor ? (
        <Card>
          <div className="text-center py-6">
            <CheckCircle2 className="h-12 w-12 text-success-green mx-auto mb-4" />
            <h2 className="text-xl font-bold text-charcoal mb-2">Donor Registered Successfully</h2>
            <p className="text-sm text-muted-gray mb-1">
              <span className="font-semibold text-charcoal">{registeredDonor.name}</span>
              {' '}({BLOOD_TYPE_OPTIONS.find((o) => o.value === registeredDonor.bloodType)?.label || registeredDonor.bloodType})
              {' '}— {registeredDonor.cityDistrict}, {registeredDonor.state}
            </p>
            <p className="text-xs text-muted-gray mb-6">The donor is now part of the regional registry and can be matched to demand.</p>
            <div className="flex justify-center gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/ngo/dashboard')}>
                Back to Dashboard
              </Button>
              <Button type="button" variant="primary" onClick={handleRegisterAnother}>
                Register Another Donor
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-border-gray pb-6">
              <Input
                label="Full Name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                error={fieldErrors.name}
                required
              />
              <Input
                label="Contact Number"
                id="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                error={fieldErrors.contactNumber}
                required
              />
              <Select
                label="Blood Type"
                id="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                options={BLOOD_TYPE_OPTIONS}
                error={fieldErrors.bloodType}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="State"
                  id="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  error={fieldErrors.state}
                  required
                />
                <Input
                  label="City / District"
                  id="cityDistrict"
                  value={formData.cityDistrict}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  error={fieldErrors.cityDistrict}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Registering...' : 'Register Donor'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
