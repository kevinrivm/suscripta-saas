'use server';

import { createClient } from '@/utils/supabase/server';
import { getAnchorDayFromPaymentDate, getInitialNextPaymentDate, parsePaymentDay } from '@/utils/customers/billing-cycles';
import {
    customFieldDefinitionsEqual,
    normalizeCustomFieldDefinitions,
    sanitizeCustomFieldValues,
    type CustomFieldDefinition,
    type CustomFieldKey,
    type CustomFieldValues,
} from '@/utils/customers/custom-fields';

/*
    ================================================================================
    NOTA DE ARQUITECTURA PARA EL DESARROLLADOR BACKEND:
    ================================================================================
    IMPORTANTE: El motor de envíos de WhatsApp (cron jobs, colas o triggers)
    SOLO deberá procesar y enviar recordatorios a clientes activos cuyo
    `payment_status` sea 'pending'. La condición 'overdue' NO es un estado
    manual: se deriva de `next_payment_date < hoy`. Un proceso automático
    debe avanzar `next_payment_date` al iniciar cada nuevo ciclo.

    Cualquier cliente con `payment_status` === 'paid' o 'cancelled' DEBE ser 
    estrictamente excluido del embudo de notificaciones de cobranza.
    ================================================================================
*/

interface CustomerInsertInput {
    phoneNumber: string;
    firstName: string;
    lastName1?: string | null;
    lastName2?: string | null;
    payment_status?: CustomerPaymentStatus;
    billingCycle?: string | null;
    nextPaymentDate?: string | null;
    paymentDay?: string | number | null;
    customFields?: CustomFieldValues | null;
}

type CustomerPaymentStatus = 'pending' | 'paid' | 'cancelled';

interface CustomerUpsertPayload {
    user_id: string;
    phone_number: string;
    first_name: string;
    last_name_1: string | null;
    last_name_2: string | null;
    deleted_at: string | null;
    is_active: boolean;
    inactive_at: string | null;
    billing_cycle?: string;
    next_payment_date?: string;
    anchor_day?: number;
    custom_fields?: CustomFieldValues;
}

interface CustomerCycleUpdatePayload {
    billing_cycle: string;
    next_payment_date: string | null;
}

interface CustomerReschedulePayload {
    next_payment_date: string;
    anchor_day?: number;
}

async function getCustomFieldDefinitionsForUser(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
    const { data, error } = await supabase
        .from('customer_custom_field_configs')
        .select('fields')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) throw error;
    return normalizeCustomFieldDefinitions(data?.fields ?? []);
}

async function upsertCustomFieldConfig(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    definitions: CustomFieldDefinition[],
) {
    const { error } = await supabase
        .from('customer_custom_field_configs')
        .upsert({
            user_id: userId,
            fields: definitions,
            locked_at: definitions.length > 0 ? new Date().toISOString() : null,
        }, { onConflict: 'user_id' });

    if (error) throw error;
}

export async function getCustomerCustomFieldConfig() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return { ok: false, error: 'Acceso no autorizado.', fields: [] as CustomFieldDefinition[] };

        const fields = await getCustomFieldDefinitionsForUser(supabase, user.id);
        return { ok: true, fields };
    } catch (error) {
        console.error('[Suscripta] Error leyendo configuración de campos personalizados:', error);
        return { ok: false, error: 'No se pudo leer la configuración de campos personalizados.', fields: [] as CustomFieldDefinition[] };
    }
}

