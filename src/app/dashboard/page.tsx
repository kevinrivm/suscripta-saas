import Link from 'next/link';
import { getWhatsAppWorkspaceBundle } from '@/app/actions/whatsapp';

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

export default async function DashboardOverviewPage() {
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
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
            <section className="overflow-hidden rounded-[32px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_38%),linear-gradient(180deg,#0e1012_0%,#09090b_100%)] p-8 shadow-[0_24px_120px_rgba(0,0,0,0.45)]">
                <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
                            Suscripta MVP
                        </span>
                        <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white">
                            WhatsApp reminders listos para mostrarse como producto real.
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300">
                            Ya tienes el flujo central funcionando: numero conectado, plantillas aprobadas,
                            mensajes reales y eventos entrantes/salientes. Esta portada resume ese estado para tu video.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href="/dashboard/campaigns"
                                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
                            >
                                Probar envio real
                            </Link>
                            <Link
                                href="/dashboard/conversations"
                                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                            >
                                Ver conversaciones
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                        <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Numero conectado</p>
                            <p className="mt-4 text-xl font-semibold text-white">
                                {workspace.connection?.displayPhoneNumber ?? 'No conectado'}
                            </p>
                            <p className="mt-2 text-sm text-zinc-400">
                                {workspace.connection?.verifiedName ?? 'Esperando vinculacion'}
                            </p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Plantillas aprobadas</p>
                            <p className="mt-4 text-4xl font-semibold text-white">{approvedTemplates.length}</p>
                            <p className="mt-2 text-sm text-zinc-400">Catalogo listo para usar en el dashboard.</p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Contactos activos</p>
                            <p className="mt-4 text-4xl font-semibold text-white">{liveContacts.size}</p>
                            <p className="mt-2 text-sm text-zinc-400">Unicos detectados desde eventos reales.</p>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Entregas / lecturas</p>
                            <p className="mt-4 text-4xl font-semibold text-white">{metrics.delivered}</p>
                            <p className="mt-2 text-sm text-zinc-400">
                                {metrics.sent} accepted o sent registrados recientemente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[30px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-white">Listo para demo</h2>
                            <p className="mt-2 text-sm text-zinc-500">
                                Ruta sugerida para ensenar el MVP en YouTube sin salirte del producto.
                            </p>
                        </div>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-emerald-300">
                            Video flow
                        </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 1</p>
                            <h3 className="mt-3 text-lg font-semibold text-white">Conversaciones</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Ensena la actividad real del numero y el evento entrante de tu &quot;hola&quot;.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 2</p>
                            <h3 className="mt-3 text-lg font-semibold text-white">Plantillas</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Muestra la plantilla real aprobada, su idioma y el preview del cuerpo.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Paso 3</p>
                            <h3 className="mt-3 text-lg font-semibold text-white">Envios</h3>
                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                                Dispara el reminder desde el dashboard y vuelve al inbox para confirmar.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[30px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <h2 className="text-2xl font-semibold text-white">Actividad reciente</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        Ultimos eventos capturados por el sistema y usados para poblar el inbox.
                    </p>

                    <div className="mt-6 space-y-3">
                        {workspace.recentMessageEvents.slice(0, 6).map((event) => (
                            <div
                                key={event.messageId}
                                className="rounded-[22px] border border-white/10 bg-black/25 px-4 py-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {event.messageText ?? event.templateName ?? 'Evento sincronizado'}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            {event.recipientPhone ?? 'Sin telefono'} · {event.direction ?? 'unknown'}
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {!workspace.recentMessageEvents.length ? (
                            <div className="rounded-[22px] border border-dashed border-white/10 bg-black/20 px-4 py-8 text-sm text-zinc-400">
                                En cuanto lleguen mensajes o envios reales, esta seccion empezara a poblarse
                                automaticamente.
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
}
