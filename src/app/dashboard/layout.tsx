'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Inicio' },
    { href: '/dashboard/conversations', label: 'Conversaciones' },
    { href: '/dashboard/templates', label: 'Plantillas' },
    { href: '/dashboard/contacts', label: 'Contactos' },
    { href: '/dashboard/campaigns', label: 'Envios' },
    { href: '/dashboard/review', label: 'App Review' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window === 'undefined') {
            return 'dark';
        }

        return window.localStorage.getItem('suscripta-dashboard-theme') === 'light'
            ? 'light'
            : 'dark';
    });

    useEffect(() => {
        document.documentElement.dataset.dashboardTheme = theme;
        window.localStorage.setItem('suscripta-dashboard-theme', theme);
    }, [theme]);

    return (
        <div className="dashboard-shell flex h-screen overflow-hidden font-sans">
            <aside className="dashboard-sidebar flex w-72 shrink-0 flex-col border-r border-white/10 px-5 py-6 backdrop-blur-xl">
                <div className="mb-10">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#34d399,#059669)] shadow-[0_0_24px_rgba(16,185,129,0.32)]">
                            <span className="text-lg font-bold leading-none text-black">S</span>
                        </div>
                        <div>
                            <p className="text-lg font-semibold tracking-tight text-[color:var(--dashboard-text)]">Suscripta</p>
                            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--dashboard-muted)]">
                                WhatsApp retention
                            </p>
                        </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                            className="dashboard-theme-toggle rounded-full px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                        >
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>

                <nav className="space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === '/dashboard'
                                ? pathname === item.href
                                : pathname?.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                                    isActive
                                        ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-[0_12px_30px_rgba(16,185,129,0.08)]'
                                        : 'border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white'
                                }`}
                            >
                                <span>{item.label}</span>
                                <span
                                    className={`h-2.5 w-2.5 rounded-full transition ${
                                        isActive
                                            ? 'bg-emerald-400'
                                            : 'bg-zinc-700 group-hover:bg-zinc-500'
                                    }`}
                                />
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">Workspace</p>
                    <p className="mt-3 text-base font-semibold text-[color:var(--dashboard-text)]">Usuario Prueba</p>
                    <p className="mt-1 text-sm text-[color:var(--dashboard-muted)]">MVP privado para demo y App Review</p>
                </div>
            </aside>

            <main className="dashboard-main relative flex-1 overflow-y-auto">
                <div className="absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_18%)]" />
                {children}
            </main>
        </div>
    );
}
