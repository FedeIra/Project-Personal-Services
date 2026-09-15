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

Un único Excel adjunto en el chat (`excelEvaluacionCompletoV4.xlsx` o equivalente). **Sólo se lee la
hoja `TABLA DE FORMULAS`**; las otras seis (`Stroop`, `MMSE`, `Puntajes Equivalentes`, `PRUEBAS`,
`FLUENCIAS`, `BACK UP`) son tablas de normas que ya alimentaron los `VLOOKUP` y no se leen.

Esquema de la hoja (detalle completo, con las fórmulas, en `mapeo-excel-a-word.md` §1):

| Rango | Contenido |
|---|---|
| `B2:B10` | Demográficos **y** parámetros: nombre, edad, fecha de nacimiento, nivel educativo, lateralidad, fecha de evaluación, acompañamiento, derivante, riesgo de evolución. |
| `B3`, `B5` | Edad y nivel educativo — **drivers de todas las fórmulas**. En V3 son también los que van al Word: **un solo lugar, no hay duplicado**. |
| `A12:D47` | Cuadro de pruebas: `A`=Área `B`=Prueba `C`=PB `D`=Z. Sin celdas combinadas. |
| `A13`, `A19`, `A34`, `A41`, `A46` | Rótulos de las 5 áreas. |
| `C14`, `C15` | Orientación temporal / espacial (`Si`/`No`). **No son filas de la tabla de síntesis** — alimentan la frase 3 del screening. |
| `D17`, `D18` | Interpretación de AVD y de KPDS-10 (texto, pass-through). Ojo: van en la columna `Z`. |
| `P35`, `P36`, `P37` | Ensayos BEM–MS AS1 / AS2 / AS3. **Única fuente** de esas 3 filas del informe. |
| `L29:M43` | Media y desvío por prueba (`VLOOKUP`). Sólo backend: no se leen para el informe. |
| `B50:B59` | Los 10 ítems del K-10, en orden del gráfico. `B60` = `SUMA`. |
| `A62` | Rótulo `C-QSM` — **sin celda de puntaje** (ver faltantes). |
| `A65:A73` | Notas crudas de la anamnesis, una viñeta por celda. |

`B4` y `B7` son **seriales de fecha** de Excel: convertir a `dd/mm/aaaa`, no imprimir el número.

### Chequeos de entrada — qué verificar y avisar, sin rellenar

✅ **`excelEvaluacionCompletoV4.xlsx` (2026-09-15) cierra los faltantes bloqueantes** que tenían las
versiones anteriores: los 10 ítems del K-10, el flag de riesgo de evolución, la orientación
temporal/espacial, el `IFS Índice MT` como texto y la unificación del bloque demográfico. **Ya no hay
ningún bloque del informe que no se pueda generar desde el Excel**, salvo lo que abajo se marca.

Lo que sí hay que chequear en cada archivo que llegue:

1. **`A62` (C-QSM) es un rótulo sin celda de puntaje.** El C-QSM **no se toma en toda evaluación**
   (`informeFinal.docx` no lo lista; `informeFinal2.docx` sí) y **su puntaje nunca aparece en el
   informe**: no es fila de la tabla, no está en los gráficos y no se cita en la prosa. Lo único que
   decide es media frase del screening. Sin puntaje, la observación de quejas subjetivas **se deriva
   de la anamnesis** y **hay que avisar en el bloque 11 que la línea del C-QSM se borra de
   `PRUEBAS ADMINISTRADAS`** del Word. Si aparece un puntaje, quejas presentes = **> 3**. Nunca
   inventar uno, y **nunca escribirlo en el informe** aunque exista.
2. **PB derivados: `C34` (AST) y `C38` (CE).** Desde 2026-09-15 salen por fórmula —
   `C34`=`=TRUNCAR(Q35;2)` (promedio de los 3 ensayos) y `C38`=`=TRUNCAR(P40;2)` (promedio de Sem y
   Rec). En archivos anteriores están tipeados a mano: comparar `C34` con `TRUNCAR(Q35;2)` y `C38`
   con `TRUNCAR(P40;2)` y, si no coinciden, decirlo en el bloque 11. **Nunca recalcular el Z** — viene
   del Excel, incluso si el PB no cierra.
