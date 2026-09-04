import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table, { TableRow, TableCell } from '../../components/ui/Table';

export default function DemandTicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/demand');
        setTickets(response.data);
      } catch (err) {
        console.error('Failed to fetch demand tickets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const formatBloodType = (type) => type.replace('_POS', '+').replace('_NEG', '-');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Demand Tickets</h1>
          <p className="text-muted-gray text-sm">Manage and track your blood requests.</p>
        </div>
        <Link to="/hospital/demand-tickets/new">
          <Button variant="primary">Raise New Ticket</Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-gray">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-muted-gray">No demand tickets found.</div>
        ) : (
          <Table headers={['Ticket ID', 'Date', 'Blood Type', 'Units', 'Urgency', 'Department', 'Status', 'Actions']}>
            {tickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell className="font-mono text-xs">{ticket.id.substring(0,8)}</TableCell>
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
      </Card>
    </div>
  );
}
