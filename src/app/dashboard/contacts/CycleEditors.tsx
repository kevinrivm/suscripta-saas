'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerCycle } from '@/app/actions/customers';

// Mapa EXHAUSTIVO de variantes conocidas → clave canónica en inglés.
// Si el valor de la BD no está aquí, normalizeCycle() devuelve '' (vacío)
// para que el usuario sea obligado a seleccionar manualmente.
const CYCLE_NORMALIZE: Record<string, string> = {
    // Español - variantes comunes
    semanal: 'weekly',
    quincenal: 'biweekly',
    'cada 15 días': 'biweekly',
    '15 días': 'biweekly',
    mensual: 'monthly',
    'cada mes': 'monthly',
    bimestral: 'bimonthly',
    'cada 2 meses': 'bimonthly',
    trimestral: 'quarterly',
    'cada 3 meses': 'quarterly',
    semestral: 'biannual',
    'cada 6 meses': 'biannual',
    anual: 'annual',
    'al año': 'annual',
    'cada año': 'annual',
    // Inglés - claves canónicas
    weekly: 'weekly',
    biweekly: 'biweekly',
    monthly: 'monthly',
    bimonthly: 'bimonthly',
    quarterly: 'quarterly',
    biannual: 'biannual',
    annual: 'annual',
};

// Si no hay coincidencia, devuelve '' para forzar selección manual
function normalizeCycle(raw: string | null | undefined): string {
    if (!raw || raw.trim() === '') return '';
    return CYCLE_NORMALIZE[raw.toLowerCase().trim()] ?? '';
}

interface Props {
    customerId: string;
    billingCycle: string;
    nextPaymentDate: string | null;
}

// Componente de selector de Ciclo (Frecuencia)
export function CycleSelector({ customerId, billingCycle, nextPaymentDate }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [cycle, setCycle] = useState(() => normalizeCycle(billingCycle));
    const dateVal = nextPaymentDate ? String(nextPaymentDate).split('T')[0] : '';

    const handleSave = (newCycle: string) => {
        if (!newCycle) return; // No guardar si está vacío
        startTransition(async () => {
            const res = await updateCustomerCycle(customerId, newCycle, dateVal || null);
            if (res.ok) router.refresh();
        });
    };

    const needsReview = !cycle; // true si el valor de la BD era desconocido

    return (
        <div className="relative flex items-center gap-2 px-4 py-3">
            <select
                value={cycle}
                onChange={(e) => { setCycle(e.target.value); handleSave(e.target.value); }}
                disabled={isPending}
                className={`bg-black/30 border rounded-lg px-2 py-1 text-xs focus:outline-none disabled:opacity-50 cursor-pointer transition-colors ${
                    needsReview
                        ? 'border-yellow-500/60 text-yellow-400 focus:border-yellow-400'
                        : 'border-white/10 text-zinc-300 focus:border-emerald-500'
                }`}
            >
                {/* Opción placeholder visible solo cuando el valor es desconocido */}
                {needsReview && (
                    <option value="" disabled>⚠ Selecciona…</option>
                )}
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="bimonthly">Bimestral</option>
                <option value="quarterly">Trimestral</option>
                <option value="biannual">Semestral</option>
                <option value="annual">Anual</option>
            </select>
            {isPending && (
                <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
        </div>
    );
}

// Componente de selector de Fecha de Pago
export function DateSelector({ customerId, billingCycle, nextPaymentDate }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [date, setDate] = useState(nextPaymentDate ? String(nextPaymentDate).split('T')[0] : '');

    const handleSave = (newDate: string) => {
        startTransition(async () => {
            const normalizedCycle = normalizeCycle(billingCycle) || billingCycle || 'monthly';
            const res = await updateCustomerCycle(customerId, normalizedCycle, newDate || null);
            if (res.ok) router.refresh();
        });
    };

    return (
        <div className="relative flex items-center px-4 py-3">
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={(e) => {
                    const newDate = e.target.value;
                    if (newDate !== (nextPaymentDate ? String(nextPaymentDate).split('T')[0] : '')) {
                        handleSave(newDate);
                    }
                }}
                disabled={isPending}
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-400 focus:border-emerald-500 focus:outline-none focus:text-white disabled:opacity-50 cursor-pointer"
                style={{ colorScheme: 'dark' }}
                title="Fecha del próximo cobro"
            />
            {isPending && (
                <div className="ml-2 w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            )}
        </div>
    );
}
