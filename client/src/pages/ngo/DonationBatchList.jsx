import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function DonationBatchList() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get('/tickets/donation');
        setBatches(response.data);
      } catch (err) {
        console.error('Failed to fetch donation batches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const formatBloodType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Donation Batches</h1>
          <p className="text-muted-gray text-sm">Track your blood collection dispatches to regional banks.</p>
        </div>
        <Link to="/ngo/donation-batches/new">
          <Button variant="primary">Submit New Batch</Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray">Loading batches...</div>
        ) : batches.length === 0 ? (
          <div className="p-8 text-center text-muted-gray">No donation batches found.</div>
        ) : (
          <Table headers={['Batch ID', 'Date', 'Camp/Location', 'Blood Type', 'Units', 'Donors', 'Status']}>
            {batches.map(batch => (
              <TableRow key={batch.id}>
                <TableCell className="font-mono text-xs">{batch.id.substring(0,8)}</TableCell>
                <TableCell>{new Date(batch.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="font-medium text-charcoal">{batch.campName}</div>
                  <div className="text-xs text-muted-gray">{batch.location}</div>
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
      </Card>
    </div>
  );
}
