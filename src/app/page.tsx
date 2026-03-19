import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between font-sans overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />

      {/* Header */}
      <header className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-10 antialiased">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <span className="text-black font-bold text-lg leading-none">S</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Suscripta</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
          <a href="#solucion" className="hover:text-emerald-400 transition-colors">Solución</a>
          <a href="#como-funciona" className="hover:text-emerald-400 transition-colors">Integración Meta</a>
          <a href="#beneficios" className="hover:text-emerald-400 transition-colors">Beneficios</a>
        </nav>
        <Link href="/dashboard" className="px-5 py-2.5 text-sm font-medium rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
          Iniciar Sesión
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl px-6 py-20 md:py-32 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Validado con Meta Cloud API
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 leading-tight">
          Reduce tu <span className="text-emerald-400 text-glow">Churn</span> en piloto automático.
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light">
          Suscripta envía recordatorios de pago inteligentes por WhatsApp utilizando <strong>tu propio número</strong>. Sin fricción para tus clientes, más ingresos retenidos para ti.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="px-8 py-4 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 text-center">
            Comenzar Prueba Gratis
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-full bg-transparent border border-zinc-700 text-white font-medium hover:border-zinc-500 hover:bg-zinc-800/50 transition-all text-center">
            Agendar Demo
          </Link>
        </div>

        {/* Feature Highlights - Glass Panels */}
        <div id="como-funciona" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left">
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Embedded Signup</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Vincula tu número comercial directamente desde nuestra plataforma en segundos mediante la integración oficial de Meta.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Modo Coexistence</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Usa Suscripta solo para recordatorios. Sigue respondiendo mensajes como siempre desde tu App de WhatsApp Business.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
            <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Cero Fricción</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Tus clientes reciben alertas desde el número de la empresa que ya conocen y confían. Privacidad garantizada por diseño.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-black/50 backdrop-blur-lg z-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
              <span className="text-black font-bold text-xs leading-none">S</span>
            </div>
            <span className="font-semibold text-sm">Suscripta Inc.</span>
          </div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Suscripta. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-zinc-400">
            <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
