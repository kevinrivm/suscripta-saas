import Link from "next/link";

export const metadata = {
    title: "Política de Privacidad | Suscripta",
    description: "Política de privacidad y manejo de datos de la plataforma Suscripta en el contexto de WhatsApp.",
};

export default function PrivacyPage() {
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
                <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
                <div className="prose prose-invert prose-emerald max-w-none text-zinc-300">
                    <p className="text-sm text-zinc-500 mb-8">Última actualización: {new Date().toLocaleDateString('es-MX')}</p>

                    <h2>1. Introducción</h2>
                    <p>
                        En Suscripta, el respeto y la protección de su privacidad y la de sus clientes es nuestro compromiso principal. Esta Política describe cómo recopilamos, procesamos y protegemos la información relacionada con el envío de recordatorios mediante nuestra integración con la API de WhatsApp Business Cloud de Meta.
                    </p>

                    <h2>2. Datos que Recopilamos</h2>
                    <p>
                        A través de la integración de Meta (Embedded Signup), Suscripta procesa estrictamente:
                    </p>
                    <ul>
                        <li><strong>Permisos técnicos:</strong> Tokens de acceso para la mensajería, WABA IDs y el estado de la conexión de su número de WhatsApp.</li>
                        <li><strong>Datos de recordatorios:</strong> Fechas, montos y números de teléfono destino proporcionados por el cliente exclusivamente para el envío del recordatorio.</li>
                    </ul>

                    <h2>3. Privacidad por Diseño (Coexistence)</h2>
                    <p>
                        Suscripta opera con un modelo de privilegios mínimos. En el modo de "Coexistence", nuestra herramienta únicamente inicia conversaciones para el envío del recordatorio transaccional asociado a suscripciones.
                    </p>
                    <p>
                        <strong>No leemos, procesamos ni almacenamos</strong> el contenido de las respuestas de los clientes ni conversaciones originadas o continuadas a través de su aplicación oficial de WhatsApp Business (iOS/Android/Desktop).
                    </p>

                    <h2>4. Cómo Usamos la Información</h2>
                    <p>
                        La información procesada se usa exclusivamente para los siguientes propósitos:
                    </p>
                    <ul>
                        <li>Entregar los mensajes automáticos mediante plantillas (Templates) previamente aprobadas en WhatsApp Manager.</li>
                        <li>Reportar el estado de los envíos (entregado, leído o fallido) dentro de nuestro dashboard.</li>
                        <li>Mantener la seguridad de la cuenta y asegurar la conformidad con los lineamientos de Meta.</li>
                        <li>Mejorar el rendimiento del servicio de forma anónima y agregada.</li>
                    </ul>

                    <h2>5. Retención y Protección de Datos</h2>
                    <p>
                        Aseguramos toda la información en repositorios encriptados. Los números de teléfono y los datos del recordatorio se conservan únicamente el tiempo necesario para la operación del ciclo de cobro vigente y con propósitos legales/contables obligatorios, o hasta que el cliente decida revocar la suscripción u ordene la eliminación de dichos datos.
                    </p>

                    <h2>6. Compartir su Información</h2>
                    <p>
                        Suscripta no vende ni transfiere su información ni la de sus clientes a terceros para propósitos de marketing, bajo ninguna circunstancia.
                        Compartimos datos estrictamente con proveedores de infraestructura tecnológica (ej. Meta) subyacentes a la operación necesaria del servicio bajo los más altos estándares de protección (SOC2/GDPR).
                    </p>

                    <h2>7. Sus Derechos y Contacto</h2>
                    <p>
                        Usted tiene derecho a revocar la autorización de la API de WhatsApp, solicitar la eliminación de datos o consultar la trazabilidad de nuestra integración de intermediario. Para cualquier cuestión relacionada con la privacidad, puede comunicarse al correo soporte@suscripta.co.
                    </p>
                </div>
            </main>

            <footer className="w-full border-t border-white/5 mt-auto">
                <div className="max-w-3xl mx-auto px-6 py-8 flex text-sm text-zinc-500 justify-between">
                    <p>© {new Date().getFullYear()} Suscripta Inc.</p>
                    <div className="flex gap-4">
                        <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
