'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerPaymentStatus } from '@/app/actions/customers';

type PaymentStatus = 'pending' | 'paid' | 'cancelled';

interface Props {
    customerId: string;
    currentStatus: PaymentStatus;
    isOverdue: boolean;
    isDisabled?: boolean;
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
    pending: 'border-zinc-700 bg-black/30 text-zinc-300 focus:border-emerald-500',
    paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 focus:border-emerald-400',
    cancelled: 'border-zinc-600 bg-zinc-900/70 text-zinc-500 focus:border-zinc-500',
};

export default function PaymentStatusSelector({ customerId, currentStatus, isOverdue, isDisabled }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleChange = (nextStatus: PaymentStatus) => {
        if (nextStatus === currentStatus) return;
        startTransition(async () => {
            const res = await updateCustomerPaymentStatus(customerId, nextStatus);
            if (res.ok) {
                router.refresh();
            } else {
                alert('Error al actualizar pago: ' + res.error);
            }
        });
    };

    return (
        <div className="flex flex-col items-center gap-1.5">
            <select
                value={currentStatus}
                onChange={(event) => handleChange(event.target.value as PaymentStatus)}
                disabled={isPending || isDisabled}
                title={isDisabled ? 'Archivado' : 'Actualizar estado de pago'}
                className={`w-28 rounded-xl border px-2 py-1.5 text-xs font-semibold outline-none transition disabled:cursor-not-allowed disabled:opacity-50 ${STATUS_STYLES[currentStatus]}`}
            >
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="cancelled">Cancelado</option>
            </select>
            {isOverdue && (
                <span className="rounded-full border border-red-500/20 bg-red-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-300/80">
                    Vencido
                </span>
            )}
        </div>
    );
}
