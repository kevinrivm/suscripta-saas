import { updateAccountPassword, updateAccountProfile } from '@/app/actions/account';
import ConfirmedAccountForm from '@/components/dashboard/ConfirmedAccountForm';
import { createClient } from '@/utils/supabase/server';

type AccountSearchParams = {
  status?: string;
};

const STATUS_MESSAGES: Record<string, { tone: 'success' | 'error'; text: string }> = {
  profile_saved: { tone: 'success', text: 'Datos personales actualizados.' },
  profile_error: { tone: 'error', text: 'No se pudieron actualizar los datos personales.' },
  password_saved: { tone: 'success', text: 'Contraseña actualizada.' },
  password_short: { tone: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' },
  password_mismatch: { tone: 'error', text: 'Las contraseñas no coinciden.' },
  password_error: { tone: 'error', text: 'No se pudo actualizar la contraseña.' },
};

export default async function AccountPage(props: { searchParams: Promise<AccountSearchParams> }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
      .from('profiles')
      .select('first_name, company_name, role, created_at')
      .eq('id', user.id)
      .maybeSingle()
    : { data: null };

  const metadata = user?.user_metadata as {
    first_name?: string;
    company_name?: string;
    full_name?: string;
  } | undefined;

  const firstName = profile?.first_name ?? metadata?.first_name ?? metadata?.full_name?.split(' ')[0] ?? '';
  const companyName = profile?.company_name ?? metadata?.company_name ?? '';
  const status = searchParams.status ? STATUS_MESSAGES[searchParams.status] : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
          Mi cuenta
        </span>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Configuración de cuenta</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Administra tus datos personales, seguridad y configuración administrativa del workspace.
        </p>
      </div>

      {status && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${
            status.tone === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Datos personales</h2>
            <p className="mt-1 text-sm text-zinc-500">Estos datos personalizan el dashboard y el workspace.</p>
          </div>

          <ConfirmedAccountForm
            action={updateAccountProfile}
            confirmMessage="¿Guardar los cambios de tus datos personales?"
            className="grid gap-5"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nombre</label>
              <input
                name="first_name"
                type="text"
                required
                defaultValue={firstName}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Empresa</label>
              <input
                name="company_name"
                type="text"
                required
                defaultValue={companyName}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Correo</label>
              <input
                type="email"
                disabled
                value={user?.email ?? ''}
                className="mt-2 w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm text-zinc-500"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Guardar datos
            </button>
          </ConfirmedAccountForm>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Contraseña</h2>
              <p className="mt-1 text-sm text-zinc-500">Actualiza la contraseña de esta cuenta.</p>
            </div>

            <ConfirmedAccountForm
              action={updateAccountPassword}
              confirmMessage="¿Cambiar la contraseña de esta cuenta?"
              className="grid gap-5"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Nueva contraseña</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Confirmar contraseña</label>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repite la contraseña"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Cambiar contraseña
              </button>
            </ConfirmedAccountForm>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#0b0b0d] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Facturación</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Plan, método de pago e historial de cargos estarán disponibles más adelante.
                </p>
              </div>
              <span className="rounded-full border border-zinc-700 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.16em] text-zinc-500">
                Próximamente
              </span>
            </div>
            <button
              type="button"
              disabled
              className="mt-6 w-full cursor-not-allowed rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-zinc-600"
            >
              Administrar facturación
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
