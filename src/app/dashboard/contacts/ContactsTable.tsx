'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { parsePhoneNumber } from 'libphonenumber-js';
import PaymentStatusSelector from './PaymentToggle';
import { CycleSelector } from './CycleEditors';
import StatusToggleAction from './StatusToggleAction';
import DeleteAction from './DeleteAction';
import RescheduleDateModal from './RescheduleDateModal';
import {
  bulkSoftDeleteCustomers,
  bulkUpdateCustomerActiveStatus,
  bulkUpdateCustomerPaymentStatus,
  updateCustomerCustomField,
} from '@/app/actions/customers';
import { isPaymentOverdue } from '@/utils/customers/billing-cycles';
import type { CustomFieldDefinition, CustomFieldKey, CustomFieldValues } from '@/utils/customers/custom-fields';

type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export type ContactRow = {
  id: string;
  phone_number: string;
  first_name: string | null;
  last_name_1: string | null;
  last_name_2: string | null;
  billing_cycle: string | null;
  next_payment_date: string | null;
  anchor_day: number | null;
  payment_status: string | null;
  is_active: boolean;
  deleted_at: string | null;
  custom_fields: CustomFieldValues | null;
};

type Props = {
  contacts: ContactRow[];
  allFilteredIds: string[];
  today: string;
  sortKey: string;
  sortDir: string;
  baseQuery: Record<string, string>;
  tab: string;
  totalGlobalCount: number;
  customFieldDefinitions: CustomFieldDefinition[];
};

const SELECT_COLUMN_WIDTH = 52;
const NAME_COLUMN_WIDTH = 210;
const stickySelectBaseClass = 'sticky left-0 w-[52px] min-w-[52px] shadow-[1px_0_0_rgba(255,255,255,0.06)]';
const stickyNameBaseClass = 'sticky left-[52px] w-[210px] min-w-[210px] shadow-[1px_0_0_rgba(255,255,255,0.06)]';
const stickySelectHeaderClass = `${stickySelectBaseClass} z-40 bg-[#111]`;
const stickyNameHeaderClass = `${stickyNameBaseClass} z-40 bg-[#111]`;
const stickySelectCellClass = `${stickySelectBaseClass} z-30 bg-[#0b0b0d]`;
const stickyNameCellClass = `${stickyNameBaseClass} z-20 bg-[#0b0b0d]`;
const headerCellClass = 'px-5 py-5 text-left align-middle whitespace-nowrap';
const borderedHeaderCellClass = `${headerCellClass} border-l border-white/5`;
const customFieldColumnClass = 'w-[150px] min-w-[150px] max-w-[150px]';

function CustomFieldCell({
  customerId,
  fieldKey,
  value,
  disabled,
}: {
  customerId: string;
  fieldKey: CustomFieldKey;
  value: string;
  disabled: boolean;
}) {
  const [localValue, setLocalValue] = useState(value);
  const [savedValue, setSavedValue] = useState(value);
  const [isSaving, startTransition] = useTransition();
  const router = useRouter();

  const saveValue = () => {
    if (disabled || localValue === savedValue) return;

    startTransition(async () => {
      const result = await updateCustomerCustomField(customerId, fieldKey, localValue);
      if (!result.ok) {
        alert(result.error || 'No se pudo guardar el campo personalizado.');
        setLocalValue(savedValue);
        return;
      }
      setSavedValue(localValue);
      router.refresh();
    });
  };

  return (
    <input
      type="text"
      value={localValue}
      disabled={disabled || isSaving}
      onChange={(event) => setLocalValue(event.target.value)}
      onBlur={saveValue}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setLocalValue(savedValue);
          event.currentTarget.blur();
        }
      }}
      className="w-[132px] rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm text-zinc-300 outline-none transition-colors hover:border-white/10 hover:bg-white/5 focus:border-emerald-500 focus:bg-black/40 disabled:opacity-50"
      placeholder="-"
    />
  );
}

function formatPhone(e164: string): { countryCode: string; local: string } {
  try {
    const parsed = parsePhoneNumber(e164);
    if (parsed) {
      const intl = parsed.formatInternational();
      const spaceIdx = intl.indexOf(' ');
      if (spaceIdx !== -1) {
        return {
          countryCode: intl.slice(0, spaceIdx),
          local: intl.slice(spaceIdx + 1),
        };
      }
    }
  } catch { }

  return { countryCode: '', local: e164 };
}

function normalizePaymentStatus(status: string | null | undefined): PaymentStatus {
  if (status === 'paid' || status === 'cancelled') return status;
  return 'pending';
}

