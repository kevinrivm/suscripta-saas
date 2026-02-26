import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <span className="text-black font-bold text-lg leading-none">S</span>
                        </div>
                        <span className="text-xl font-semibold tracking-tight">Suscripta</span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                            Inicio
                        </Link>
                        <Link href="/dashboard/conversations" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors">
                            Conversaciones
                        </Link>
                        <Link href="/dashboard/templates" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors">
                            Plantillas
                        </Link>
                        <Link href="/dashboard/contacts" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors">
                            Contactos
                        </Link>
                        <Link href="/dashboard/campaigns" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-white/5 transition-colors">
                            Envíos
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                            <span className="text-sm font-bold">UP</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Usuario Prueba</span>
                            <span className="text-xs text-zinc-500">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
                {children}
            </main>
        </div>
    );
}