export async function uploadCustomersBatch(
    customers: CustomerInsertInput[],
    mode: 'append' | 'overwrite' = 'append',
    customFieldDefinitions: CustomFieldDefinition[] = [],
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('[Suscripta] Auth Error:', userError);
            return { ok: false, error: `Acceso no autorizado: ${userError?.message || 'Sesión no encontrada'}` };
        }

        if (!customers || customers.length === 0) {
            return { ok: false, error: 'No hay clientes válidos para importar.' };
        }

        const existingCustomFieldDefinitions = await getCustomFieldDefinitionsForUser(supabase, user.id);
        const incomingCustomFieldDefinitions = normalizeCustomFieldDefinitions(customFieldDefinitions);
        let activeCustomFieldDefinitions = existingCustomFieldDefinitions;

        if (mode === 'overwrite') {
            activeCustomFieldDefinitions = incomingCustomFieldDefinitions;
            await upsertCustomFieldConfig(supabase, user.id, activeCustomFieldDefinitions);
        } else if (existingCustomFieldDefinitions.length > 0) {
            if (
                incomingCustomFieldDefinitions.length > 0
                && !customFieldDefinitionsEqual(existingCustomFieldDefinitions, incomingCustomFieldDefinitions)
            ) {
                return {
                    ok: false,
                    error: 'Tu estructura de campos personalizados ya está bloqueada. Usa Sobrescribir Completo para reemplazarla.',
                };
            }
            activeCustomFieldDefinitions = existingCustomFieldDefinitions;
        } else if (incomingCustomFieldDefinitions.length > 0) {
            activeCustomFieldDefinitions = incomingCustomFieldDefinitions;
            await upsertCustomFieldConfig(supabase, user.id, activeCustomFieldDefinitions);
        }

        // Formatear payload para la base de datos
        const CYCLE_MAP: Record<string, string> = {
            semanal: 'weekly', quincenal: 'biweekly', 'cada 15 días': 'biweekly',
            mensual: 'monthly', bimestral: 'bimonthly', 'cada 2 meses': 'bimonthly',
            trimestral: 'quarterly', 'cada 3 meses': 'quarterly',
            semestral: 'biannual', 'cada 6 meses': 'biannual',
            anual: 'annual', 'al año': 'annual',
            weekly: 'weekly', biweekly: 'biweekly', monthly: 'monthly',
            bimonthly: 'bimonthly', quarterly: 'quarterly', biannual: 'biannual', annual: 'annual',
        };

        const payload = customers.map((c) => {
            const paymentDay = parsePaymentDay(c.paymentDay);
            const row: CustomerUpsertPayload = {
                user_id: user.id,
                phone_number: c.phoneNumber,
                first_name: c.firstName,
                last_name_1: c.lastName1 || null,
                last_name_2: c.lastName2 || null,
                deleted_at: null,
                is_active: true,
                inactive_at: null
            };
            if (c.billingCycle) {
                const normalized = CYCLE_MAP[c.billingCycle.toLowerCase().trim()];
                // Solo guardar si el ciclo es reconocido; si no, dejar null para revisión manual
                if (normalized) row.billing_cycle = normalized;
            }
            const validPaymentDay = paymentDay && paymentDay >= 1 && paymentDay <= 31
                && (row.billing_cycle === 'weekly' || row.billing_cycle === 'biweekly' ? paymentDay <= 7 : true);
            if (c.nextPaymentDate) {
                row.next_payment_date = c.nextPaymentDate;
            } else if (validPaymentDay && row.billing_cycle) {
                const calculatedDate = getInitialNextPaymentDate({
                    paymentDay,
                    billingCycle: row.billing_cycle,
                });
                if (calculatedDate) row.next_payment_date = calculatedDate;
            }
            const anchorDay = validPaymentDay
                ? paymentDay
                : getAnchorDayFromPaymentDate(row.next_payment_date, row.billing_cycle);
            if (anchorDay) row.anchor_day = anchorDay;
            row.custom_fields = sanitizeCustomFieldValues(c.customFields, activeCustomFieldDefinitions);
            return row;
        });

        // Aplicar modo 'overwrite' (Soft Delete en cascada antes del upsert)
        if (mode === 'overwrite') {
            const { error: deleteError } = await supabase
                .from('customers')
                .update({ deleted_at: new Date().toISOString(), is_active: false, custom_fields: {} })
                .eq('user_id', user.id)
                .is('deleted_at', null);

            if (deleteError) {
                console.error('[Suscripta] Error en sobrescritura:', deleteError);
                return { ok: false, error: 'No se pudieron archivar los clientes actuales.' };
            }
        }

        // Insertar previniendo duplicados exactos (Upsert con conflicto en user_id y phone_number)
        const { error } = await supabase
            .from('customers')
            .upsert(payload, { 
                onConflict: 'user_id,phone_number',
                ignoreDuplicates: false // Actualizará el nombre si el número ya existe
            });

        if (error) {
            console.error('[Suscripta] Error en carga masiva de clientes:', error);
            return { ok: false, error: 'Hubo un error de base de datos al importar: ' + error.message };
        }

        return { ok: true, count: payload.length };
    } catch (error) {
        console.error('[Suscripta] Excepción de carga masiva', error);
        return { ok: false, error: 'Error desconocido durante la importación masiva.' };
    }
}

