import { getWhatsAppWorkspaceBundle } from '@/app/actions/whatsapp';
import { CampaignComposer } from '@/components/dashboard/CampaignComposer';

export default async function CampaignsPage() {
    const workspace = await getWhatsAppWorkspaceBundle(40);
    const approvedTemplates = workspace.templates
        .filter((template) => template.status.toUpperCase() === 'APPROVED')
        .map((template) => ({
            id: template.id,
            name: template.name,
            language: template.language,
            category: template.category,
            bodyText:
                template.components?.find((component) => component.type === 'BODY')?.text ??
                'Template body unavailable.',
        }));

    const recentRecipients = [...new Set(
        workspace.recentMessageEvents
            .map((event) => event.recipientPhone?.trim())
            .filter((phone): phone is string => Boolean(phone))
    )]
        .slice(0, 4)
        .map((phone, index) => ({
            phone,
            label: index === 0 ? `Ultimo destinatario · ${phone}` : phone,
        }));

    return (
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
            <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                    <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
                        Messaging MVP
                    </span>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight">Envios</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
                        Esta es la experiencia final del producto para disparar recordatorios. Ya trabaja con la
                        plantilla real aprobada y con el numero conectado en Meta.
                    </p>
                </div>

                <div className="grid min-w-[320px] grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Plantillas listas</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{approvedTemplates.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Numero conectado</p>
                        <p className="mt-3 text-sm font-medium text-zinc-200">
                            {workspace.connection?.displayPhoneNumber ?? 'No conectado'}
                        </p>
                    </div>
                </div>
            </div>

            {workspace.connection && approvedTemplates.length ? (
                <CampaignComposer
                    connectedNumber={workspace.connection.displayPhoneNumber}
                    approvedTemplates={approvedTemplates}
                    recentRecipients={recentRecipients}
                />
            ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/20 px-8 py-12 text-center">
                    <h2 className="text-2xl font-semibold text-white">Aun no esta listo para enviar</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                        Para usar esta pantalla necesitas un numero conectado y al menos una plantilla APPROVED en tu
                        WABA. Cuando ambas cosas existan, aqui podras disparar el reminder real desde el dashboard.
                    </p>
                </div>
            )}
        </div>
    );
}
