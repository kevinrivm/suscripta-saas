import Link from "next/link";

export const metadata = {
    title: "Terminos y Condiciones | Suscripta",
    description: "Terminos y condiciones de uso de la plataforma Suscripta y la integracion con WhatsApp.",
};

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <div className="fixed inset-0 z-[-1] bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(255,255,255,0))]" />

            <header className="z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-8">
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                        <span className="text-lg font-bold leading-none text-black">S</span>
                    </div>
                    <span className="text-xl font-semibold tracking-tight">Suscripta</span>
                </Link>
                <Link href="/" className="text-sm text-zinc-400 transition-colors hover:text-white">
                    Volver al Inicio
                </Link>
            </header>

            <main className="mx-auto flex-1 w-full max-w-3xl px-6 py-12">
                <h1 className="mb-8 text-4xl font-bold">Terminos y Condiciones</h1>
                <div className="prose prose-invert prose-emerald max-w-none text-zinc-300">
                    <p className="mb-8 text-sm text-zinc-500">Ultima actualizacion: {new Date().toLocaleDateString('es-MX')}</p>

                    <h2>1. Aceptacion de los Terminos</h2>
                    <p>
                        Al acceder y utilizar los servicios de Suscripta, usted acepta estos terminos y condiciones.
                        Si no esta de acuerdo con alguna parte, no debe utilizar el servicio.
                    </p>

                    <h2>2. Integracion con Meta y WhatsApp</h2>
                    <p>
                        Suscripta actua como un proveedor de soluciones para automatizar recordatorios.
                        <strong> El cliente retiene la propiedad de su numero de WhatsApp.</strong>
                        Mediante el Embedded Signup provisto por Meta, el cliente autoriza a Suscripta a gestionar
                        envios de mensajes transaccionales a traves de la API oficial de WhatsApp Cloud.
                    </p>
                    <p>
                        Al usar la modalidad Coexistence, el cliente gestiona las respuestas manuales desde la aplicacion
                        nativa de WhatsApp Business, mientras Suscripta se encarga solo de los flujos automatizados de cobranza.
                    </p>

                    <h2>3. Responsabilidades del Cliente</h2>
                    <ul>
                        <li>Cumplir con las politicas de comercio y mensajeria de WhatsApp emitidas por Meta.</li>
                        <li>Obtener el consentimiento explicito de sus usuarios finales antes de enviar recordatorios.</li>
                        <li>No utilizar la plataforma para spam, marketing no solicitado o contenido ilegal.</li>
                    </ul>

                    <h2>4. Suspension y Terminacion</h2>
                    <p>
                        Suscripta puede suspender o terminar el acceso al servicio si determina que el cliente ha violado
                        estos terminos o las politicas de Meta.
                    </p>

                    <h2>5. Limitacion de Responsabilidad</h2>
                    <p>
                        Suscripta proporciona la herramienta de automatizacion tal cual. No somos responsables de bloqueos de numeros
                        impuestos por Meta debido a malas practicas del cliente ni de la perdida de ingresos derivada de dichos bloqueos.
                    </p>
                </div>
            </main>

            <footer className="mt-auto w-full border-t border-white/5">
                <div className="mx-auto flex max-w-3xl justify-between px-6 py-8 text-sm text-zinc-500">
                    <p>(c) {new Date().getFullYear()} Suscripta Inc.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="transition-colors hover:text-white">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
