import React, { useState } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const initialForm = {
  orgName: '',
  orgType: '',
  contact: '',
  email: '',
  phone: '',
  venue: '',
  city: '',
  state: '',
  date: '',
  donors: '',
};

import usePageTitle from '../../hooks/usePageTitle';

export default function CampRegistration() {
  usePageTitle('Register a Blood Drive');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.id]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.orgName.trim()) errs.orgName = 'Organization name is required.';
    if (!form.orgType.trim()) errs.orgType = 'Organization type is required.';
    if (!form.contact.trim()) errs.contact = 'Contact person is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^(\+91[\s-]?)?[0]?[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!form.venue.trim()) errs.venue = 'Venue is required.';
    if (!form.city.trim()) errs.city = 'City/District is required.';
    if (!form.state.trim()) errs.state = 'State is required.';
    if (!form.date) errs.date = 'Preferred date is required.';
    else if (new Date(form.date) < new Date(new Date().setHours(0, 0, 0, 0))) errs.date = 'Date cannot be in the past.';
    if (form.donors && (isNaN(parseInt(form.donors)) || parseInt(form.donors) < 1)) errs.donors = 'Expected donors must be a positive number.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Persisted as an AccountRequest lead for coordinator follow-up.
      await api.post('/auth/request-account', {
        organizationName: form.orgName.trim(),
        orgType: form.orgType.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        venue: form.venue.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        date: form.date || undefined,
        donors: form.donors || undefined,
      });
      setSuccess(true);
      setForm(initialForm);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-charcoal mb-4">Register a Blood Drive</h1>
          <p className="text-lg text-muted-gray">
            Partner with LifeFlow to organize a blood donation camp at your corporate campus, university, or community center.
          </p>
        </div>

        <Card>
          {success && (
            <Alert role="hospital" className="mb-6 bg-green-50 text-green-800 border-green-200">
              Thank you! Your request has been submitted. Our coordination team will contact you within 24 hours.
            </Alert>
          )}
          {submitError && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{submitError}</div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <h3 className="text-lg font-bold text-charcoal mb-4 border-b pb-2">Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Organization Name" id="orgName" value={form.orgName} onChange={handleChange} error={errors.orgName} required />
                <Input label="Organization Type" id="orgType" placeholder="e.g. Corporate, University, NGO" value={form.orgType} onChange={handleChange} error={errors.orgType} required />
                <Input label="Contact Person" id="contact" value={form.contact} onChange={handleChange} error={errors.contact} required />
                <Input label="Email Address" id="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />
                <Input label="Phone Number" id="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} required />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-charcoal mb-4 border-b pb-2 mt-8">Proposed Camp Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Proposed Venue" id="venue" value={form.venue} onChange={handleChange} error={errors.venue} required className="md:col-span-2" />
                <Input label="City/District" id="city" value={form.city} onChange={handleChange} error={errors.city} required />
                <Input label="State" id="state" value={form.state} onChange={handleChange} error={errors.state} required />
                <Input label="Preferred Date" id="date" type="date" value={form.date} onChange={handleChange} error={errors.date} required />
                <Input label="Expected Donors" id="donors" type="number" placeholder="Estimated turnout" value={form.donors} onChange={handleChange} error={errors.donors} />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration Request'}
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-gray">
              Note: This form submits a request. Official camp scheduling is subject to local blood bank availability and compliance checks.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}