// Acción de servidor para hacer Toggle de Pago
export async function updateCustomerPaymentStatus(customerId: string, newStatus: CustomerPaymentStatus) {
    try {
        const supabase = await createClient();
        
        const { error } = await supabase
            .from('customers')
            .update({ payment_status: newStatus })
            .eq('id', customerId);

        if (error) {
            console.error('[Suscripta] Error actualizando estado de pago:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true };
    } catch (error) {
        console.error('[Suscripta] Excepción actualizando pago', error);
        return { ok: false, error: 'Error desconocido al actualizar pago.' };
    }
}

export async function bulkUpdateCustomerPaymentStatus(customerIds: string[], newStatus: CustomerPaymentStatus) {
    try {
        if (!customerIds.length) return { ok: false, error: 'No hay clientes seleccionados.' };

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { ok: false, error: 'Acceso no autorizado.' };
        }

        const { error } = await supabase
            .from('customers')
            .update({ payment_status: newStatus })
            .eq('user_id', user.id)
            .in('id', customerIds);

        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error al actualizar clientes seleccionados.' };
    }
}

// Acción de servidor para hacer Inline Edit de Ciclo y Fecha
export async function updateCustomerCycle(customerId: string, billingCycle: string, nextPaymentDate: string | null) {
    try {
        const supabase = await createClient();
        
        const payload: CustomerCycleUpdatePayload = { billing_cycle: billingCycle, next_payment_date: nextPaymentDate || null };

        const { error } = await supabase
            .from('customers')
            .update(payload)
            .eq('id', customerId);

        if (error) {
            console.error('[Suscripta] Error actualizando ciclo:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true };
    } catch (error) {
        console.error('[Suscripta] Excepción actualizando ciclo', error);
        return { ok: false, error: 'Error desconocido al actualizar ciclo de facturación.' };
    }
}

/**
 * Reprogramar la fecha de pago de un cliente con dos modos:
 * - 'extension': Prórroga única. Solo actualiza next_payment_date.
 * - 'permanent': Cambio permanente. Actualiza next_payment_date Y fija anchor_day
 *   extrayendo el día de la nueva fecha seleccionada.
 */
export async function reschedulePaymentDate(
    customerId: string,
    newDate: string,          // Formato YYYY-MM-DD
    mode: 'extension' | 'permanent'
) {
    try {
        const supabase = await createClient();

        const payload: CustomerReschedulePayload = {
            next_payment_date: newDate,
        };

        if (mode === 'permanent') {
            // Extraer el día del mes de la nueva fecha (1-31)
            const dayOfMonth = new Date(newDate + 'T12:00:00').getDate();
            payload.anchor_day = dayOfMonth;
        }

        const { error } = await supabase
            .from('customers')
            .update(payload)
            .eq('id', customerId);

        if (error) {
            console.error('[Suscripta] Error reprogramando fecha:', error);
            return { ok: false, error: error.message };
        }

        return { ok: true };
    } catch (error) {
        console.error('[Suscripta] Excepción en reschedulePaymentDate:', error);
        return { ok: false, error: 'Error desconocido al reprogramar fecha.' };
    }
}

// Backend - Mover a Papelera (Soft Delete)
export async function softDeleteCustomer(customerId: string) {
    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('customers')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('id', customerId);
        
        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error al enviar a papelera.' };
    }
}

export async function bulkSoftDeleteCustomers(customerIds: string[]) {
    try {
        if (!customerIds.length) return { ok: false, error: 'No hay clientes seleccionados.' };

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { ok: false, error: 'Acceso no autorizado.' };
        }

        const { error } = await supabase
            .from('customers')
            .update({ deleted_at: new Date().toISOString(), is_active: false })
            .eq('user_id', user.id)
            .in('id', customerIds);

        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error al enviar clientes seleccionados a papelera.' };
    }
}

// Backend - Inactivar / Pausar
export async function toggleCustomerActiveStatus(customerId: string, makeActive: boolean) {
    try {
        const supabase = await createClient();
        const payload = {
            is_active: makeActive,
            inactive_at: makeActive ? null : new Date().toISOString()
        };
        const { error } = await supabase
            .from('customers')
            .update(payload)
            .eq('id', customerId);
        
        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error al cambiar estado de actividad.' };
    }
}

export async function bulkUpdateCustomerActiveStatus(customerIds: string[], makeActive: boolean) {
    try {
        if (!customerIds.length) return { ok: false, error: 'No hay clientes seleccionados.' };

        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { ok: false, error: 'Acceso no autorizado.' };
        }

        const { error } = await supabase
            .from('customers')
            .update({
                is_active: makeActive,
                inactive_at: makeActive ? null : new Date().toISOString()
            })
            .eq('user_id', user.id)
            .in('id', customerIds);

        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error al cambiar estatus de clientes seleccionados.' };
    }
}

