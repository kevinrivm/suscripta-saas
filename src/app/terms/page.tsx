import Link from "next/link";

export const metadata = {
    title: "Términos y Condiciones | Suscripta",
    description: "Términos y condiciones de uso de la plataforma Suscripta y la integración con WhatsApp.",
};

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans">
            <div className="fixed inset-0 z-[-1] bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(255,255,255,0))]" />

            <header className="w-full max-w-3xl mx-auto px-6 py-8 flex justify-between items-center z-10">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <span className="text-black font-bold text-lg leading-none">S</span>
                    </div>
                    <span className="text-xl font-semibold tracking-tight">Suscripta</span>
                </Link>
                <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Volver al Inicio
                </Link>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
                <div className="prose prose-invert prose-emerald max-w-none text-zinc-300">
                    <p className="text-sm text-zinc-500 mb-8">Última actualización: {new Date().toLocaleDateString('es-MX')}</p>

                    <h2>1. Aceptación de los Términos</h2>
                    <p>
                        Al acceder y utilizar los servicios de Suscripta ("Plataforma", "Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte, no podrá utilizar nuestro servicio.
                    </p>

                    <h2>2. Integración con Meta y WhatsApp</h2>
                    <p>
                        Suscripta actúa como un Proveedor de Soluciones para automatizar recordatorios.
                        <strong>El cliente (usted) retiene la propiedad de su número de WhatsApp.</strong>
                        Mediante el uso del "Embedded Signup" provisto por Meta, usted autoriza a Suscripta a gestionar envíos de mensajes transaccionales (recordatorios) a través de la API oficial de WhatsApp Cloud.
                    </p>
                    <p>
                        Al usar la modalidad "Coexistence", usted es responsable de gestionar las respuestas manuales a través de la aplicación nativa de WhatsApp Business, mientras Suscripta se encarga exclusivamente de los flujos automatizados de cobranza.
                    </p>

                    <h2>3. Responsabilidades del Cliente</h2>
                    <ul>
                        <li>Cumplir con las Políticas de Comercio y las Políticas de Mensajería de WhatsApp emitidas por Meta.</li>
                        <li>Obtener el consentimiento explícito (Opt-in) de sus usuarios finales antes de enviarles recordatorios.</li>
                        <li>No utilizar la plataforma para envíos de spam, mensajes de marketing no solicitados o contenido ilegal.</li>
                    </ul>

                    <h2>4. Suspensión y Terminación</h2>
                    <p>
                        Suscripta se reserva el derecho de suspender o terminar su acceso al Servicio si determinamos, a nuestra entera discreción, que ha violado estos Términos o las políticas de Meta, lo cual podría poner en riesgo la integridad de la integración.
                    </p>

                    <h2>5. Limitación de Responsabilidad</h2>
                    <p>
                        Suscripta proporciona la herramienta de automatización "tal cual". No nos hacemos responsables de bloqueos de números de WhatsApp impuestos por Meta debido a malas prácticas del cliente ni de la pérdida de ingresos derivada de dichos bloqueos.
                    </p>
                </div>
            </main>

            <footer className="w-full border-t border-white/5 mt-auto">
                <div className="max-w-3xl mx-auto px-6 py-8 flex text-sm text-zinc-500 justify-between">
                    <p>© {new Date().getFullYear()} Suscripta Inc.</p>
                    <div className="flex gap-4">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