3. **Total del K-10:** desde 2026-09-15 `C18` es `=B60` (`=SUMA(B50:B59)`), así que el PB de la tabla
   de síntesis, el gráfico 2 y el corte ≥ 25 salen del mismo lugar. En archivos anteriores `C18`
   estaba tipeado: si difiere de `B60`, **señalarlo y no elegir por cuenta propia** — puede ser un
   override deliberado del corte anímico.
4. **`B8` (`Asiste acompañado con`) tiene rótulo y dominio ambiguos.** Leerlo así: `No` o vacío ⇒
   `asiste solo/a`; cualquier otro texto ⇒ `asiste acompañado/a por <texto>`. Anotarlo en el bloque 11.
5. **Campos Sí/No.** `B10` (`Riesgo de evolución`) tiene validación de lista desde V4; `C14`/`C15`
   (orientación) todavía no. Normalizar tolerantemente igual (`Sí`/`si`/`SI`/`No`/`no`). Si el valor
   no es interpretable como sí/no, **señalarlo** en vez de asumir `No`. **Nunca inferir el riesgo de
   evolución de los puntajes.**
6. **Las dos filas de TRO pueden traer valores distintos** (`C16` screening vs `C46`
   visoconstrucción). **Copiar cada celda en su fila, no reconciliarlas**, y anotar la diferencia en
   el bloque 11 si existe.
7. **Celdas `X/Y` con pinta de fecha.** V3 las guarda como texto, pero si alguna vez llega un número
   entre ~45000 y ~48000 en una celda que debería decir `7/10`, es una autoconversión de Excel y **es
   reversible**: formatear el serial como `d/m` devuelve lo tipeado. Chequeo obligatorio: el
   denominador recuperado tiene que ser el máximo del subtest. Si pasa → usar el valor y anotarlo en
   el bloque 11 como recuperado a confirmar; si no pasa → celda vacía y pedir el valor. Nunca escribir
   un marcador de pendiente dentro de una celda.

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

El Excel se lee con código, y las celdas con fórmula (la columna `D` de las filas con Z, `L29:M43`,
`Q35`, `P40`, `B60`) sólo tienen el
valor calculado cacheado si el archivo fue **guardado en Excel**. Si se sube sin guardar, o fue
editado con otro programa, pueden leerse vacías. Avisar al usuario si se detecta ese patrón.

---

## 🚩 Convención de marcado de pendientes — vale para todos los bloques

Lo que va al Word tiene que ser **pegable tal cual**. Un pendiente nunca se escribe en el medio de
una oración ni dentro de una celda de tabla.

> ❌ `El Sr. X asiste [PENDIENTE: falta el dato de "Acompañado" — no está en el Excel] a la consulta…`
> ❌ una celda de la tabla de síntesis con `[PENDIENTE - dato corrupto]`
> ❌ `...menciona que olvida cosas puntuales — "fue a un partido y por ahí…" (nota incompleta en el
> registro original, sin continuación).` — **el paciente puede leer este informe**; comentar el estado
> del dato de origen (que la nota esté truncada, mal tipeada, etc.) es tan inapropiado ahí como un
> `[PENDIENTE]` explícito, aunque no use esa palabra.
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
está en `mapeo-excel-a-word.md` §2, y las direcciones de celda en §1 (**única fuente**; este archivo
las repite). Para el **tono y el fraseo** de los bloques narrativos (2, 6, 7,
8, 9), seguir el registro de `ejemplo-informe.md` (informe modelo completo, ficticio).

> ⚠️ **Los bloques narrativos son texto de plantilla con huecos, no redacción libre.** El fallo
> repetido de la primera corrida real fue que la skill emitió **sólo las partes variables** que estos
> bloques enumeran y descartó el boilerplate clínico que las rodea. Las frases invariantes están
> transcritas literalmente en `mapeo-excel-a-word.md` §4.1 (screening) y §4.2 (secciones por área):
> **leerlas antes de redactar los bloques 6 y 7**, no después.

