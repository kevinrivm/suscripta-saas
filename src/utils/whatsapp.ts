const GRAPH_API_BASE_URL = "https://graph.facebook.com/v22.0";

export interface StoredWhatsAppConnection {
    id?: string;
    user_id?: string | null;
    waba_id: string;
    phone_number_id: string;
    display_phone_number?: string | null;
    verified_name?: string | null;
    access_token: string;
    is_active?: boolean | null;
    created_at?: string;
    updated_at?: string;
}

export interface WhatsAppPhoneProfile {
    id: string;
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
    code_verification_status?: string;
    name_status?: string;
    platform_type?: string;
    throughput?: {
        level?: string;
    };
}

export interface WhatsAppTemplateSummary {
    id: string;
    name: string;
    status: string;
    language: string;
    category?: string;
    sub_category?: string;
}

interface MetaGraphError {
    error?: {
        message?: string;
        type?: string;
        code?: number;
        error_subcode?: number;
    };
}

export function sanitizeRecipientPhone(input: string) {
    return input.replace(/\D/g, "");
}

export function buildTemplateBodyComponents(rawValues: string[]) {
    const parameters = rawValues
        .map((value) => value.trim())
        .filter(Boolean)
        .map((text) => ({ type: "text" as const, text }));

    if (!parameters.length) {
        return undefined;
    }

    return [
        {
            type: "body",
            parameters,
        },
    ];
}

export async function metaGraphRequest<T>(
    pathWithQuery: string,
    accessToken: string,
    init?: RequestInit
): Promise<T> {
    const normalizedPath = pathWithQuery.startsWith("/")
        ? pathWithQuery
        : `/${pathWithQuery}`;

    const response = await fetch(`${GRAPH_API_BASE_URL}${normalizedPath}`, {
        ...init,
        cache: "no-store",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
    });

    const data = (await response.json()) as T & MetaGraphError;

    if (!response.ok || data.error) {
        throw new Error(
            data.error?.message ??
            `Meta Graph API request failed with status ${response.status}.`
        );
    }

    return data;
}
