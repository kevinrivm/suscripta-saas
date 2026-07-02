# Test Cases: Clientes, Carga Masiva y CRM

## Convenciones

- Resultado: `Pass`, `Fail`, `Blocked`, `Not Run`.
- Severidad sugerida solo aplica si falla.
- Registrar evidencia en `findings.md` cuando el resultado no sea `Pass`.

## 1. Carga Masiva Basica

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| CM-001 | CSV valido basico | Subir `clientes_validos_basico.csv`, mapear campos core, revisar e importar | Clientes creados activos, telefonos E.164, ciclos correctos | High |
| CM-002 | CSV con telefono local | Subir CSV con telefonos sin lada y pais base MX | Sistema infiere lada y muestra advertencia | Medium |
| CM-003 | XLSX una hoja | Subir XLSX con una hoja | Avanza directo a mapeo | Medium |
| CM-004 | XLSX multiples hojas | Subir `clientes_multiples_hojas.xlsx` | Muestra selector de hojas y carga solo la elegida | High |
| CM-005 | Cancelar en columnas | Llegar a mapeo y presionar cancelar | Sale sin guardar clientes | High |
| CM-006 | Pantalla exito finalizar | Importar validos y presionar Finalizar | Navega a clientes/contactos sin error | Low |
| CM-007 | Pantalla exito subir otro | Importar validos y presionar Subir otro archivo | Reinicia flujo de importacion | Medium |

## 2. Validacion de Campos Core

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| VC-001 | Falta telefono | Intentar avanzar sin mapear telefono | Bloquea avance con mensaje claro | High |
| VC-002 | Falta nombre | Intentar avanzar sin mapear nombre | Bloquea avance con mensaje claro | High |
| VC-003 | Falta frecuencia | Intentar avanzar sin mapear frecuencia | Bloquea avance con mensaje claro | High |
| VC-004 | Falta fecha y dia | No mapear fecha ni dia de pago | Bloquea avance con mensaje claro | High |
| VC-005 | Dia 0 | Usar dia de pago `0` | Marca error y no importa | Medium |
| VC-006 | Dia 32 | Usar dia de pago `32` | Marca error y no importa | Medium |
| VC-007 | Dia texto | Usar dia de pago `quince` | Marca error y no importa | Medium |
| VC-008 | Semanal > 7 | Usar frecuencia semanal con dia `15` | Marca error o warning bloqueante | High |
| VC-009 | Quincenal > 7 | Usar frecuencia quincenal con dia `15` | Marca error o warning bloqueante | High |

## 3. Ciclos de Facturacion

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| CF-001 | Semanal | Importar cliente semanal con dia valido | Calcula `next_payment_date` correcto | High |
| CF-002 | Quincenal | Importar cliente quincenal con dia valido | Calcula `next_payment_date` correcto | High |
| CF-003 | Mensual | Importar cliente mensual con dia 15 | Calcula proximo ciclo correcto | High |
| CF-004 | Bimestral | Importar cliente bimestral | Ciclo normalizado y fecha coherente | Medium |
| CF-005 | Trimestral | Importar cliente trimestral | Ciclo normalizado y fecha coherente | Medium |
| CF-006 | Semestral | Importar cliente semestral | Ciclo normalizado y fecha coherente | Medium |
| CF-007 | Anual | Importar cliente anual | Ciclo normalizado y fecha coherente | Medium |
| CF-008 | Dia 31 en mes 30 | Importar mensual con ancla 31 y revisar siguiente ciclo | Ajusta al ultimo dia valido del mes | High |
| CF-009 | Febrero no bisiesto | Probar ancla 31 hacia febrero de ano no bisiesto | Ajusta a 28 | High |
| CF-010 | Febrero bisiesto | Probar ancla 31 hacia febrero de ano bisiesto | Ajusta a 29 | High |

## 4. Campos Personalizados V1

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| CP-001 | Crear 1 campo | Sin config previa, mapear `ID interno` | Config se crea y columna aparece en tabla | High |
| CP-002 | Crear 4 campos | Mapear ID, Servicio, Monto, Notas | Cuatro columnas aparecen y valores se guardan | High |
| CP-003 | Intentar quinto campo | Intentar representar mas de 4 campos | UI/flujo limita a 4 | Medium |
| CP-004 | Campo sin label | Seleccionar columna personalizada sin label manual | Usa nombre de columna como label | Medium |
| CP-005 | Append misma estructura | Con config existente, importar archivo con misma estructura | Acepta importacion y conserva config | High |
| CP-006 | Append estructura distinta | Intentar cambiar nombres/cantidad en append | No permite estructura distinta | High |
| CP-007 | Sobrescribir estructura | Usar Sobrescribir Completo con nuevos campos | Reemplaza config y valores anteriores dejan de mostrarse | High |
| CP-008 | Alta individual con config | Abrir modal Nuevo Contacto | Muestra seccion Campos personalizados | Medium |
| CP-009 | Alta individual sin config | En cuenta sin config, abrir modal | No muestra seccion personalizada | Low |
| CP-010 | Valor con comas/comillas | Importar notas con comas y comillas | Valor se guarda/exporta sin romper CSV | Medium |

