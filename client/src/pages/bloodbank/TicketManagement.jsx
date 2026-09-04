import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DEMAND'); // DEMAND or DONATION

  const fetchTickets = useCallback(async () => {
    try {
      const response = await api.get('/tickets/pending');
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch pending tickets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAction = async (id, type, action) => {
    try {
      await api.patch(`/tickets/${id}/${action}`, { type });
      // Refresh tickets after action
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${action} ticket`);
    }
  };

  const formatBloodType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

  const filteredTickets = tickets.filter(t => t.type === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Ticket Management</h1>
        <p className="text-muted-gray text-sm">Review, approve, or reject incoming requests and donations.</p>
      </div>

      <div className="flex gap-4 border-b border-border-gray">
        <button
          onClick={() => setActiveTab('DEMAND')}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DEMAND' ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal'}`}
        >
          Hospital Demands ({tickets.filter(t => t.type === 'DEMAND').length})
        </button>
        <button
          onClick={() => setActiveTab('DONATION')}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DONATION' ? 'border-primary-crimson text-primary-crimson' : 'border-transparent text-muted-gray hover:text-charcoal'}`}
        >
          NGO Donations ({tickets.filter(t => t.type === 'DONATION').length})
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-muted-gray">No pending {activeTab.toLowerCase()} tickets.</div>
        ) : (
          <Table headers={['Ticket ID', 'Date', 'Source', 'Blood Type', 'Units', 'Urgency', 'Actions']}>
            {filteredTickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-xs">{ticket.id.substring(0,8)}</TableCell>
                <TableCell>{new Date(ticket.createdAt || ticket.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="font-bold text-charcoal">{ticket.source}</div>
                  <div className="text-xs text-muted-gray">{ticket.location}</div>
                </TableCell>
                <TableCell className="font-bold text-lg">{formatBloodType(ticket.bloodType)}</TableCell>
                <TableCell>{ticket.units}</TableCell>
                <TableCell>
                  {activeTab === 'DEMAND' ? (
                    <Badge variant={ticket.urgency === 'CRITICAL' ? 'danger' : ticket.urgency === 'HIGH' ? 'warning' : 'default'}>
                      {ticket.urgency}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-gray">N/A</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleAction(ticket.id, activeTab, 'reject')} className="text-danger-red hover:bg-red-50">Reject</Button>
                  <Button variant="primary" size="sm" onClick={() => handleAction(ticket.id, activeTab, 'confirm')}>Confirm</Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
