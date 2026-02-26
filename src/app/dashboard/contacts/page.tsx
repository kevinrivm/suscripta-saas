export default function Contacts() {
    return (
        <div className="p-10 max-w-6xl mx-auto w-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Base de Datos de Contactos</h1>
                    <p className="text-zinc-400">Sube y previsualiza los números de tus suscriptores y las fechas de vencimiento.</p>
                </div>
                <button className="px-5 py-2.5 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Subir CSV / XLSX
                </button>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden w-full">
                {/* Empty State / Upload Drag-nDrop (Visual Only for now) */}
                {/* Let's mock a table of contacts instead so the user sees something. */}
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-sm text-zinc-300">
                        <thead className="bg-[#111] text-xs uppercase font-semibold text-zinc-500 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nombre Completo</th>
                                <th className="px-6 py-4">Número (Con Lada)</th>
                                <th className="px-6 py-4 text-emerald-400">Término de Suscripción</th>
                                <th className="px-6 py-4 text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/50">
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-500">AB-1029</td>
                                <td className="px-6 py-4 font-medium text-white">María González</td>
                                <td className="px-6 py-4">+52 55 1234 5678</td>
                                <td className="px-6 py-4 text-red-400 font-medium">15 Oct 2026</td>
                                <td className="px-6 py-4 text-right">Vencido</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-500">AB-1030</td>
                                <td className="px-6 py-4 font-medium text-white">Roberto Sánchez</td>
                                <td className="px-6 py-4">+52 33 8765 4321</td>
                                <td className="px-6 py-4 text-yellow-400 font-medium">17 Oct 2026</td>
                                <td className="px-6 py-4 text-right">Expira pronto</td>
                            </tr>
                            <tr className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-500">AB-1031</td>
                                <td className="px-6 py-4 font-medium text-white">Elena Méndez</td>
                                <td className="px-6 py-4">+52 81 1122 3344</td>
                                <td className="px-6 py-4 text-emerald-400 font-medium">30 Nov 2026</td>
                                <td className="px-6 py-4 text-right">Activo</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-white/5 bg-[#111] flex justify-between items-center text-xs text-zinc-500">
                    <span>Mostrando 3 de 102 contactos.</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10" disabled>Anterior</button>
                        <button className="px-3 py-1 bg-white/5 rounded hover:bg-white/10">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
