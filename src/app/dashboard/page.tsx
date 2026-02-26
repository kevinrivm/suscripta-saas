export default function DashboardOverview() {
    return (
        <div className="p-10 max-w-5xl mx-auto w-full">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido a Suscripta</h1>
                <p className="text-zinc-400">Configura tu cuenta para empezar a reducir el churn automáticamente.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center text-center max-w-3xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/30">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-semibold mb-3">Conecta tu WhatsApp</h2>
                <p className="text-zinc-400 mb-8 max-w-lg leading-relaxed">
                    Para comenzar a enviar recordatorios de pago a tus clientes, necesitas vincular el número de tu negocio utilizando la integración oficial de Meta (Embedded Signup).
                </p>

                <button className="px-8 py-4 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                    Conectar con Meta
                </button>
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
