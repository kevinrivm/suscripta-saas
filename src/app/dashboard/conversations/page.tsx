import { getWhatsAppWorkspaceBundle } from '@/app/actions/whatsapp';

type ConversationEvent = {
    messageId: string;
    direction?: string | null;
    recipientPhone?: string | null;
    templateName?: string | null;
    messageText?: string | null;
    status: string;
    errorCode?: string | null;
    errorMessage?: string | null;
    updatedAt?: string | null;
};

type ConversationThread = {
    id: string;
    title: string;
    phone: string;
    source: 'live' | 'demo';
    lastMessage: string;
    lastStatus: string;
    lastUpdatedAt?: string | null;
    events: ConversationEvent[];
};

function formatRelativeDate(value?: string | null) {
    if (!value) {
        return 'Ahora';
    }

    const date = new Date(value);
    const deltaMs = Date.now() - date.getTime();
    const deltaMinutes = Math.max(1, Math.round(deltaMs / 60000));

    if (deltaMinutes < 60) {
        return `Hace ${deltaMinutes} min`;
    }

    const deltaHours = Math.round(deltaMinutes / 60);
    if (deltaHours < 24) {
        return `Hace ${deltaHours} h`;
    }

    return date.toLocaleDateString();
}

function formatEventTime(value?: string | null) {
    if (!value) {
        return 'Ahora';
    }

    return new Date(value).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function buildLiveThreads(events: ConversationEvent[]): ConversationThread[] {
    const grouped = new Map<string, ConversationEvent[]>();

    for (const event of events) {
        const phone = event.recipientPhone?.trim();

        if (!phone) {
            continue;
        }

        const current = grouped.get(phone) ?? [];
        current.push(event);
        grouped.set(phone, current);
    }

    return [...grouped.entries()]
        .map(([phone, threadEvents]) => {
            const sortedEvents = [...threadEvents].sort((left, right) => {
                return new Date(left.updatedAt ?? 0).getTime() - new Date(right.updatedAt ?? 0).getTime();
            });
            const latestEvent = sortedEvents[sortedEvents.length - 1];
            const numericPhone = phone.replace(/\D/g, '');
            const maskedTitle = numericPhone.length >= 4
                ? `Cliente ${numericPhone.slice(-4)}`
                : 'Cliente real';

            return {
                id: phone,
                title: maskedTitle,
                phone,
                source: 'live' as const,
                lastMessage:
                    latestEvent.messageText ??
                    latestEvent.templateName ??
                    'Evento sincronizado desde WhatsApp',
                lastStatus: latestEvent.status,
                lastUpdatedAt: latestEvent.updatedAt,
                events: sortedEvents,
            };
        })
        .sort((left, right) => {
            return new Date(right.lastUpdatedAt ?? 0).getTime() - new Date(left.lastUpdatedAt ?? 0).getTime();
        });
}

function buildDemoThreads(): ConversationThread[] {
    return [
        {
            id: 'demo-1',
            title: 'Fitness Norte',
            phone: '+52 55 1234 5678',
            source: 'demo',
            lastMessage: 'Recordatorio listo para enviarse manana a las 09:00.',
            lastStatus: 'draft',
            lastUpdatedAt: new Date().toISOString(),
            events: [
                {
                    messageId: 'demo-1-a',
                    direction: 'outbound',
                    templateName: 'payment_reminder_review',
                    status: 'draft',
                    updatedAt: new Date().toISOString(),
                },
            ],
        },
        {
            id: 'demo-2',
            title: 'Academia Nova',
            phone: '+52 81 4422 1100',
            source: 'demo',
            lastMessage: 'Campana de renovacion programada para 12 clientes.',
            lastStatus: 'scheduled',
            lastUpdatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            events: [
                {
                    messageId: 'demo-2-a',
                    direction: 'outbound',
                    templateName: 'payment_reminder_review',
                    status: 'scheduled',
                    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                },
            ],
        },
    ];
}

function statusTone(status: string) {
    const normalized = status.toLowerCase();

    if (normalized === 'read' || normalized === 'delivered') {
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
    }

    if (normalized === 'failed') {
        return 'text-rose-300 bg-rose-500/10 border-rose-500/20';
    }

    if (normalized === 'received' || normalized === 'accepted') {
        return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
    }

    return 'text-zinc-300 bg-white/5 border-white/10';
}

export default async function ConversationsPage() {
    const workspace = await getWhatsAppWorkspaceBundle(120);
    const liveThreads = buildLiveThreads(workspace.recentMessageEvents);
    const threads = [...liveThreads, ...buildDemoThreads()].slice(0, 6);
    const activeThread = threads[0] ?? null;

    return (
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-8 py-8">
            <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
                        Inbox MVP
                    </span>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight">Conversaciones</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                        Vista unificada de actividad de WhatsApp. Las conversaciones reales llegan desde los
                        webhooks y, si aun no hay volumen, se complementan con ejemplos visuales para mostrar el
                        flujo completo del producto.
                    </p>
                </div>

                <div className="grid min-w-[280px] grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Threads reales</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{liveThreads.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Numero conectado</p>
                        <p className="mt-3 text-sm font-medium text-zinc-200">
                            {workspace.connection?.displayPhoneNumber ?? 'No conectado'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid min-h-[720px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
                <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0d] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <div className="border-b border-white/10 px-5 py-4">
                        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-500">
                            Buscar, filtrar y priorizar conversaciones. Para el MVP, la lista muestra primero la
                            actividad real sincronizada.
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {threads.map((thread, index) => (
                            <div
                                key={thread.id}
                                className={`px-5 py-4 ${index === 0 ? 'bg-emerald-500/8' : 'hover:bg-white/[0.03]'}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{thread.title}</p>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                                                    thread.source === 'live'
                                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                        : 'border-white/10 bg-white/5 text-zinc-400'
                                                }`}
                                            >
                                                {thread.source}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-zinc-500">{thread.phone}</p>
                                    </div>

                                    <span className="text-xs text-zinc-500">
                                        {formatRelativeDate(thread.lastUpdatedAt)}
                                    </span>
                                </div>

                                <p className="mt-3 line-clamp-2 text-sm text-zinc-300">{thread.lastMessage}</p>
                                <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone(thread.lastStatus)}`}>
                                    {thread.lastStatus}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(9,9,11,0.98))] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    {activeThread ? (
                        <>
                            <div className="flex items-center justify-between border-b border-white/10 px-7 py-5">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-semibold text-white">{activeThread.title}</h2>
                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                                                activeThread.source === 'live'
                                                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                                                    : 'border-white/10 bg-white/5 text-zinc-400'
                                            }`}
                                        >
                                            {activeThread.source === 'live' ? 'Evento real' : 'Demo visual'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-zinc-500">{activeThread.phone}</p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Ultimo estado</p>
                                    <p className="mt-2 text-sm font-medium text-white">{activeThread.lastStatus}</p>
                                </div>
                            </div>

                            <div className="space-y-4 px-7 py-6">
                                {activeThread.events.map((event) => {
                                    const isInbound = event.direction === 'inbound';
                                    const bubbleClass = isInbound
                                        ? 'mr-auto border-white/10 bg-white/[0.03]'
                                        : 'ml-auto border-emerald-500/20 bg-emerald-500/10';

                                    return (
                                        <div key={event.messageId} className={`max-w-[78%] rounded-[24px] border px-5 py-4 ${bubbleClass}`}>
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                                    {isInbound ? 'Entrante' : 'Saliente'}
                                                </span>
                                                <span className="text-xs text-zinc-500">
                                                    {formatEventTime(event.updatedAt)}
                                                </span>
                                            </div>

                                            <div className="mt-3 text-sm leading-6 text-zinc-200">
                                                {event.messageText ?? event.templateName ?? 'Actividad sincronizada desde WhatsApp'}
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                                <span className={`rounded-full border px-2.5 py-1 ${statusTone(event.status)}`}>
                                                    {event.status}
                                                </span>
                                                {event.errorMessage ? (
                                                    <span className="text-rose-300">
                                                        {event.errorCode ? `${event.errorCode}: ` : ''}
                                                        {event.errorMessage}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center px-10 text-center">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">Aun no hay conversaciones</h2>
                                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
                                    Conecta un numero, envia o recibe un mensaje y esta vista empezara a reflejar la
                                    actividad en tiempo real desde los webhooks de WhatsApp.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
