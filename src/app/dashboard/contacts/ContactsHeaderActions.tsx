// src/app/dashboard/contacts/ContactsHeaderActions.tsx
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addManualCustomer } from '@/app/actions/customers';

interface ContactExportRow {
    id?: string | number | null;
    phone_number?: string | null;
    first_name?: string | null;
    last_name_1?: string | null;
    last_name_2?: string | null;
    billing_cycle?: string | null;
    payment_status?: string | null;
    is_active?: boolean | null;
    deleted_at?: string | null;
}

export default function ContactsHeaderActions({ currentTab, rawData }: { currentTab: string, rawData: ContactExportRow[] }) {
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [mPhone, setMPhone] = useState('');
    const [mName, setMName] = useState('');
    const [mLast, setMLast] = useState('');
    const [mCycle, setMCycle] = useState('monthly');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleExport = () => {
        setIsExporting(true);
        try {
            if (rawData.length === 0) return alert('No hay datos en esta pestaña para exportar.');
            const csvRows = [];
            csvRows.push(['ID', 'Telefono', 'First Name', 'Last Name 1', 'Last Name 2', 'Ciclo', 'Status Pago', 'Activo', 'Archivado'].join(','));
            for (const r of rawData) {
                const vals = [r.id, r.phone_number, r.first_name, r.last_name_1, r.last_name_2, r.billing_cycle, r.payment_status, r.is_active, !!r.deleted_at];
                csvRows.push(vals.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
            }
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clientes_suscripta_${currentTab}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } finally {
            setIsExporting(false);
        }
    };

    const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await addManualCustomer({ phoneNumber: mPhone, firstName: mName, lastName1: mLast, billingCycle: mCycle });
        setIsSubmitting(false);
        if (res.ok) {
            setIsModalOpen(false);
            setMPhone(''); setMName(''); setMLast('');
            router.refresh();
        } else {
            alert('Error al guardar: ' + res.error);
        }
    };

    return (
        <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111] p-4 rounded-[20px] border border-white/5 shadow-xl">
                
                {/* TABS */}
                <div className="flex gap-2 p-1.5 rounded-full border border-white/5 bg-black/40 overflow-x-auto w-full md:w-auto">
                    {['activos', 'pausados', 'papelera'].map(t => (
                        <Link 
                            key={t} 
                            href={`?tab=${t}`} 
                            className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all whitespace-nowrap ${currentTab === t ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {t}
                        </Link>
                    ))}
                </div>

                <div className="flex w-full md:w-auto items-center justify-end gap-3 mt-4 md:mt-0">
                    <button 
                        onClick={handleExport} 
                        disabled={isExporting} 
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold text-white transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Exportar a CSV
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] focus:outline-none"
                    >
                        + Añadir Cliente
                    </button>
                </div>
            </div>

            {/* Modal Añadir Manual */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0b0b0d] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-white/5 rounded-full p-2">✕</button>
                        <h3 className="text-xl font-bold text-white mb-6">Nuevo Contacto (1-1)</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-emerald-400 font-medium ml-1">Teléfono Móvil *</label>
                                <input required type="text" value={mPhone} onChange={e=>setMPhone(e.target.value)} placeholder="+52 555 123 4567" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 font-medium ml-1">Nombre (First Name) *</label>
                                <input required type="text" value={mName} onChange={e=>setMName(e.target.value)} placeholder="Ej. Ana" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 font-medium ml-1">Apellidos (Opcional)</label>
                                <input type="text" value={mLast} onChange={e=>setMLast(e.target.value)} placeholder="Ej. López" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 font-medium ml-1">Ciclo de Facturación Preferido</label>
                                <select value={mCycle} onChange={e=>setMCycle(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors cursor-pointer appearance-none">
                                    <option value="weekly">Semanal</option>
                                    <option value="biweekly">Quincenal</option>
                                    <option value="monthly">Mensual</option>
                                    <option value="annual">Anual</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    {isSubmitting ? 'Guardando...' : 'Insertar a BD Local'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
