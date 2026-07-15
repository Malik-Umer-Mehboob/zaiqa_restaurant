'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';

interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTables = useCallback(async () => {
    try {
      const res = await api.get('/tables');
      if (res.data.success) {
        setTables(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchTables(), 0);
    return () => clearTimeout(timer);
  }, [fetchTables]);

  const openModal = (table?: RestaurantTable | null) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        tableNumber: table.tableNumber.toString(),
        capacity: table.capacity.toString()
      });
    } else {
      setEditingTable(null);
      setFormData({
        tableNumber: '',
        capacity: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({ tableNumber: '', capacity: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        tableNumber: parseInt(formData.tableNumber),
        capacity: parseInt(formData.capacity)
      };

      if (editingTable) {
        await api.put(`/tables/${editingTable.id}`, data);
        toast.success("Table updated successfully!");
      } else {
        await api.post(`/tables`, data);
        toast.success("Table added successfully!");
      }
      
      closeModal();
      fetchTables();
    } catch (err: unknown) {
      console.error(err);
      let message = 'Failed to save table';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await api.delete(`/tables/${id}`);
        toast.success('Table deleted successfully');
        fetchTables();
      } catch (err: unknown) {
        console.error(err);
        let message = 'Failed to delete table';
        if (err instanceof AxiosError) {
          message = err.response?.data?.message || message;
        }
        toast.error(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-turmeric border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-basmati text-ink">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Manage Tables</h1>
            <p className="text-bottle/80">Add and manage restaurant seating capacity</p>
          </div>
          
          <button
            onClick={() => openModal()}
            className="px-6 py-3.5 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-turmeric/90 hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Add Table
          </button>
        </div>

        {/* Content */}
        {tables.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-bottle/10">
            <div className="w-16 h-16 bg-turmeric/20 text-turmeric rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No tables yet</h3>
            <p className="text-bottle/60 max-w-md mx-auto">
              Add your first table to enable reservations for customers.
            </p>
            <button
              onClick={() => openModal()}
              className="mt-6 px-6 py-3 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-turmeric/90 transition-all inline-block cursor-pointer"
            >
              Add First Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-white rounded-2xl p-6 shadow-sm border border-bottle/10 hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-turmeric opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1">Table {table.tableNumber}</h3>
                    <div className="flex items-center gap-1.5 text-bottle/70 text-sm font-medium bg-basmati px-2.5 py-1 rounded-md inline-flex">
                      <Users size={14} />
                      Seats up to {table.capacity}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(table)}
                      className="p-2 text-bottle/50 hover:text-turmeric transition-colors bg-white hover:bg-basmati rounded-lg cursor-pointer"
                      title="Edit Table"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="p-2 text-bottle/50 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete Table"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
          <div className="bg-basmati rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-bottle/10 bg-white">
              <h2 className="text-2xl font-serif font-bold text-ink">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <p className="text-bottle/60 text-sm mt-1">
                {editingTable ? 'Update table seating capacity or number.' : 'Enter table details to enable reservations.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white/50">
              <div>
                <label className="block text-sm font-bold text-ink mb-1.5 uppercase tracking-wide">
                  Table Number
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.tableNumber}
                  onChange={e => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-bottle/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-turmeric focus:border-transparent transition-all text-ink font-medium"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5 uppercase tracking-wide">
                  Capacity (Seats)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-bottle/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-turmeric focus:border-transparent transition-all text-ink font-medium"
                  placeholder="e.g. 4"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 bg-bottle/10 text-bottle font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-bottle/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3.5 bg-turmeric text-ink font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-turmeric/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingTable ? 'Update' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
