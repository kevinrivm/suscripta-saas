# Test Data: Clientes, Carga Masiva y CRM

Esta carpeta debe contener datasets falsos para ejecutar el plan QA. No usar datos reales de clientes.

## Archivos Sugeridos

### `clientes_validos_basico.csv`

Objetivo: validar carga masiva core.

Columnas sugeridas:

- `telefono`
- `nombre`
- `apellido_paterno`
- `apellido_materno`
- `frecuencia`
- `fecha_proximo_pago`

Incluir:

- 3 clientes validos.
- Telefonos Mexico con `+52`.
- Frecuencias: `Mensual`, `Quincenal`, `Anual`.
- Fechas ISO `YYYY-MM-DD`.

### `clientes_con_campos_personalizados.csv`

Objetivo: validar campos personalizados V1.

Columnas sugeridas:

- `telefono`
- `nombre`
- `apellido_paterno`
- `frecuencia`
- `dia_pago`
- `id_interno`
- `servicio`
- `monto`
- `notas`

Incluir:

- 4 campos personalizados maximo.
- Valores vacios en algunas filas.
- Notas con comas y comillas.
- Texto acentuado.

### `clientes_invalidos.csv`

Objetivo: validar errores y bloqueo de importacion.

Incluir:

- Telefono con texto.
- Telefono incompleto.
- Nombre vacio.
- Frecuencia vacia.
- Dia de pago `0`.
- Dia de pago `32`.
- Frecuencia semanal con dia `15`.

### `clientes_dia_31.csv`

Objetivo: validar anclas y ajuste de fin de mes.

Columnas sugeridas:

- `telefono`
- `nombre`
- `frecuencia`
- `dia_pago`

Incluir:

- Mensual con dia `31`.
- Bimestral con dia `31`.
- Anual con dia `31`.

Validar comportamiento contra meses de 30 dias y febrero.

### `clientes_multiples_hojas.xlsx`

Objetivo: validar selector de hojas.

Hojas sugeridas:

- `Clientes validos`: registros correctos.
- `Clientes invalidos`: registros con errores.
- `Hoja vacia`: sin registros.

Validar que solo se importa la hoja elegida.

### `clientes_etiquetas_largas.csv`

Objetivo: validar layout de tabla y truncado.

Incluir columnas personalizadas con nombres largos:

- `identificador_interno_del_cliente_empresa`
- `nombre_del_servicio_contratado_por_el_cliente`
- `comentarios_operativos_para_el_equipo_de_cobranza`
- `nivel_o_tipo_de_cuenta_del_beneficiario`

Validar:

- Headers truncados.
- Scroll horizontal.
- Nombre y checkbox sticky.
- Telefono en una sola linea.

## Reglas de Datos

- Usar nombres ficticios.
- Usar telefonos de prueba, no numeros reales de clientes.
- No incluir emails reales.
- No incluir tokens, claves, IDs productivos ni PII.
- Mantener datasets pequenos: 3 a 10 filas por archivo.

## Resultado Esperado de Cada Dataset

Cada archivo debe documentar en el hallazgo o reporte:

- Cuantas filas se intentaron importar.
- Cuantas filas fueron validas.
- Cuantas filas fueron rechazadas.
- Que warnings aparecieron.
- Que clientes quedaron visibles en la tabla.
