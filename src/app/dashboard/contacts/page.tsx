import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import PaymentToggle from './PaymentToggle';
import { CycleSelector } from './CycleEditors';
import ContactsHeaderActions from './ContactsHeaderActions';
import StatusToggleAction from './StatusToggleAction';
import DeleteAction from './DeleteAction';
import RescheduleDateModal from './RescheduleDateModal';
import { parsePhoneNumber } from 'libphonenumber-js';

export const dynamic = 'force-dynamic';

// Formatea E.164 en visual legible: (+52) 155 8765 4321
function formatPhone(e164: string): { countryCode: string; local: string } {
  try {
    const parsed = parsePhoneNumber(e164);
    if (parsed) {
      const intl = parsed.formatInternational(); // e.g. "+52 15 5876 5432"
      const spaceIdx = intl.indexOf(' ');
      if (spaceIdx !== -1) {
        return {
          countryCode: intl.slice(0, spaceIdx),        // "+52"
          local: intl.slice(spaceIdx + 1),             // "15 5876 5432"
        };
      }
    }
  } catch { }
  // Fallback: sin parseo, mostrar crudo
  return { countryCode: '', local: e164 };
}

type SearchParams = { tab?: string; sort?: string; dir?: string };

// Columnas ordenables y sus campos reales en Supabase
const SORTABLE_COLUMNS: Record<string, string> = {
  name: 'first_name',
  phone: 'phone_number',
  cycle: 'billing_cycle',
  date: 'next_payment_date',
  status: 'payment_status',
};

function SortHeader({ label, column, currentSort, currentDir, className = '' }: {
  label: string; column: string; currentSort: string; currentDir: string; className?: string;
}) {
  const isActive = currentSort === column;
  const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';
  return (
    <th className={`px-6 py-5 ${className}`}>
      <Link
        href={`?sort=${column}&dir=${nextDir}&tab=${''}`}
        className="inline-flex items-center gap-1.5 group hover:text-white transition-colors"
        replace
      >
        {label}
        <span className={`transition-opacity text-[10px] ${isActive ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-50'}`}>
          {isActive ? (currentDir === 'asc' ? '▲' : '▼') : '▲'}
        </span>
      </Link>
    </th>
  );
}

export default async function Contacts(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab || 'activos';
  const sortKey = searchParams?.sort || 'name';
  const sortDir = searchParams?.dir || 'asc';
  const dbColumn = SORTABLE_COLUMNS[sortKey] || 'first_name';

  const supabase = await createClient();

  let query = supabase
    .from('customers')
    .select('*')
    .order(dbColumn, { ascending: sortDir === 'asc' });

  if (tab === 'activos') {
    query = query.eq('is_active', true).is('deleted_at', null);
  } else if (tab === 'pausados') {
    query = query.eq('is_active', false).is('deleted_at', null);
  } else if (tab === 'papelera') {
    query = query.not('deleted_at', 'is', null);
  }

  const { data: contacts, error } = await query;

  const { count: totalGlobalCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return (
      <div className="p-10 w-full text-center text-red-400">
        Hubo un error cargando los contactos. {error.message}
      </div>
    );
  }

  const sortProps = { currentSort: sortKey, currentDir: sortDir };

  return (
    <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Base de Clientes</h1>
          <p className="text-zinc-400 text-sm">Gestiona tus contactos, descarga métricas o depura tu base para notificaciones instantáneas.</p>
        </div>
      </div>

      <ContactsHeaderActions currentTab={tab} rawData={contacts || []} />

      <div className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-1 shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden w-full">
        <div className="overflow-x-auto w-full border border-white/5 rounded-[24px]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#111] text-xs uppercase font-semibold tracking-wider text-zinc-500 border-b border-white/10">
              <tr>
                <SortHeader label="Nombre Completo" column="name" {...sortProps} />
                <SortHeader label="Teléfono" column="phone" {...sortProps} />
                <SortHeader label="Ciclo (Frecuencia)" column="cycle" {...sortProps} className="border-l border-white/5" />
                <SortHeader label="Fecha de Pago" column="date" {...sortProps} className="border-l border-white/5" />
                <SortHeader label="Estado de Pago" column="status" {...sortProps} className="text-emerald-400 border-l bg-emerald-500/5 border-white/5 text-center" />
                <th className="px-6 py-5 border-l border-white/5 text-center">Estatus</th>
                <th className="px-6 py-5 border-l border-white/5 text-center">Eliminar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-black/50">
              {contacts && contacts.length > 0 ? (
                contacts.map((contact) => {
                  const nombreAgrupado = [contact.first_name, contact.last_name_1, contact.last_name_2].filter(Boolean).join(' ');
                  const paymentStatus = contact.payment_status || 'pending';

                  return (
                    <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors relative group">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{nombreAgrupado}</td>
                      <td className="px-6 py-4 font-mono">
                        {(() => {
                          const { countryCode, local } = formatPhone(contact.phone_number);
                          return countryCode ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-zinc-500 text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-semibold">
                                ({countryCode})
                              </span>
                              <span className="text-zinc-300 text-sm tracking-wide">{local}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-xs">{local}</span>
                          );
                        })()}
                      </td>
                      <td className="border-l border-white/5">
                        <CycleSelector
                          customerId={contact.id}
                          billingCycle={contact.billing_cycle || 'monthly'}
                          nextPaymentDate={contact.next_payment_date}
                        />
                      </td>
                      <td className="border-l border-white/5">
                        <RescheduleDateModal
                          customerId={contact.id}
                          currentDate={contact.next_payment_date}
                          anchorDay={contact.anchor_day ?? null}
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
                      <td className="border-l border-white/5">
                        <StatusToggleAction
                          customerId={contact.id}
                          isActive={contact.is_active}
                          isDeleted={!!contact.deleted_at}
                        />
                      </td>
                      <td className="border-l border-white/5">
                        <DeleteAction
                          customerId={contact.id}
                          isDeleted={!!contact.deleted_at}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      {totalGlobalCount && totalGlobalCount > 0 ? (
                        <>
                          <p className="text-zinc-400 font-medium text-lg">Categoría sin clientes.</p>
                          <p className="text-sm text-zinc-500 mt-1 max-w-sm">No hay contactos marcados como <strong>{tab}</strong> en este momento.</p>
                        </>
                      ) : (
                        <>
                          <p className="text-zinc-400 font-medium text-lg">Sin base de contactos.</p>
                          <p className="text-sm text-zinc-500 mt-1 max-w-sm mb-6">Aún no existe ningún cliente guardado en tu cuenta. Vincula un archivo de Excel (.xlsx) o CSV.</p>
                          <Link href="/dashboard/clients" className="text-emerald-400 font-medium hover:text-emerald-300 transition-colors uppercase tracking-widest text-xs">
                            Ir a importar →
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 flex justify-between items-center text-xs text-zinc-500 bg-black/20">
          <span>
            Mostrando {contacts?.length || 0} cliente(s) · Ordenado por <strong className="text-zinc-400">{sortKey}</strong> {sortDir === 'asc' ? '↑' : '↓'}
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
