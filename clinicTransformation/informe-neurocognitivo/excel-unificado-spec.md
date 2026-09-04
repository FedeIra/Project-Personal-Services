# Spec del Excel unificado — para mandar a quien lo está armando

> Objetivo: que la primera versión que llegue ya sirva, sin ida y vuelta. Basado en
> `formulasExcelEvaluacion.xlsx` + hallazgos confirmados leyendo la tabla real de `informeFinal.docx`.

## 1. Debe tener una fila por cada una de las 36 filas de la tabla de síntesis

No solo las 14 pruebas que hoy se grafican + AVD + K-10. Lista completa y orden exacto en
`orden-filas-sintesis.md` de esta misma carpeta — incluye los subpuntajes del IFS (10 filas), TRO
(x2), MMSE copia, Comprensión, Expresión, y los 3 ensayos BEM-MS AS1/AS2/AS3 que hoy **no** están en
`formulasExcelEvaluacion.xlsx`.

Recomendación de layout por fila: `Área | Prueba | PB | Z` (mismas 4 columnas que ya tiene la hoja
`TABLA DE FORMULAS`). Para las filas cualitativas (sin Z numérico), la columna Z lleva el texto de
interpretación (ej. "Normal", "Autónoma").

**No mover las 15 filas actuales.** Las 15 pruebas que hoy tienen Z numérico por fórmula quedan
**exactamente en su posición** (moverlas rompería las fórmulas). Las 21 filas faltantes se agregan
**debajo del cuadro actual (~row 24/25)**, respetando el mismo formato: título agrupador (ej.
"Atención y Funciones Ejecutivas"), columna Prueba, y PB / Z.

**Las 8 columnas de rango NO van en el Excel.** "Deterioro significativo / Puntajes bajos / promedio
/ superiores" no se completan acá — se derivan del Z al armar el bloque de Word (ver la regla de la X
y el cap de ±3 en `orden-filas-sintesis.md`). El Excel solo aporta PB y Z.

**Importante:** como TRO y FF se repiten con el mismo nombre en dos secciones distintas, el Excel
tiene que tener **dos filas separadas para cada una** (no una fila + una referencia) — igual que ya
lo hace la tabla de Word.

## 2. Agregar bloque de datos demográficos del paciente

Hoy viven solo en la historia clínica online (capturas de pantalla), que no se le pasa al LLM.
Propuesta: agregar como bloque de cabecera en la misma hoja o en una hoja aparte, sin costo real ya
que el archivo de todos modos se está editando por paciente. Campos mínimos (a confirmar la lista
completa contra la tabla de datos real de `informeFinal.docx`): nombre, DNI, fecha de evaluación,
fecha de nacimiento, edad, nivel educativo, ocupación.

## 3. Campos nuevos fuera de la tabla de síntesis

- **AVD total** (0–8) — hoy solo en papel (`evaluacion.pdf`, página 1).
- **K-10 total** — idealmente el desglose de los 10 ítems por separado (Cansancio, Nervios,
  Nervios+, Desesperanza, Inquietud, Inquietud+, Depresión, Esfuerzo, Tristeza, Inutilidad), en ese
  orden — así alimenta directo `excelSegundoGrafico.xlsx` sin transcripción adicional.
- **Flag "Riesgo de evolución"** (Sí/No) — el único campo realmente manual/criterio clínico. No
  hace falta un flag separado de "sintomatología anímica": se deriva automáticamente del K-10
  (≥ 25), con opción de sobrescribirlo a mano si el profesional discrepa del corte automático.

## 4. Mantener el mismo orden de categorías que ya usan los Excel de gráficos

Ver `orden-categorias-graficos.md` — no hace falta reordenar nada ahí, solo asegurarse de que las
14 + 10 categorías correspondientes existan en el Excel unificado con esos mismos nombres.

## 5. Un solo detalle operativo a comunicar

Guardar el archivo en Excel (no solo cerrarlo, ni editarlo con otro programa) antes de mandarlo —
las celdas con fórmula necesitan tener el valor calculado cacheado, si no pueden leerse vacías al
procesarlas por código.

## Pendiente de confirmar antes de que se termine de armar

- Convención de desempate cuando el Z cae justo en el límite entre dos columnas de rango (ver
  `opcionesAutomatizacion.md`, punto 3) — no afecta el diseño del Excel, pero sí a quien complete el
  bloque 2 del informe.
