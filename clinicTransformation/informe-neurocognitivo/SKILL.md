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
2. **`D31` (IFS Índice MT) puede venir corrompida**: número ~45000–48000 con formato de fecha = una
   autoconversión de un valor tipo `7/10`. **No es una fecha**: el IFS Índice MT deriva de la suma de
   **Dígitos Atrás + Memoria de Trabajo Visual**. *(Se está pasando a fórmula/formato Texto.)*
   ⚠️ **La conversión es reversible: recuperar el valor, no declararlo perdido.** El serial
   formateado como `d/m` devuelve lo que se tipeó (`45936` → `06/10/2025` → **`6/10`** (ejemplo ficticio), que es lo que
   dice el informe real). Deshacer una conversión conocida no es adivinar. Chequeo obligatorio: el
   denominador recuperado tiene que ser el máximo del subtest (`/10`). Si pasa → usar el valor y
   anotarlo en el bloque 11 como recuperado a confirmar; si no pasa → celda vacía y pedir el valor.
   Procedimiento en `mapeo-excel-a-word.md` §5.1.b.
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

## 🚩 Convención de marcado de pendientes — vale para todos los bloques

Lo que va al Word tiene que ser **pegable tal cual**. Un pendiente nunca se escribe en el medio de
una oración ni dentro de una celda de tabla.

> ❌ `El Sr. X asiste [PENDIENTE: falta el dato de "Acompañado" — no está en el Excel] a la consulta…`
> ❌ una celda de la tabla de síntesis con `[PENDIENTE - dato corrupto]`
>
> ✅ prosa completa y gramatical + **el pendiente enumerado en el bloque 11**, citando la oración
> exacta que hay que revisar.

Dos excepciones acotadas, y sólo esas:

- **Una ranura de opción** cuando el Excel no puede resolver un dato binario y el resto de la oración
  no cambia: `asiste [solo / acompañado por …] a la consulta`. Una por oración, sin explicación
  adentro.
- **Celda de tabla sin dato → celda vacía.** Nunca texto.

En los dos casos, el bloque 11 lo repite con el detalle. ⚠️ Fallo observado en la revisión
2026-09-08 (`../ejemplos/revision-salida-ia-vs-informeFinal2.md` §B9).

---

## Formato de salida — 11 bloques

En bloques separados y etiquetados, listos para copy/paste. El mapeo completo de qué sale de dónde
está en `mapeo-excel-a-word.md` §2. Para el **tono y el fraseo** de los bloques narrativos (2, 6, 7,
8, 9), seguir el registro de `ejemplo-informe.md` (informe modelo completo, ficticio).

> ⚠️ **Los bloques narrativos son texto de plantilla con huecos, no redacción libre.** El fallo
> repetido de la primera corrida real fue que la skill emitió **sólo las partes variables** que estos
> bloques enumeran y descartó el boilerplate clínico que las rodea. Las frases invariantes están
> transcritas literalmente en `mapeo-excel-a-word.md` §4.1 (screening) y §4.2 (secciones por área):
> **leerlas antes de redactar los bloques 6 y 7**, no después.

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

**3. Tabla `SÍNTESIS DEL RENDIMIENTO` — se genera ENTERA, no como valores sueltos.**

✅ **Decisión de la profesional (2026-09-08): no hace falta conservar la tabla que ya está en el
Word.** La skill entrega una **tabla nueva y completa** que la reemplaza. No tiene que ser
visualmente idéntica; tiene que **cumplir con lo que informa** la original.

### Formato: **HTML por default**

✅ **HTML es el camino verificado en Word real (2026-09-08)** y el que la profesional aprobó
visualmente: entra como tabla de Word con el sombreado gris de su plantilla. Se entrega como bloque
de código HTML, ella lo guarda como `.html`, lo abre en el navegador, selecciona y copia a Word.

Markdown queda como alternativa rápida (2 pasos en vez de 5) **pero todavía sin probar en Word** y
sin sombreado. Ofrecerlo si lo pide; no emitirlo por default.

### Partes de la tabla

Un solo bloque, con:

