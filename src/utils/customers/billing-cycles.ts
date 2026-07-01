export type BillingCycle = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'biannual' | 'annual';

const MONTH_INTERVALS: Partial<Record<BillingCycle, number>> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  biannual: 6,
  annual: 12,
};

export function getTodayDateString(timeZone = 'America/Mexico_City') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function normalizeBillingCycle(cycle: string | null | undefined): BillingCycle {
  if (
    cycle === 'weekly' ||
    cycle === 'biweekly' ||
    cycle === 'monthly' ||
    cycle === 'bimonthly' ||
    cycle === 'quarterly' ||
    cycle === 'biannual' ||
    cycle === 'annual'
  ) {
    return cycle;
  }

  return 'monthly';
}

export function parseDateOnly(dateValue: string | null | undefined) {
  if (!dateValue) return null;
  const [year, month, day] = String(dateValue).split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function daysInUtcMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addUtcMonthsClamped(date: Date, months: number, anchorDay?: number | null) {
  const targetMonthIndex = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const targetYear = Math.floor(targetMonthIndex / 12);
  const targetMonth = targetMonthIndex % 12;
  const targetDay = Math.min(anchorDay ?? date.getUTCDate(), daysInUtcMonth(targetYear, targetMonth));
  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
}

function getPeriodStart(dueDate: Date, billingCycle: BillingCycle) {
  if (billingCycle === 'weekly') {
    const weekStartsOnMondayOffset = (dueDate.getUTCDay() + 6) % 7;
    return addUtcDays(dueDate, -weekStartsOnMondayOffset);
  }

  if (billingCycle === 'biweekly') {
    return addUtcDays(dueDate, -7);
  }

  return new Date(Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), 1));
}

function getNextPeriodStart(dueDate: Date, billingCycle: BillingCycle) {
  const periodStart = getPeriodStart(dueDate, billingCycle);

  if (billingCycle === 'weekly') return addUtcDays(periodStart, 7);
  if (billingCycle === 'biweekly') return addUtcDays(periodStart, 14);

  return addUtcMonthsClamped(periodStart, MONTH_INTERVALS[billingCycle] ?? 1, 1);
}

export function getNextPaymentDate(params: {
  currentPaymentDate: string | null | undefined;
  billingCycle: string | null | undefined;
  anchorDay?: number | null;
}) {
  const currentDate = parseDateOnly(params.currentPaymentDate);
  if (!currentDate) return null;

  const billingCycle = normalizeBillingCycle(params.billingCycle);

  if (billingCycle === 'weekly') return formatDateOnly(addUtcDays(currentDate, 7));
  if (billingCycle === 'biweekly') return formatDateOnly(addUtcDays(currentDate, 14));

  return formatDateOnly(addUtcMonthsClamped(currentDate, MONTH_INTERVALS[billingCycle] ?? 1, params.anchorDay));
}

export function getAnchorDayFromPaymentDate(
  paymentDate: string | null | undefined,
  billingCycle: string | null | undefined,
) {
  const normalizedCycle = normalizeBillingCycle(billingCycle);
  if (normalizedCycle === 'weekly' || normalizedCycle === 'biweekly') return null;

  const parsedDate = parseDateOnly(paymentDate);
  if (!parsedDate) return null;

  return parsedDate.getUTCDate();
}

export function parsePaymentDay(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const trimmed = String(value).trim();
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmed)) return null;
  const match = trimmed.match(/^\D*(\d{1,2})\D*$/);
  if (!match) return null;
  const day = Number(match[1]);
  return Number.isInteger(day) ? day : null;
}

export function getInitialNextPaymentDate(params: {
  paymentDay: number;
  billingCycle: string | null | undefined;
  today?: string;
}) {
  const billingCycle = normalizeBillingCycle(params.billingCycle);
  const today = parseDateOnly(params.today ?? getTodayDateString());
  if (!today) return null;

  if (billingCycle === 'weekly' || billingCycle === 'biweekly') {
    if (params.paymentDay < 1 || params.paymentDay > 7) return null;
    const todayWeekday = (today.getUTCDay() + 6) % 7;
    const targetWeekday = params.paymentDay - 1;
    let daysUntilTarget = targetWeekday - todayWeekday;
    if (daysUntilTarget < 0) {
      daysUntilTarget += billingCycle === 'weekly' ? 7 : 14;
    }
    return formatDateOnly(addUtcDays(today, daysUntilTarget));
  }

  if (params.paymentDay < 1 || params.paymentDay > 31) return null;

  const monthInterval = MONTH_INTERVALS[billingCycle] ?? 1;
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth();
  const currentMonthDay = Math.min(params.paymentDay, daysInUtcMonth(currentYear, currentMonth));
  const currentCandidate = new Date(Date.UTC(currentYear, currentMonth, currentMonthDay));

  if (today.getTime() <= currentCandidate.getTime()) {
    return formatDateOnly(currentCandidate);
  }

  return formatDateOnly(addUtcMonthsClamped(currentCandidate, monthInterval, params.paymentDay));
}

export function advancePaymentDatePastClosedPeriods(params: {
  currentPaymentDate: string | null | undefined;
  billingCycle: string | null | undefined;
  anchorDay?: number | null;
  today: string;
}) {
  let dueDate = parseDateOnly(params.currentPaymentDate);
  const todayDate = parseDateOnly(params.today);
  if (!dueDate || !todayDate) return null;

  const billingCycle = normalizeBillingCycle(params.billingCycle);
  let guard = 0;

  while (todayDate.getTime() >= getNextPeriodStart(dueDate, billingCycle).getTime() && guard < 120) {
    const nextPaymentDate = getNextPaymentDate({
      currentPaymentDate: formatDateOnly(dueDate),
      billingCycle,
      anchorDay: params.anchorDay,
    });
    dueDate = parseDateOnly(nextPaymentDate);
    guard += 1;
    if (!dueDate) return null;
  }

  return formatDateOnly(dueDate);
}

export function isPaymentOverdue(params: {
  paymentStatus: string | null | undefined;
  nextPaymentDate: string | null | undefined;
  today: string;
}) {
  const normalizedStatus = params.paymentStatus === 'paid' || params.paymentStatus === 'cancelled'
    ? params.paymentStatus
    : 'pending';
  const nextPaymentDate = params.nextPaymentDate ? String(params.nextPaymentDate).split('T')[0] : null;

  return normalizedStatus === 'pending' && Boolean(nextPaymentDate) && nextPaymentDate! < params.today;
}
