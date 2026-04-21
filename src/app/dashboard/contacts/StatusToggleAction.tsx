'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleCustomerActiveStatus } from '@/app/actions/customers';

export default function StatusToggleAction({ customerId, isActive, isDeleted }: { customerId: string; isActive: boolean; isDeleted: boolean }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (isDeleted) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500/60 border border-red-500/20 italic">
                Archivado
            </span>
        );
    }

    return (
        <div className="flex items-center justify-center px-4 py-4">
            <button
                onClick={() => {
                    startTransition(async () => {
                        await toggleCustomerActiveStatus(customerId, !isActive);
                        router.refresh();
                    });
                }}
                disabled={isPending}
                title={isActive ? 'Clic para pausar' : 'Clic para activar'}
                className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isPending
                        ? 'opacity-50 cursor-wait'
                        : isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                {isActive ? 'Activo' : 'Pausado'}
            </button>
        </div>
    );
}
