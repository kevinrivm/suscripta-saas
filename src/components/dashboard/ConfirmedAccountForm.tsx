'use client';

import type { FormEvent, ReactNode } from 'react';

type ConfirmedAccountFormProps = {
    action: (formData: FormData) => void | Promise<void>;
    children: ReactNode;
    className?: string;
    confirmMessage: string;
};

export default function ConfirmedAccountForm({
    action,
    children,
    className,
    confirmMessage,
}: ConfirmedAccountFormProps) {
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        if (!window.confirm(confirmMessage)) {
            event.preventDefault();
        }
    };

    return (
        <form action={action} onSubmit={handleSubmit} className={className}>
            {children}
        </form>
    );
}
