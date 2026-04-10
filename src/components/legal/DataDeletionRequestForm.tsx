"use client";

import { useMemo, useState } from "react";

const NOTIFICATION_EMAIL = "kevinrivm@gmail.com";

function buildMailtoUrl(email: string) {
  const subject = "Suscripta - Data deletion request";
  const body = [
    "Hello Suscripta team,",
    "",
    "I want to request the deletion of my account data from the platform.",
    "",
    `Registered email: ${email}`,
    "",
    "Please confirm when the deletion process has been completed.",
  ].join("\n");

  return `mailto:${NOTIFICATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function DataDeletionRequestForm() {
  const [email, setEmail] = useState("");

  const mailtoUrl = useMemo(() => {
    if (!email.trim()) {
      return "";
    }

    return buildMailtoUrl(email.trim());
  }, [email]);

  const hasValidEmail = /\S+@\S+\.\S+/.test(email.trim());

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Request deletion
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Solicita la eliminacion manual de tus datos
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Escribe el correo con el que te registraste en Suscripta. Al presionar el boton,
          se abrira un correo dirigido a nuestro equipo para que podamos localizar tu cuenta y
          completar la eliminacion manual.
        </p>
      </div>

      <label className="mb-3 block text-sm font-medium text-zinc-300" htmlFor="deletion-email">
        Correo registrado en Suscripta
      </label>
      <input
        id="deletion-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="tu-correo@ejemplo.com"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.06]"
      />

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <a
          href={hasValidEmail ? mailtoUrl : undefined}
          className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            hasValidEmail
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "cursor-not-allowed bg-zinc-800 text-zinc-500"
          }`}
        >
          Enviar solicitud por correo
        </a>
        <p className="text-xs leading-6 text-zinc-500">
          Destino de la solicitud: <span className="text-zinc-300">{NOTIFICATION_EMAIL}</span>
        </p>
      </div>
    </div>
  );
}
