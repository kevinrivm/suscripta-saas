'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reschedulePaymentDate } from '@/app/actions/customers';

interface Props {
    customerId: string;
    currentDate: string | null;
    anchorDay: number | null;
}

function formatDisplayDate(dateStr: string | null): string {
    if (!dateStr) return 'Sin fecha';
    try {
        const d = new Date(dateStr + 'T12:00:00');
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export default function RescheduleDateModal({ customerId, currentDate, anchorDay }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(
        currentDate ? String(currentDate).split('T')[0] : ''
    );
    const [mode, setMode] = useState<'extension' | 'permanent'>('extension');
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    // Cerrar al clicar fuera
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const handleSave = () => {
        if (!selectedDate) { setError('Selecciona una fecha antes de confirmar.'); return; }
        setError('');
        startTransition(async () => {
            const res = await reschedulePaymentDate(customerId, selectedDate, mode);
            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                setError(res.error || 'Error al guardar.');
            }
        });
    };

    const newDay = selectedDate ? new Date(selectedDate + 'T12:00:00').getDate() : null;

    return (
        <div className="relative flex items-center px-4 py-3">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`group flex items-center gap-2 text-xs font-medium transition-all rounded-lg px-2 py-1.5 border ${
                    currentDate
                        ? 'text-zinc-300 border-white/10 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5'
                        : 'text-zinc-600 border-dashed border-white/10 hover:border-emerald-500/30 hover:text-emerald-500'
                }`}
                title="Clic para reprogramar fecha de cobro"
            >
                <svg className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{currentDate ? formatDisplayDate(currentDate) : 'Asignar fecha'}</span>
                {anchorDay && (
                    <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 font-bold">
                        DÍA {anchorDay}
                    </span>
                )}
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        ref={modalRef}
                        className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-[0_30px_80px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-300"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Reprogramar Fecha de Cobro</h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Fecha actual: <span className="text-zinc-300">{formatDisplayDate(currentDate)}</span>
                                    {anchorDay && <> · Ancla: día <span className="text-emerald-400 font-bold">{anchorDay}</span></>}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-zinc-600 hover:text-white transition-colors p-1"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Date Picker */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
                                Nueva Fecha
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => { setSelectedDate(e.target.value); setError(''); }}
                                className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all"
                                style={{ colorScheme: 'dark' }}
                            />
                        </div>

                        {/* Mode Radio */}
                        <div className="mb-6 space-y-3">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Tipo de Cambio</label>

                            <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${mode === 'extension' ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-white/8 hover:border-white/15'}`}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="extension"
                                    checked={mode === 'extension'}
                                    onChange={() => setMode('extension')}
                                    className="mt-0.5 accent-emerald-500"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-white">Prórroga Única</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                                        Solo mueve esta fecha. El próximo ciclo regresa a la fecha original{anchorDay ? ` (día ${anchorDay})` : ''}.
                                    </p>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${mode === 'permanent' ? 'border-purple-500/40 bg-purple-500/8' : 'border-white/8 hover:border-white/15'}`}>
                                <input
                                    type="radio"
                                    name="mode"
                                    value="permanent"
                                    checked={mode === 'permanent'}
                                    onChange={() => setMode('permanent')}
                                    className="mt-0.5 accent-purple-500"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-white">Cambio Permanente</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                                        Establece el nuevo día de corte fijo.
                                        {newDay && mode === 'permanent' && (
                                            <span className="ml-1 text-purple-400 font-semibold">El día <strong>{newDay}</strong> será el nuevo ancla mensual.</span>
                                        )}
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-4">{error}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 rounded-full text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending || !selectedDate}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                    mode === 'permanent'
                                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                                        : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                                }`}
                            >
                                {isPending ? 'Guardando...' : mode === 'permanent' ? 'Fijar Ancla y Guardar' : 'Aplicar Prórroga'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
