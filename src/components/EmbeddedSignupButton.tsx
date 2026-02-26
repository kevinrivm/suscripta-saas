'use client';

import { useEffect, useCallback } from 'react';

// Augment window type for the Facebook SDK
declare global {
    interface Window {
        FB: {
            init: (options: object) => void;
            login: (callback: (response: FBLoginResponse) => void, options: object) => void;
        };
        fbAsyncInit: () => void;
    }
}

interface FBLoginResponse {
    authResponse?: {
        code?: string;
    };
    status: string;
}

interface EmbeddedSignupData {
    data?: {
        waba_id?: string;
        phone_number_id?: string;
    };
    type?: string;
}

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!;
const CONFIG_ID = '1585204056102996';

interface EmbeddedSignupButtonProps {
    onSuccess?: (wabaId: string, phoneNumberId: string) => void;
    onError?: (error: string) => void;
}

export function EmbeddedSignupButton({ onSuccess, onError }: EmbeddedSignupButtonProps) {

    useEffect(() => {
        // Load the Facebook SDK
        if (document.getElementById('facebook-jssdk')) return;

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: FACEBOOK_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: 'v22.0',
            });
        };

        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        // Listen for messages from the embedded signup popup
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== 'https://www.facebook.com') return;

            try {
                const data: EmbeddedSignupData = JSON.parse(event.data);
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    const wabaId = data.data?.waba_id ?? '';
                    const phoneNumberId = data.data?.phone_number_id ?? '';
                    if (wabaId && phoneNumberId) {
                        onSuccess?.(wabaId, phoneNumberId);
                    }
                }
            } catch {
                // Not a JSON message, ignore
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onSuccess]);

    const launchEmbeddedSignup = useCallback(() => {
        if (!window.FB) {
            onError?.('El SDK de Facebook aún no cargó. Intenta de nuevo en un momento.');
            return;
        }

        window.FB.login(
            (response: FBLoginResponse) => {
                if (response.authResponse?.code) {
                    // The auth code can be exchanged for a permanent token on the backend
                    console.log('[Suscripta] Auth code received:', response.authResponse.code);
                    // Typically you'd POST this code to your API here
                    // fetch('/api/whatsapp/exchange-token', { method: 'POST', body: JSON.stringify({ code }) })
                } else {
                    onError?.('El proceso de vinculación fue cancelado o falló. Por favor intenta de nuevo.');
                }
            },
            {
                config_id: CONFIG_ID,
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    setup: {
                        // Coexistence mode - allows using WhatsApp alongside existing app
                    },
                    featureType: 'coexistence',
                    sessionInfoVersion: '3',
                },
            }
        );
    }, [onError]);

    return (
        <button
            onClick={launchEmbeddedSignup}
            className="px-8 py-4 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 flex items-center gap-3 text-lg"
        >
            <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            Conectar con Meta
        </button>
    );
}
