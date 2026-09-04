---
name: informe-neurocognitivo
description: >
  Genera los bloques de texto/datos para completar un informe neurocognitivo a partir de un Excel
  unificado con los puntajes ya calculados de un paciente. Usar cuando se adjunte un Excel de
  evaluación neurocognitiva (hoja TABLA DE FORMULAS o equivalente) y se pida armar/completar un
  informe.
---

# Informe neurocognitivo — generación de bloques para copy/paste

> ⚠️ STUB: la sección "Excel de entrada" de este archivo está incompleta hasta que llegue el Excel
> unificado real. El resto (reglas, formato de salida, prohibiciones) ya está confirmado y no
> depende de eso.

## Qué recibe esta skill

Un único Excel adjunto en el chat, con los datos de un paciente:

- PB y Z ya calculados para cada fila de la batería (la skill NO recalcula estos valores).
- AVD total, K-10 total (o desglose de sus 10 ítems).
- Flag "riesgo de evolución" (Sí/No) — criterio clínico manual, cargado por el profesional.
- Datos demográficos del paciente (ver `excel-unificado-spec.md` — pendiente de confirmar si viven
  en el Excel o se completan a mano).

**<!-- TODO: completar con los nombres reales de hoja/columnas una vez llegue el Excel unificado -->**

## Qué NO debe hacer esta skill

- **No recalcular PB ni Z.** Ya vienen calculados en el Excel.
- **No inferir "riesgo de evolución".** Es un flag manual que llega decidido — usarlo tal cual.
- **No redactar sugerencias propias.** Elegir 1 de las 6 categorías de `regla-diagnostica.md` y
  devolver su texto de sugerencias tal cual, completando solo los "(…)" con las áreas afectadas del
  paciente.
- **No generar el `.docx` final automáticamente** (ver gotcha de gráficos OLE abajo) — todo el
  output son bloques de texto para que el profesional pegue y revise.
- **No auto-enviar nada al paciente.** El output es siempre "borrador para revisión".

## Gotcha técnico — guardar el Excel antes de subirlo

El Excel se lee con código (no se abre visualmente), y las celdas con fórmula (VLOOKUP) solo tienen
su valor calculado cacheado si el archivo fue **guardado en Excel** antes de subirlo. Si se sube sin
guardar, o fue editado con otro programa que no recalcula fórmulas, esas celdas pueden leerse
vacías. Recordarle esto al usuario si detecta celdas de fórmula vacías.

## Formato de salida — 7 bloques

Devolver en el chat, en bloques separados y claramente etiquetados, listos para copy/paste:

1. **Tabla de datos del paciente** (cabecera del informe).
2. **Filas de la tabla "SÍNTESIS DEL RENDIMIENTO"** — ver `orden-filas-sintesis.md` para el orden
   exacto de las 36 filas, la regla de llenado (PB / Z / X de rango) y el cap de ±3. Formato de
   paste: 10 valores por tab (PB, Z, 8 columnas de rango). **Separador decimal: coma** (`1,14`),
   texto libre en celda de Word, sin parseo numérico.
   Las 8 columnas de rango **no llevan números**: llevan una sola **X** en el tramo donde cae el Z,
   y solo si Z es numérico. Si Z es texto (ej. AVD "Autónoma", KPDS-10 "Normal") o está vacío: la
   celda Z lleva la palabra o queda vacía y las 8 columnas de rango quedan **sin X**.
   ⚠️ El paste único de las 36 filas **no funciona** (celdas de rango fusionadas en las secciones
   cualitativas — validado en Word 2026-09-03). Pegar por **segmentos contiguos Con-Z** (filas 5–9,
   23–29, 30–32); las cualitativas se completan aparte a mano. Detalle en `orden-filas-sintesis.md`.
3. **Valores para `excelPrimerGrafico.xlsx`** — ver `orden-categorias-graficos.md` (14 valores).
   **Separador decimal: punto** (`-1.32`), Excel necesita reconocerlo como número.
4. **Valores para `excelSegundoGrafico.xlsx`** — ver `orden-categorias-graficos.md` (10 valores,
   K-10 por síntoma). Mismo formato (punto).
5. **Párrafos narrativos por función cognitiva** — tono/estilo de referencia: `ejemplo-informeFinal.docx`.
6. **Párrafo de conclusiones** — completar los "(…)" con las áreas relevantes del paciente.
7. **Categoría diagnóstica + sugerencias** — aplicar `regla-diagnostica.md`. Si Z < -1,5 + AVD
   conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución, señalarlo
   explícitamente en la respuesta (la regla de prioridad entre ambas categorías todavía no está
   confirmada — no elegir una en silencio).

## Reglas de negocio a aplicar

- Sintomatología anímica: derivar de K-10 ≥ 25 por default; usar el flag manual del Excel si el
  profesional lo sobrescribió explícitamente.
- AVD conservadas/comprometidas: 0–5 = comprometidas, 6–8 = conservadas.
- Desempate en rangos de la tabla de síntesis: **<!-- TODO: confirmar convención límite
  inclusive/exclusive, ver opcionesAutomatizacion.md punto 3 -->**.
- FF y TRO aparecen dos veces en la tabla de síntesis (ver `orden-filas-sintesis.md`) — completar
  ambas filas con el mismo PB/Z, no omitir ninguna.
- Cap de Z fuera de ±3: mostrar `≥3` (si Z ≥ +3) o `≤−3` (si Z ≤ −3) en vez del número crudo; el
  valor capado igual lleva X en la columna de rango del extremo. Convención a confirmar — ver
  `orden-filas-sintesis.md`.

## Archivos de esta skill

- `regla-diagnostica.md` — las 6 categorías diagnósticas + cortes de K-10/AVD.
- `orden-categorias-graficos.md` — orden exacto de los dos Excel de gráficos.
- `orden-filas-sintesis.md` — orden exacto de las 36 filas de la tabla de síntesis.
- `ejemplo-informeFinal.docx` — referencia de tono/estilo (datos ficticios). **Confirmar con el
  usuario antes de subirla a claude.ai que efectivamente es ficticia** — se publicaría al subir la
  skill.

El Excel unificado con los datos del paciente **no** va dentro de la skill — es el input que se
adjunta en el chat cada vez que se pide un informe.
