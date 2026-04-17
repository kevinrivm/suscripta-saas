'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerCycle } from '@/app/actions/customers';

interface Props {
    customerId: string;
    billingCycle: string;
    nextPaymentDate: string | null;
}

export default function InlineCycleEditor({ customerId, billingCycle, nextPaymentDate }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [cycle, setCycle] = useState(billingCycle || 'monthly');
    const [date, setDate] = useState(nextPaymentDate ? String(nextPaymentDate).split('T')[0] : '');

    const handleSave = (newCycle: string, newDate: string) => {
        startTransition(async () => {
            const dateToSend = newDate.trim() === '' ? null : newDate;
            const res = await updateCustomerCycle(customerId, newCycle, dateToSend);
            if (res.ok) {
                router.refresh();
            } else {
                alert("Error al guardar ciclo: " + res.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-2 relative w-32">
            <select
                value={cycle}
                onChange={(e) => {
                    setCycle(e.target.value);
                    handleSave(e.target.value, date);
                }}
                disabled={isPending}
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:border-emerald-500 focus:outline-none disabled:opacity-50 cursor-pointer"
            >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="biannual">Semestral</option>
                <option value="annual">Anual</option>
            </select>
            
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={(e) => {
                    if (e.target.value !== (nextPaymentDate ? String(nextPaymentDate).split('T')[0] : '')) {
                        handleSave(cycle, e.target.value);
                    }
                }}
                disabled={isPending}
                className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-zinc-400 focus:border-emerald-500 focus:outline-none focus:text-white disabled:opacity-50 appearance-none w-full cursor-pointer"
                style={{ colorScheme: 'dark' }}
                title="Fecha exacto del próximo cobro"
            />
            
            {isPending && (
                 <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            )}
        </div>
    );
}
