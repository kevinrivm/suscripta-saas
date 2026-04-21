'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { softDeleteCustomer } from '@/app/actions/customers';

export default function DeleteAction({ customerId, isDeleted }: { customerId: string; isDeleted: boolean }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (isDeleted) return null;

    return (
        <div className="flex items-center justify-center px-4 py-4">
            <button
                onClick={() => {
                    if (confirm('¿Mover este cliente a la papelera? Quedará oculto y no recibirá más notificaciones.')) {
                        startTransition(async () => {
                            await softDeleteCustomer(customerId);
                            router.refresh();
                        });
                    }
                }}
                disabled={isPending}
                title="Mover a papelera"
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
}
