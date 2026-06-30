'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

function cleanText(value: FormDataEntryValue | null) {
    return String(value ?? '').trim();
}

export async function updateAccountProfile(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    const firstName = cleanText(formData.get('first_name'));
    const companyName = cleanText(formData.get('company_name'));

    if (!firstName || !companyName) {
        redirect('/dashboard/account?status=profile_error');
    }

    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            first_name: firstName,
            company_name: companyName,
        },
    });

    if (metadataError) {
        redirect('/dashboard/account?status=profile_error');
    }

    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            first_name: firstName,
            company_name: companyName,
        })
        .eq('id', user.id);

    if (profileError) {
        redirect('/dashboard/account?status=profile_error');
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/account');
    redirect('/dashboard/account?status=profile_saved');
}

export async function updateAccountPassword(formData: FormData) {
    const supabase = await createClient();
    const password = cleanText(formData.get('password'));
    const confirmPassword = cleanText(formData.get('confirm_password'));

    if (password.length < 6) {
        redirect('/dashboard/account?status=password_short');
    }

    if (password !== confirmPassword) {
        redirect('/dashboard/account?status=password_mismatch');
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        redirect('/dashboard/account?status=password_error');
    }

    redirect('/dashboard/account?status=password_saved');
}
