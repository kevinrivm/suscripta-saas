'use server';

import { createAdminClient, createClient } from '@/utils/supabase/server';
import {
    buildRecipientPhoneCandidates,
    buildTemplateBodyComponents,
    metaGraphRequest,
    sanitizeRecipientPhone,
    type StoredWhatsAppConnection,
    type WhatsAppPhoneProfile,
    type WhatsAppTemplateSummary,
} from '@/utils/whatsapp';

interface ReviewBundle {
    connection: {
        wabaId: string;
        phoneNumberId: string;
        displayPhoneNumber?: string | null;
        verifiedName?: string | null;
        status?: string | null;
    } | null;
    phoneProfile: WhatsAppPhoneProfile | null;
    templates: WhatsAppTemplateSummary[];
}

interface SendTestTemplateInput {
    recipientPhone: string;
    templateName: string;
    languageCode: string;
    bodyParameters?: string[];
}

interface CreateTemplateInput {
    name: string;
    language: string;
    category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
    bodyText: string;
}

function hasValidTemplateLanguage(language: string) {
    return /^[a-z]{2}(?:_[A-Z]{2})?$/.test(language.trim());
}

function buildTemplateBodyExample(bodyText: string) {
    const matches = [...bodyText.matchAll(/\{\{(\d+)\}\}/g)];

    if (!matches.length) {
        return undefined;
    }

    const highestIndex = matches.reduce((max, match) => {
        const value = Number(match[1]);
        return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);

    if (!highestIndex) {
        return undefined;
    }

    const sampleValues = Array.from({ length: highestIndex }, (_, index) => {
        const fallbackExamples = [
            'Kevin',
            '3',
            'https://suscripta.co/pay',
            'March 25',
            '$49.00',
        ];

        return fallbackExamples[index] ?? `sample_${index + 1}`;
    });

    return {
        body_text: [sampleValues],
    };
}

function hasLeadingOrTrailingTemplateVariable(bodyText: string) {
    const trimmed = bodyText.trim();
    return /^\{\{\d+\}\}/.test(trimmed) || /\{\{\d+\}\}$/.test(trimmed);
}

function hasAdjacentTemplateVariables(bodyText: string) {
    return /\}\}\s*\{\{/.test(bodyText);
}

function hasSequentialTemplateVariables(bodyText: string) {
    const indexes = [...bodyText.matchAll(/\{\{(\d+)\}\}/g)]
        .map((match) => Number(match[1]))
        .filter((value) => Number.isFinite(value));

    if (!indexes.length) {
        return true;
    }

    const uniqueIndexes = [...new Set(indexes)].sort((left, right) => left - right);
    return uniqueIndexes.every((value, index) => value === index + 1);
}

async function getStoredConnection(): Promise<StoredWhatsAppConnection | null> {
    const supabaseUser = await createClient();
    const {
        data: { user },
    } = await supabaseUser.auth.getUser();

    if (user) {
        const { data } = await supabaseUser
            .from('whatsapp_connections')
            .select('*')
            .eq('user_id', user.id)
            .single();

        return (data as StoredWhatsAppConnection | null) ?? null;
    }

    const supabaseAdmin = await createAdminClient();
    const { data } = await supabaseAdmin
        .from('whatsapp_connections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return (data as StoredWhatsAppConnection | null) ?? null;
}

export async function getWhatsAppConnection() {
    const connection = await getStoredConnection();

    if (!connection) {
        return null;
    }

    return {
        waba_id: connection.waba_id,
        phone_number_id: connection.phone_number_id,
        display_phone_number: connection.display_phone_number ?? null,
        verified_name: connection.verified_name ?? null,
        is_active: connection.is_active ?? true,
    };
}

export async function getWhatsAppReviewBundle(): Promise<ReviewBundle> {
    const connection = await getStoredConnection();

    if (!connection) {
        return {
            connection: null,
            phoneProfile: null,
            templates: [],
        };
    }

    const [phoneProfile, templatesResponse] = await Promise.all([
        metaGraphRequest<WhatsAppPhoneProfile>(
            `/${connection.phone_number_id}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,name_status,platform_type,throughput`,
            connection.access_token
        ),
        metaGraphRequest<{ data?: WhatsAppTemplateSummary[] }>(
            `/${connection.waba_id}/message_templates?fields=id,name,status,language,category,sub_category&limit=50`,
            connection.access_token
        ),
    ]);

    return {
        connection: {
            wabaId: connection.waba_id,
            phoneNumberId: connection.phone_number_id,
            displayPhoneNumber: connection.display_phone_number ?? phoneProfile.display_phone_number ?? null,
            verifiedName: connection.verified_name ?? phoneProfile.verified_name ?? null,
            status: connection.is_active ? 'active' : 'inactive',
        },
        phoneProfile,
        templates: (templatesResponse.data ?? []).sort((left, right) =>
            left.name.localeCompare(right.name)
        ),
    };
}

export async function sendWhatsAppTestTemplate(input: SendTestTemplateInput) {
    try {
        const connection = await getStoredConnection();

        if (!connection) {
            return {
                ok: false as const,
                error: 'No active WhatsApp connection found.',
            };
        }

        const recipientPhone = sanitizeRecipientPhone(input.recipientPhone);
        const recipientCandidates = buildRecipientPhoneCandidates(input.recipientPhone);

        if (!recipientPhone || !recipientCandidates.length) {
            return {
                ok: false as const,
                error: 'Enter a valid recipient phone in E.164 format.',
            };
        }

        if (!input.templateName.trim()) {
            return {
                ok: false as const,
                error: 'Select an approved WhatsApp template.',
            };
        }

        if (!hasValidTemplateLanguage(input.languageCode)) {
            return {
                ok: false as const,
                error: 'Use a valid Meta language code such as en_US or es_MX.',
            };
        }

        const bodyComponents = buildTemplateBodyComponents(input.bodyParameters ?? []);

        let lastError: Error | null = null;

        for (const candidate of recipientCandidates) {
            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: candidate,
                type: 'template',
                template: {
                    name: input.templateName,
                    language: {
                        code: input.languageCode,
                    },
                    ...(bodyComponents ? { components: bodyComponents } : {}),
                },
            };

            try {
                const result = await metaGraphRequest<{
                    messages?: Array<{ id: string }>;
                    contacts?: Array<{ wa_id?: string; input?: string }>;
                }>(
                    `/${connection.phone_number_id}/messages`,
                    connection.access_token,
                    {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    }
                );

                return {
                    ok: true as const,
                    messageId: result.messages?.[0]?.id ?? null,
                    recipientWaId: result.contacts?.[0]?.wa_id ?? candidate,
                    templateName: input.templateName,
                };
            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Meta message send failed.');
                if (!lastError.message.includes('Account not registered')) {
                    throw lastError;
                }
            }
        }

        throw lastError ?? new Error('Meta message send failed.');
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Meta message send failed.';
        const friendlyMessage = message.includes('Account not registered')
            ? 'The recipient number could not be resolved by Meta, even after trying the supported phone formats for this country. Verify that the destination is a real WhatsApp account, that it can receive WhatsApp messages, and that your current sender environment is allowed to message it.'
            : message;

        return {
            ok: false as const,
            error: friendlyMessage,
        };
    }
}

export async function createWhatsAppTemplate(input: CreateTemplateInput) {
    try {
        const connection = await getStoredConnection();

        if (!connection) {
            return {
                ok: false as const,
                error: 'No active WhatsApp connection found.',
            };
        }

        const normalizedName = input.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');

        if (!normalizedName) {
            return {
                ok: false as const,
                error: 'Enter a valid template name using letters, numbers, or underscores.',
            };
        }

        if (!hasValidTemplateLanguage(input.language)) {
            return {
                ok: false as const,
                error: 'Use a valid Meta language code such as en_US or es_MX.',
            };
        }

        if (!input.bodyText.trim()) {
            return {
                ok: false as const,
                error: 'Template body text is required.',
            };
        }

        if (hasLeadingOrTrailingTemplateVariable(input.bodyText)) {
            return {
                ok: false as const,
                error: 'Template variables cannot appear at the very start or end of the message body. Add regular text before the first variable and after the last one.',
            };
        }

        if (hasAdjacentTemplateVariables(input.bodyText)) {
            return {
                ok: false as const,
                error: 'Template variables cannot be adjacent. Add normal text or punctuation between placeholders.',
            };
        }

        if (!hasSequentialTemplateVariables(input.bodyText)) {
            return {
                ok: false as const,
                error: 'Template variables must be sequential and start at {{1}}.',
            };
        }

        const bodyExample = buildTemplateBodyExample(input.bodyText.trim());

        const result = await metaGraphRequest<{
            id?: string;
            status?: string;
            category?: string;
        }>(
            `/${connection.waba_id}/message_templates`,
            connection.access_token,
            {
                method: 'POST',
                body: JSON.stringify({
                    name: normalizedName,
                    language: input.language,
                    category: input.category,
                    allow_category_change: true,
                    components: [
                        {
                            type: 'BODY',
                            text: input.bodyText.trim(),
                            ...(bodyExample ? { example: bodyExample } : {}),
                        },
                    ],
                }),
            }
        );

        return {
            ok: true as const,
            id: result.id ?? null,
            status: result.status ?? 'PENDING',
            category: result.category ?? input.category,
            name: normalizedName,
            language: input.language,
        };
    } catch (error) {
        return {
            ok: false as const,
            error: error instanceof Error ? error.message : 'Template creation failed.',
        };
    }
}

export async function disconnectWhatsApp() {
    const supabaseUser = await createClient();
    const {
        data: { user },
    } = await supabaseUser.auth.getUser();

    const supabaseAdmin = await createAdminClient();

    if (user) {
        await supabaseAdmin
            .from('whatsapp_connections')
            .delete()
            .eq('user_id', user.id);
    } else {
        await supabaseAdmin
            .from('whatsapp_connections')
            .delete()
            .is('user_id', null);
    }

    return { success: true };
}