export default function ContactsTable({
  contacts,
  allFilteredIds,
  today,
  sortKey,
  sortDir,
  baseQuery,
  tab,
  totalGlobalCount,
  customFieldDefinitions,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const visibleIds = useMemo(() => contacts.map((contact) => contact.id), [contacts]);
  const selectedCount = selectedIds.size;
  const visibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const filteredSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));

  const buildHref = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(baseQuery);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    return `?${params.toString()}`;
  };

  const renderSortHeader = (label: string, column: string, className = '') => {
    const active = sortKey === column;
    const nextDir = active && sortDir === 'asc' ? 'desc' : 'asc';

    return (
      <th className={`${headerCellClass} ${className}`}>
        <Link
          href={buildHref({ sort: column, dir: nextDir, page: '1' })}
          className="inline-flex items-center justify-start gap-1.5 group hover:text-white transition-colors"
          replace
        >
          {label}
          <span className={`transition-opacity text-[10px] ${active ? 'opacity-100 text-emerald-400' : 'opacity-0 group-hover:opacity-50'}`}>
            {active ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
          </span>
        </Link>
      </th>
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (visibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const runBulkAction = (
    label: string,
    action: (ids: string[]) => Promise<{ ok: boolean; error?: string }>,
  ) => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    if (!window.confirm(`${label} ${ids.length} cliente(s). ¿Confirmas esta acción masiva?`)) return;

    startTransition(async () => {
      const result = await action(ids);
      if (!result.ok) {
        alert(result.error || 'No se pudo completar la acción masiva.');
        return;
      }
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-1 shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden w-full">
      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 border-b border-white/10 bg-emerald-500/10 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-medium text-emerald-200">
            {selectedCount} cliente(s) seleccionado(s)
            {!filteredSelected && allFilteredIds.length > visibleIds.length && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(allFilteredIds))}
                className="ml-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
              >
                Seleccionar todos los filtrados ({allFilteredIds.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Cambiar estado de pago a Pendiente para', (ids) => bulkUpdateCustomerPaymentStatus(ids, 'pending'))}
              className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/10 disabled:opacity-50"
            >
              Pago: pendiente
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Cambiar estado de pago a Pagado para', (ids) => bulkUpdateCustomerPaymentStatus(ids, 'paid'))}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Pago: pagado
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Cambiar estado de pago a Cancelado para', (ids) => bulkUpdateCustomerPaymentStatus(ids, 'cancelled'))}
              className="rounded-full border border-zinc-500/20 bg-zinc-500/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-500/20 disabled:opacity-50"
            >
              Pago: cancelado
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Activar', (ids) => bulkUpdateCustomerActiveStatus(ids, true))}
              className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              Activar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Pausar', (ids) => bulkUpdateCustomerActiveStatus(ids, false))}
              className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/20 disabled:opacity-50"
            >
              Pausar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => runBulkAction('Enviar a papelera', bulkSoftDeleteCustomers)}
              className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
            >
              Eliminar
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setSelectedIds(new Set())}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto w-full border border-white/5 rounded-[24px]">
        <table className="min-w-max w-full table-auto text-left text-sm text-zinc-300">
          <colgroup>
            <col style={{ width: SELECT_COLUMN_WIDTH }} />
            <col style={{ width: NAME_COLUMN_WIDTH }} />
            <col className="w-[205px]" />
            <col className="w-[165px]" />
            <col className="w-[180px]" />
            <col className="w-[150px]" />
            {customFieldDefinitions.map((field) => (
              <col key={field.key} className={customFieldColumnClass} />
            ))}
            <col className="w-[130px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead className="bg-[#111] text-xs uppercase font-semibold tracking-wider text-zinc-500 border-b border-white/10">
            <tr>
              <th className={`${stickySelectHeaderClass} px-4 py-5 text-center align-middle`}>
                <input
                  type="checkbox"
                  checked={visibleSelected}
                  onChange={toggleVisibleSelection}
                  aria-label="Seleccionar clientes visibles"
                  className="h-4 w-4 rounded border-white/20 bg-black accent-emerald-500"
                />
              </th>
              {renderSortHeader('Nombre Completo', 'name', stickyNameHeaderClass)}
              {renderSortHeader('Teléfono', 'phone', 'w-[205px] min-w-[205px]')}
              {renderSortHeader('Ciclo (Frecuencia)', 'cycle', `${borderedHeaderCellClass} w-[165px] min-w-[165px]`)}
              {renderSortHeader('Fecha de Pago', 'date', `${borderedHeaderCellClass} w-[180px] min-w-[180px]`)}
              {renderSortHeader('Estado de Pago', 'status', `${borderedHeaderCellClass} w-[150px] min-w-[150px] text-emerald-400 bg-emerald-500/5`)}
              {customFieldDefinitions.map((field) => (
                <th key={field.key} className={`${borderedHeaderCellClass} ${customFieldColumnClass} text-zinc-400`}>
                  <span className="block truncate" title={field.label}>{field.label}</span>
                </th>
              ))}
              <th className={`${borderedHeaderCellClass} w-[130px] min-w-[130px]`}>Estatus</th>
              <th className={`${borderedHeaderCellClass} w-[120px] min-w-[120px]`}>Eliminar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-black/50">
            {contacts.length > 0 ? (
              contacts.map((contact) => {
                const nombreAgrupado = [contact.first_name, contact.last_name_1, contact.last_name_2].filter(Boolean).join(' ');
                const paymentStatus = normalizePaymentStatus(contact.payment_status);
                const overdue = isPaymentOverdue({
                  paymentStatus: contact.payment_status,
                  nextPaymentDate: contact.next_payment_date,
                  today,
                });
                const selected = selectedIds.has(contact.id);

                return (
                  <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors relative group">
                    <td className={`${stickySelectCellClass} px-4 py-4 text-center align-middle transition-colors group-hover:bg-[#101012]`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => {
                          setSelectedIds((current) => {
                            const next = new Set(current);
                            if (next.has(contact.id)) next.delete(contact.id);
                            else next.add(contact.id);
                            return next;
                          });
                        }}
                        aria-label={`Seleccionar ${nombreAgrupado || contact.phone_number}`}
                        className="h-4 w-4 rounded border-white/20 bg-black accent-emerald-500"
                      />
                    </td>
                    <td className={`${stickyNameCellClass} px-5 py-4 font-medium text-white transition-colors group-hover:bg-[#101012]`}>
                      <span className="block max-w-[170px] truncate" title={nombreAgrupado}>{nombreAgrupado}</span>
                    </td>
                    <td className="w-[205px] min-w-[205px] px-5 py-4 font-mono whitespace-nowrap">
                      {(() => {
                        const { countryCode, local } = formatPhone(contact.phone_number);
                        return countryCode ? (
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-zinc-500 text-xs bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-semibold">
                              ({countryCode})
                            </span>
                            <span className="whitespace-nowrap text-zinc-300 text-sm tracking-wide">{local}</span>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap text-zinc-400 text-xs">{local}</span>
                        );
                      })()}
                    </td>
                    <td className="w-[165px] min-w-[165px] border-l border-white/5">
                      <CycleSelector
                        customerId={contact.id}
                        billingCycle={contact.billing_cycle || 'monthly'}
                        nextPaymentDate={contact.next_payment_date}
                      />
                    </td>
                    <td className="w-[180px] min-w-[180px] border-l border-white/5">
                      <RescheduleDateModal
                        customerId={contact.id}
                        currentDate={contact.next_payment_date}
                        anchorDay={contact.anchor_day ?? null}
                      />
                    </td>
                    <td className="w-[150px] min-w-[150px] px-4 py-4 border-l border-white/5 align-middle">
                      <div className="flex justify-center">
                        <PaymentStatusSelector
                          customerId={contact.id}
                          currentStatus={paymentStatus}
                          isOverdue={overdue}
                          isDisabled={!!contact.deleted_at}
                        />
                      </div>
                    </td>
                    {customFieldDefinitions.map((field) => (
                      <td key={field.key} className={`${customFieldColumnClass} border-l border-white/5 px-2 py-3`}>
                        <CustomFieldCell
                          customerId={contact.id}
                          fieldKey={field.key}
                          value={contact.custom_fields?.[field.key] ?? ''}
                          disabled={!!contact.deleted_at}
                        />
                      </td>
                    ))}
                    <td className="w-[130px] min-w-[130px] border-l border-white/5">
                      <StatusToggleAction
                        customerId={contact.id}
                        isActive={contact.is_active}
                        isDeleted={!!contact.deleted_at}
                      />
                    </td>
                    <td className="w-[120px] min-w-[120px] border-l border-white/5">
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
                <td colSpan={8 + customFieldDefinitions.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    {totalGlobalCount > 0 ? (
                      <>
                        <p className="text-zinc-400 font-medium text-lg">Sin clientes para esta vista.</p>
                        <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                          No hay contactos que coincidan con la pestaña <strong>{tab}</strong> o filtros actuales.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-zinc-400 font-medium text-lg">Sin base de contactos.</p>
                        <p className="text-sm text-zinc-500 mt-1 max-w-sm mb-6">
                          Aún no existe ningún cliente guardado en tu cuenta. Vincula un archivo de Excel (.xlsx) o CSV.
                        </p>
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
    </div>
  );
}
