import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import PaymentToggle from './PaymentToggle';
import InlineCycleEditor from './InlineCycleEditor';
import ContactsHeaderActions from './ContactsHeaderActions';
import CustomerRowActions from './CustomerRowActions';

export const dynamic = 'force-dynamic';

export default async function Contacts(props: { searchParams: Promise<{ tab?: string }> }) {
    const searchParams = await props.searchParams;
    const tab = searchParams?.tab || 'activos';

    const supabase = await createClient();
    
    // Obtenemos los clientes construyendo la query dependiente de la pestaña actual
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

    if (tab === 'activos') {
        query = query.eq('is_active', true).is('deleted_at', null);
    } else if (tab === 'pausados') {
        query = query.eq('is_active', false).is('deleted_at', null);
    } else if (tab === 'papelera') {
        query = query.not('deleted_at', 'is', null);
    }

    const { data: contacts, error } = await query;

    // Fallback error UI
    if (error) {
        return (
            <div className="p-10 w-full text-center text-red-400">
                Hubo un error cargando los contactos. {error.message}
            </div>
        );
    }

    return (
        <div className="p-10 max-w-6xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Base de Clientes</h1>
                    <p className="text-zinc-400 text-sm">Gestiona tus contactos, descarga métricas o depura tu envase para notificaciones instantáneas.</p>
                </div>
            </div>

            <ContactsHeaderActions currentTab={tab} rawData={contacts || []} />

            <div className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-1 shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden w-full">
                <div className="overflow-x-auto w-full border border-white/5 rounded-[24px]">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-[#111] text-xs uppercase font-semibold tracking-wider text-zinc-500 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-5">Nombre Completo</th>
                                <th className="px-6 py-5">Teléfono (Meta E.164)</th>
                                <th className="px-6 py-5 text-zinc-400">Ciclo / Fecha</th>
                                <th className="px-6 py-5 text-emerald-400 text-center border-l bg-emerald-500/5 border-white/5">Estado de Pago</th>
                                <th className="px-6 py-5 text-right border-l border-white/5">Acciones BD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/50">
                            {contacts && contacts.length > 0 ? (
                                contacts.map((contact) => {
                                    const nombreAgrupado = [contact.first_name, contact.last_name_1, contact.last_name_2].filter(Boolean).join(' ');
                                    const paymentStatus = contact.payment_status || 'pending';

                                    return (
                                        <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors relative group">
                                            <td className="px-6 py-4 font-medium text-white">
                                                {nombreAgrupado}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-zinc-400">
                                                {contact.phone_number}
                                            </td>
                                            <td className="px-6 py-3">
                                                <InlineCycleEditor 
                                                    customerId={contact.id} 
                                                    billingCycle={contact.billing_cycle || 'monthly'} 
                                                    nextPaymentDate={contact.next_payment_date}
                                                />
                                            </td>
                                            <td className="px-6 py-4 border-l border-white/5 align-middle">
                                                <div className="flex justify-center">
                                                    <PaymentToggle 
                                                        customerId={contact.id} 
                                                        currentStatus={paymentStatus}
                                                        isDisabled={!!contact.deleted_at}
                                                    />
                                                </div>
                                            </td>
                                            <td className="border-l border-white/5 bg-white/[0.01]">
                                                <CustomerRowActions 
                                                    customerId={contact.id}
                                                    isActive={contact.is_active}
                                                    isDeleted={!!contact.deleted_at}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                                <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-zinc-400 font-medium text-lg">Sin base de contactos.</p>
                                            <p className="text-sm text-zinc-500 mt-1 max-w-sm mb-6">Aún no existe ningún cliente guardado en tu cuenta. Vincula un archivo de Excel (.xlsx) o CSV.</p>
                                            <Link href="/dashboard/clients" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors uppercase tracking-widest text-xs">
                                                Ir a importar →
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-5 flex justify-between items-center text-xs text-zinc-500 bg-black/20">
                    <span>
                        Mostrando {contacts?.length || 0} cliente(s) en tu cuenta.
                    </span>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors" disabled>← Anterior</button>
                        <button className="px-4 py-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">Siguiente →</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
