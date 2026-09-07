---
name: informe-neurocognitivo
description: >
  Genera los bloques de texto/datos para completar un informe neurocognitivo a partir de un Excel
  unificado con los puntajes ya calculados de un paciente. Usar cuando se adjunte un Excel de
  evaluación neurocognitiva (hoja TABLA DE FORMULAS o equivalente) y se pida armar/completar un
  informe.
---

# Informe neurocognitivo — generación de bloques para copy/paste

Todo el output es **borrador para revisión del profesional**. Nunca se genera el `.docx` final ni se
envía nada al paciente.

## Qué recibe esta skill

Un único Excel adjunto en el chat (`excelEvaluacionCompleto.xlsx` o equivalente). **Sólo se lee la
hoja `TABLA DE FORMULAS`**; las otras seis (`Stroop`, `MMSE`, `Puntajes Equivalentes`, `PRUEBAS`,
`FLUENCIAS`, `BACK UP`) son tablas de normas que ya alimentaron los `VLOOKUP` y no se leen.

Esquema de la hoja (detalle completo, con las fórmulas, en `mapeo-excel-a-word.md` §1):

| Rango | Contenido |
|---|---|
| `C4`, `C5` | Edad y nivel educativo — **drivers de todas las fórmulas**. No usar `C47`/`C49` para esto. |
| `C8:H22` | Cuadro con Z: `C`=Prueba `D`=PB `E`=Z `G`=Media `H`=Desvío. 15 filas. |
| `B8:B12`, `B13:B19`, `B20:B22` | Rótulos de área (celdas combinadas). |
| `K14`, `K15`, `K16` | Ensayos BEM–MS AS1 / AS2 / AS3. **Única fuente** de esas 3 filas del informe. |
| `D25:D44` | Bloque cualitativo (MMSE, TRO, AVD, KPDS-10, IFS + 9 subpuntajes, Comprensión, Expresión, TRO, MMSE copia). |
| `E27`, `E28` | Interpretación de AVD y de KPDS-10 (texto, pass-through). |
| `C46:C51` | Datos demográficos: paciente, edad, fecha de nacimiento, nivel educativo, lateralidad, fecha de evaluación. |
| `B56:B64` | Notas crudas de la anamnesis, una viñeta por celda. |

`C48` y `C51` son **seriales de fecha** de Excel: convertir a `dd/mm/aaaa`, no imprimir el número.

### Faltantes conocidos — verificar y avisar, no rellenar

Este Excel **todavía no es autosuficiente**. Al procesarlo, chequear y **decir explícitamente qué
falta** en vez de inventar el dato:

1. **Los 10 ítems del K-10 no están** (sólo el total, en `D28`). El **gráfico K-10** (bloque 5 de salida) **no se puede
   generar**. No inventar un desglose que sume el total.
2. **`D31` (IFS Índice MT) puede venir corrompida**: si trae un número de ~45000–47000 con formato de
   fecha, es una autoconversión de Excel de un valor tipo `7/10`. **El original es irrecuperable** —
   reportarlo y pedirlo, no adivinarlo.
3. **No hay flag "Riesgo de evolución"** → la categoría 5 es inalcanzable. Si falta, señalarlo; no
   asumir "No".
4. **No hay C-QSM**, aunque se usa en la narrativa de screening.
5. **`C3` suele estar vacía**: el nombre del paciente está en `C46`.

## Qué NO debe hacer esta skill

- **No recalcular PB ni Z.** Ya vienen calculados en el Excel.
- **No inferir "riesgo de evolución".** Es un flag manual que llega decidido.
- **No inventar recomendaciones clínicas.** Partir del template de `regla-diagnostica.md`, con las
  mismas viñetas y en el mismo orden (ver ahí qué sí se localiza).
