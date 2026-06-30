'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type RecoveryStatus = 'checking' | 'ready' | 'saving' | 'success' | 'error'

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<RecoveryStatus>('checking')
    const [errorMsg, setErrorMsg] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        const supabase = createClient()

        const initializeRecoverySession = async () => {
            try {
                const code = searchParams.get('code')

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code)
                    if (error) throw error
                    setStatus('ready')
                    return
                }

                const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
                const accessToken = hashParams.get('access_token')
                const refreshToken = hashParams.get('refresh_token')

                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    })
                    if (error) throw error
                    window.history.replaceState(null, '', window.location.pathname)
                    setStatus('ready')
                    return
                }

                const { data } = await supabase.auth.getSession()
                if (data.session) {
                    setStatus('ready')
                    return
                }

                setStatus('error')
                setErrorMsg('El enlace de recuperación no es válido o ya expiró.')
            } catch (error) {
                const message = error instanceof Error ? error.message : 'No se pudo validar el enlace de recuperación.'
                setStatus('error')
                setErrorMsg(message)
            }
        }

        void initializeRecoverySession()
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrorMsg('')

        if (password.length < 6) {
            setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
            return
        }

        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden.')
            return
        }

        setStatus('saving')
        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setStatus('ready')
            setErrorMsg(error.message)
            return
        }

        await supabase.auth.signOut()
        setStatus('success')
        setTimeout(() => router.push('/login'), 1800)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center font-sans overflow-hidden bg-[#0A0A0A]">
            <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(16,185,129,0.1),rgba(0,0,0,0))]" />

            <div className="w-full max-w-sm px-6">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-6">
                        <span className="text-black font-bold text-2xl leading-none">S</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Nueva contraseña</h1>
                    <p className="text-sm text-zinc-400 mt-2 text-center">Crea una contraseña nueva para volver a entrar a tu workspace.</p>
                </div>

                <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-[#111111]/80 backdrop-blur-xl shadow-2xl">
                    {status === 'checking' && (
                        <div className="text-center">
                            <svg className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <p className="text-sm text-zinc-400">Validando enlace...</p>
                        </div>
                    )}

                    {(status === 'ready' || status === 'saving') && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nueva contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la contraseña"
                                    className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'saving'}
                                className="w-full mt-4 py-4 rounded-full bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'saving' ? 'Guardando...' : 'Guardar contraseña'}
                            </button>
                        </form>
                    )}

                    {status === 'success' && (
                        <div className="text-center">
                            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-white">Contraseña actualizada</h2>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">Te enviaremos a iniciar sesión en unos segundos.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                                {errorMsg}
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-sm text-zinc-500 mt-8">
                    <Link href="/forgot-password" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                        Solicitar otro enlace
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-black font-sans">
                    <p className="text-zinc-400">Cargando recuperación...</p>
                </div>
            }
        >
            <ResetPasswordContent />
        </Suspense>
    )
}