// Backend - Añadir Cliente Manual (Unitario)
export async function addManualCustomer(customer: {
    phoneNumber: string;
    firstName: string;
    lastName1?: string;
    lastName2?: string;
    billingCycle: string;
    nextPaymentDate?: string | null;
    paymentDay?: string | number | null;
    customFields?: CustomFieldValues | null;
}) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('[Suscripta] Manual Add Auth Error:', userError);
            return { ok: false, error: 'Acceso no autorizado: ' + (userError?.message || 'No se encontró sesión activa') };
        }

        if (!customer.phoneNumber || !customer.firstName || !customer.billingCycle) {
            return { ok: false, error: 'Teléfono, Nombre(s) y Frecuencia de pago son obligatorios.' };
        }

        const paymentDay = parsePaymentDay(customer.paymentDay);
        const validPaymentDay = paymentDay && paymentDay >= 1 && paymentDay <= 31
            && (customer.billingCycle === 'weekly' || customer.billingCycle === 'biweekly' ? paymentDay <= 7 : true);
        const nextPaymentDate = customer.nextPaymentDate || (validPaymentDay
            ? getInitialNextPaymentDate({
                paymentDay,
                billingCycle: customer.billingCycle,
            })
            : null);
        const anchorDay = validPaymentDay
            ? paymentDay
            : getAnchorDayFromPaymentDate(nextPaymentDate, customer.billingCycle);

        if (!nextPaymentDate) {
            return { ok: false, error: 'Agrega Fecha de próximo pago o Día de pago válido para automatizar recordatorios.' };
        }

        const customFieldDefinitions = await getCustomFieldDefinitionsForUser(supabase, user.id);
        const customFields = sanitizeCustomFieldValues(customer.customFields, customFieldDefinitions);

        const { error } = await supabase
            .from('customers')
            .upsert({
                user_id: user.id,
                phone_number: customer.phoneNumber,
                first_name: customer.firstName,
                last_name_1: customer.lastName1 || null,
                last_name_2: customer.lastName2 || null,
                billing_cycle: customer.billingCycle,
                next_payment_date: nextPaymentDate,
                anchor_day: anchorDay,
                custom_fields: customFields,
                deleted_at: null,
                is_active: true,
                inactive_at: null
            }, { onConflict: 'user_id,phone_number' });

        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch {
        return { ok: false, error: 'Error añadiendo cliente.' };
    }
}

export async function updateCustomerCustomField(
    customerId: string,
    key: CustomFieldKey,
    value: string,
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { ok: false, error: 'Acceso no autorizado.' };
        }

        const definitions = await getCustomFieldDefinitionsForUser(supabase, user.id);
        const definition = definitions.find((field) => field.key === key);
        if (!definition) {
            return { ok: false, error: 'Ese campo personalizado no está configurado para esta cuenta.' };
        }

        const { data: customer, error: readError } = await supabase
            .from('customers')
            .select('custom_fields')
            .eq('id', customerId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (readError) return { ok: false, error: readError.message };
        if (!customer) return { ok: false, error: 'Cliente no encontrado.' };

        const currentValues = sanitizeCustomFieldValues(customer.custom_fields, definitions);
        const sanitizedSingleValue = sanitizeCustomFieldValues({ [key]: value }, definitions)[key];
        const nextValues = { ...currentValues };

        if (sanitizedSingleValue) nextValues[key] = sanitizedSingleValue;
        else delete nextValues[key];

        const { error } = await supabase
            .from('customers')
            .update({ custom_fields: nextValues })
            .eq('id', customerId)
            .eq('user_id', user.id);

        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch (error) {
        console.error('[Suscripta] Error actualizando campo personalizado:', error);
        return { ok: false, error: 'Error al actualizar campo personalizado.' };
    }
}
