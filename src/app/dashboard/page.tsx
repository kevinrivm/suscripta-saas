import Link from 'next/link';
import { getWhatsAppWorkspaceBundle } from '@/app/actions/whatsapp';
import { createClient } from '@/utils/supabase/server';

function countEventsByStatus(
  events: Array<{ status: string }>
) {
  return events.reduce(
    (accumulator, event) => {
      const normalized = event.status.toLowerCase();
      if (normalized === 'accepted' || normalized === 'sent') {
        accumulator.sent += 1;
      }
      if (normalized === 'delivered' || normalized === 'read') {
        accumulator.delivered += 1;
      }
      return accumulator;
    },
    { sent: 0, delivered: 0 }
  );
}

// Inline SVGs for Semantics
const DoubleCheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function getStatusIcon(status: string) {
  const s = status.toLowerCase();
  if (s === 'read' || s === 'delivered') return <DoubleCheckIcon className="w-4 h-4 text-emerald-400" />;
  if (s === 'accepted' || s === 'sent') return <CheckIcon className="w-4 h-4 text-zinc-400" />;
  if (s === 'failed' || s === 'error') return <AlertIcon className="w-4 h-4 text-red-500" />;
  return <ClockIcon className="w-4 h-4 text-zinc-500" />;
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
      .from('profiles')
      .select('first_name, company_name')
      .eq('id', user.id)
      .maybeSingle()
    : { data: null };
  const metadata = user?.user_metadata as { first_name?: string; full_name?: string } | undefined;
  const emailFallback = user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ');
  const userName = profile?.first_name ?? metadata?.first_name ?? metadata?.full_name?.split(' ')[0] ?? emailFallback ?? 'Usuario';

  const workspace = await getWhatsAppWorkspaceBundle(60);
  const approvedTemplates = workspace.templates.filter(
    (template) => template.status.toUpperCase() === 'APPROVED'
  );
  const liveContacts = new Set(
    workspace.recentMessageEvents
      .map((event) => event.recipientPhone?.trim())
      .filter((phone): phone is string => Boolean(phone))
  );
  const metrics = countEventsByStatus(workspace.recentMessageEvents);

  return (
    <div className="mx-auto w-full max-w-7xl px-8 py-8 animate-in fade-in zoom-in-95 duration-500">
      <section className="overflow-hidden rounded-[32px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),linear-gradient(180deg,#0e1012_0%,#09090b_100%)] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.45)]">
        <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col justify-center">
            <div>
              <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
                Suscripta MVP
              </span>
              <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl font-semibold leading-tight tracking-tight text-white">
                Hola, {userName} 👋
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 font-light">
                Aquí tienes el estado general de las interacciones vía WhatsApp. Ya cuentas con tu número conectado, plantillas y eventos sincronizados.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/campaigns"
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5"
              >
                Probar envío real
              </Link>
              <Link
                href="/dashboard/conversations"
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-zinc-200 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:-translate-y-0.5"
              >
                Ver conversaciones
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            <div className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover:text-emerald-400">Numero conectado</p>
              <p className="mt-4 text-xl font-semibold text-white">
                {workspace.connection?.displayPhoneNumber ?? 'No conectado'}
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                {workspace.connection?.verifiedName ?? 'Esperando vinculacion'}
              </p>
            </div>

            <div className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover:text-emerald-400">Plantillas aprobadas</p>
              <p className="mt-4 text-4xl font-semibold text-white">{approvedTemplates.length}</p>
              <p className="mt-2 text-sm text-zinc-400">Catalogo listo para usar.</p>
            </div>

            <div className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover:text-emerald-400">Contactos activos</p>
              <p className="mt-4 text-4xl font-semibold text-white">{liveContacts.size}</p>
              <p className="mt-2 text-sm text-zinc-400">Unicos detectados desde eventos.</p>
            </div>

            <div className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500 transition-colors group-hover:text-emerald-400">Entregas / lecturas</p>
              <p className="mt-4 text-4xl font-semibold text-white">{metrics.delivered}</p>
              <p className="mt-2 text-sm text-zinc-400">
                {metrics.sent} sent aceptados recientemente.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6 rounded-[30px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Listo para demo</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Ruta sugerida para ensenar el MVP en YouTube sin salirte del producto.
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-emerald-300 whitespace-nowrap">
              Video flow
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3 h-full">
            <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 1</p>
              <h3 className="mt-3 text-lg font-semibold text-white flex items-center gap-2">
                Conversación
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Ensena la actividad real del numero y tu &quot;hola&quot;.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 2</p>
              <h3 className="mt-3 text-lg font-semibold text-white flex items-center gap-2">
                Plantillas
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Muestra la plantilla real aprobada y su preview local.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 transition-colors hover:bg-white/[0.04]">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 3</p>
              <h3 className="mt-3 text-lg font-semibold text-white flex items-center gap-2">
                Envíos
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Dispara el reminder desde aqui hacia tu app de Meta.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-[30px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <h2 className="text-2xl font-semibold text-white">Actividad reciente</h2>
          <p className="mt-2 text-sm text-zinc-500 mb-6">
            Ultimos eventos capturados para poblar bandejas de entrada.
          </p>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
            {workspace.recentMessageEvents.slice(0, 6).map((event) => {
              const isFailed = event.status.toLowerCase() === 'failed';

              return (
                <div
                  key={event.messageId}
                  className={`group rounded-[22px] border px-4 py-4 transition-all hover:bg-white/[0.02] ${isFailed ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-black/20'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center shrink-0 border border-white/10">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isFailed ? 'text-red-400' : 'text-zinc-200'} transition-colors group-hover:text-white`}>
                          {event.messageText ?? event.templateName ?? 'Evento sincronizado'}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500 flex items-center gap-1.5">
                          <span>{event.recipientPhone ?? 'Sin teléfono'}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span className="capitalize">{event.direction ?? 'unknown'}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFailed && (
                        <span className="text-xs text-red-500/80 mr-2 max-w-[120px] truncate hidden sm:block" title={event.errorMessage || 'Error de entrega'}>
                          {event.errorMessage ?? 'Error de entrega'}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 capitalize font-medium">
                        {getStatusIcon(event.status)}
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {!workspace.recentMessageEvents.length ? (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-8 flex flex-col items-center justify-center text-center h-full">
                <ClockIcon className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-sm font-medium text-zinc-400">Aún no hay actividad reciente.</p>
                <p className="text-xs text-zinc-500 mt-1">Los envíos y mensajes recibidos aparecerán aquí.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
