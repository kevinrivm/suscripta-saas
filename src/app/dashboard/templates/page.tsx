export default function Templates() {
    return (
        <div className="p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Plantillas de Recordatorios</h1>
                    <p className="text-zinc-400">Sube y gestiona los mensajes que se enviarán a tus contactos.</p>
                </div>
                <button className="px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nueva Plantilla
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">Aprobada</div>
                    <h3 className="text-lg font-semibold mb-2">Aviso de Expiración - 3 Días</h3>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-sm font-mono text-zinc-300 mb-4 h-32 overflow-y-auto">
                        Hola {"{{1}}"}, te recordamos que tu suscripción vence en {"{{2}}"} días. Por favor, asegúrate de tener fondos disponibles o actualizar tu método de pago aquí: {"{{3}}"}
                    </div>
                    <p className="text-xs text-zinc-500">Variables esperadas: 1. Nombre, 2. Días, 3. Link de pago</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded-full border border-yellow-500/20">En Revisión Meta</div>
                    <h3 className="text-lg font-semibold mb-2">Día de Cobro Exitoso</h3>
                    <div className="bg-black/50 p-4 rounded-xl border border-white/5 text-sm font-mono text-zinc-300 mb-4 h-32 overflow-y-auto">
                        ¡Hola {"{{1}}"}! Hemos procesado exitosamente tu pago de {"{{2}}"}. Gracias por seguir confiando en nuestros servicios.
                    </div>
                    <p className="text-xs text-zinc-500">Variables esperadas: 1. Nombre, 2. Monto</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] transition-colors min-h-[250px]">
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-300">Crear Nueva Plantilla</h3>
                    <p className="text-sm text-zinc-500 mt-2 max-w-xs">Requiere aprobación de Meta (toma usualmente 1 a 2 horas).</p>
                </div>
            </div>
        </div>
    );
}
