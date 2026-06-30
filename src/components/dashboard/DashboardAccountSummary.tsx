'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type AccountSummary = {
    firstName: string;
    companyName: string;
    email: string;
};

function getFallbackName(email: string) {
    const localPart = email.split('@')[0];
    return localPart ? localPart.replace(/[._-]+/g, ' ') : 'Usuario';
}

export default function DashboardAccountSummary() {
    const [account, setAccount] = useState<AccountSummary>({
        firstName: 'Usuario',
        companyName: 'Workspace Suscripta',
        email: '',
    });

    useEffect(() => {
        let mounted = true;

        const loadAccount = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user || !mounted) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, company_name')
                .eq('id', user.id)
                .maybeSingle();

            const email = user.email ?? '';
            const metadata = user.user_metadata as {
                first_name?: string;
                company_name?: string;
                full_name?: string;
            };

            setAccount({
                firstName:
                    profile?.first_name ??
                    metadata.first_name ??
                    metadata.full_name?.split(' ')[0] ??
                    getFallbackName(email),
                companyName:
                    profile?.company_name ??
                    metadata.company_name ??
                    'Workspace Suscripta',
                email,
            });
        };

        void loadAccount();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <Link
            href="/dashboard/account"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
        >
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--dashboard-muted)]">Workspace</p>
            <p className="mt-2 truncate text-base font-semibold text-[color:var(--dashboard-text)]">{account.companyName}</p>
            <p className="mt-1 truncate text-sm text-[color:var(--dashboard-muted)]">
                {account.firstName}{account.email ? ` · ${account.email}` : ''}
            </p>
        </Link>
    );
}
