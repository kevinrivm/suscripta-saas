'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function getWhatsAppConnection() {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    // En producción, buscaríamos la conexión del usuario activo
    if (user) {
        const { data } = await supabaseUser
            .from('whatsapp_connections')
            .select('*')
            .eq('user_id', user.id)
            .single();
        return data || null;
    }

    // ⚠️ FALLBACK PARA PRUEBAS (DEMO):
    // Como aún no tenemos login implementado, traemos la última conexión insertada
    // usando el Admin Client para saltar el RLS (Row Level Security).
    // Esto asegura que veas el resultado en el Dashboard ahora mismo.
    const supabaseAdmin = await createAdminClient();
    const { data } = await supabaseAdmin
        .from('whatsapp_connections')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    return data || null;
}

export async function disconnectWhatsApp() {
    const supabaseUser = await createClient();
    const { data: { user } } = await supabaseUser.auth.getUser();

    const supabaseAdmin = await createAdminClient();

    if (user) {
        await supabaseAdmin
            .from('whatsapp_connections')
            .delete()
            .eq('user_id', user.id);
    } else {
        // Fallback demo: Delete all rows if no user exists so we can test again
        await supabaseAdmin
            .from('whatsapp_connections')
            .delete()
            .is('user_id', null);
    }

    return { success: true };
}
