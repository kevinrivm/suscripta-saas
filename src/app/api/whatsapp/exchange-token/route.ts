import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/whatsapp/exchange-token
 *
 * Exchanges the short-lived `code` received from Meta's Embedded Signup
 * for a long-lived customer-scoped WhatsApp System User Token.
 *
 * Meta Graph API endpoint:
 *   POST https://graph.facebook.com/v22.0/oauth/access_token
 *   Params: client_id, client_secret, code, redirect_uri (must match exactly)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, waba_id, phone_number_id } = body;

        if (!code) {
            return NextResponse.json({ error: 'Missing required parameter: code' }, { status: 400 });
        }

        const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI;

        if (!appId || !appSecret || !redirectUri) {
            console.error('[Suscripta] Missing env vars:', { appId: !!appId, appSecret: !!appSecret, redirectUri: !!redirectUri });
            return NextResponse.json(
                { error: 'Server configuration error: missing environment variables.' },
                { status: 500 }
            );
        }

        // Exchange the temporary code for a long-lived access token
        const tokenUrl = new URL('https://graph.facebook.com/v22.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', appId);
        tokenUrl.searchParams.set('client_secret', appSecret);
        tokenUrl.searchParams.set('code', code);
        tokenUrl.searchParams.set('redirect_uri', redirectUri);

        const tokenResponse = await fetch(tokenUrl.toString(), { method: 'GET' });
        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error('[Suscripta] Token exchange failed:', tokenData.error);
            return NextResponse.json(
                { error: `Meta token exchange failed: ${tokenData.error.message}` },
                { status: 400 }
            );
        }

        const { access_token, token_type } = tokenData;

        // TODO: Store access_token, waba_id, phone_number_id in your database
        // associated with the authenticated user's account.
        // Example: await db.whatsappConnections.upsert({ userId, wabaId: waba_id, phoneNumberId: phone_number_id, accessToken: access_token })

        console.log('[Suscripta] WhatsApp connection successful:', {
            waba_id,
            phone_number_id,
            token_type,
            access_token_preview: access_token?.substring(0, 20) + '...',
        });

        return NextResponse.json({
            success: true,
            waba_id,
            phone_number_id,
            token_type,
            // Never return the raw access_token to the client in production!
            // Return only metadata.
            message: 'WhatsApp Business Account connected successfully.',
        });

    } catch (error) {
        console.error('[Suscripta] Unexpected error in token exchange:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
