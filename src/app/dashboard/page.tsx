'use client';

import { useState } from 'react';
import { EmbeddedSignupButton } from '@/components/EmbeddedSignupButton';

interface ConnectionStatus {
    wabaId: string;
    phoneNumberId: string;
}

export default function DashboardOverview() {
    const [connection, setConnection] = useState<ConnectionStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSuccess = (wabaId: string, phoneNumberId: string) => {
        setConnection({ wabaId, phoneNumberId });
        setError(null);
    };

    const handleError = (msg: string) => {
        setError(msg);
    };

    return (
        <div className="p-10 max-w-5xl mx-auto w-full">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido a Suscripta</h1>
                <p className="text-zinc-400">Configura tu cuenta para empezar a reducir el churn automáticamente.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">

                {connection ? (
                    // ✅ Success State
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/40">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-3 text-emerald-400">¡Número Vinculado!</h2>
                        <p className="text-zinc-300 mb-6 max-w-lg leading-relaxed">
                            Tu cuenta de WhatsApp Business ha sido conectada exitosamente a Suscripta.
                        </p>
                        <div className="w-full bg-black/30 rounded-xl p-4 text-left text-sm font-mono space-y-2 border border-white/5">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">WABA ID</span>
                                <span className="text-emerald-400">{connection.wabaId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Phone Number ID</span>
                                <span className="text-emerald-400">{connection.phoneNumberId}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    // 🔌 Default: Connect State
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/30">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-3">Conecta tu WhatsApp</h2>
                        <p className="text-zinc-400 mb-8 max-w-lg leading-relaxed">
                            Para comenzar a enviar recordatorios de pago a tus clientes, necesitas vincular el número de tu negocio utilizando la integración oficial de Meta (Embedded Signup).
                        </p>

                        {error && (
                            <div className="mb-6 w-full text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                                {error}
                            </div>
                        )}

                        <EmbeddedSignupButton onSuccess={handleSuccess} onError={handleError} />

                        <p className="mt-5 text-xs text-zinc-600 max-w-sm">
                            Utilizamos el registro insertado oficial de Meta con modo Coexistence. Tu número permanece en tu Business Manager en todo momento.
                        </p>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">Contactos Importados</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">Recordatorios Enviados</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-zinc-400 text-sm font-medium mb-1">Tasa de Recuperación</h3>
                    <p className="text-3xl font-bold">--%</p>
                </div>
            </div>
        </div>
    );
}