1. Título `SÍNTESIS DEL RENDIMIENTO – PERFIL COGNITIVO`.
2. Fila de agrupación de rangos, **con `colspan`**: `Deterioro significativo`=2 (`< -3`, `-3 a -2`) ·
   `Puntajes bajos`=1 (`-2 a -1`) · `Puntajes promedio`=2 (`-1 a 0`, `0 a +1`) ·
   `Puntajes superiores`=3 (`+1 a +2`, `+2 a +3`, `> +3`).
3. Encabezado de **12 columnas**: `ÁREA` · `PRUEBA` · `PB` · `Z` + los 8 tramos de rango.
4. Las **36 filas de datos**, en el orden exacto de `orden-filas-sintesis.md`.

**La leyenda al pie NO se genera.** ✅ Decisión de la profesional (2026-09-08): es **idéntica en todos
los informes**, así que se conserva la de su plantilla y la skill no la emite.

> ⚠️ **Avisar esto en el bloque 11:** en el Word, la leyenda es la **última fila de la propia tabla**
> (39 filas = 2 de encabezado + 36 de datos + 1 de leyenda), no un párrafo suelto. Si se borra la
> tabla vieja entera para pegar la nueva, **la leyenda se va con ella**. Hay que volver a ponerla —
> como nunca cambia, alcanza con copiarla de cualquier informe anterior.
>
> Corolario: la discusión sobre el `trazado diagonal` que la leyenda menciona y no existe deja de
> afectar la salida de la skill. Sigue abierta como decisión de ella sobre su propia plantilla
> (`../preguntasParaLaProfesional.md` §C.1), pero la skill ya no la toca ni la reproduce.

**12 columnas en todas las filas** — el `gridSpan` de la plantilla vieja no se replica, y la columna
`ÁREA` **repite el nombre en cada fila** en vez de combinar celdas. Esa uniformidad es justamente lo
que elimina el problema de alineación.

Los tres patrones de llenado siguen igual:

- **Con Z** (15 filas): PB numérico · Z a **2 decimales con coma, con el cero final** (`-0,90`, no
  `-0,9`) o el cap · **1 X** en la columna de rango que corresponde · las otras 7 **vacías**.
- **Cualitativa simple** (19 filas): el texto entero va en **PB** (`29/30`, `3 normal`, `Normal`) ·
  **`N/A`** en Z y en las 8 columnas de rango.
- **AVD y KPDS-10** (2 filas): PB numérico · la palabra de `E27`/`E28` en Z · **`N/A`** en las 8 de
  rango.

En una frase: **la X se completa si y solo si Z es numérico**, el texto cualitativo va en PB salvo en
AVD y KPDS-10, y **`N/A` marca las celdas donde la prueba no lleva puntaje Z**.

En HTML, esas celdas llevan **`N/A` sobre fondo gris `#D9D9D9`** — las dos cosas: el texto porque la
profesional lo pidió explícitamente, y el gris porque reproduce su plantilla. Las columnas de
severidad de las filas con Z llevan `#A6A6A6` (`< -3`, `-3 a -2`) y `#D9D9D9` (`-2 a -1`), **vacías**.

> 🚩 **`N/A` no es lo mismo que celda vacía.** En una fila **con Z**, las 7 columnas de rango sin `X`
> **van vacías, no `N/A`**: esos tramos sí aplican, el puntaje simplemente no cae ahí — poner `N/A`
> en la columna `-3 a -2` de `DD` afirmaría algo falso. `N/A` = "esta prueba no tiene puntaje Z";
> celda vacía = "el Z no cae en este tramo".
> Control: **187 celdas `N/A`** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10 × 8) y **15 filas con
> una `X`**.

Cap: `Z ≥ +3` → `≥3`, `Z ≤ −3` → `≤-3`; el valor capado igual lleva X en la columna del extremo.

### 🚩 Autochequeo obligatorio — declararlo en la salida

Son 36 filas × 12 celdas escritas a mano: los errores de transcripción son el riesgo principal y
**todos estos números son verificables antes de entregar**. Contarlos y decir el resultado:

