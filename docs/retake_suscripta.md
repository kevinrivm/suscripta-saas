# Guía de Reanudación de Desarrollo: Suscripta SaaS

Esta guía consolida el estado del desarrollo, decisiones de arquitectura y la hoja de ruta técnica de la **Fase 4 (CRM y Seguridad de Datos)** para que cualquier agente de desarrollo (Antigravity o Claude Code) pueda retomar el proyecto con total contexto de forma inmediata.

---

## 1. Arquitectura de Base de Datos y Supabase

### Tabla Pública de Perfiles (`public.profiles`)
Dado que `auth.users` está restringido por Supabase, implementamos una tabla pública para modelar al dueño del SaaS:
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    company_name TEXT,
    plan_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Políticas RLS añadidas para asegurar que cada perfil solo sea visible/editable por su dueño.
```

### Trigger de Sincronización Automática
Para asegurar que cada nuevo registro en `auth.users` cree un perfil correspondiente en `public.profiles` automáticamente, se utiliza este trigger:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name, plan_tier)
  VALUES (new.id, new.raw_user_meta_data->>'company_name', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 2. Lógica del Backend (Acciones de Servidor)

El archivo central de control de clientes en la base de datos se ubica en [customers.ts](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/src/app/actions/customers.ts). Las principales funciones implementadas son:

*   **Upsert con recuperación orgánica (Soft-Deletes):** 
    Cuando se realiza una importación CSV en modo `Append`, si un cliente ya existía en la base de datos pero estaba borrado lógicamente (`is_active = false` o `deleted_at IS NOT NULL`), el sistema lo "resucita" de forma automática anulando su fecha de borrado y activando su estado sin duplicar registros.
*   **Acciones Modulares:**
    *   `softDeleteCustomer(id)`: Desactivación lógica de clientes (evita usar SQL crudo en el cliente).
    *   `toggleCustomerActiveStatus(id)`: Habilitación/suspensión rápida del estado de suscripción de WhatsApp.
    *   `addManualCustomer(data)`: Creación directa a través de formulario modal sin salir del Dashboard principal.

---

## 3. Interfaz del Dashboard de CRM

La interfaz principal se divide en dos secciones clave:

### A. Motor de Importación Inteligente ([page.tsx](file:///Users/macfuckm3/rivasia/agy/suscriptaSaaS/suscripta-saas/src/app/dashboard/clients/page.tsx))
*   **Gestión de Riesgo en Modos de Carga:** El Drag & Drop obliga al usuario a elegir explícitamente entre:
    *   `Append` (Safe / Adicionar nuevos clientes sin tocar los existentes).
    *   `Overwrite` (Destructivo / Reemplaza toda la base de datos de clientes actual).
*   **Modal de Confirmación:** Un modal de seguridad bloquea el avance si se selecciona `Overwrite`, requiriendo un consentimiento humano explícito para archivar la base de datos existente.
*   **Mapeo de Columnas Heurístico:** Muestra oraciones legibles que sugieren asociaciones automáticas (e.g. *"He detectado que tu columna X corresponde al Teléfono"*).
*   **Validación E.164:** Regexes integradas en el cliente para verificar la validez del formato de número telefónico antes de ser enviado a Supabase.

### B. Vista de Contactos
*   **Queries Dinámicas:** El Server Component utiliza `searchParams` en Next.js para filtrar y paginar de forma limpia entre clientes Activos, Pausados y en la Papelera.
*   **Exportación a CSV:** Un botón en la barra de herramientas que permite a Vanilla JS procesar el arreglo estructurado a un CSV y descargarlo inmediatamente del lado del cliente como `clientes_suscripta.csv`.

---

## 4. Estrategia de Rescate de Datos (WhatsApp Pruebas)
En las primeras pruebas de integración con Meta, se generaron conexiones de WhatsApp y logs de mensajes mientras no se tenía una sesión de usuario activa, dejando la columna `user_id` de esos registros como `NULL`.

Para reclamar esos registros huérfanos una vez que te registres de manera oficial en la aplicación, debes ejecutar la siguiente consulta en el editor SQL de tu panel de Supabase:
```sql
UPDATE public.whatsapp_connections 
SET user_id = 'TU_NUEVO_UUID_DE_ADMINISTRADOR' 
WHERE user_id IS NULL;

UPDATE public.whatsapp_messages 
SET user_id = 'TU_NUEVO_UUID_DE_ADMINISTRADOR' 
WHERE user_id IS NULL;
```
*(Reemplaza `'TU_NUEVO_UUID_DE_ADMINISTRADOR'` por el ID único que Supabase le asigne a tu cuenta en `auth.users` tras hacer SignUp).*
