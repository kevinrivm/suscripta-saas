import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#050505] font-sans text-zinc-100">
            <aside className="flex w-64 flex-col border-r border-white/10 bg-black/50">
                <div className="p-6">
                    <div className="mb-8 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <span className="text-lg font-bold leading-none text-black">S</span>
                        </div>
                        <span className="text-xl font-semibold tracking-tight">Suscripta</span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link href="/dashboard" className="rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                            Inicio
                        </Link>
                        <Link href="/dashboard/conversations" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-400">
                            Conversaciones
                        </Link>
                        <Link href="/dashboard/templates" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-400">
                            Plantillas
                        </Link>
                        <Link href="/dashboard/contacts" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-400">
                            Contactos
                        </Link>
                        <Link href="/dashboard/campaigns" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-400">
                            Envios
                        </Link>
                        <Link href="/dashboard/review" className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-emerald-400">
                            App Review
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto border-t border-white/10 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                            <span className="text-sm font-bold">UP</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Usuario Prueba</span>
                            <span className="text-xs text-zinc-500">Pro Plan</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="relative flex-1 overflow-y-auto">
                <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
                {children}
            </main>
        </div>
    );
}
