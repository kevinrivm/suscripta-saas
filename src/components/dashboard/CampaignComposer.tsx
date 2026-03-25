'use client';

import { useMemo, useState } from 'react';
import { sendWhatsAppTestTemplate } from '@/app/actions/whatsapp';

type ApprovedTemplate = {
    id: string;
    name: string;
    language: string;
    category?: string;
    bodyText: string;
};

type RecentRecipient = {
    phone: string;
    label: string;
};

interface CampaignComposerProps {
    connectedNumber?: string | null;
    approvedTemplates: ApprovedTemplate[];
    recentRecipients: RecentRecipient[];
}

function extractTemplateVariableCount(bodyText: string) {
    const matches = [...bodyText.matchAll(/\{\{(\d+)\}\}/g)].map((match) => Number(match[1]));

    if (!matches.length) {
        return 0;
    }

    return Math.max(...matches);
}

export function CampaignComposer({
    connectedNumber,
    approvedTemplates,
    recentRecipients,
}: CampaignComposerProps) {
    const initialTemplate = approvedTemplates[0];
    const initialRecipient = recentRecipients[0]?.phone ?? '';
    const [templateName, setTemplateName] = useState(initialTemplate?.name ?? '');
    const [languageCode, setLanguageCode] = useState(initialTemplate?.language ?? 'en_US');
    const [recipientPhone, setRecipientPhone] = useState(initialRecipient);
    const [bodyParameters, setBodyParameters] = useState('Kevin\n3\nhttps://suscripta.co/pay');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const selectedTemplate = useMemo(
        () => approvedTemplates.find((template) => template.name === templateName) ?? approvedTemplates[0] ?? null,
        [approvedTemplates, templateName]
    );

    const expectedVariableCount = selectedTemplate
        ? extractTemplateVariableCount(selectedTemplate.bodyText)
        : 0;

    async function handleSend() {
        setIsSending(true);
        setError(null);
        setResult(null);

        try {
            const response = await sendWhatsAppTestTemplate({
                recipientPhone,
                templateName,
                languageCode,
                bodyParameters: bodyParameters.split('\n').map((value) => value.trim()).filter(Boolean),
            });

            if (!response.ok) {
                setError(response.error);
                return;
            }

            setResult(
                `Mensaje aceptado por Meta para ${response.recipientWaId}. Message ID: ${response.messageId ?? 'unavailable'}.`
            );
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'No se pudo enviar el recordatorio.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Enviar recordatorio</h2>
                        <p className="mt-2 text-sm text-zinc-500">
                            Composer del MVP para disparar la plantilla real aprobada desde el dashboard del producto.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Numero emisor</p>
                        <p className="mt-2 text-sm font-medium text-zinc-200">
                            {connectedNumber ?? 'No conectado'}
                        </p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-200">Plantilla aprobada</label>
                        <select
                            value={templateName}
                            onChange={(event) => {
                                const nextTemplate = approvedTemplates.find(
                                    (template) => template.name === event.target.value
                                );
                                setTemplateName(event.target.value);
                                setLanguageCode(nextTemplate?.language ?? 'en_US');
                            }}
                            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40"
                        >
                            {approvedTemplates.map((template) => (
                                <option key={template.id} value={template.name}>
                                    {template.name} ({template.language})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-200">Destinatario</label>
                            <input
                                value={recipientPhone}
                                onChange={(event) => setRecipientPhone(event.target.value)}
                                placeholder="+5214621349768"
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-200">Idioma</label>
                            <input
                                value={languageCode}
                                onChange={(event) => setLanguageCode(event.target.value)}
                                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40"
                            />
                        </div>
                    </div>

                    {recentRecipients.length ? (
                        <div className="flex flex-wrap gap-2">
                            {recentRecipients.map((recipient) => (
                                <button
                                    key={recipient.phone}
                                    type="button"
                                    onClick={() => setRecipientPhone(recipient.phone)}
                                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-200"
                                >
                                    {recipient.label}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div>
                        <label className="mb-2 block text-sm font-medium text-zinc-200">Parametros del cuerpo</label>
                        <textarea
                            value={bodyParameters}
                            onChange={(event) => setBodyParameters(event.target.value)}
                            rows={5}
                            className="w-full rounded-[24px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500/40"
                        />
                        <p className="mt-2 text-xs text-zinc-500">
                            Una variable por linea. La plantilla actual espera {expectedVariableCount} variable(s).
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={isSending || !selectedTemplate}
                        onClick={() => {
                            void handleSend();
                        }}
                        className="w-full rounded-[24px] bg-emerald-500 px-5 py-4 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-800 disabled:text-black/50"
                    >
                        {isSending ? 'Enviando por Meta...' : 'Enviar recordatorio ahora'}
                    </button>
                </div>

                {result ? (
                    <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {result}
                    </div>
                ) : null}

                {error ? (
                    <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                ) : null}
            </section>

            <aside className="space-y-6">
                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="text-xl font-semibold text-white">Vista previa</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                        Asi se ve la plantilla que estas por disparar desde el MVP.
                    </p>

                    <div className="mt-5 rounded-[24px] border border-emerald-500/20 bg-emerald-500/8 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                            {selectedTemplate?.language ?? 'en_US'} · {selectedTemplate?.category ?? 'UTILITY'}
                        </p>
                        <h4 className="mt-3 text-lg font-semibold text-white">
                            {selectedTemplate?.name ?? 'Sin plantilla'}
                        </h4>
                        <p className="mt-4 text-sm leading-6 text-zinc-200">
                            {selectedTemplate?.bodyText ?? 'Selecciona una plantilla aprobada para ver la vista previa.'}
                        </p>
                    </div>
                </section>

                <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="text-xl font-semibold text-white">Flujo para video</h3>
                    <div className="mt-5 space-y-3 text-sm text-zinc-300">
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            1. Selecciona la plantilla aprobada real.
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            2. Elige tu numero como destinatario.
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                            3. Enviala y luego abre la pestana de Conversaciones para ver el evento reflejado.
                        </div>
                    </div>
                </section>
            </aside>
        </div>
    );
}