**1. Tabla de datos personales** — pass-through de `B2:B7`, con las fechas (`B4`, `B7`) ya en
`dd/mm/aaaa` y la edad como `<B3> años`. La fila `Deriva:` sale de `B9` **tal cual** (incluido el
`-`) si la plantilla del profesional la tiene — `informeFinal.docx` sí, `informeFinal2.docx` no.
**No agregar ni quitar filas respecto de esa plantilla**; si `B9` nombra un derivante y la plantilla
no trae la fila, señalarlo en el bloque 11. No hay DNI ni ocupación, y `B8`/`B10` **no** van acá.

### Formato: **HTML por default**

⚠️ **Mismo problema que motivó el cambio a HTML en el bloque 3** (fallo observado en prueba real,
2026-09-08): una tabla en Markdown, copiada tal cual desde el chat, se pega en Word **corrida en un
solo párrafo** (`PacienteBunader, José AlbertoEdad61 años…`), sin separación entre campo y valor ni
salto de línea entre filas. Entregar este bloque también como **HTML**: tabla simple de 2 columnas
(`Campo` / `Valor`), 6 filas (7 si aplica `Deriva:`). No hace falta sombreado ni bordes marcados —
alcanza con que cada campo quede en su propia fila al pegar. Mismo mecanismo de paste que el bloque 3:
guardar como `.html`, abrir en el navegador, seleccionar todo, copiar a Word.

**2. `MOTIVO DE CONSULTA Y ANTECEDENTES`** — redacción de las viñetas de `A65:A73` a prosa en tercera
persona y presente, una viñeta ≈ un párrafo, mismo orden, conservando las citas textuales entre
comillas. Formas fijas del primer y último párrafo, verbos de reporte y concordancia de género: ver
`mapeo-excel-a-word.md` §3.

> ⚠️ **Bloque de mayor riesgo del pipeline.** No suavizar, reinterpretar ni reencuadrar el contenido
> anímico: transcribir lo que dice la nota. Si una nota es ambigua o está truncada, dejarla ambigua en
> la prosa **tal cual llega, sin agregar ninguna aclaración sobre el estado del dato** — el paciente
> puede leer este texto. Señalarlo **sólo en el bloque 11** (ver la convención de marcado de
> pendientes más arriba). Incluir todo y **marcar lo dudoso ahí** en vez de decidir sola qué omitir.
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

> ✅ **Ajuste de ancho post-paste, verificado (2026-09-08).** Con 12 columnas es esperable que la tabla
> quede apretada por los márgenes de la página al pegarla. Solución probada por el usuario: clic
> derecho dentro de la tabla ya pegada → **Autoajustar → "Autoajustar al contenido"** → de nuevo clic
> derecho → **Propiedades de tabla → pestaña Tabla → Ancho preferido → 130 %**. Sin tocar márgenes del
> documento ni el HTML. **Incluir este paso en el bloque 11** (o junto al bloque de la tabla) para que
> el profesional lo aplique al pegar.

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

**Columna `ÁREA`: celdas fusionadas verticalmente (`rowspan`), como en la plantilla original.**
✅ Decisión 2026-09-08 — revierte la uniformidad anterior (que repetía el nombre en cada fila para
simplificar la generación). Sólo la **primera fila de cada uno de los 5 grupos** lleva la celda
`ÁREA` (con su `rowspan`); las demás filas del grupo **omiten esa celda por completo** — por eso
tienen **11** `<td>` en vez de 12. Esto sólo es posible en HTML (Markdown no soporta `rowspan`), otra
razón por la que la tabla se entrega siempre en HTML. Los 5 grupos y su `rowspan`:

| Área | Filas | `rowspan` |
|---|---|---|
| `Screening cognitivo y psiquiátrico` | 1–4 | 4 |
| `Atención y funciones ejecutivas` | 5–19 | 15 |
| `Memoria episódica` | 20–29 | 10 |
| `Lenguaje` | 30–34 | 5 |
| `Visoconstrucción` | 35–36 | 2 |

Los tres patrones de llenado siguen igual:

- **Con Z** (15 filas): PB numérico · Z a **2 decimales con coma, con el cero final** (`-0,90`, no
  `-0,9`) o el cap · **1 X** en la columna de rango que corresponde · las otras 7 **vacías**.
