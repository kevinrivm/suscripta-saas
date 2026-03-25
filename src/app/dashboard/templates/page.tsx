import { getWhatsAppWorkspaceBundle } from '@/app/actions/whatsapp';

function getTemplateBody(template: {
    components?: Array<{
        type?: string;
        text?: string;
    }>;
}) {
    return (
        template.components?.find((component) => component.type === 'BODY')?.text ??
        'Template body unavailable.'
    );
}

function templateTone(status: string) {
    const normalized = status.toLowerCase();

    if (normalized === 'approved') {
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    }

    if (normalized.includes('reject')) {
        return 'border-rose-500/20 bg-rose-500/10 text-rose-300';
    }

    return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
}

export default async function TemplatesPage() {
    const workspace = await getWhatsAppWorkspaceBundle(20);
    const approvedTemplates = workspace.templates.filter(
        (template) => template.status.toUpperCase() === 'APPROVED'
    );
    const pendingTemplates = workspace.templates.filter(
        (template) => template.status.toUpperCase() !== 'APPROVED'
    );

    return (
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
            <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
                        Meta Synced
                    </span>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight">Plantillas</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                        Catalogo visual de las plantillas reales aprobadas en tu WABA. Esta pagina ya no simula
                        contenido: consume la configuracion actual de Meta y la muestra con un formato listo para demo.
                    </p>
                </div>

                <div className="grid min-w-[320px] grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Aprobadas</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{approvedTemplates.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">En revision</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{pendingTemplates.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Templates activas</h2>
                            <p className="mt-1 text-sm text-zinc-500">
                                Tu plantilla real de recordatorio ya queda lista para mostrarse en el video.
                            </p>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                            {workspace.templates.length} total
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        {workspace.templates.length ? (
                            workspace.templates.map((template) => (
                                <article
                                    key={template.id}
                                    className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,20,0.96),rgba(9,9,11,0.98))]"
                                >
                                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                                        <div>
                                            <h3 className="font-semibold text-white">{template.name}</h3>
                                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                                {template.language} · {template.category ?? 'UTILITY'}
                                            </p>
                                        </div>
                                        <span className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase ${templateTone(template.status)}`}>
                                            {template.status}
                                        </span>
                                    </div>

                                    <div className="px-5 py-5">
                                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-6 text-zinc-300">
                                            {getTemplateBody(template)}
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                                                {template.sub_category ?? 'General reminder'}
                                            </span>
                                            {template.components?.some((component) => component.text?.includes('{{')) ? (
                                                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                                                    Variables dinamicas
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 px-6 py-10 text-sm text-zinc-400 md:col-span-2">
                                Aun no hay plantillas sincronizadas. Crea al menos una desde App Review para poblar
                                esta vista.
                            </div>
                        )}
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold text-white">Template destacada</h2>
                        <p className="mt-2 text-sm text-zinc-500">
                            La primera aprobada es la mejor candidata para el video de producto.
                        </p>

                        {approvedTemplates[0] ? (
                            <div className="mt-5 rounded-[24px] border border-emerald-500/20 bg-emerald-500/8 p-5">
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                                    Ready to send
                                </p>
                                <h3 className="mt-3 text-xl font-semibold text-white">
                                    {approvedTemplates[0].name}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-200">
                                    {getTemplateBody(approvedTemplates[0])}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                                En cuanto una plantilla quede APPROVED, aparecera aqui como favorita para demo.
                            </div>
                        )}
                    </section>

                    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-xl font-semibold text-white">Checklist de demo</h2>
                        <div className="mt-5 space-y-4 text-sm text-zinc-300">
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                1. Mostrar el template aprobado con nombre, idioma y estado.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                2. Abrir la pestaña de Envios y seleccionar esta misma plantilla.
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                3. Enviar a tu numero y luego ensenar la conversacion real en la pestaña de inbox.
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
