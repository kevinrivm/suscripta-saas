export default function Conversations() {
    const dummyConversations = [
        { id: 1, name: "Juan Pérez", status: "Enviado", phone: "+52 55 1234 5678", lastMsg: "Recordatorio de pago enviado.", time: "10:30 AM" },
        { id: 2, name: "María Gómez", status: "Entregado", phone: "+52 55 8765 4321", lastMsg: "Su suscripción expira en 3 días.", time: "Ayer" },
        { id: 3, name: "Carlos Ruiz", status: "Leído", phone: "+52 55 1122 3344", lastMsg: "¡Gracias por su pago!", time: "Hace 2 días" },
    ];

    return (
        <div className="p-10 max-w-6xl mx-auto w-full h-full flex flex-col">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Conversaciones</h1>
                    <p className="text-zinc-400">Historial de recordatorios automatizados enviados desde tu cuenta.</p>
                </div>
                <div className="bg-zinc-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-zinc-300">WhatsApp Conectado</span>
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-full">
                    {/* List */}
                    <div className="border-r border-white/10 overflow-y-auto">
                        <div className="p-4 border-b border-white/10 border-solid">
                            <input
                                type="text"
                                placeholder="Buscar contacto..."
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                                disabled
                            />
                        </div>
                        {dummyConversations.map((conv) => (
                            <div key={conv.id} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors border-solid">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-sm">{conv.name}</h4>
                                    <span className="text-xs text-zinc-500">{conv.time}</span>
                                </div>
                                <p className="text-xs text-zinc-400 truncate mb-2">{conv.lastMsg}</p>
                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                                    Estado: {conv.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Detail View */}
                    <div className="hidden md:flex flex-col h-full bg-black/20">
                        <div className="p-6 border-b border-white/10 flex flex-col justify-center items-center h-full text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-zinc-500">Selecciona una conversación automatizada para ver los detalles.</p>
                            <p className="text-xs text-zinc-600 mt-2 max-w-sm">Aquí se reflegarán únicamente los envíos de recordatorios (Coexistence mode).</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
