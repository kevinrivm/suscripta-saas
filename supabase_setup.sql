-- Ejecuta este script SQL en la sección SQL Editor de tu panel de Supabase.

-- Crear extensión para IDs seguros
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla para almacenar las conexiones de WhatsApp
CREATE TABLE public.whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Vinculado a Auth de Supabase
    waba_id TEXT NOT NULL,
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Restricciones de unicidad
    UNIQUE(waba_id, phone_number_id)
);

-- Habilitar Seguridad por Nivel de Filas (RLS - Row Level Security)
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Politica 1: Un usuario solo puede VER sus propias conexiones
CREATE POLICY "Users can view their own connections" 
ON public.whatsapp_connections 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politica 2: Un usuario solo puede MODIFICAR y BORRAR sus propias conexiones
CREATE POLICY "Users can update their own connections" 
ON public.whatsapp_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" 
ON public.whatsapp_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- OJO: La política de INSERT la manejamos desde el servidor (API Route) usando el Service Role Key (Admin Client),
-- por lo cual evitamos que alguien directamente en el front end intente insertar tokens inválidos.

-- Funcion (Trigger) para auto-actualizar la columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_connections_updated_at
BEFORE UPDATE ON public.whatsapp_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