| Chequeo | Valor esperado |
|---|---|
| Filas de datos | **36**, en el orden de `orden-filas-sintesis.md` |
| Celdas por fila | **12**, todas |
| Suma de los `colspan` de la fila de agrupación | **8** (2+1+2+3) |
| Celdas `N/A` | **187** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10 × 8) |
| Filas con `X` | **15**, una `X` por fila, sólo donde Z es numérico |
| Leyenda al pie | **ausente** |

El conteo de `N/A` y el de `X` sólo valen para una batería completa; si falta alguna prueba, recalcular
y decir de dónde sale la diferencia.

⚠️ **El chequeo del `colspan` nació de un error real** (prueba en Word del 2026-09-08): sin los
`colspan`, cada rótulo ocupaba una sola columna, los cuatro tramos de la derecha quedaban sin rótulo
y los anchos se deformaban. Se detectó recién al mirar la tabla ya armada en Word.

Hay un generador de referencia en `../ejemplos/generar-tabla-sintesis.js` con el HTML exacto que se
validó (estructura, colores, colspan). **Usarlo como plantilla de la que se copia la forma**,
cambiando los datos — no reinventar el markup en cada corrida.

> ⚠️ **Por qué cambió el enfoque:** antes se pegaban sólo los valores, con tabs, dentro de la tabla
> existente. En la primera corrida real los valores eran **todos correctos** y el pegado se habría
> desalineado igual, porque los tabs finales se pierden en el chat y se perdían distinto según la fila
> (filas de 9 y de 7 campos donde todas debían tener 10) — revisión 2026-09-08, §B1. Además nunca se
> probó si el cursor de Word baja a la celda `PB` de la fila siguiente o a la primera columna. Al
> generar la tabla entera, **los dos riesgos desaparecen**. El enfoque viejo queda documentado como
> alternativa en `orden-filas-sintesis.md`.

**4. Valores del gráfico 1** (14 valores Z) — `orden-categorias-graficos.md`. **Punto decimal.**
Mismos valores redondeados y capados que la columna Z de la tabla (el cap va como número `-3`/`3`, no
como texto). Instrucción de pegado **posicional**: empezar en la celda inmediatamente debajo del
encabezado con el año, porque la columna destino cambia según el archivo.

**5. Valores del gráfico 2** (10 ítems del K-10) — **hoy no se puede generar**: el Excel sólo trae el
total. Decirlo, y pedir el desglose del papel.

**6. Sección de screening** — **esqueleto de 6 frases, transcrito literal en
`mapeo-excel-a-word.md` §4.1: copiarlo de ahí.** Sólo una de las seis lleva puntajes
(`(MMSE=29/30; TRO= 10/10; INECO=27,5/30)`, de `D25`, `D26` y `D30`); las otras cinco son
observación conductual invariante y **van siempre** — discurso, nivel de alerta y fatiga,
orientación, malestar psicológico + quejas subjetivas, autonomía en AVD. **El Word lo llama INECO; el
Excel, IFS Total.** Va como un solo párrafo corrido, sin puntajes entre paréntesis fuera de la frase
4. ⚠️ En la primera corrida real se emitió sólo la frase de puntajes y se perdieron tres frases fijas
(revisión 2026-09-08, §B4). Además:
- **Orientación temporal/espacial:** sale del subpuntaje de orientación del MMSE (celdas nuevas del
  Excel). La frase es condicional: si alguna **no** está conservada, reflejarlo en vez del boilerplate
  `orientación temporal y espacial conservadas`.
- **Quejas subjetivas de memoria (C-QSM):** si hay puntaje, quejas presentes = **> 3**; si no hay
  puntaje, la observación deriva de la anamnesis / motivo de consulta. No inventar un puntaje.

**7. Cuatro secciones por área cognitiva** — cada una con título, la línea
`Impresión diagnóstica del área: rendimiento cognitivo <calificación>` y un párrafo. Reproducir la
inconsistencia `del área` (secciones 1 y 2) / `por área` (secciones 3 y 4). Léxico Z → palabra
**confirmado** (2026-09-07): `alto` Z > 1 · `conservado`/`normal` (son lo mismo) −1,49 a 1 · `bajo`
−1,99 a −1,5 · `deficitario` ≤ −2.

