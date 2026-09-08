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

El Excel **está en transición**: la profesional ya acordó (2026-09-07) agregar los campos faltantes,
pero mientras el archivo no se actualice, chequear y **decir explícitamente qué falta** en vez de
inventar el dato:

1. **Los 10 ítems del K-10** (hoy sólo el total, en `D28`). Si faltan, el **gráfico K-10** (bloque 5)
   **no se puede generar** — decirlo, no inventar un desglose que sume el total. *(Se están agregando
   al Excel; total pasará a `=SUMA`.)*
2. **`D31` (IFS Índice MT) puede venir corrompida**: número ~45000–47000 con formato de fecha = una
   autoconversión de un valor tipo `7/10`. **No es una fecha**: el IFS Índice MT deriva de la suma de
   **Dígitos Atrás + Memoria de Trabajo Visual**. Si viene corrompida, reportarlo y pedir el valor;
   no adivinar. *(Se está pasando a fórmula/formato Texto.)*
3. **Flag "Riesgo de evolución" Sí/No** → habilita la categoría 5 y determina las sugerencias. Si
   falta, señalarlo; **no** asumir "No". *(Se está agregando como celda Sí/No.)*
4. **C-QSM** (opcional): a veces se toma, a veces no. Si hay puntaje, quejas presentes = **> 3**; si
   no hay, la observación sale de la anamnesis / motivo de consulta. No inventar un puntaje.
5. **Campos que hoy salen del papel/historia clínica** y se están agregando: `Acompañado` Sí/No + por
   quién, y `Orientación temporal/espacial`. Si faltan, la frase correspondiente se marca como
   pendiente.
6. **`C3` suele estar vacía**: el nombre del paciente está en `C46`.

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
está en `mapeo-excel-a-word.md` §2. Para el **tono y el fraseo** de los bloques narrativos (2, 6, 7,
8, 9), seguir el registro de `ejemplo-informe.md` (informe modelo completo, ficticio).

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
>
> **Confirmado (2026-09-07):**
> - **No matizar** — poner el contenido tal cual está tipeado (la profesional escribe notas más
>   claras si hace falta). Las notas son un **punteo en vivo**: la skill **sí expande** el telegrama a
>   prosa coherente, pero **preserva el fondo y las citas textuales verbatim** — cambia la forma,
>   nunca el contenido.
> - **Incluir los antecedentes familiares** (p. ej. `mamá con EA`). No se omiten.
> - Lo único que **no** se redacta son las notas internas de protocolo (p. ej. `PROTOCOLO XTEND`).

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
INECO; el Excel, IFS Total.** Además:
- **Orientación temporal/espacial:** sale del subpuntaje de orientación del MMSE (celdas nuevas del
  Excel). La frase es condicional: si alguna **no** está conservada, reflejarlo en vez del boilerplate
  `orientación temporal y espacial conservadas`.
- **Quejas subjetivas de memoria (C-QSM):** si hay puntaje, quejas presentes = **> 3**; si no hay
  puntaje, la observación deriva de la anamnesis / motivo de consulta. No inventar un puntaje.

**7. Cuatro secciones por área cognitiva** — cada una con título, la línea
`Impresión diagnóstica del área: rendimiento cognitivo <calificación>` y un párrafo. Reproducir la
inconsistencia `del área` (secciones 1 y 2) / `por área` (secciones 3 y 4). Léxico Z → palabra
**confirmado** (2026-09-07): `alto` Z > 1 · `conservado`/`normal` (son lo mismo) −1,49 a 1 · `bajo`
−1,99 a −1,5 · `deficitario` ≤ −2. Nombres de función en `mapeo-excel-a-word.md` §4.2.

**8. Párrafo de recap de conclusiones** — área por área, en orden inverso al de la tabla, con los
conectores del ejemplo.

**9. Frase de cierre** — del template de la categoría elegida, adaptada al perfil real del paciente.

**10. Categoría diagnóstica + viñetas de `Se sugiere:`** — aplicar `regla-diagnostica.md`.
⚠️ **Nunca elegir categoría en silencio.** No basta el umbral de Z (ver el recuadro al inicio de
`regla-diagnostica.md`):
- **No tratar las submedidas derivadas como disparador de DCL.** En especial **CE** (= promedio de
  Sem y Rec, "no pesa tanto" y muy exigente). Pesar los **índices principales de área** — para
  memoria: AST (codificación), RSE (evocación), Rec (almacenamiento). Si esos están conservados y sólo
  caen submedidas → la lectura es **fallas aisladas (categoría 2)**, no DCL.
- **Proponer** la categoría, mostrar los Z que la disparan **marcando cuáles son submedidas**, y dejar
  claro que **la decisión final es del médico**.
- Mismas viñetas y orden del template; **localizar el paréntesis de hábitos leyendo la anamnesis** (si
  el paciente ya usa estrategias de compensación o ya hace actividad física, no sugerirlas).
- Si Z < -1,5 + AVD conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución,
  **señalarlo explícitamente** — la prioridad entre esas dos categorías todavía no está confirmada.

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
- BEM–MS AST: el PB es el **promedio de los 3 trials truncado a 2 decimales** (idealmente ya sale por
  fórmula del Excel). La skill lo usa tal como viene en `D13`, no lo recalcula.
- IFS Índice MT (`D31`): deriva de **Dígitos Atrás + Memoria de Trabajo Visual**; si viene como fecha,
  está corrompido — reportarlo, no interpretarlo como fecha.

## Archivos de esta skill

- `mapeo-excel-a-word.md` — **esquema del Excel + de dónde sale cada bloque del Word.** El mapa
  principal.
- `orden-filas-sintesis.md` — las 36 filas, celda de origen, patrones de llenado, mecánica de paste.
- `orden-categorias-graficos.md` — los dos gráficos: orden, redondeo/cap, celdas destino.
- `regla-diagnostica.md` — las 6 categorías + cortes de K-10/AVD + qué se adapta de los templates.
- `excel-unificado-spec.md` — estado del Excel entregado y ajustes propuestos.
- `../preguntasParaLaProfesional.md` — todo lo que falta confirmar con la profesional (fuera del
  paquete de la skill; es documentación interna, no se sube).
- `ejemplo-informe.md` — **informe modelo completo (datos ficticios)**, referencia de tono, estructura
  y fraseo. **Está dentro del paquete**: no hay que adjuntar ningún informe modelo al chat, la skill
  ya lo tiene. Para los bloques narrativos, seguir el registro de este archivo.

## ⚠️ Datos sensibles del paquete de la skill

El informe modelo del paquete (`ejemplo-informe.md`) usa **datos ficticios** — es seguro para subir a
claude.ai. Se derivó de `../ejemplos/informeFinal.docx`, que ya era ficticio.

⚠️ **No reemplazarlo por `../ejemplos/informeFinal2.docx` sin anonimizar:** ese informe (y su Excel
`../ejemplos/excelEvaluacionCompleto.xlsx`) son de un **paciente real** (nombre, fecha de nacimiento,
antecedente familiar, citas de la entrevista). Lo que se sube al paquete queda publicado de forma
persistente. Si algún día se quiere el tono exacto de `informeFinal2`, primero anonimizarlo.

El Excel del paciente **no** va dentro de la skill: es el input que se adjunta en cada pedido.
