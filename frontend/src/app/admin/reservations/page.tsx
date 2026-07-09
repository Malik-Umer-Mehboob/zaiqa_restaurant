'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Calendar, Clock, Users, Hash, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Reservation {
  id: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
  user: { name: string; phone?: string };
  table: { tableNumber: number; capacity: number };
}

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Completed', value: 'COMPLETED' },
];

const statusBadge = (status: ReservationStatus) => {
  const config: Record<ReservationStatus, { label: string; classes: string }> = {
    PENDING:   { label: 'Pending',   classes: 'bg-turmeric/15 text-turmeric border-turmeric/30' },
    CONFIRMED: { label: 'Confirmed', classes: 'bg-bottle/10  text-bottle  border-bottle/25'  },
    CANCELLED: { label: 'Cancelled', classes: 'bg-chili/10   text-chili   border-chili/30'   },
    COMPLETED: { label: 'Completed', classes: 'bg-ink/5      text-ink/60  border-ink/10'     },
  };
  const { label, classes } = config[status] ?? { label: status, classes: '' };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${classes}`}>
      {label}
    </span>
  );
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/reservations');
      if (res.data.success) {
        setReservations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: ReservationStatus) => {
    setUpdatingId(id);
    try {
      // Optimistic UI update
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      );
      await api.patch(`/reservations/${id}/status`, { status: newStatus });
      toast.success("Reservation status updated successfully!");
    } catch (err) {
      console.error('Failed to update reservation status', err);
      toast.error("Failed to update reservation status");
      fetchReservations(); // revert on failure
    } finally {
      setUpdatingId(null);
    }
  };

  // Client-side filter by tab
  const filtered = activeTab === 'ALL'
    ? reservations
    : reservations.filter(r => r.status === activeTab);

  return (
    <div className="p-4 sm:p-8 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-bottle">Reservations</h1>
        <p className="text-ink/60 mt-2 font-medium">View and manage all restaurant table reservations.</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab.value
                ? 'bg-ink text-basmati shadow-md'
                : 'bg-basmati text-ink border border-bottle/10 hover:bg-bottle/5'
            }`}
          >
            {tab.label}
            {tab.value !== 'ALL' && (
              <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-bottle/10 text-bottle'
              }`}>
                {reservations.filter(r => r.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-turmeric" />
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24 bg-basmati/40 rounded-3xl border border-bottle/5">
          <Calendar size={56} className="mx-auto text-bottle/20 mb-4" />
          <p className="text-2xl font-serif font-bold text-ink/40 mb-2">No reservations yet</p>
          <p className="text-sm text-ink/40 font-medium">
            {activeTab === 'ALL' ? 'New reservations will appear here.' : `No ${activeTab.toLowerCase()} reservations at the moment.`}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-basmati rounded-2xl shadow-sm border border-bottle/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-basmati/40 text-ink/70 uppercase text-xs tracking-widest border-b-2 border-bottle/10">
                    <th className="p-5 font-bold">Customer</th>
                    <th className="p-5 font-bold">Date</th>
                    <th className="p-5 font-bold">Time</th>
                    <th className="p-5 font-bold">Guests</th>
                    <th className="p-5 font-bold">Table</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bottle/5">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-basmati/30 transition-colors">
                      {/* Customer */}
                      <td className="p-5">
                        <p className="font-bold text-ink">{r.user?.name || '—'}</p>
                        {r.user?.phone && (
                          <p className="text-xs text-ink/50 font-medium mt-0.5">{r.user.phone}</p>
                        )}
                      </td>
                      {/* Date */}
                      <td className="p-5 font-semibold text-ink/80 whitespace-nowrap">
                        {formatDate(r.date)}
                      </td>
                      {/* Time */}
                      <td className="p-5 font-semibold text-ink/80 whitespace-nowrap">{r.time}</td>
                      {/* Guests */}
                      <td className="p-5">
                        <span className="flex items-center gap-1.5 font-semibold text-ink/80">
                          <Users size={14} className="text-bottle/50" />
                          {r.guests}
                        </span>
                      </td>
                      {/* Table */}
                      <td className="p-5">
                        <span className="bg-bottle/5 text-bottle font-bold px-3 py-1 rounded-lg text-sm border border-bottle/10">
                          Table #{r.table?.tableNumber}
                        </span>
                      </td>
                      {/* Status Badge */}
                      <td className="p-5">{statusBadge(r.status)}</td>
                      {/* Action Buttons */}
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'PENDING' && (
                            <button
                              onClick={() => handleStatusUpdate(r.id, 'CONFIRMED')}
                              disabled={updatingId === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-bottle/10 text-bottle hover:bg-bottle hover:text-basmati text-xs font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                              Confirm
                            </button>
                          )}
                          {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleStatusUpdate(r.id, 'CANCELLED')}
                              disabled={updatingId === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-chili/10 text-chili hover:bg-chili hover:text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <XCircle size={14} />
                              Cancel
                            </button>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleStatusUpdate(r.id, 'COMPLETED')}
                              disabled={updatingId === r.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink/5 text-ink/60 hover:bg-ink hover:text-basmati text-xs font-bold rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <CheckCircle size={14} />
                              Complete
                            </button>
                          )}
                          {(r.status === 'CANCELLED' || r.status === 'COMPLETED') && (
                            <span className="text-xs font-medium text-ink/30 italic pr-2">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card Stack */}
          <div className="md:hidden space-y-4">
            {filtered.map(r => (
              <div key={r.id} className="bg-basmati rounded-2xl shadow-sm border border-bottle/10 p-5 space-y-4">
                {/* Top row: customer + status */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-bold text-ink text-lg leading-tight">{r.user?.name || '—'}</p>
                    {r.user?.phone && (
                      <p className="text-xs text-ink/50 font-medium mt-0.5">{r.user.phone}</p>
                    )}
                  </div>
                  {statusBadge(r.status)}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-ink/70">
                    <Calendar size={14} className="text-bottle/50 shrink-0" />
                    <span className="font-semibold">{formatDate(r.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink/70">
                    <Clock size={14} className="text-bottle/50 shrink-0" />
                    <span className="font-semibold">{r.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink/70">
                    <Users size={14} className="text-bottle/50 shrink-0" />
                    <span className="font-semibold">{r.guests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink/70">
                    <Hash size={14} className="text-bottle/50 shrink-0" />
                    <span className="font-semibold">Table {r.table?.tableNumber}</span>
                  </div>
                </div>

                {/* Action buttons */}
                {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                  <div className="flex gap-2 pt-2 border-t border-bottle/5">
                    {r.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'CONFIRMED')}
                        disabled={updatingId === r.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-bottle/10 text-bottle hover:bg-bottle hover:text-basmati text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle size={15} />
                        Confirm
                      </button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusUpdate(r.id, 'COMPLETED')}
                        disabled={updatingId === r.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-ink/5 text-ink/60 hover:bg-ink hover:text-basmati text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <CheckCircle size={15} />
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(r.id, 'CANCELLED')}
                      disabled={updatingId === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-chili/10 text-chili hover:bg-chili hover:text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <XCircle size={15} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
