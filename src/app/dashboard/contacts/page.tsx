import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ContactsHeaderActions from './ContactsHeaderActions';
import ContactsTable, { type ContactRow } from './ContactsTable';
import { getTodayDateString } from '@/utils/customers/billing-cycles';

export const dynamic = 'force-dynamic';

type SearchParams = {
  tab?: string;
  sort?: string;
  dir?: string;
  payment?: string;
  cycle?: string;
  dateOp?: string;
  date?: string;
  page?: string;
  pageSize?: string;
};

// Columnas ordenables y sus campos reales en Supabase
const SORTABLE_COLUMNS: Record<string, string> = {
  name: 'first_name',
  phone: 'phone_number',
  cycle: 'billing_cycle',
  date: 'next_payment_date',
  status: 'payment_status',
};

const PAYMENT_FILTERS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

const CYCLE_FILTERS: Record<string, string> = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  biannual: 'Semestral',
  annual: 'Anual',
};

const DATE_OPERATORS: Record<string, string> = {
  eq: 'igual a',
  lt: 'antes de',
  gt: 'después de',
};

function buildHref(current: Record<string, string>, patch: Record<string, string | null>) {
  const params = new URLSearchParams(current);
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || value === '') params.delete(key);
    else params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '?';
}

export default async function Contacts(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const tab = searchParams?.tab || 'activos';
  const sortKey = searchParams?.sort || 'name';
  const sortDir = searchParams?.dir || 'asc';
  const paymentFilter = PAYMENT_FILTERS[searchParams?.payment || ''] ? searchParams?.payment || '' : '';
  const cycleFilter = CYCLE_FILTERS[searchParams?.cycle || ''] ? searchParams?.cycle || '' : '';
  const dateOp = DATE_OPERATORS[searchParams?.dateOp || ''] ? searchParams?.dateOp || '' : '';
  const dateFilter = searchParams?.date || '';
  const requestedPageSize = Number(searchParams?.pageSize || 20);
  const pageSize = [20, 50, 100].includes(requestedPageSize) ? requestedPageSize : 20;
  const page = Math.max(Number(searchParams?.page || 1) || 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const dbColumn = SORTABLE_COLUMNS[sortKey] || 'first_name';
  const currentQuery = {
    tab,
    sort: sortKey,
    dir: sortDir,
    ...(paymentFilter ? { payment: paymentFilter } : {}),
    ...(cycleFilter ? { cycle: cycleFilter } : {}),
    ...(dateOp ? { dateOp } : {}),
    ...(dateFilter ? { date: dateFilter } : {}),
    page: String(page),
    pageSize: String(pageSize),
  };

  const supabase = await createClient();

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  let filteredIdsQuery = supabase
    .from('customers')
    .select('id');

  if (tab === 'activos') {
    query = query.eq('is_active', true).is('deleted_at', null);
    filteredIdsQuery = filteredIdsQuery.eq('is_active', true).is('deleted_at', null);
  } else if (tab === 'pausados') {
    query = query.eq('is_active', false).is('deleted_at', null);
    filteredIdsQuery = filteredIdsQuery.eq('is_active', false).is('deleted_at', null);
  } else if (tab === 'papelera') {
    query = query.not('deleted_at', 'is', null);
    filteredIdsQuery = filteredIdsQuery.not('deleted_at', 'is', null);
  }

  if (paymentFilter) {
    query = query.eq('payment_status', paymentFilter);
    filteredIdsQuery = filteredIdsQuery.eq('payment_status', paymentFilter);
  }
  if (cycleFilter) {
    query = query.eq('billing_cycle', cycleFilter);
    filteredIdsQuery = filteredIdsQuery.eq('billing_cycle', cycleFilter);
  }
  if (dateFilter && dateOp === 'eq') {
    query = query.eq('next_payment_date', dateFilter);
    filteredIdsQuery = filteredIdsQuery.eq('next_payment_date', dateFilter);
  }
  if (dateFilter && dateOp === 'lt') {
    query = query.lt('next_payment_date', dateFilter);
    filteredIdsQuery = filteredIdsQuery.lt('next_payment_date', dateFilter);
  }
  if (dateFilter && dateOp === 'gt') {
    query = query.gt('next_payment_date', dateFilter);
    filteredIdsQuery = filteredIdsQuery.gt('next_payment_date', dateFilter);
  }

  query = query
    .order(dbColumn, { ascending: sortDir === 'asc' })
    .range(from, to);

  const { data: contacts, error, count: filteredCount } = await query;
  const { data: filteredIdsData } = await filteredIdsQuery;
  const today = getTodayDateString();

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

  const filteredTotal = filteredCount ?? 0;
  const totalPages = Math.max(Math.ceil(filteredTotal / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const allFilteredIds = (filteredIdsData ?? []).map((row) => String(row.id));
  const activeFilterChips = [
    paymentFilter ? { key: 'payment', label: `Pago: ${PAYMENT_FILTERS[paymentFilter]}` } : null,
    cycleFilter ? { key: 'cycle', label: `Ciclo: ${CYCLE_FILTERS[cycleFilter]}` } : null,
    dateFilter && dateOp ? { key: 'date', label: `Fecha: ${DATE_OPERATORS[dateOp]} ${dateFilter}` } : null,
  ].filter((chip): chip is { key: string; label: string } => Boolean(chip));

  return (
    <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Base de Clientes</h1>
          <p className="text-zinc-400 text-sm">Gestiona tus contactos, descarga métricas o depura tu base para notificaciones instantáneas.</p>
        </div>
      </div>

      <ContactsHeaderActions currentTab={tab} rawData={contacts || []} />

      <div className="mb-5 rounded-[24px] border border-white/10 bg-[#0b0b0d] p-5">
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end">
          <input type="hidden" name="tab" value={tab} />
          <input type="hidden" name="sort" value={sortKey} />
          <input type="hidden" name="dir" value={sortDir} />
          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={pageSize} />

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Estado de pago</label>
            <select name="payment" defaultValue={paymentFilter} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500">
              <option value="">Cualquiera</option>
              {Object.entries(PAYMENT_FILTERS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Ciclo</label>
            <select name="cycle" defaultValue={cycleFilter} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500">
              <option value="">Cualquiera</option>
              {Object.entries(CYCLE_FILTERS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Fecha de pago</label>
            <div className="grid grid-cols-[130px_1fr] gap-2">
              <select name="dateOp" defaultValue={dateOp} className="rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white outline-none focus:border-emerald-500">
                <option value="">Operador</option>
                {Object.entries(DATE_OPERATORS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <input name="date" defaultValue={dateFilter} type="date" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500" style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-emerald-400">
              Filtrar
            </button>
            {activeFilterChips.length > 0 && (
              <Link href={buildHref(currentQuery, { payment: null, cycle: null, dateOp: null, date: null, page: '1' })} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10">
                Limpiar
              </Link>
            )}
          </div>
        </form>

        {activeFilterChips.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <Link
                key={chip.key}
                href={chip.key === 'date'
                  ? buildHref(currentQuery, { dateOp: null, date: null, page: '1' })
                  : buildHref(currentQuery, { [chip.key]: null, page: '1' })}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
              >
                {chip.label}
                <span className="text-emerald-200/70">x</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ContactsTable
        contacts={(contacts || []) as ContactRow[]}
        allFilteredIds={allFilteredIds}
        today={today}
        sortKey={sortKey}
        sortDir={sortDir}
        baseQuery={currentQuery}
        tab={tab}
        totalGlobalCount={totalGlobalCount ?? 0}
      />

      <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-5 text-xs text-zinc-500">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>
            Mostrando {contacts?.length || 0} de {filteredTotal} cliente(s) filtrados · Página {safePage} de {totalPages}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400">Ver</span>
            {[20, 50, 100].map((size) => (
              <Link
                key={size}
                href={buildHref(currentQuery, { pageSize: String(size), page: '1' })}
                className={`rounded-full px-3 py-2 font-medium transition-colors ${pageSize === size ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
              >
                {size}
              </Link>
            ))}
            <Link
              href={buildHref(currentQuery, { page: String(Math.max(safePage - 1, 1)) })}
              aria-disabled={safePage <= 1}
              className={`rounded-full px-4 py-2 transition-colors ${safePage <= 1 ? 'pointer-events-none bg-white/5 text-zinc-700' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
            >
              ← Anterior
            </Link>
            <Link
              href={buildHref(currentQuery, { page: String(Math.min(safePage + 1, totalPages)) })}
              aria-disabled={safePage >= totalPages}
              className={`rounded-full px-4 py-2 transition-colors ${safePage >= totalPages ? 'pointer-events-none bg-white/5 text-zinc-700' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
            >
              Siguiente →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
