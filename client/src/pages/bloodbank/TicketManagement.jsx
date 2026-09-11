import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import PageHeader from '../../components/dashboard/PageHeader';

const formatBloodType = (type) => (type || '').replace('_POS', '+').replace('_NEG', '-');

// Server returns { demandTickets, donationTickets }; normalize to one list.
function normalizeQueue(data) {
  const demands = (data?.demandTickets || []).map((t) => ({
    id: t.id,
    kind: 'demand',
    date: t.createdAt,
    source: 'Hospital',
    detail: t.department || t.hospitalId?.substring(0, 8),
    bloodType: t.bloodType,
    units: t.units,
    urgency: t.urgency,
  }));
  const donations = (data?.donationTickets || []).map((b) => ({
    id: b.id,
    kind: 'donation',
    date: b.submittedAt,
    source: b.receivingBankName || 'NGO',
    detail: b.campName,
    bloodType: b.bloodType,
    units: b.units,
    urgency: null,
  }));
  return [...demands, ...donations].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('demand'); // demand | donation
  const [selected, setSelected] = useState([]);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      const response = await api.get('/tickets/pending');
      setTickets(normalizeQueue(response.data));
      setSelected([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pending tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const timer = setInterval(fetchTickets, 30000);
    return () => clearInterval(timer);
  }, [fetchTickets]);

  useEffect(() => {
    setSelected([]);
    setNotice(null);
  }, [activeTab]);

  const filtered = tickets.filter((t) => t.kind === activeTab);

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected((prev) => (prev.length === filtered.length ? [] : filtered.map((t) => t.id)));
  };

  const runAction = async (ids, action) => {
    if (ids.length === 0) return;
    setActing(true);
    setError(null);
    setNotice(null);
    try {
      if (ids.length === 1) {
        // Server expects { ticketType: 'donation' } for batches; demands need no body flag.
        const body = activeTab === 'donation' ? { ticketType: 'donation' } : {};
        await api.patch(`/tickets/${ids[0]}/${action}`, body);
      } else {
        await api.patch('/tickets/bulk', {
          ids,
          action,
          ticketType: activeTab === 'donation' ? 'donation' : 'demand',
        });
      }
      const verb = action === 'confirm' ? 'Confirmed' : 'Rejected';
      setNotice(
        `${verb} ${ids.length} ${activeTab} ticket${ids.length === 1 ? '' : 's'}.` +
          (action === 'confirm' && activeTab === 'donation'
            ? ' Bank stock credited automatically.'
            : '')
      );
      await fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} ticket(s)`);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticket Management"
        subtitle="Review, approve, or reject incoming requests and donations."
      />

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 text-sm rounded-lg">{error}</div>
      )}
      {notice && (
        <div className="p-3 bg-green-50 dark:bg-emerald-500/10 text-green-800 dark:text-emerald-300 text-sm rounded-lg">{notice}</div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-4 border-b border-border-gray dark:border-white/10">
          {[
            { key: 'demand', label: `Hospital Demands (${tickets.filter((t) => t.kind === 'demand').length})` },
            { key: 'donation', label: `NGO Donations (${tickets.filter((t) => t.kind === 'donation').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-crimson text-primary-crimson dark:text-crimson-400'
                  : 'border-transparent text-muted-gray dark:text-gray-400 hover:text-charcoal dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-gray dark:text-gray-400">{selected.length} selected</span>
            <Button variant="ghost" size="sm" disabled={acting} onClick={() => runAction(selected, 'reject')} className="text-danger-red">
              Reject all
            </Button>
            <Button variant="primary" size="sm" disabled={acting} onClick={() => runAction(selected, 'confirm')}>
              {acting ? 'Working…' : 'Confirm all'}
            </Button>
          </div>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">Loading tickets...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-gray dark:text-gray-400">No pending {activeTab} tickets.</div>
        ) : (
          <Table headers={['', 'Ticket ID', 'Date', 'Source', 'Blood Type', 'Units', 'Urgency', 'Actions']}>
            {filtered.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(ticket.id)}
                    onChange={() => toggleSelect(ticket.id)}
                    aria-label={`Select ticket ${ticket.id}`}
                    className="rounded text-primary-crimson focus:ring-primary-crimson"
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{ticket.id.substring(0, 8)}</TableCell>
                <TableCell>{new Date(ticket.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="font-bold text-charcoal dark:text-white">{ticket.source}</div>
                  {ticket.detail && <div className="text-xs text-muted-gray dark:text-gray-400">{ticket.detail}</div>}
                </TableCell>
                <TableCell className="font-bold text-lg">{formatBloodType(ticket.bloodType)}</TableCell>
                <TableCell>{ticket.units}</TableCell>
                <TableCell>
                  {ticket.urgency ? (
                    <Badge variant={ticket.urgency === 'CRITICAL' ? 'danger' : ticket.urgency === 'HIGH' ? 'warning' : 'default'}>
                      {ticket.urgency}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-gray dark:text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2 whitespace-nowrap">
                  <Button variant="ghost" size="sm" disabled={acting} onClick={() => runAction([ticket.id], 'reject')} className="text-danger-red hover:bg-red-50 dark:hover:bg-red-500/10">Reject</Button>
                  <Button variant="primary" size="sm" disabled={acting} onClick={() => runAction([ticket.id], 'confirm')}>Confirm</Button>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </Card>

      {filtered.length > 1 && (
        <label className="flex items-center gap-2 text-sm text-muted-gray dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.length === filtered.length}
            onChange={toggleAll}
            className="rounded text-primary-crimson focus:ring-primary-crimson"
          />
          Select all on this tab
        </label>
      )}
    </div>
  );
}
