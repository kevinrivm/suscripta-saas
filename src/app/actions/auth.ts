'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { ok: false, error: 'Credenciales inválidas o correo no registrado.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('first_name') as string,
        company_name: formData.get('company_name') as string,
      }
    }
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const headersList = await headers()
  const origin = headersList.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  if (!email) {
    return { ok: false, error: 'Ingresa el correo de tu cuenta.' }
  }

  if (!origin) {
    return { ok: false, error: 'No se pudo determinar la URL de recuperación.' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    console.error('[Suscripta] Password reset request error:', error)
  }

  return { ok: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