## 5. Tabla de Clientes

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| TB-001 | Pocos clientes | Ver tabla con menos de 10 clientes | Layout estable sin scroll innecesario excesivo | Low |
| TB-002 | Muchos clientes | Ver tabla con mas de 20 clientes | Paginacion y scroll funcionan | Medium |
| TB-003 | 4 campos personalizados | Ver tabla con 4 campos custom | Scroll horizontal usable | Medium |
| TB-004 | Sticky checkbox/nombre | Hacer scroll horizontal | Checkbox y Nombre quedan fijos | Medium |
| TB-005 | Telefono una linea | Revisar telefonos largos | No se parten en varias lineas | Medium |
| TB-006 | Header consistente | Revisar cabeceras | Alineacion y justificacion consistentes | Low |
| TB-007 | Labels largos | Usar etiquetas custom largas | Header trunca sin romper layout | Low |
| TB-008 | Mobile | Probar viewport movil | Tabla usable con scroll, sin traslapes graves | Medium |

## 6. Edicion y Acciones

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| EA-001 | Editar custom blur | Cambiar valor y salir del input | Guarda valor | Medium |
| EA-002 | Editar custom Enter | Cambiar valor y presionar Enter | Guarda valor | Medium |
| EA-003 | Editar custom Escape | Cambiar valor y presionar Escape | Revierte valor local | Low |
| EA-004 | Vaciar custom | Borrar valor personalizado | El valor queda vacio/removido | Medium |
| EA-005 | Cambiar ciclo | Cambiar ciclo desde tabla | Guarda ciclo sin romper fecha | High |
| EA-006 | Reprogramar prorroga | Usar prorroga unica | Cambia solo proximo pago | High |
| EA-007 | Reprogramar permanente | Usar cambio permanente | Cambia fecha y ancla | High |
| EA-008 | Pago pendiente | Cambiar a pendiente | Estado se guarda | Medium |
| EA-009 | Pago pagado | Cambiar a pagado | Estado se guarda y deja de ser candidato a recordatorio | High |
| EA-010 | Pago cancelado | Cambiar a cancelado | Estado se guarda y deja de ser candidato a recordatorio | High |
| EA-011 | Pausar/activar | Alternar estatus | `is_active` cambia correctamente | High |
| EA-012 | Enviar papelera | Eliminar cliente | Soft delete, no borrado fisico visible | High |

## 7. Filtros, Ordenamiento y Acciones Masivas

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| FO-001 | Filtro pago | Filtrar por pendiente/pagado/cancelado | Resultados correctos | Medium |
| FO-002 | Filtro ciclo | Filtrar por ciclo | Resultados correctos | Medium |
| FO-003 | Fecha igual | Filtrar fecha igual | Resultados correctos | Medium |
| FO-004 | Fecha menor | Filtrar fecha menor que | Resultados correctos | Medium |
| FO-005 | Fecha mayor | Filtrar fecha mayor que | Resultados correctos | Medium |
| FO-006 | Chips limpiar | Quitar chip individual | Remueve solo ese filtro | Low |
| FO-007 | Limpiar todos | Usar limpiar | Remueve filtros | Low |
| FO-008 | Orden nombre | Ordenar por nombre asc/desc | Orden correcto | Low |
| FO-009 | Orden fecha | Ordenar por fecha asc/desc | Orden correcto | Medium |
| AM-001 | Seleccionar visibles | Click checkbox header | Selecciona pagina visible | Medium |
| AM-002 | Seleccionar filtrados | Seleccionar todos filtrados | Incluye IDs de todo el filtro | High |
| AM-003 | Pago masivo | Cambiar pago en masa | Aplica a seleccionados tras confirmacion | High |
| AM-004 | Pausar masivo | Pausar seleccionados | Aplica a seleccionados tras confirmacion | High |
| AM-005 | Eliminar masivo | Enviar seleccionados a papelera | Aplica soft delete tras confirmacion | High |

## 8. Exportacion CSV

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| EX-001 | Export activos | Exportar pestana activos | CSV descarga datos de activos | Medium |
| EX-002 | Export pausados | Exportar pausados | CSV descarga datos de pausados | Medium |
| EX-003 | Export papelera | Exportar papelera | CSV descarga datos de papelera | Medium |
| EX-004 | Export con custom | Exportar con campos personalizados | Incluye headers y valores custom | High |
| EX-005 | Export sin custom | Exportar cuenta sin config custom | No agrega columnas vacias inesperadas | Low |
| EX-006 | Comillas/comas | Exportar valores con comas/comillas | CSV conserva formato valido | Medium |

## 9. Seguridad y Multi-Tenant

| ID | Caso | Pasos | Esperado | Severidad si falla |
|---|---|---|---|---|
| SG-001 | Usuario A clientes | Crear clientes con usuario A | Solo A los ve | Blocker |
| SG-002 | Usuario B aislamiento | Iniciar con usuario B | B no ve clientes de A | Blocker |
| SG-003 | Config custom aislada | Crear config custom en A | B no ve ni reutiliza config de A | Blocker |
| SG-004 | RLS lectura | Consultar tablas con sesion de otro usuario si aplica | RLS bloquea datos ajenos | Blocker |
| SG-005 | Automatizacion ignora custom | Revisar endpoint/logica de advance cycles | No usa `custom_fields` | High |

## 10. Regresiones Tecnicas

| ID | Caso | Comando | Esperado | Severidad si falla |
|---|---|---|---|---|
| RT-001 | Lint | `npm run lint` | Sin errores | Medium |
| RT-002 | TypeScript | `npx tsc --noEmit` | Sin errores | High |
| RT-003 | Build | `npm run build` | Build exitoso | High |
| RT-004 | Build con red restringida | Ejecutar build si falla Google Fonts | Documentar causa externa si aplica | Low |
