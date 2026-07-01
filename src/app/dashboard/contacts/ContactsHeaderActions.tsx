// src/app/dashboard/contacts/ContactsHeaderActions.tsx
'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parsePhoneNumber, type CountryCode } from 'libphonenumber-js';
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

const COMMON_COUNTRIES: { code: CountryCode, label: string, placeholder: string }[] = [
    { code: 'MX', label: 'México (+52)', placeholder: '55 5123 4567' },
    { code: 'US', label: 'Estados Unidos (+1)', placeholder: '555 123 4567' },
    { code: 'CO', label: 'Colombia (+57)', placeholder: '300 123 4567' },
    { code: 'ES', label: 'España (+34)', placeholder: '612 34 56 78' },
    { code: 'CL', label: 'Chile (+56)', placeholder: '9 1234 5678' },
    { code: 'AR', label: 'Argentina (+54)', placeholder: '11 2345 6789' },
    { code: 'PE', label: 'Perú (+51)', placeholder: '912 345 678' },
];

const BILLING_CYCLES = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quincenal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'bimonthly', label: 'Bimestral' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'biannual', label: 'Semestral' },
    { value: 'annual', label: 'Anual' },
];

function getBrowserCountry(): CountryCode {
    const localeRegion = navigator.language.split('-')[1]?.toUpperCase();
    const supported = COMMON_COUNTRIES.find((country) => country.code === localeRegion);

    return supported?.code ?? 'MX';
}

export default function ContactsHeaderActions({ currentTab, rawData }: { currentTab: string, rawData: ContactExportRow[] }) {
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [mPhone, setMPhone] = useState('');
    const [mCountry, setMCountry] = useState<CountryCode>('MX');
    const [mName, setMName] = useState('');
    const [mLast1, setMLast1] = useState('');
    const [mLast2, setMLast2] = useState('');
    const [mCycle, setMCycle] = useState('monthly');
    const [mNextPaymentDate, setMNextPaymentDate] = useState('');
    const [mPaymentDay, setMPaymentDay] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMCountry(getBrowserCountry());
    }, []);

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
        setFormError(null);

        if (!mPhone.trim() || !mName.trim() || !mCycle) {
            setFormError('Teléfono, Nombre(s) y Frecuencia de pago son obligatorios.');
            return;
        }

        if (!mNextPaymentDate && !mPaymentDay.trim()) {
            setFormError('Agrega Fecha de próximo pago o Día de pago para automatizar recordatorios.');
            return;
        }

        if (mPaymentDay.trim()) {
            const paymentDay = Number(mPaymentDay);
            const maxPaymentDay = mCycle === 'weekly' || mCycle === 'biweekly' ? 7 : 31;
            if (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > maxPaymentDay) {
                setFormError(mCycle === 'weekly' || mCycle === 'biweekly'
                    ? 'Para frecuencia semanal o quincenal, Día de pago debe estar entre 1 y 7.'
                    : 'Día de pago debe estar entre 1 y 31.');
                return;
            }
        }

        let formattedPhone = '';
        try {
            const phone = parsePhoneNumber(mPhone.trim(), mCountry);
            if (!phone?.isValid()) {
                setFormError('Ingresa un teléfono móvil válido para el país seleccionado.');
                return;
            }
            formattedPhone = phone.format('E.164');
        } catch {
            setFormError('Ingresa un teléfono móvil válido para el país seleccionado.');
            return;
        }

        setIsSubmitting(true);
        const res = await addManualCustomer({
            phoneNumber: formattedPhone,
            firstName: mName.trim(),
            lastName1: mLast1.trim(),
            lastName2: mLast2.trim(),
            billingCycle: mCycle,
            nextPaymentDate: mNextPaymentDate || null,
            paymentDay: mPaymentDay.trim() || null
        });
        setIsSubmitting(false);
        if (res.ok) {
            setIsModalOpen(false);
            setMPhone('');
            setMName('');
            setMLast1('');
            setMLast2('');
            setMCycle('monthly');
            setMNextPaymentDate('');
            setMPaymentDay('');
            setFormError(null);
            router.refresh();
        } else {
            setFormError(res.error || 'No se pudo guardar el cliente.');
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
                    <div className="bg-[#0b0b0d] border border-white/10 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white bg-white/5 rounded-full p-2">x</button>
                        <h3 className="text-xl font-bold text-white mb-6">Nuevo Contacto (1-1)</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs text-emerald-400 font-medium ml-1">Teléfono Móvil *</label>
                                <div className="mt-1 grid grid-cols-[150px_1fr] gap-2">
                                    <select
                                        value={mCountry}
                                        onChange={e => setMCountry(e.target.value as CountryCode)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors cursor-pointer"
                                    >
                                        {COMMON_COUNTRIES.map((country) => (
                                            <option key={country.code} value={country.code}>{country.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        required
                                        type="tel"
                                        value={mPhone}
                                        onChange={e => setMPhone(e.target.value)}
                                        placeholder={COMMON_COUNTRIES.find(country => country.code === mCountry)?.placeholder ?? '55 5123 4567'}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 font-medium ml-1">Nombre(s) *</label>
                                <input required type="text" value={mName} onChange={e=>setMName(e.target.value)} placeholder="Ej. Ana" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Apellido paterno</label>
                                    <input type="text" value={mLast1} onChange={e=>setMLast1(e.target.value)} placeholder="Ej. López" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Apellido materno</label>
                                    <input type="text" value={mLast2} onChange={e=>setMLast2(e.target.value)} placeholder="Ej. García" className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 font-medium ml-1">Frecuencia de pago *</label>
                                <select required value={mCycle} onChange={e=>setMCycle(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors cursor-pointer appearance-none">
                                    {BILLING_CYCLES.map((cycle) => (
                                        <option key={cycle.value} value={cycle.value}>{cycle.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Fecha de próximo pago</label>
                                    <input type="date" value={mNextPaymentDate} onChange={e=>setMNextPaymentDate(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" style={{ colorScheme: 'dark' }} />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Día de pago</label>
                                    <input type="number" min={1} max={mCycle === 'weekly' || mCycle === 'biweekly' ? 7 : 31} value={mPaymentDay} onChange={e=>setMPaymentDay(e.target.value)} placeholder={mCycle === 'weekly' || mCycle === 'biweekly' ? '1-7' : '1-31'} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none text-white transition-colors" />
                                </div>
                            </div>
                            <p className="text-xs leading-5 text-zinc-500">
                                Para automatizar recordatorios, agrega Fecha de próximo pago o Día de pago. En semanal/quincenal, el día usa 1-7.
                            </p>
                            {formError && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                                    {formError}
                                </div>
                            )}
                            <div className="pt-4">
                                <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    {isSubmitting ? 'Guardando...' : 'Agregar cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
