import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';

function healthBadge(health) {
  const map = {
    'Deficit': { variant: 'danger', label: 'Deficit' },
    'Surplus': { variant: 'success', label: 'Surplus' },
    'Adequate': { variant: 'info', label: 'Adequate' },
  };
  const config = map[health] || map.Adequate;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

import usePageTitle from '../../hooks/usePageTitle';

export default function Regional() {
  usePageTitle('Regional Breakdown');
  const { bloodType, region, timeRange } = useOutletContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchRegional = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/stats/regional', {
          params: { bloodType, state: region, months: timeRange.replace('M', '') }
        });
        setRows(Array.isArray(response.data) ? response.data : []);
        setExpanded({});
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch regional stats');
      } finally {
        setLoading(false);
      }
    };
    fetchRegional();
  }, [bloodType, region, timeRange]);

  const statesMap = {};
  rows.forEach((r) => {
    if (!statesMap[r.state]) {
      statesMap[r.state] = { state: r.state, cities: [], donated: 0, demanded: 0 };
    }
    statesMap[r.state].cities.push(r);
    statesMap[r.state].donated += r.donated;
    statesMap[r.state].demanded += r.demanded;
  });

  const states = Object.values(statesMap).sort((a, b) => b.donated - a.donated);
  const totalDonated = states.reduce((sum, s) => sum + s.donated, 0);
  const totalDemanded = states.reduce((sum, s) => sum + s.demanded, 0);

  const toggleState = (state) => {
    setExpanded((prev) => ({ ...prev, [state]: !prev[state] }));
  };

  const stateHealth = (s) => {
    const surplus = s.donated - s.demanded;
    if (surplus < 0) return 'Deficit';
    if (surplus > 100) return 'Surplus';
    return 'Adequate';
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-white/10 rounded-xl"></div>;

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-800 dark:text-red-300 text-center py-6">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Regions Covered" value={states.length} trend="Active states" />
        <StatCard label="Total Collected" value={totalDonated.toLocaleString()} trend="Aggregated units" />
        <StatCard label="Total Demanded" value={totalDemanded.toLocaleString()} trend="Aggregated units" />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Regional Breakdown</h3>
            <p className="text-sm text-muted-gray">Click a state to drill down into its city-level supply & demand.</p>
          </div>
          <Badge variant="info">
            <MapPin className="w-3 h-3 mr-1" />
            State → City drill-down
          </Badge>
        </div>

        <Table headers={['State', 'Cities', 'Collected', 'Demanded', 'Surplus', 'Health']}>
          {states.map((s) => {
            const surplus = s.donated - s.demanded;
            const isExpanded = !!expanded[s.state];
            return [
              <TableRow
                key={s.state}
                className="cursor-pointer"
              >
                <TableCell>
                  <button
                    onClick={() => toggleState(s.state)}
                    className="flex items-center gap-2 font-semibold text-charcoal hover:text-primary-crimson"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-gray" /> : <ChevronRight className="w-4 h-4 text-muted-gray" />}
                    {s.state}
                  </button>
                </TableCell>
                <TableCell>{s.cities.length} cities</TableCell>
                <TableCell className="font-medium">{s.donated.toLocaleString()}</TableCell>
                <TableCell className="font-medium">{s.demanded.toLocaleString()}</TableCell>
                <TableCell className={`font-semibold ${surplus >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                  {surplus > 0 ? '+' : ''}{surplus.toLocaleString()}
                </TableCell>
                <TableCell>{healthBadge(stateHealth(s))}</TableCell>
              </TableRow>,
              isExpanded && s.cities.map((c) => {
                const citySurplus = c.donated - c.demanded;
                return (
                  <TableRow key={`${s.state}-${c.city}`} className="bg-gray-50/60">
                    <TableCell className="pl-12 text-muted-gray">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-crimson" />
                        {c.city}
                      </span>
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="font-medium">{c.donated.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{c.demanded.toLocaleString()}</TableCell>
                    <TableCell className={`font-semibold ${citySurplus >= 0 ? 'text-success-green' : 'text-danger-red'}`}>
                      {citySurplus > 0 ? '+' : ''}{citySurplus.toLocaleString()}
                    </TableCell>
                    <TableCell>{healthBadge(c.health)}</TableCell>
                  </TableRow>
                );
              }),
            ];
          })}
        </Table>
      </Card>
    </div>
  );
}