- **No reinterpretar la anamnesis.** Ver el bloque 3 abajo — es el bloque de mayor riesgo.
- **No generar el `.docx` final** (los gráficos son objetos OLE) ni auto-enviar nada.
- **No "corregir" las inconsistencias de la plantilla.** La leyenda que menciona trazado diagonal, y
  el `del área` / `por área` de las secciones, se reproducen tal cual.

## Gotcha técnico — guardar el Excel antes de subirlo

El Excel se lee con código, y las celdas con fórmula (`E`, `G`, `H`, `L14`, `K19`) sólo tienen el
valor calculado cacheado si el archivo fue **guardado en Excel**. Si se sube sin guardar, o fue
editado con otro programa, pueden leerse vacías. Avisar al usuario si se detecta ese patrón.

---

## Formato de salida — 11 bloques

En bloques separados y etiquetados, listos para copy/paste. El mapeo completo de qué sale de dónde
está en `mapeo-excel-a-word.md` §2.

**1. Tabla de datos personales** — pass-through de `C46:C51`, con las fechas ya en `dd/mm/aaaa`. No
agregar ni quitar filas respecto de la plantilla del profesional (`informeFinal.docx` tiene una fila
`Deriva:` que `informeFinal2.docx` no tiene). No hay DNI ni ocupación.

**2. `MOTIVO DE CONSULTA Y ANTECEDENTES`** — redacción de las viñetas de `B56:B64` a prosa en tercera
persona y presente, una viñeta ≈ un párrafo, mismo orden, conservando las citas textuales entre
comillas. Formas fijas del primer y último párrafo, verbos de reporte y concordancia de género: ver
`mapeo-excel-a-word.md` §3.

> ⚠️ **Bloque de mayor riesgo del pipeline.** No suavizar, reinterpretar ni reencuadrar el contenido
> anímico: transcribir lo que dice la nota. Si una nota es ambigua o está truncada, dejarla ambigua y
> señalarlo. Incluir todo y **marcar lo dudoso** en vez de decidir sola qué omitir.

**3. Filas de la tabla `SÍNTESIS DEL RENDIMIENTO`** — 36 filas, orden y celda de origen en
`orden-filas-sintesis.md`. Tres patrones de llenado:

- **Con Z** (15 filas): PB numérico · Z a **2 decimales con coma, con el cero final** (`-0,90`, no
  `-0,9`) o el cap · **1 X** en la columna de rango que corresponde.
- **Cualitativa simple** (19 filas): el texto entero va en **PB** (`30/30`, `3 normal`, `Normal`), Z
  **vacía**, sin X.
- **AVD y KPDS-10** (2 filas): PB numérico · la palabra de `E27`/`E28` en Z · sin X.

En una frase: **la X se completa si y solo si Z es numérico**, y el texto cualitativo va en PB salvo
en AVD y KPDS-10.

Cap: `Z ≥ +3` → `≥3`, `Z ≤ −3` → `≤-3`; el valor capado igual lleva X en la columna del extremo.

Paste en **3 bloques** (por los conteos de celda de la plantilla — filas 3 y 4 tienen 9 valores, el
resto 10): filas 1–2 · **filas 3–4 aparte** · filas 5–36. Detalle y advertencias en
`orden-filas-sintesis.md`.

**4. Valores del gráfico 1** (14 valores Z) — `orden-categorias-graficos.md`. **Punto decimal.**
Mismos valores redondeados y capados que la columna Z de la tabla (el cap va como número `-3`/`3`, no
como texto). Instrucción de pegado **posicional**: empezar en la celda inmediatamente debajo del
encabezado con el año, porque la columna destino cambia según el archivo.

**5. Valores del gráfico 2** (10 ítems del K-10) — **hoy no se puede generar**: el Excel sólo trae el
total. Decirlo, y pedir el desglose del papel.

**6. Sección de screening** — esqueleto casi fijo, con los puntajes intercalados en el formato
`(MMSE=30/30; TRO= 9,5/10; INECO=26,5/30)`, tomados de `D25`, `D26` y `D30`. **El Word lo llama
INECO; el Excel, IFS Total.** La mención al C-QSM no sale del Excel.

