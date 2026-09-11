import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import PageHeader from '../../components/dashboard/PageHeader';
import Pager from '../../components/ui/Pager';

const formatBloodType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

const TYPE_FILTERS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const TYPE_TO_ENUM = { 'A+': 'A_POS', 'A-': 'A_NEG', 'B+': 'B_POS', 'B-': 'B_NEG', 'AB+': 'AB_POS', 'AB-': 'AB_NEG', 'O+': 'O_POS', 'O-': 'O_NEG' };
const PAGE_LIMIT = 10;

export default function Volunteers() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // Region-wide pool sample for the stat cards (exact total via poolTotal).
  const [poolSample, setPoolSample] = useState([]);
  const [poolTotal, setPoolTotal] = useState(0);

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit: PAGE_LIMIT };
        if (typeFilter !== 'ALL') params.bloodType = TYPE_TO_ENUM[typeFilter];
        if (submittedSearch.trim()) params.search = submittedSearch.trim();
        const response = await api.get('/auth/donors', { params });
        // Includes seeded volunteers AND donors added via Register Donor —
        // both are stored as Donor records in the backend.
        setDonors(Array.isArray(response.data?.donors) ? response.data.donors : []);
        setTotal(response.data?.total ?? 0);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch volunteers');
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, [page, typeFilter, submittedSearch]);

  // Region-wide pool sample for the stat cards (unfiltered, up to 100).
  useEffect(() => {
    api.get('/auth/donors', { params: { page: 1, limit: 100 } })
      .then((r) => {
        setPoolSample(Array.isArray(r.data?.donors) ? r.data.donors : []);
        setPoolTotal(r.data?.total ?? 0);
      })
      .catch(() => {});
  }, []);

  const rareCount = poolSample.filter((d) => ['O_NEG', 'AB_NEG', 'B_NEG', 'A_NEG'].includes(d.bloodType)).length;
  const groupsCovered = new Set(poolSample.map((d) => d.bloodType)).size;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleTypeChange = (t) => {
    setPage(1);
    setTypeFilter(t);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Pool"
        subtitle="Registered donors in your region — ready to mobilize for drives."
        actions={
          <Link to="/ngo/donors/new">
            <Button variant="primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Register Donor
            </Button>
          </Link>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Total Volunteers</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">{poolTotal}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Rare Types (Rh− / O−)</div>
          <div className="text-4xl font-extrabold text-crimson my-1">{rareCount}</div>
        </Card>
        <Card className="text-center">
          <div className="text-xs uppercase font-bold tracking-wider text-muted-gray dark:text-gray-400">Blood Groups Covered</div>
          <div className="text-4xl font-extrabold text-charcoal dark:text-white my-1">
            {groupsCovered}/8
          </div>
        </Card>
      </div>

      <Card>
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact or city… (Enter to apply)"
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-border-gray dark:border-white/10 rounded-lg text-sm text-charcoal dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-crimson"
            />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-white/10 rounded-lg overflow-x-auto">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-heading font-semibold transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-crimson text-white shadow-crimson-sm'
                    : 'text-charcoal-muted dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </form>

        {loading ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">Loading volunteers...</div>
        ) : donors.length === 0 ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">
            {poolTotal === 0
              ? 'No volunteers registered in your region yet.'
              : 'No volunteers match your search.'}{' '}
            <Link to="/ngo/donors/new" className="text-primary-crimson dark:text-crimson-400 font-semibold hover:underline">
              Register the first one
            </Link>
            .
          </div>
        ) : (
          <Table headers={['Volunteer', 'Contact', 'Blood Type', 'Location', 'Registered']}>
            {donors.map((d) => (
              <TableRow key={d.donorId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-crimson/10 dark:bg-crimson/20 text-crimson dark:text-crimson-400 flex items-center justify-center font-bold flex-shrink-0">
                      {(d.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{d.name}</span>
                  </div>
                </TableCell>
                <TableCell>{d.contactNumber}</TableCell>
                <TableCell>
                  <Badge variant={['O_NEG', 'AB_NEG'].includes(d.bloodType) ? 'danger' : 'info'}>
                    {formatBloodType(d.bloodType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {d.cityDistrict}
                  <span className="block text-xs text-muted-gray dark:text-gray-400">{d.state}</span>
                </TableCell>
                <TableCell>{new Date(d.registeredAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
        <Pager page={page} limit={PAGE_LIMIT} total={total} onPage={setPage} />
      </Card>
    </div>
  );
}
