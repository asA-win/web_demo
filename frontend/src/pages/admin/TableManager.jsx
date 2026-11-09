import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, MapPin, Grid, RefreshCw, X } from 'lucide-react';
import { tableService } from '../../services/api';
import { useToast } from '../../components/Toast';

export const TableManager = () => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Form Fields
  const [tableNumber, setTableNumber] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [minimumGuests, setMinimumGuests] = useState(1);
  const [location, setLocation] = useState('Burj View Terrace');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const data = await tableService.getTables();
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
      addToast('Error loading restaurant tables.', 'error', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const openAddModal = () => {
    setEditingTable(null);
    setTableNumber('');
    setName('');
    setCapacity(4);
    setMinimumGuests(1);
    setLocation('Burj View Terrace');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (tbl) => {
    setEditingTable(tbl);
    setTableNumber(tbl.table_number);
    setName(tbl.name);
    setCapacity(tbl.capacity);
    setMinimumGuests(tbl.minimum_guests);
    setLocation(tbl.location);
    setIsActive(tbl.is_active);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim() || !name.trim() || capacity < 1) {
      addToast('Please complete all table requirements.', 'warning', 'Missing Fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        table_number: tableNumber.trim().toUpperCase(),
        name: name.trim(),
        capacity: parseInt(capacity, 10),
        minimum_guests: parseInt(minimumGuests, 10) || 1,
        location: location.trim(),
        is_active: isActive,
      };

      if (editingTable) {
        await tableService.updateTable(editingTable.id, payload);
        addToast(`Table ${payload.table_number} updated.`, 'success', 'Table Updated');
      } else {
        await tableService.createTable(payload);
        addToast(`Table ${payload.table_number} created.`, 'success', 'Table Added');
      }

      setShowModal(false);
      fetchTables();
    } catch (err) {
      console.error('Save table failed:', err);
      const detail = err.response?.data?.detail || 'Failed to save table.';
      addToast(detail, 'error', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, tableNum) => {
    if (!window.confirm(`Are you sure you want to delete table ${tableNum}?`)) return;
    try {
      await tableService.deleteTable(id);
      addToast(`Table ${tableNum} removed.`, 'info', 'Table Removed');
      fetchTables();
    } catch (err) {
      console.error('Delete table failed:', err);
      addToast('Failed to delete table.', 'error', 'Error');
    }
  };

  // Group tables by location
  const locations = ['Burj View Terrace', 'Royal Majlis VIP', 'Main Dining Hall'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-wide">
            Table Capacity & Salons
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure seating allocations across the Burj View Terrace, Royal Majlis suites, and the indoor Grand Salon.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-gold text-xs font-bold py-2.5 px-5 flex items-center gap-2 uppercase tracking-wider shadow-gold-glow"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Table
        </button>
      </div>

      {/* Tables Display by Zone */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading tables...
        </div>
      ) : (
        <div className="space-y-8">
          {locations.map((loc) => {
            const locTables = tables.filter((t) => t.location === loc);
            const totalCapacity = locTables.reduce((a, t) => a + t.capacity, 0);

            return (
              <div key={loc} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gold-400/20 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gold-400" />
                    <h2 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                      {loc}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {locTables.length} Tables • Total {totalCapacity} Covers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locTables.map((tbl) => (
                    <div
                      key={tbl.id}
                      className="glass-panel p-4 rounded-xl border border-gold-400/15 flex flex-col justify-between space-y-3 group hover:border-gold-400/40 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-obsidian-900 border border-slate-700 text-gold-300 font-mono text-[11px] font-bold">
                            {tbl.table_number}
                          </span>
                          <h3 className="font-serif text-white font-bold text-sm mt-1">
                            {tbl.name}
                          </h3>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          tbl.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tbl.is_active ? 'Active' : 'Offline'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <Users className="w-3.5 h-3.5 text-gold-400" />
                          Capacity: <strong>{tbl.capacity} Guests</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(tbl)}
                            className="p-1.5 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-slate-300 hover:text-white"
                            title="Edit Table"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tbl.id, tbl.table_number)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300"
                            title="Delete Table"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-gold-400/40 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                {editingTable ? 'Edit Restaurant Table' : 'Add Restaurant Table'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Table Number / Code *
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                  placeholder="e.g. TERRACE-05 or VIP-02"
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white font-mono uppercase text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Burj Fountain Front Row 5"
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Max Capacity (Guests) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-300">
                    Min Guests Required
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={minimumGuests}
                    onChange={(e) => setMinimumGuests(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-300">
                  Dining Section / Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-obsidian-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-gold-400"
                >
                  <option value="Burj View Terrace">Burj View Terrace</option>
                  <option value="Royal Majlis VIP">Royal Majlis VIP</option>
                  <option value="Main Dining Hall">Main Dining Hall</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-gold-400 focus:ring-0"
                />
                <span className="text-slate-300">Table Active & Available for Booking</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold py-2.5 px-6 font-bold uppercase tracking-wider"
                >
                  {isSubmitting ? 'Saving...' : 'Save Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
