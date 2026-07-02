# QA Plan: Modulo Clientes, Carga Masiva y CRM

## Objetivo

Validar el modulo de clientes de Suscripta de punta a punta para encontrar bugs, regresiones, fallas de UX, inconsistencias de datos y mejoras antes de seguir construyendo automatizaciones de WhatsApp sobre esta base.

Este plan cubre:

- Carga masiva CSV/XLS/XLSX.
- Seleccion de hoja en Excel.
- Mapeo de columnas core.
- Campos personalizados V1.
- Alta individual de clientes.
- Tabla CRM: scroll, columnas fijas, filtros, paginacion, ordenamiento y exportacion.
- Edicion inline y acciones masivas.
- Seguridad multi-tenant y RLS.
- Verificaciones tecnicas basicas.

## Alcance

El agente QA debe ejecutar pruebas manuales guiadas y registrar hallazgos. No debe corregir bugs durante la ejecucion salvo instruccion explicita.

Incluido:

- Pruebas con datos falsos.
- Pruebas destructivas solo en cuenta/proyecto de prueba.
- Revision visual desktop/mobile.
- Revision de consola del navegador cuando haya errores.
- Revision de respuestas o tablas Supabase solo si el agente tiene acceso controlado.

Fuera de alcance:

- Envio real de WhatsApp.
- Automatizacion completa de recordatorios.
- Cambios de codigo.
- Migraciones SQL nuevas.
- Uso de datos reales de clientes.

## Preparacion

1. Confirmar branch y commit base.
   - Branch esperado: `fix/mejora-formato-telefonos-upload`.
   - Commit minimo esperado: `87e8850 feat: add customer custom fields`.
2. Confirmar que Supabase ya tiene aplicada la migracion de campos personalizados.
   - `customers.custom_fields`.
   - `customer_custom_field_configs`.
   - `jsonb_object_key_count`.
3. Ejecutar localmente:
   - `npm run dev`.
   - URL esperada: `http://localhost:3000`.
4. Usar una cuenta de prueba dedicada.
5. Antes de pruebas destructivas, registrar:
   - Total de clientes activos.
   - Total de pausados.
   - Total en papelera.
   - Existencia o no de configuracion de campos personalizados.

## Protocolo de Reporte

Registrar cada hallazgo en `findings.md` con:

- ID incremental.
- Fecha.
- Severidad: `Blocker`, `High`, `Medium`, `Low`.
- Area: carga masiva, tabla, alta individual, filtros, datos, seguridad, visual.
- Ambiente: browser, viewport, usuario de prueba.
- Pasos para reproducir.
- Resultado esperado.
- Resultado obtenido.
- Evidencia: screenshot, archivo usado, consola, respuesta Supabase.
- Estado: nuevo, confirmado, descartado, corregido.

## Severidad

- `Blocker`: impide usar el modulo o provoca perdida/corrupcion grave de datos.
- `High`: flujo principal falla, seguridad/RLS rota, acciones destructivas sin confirmacion, datos incorrectos.
- `Medium`: flujo secundario falla, UX confusa, validacion incompleta, inconsistencia visual importante.
- `Low`: copy, alineacion menor, mejora visual, friccion no bloqueante.

## Criterios de Aceptacion

El modulo puede considerarse apto si:

- Los flujos validos de carga masiva guardan correctamente.
- Los flujos invalidos no guardan datos silenciosamente.
- La estructura de campos personalizados se crea, bloquea y reemplaza correctamente.
- La tabla sigue siendo usable con 4 campos personalizados.
- Filtros, paginacion, ordenamiento y acciones masivas no se contradicen entre si.
- Exportacion CSV conserva campos core y personalizados.
- No existe fuga de datos entre usuarios.
- `npm run lint`, `npx tsc --noEmit` y `npm run build` pasan o tienen causa externa documentada.

## Reglas de Seguridad QA

- No usar datos reales.
- No probar `Sobrescribir Completo` en una cuenta con datos utiles.
- No exponer `.env.local` ni claves Supabase en hallazgos.
- Si se consulta Supabase, no copiar tokens ni PII.
- Documentar cualquier accion destructiva antes y despues de ejecutarla.

## Entregables Esperados

Al finalizar QA, el agente debe entregar:

- `findings.md` actualizado.
- Lista corta de bugs bloqueantes.
- Lista de mejoras recomendadas.
- Archivos de prueba usados o descripcion exacta de su contenido.
- Resultado de verificaciones tecnicas.