**`mapeo-excel-a-word.md` §4.2 es de lectura obligatoria antes de escribir estos cuatro párrafos.**
Lo esencial:

- 🚫 **Ni siglas ni valores Z en la prosa.** El Z ya está en la tabla y en el gráfico; el párrafo lo
  traduce. `(DD=0,45)` está prohibido. Lo único numérico admitido es el PB en palabras
  (`logrando retener 7 dígitos de manera directa`).
- 🚫 **No se narran nunca:** `BEM–MS CE`, los 8 subpuntajes del IFS + `Índice MT`, ni los ensayos
  `AS1/AS2/AS3` sueltos. El IFS se resume en `Puntaje conservado en la prueba ejecutiva.`
- 🚩 **`BEM–MS Sem` no es "memoria semántica":** mide el beneficio de la facilitación por claves
  semánticas. Un Sem bajo se dice `bajo beneficio de la facilitación de claves semánticas`, **nunca**
  como una falla de una función. Tabla completa sigla BEM → prosa en §4.2.
- Cada sección tiene **frases fijas de apertura** (nivel de alerta, comprensión/expresión, entonación
  y articulación, el párrafo entero de visoconstrucción): están literales en §4.2.

**8. Párrafo de recap de conclusiones** — área por área con los conectores del ejemplo, en este
orden: **visoconstrucción (+ orientación) → lenguaje → atención/ejecutivas → memoria (seriada, luego
lógica)**. Es el inverso de la tabla **salvo memoria, que va última** — observado en los dos informes
reales (`mapeo-excel-a-word.md` §4.3).

**9. Frase de cierre** — **una sola oración**, que arranca con `En conclusión,`. Del template de la
categoría elegida, adaptada al perfil real del paciente, nombrando la función afectada en palabras
clínicas (`recuperación de la memoria`) y **sin siglas ni índices**.

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
  El paréntesis es un **sintagma nominal de 3 a 8 palabras** con lo que **sí** se sugiere
  (`(mejorar calidad del sueño, técnicas de manejo del estrés)`). Nada de metacomentario del tipo
  `ya realiza actividad física, por lo que no se sugiere incorporarla`: eso va al bloque 11.
- Si Z < -1,5 + AVD conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución,
  **señalarlo explícitamente** — la prioridad entre esas dos categorías todavía no está confirmada.

**11. Reporte de faltantes y dudas** — bloque final con los faltantes detectados (ver arriba), las
celdas sospechosas y todo lo que quedó marcado como dudoso. Este bloque no se pega en el Word: es
para el profesional. Incluye además:

- **Los valores recuperados** (p. ej. `D31` reconstruida desde el serial), para que los confirme.
- **Las oraciones con ranura** (`[solo / acompañado por …]`), citadas textualmente.
- **El razonamiento del paréntesis de hábitos**: qué se descartó de la anamnesis y por qué.
- **Los conteos de campos** de los 3 bloques de pegado.
- **Ediciones a hacer sobre la plantilla del Word**, no sólo datos faltantes. La más frecuente:
  **`PRUEBAS ADMINISTRADAS` es una lista fija que incluye `Cuestionario de quejas subjetivas de
  memoria (C-QSM)`, y el C-QSM a veces no se toma** — si no se tomó, avisar que **hay que borrar esa
  línea** del informe. Mismo criterio para cualquier prueba de la lista sin dato en el Excel.

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
- `../ejemplos/revision-salida-ia-vs-informeFinal2.md` — **comparación de una corrida real de la
  skill contra el informe que la profesional escribió a mano desde el mismo Excel** (2026-09-08).
  Es de dónde salen las advertencias `⚠️ Fallo observado` de estos archivos: qué validó bien (todos
  los PB/Z/X y los 14 valores del gráfico) y los 11 fallos corregidos. Fuera del paquete, no se sube.
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