**7. Cuatro secciones por área cognitiva** — cada una con título, la línea
`Impresión diagnóstica del área: rendimiento cognitivo <calificación>` y un párrafo. Reproducir la
inconsistencia `del área` (secciones 1 y 2) / `por área` (secciones 3 y 4). Léxico Z → palabra y
nombres de función en `mapeo-excel-a-word.md` §4.2 — está **inferido**, marcarlo como tal.

**8. Párrafo de recap de conclusiones** — área por área, en orden inverso al de la tabla, con los
conectores del ejemplo.

**9. Frase de cierre** — del template de la categoría elegida, adaptada al perfil real del paciente.

**10. Categoría diagnóstica + viñetas de `Se sugiere:`** — aplicar `regla-diagnostica.md`.
⚠️ **Nunca elegir categoría en silencio:** la regla escrita no reproduce la decisión real del
profesional (ver el recuadro al inicio de `regla-diagnostica.md`). Proponer la categoría, mostrar los
Z que la disparan y advertir que el criterio "fallas aisladas vs. perfil" no está definido. Mismas
viñetas y orden del template; localizar el paréntesis de la viñeta de hábitos. Si Z < -1,5 + AVD
conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución, **señalarlo
explícitamente** — la prioridad entre ambas categorías todavía no está confirmada, no elegir una en
silencio.

**11. Reporte de faltantes y dudas** — bloque final con los faltantes detectados (ver arriba), las
celdas sospechosas y todo lo que quedó marcado como dudoso. Este bloque no se pega en el Word: es
para el profesional.

## Reglas de negocio a aplicar

- Sintomatología anímica: derivar de K-10 ≥ 25 por default; usar el flag manual del Excel si el
  profesional lo sobrescribió.
- AVD conservadas/comprometidas: 0–5 = comprometidas, 6–8 = conservadas. **La palabra que va al Word
  sale de `E27`, no de esta tabla.**
- Desempate en rangos cuando el Z cae justo en un límite: **pendiente de confirmar**. Propuesta:
  límite inferior inclusive, superior exclusivo. Si un Z cae exactamente en un borde, señalarlo.
- FF y TRO aparecen dos veces en la tabla de síntesis — completar ambas filas, no omitir ninguna.

## Archivos de esta skill

- `mapeo-excel-a-word.md` — **esquema del Excel + de dónde sale cada bloque del Word.** El mapa
  principal.
- `orden-filas-sintesis.md` — las 36 filas, celda de origen, patrones de llenado, mecánica de paste.
- `orden-categorias-graficos.md` — los dos gráficos: orden, redondeo/cap, celdas destino.
- `regla-diagnostica.md` — las 6 categorías + cortes de K-10/AVD + qué se adapta de los templates.
- `excel-unificado-spec.md` — estado del Excel entregado y ajustes propuestos.
- `../preguntasParaLaProfesional.md` — todo lo que falta confirmar con la profesional (fuera del
  paquete de la skill; es documentación interna, no se sube).
- `ejemplo-informeFinal.docx` — referencia de tono/estilo.

## ⚠️ Datos sensibles del paquete de la skill

`excelEvaluacionCompleto.xlsx` e `informeFinal2.docx` son de un **paciente real** (nombre, fecha de
nacimiento, antecedente familiar, notas de ánimo y sueño, citas de la entrevista).

Eso es inevitable en el **Excel de entrada**, que se adjunta por paciente en el chat. **No lo es en
este paquete**: lo que se sube a claude.ai queda publicado ahí de forma persistente. `informeFinal2`
es la mejor referencia de tono disponible, pero **antes de reemplazar con él a
`ejemplo-informeFinal.docx` conviene anonimizarlo** — nombre, fecha de nacimiento y anamnesis
ficticios, dejando la estructura y el tono intactos, que es lo único que la skill necesita.

El Excel del paciente **no** va dentro de la skill: es el input que se adjunta en cada pedido.
