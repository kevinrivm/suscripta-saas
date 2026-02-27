'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CallbackData {
    code: string | null;
    waba_id: string | null;
    phone_number_id: string | null;
    [key: string]: string | null;
}

type Status = 'processing' | 'success' | 'error';

export default function OAuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<Status>('processing');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [connectionData, setConnectionData] = useState<CallbackData | null>(null);
    const hasFired = useRef(false);

    useEffect(() => {
        if (hasFired.current) return;
        hasFired.current = true;

        // 1. Capture ALL query parameters Meta sends
        const allParams: CallbackData = {
            code: searchParams.get('code'),
            waba_id: searchParams.get('waba_id'),
            phone_number_id: searchParams.get('phone_number_id'),
        };

        // Capture any additional unexpected params Meta might send
        searchParams.forEach((value, key) => {
            if (!(key in allParams)) {
                allParams[key] = value;
            }
        });

        console.log('[Suscripta OAuth Callback] Received params:', allParams);

        // 2. Check for error from Meta (e.g., user denied permission)
        const errorParam = searchParams.get('error');
        const errorReason = searchParams.get('error_reason');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
            setStatus('error');
            setErrorMsg(errorDescription ?? errorReason ?? errorParam);
            return;
        }

        if (!allParams.code) {
            setStatus('error');
            setErrorMsg('No se recibió un código de autorización de Meta. El proceso pudo haber sido cancelado o el enlace expiró.');
            return;
        }

        // 3. Exchange the temporary code for a long-lived token via our backend
        const exchangeToken = async () => {
            try {
                const response = await fetch('/api/whatsapp/exchange-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(allParams),
                });

                const result = await response.json();

                if (!response.ok || result.error) {
                    throw new Error(result.error ?? 'Error desconocido en el intercambio de token.');
                }

                setConnectionData({
                    ...allParams,
                    waba_id: result.waba_id ?? allParams.waba_id,
                    phone_number_id: result.phone_number_id ?? allParams.phone_number_id,
                });
                setStatus('success');

                // Redirect to dashboard after 4 seconds
                setTimeout(() => router.push('/dashboard'), 4000);

            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Error desconocido.';
                setStatus('error');
                setErrorMsg(msg);
            }
        };

        exchangeToken();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black font-sans px-6">
            <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(0,0,0,0))]" />

            <div className="glass-panel max-w-lg w-full rounded-2xl p-10 text-center border border-white/10">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                        <span className="text-black font-bold text-2xl leading-none">S</span>
                    </div>
                </div>

                {status === 'processing' && (
                    <>
                        <div className="flex justify-center mb-6">
                            <svg className="w-12 h-12 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-3">Procesando autorización...</h1>
                        <p className="text-zinc-400 text-sm">
                            Estamos validando tu cuenta con Meta y guardando la conexión de WhatsApp. Esto solo toma unos segundos.
                        </p>
                    </>
                )}

                {status === 'success' && connectionData && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-emerald-400">¡WhatsApp Conectado!</h1>
                        <p className="text-zinc-400 text-sm mb-8">
                            Tu número ha sido vinculado exitosamente a Suscripta. Serás redirigido al dashboard en unos segundos.
                        </p>

                        <div className="bg-black/40 rounded-xl border border-white/5 p-4 text-left space-y-3 mb-6">
                            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider mb-3">Datos recibidos de Meta</p>
                            {connectionData.waba_id && (
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-zinc-500 shrink-0">WABA ID</span>
                                    <code className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-mono truncate">{connectionData.waba_id}</code>
                                </div>
                            )}
                            {connectionData.phone_number_id && (
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-zinc-500 shrink-0">Phone Number ID</span>
                                    <code className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded font-mono truncate">{connectionData.phone_number_id}</code>
                                </div>
                            )}
                            {connectionData.code && (
                                <div className="flex justify-between items-center gap-4">
                                    <span className="text-xs text-zinc-500 shrink-0">Auth Code</span>
                                    <code className="text-xs text-zinc-600 bg-zinc-800 px-2 py-1 rounded font-mono truncate max-w-[200px]">{connectionData.code.substring(0, 24)}…</code>
                                </div>
                            )}
                            {Object.entries(connectionData)
                                .filter(([key]) => !['code', 'waba_id', 'phone_number_id'].includes(key) && connectionData[key])
                                .map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center gap-4">
                                        <span className="text-xs text-zinc-500 shrink-0 font-mono">{key}</span>
                                        <code className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded font-mono truncate max-w-[200px]">{value}</code>
                                    </div>
                                ))}
                        </div>

                        <Link
                            href="/dashboard"
                            className="inline-block w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all text-sm"
                        >
                            Ir al Dashboard →
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-red-400">Error de Vinculación</h1>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{errorMsg}</p>
                        <div className="flex flex-col gap-3">
                            <Link href="/dashboard" className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all text-sm text-center">
                                Intentar de Nuevo
                            </Link>
                            <Link href="/" className="w-full py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all text-sm text-center">
                                Volver al Inicio
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
