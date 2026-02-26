export default function Campaigns() {
    return (
        <div className="p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Programar Recordatorios</h1>
                    <p className="text-zinc-400">Automatiza envíos masivos basándote en la fecha de suscripción de tu base de datos.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                {/* Form */}
                <div className="glass-panel p-8 rounded-2xl border border-white/5">
                    <form className="flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Segmento de Contactos</label>
                            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none text-zinc-200">
                                <option value="">Expiran en los próximos 7 días</option>
                                <option value="">Expiran hoy</option>
                                <option value="">Ya vencidos (Recuperación)</option>
                                <option value="">Todos los contactos activos</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Plantilla a Utilizar</label>
                            <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none text-zinc-200">
                                <option value="1">Plantilla: Aviso de Expiración - 3 Días</option>
                                <option value="2">Plantilla: Enlace de Renovación</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Fecha y Hora de Envío</label>
                            <div className="flex gap-4">
                                <input
                                    type="date"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-zinc-200 [color-scheme:dark]"
                                />
                                <input
                                    type="time"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 text-zinc-200 [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 mt-2">
                            <button
                                type="button"
                                className="w-full px-8 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all font-sans text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
                            >
                                Agendar Envío Automatizado
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Summary */}
                <div className="flex flex-col gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Resumen de Campaña</h3>
                        <ul className="text-sm text-zinc-400 flex flex-col gap-3">
                            <li className="flex justify-between"><span>Destinatarios Estimados:</span> <span className="text-emerald-400 font-medium font-mono">245</span></li>
                            <li className="flex justify-between"><span>Costo Aprox Meta:</span> <span className="font-mono text-white">$ 12.50 USD</span></li>
                            <li className="flex justify-between mt-2 pt-2 border-t border-white/5"><span>Canal de Envío:</span> <span className="font-medium text-white">Mi Número Comercial (+52 55...)</span></li>
                        </ul>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <h3 className="flex items-center gap-2 font-semibold text-indigo-300 mb-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Consejo de Meta API
                        </h3>
                        <p className="text-xs text-indigo-200 leading-relaxed">Verifica el consentimiento de opt-in. Meta puede restringir el uso del "Embedded Signup" si tus usuarios bloquean frecuentemente tus automatizaciones de cobranza.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
