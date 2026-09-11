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

export default function DemandTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const response = await api.get('/tickets/demand', { params: { page, limit: PAGE_LIMIT } });
        // Server returns a paginated envelope: { tickets, total, page, limit }
        setTickets(Array.isArray(response.data?.tickets) ? response.data.tickets : []);
        setTotal(response.data?.total ?? 0);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch demand tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Tickets"
        subtitle="Manage and track your blood requests."
        actions={
          <Link to="/hospital/demand-tickets/new">
            <Button variant="primary">Raise New Ticket</Button>
          </Link>
        }
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>
      )}

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">No demand tickets found.</div>
        ) : (
          <Table headers={['Ticket ID', 'Date', 'Blood Type', 'Units', 'Urgency', 'Department', 'Status', 'Actions']}>
            {tickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-xs">{ticket.id.substring(0, 8)}</TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-bold">{formatBloodType(ticket.bloodType)}</TableCell>
                <TableCell>{ticket.units}</TableCell>
                <TableCell>
                  <Badge variant={ticket.urgency === 'CRITICAL' ? 'danger' : ticket.urgency === 'HIGH' ? 'warning' : 'default'}>
                    {ticket.urgency}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.department}</TableCell>
                <TableCell>
                  <Badge variant={
                    ticket.status === 'PENDING' ? 'warning' :
                    ticket.status === 'CONFIRMED' ? 'info' :
                    ticket.status === 'FULFILLED' ? 'success' : 'danger'
                  }>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">View</Button>
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