- **Cualitativa simple** (19 filas): el texto entero va en **PB** (`29/30`, `3 normal`, `Normal`) ·
  **celda vacía, sin texto**, con fondo gris `#D9D9D9` en Z y en las 8 columnas de rango.
- **AVD y KPDS-10** (2 filas): PB numérico · la palabra de `D17`/`D18` en Z · **celda vacía, sin
  texto**, con fondo gris `#D9D9D9` en las 8 de rango.

En una frase: **la X se completa si y solo si Z es numérico**, el texto cualitativo va en PB salvo en
AVD y KPDS-10, y **el fondo gris `#D9D9D9` marca las celdas donde la prueba no lleva puntaje Z** — sin
ningún texto adentro.

✅ **Cambio 2026-09-08: ya no se escribe `N/A`.** La celda queda **vacía, sólo con el fondo gris** —
así lo hacía el Word original antes de que la skill agregara el texto como sustituto del color en
Markdown. En HTML el color sobrevive el paste (verificado en Word real), así que el texto ya no hace
falta y sólo agrandaba las columnas. Las columnas de severidad de las filas con Z llevan `#A6A6A6`
(`< -3`, `-3 a -2`) y `#D9D9D9` (`-2 a -1`), **vacías**, igual que antes.

> 🚩 **El gris de "no aplica" no es lo mismo que una celda vacía sin sombrear.** En una fila **con Z**,
> las 7 columnas de rango sin `X` **van vacías y sin sombreado propio** (salvo las bandas de severidad,
> que llevan su color fijo en todas las filas): esos tramos sí aplican, el puntaje simplemente no cae
> ahí. El gris `#D9D9D9` uniforme en Z + las 8 de rango de las filas cualitativas/AVD/KPDS-10 significa
> algo distinto: "esta prueba no tiene puntaje Z". Ninguna de las dos lleva texto — la diferencia la
> hace sólo el patrón de sombreado.
> Control: **187 celdas vacías por no llevar puntaje Z** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10
> × 8, todas con fondo `#D9D9D9`) y **15 filas con una `X`**.

Cap: `Z ≥ +3` → `≥3`, `Z ≤ −3` → `≤-3`; el valor capado igual lleva X en la columna del extremo.

### 🚩 Autochequeo obligatorio — declararlo en la salida

Son 36 filas escritas a mano: los errores de transcripción son el riesgo principal y **todos estos
números son verificables antes de entregar**. Contarlos y decir el resultado:

| Chequeo | Valor esperado |
|---|---|
| Filas de datos | **36**, en el orden de `orden-filas-sintesis.md` |
| Celdas por fila | **12** en las **5** filas que abren grupo de área (llevan el `rowspan`) · **11** en las **31** filas restantes (sin celda `ÁREA`, fusionada hacia arriba) |
| Celdas `ÁREA` emitidas | **5** (una por grupo, no 36) — suma de sus `rowspan` = **36** (4+15+10+5+2) |
| Suma de los `colspan` de la fila de agrupación | **8** (2+1+2+3) |
| Celdas vacías sin puntaje Z (fondo `#D9D9D9`) | **187** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10 × 8) |
| Filas con `X` | **15**, una `X` por fila, sólo donde Z es numérico |
| Leyenda al pie | **ausente** |

El conteo de celdas vacías y el de `X` sólo valen para una batería completa; si falta alguna prueba,
recalcular y decir de dónde sale la diferencia.

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

**5. Valores del gráfico 2** (10 ítems del K-10) — ✅ **ya sale del Excel**: `B50:B59`, en ese orden,
enteros sin decimales ni cap. Etiquetas y celdas destino en `orden-categorias-graficos.md`. Chequeo:
la suma de los 10 tiene que dar `B60`, y `B60` debería coincidir con `C18` (el PB de la tabla de
síntesis); si no coincide, decirlo.

