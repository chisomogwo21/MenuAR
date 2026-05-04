import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import { Plus, Download, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../context/AppContext';
import { fetchTables, updateTable } from '../../services/db';
import type { Table } from '../../types';

const Tables: React.FC = () => {
  const { restaurant } = useAppContext();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurant) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTables(restaurant.id);
        if (!cancelled) {
          setTables(data);
        }
      } catch (error) {
        console.error('Tables: Failed to load data', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => { cancelled = true; };
  }, [restaurant]);

  const activeCount = tables.filter(t => t.status === 'active').length;
  const inactiveCount = tables.filter(t => t.status === 'inactive').length;

  const toggleTable = async (table: Table) => {
    const newStatus = table.status === 'active' ? 'inactive' : 'active';
    
    // Optimistic update
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: newStatus } : t));
    
    const success = await updateTable(table.id, { status: newStatus });
    if (!success) {
      // Revert
      setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: table.status } : t));
      alert('Failed to update table status');
    }
  };

  const handleDownload = (table: Table, qrUrl: string) => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-Table-${table.table_number}.png`;
    link.click();
  };

  const getQrUrl = (table: Table) => {
    const baseUrl = window.location.origin;
    const menuUrl = `${baseUrl}/${restaurant?.slug}/menu?table=${table.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(menuUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#FAFAF8] flex items-center justify-between px-6 h-16 border-b border-[#E8E8E4] shadow-sm">
          <h1 className="text-xl font-headline font-bold text-primary">Tables & QR Codes</h1>
          <Button className="gap-2 h-10 px-4 text-sm font-bold shadow-sm">
            <Plus size={18} />
            Add table
          </Button>
        </header>

        <div className="px-6 py-8 max-w-7xl mx-auto">
          {/* Summary Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-primary mb-1">Generate Guest Access</h2>
              <p className="text-sm text-[#707971]">Manage table availability and generate unique dining QR codes.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider border border-primary/10">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                {activeCount} Active
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-surface-container text-[#707971] rounded-full text-[10px] font-bold uppercase tracking-wider border border-surface-container">
                <span className="w-2 h-2 bg-[#707971] rounded-full" />
                {inactiveCount} Inactive
              </span>
            </div>
          </div>

          {/* QR Code Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-20 text-[#707971]">
              <p className="font-bold">No tables found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tables.map((table) => {
                const qrUrl = getQrUrl(table);
                const isActive = table.status === 'active';
                return (
                  <div
                    key={table.id}
                    className="bg-white rounded-2xl border border-[#E8E8E4] p-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    {/* QR Image Area */}
                    <div className={`relative aspect-square mb-4 bg-background rounded-xl overflow-hidden flex items-center justify-center p-4 ${!isActive ? 'grayscale opacity-60' : ''}`}>
                      {/* Active/Inactive Indicator */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-full shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-[#707971]'}`} />
                        <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-primary' : 'text-[#707971]'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* QR Code — generated via free API */}
                      <img
                        src={qrUrl}
                        alt={`QR for Table ${table.table_number}`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform mix-blend-multiply"
                      />
                    </div>

                    {/* Card Footer */}
                    <div className="text-center">
                      <h3 className="text-sm font-headline font-bold text-[#191C19] mb-1">Table {table.table_number}</h3>
                      <p className="text-[10px] text-[#707971] uppercase tracking-widest mb-4">Capacity: {table.capacity}</p>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleDownload(table, qrUrl)}
                          className="w-full flex items-center justify-center gap-2 border border-primary text-primary px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95 transition-all"
                        >
                          <Download size={14} />
                          Download PNG
                        </button>
                        <button
                          onClick={() => toggleTable(table)}
                          className={`w-full py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            isActive
                              ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                              : 'bg-primary/5 text-primary hover:bg-primary/10 border border-primary/10'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tables;
