import { NextRequest, NextResponse } from 'next/server';
import {
  advancePaymentDatePastClosedPeriods,
  getAnchorDayFromPaymentDate,
  getTodayDateString,
} from '@/utils/customers/billing-cycles';
import { createAdminClient } from '@/utils/supabase/server';

type CustomerCycleRow = {
  id: string;
  billing_cycle: string | null;
  next_payment_date: string | null;
  anchor_day: number | null;
  payment_status: string | null;
};

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const authHeader = request.headers.get('authorization');
  const headerSecret = request.headers.get('x-automation-secret');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  return Boolean(expectedSecret && (bearerToken === expectedSecret || headerSecret === expectedSecret));
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized automation request.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { today?: string; dryRun?: boolean };
  const today = body.today ?? getTodayDateString();
  const dryRun = body.dryRun === true;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('customers')
    .select('id,billing_cycle,next_payment_date,anchor_day,payment_status')
    .eq('is_active', true)
    .is('deleted_at', null)
    .not('next_payment_date', 'is', null)
    .limit(1000);

  if (error) {
    console.error('[Suscripta] advance-cycles select failed:', error);
    return NextResponse.json({ error: 'Could not load customers.' }, { status: 500 });
  }

  const customers = (data ?? []) as CustomerCycleRow[];
  const updates = customers
    .map((customer) => {
      const effectiveAnchorDay = customer.anchor_day
        ?? getAnchorDayFromPaymentDate(customer.next_payment_date, customer.billing_cycle);
      const nextPaymentDate = advancePaymentDatePastClosedPeriods({
        currentPaymentDate: customer.next_payment_date,
        billingCycle: customer.billing_cycle,
        anchorDay: effectiveAnchorDay,
        today,
      });

      if (!nextPaymentDate || nextPaymentDate === String(customer.next_payment_date).split('T')[0]) {
        return null;
      }

      return {
        id: customer.id,
        previous_next_payment_date: customer.next_payment_date,
        next_payment_date: nextPaymentDate,
        anchor_day: effectiveAnchorDay,
        payment_status: 'pending',
      };
    })
    .filter((update): update is NonNullable<typeof update> => Boolean(update));

  if (!dryRun) {
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          next_payment_date: update.next_payment_date,
          anchor_day: update.anchor_day,
          payment_status: update.payment_status,
        })
        .eq('id', update.id);

      if (updateError) {
        console.error('[Suscripta] advance-cycles update failed:', updateError);
        return NextResponse.json({ error: 'Could not update all customers.' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    today,
    scanned: customers.length,
    advanced: updates.length,
    updates,
  });
}