**6. Sección de screening** — **esqueleto de 6 frases, transcrito literal en
`mapeo-excel-a-word.md` §4.1: copiarlo de ahí.** Sólo una de las seis lleva puntajes
(`(MMSE=29/30; TRO= 10/10; INECO=27,5/30)`, de `C13`, `C16` y `C24`); las otras cinco son
observación conductual invariante y **van siempre** — discurso, nivel de alerta y fatiga,
orientación, malestar psicológico + quejas subjetivas, autonomía en AVD. **El Word lo llama INECO; el
Excel, IFS Total.** Va como un solo párrafo corrido, sin puntajes entre paréntesis fuera de la frase
4. ⚠️ En la primera corrida real se emitió sólo la frase de puntajes y se perdieron tres frases fijas
(revisión 2026-09-08, §B4). Además:
- **Orientación temporal/espacial:** sale de `C14` y `C15` (`Si`/`No`). Con las dos en `Si` va el
  boilerplate `Orientación temporal y espacial conservadas.`; si alguna dice `No`, **invertir la
  frase para esa orientación** en vez de emitir el boilerplate. Si las celdas están vacías, va la
  forma afirmativa y el pendiente se lista en el bloque 11, nunca dentro de la oración.
- **Quejas subjetivas de memoria (C-QSM):** `A62` es un rótulo sin celda de puntaje. Hoy la
  observación deriva de la anamnesis / motivo de consulta. Si alguna vez llega un puntaje, quejas
  presentes = **> 3**. No inventar un puntaje.

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

- **Los valores recuperados** (p. ej. `C25` reconstruida desde el serial), para que los confirme.
- **Las oraciones con ranura** (`[solo / acompañado por …]`), citadas textualmente.
- **El razonamiento del paréntesis de hábitos**: qué se descartó de la anamnesis y por qué.
- **Los conteos de campos** de los 3 bloques de pegado.
- **Cómo ajustar el ancho de la tabla de síntesis después de pegarla** (ver §Formato del bloque 3):
  Autoajustar al contenido + Ancho preferido 130 %.
- **Ediciones a hacer sobre la plantilla del Word**, no sólo datos faltantes. La más frecuente:
  **`PRUEBAS ADMINISTRADAS` es una lista fija que incluye `Cuestionario de quejas subjetivas de
  memoria (C-QSM)`, y el C-QSM a veces no se toma** — si no se tomó, avisar que **hay que borrar esa
  línea** del informe. Mismo criterio para cualquier prueba de la lista sin dato en el Excel.

## Reglas de negocio a aplicar

- Sintomatología anímica: derivar de K-10 ≥ 25 por default; usar el flag manual del Excel si el
  profesional lo sobrescribió.
- AVD conservadas/comprometidas: 0–5 = comprometidas, 6–8 = conservadas. **La palabra que va al Word
  sale de `D17`, no de esta tabla.**
- Desempate en rangos cuando el Z cae justo en un límite: **pendiente de confirmar**. Propuesta:
  límite inferior inclusive, superior exclusivo. Si un Z cae exactamente en un borde, señalarlo.
- FF y TRO aparecen dos veces en la tabla de síntesis — completar ambas filas, no omitir ninguna.
- BEM–MS AST: el PB es el **promedio de los 3 trials truncado a 2 decimales** (idealmente ya sale por
  fórmula del Excel). La skill lo usa tal como viene en `C34`, no lo recalcula.
- IFS Índice MT (`C25`): deriva de **Dígitos Atrás + Memoria de Trabajo Visual**. En V3 es **texto**
  (`7/10`) y se copia tal cual; sólo aplica el rescate del chequeo 7 si alguna vez vuelve como número.
- Orientación (`C14`/`C15`) y riesgo de evolución (`B10`) **no** son filas de la tabla de síntesis:
  la tabla tiene 36 filas y no cambia con los campos nuevos de V3.

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
`../ejemplos/excelEvaluacionCompletoV4.xlsx` y sus versiones anteriores) son de **pacientes reales** (nombre, fecha de nacimiento,
antecedente familiar, citas de la entrevista). Lo que se sube al paquete queda publicado de forma
persistente. Si algún día se quiere el tono exacto de `informeFinal2`, primero anonimizarlo.

El Excel del paciente **no** va dentro de la skill: es el input que se adjunta en cada pedido.
