'use client';

import { useState, useEffect } from 'react';
import { EmbeddedSignupButton } from '@/components/EmbeddedSignupButton';
import { getWhatsAppConnection, disconnectWhatsApp } from '@/app/actions/whatsapp';


interface ConnectionStatus {
    wabaId: string;
    phoneNumberId: string;
    displayPhoneNumber?: string | null;
    verifiedName?: string | null;
    status?: string | null; // active
}

export default function DashboardOverview() {
    const [connection, setConnection] = useState<ConnectionStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchConnection() {
            try {
                const data = await getWhatsAppConnection();
                if (data) {
                    setConnection({
                        wabaId: data.waba_id,
                        phoneNumberId: data.phone_number_id,
                        displayPhoneNumber: data.display_phone_number,
                        verifiedName: data.verified_name,
                        status: data.is_active ? 'activo' : 'inactivo'
                    });
                }
            } catch (err) {
                console.error("No se pudo cargar la conexión de WhatsApp", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchConnection();
    }, []);

    const handleSuccess = (wabaId: string, phoneNumberId: string) => {
        setConnection({ wabaId, phoneNumberId });
        setError(null);
    };

    const handleError = (msg: string) => {
        setError(msg);
    };

    const handleDisconnect = async () => {
        const confirmed = confirm("¿Estás seguro que deseas desconectar tu número? Dejarás de enviar recordatorios.");
        if (confirmed) {
            setIsLoading(true);
            try {
                await disconnectWhatsApp();
                setConnection(null);
            } catch (err) {
                console.error("Error al desconectar", err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="p-10 max-w-5xl mx-auto w-full">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido a Suscripta</h1>
                <p className="text-zinc-400">Configura tu cuenta para empezar a reducir el churn automáticamente.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <svg className="w-10 h-10 text-emerald-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <p className="text-zinc-400">Verificando conexión de WhatsApp...</p>
                    </div>
                ) : connection ? (
                    // ✅ Success State
                    <>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/40">
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold mb-2 text-emerald-400">¡Número Conectado!</h2>

                        {connection.displayPhoneNumber ? (
                            <div className="mb-6 flex flex-col items-center">
                                <span className="text-3xl font-bold tracking-tight text-white mb-1">
                                    {connection.displayPhoneNumber}
                                </span>
                                {connection.verifiedName && (
                                    <span className="text-sm font-medium text-emerald-300">
                                        {connection.verifiedName}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <p className="text-zinc-300 mb-6 max-w-lg leading-relaxed">
                                Tu cuenta de WhatsApp Business ha sido conectada exitosamente a Suscripta.
                            </p>
                        )}

                        <div className="w-full bg-black/30 rounded-xl p-4 text-left text-sm font-mono space-y-3 border border-white/5">
                            {connection.status && (
                                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                    <span className="text-zinc-500 font-sans">Estado</span>
                                    <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-sans font-medium text-xs uppercase flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        {connection.status}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">WABA ID</span>
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">{connection.wabaId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500">Phone Number ID</span>
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">{connection.phoneNumberId}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleDisconnect}
                            className="mt-6 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                        >
                            Desconectar Número
                        </button>
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
