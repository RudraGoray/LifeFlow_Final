import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import PageHeader from '../../components/dashboard/PageHeader';
import Pager from '../../components/ui/Pager';

const formatBloodType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

const PAGE_LIMIT = 20;

import usePageTitle from '../../hooks/usePageTitle';

export default function DonationBatchList() {
  usePageTitle('Donation Batches');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tickets/donation', { params: { page, limit: PAGE_LIMIT } });
        // Server returns a paginated envelope: { batches, total, page, limit }
        setBatches(Array.isArray(response.data?.batches) ? response.data.batches : []);
        setTotal(response.data?.total ?? 0);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch donation batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Donation Batches"
        subtitle="Track your blood collection dispatches to regional banks."
        actions={
          <Link to="/ngo/donation-batches/new">
            <Button variant="primary">Submit New Batch</Button>
          </Link>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">No donation batches found.</div>
        ) : (
          <Table headers={['Batch ID', 'Date', 'Camp/Location', 'Blood Type', 'Units', 'Donors', 'Status']}>
            {batches.map(batch => (
              <TableRow key={batch.id}>
                <TableCell className="font-mono text-xs">{batch.id.substring(0, 8)}</TableCell>
                <TableCell>{new Date(batch.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="font-medium text-charcoal dark:text-white">{batch.campName}</div>
                  <div className="text-xs text-muted-gray dark:text-gray-400">{batch.location}</div>
                </TableCell>
                <TableCell className="font-bold">{formatBloodType(batch.bloodType)}</TableCell>
                <TableCell>{batch.units}</TableCell>
                <TableCell>{batch.donorCount}</TableCell>
                <TableCell>
                  <Badge variant={
                    batch.status === 'PENDING' ? 'warning' :
                    batch.status === 'CONFIRMED' ? 'success' : 'danger'
                  }>
                    {batch.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
        <div className="px-6 pb-4">
          <Pager page={page} limit={PAGE_LIMIT} total={total} onPage={setPage} />
        </div>
      </Card>
    </div>
  );
}
