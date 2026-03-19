'use server';

import { createAdminClient, createClient } from '@/utils/supabase/server';
import {
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
    const connection = await getStoredConnection();

    if (!connection) {
        throw new Error('No active WhatsApp connection found.');
    }

    const recipientPhone = sanitizeRecipientPhone(input.recipientPhone);
    if (!recipientPhone) {
        throw new Error('Enter a valid recipient phone in E.164 format.');
    }

    if (!input.templateName.trim()) {
        throw new Error('Select an approved WhatsApp template.');
    }

    const bodyComponents = buildTemplateBodyComponents(input.bodyParameters ?? []);

    const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'template',
        template: {
            name: input.templateName,
            language: {
                code: input.languageCode,
            },
            ...(bodyComponents ? { components: bodyComponents } : {}),
        },
    };

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
        messageId: result.messages?.[0]?.id ?? null,
        recipientWaId: result.contacts?.[0]?.wa_id ?? recipientPhone,
        templateName: input.templateName,
    };
}

export async function createWhatsAppTemplate(input: CreateTemplateInput) {
    const connection = await getStoredConnection();

    if (!connection) {
        throw new Error('No active WhatsApp connection found.');
    }

    const normalizedName = input.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    if (!normalizedName) {
        throw new Error('Enter a valid template name using letters, numbers, or underscores.');
    }

    if (!input.bodyText.trim()) {
        throw new Error('Template body text is required.');
    }

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
                    },
                ],
            }),
        }
    );

    return {
        id: result.id ?? null,
        status: result.status ?? 'PENDING',
        category: result.category ?? input.category,
        name: normalizedName,
        language: input.language,
    };
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
