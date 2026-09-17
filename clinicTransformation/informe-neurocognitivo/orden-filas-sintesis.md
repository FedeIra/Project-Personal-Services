# Orden de filas — tabla "SÍNTESIS DEL RENDIMIENTO"

> Extraído del XML de las tablas reales de **`informeFinal.docx` e `informeFinal2.docx`**. Las dos
> plantillas son **estructuralmente idénticas** (mismas 36 filas de datos, mismo orden, mismos
> conteos de celda), así que lo de acá es la plantilla y no un caso particular.
>
> Área y Prueba son fijas en la plantilla — la skill nunca las toca. Sólo genera PB / Z / columna-X
> por fila, en este orden posicional.

**IMPORTANTE — filas duplicadas por nombre:** TRO (filas 2 y 35) y FF (filas 9 y 30) aparecen dos
veces con Área distinta y, en el caso de FF, con el mismo PB/Z. Cualquier estructura de datos para
esta tabla (Excel unificado incluido) debe ser **posicional (índice de fila), nunca un diccionario
`prueba → valor`** — un lookup por nombre colisiona en TRO y FF.

## Las 36 filas, con su celda de origen en el Excel

Celdas de `excelEvaluacionCompletoV5.xlsx`, hoja `TABLA DE FORMULAS` (esquema completo y **única
fuente de direcciones** en `mapeo-excel-a-word.md` §1).

> 🚩 **Las direcciones cambiaron en V5.** Los ensayos AS1/AS2/AS3 pasaron de vivir sueltos en
> `P35:P37` a ser filas propias del cuadro (`C34:C36`), y todo lo que venía después **se corrió 3
> filas**. Si una referencia de este paquete dice `C34` para AST o `D43` para TBA, es de V3/V4.

> 🚩 **La tabla del informe tiene 36 filas; el cuadro del Excel tiene 38.** La diferencia son las dos
> de orientación (`C14`/`C15`), que **no son filas de esta tabla** — los dos informes reales tienen
> exactamente estas 36. La orientación alimenta la frase 3 del screening; `B8`/`B9`/`B10`, la
> anamnesis y la categoría diagnóstica. **No agregar filas para "que coincida con el Excel"**, y
> ojo con la numeración: en este archivo `#` es la fila **del informe**, no la del Excel.

| # | Área | Prueba | Tipo | PB desde | Z desde |
|---|------|--------|------|----------|---------|
| 1 | Screening cognitivo y psiquiátrico | MMSE | Cualitativa | `C13` | — |
| 2 | | TRO | Cualitativa | `C16` | — |
| 3 | | AVD | Cualitativa **con interpretación en Z** | `C17` | `D17` |
| 4 | | KPDS-10 | Cualitativa **con interpretación en Z** | `C18` | `D18` |
| 5 | Atención y funciones ejecutivas | DD | Con Z | `C19` | `D19` |
| 6 | | DI | Con Z | `C20` | `D20` |
| 7 | | TMT A | Con Z | `C21` | `D21` |
| 8 | | TMT B | Con Z | `C22` | `D22` |
| 9 | | FF | Con Z | `C23` | `D23` |
| 10 | | IFS Total | Cualitativa | `C24` | — |
| 11 | | IFS Índice MT | Cualitativa | `C25` | — |
| 12 | | IFS SM | Cualitativa | `C26` | — |
| 13 | | IFS IC | Cualitativa | `C27` | — |
| 14 | | IFS CIM | Cualitativa | `C28` | — |
| 15 | | IFS DA | Cualitativa | `C29` | — |
| 16 | | IFS MA | Cualitativa | `C30` | — |
| 17 | | IFS MTV | Cualitativa | `C31` | — |
| 18 | | IFS R | Cualitativa | `C32` | — |
| 19 | | IFS CIV | Cualitativa | `C33` | — |
| 20 | Memoria episódica | BEM–MS AS1 | Cualitativa (PB por ensayo) | `C34` | — |
| 21 | | BEM–MS AS2 | Cualitativa (PB por ensayo) | `C35` | — |
| 22 | | BEM–MS AS3 | Cualitativa (PB por ensayo) | `C36` | — |
| 23 | | BEM–MS AST | Con Z | `C37` | `D37` |
| 24 | | BEM–MS RSE | Con Z | `C38` | `D38` |
| 25 | | BEM–MS Sem | Con Z | `C39` | `D39` |
| 26 | | BEM–MS Rec | Con Z | `C40` | `D40` |
| 27 | | BEM–MS CE | Con Z | `C41` | `D41` |
| 28 | | BEM–ML Inm | Con Z | `C42` | `D42` |
| 29 | | BEM–ML Dif | Con Z | `C43` | `D43` |
| 30 | Lenguaje | FF | Con Z | `C44` | `D44` |
| 31 | | FS | Con Z | `C45` | `D45` |
| 32 | | TBA | Con Z | `C46` | `D46` |
| 33 | | Comprensión | Cualitativa | `C47` | — |
| 34 | | Expresión | Cualitativa | `C48` | — |
| 35 | Visoconstrucción | TRO | Cualitativa | `C49` | — |
| 36 | | MMSE copia | Cualitativa | `C50` | — |

### 🆕 La X de cada tramo ya viene calculada en el Excel (V5)

Las 15 filas con Z tienen, además, las **8 columnas de rango en `E:L`** resueltas por fórmula
(`mapeo-excel-a-word.md` §1). La correspondencia es directa:

| Columna del Excel | Tramo |
|---|---|
| `E` · `F` | `< -3` · `-3 a -2` |
| `G` | `-2 a -1` |
| `H` · `I` | `-1 a 0` · `0 a +1` |
| `J` · `K` · `L` | `+1 a +2` · `+2 a +3` · `> +3` |

➡️ **La skill lee la `X` de ahí en vez de decidir el tramo.** Las asignaciones de la tabla de abajo
siguen siendo la referencia de *qué tiene que dar*, y los autochequeos siguen corriendo — pero pasan
de verificar un cálculo propio a **cruzar contra el Excel**.

⚠️ **El cap de ±3 NO viene resuelto.** En el Excel es un **formato de número**
(`[<=-3]"≤-3";[>=3]"≥3";0.00`): se ve capado en pantalla, pero una lectura por código devuelve el Z
crudo (`-3.1067…`). **La skill sigue aplicando el cap** al escribir la columna Z.

✅ **`C25` (IFS Índice MT) ya no se corrompe.** En V1 se autoconvertía a serial de fecha; **desde V3 es
texto** (`7/10`) y se copia tal cual. El valor deriva de Dígitos Atrás + Memoria de Trabajo Visual.

Si alguna vez vuelve a llegar como número (~45000–48000), la conversión **es reversible**: formatear
el serial como `d/m` devuelve lo tipeado. Chequear que el denominador coincida con el máximo del
subtest (`/10`), usar el valor en esta fila y anotarlo en el bloque 12 como recuperado a confirmar.
**Nunca** dejar `[PENDIENTE …]` escrito dentro de la celda — celda sin dato = celda vacía.

⚠️ **Fila 2 vs fila 35 (TRO):** `C16` y `C49` traen valores distintos. **Copiar cada celda en su
fila**, no reconciliarlas, y anotar la diferencia en el bloque 12 (`mapeo-excel-a-word.md` §5.f).

## Cómo se completa cada fila: PB, Z y la X de rango

**Corrección importante respecto de versiones anteriores de este archivo.** Se creía que las filas
cualitativas llevaban el texto de interpretación en la columna **Z**. Leyendo el XML de los dos
informes: **no es así en 32 de las 34 filas cualitativas.** El valor va en **PB** y Z queda vacía.

Los tres patrones reales, con ejemplos verbatim de `informeFinal2.docx`:

| Patrón | Filas | PB | Z | X de rango |
|---|---|---|---|---|
| **Con Z** | 5–9, 23–32 (15 filas) | número (`7`, `7,66`) | número a 2 decimales (`0,45`, `-0,90`) o cap (`≤-3`) | **1 X** en el tramo que corresponde |
| **Cualitativa simple** | 1–2, 10–22, 33–36 (19 filas) | el texto entero (`29/30`, `10/10`, `3 normal`, `Normal`, `5`) | **vacía** | ninguna |
| **Cualitativa con interpretación** | **3 (AVD) y 4 (KPDS-10)** — sólo estas dos | número (`8`, `15`) | la palabra (`Autónomo`, `Normal`) | ninguna |

En una frase: **la X se completa si y solo si Z es numérico**, y el texto cualitativo va en PB salvo
en AVD y KPDS-10.

### Las 8 columnas de rango

Encabezados reales, en orden: `< - 3` · `-3 a -2` · `-2 a -1` · `-1 a 0` · `0 a +1` · `+1 a +2` ·
`+2 a +3` · `> +3`. Agrupadas arriba como Deterioro significativo (2 col) · Puntajes bajos (1 col) ·
Puntajes promedio (2 col) · Puntajes superiores (3 col).

Asignaciones verificadas contra `informeFinal2.docx` (Z crudo del Excel → columna con X):

| Z crudo | Z en el Word | Columna con X |
|---|---|---|
| `0.4482…` | `0,45` | `0 a +1` |
| `-0.3525…` | `-0,35` | `-1 a 0` |
| `1.0181…` | `1,02` | `+1 a +2` |
| `2.3124…` | `2,31` | `+2 a +3` |
| `-1.2402…` | `-1,24` | `-2 a -1` |
| `-2.0138…` | `-2,01` | `-3 a -2` |
| `-3.1067…` | `≤-3` | `< - 3` |

### Cap de Z fuera de ±3 — **confirmado**

Cuando el Z excede ±3, en el Word no se escribe el número crudo sino el tope:

- **Z ≥ +3** → `≥3` — confirmado en `informeFinal.docx` (FF, X en `> +3`)
- **Z ≤ −3** → `≤-3` — confirmado en `informeFinal2.docx` (BEM–MS Sem, Z crudo −3,1068, X en `< - 3`)

Los dos extremos aparecen, cada uno en un informe distinto, así que la regla es de dos lados y ya no
es una convención "definida por lógica": **está observada en los archivos reales.**

El Z capado **sigue siendo numérico**, así que igual lleva X en la columna del extremo.

### Redondeo

El Z va **siempre a 2 decimales, con coma**, incluyendo el cero final: Z crudo `-0.29629…` se escribe
**`-0,30`** (no `-0,3`), y `-0.8994…` se escribe **`-0,90`**. En una celda de Word el separador
decimal no importa para el parseo — se usa **coma** por estilo. En los gráficos también va coma desde
el 2026-09-17; la única diferencia es que ahí **se cae el cero final** (`-0,3` en vez de `-0,30`) — ver
`orden-categorias-graficos.md`.

## Estructura de celdas de la tabla — lo que decide la mecánica del paste

Conteo real de celdas por fila (`w:tc`), idéntico en los dos informes. La grilla es de **13
columnas**; la última columna de rango tiene `gridSpan=2` en todas las filas.

| Filas | Celdas reales | Composición |
|---|---|---|
| 34 de las 36 | **12** | Área · Prueba · PB · Z · 8 celdas de rango |
| **3 (AVD) y 4 (KPDS-10)** | **11** | Área · Prueba · PB · **Z con `gridSpan=2`** · 7 celdas de rango |

Excluyendo Área y Prueba (fijas, y Área tiene celdas verticalmente combinadas): **10 valores por fila
en 34 filas, y 9 en las filas 3 y 4.**

### Corrección: las celdas cualitativas NO están fusionadas ni tienen trazado diagonal

Una versión anterior de este archivo registraba que el paste único había fallado en Word y atribuía
la causa a que "las 8 columnas de rango están fusionadas en un solo bloque gris" en las filas
cualitativas, dejándolas con ~3 celdas reales. **El XML de los dos informes desmiente esa
explicación:**

- Las filas cualitativas tienen las **8 celdas de rango separadas**, igual que las filas con Z. Lo
  que las distingue es sólo el **relleno gris `D9D9D9`** aplicado a Z + las 8 celdas de rango.
- **No hay ningún trazado diagonal** en ninguna de las dos tablas: la búsqueda de `w:tl2br` /
  `w:tr2bl` da **cero resultados**. La leyenda al pie sigue diciendo "las áreas con trazado diagonal
  indican que el puntaje no lleva puntaje Z" — es una **inconsistencia de la plantilla**: el texto
  quedó de una versión anterior y el efecto hoy se logra con el sombreado. **Reproducir la leyenda
  tal cual**, no "corregirla".
- El desalineamiento sí es real, pero la causa son **únicamente las 2 filas de 11 celdas** (AVD y
  KPDS-10). Un bloque uniforme de 10 columnas se desfasa **a partir de la fila 3**, no en todas las
  cualitativas.

**Mapa de sombreado** (para no confundirlo con estructura):

| Tipo de fila | Z | `< -3` | `-3 a -2` | `-2 a -1` | resto |
|---|---|---|---|---|---|
| Con Z | sin relleno | `A6A6A6` gris oscuro | `A6A6A6` | `D9D9D9` gris claro | sin relleno |
| Cualitativa simple | `D9D9D9` | `D9D9D9` | `D9D9D9` | `D9D9D9` | `D9D9D9` |
| AVD / KPDS-10 | sin relleno | sin relleno | sin relleno | sin relleno | sin relleno |

El sombreado ya está en la plantilla y **no se pega**: gris oscuro = puntaje significativamente bajo,
gris claro = bajo pero sin déficit significativo (así lo explica la leyenda).

> ℹ️ **Diferencia deliberada en la tabla que genera la skill:** a diferencia de la plantilla original
> (que no sombrea las 8 columnas de rango de AVD/KPDS-10), la tabla generada **sí** las sombrea con
> `#D9D9D9` — mismo criterio que las filas cualitativas simples, para marcar "no aplica" de forma
> consistente en todas las filas sin Z. No afecta lo que se informa (esas filas nunca llevan `X`).

> ✅ **Decisión (2026-09-16): la skill sigue armando la tabla.** V5 implementó la mitad
> determinística de la propuesta —las 8 columnas de rango con la X por fórmula y el cap de ±3 como
> formato de número— pero **no** se creó una hoja `TABLA INFORME` aparte ni se pasó al copy/paste
> directo Excel→Word. Todo lo que sigue en este archivo **sigue siendo instrucción de salida**, con un
> solo cambio: la X se **lee** del Excel (`E:L`) en vez de derivarse. Ver
> `../clinicTransformationGuide.md` §5.

## 🟢 Entrega: la skill genera la **tabla completa**, no valores sueltos

✅ **Decisión de la profesional (2026-09-08): no hace falta conservar la tabla que ya está en el
Word.** La skill puede entregar una **tabla nueva y completa** que se pega reemplazando a la vieja,
siempre que **cumpla con lo que informa** la original: mismas columnas, mismas 36 filas en el mismo
orden, mismos nombres de prueba, mismos valores, los 8 tramos de rango con su agrupación, y las
celdas que no llevan puntaje visualmente marcadas como no aplicables.

**No tiene que ser visualmente idéntica.** Lo que se respeta es la información, no el formato exacto.

### Por qué se cambió de enfoque

El camino anterior era pegar sólo los valores, con tabs, dentro de las celdas de la tabla existente.
Eso tenía dos riesgos, uno medido y uno sin resolver:

1. **Medido** (revisión 2026-09-08, `../ejemplos/revision-salida-ia-vs-informeFinal2.md` §B1): los
   tabs finales de cada fila se pierden en el texto plano del chat, y se pierden **distinto según la
   fila** (filas de 9 y de 7 campos donde todas debían tener 10). Un bloque no uniforme se desfasa a
   partir de la segunda fila y arrastra el error por las 32.
2. **Sin resolver:** aunque los tabs sobrevivieran, nunca se probó si Word, al terminar los 10
   valores de una fila, baja a la celda `PB` de la siguiente o a la primera columna de la tabla
   (`Área`). Si es lo segundo, el pegado **sobrescribe Área y Prueba en 32 filas**.

Generando la tabla entera, **los dos riesgos desaparecen**: no se depende de conteos de campos
invisibles ni de cómo navega el cursor de Word entre celdas preexistentes. Se inserta una estructura
nueva y completa.

También deja de tener sentido el split en 3 bloques (existía sólo por los conteos de celda distintos
de las filas AVD/KPDS-10 de la plantilla vieja): **la tabla se genera de una sola vez, entera.**

### Qué tiene que traer la tabla generada

En este orden, de arriba abajo:

| Parte | Contenido | ¿Varía por paciente? |
|---|---|---|
| Título | `SÍNTESIS DEL RENDIMIENTO – PERFIL COGNITIVO` | no |
| Agrupación de rangos | `Deterioro significativo` (cubre `< -3` y `-3 a -2`) · `Puntajes bajos` (`-2 a -1`) · `Puntajes promedio` (`-1 a 0`, `0 a +1`) · `Puntajes superiores` (`+1 a +2`, `+2 a +3`, `> +3`) | no |
| Encabezado de columnas | `ÁREA` · `PRUEBA` · `PB` · `Z` · `< -3` · `-3 a -2` · `-2 a -1` · `-1 a 0` · `0 a +1` · `+1 a +2` · `+2 a +3` · `> +3` | no |
| 36 filas de datos | las de la tabla de arriba, **en ese orden exacto** | sí |
| ~~Leyenda al pie~~ | **no se genera** — ver abajo | — |

**12 columnas lógicas siempre** (`ÁREA` · `PRUEBA` · `PB` · `Z` + 8 de rango). La grilla de 13
columnas del original (con `gridSpan=2` en la última) y el `gridSpan` de la Z en AVD/KPDS-10 eran
particularidades de la plantilla vieja: **no se replican**. Lo que sí varía respecto de la versión
anterior de este archivo: la celda `ÁREA` **no se repite por fila** — va fusionada con `rowspan` (ver
convención 1 abajo), así que en `<td>` reales una fila **abre grupo con 12** y las demás **tienen 11**
(sin la celda `ÁREA`, ya cubierta por el `rowspan` de la fila de arriba).

### Las 4 convenciones de llenado

1. **Columna `ÁREA`: celdas fusionadas verticalmente (`rowspan`), como en la plantilla original.**
   ✅ Decisión 2026-09-08 — revierte la versión anterior de este archivo, que la repetía en cada fila
   para simplificar la generación. Sólo la **primera fila** de cada grupo lleva la celda `ÁREA` (con
   su `rowspan`); las demás filas del grupo la **omiten por completo** (11 `<td>` en vez de 12). Sólo
   es posible en HTML — Markdown no soporta `rowspan`. Los cinco grupos:
   `Screening cognitivo y psiquiátrico` (filas 1–4, `rowspan=4`) ·
   `Atención y funciones ejecutivas` (5–19, `rowspan=15`) · `Memoria episódica` (20–29, `rowspan=10`) ·
   `Lenguaje` (30–34, `rowspan=5`) · `Visoconstrucción` (35–36, `rowspan=2`).
2. **Filas con Z** (5–9, 23–32): `PB` numérico · `Z` a 2 decimales con coma y cero final, o el cap ·
   **una `X`** en la columna del tramo · las otras 7 columnas de rango **vacías, sin sombreado propio**
   (ver mapa de sombreado abajo).
3. **Filas cualitativas simples** (1–2, 10–22, 33–36): el texto entero en `PB` · **`Z` y las 8
   columnas de rango vacías, sin texto, con fondo gris `#D9D9D9`**.
4. **Filas AVD y KPDS-10** (3–4): `PB` numérico · la palabra de `D17`/`D18` en `Z` · **las 8 columnas
   de rango vacías, sin texto, con fondo gris `#D9D9D9`**.

### El fondo gris — marcador de no-aplica, sin texto adentro

En la tabla original, el gris `D9D9D9` sobre `Z` + las 8 columnas de rango de una fila cualitativa (o
sobre las 8 de rango de AVD/KPDS-10) es lo que dice "esta prueba no lleva puntaje Z". La skill había
agregado el texto **`N/A`** en esas celdas como sustituto del color para cuando la salida era texto
plano (Markdown, sin sombreado). ✅ **Cambio 2026-09-08: ya no se escribe `N/A`.** Como el formato de
salida es HTML por default y el color sí sobrevive el paste a Word (verificado), el texto quedó
redundante y sólo ensanchaba las columnas — la celda ahora va **vacía, sólo con el fondo gris**, igual
que en la plantilla original.

> 🚩 **El gris-de-no-aplica no es lo mismo que una celda vacía sin sombrear.** En una fila **con Z**,
> las 7 columnas de rango sin `X` **van vacías y sin sombreado propio** (salvo las bandas de severidad
> fijas — ver abajo): esos tramos sí aplican, el puntaje simplemente no cae ahí. El gris uniforme en
> las filas cualitativas/AVD/KPDS-10 dice algo distinto: "esta prueba no tiene puntaje Z". Ninguna de
> las dos lleva texto — la diferencia la hace sólo el patrón de sombreado, no una palabra.
>
> Resumen: fondo `#D9D9D9` en Z + las 8 de rango = "esta prueba no tiene puntaje Z". Celda vacía sin
> sombreado propio = "el puntaje Z de esta prueba no cae en este tramo".

Conteo de control para este esquema: **21 filas** llevan el fondo gris de no-aplica (19 cualitativas ×
9 celdas + 2 de AVD/KPDS-10 × 8) = **187 celdas vacías con fondo `#D9D9D9`**, y **15 filas** llevan
exactamente una `X`.

> ⚠️ El otro uso del gris en el original es distinto y **no** necesita marcador: el gris oscuro
> `A6A6A6` sobre las columnas `< -3` y `-3 a -2`, y el claro sobre `-2 a -1`, marcan **zonas de
> severidad**, no celdas vacías. Esa información ya la carga la **fila de agrupación**
> (`Deterioro significativo` / `Puntajes bajos` / `Puntajes promedio` / `Puntajes superiores`), así
> que no se pierde nada al no sombrear.

Al sacar el texto `N/A`, desaparece también el compromiso que antes ensanchaba las columnas de rango:
una celda vacía no ocupa más lugar que una `X`, así que ya no hace falta la alternativa liviana de
poner el marcador sólo en `Z`.

### ✅ La leyenda al pie — **SÍ se genera** (desde el 2026-09-17)

🚩 **Cambio del 2026-09-17.** Antes acá decía que la skill **no** emitía la leyenda, porque es idéntica
en todos los informes. **Eso quedó sin efecto:** desde que el bloque 4 se entrega como `.docx` clonado
de la tabla real, la leyenda **viene incluida como fila 39** y no hay nada que volver a pegar. Sigue
siendo idéntica en todos los informes — la diferencia es que ahora llega sola.

⚠️ Sólo si se cae al camino HTML vuelve a aplicar lo viejo: ahí la leyenda **no** va en el bloque y hay
que conservarla del informe anterior. Lo de abajo describe ese caso.

> ⚠️ **Consecuencia práctica, avisarla en el bloque 12.** En el Word la leyenda **no es un párrafo
> suelto: es la última fila de la propia tabla.** La tabla de `informeFinal2` tiene **39 filas** = 2
> de encabezado + 36 de datos + **1 de leyenda** (`gridSpan=12`). Verificado en el XML: el texto de la
> leyenda no aparece en ningún lugar del documento fuera de la tabla.
>
> Entonces, si para pegar la tabla nueva se borra la vieja **entera**, la leyenda desaparece con ella.
> Como nunca cambia, la salida más simple es **pegar la tabla nueva y volver a agregar la fila de
> leyenda** copiándola de cualquier informe anterior, o tenerla guardada aparte.

Lo que sigue queda como **referencia**, no como instrucción de salida: describe el problema de la
leyenda y las variantes que se le propusieron a la profesional, por si algún día decide cambiarla en
su plantilla.

<details>
<summary>Referencia: el problema de la leyenda y las variantes propuestas (ya no afecta la salida)</summary>

La regla vigente era **reproducirla tal cual, sin corregir sus inconsistencias**. Pero la leyenda
describe un `trazado diagonal` que nunca existió y un sombreado gris que en la tabla nueva tampoco
está, así que reproducirla verbatim pasaba de ser "conservar una rareza de la plantilla" a describir
algo que no se ve.

**Por default: reproducir la leyenda original tal cual** (es la plantilla de la profesional) **y
señalarlo en el bloque 12** ofreciendo la variante adaptada.

> 🚩 **La tabla generada lleva la leyenda ORIGINAL, palabra por palabra**, incluido
> `Las áreas con trazado diagonal indican que el puntaje no lleva puntaje Z sino interpretación
> cualitativa.` La variante adaptada **no se pega**: se ofrece aparte, fuera de la tabla.
>
> ⚠️ **Error real cometido (2026-09-08).** El generador emitió la variante adaptada
> (`Las celdas marcadas como N/A…`) directamente dentro de la tabla, sin ofrecer la opción. Sólo se
> detectó porque el usuario comparó la salida contra `informeFinal2.docx`. Es una violación de la
> regla `No "corregir" las inconsistencias de la plantilla` de `SKILL.md`: la leyenda es de la
> profesional y la corrección es decisión suya, no de la skill.
>
> **Autochequeo:** la leyenda emitida tiene que ser idéntica carácter por carácter a la de
> `informeFinal2.docx`. Es comparable por código, así que conviene verificarlo y no confiar en la
> lectura a ojo — la diferencia era **una sola frase** dentro de un párrafo de seis líneas.

> 🚩 **La variante adaptada tiene dos versiones, según el formato de salida.** Confirmado al ver la
> tabla armada en Word (2026-09-08): la leyenda describe el sombreado, así que la redacción tiene que
> coincidir con lo que la tabla realmente muestra.
>
> | Formato | Cómo nombra las zonas de severidad | Cómo nombra las celdas sin puntaje |
> |---|---|---|
> | **HTML** (con gris) | `en áreas gris claro` / `gris oscuro` — igual que el original | `las celdas marcadas como N/A` |
> | **Markdown** (sin gris) | `en las columnas < -3 y -3 a -2` / `en la columna -2 a -1` | `las celdas marcadas como N/A` |
>
> En los dos casos cambia `trazado diagonal` por `N/A`, porque el trazado diagonal no existe en
> ninguna de las dos plantillas ni en la tabla generada.

Versión para **markdown** (sin sombreado — nombra las columnas):

> PB (puntaje bruto de la prueba) – Z (puntaje Z, indica cantidad de desvíos estándar a los que se
> ubica el rendimiento del paciente, por encima o por debajo de los valores esperables según su grupo
> de referencia). Las celdas marcadas como `N/A` indican que el puntaje no lleva puntaje Z sino
> interpretación cualitativa. Las cruces ubicadas en las columnas `< -3` y `-3 a -2` indican puntajes
> significativamente bajos e implican un deterioro moderado a severo en la función evaluada. La cruz
> en la columna `-2 a -1` indica un puntaje por debajo de lo esperable pero no implica déficit
> significativo al momento de la evaluación.

Versión para **HTML** (con sombreado — conserva el fraseo original salvo el `N/A`):

> PB (puntaje bruto de la prueba) – Z (…). **Las celdas marcadas como `N/A`** indican que el puntaje
> no lleva puntaje Z sino interpretación cualitativa. Las cruces marcadas en áreas gris claro indican
> puntajes por debajo de lo esperable pero no implican déficit significativo al momento de la
> evaluación. Las cruces marcadas en áreas gris oscuro indican puntajes significativamente bajos e
> implican un deterioro moderado a severo en la función evaluada.

La decisión es de la profesional (ver `../preguntasParaLaProfesional.md` §C.1) y aplica a **su
plantilla**, no a la salida de la skill — que ya no emite la leyenda.

</details>

### Dos formatos de salida

🚩 **Desde el 2026-09-17 el default es `.docx`** — ver la especificación completa en `SKILL.md`,
bloque 4. Se clona la tabla real y se reemplazan sólo PB, Z y la posición de la X. Esta tabla comparaba
Markdown contra HTML cuando ésas eran las dos únicas opciones; **las dos quedaron como fallback**.

| | **Markdown** (descartado) | **HTML** (fallback) | **`.docx`** ✅ **default** |
|---|---|---|---|
| Cómo se pega | seleccionar la tabla renderizada → copiar | guardar `.html`, navegador, seleccionar, copiar | abrir el archivo, `Ctrl+A`, `Ctrl+C` |
| Conserva | estructura y valores; pierde el gris | + sombreado, `colspan`, negritas | **el formato exacto de la plantilla**, leyenda incluida |
| Ajuste post-paste | sí | sí (ancho 130 %) | **ninguno** |

En el camino HTML, el gris va como `style="background-color:#D9D9D9"` en las celdas no aplicables y
`#A6A6A6` en las columnas de deterioro significativo — Word respeta esos atributos al pegar desde el
navegador.

En los dos casos, la tabla se entrega en **un solo bloque** y **entera**, título y leyenda incluidos.

### Cómo la usa la profesional

1. En el Word, seleccionar la tabla vieja completa y borrarla.
2. Copiar la tabla generada y pegarla en ese lugar.
3. Si queda apretada por los márgenes de la página (esperable con 12 columnas): clic derecho dentro de
   la tabla → **Autoajustar → "Autoajustar al contenido"**, y después clic derecho → **Propiedades de
   tabla → pestaña Tabla → Ancho preferido → 130 %**. ✅ Verificado por el usuario (2026-09-08) — sin
   tocar márgenes del documento ni el HTML. Es un ajuste de la tabla pegada, se hace una vez por
   informe, no por fila.

### ✅ Verificado en Word real (2026-09-08)

Se probó el camino HTML → navegador → Word con las 36 filas
(`../ejemplos/ejemplo-tabla-sintesis.html`). **Funciona:**

- Entra como **tabla de Word real**, no como texto plano.
- El **sombreado gris se conserva** (`#A6A6A6` en las columnas de deterioro significativo, `#D9D9D9`
  en `-2 a -1` y en las celdas `N/A`).
- Las **15 X caen en la columna correcta**, verificado contra `informeFinal2.docx`.
- La tabla **entra a lo ancho de la página** con los `N/A`; no hubo texto partido en dos renglones.
  → La alternativa liviana (`N/A` sólo en la columna `Z`) queda como opción, no como necesidad.

**Bug encontrado y corregido en esa prueba:** la fila de agrupación se había generado **sin
`colspan`**, así que los cuatro rótulos ocupaban una columna cada uno —
`Deterioro significativo` quedaba sólo sobre `< -3`, `Puntajes bajos` sobre `-3 a -2`, etc. — y las
últimas cuatro columnas se quedaban sin rótulo. Además deformaba los anchos: las primeras columnas de
rango heredaban el ancho de los rótulos largos.

✅ **Corrección re-verificada en Word** (segunda pasada, 2026-09-08): con los `colspan` puestos, los
cuatro rótulos abarcan sus columnas, los anchos se normalizan solos y las 36 filas + 15 X quedan
correctas. **La tabla generada reproduce fielmente la información de la plantilla.** El generador
usado en la prueba está en `../ejemplos/generar-tabla-sintesis.js`; la salida, en
`../ejemplos/ejemplo-tabla-sintesis.html`.

> 🚩 **Los `colspan` de la fila de agrupación tienen que sumar 8:**
> `Deterioro significativo`=**2** (`< -3`, `-3 a -2`) · `Puntajes bajos`=**1** (`-2 a -1`) ·
> `Puntajes promedio`=**2** (`-1 a 0`, `0 a +1`) · `Puntajes superiores`=**3** (`+1 a +2`, `+2 a +3`,
> `> +3`). Es un autochequeo barato y detecta el error de una.

Detalle menor sin corregir: el título `SÍNTESIS DEL RENDIMIENTO – PERFIL COGNITIVO` pega alineado a
la derecha en vez de centrado. Se arregla en Word con un clic, o se puede meter como fila de la tabla.

> ⚠️ **Esta verificación es anterior a los cambios del 2026-09-08 (sin `N/A` + `ÁREA` con `rowspan`).**
> Lo confirmado arriba (colspan, 15 X en su columna, sombreado) sigue valiendo para la estructura base,
> pero el **`rowspan` en `ÁREA` es un mecanismo nuevo, sin probar todavía en Word real** — hay que
> verificar que al pegar, la celda fusionada efectivamente cubra las filas del grupo y no rompa el
> resto de la fila. `../ejemplos/generar-tabla-sintesis.js` y `../ejemplos/ejemplo-tabla-sintesis.html`
> ya están actualizados al esquema nuevo (sin `N/A`, con `rowspan`) para volver a probar.

**Falta probar** el camino de markdown renderizado (copiar la tabla del chat directamente), que es el
que va a usar la profesional en el día a día. El de HTML ya está confirmado y sirve de respaldo.

### Alternativa: seguir usando la tabla existente

Si en algún caso se prefiere **no** reemplazar la tabla (por ejemplo, para conservar un formato
particular de un informe ya empezado), el camino anterior sigue documentado abajo. Es más frágil:
exige conteos exactos de campos invisibles y depende de un comportamiento de Word sin verificar.

<details>
<summary>Mecánica de paste sobre la tabla existente — 3 bloques (enfoque anterior, en desuso)</summary>

Parándose en la celda **PB** de la primera fila de cada bloque, con
`Pegado especial › Texto sin formato`:

| Bloque | Filas | Forma | Contenido |
|---|---|---|---|
| 1 | 1–2 (MMSE, TRO) | 2 × 10 | PB, Z vacía, 8 vacías |
| 2 | **3–4 (AVD, KPDS-10)** | 2 × **9** | PB, Z con la palabra, 7 vacías |
| 3 | 5–36 (DD → MMSE copia) | 32 × 10 | PB, Z (número/cap/vacía), 8 columnas con la X donde va |

Aplican las reglas de campos vacíos de abajo.

</details>

### 🚩 Regla dura del enfoque anterior: los campos vacíos del final **también se emiten**

⚠️ **Fallo real medido (revisión 2026-09-08, ver `../ejemplos/revision-salida-ia-vs-informeFinal2.md`
§B1).** La primera corrida de la skill produjo los valores correctos y **el pegado igual se habría
desalineado**, porque los tabs finales de cada fila se perdieron:

| Bloque | Campos esperados | Campos emitidos |
|---|---|---|
| 1 | 10 y 10 | **4 y 1** |
| 2 | 9 y 9 | **2 y 2** |
| 3, filas con Z | 10 | **9** |
| 3, filas cualitativas | 10 | **7** |
| 3, última fila | 10 | **1** |

Lo grave no es que falten: es que faltan **distinto según la fila** (9 vs 7). Un bloque no uniforme
se desfasa a partir de la segunda fila y arrastra el error por las 32.

**Reglas, entonces:**

1. **Toda** fila del bloque 4 emite **exactamente 10 campos** (9 tabs). Toda fila del bloque 1,
   10 campos. Toda fila del bloque 2, **9** campos (8 tabs). Los vacíos del final **cuentan**: una
   fila cualitativa es `3 normal` + **9 tabs**, no `3 normal` + 6.
2. **Autochequeo antes de emitir.** Contar los tabs de cada fila y **decir el conteo en la salida**
   (p. ej. `bloque 4: 32 filas × 10 campos ✓`). Si una fila no da, corregirla antes de entregar.
3. **Los tabs del final se pierden en el texto plano del chat** — así se rompió la primera corrida.
   Si la superficie permite adjuntar un archivo, entregar los 3 bloques como **`.txt` con tabs
   reales**. Si no (chat plano), **decirlo** y avisar al profesional que verifique el conteo antes de
   pegar, o usar la ruta alternativa de abajo.
4. **Nunca escribir un marcador de pendiente dentro de una celda** (`[PENDIENTE - dato corrupto]` se
   pegaría literal al Word). Celda sin dato = celda vacía, y el pendiente va al bloque 12.

> ⚠️ **Esto especifica el arreglo; no lo prueba.** Que los tabs sobrevivan el viaje chat → Word sigue
> **sin verificarse**, y la corrida real de 2026-09-08 volvió como texto de chat, no como archivo. Con
> lo medido, el test de Word (abajo, "Pendiente") pasa de *nice-to-have* a **bloqueante**: hasta que
> alguien pegue 2 filas del bloque 4 en un Word real, la ruta de copy/paste es una hipótesis.
>
> **Ruta alternativa sin riesgo de alineación**, si los tabs no sobreviven: pegar **por columna** en
> vez de por fila — la columna PB completa (36 valores, uno por línea), después la columna Z (15
> valores), y marcar las 15 X a mano. Son ~15 clics y **cero** riesgo de desfase, porque un pegado de
> una sola columna no depende de ningún conteo de campos. La otra opción ya anotada es completar el
> `.docx` con `python-docx`, dejando los gráficos OLE intactos.

El bloque 4 cubre de un saque las 15 filas con Z y las 17 cualitativas intercaladas, porque todas
tienen 12 celdas. Las filas 3 y 4 son las únicas que necesitan trato aparte — o se pegan como bloque
de 9 columnas, o se completan a mano (son 4 celdas en total).

> ⚠️ **Sin probar en Word todavía.** Lo que está confirmado es la **causa** (los conteos de celda del
> XML) y que un bloque uniforme de 36 × 10 **no puede** funcionar. Que este esquema de 3 bloques
> efectivamente pegue bien requiere abrir Word — no se puede validar por código.
>
> **Supuesto crítico a verificar primero:** que al terminar los 10 valores de una fila, Word baje a la
> celda **PB** de la fila siguiente (la columna donde arrancó el paste) y **no** a la primera columna
> de la tabla (Área). Si baja a la columna 1, el bloque 4 **sobreescribe Área y Prueba en 32 filas** y
> el camino de copy/paste queda descartado, no sólo desalineado. → **Probar el bloque 4 con 2 filas
> antes de las 32.**
>
> Riesgo secundario conocido: que los tabs no sobrevivan al copiar desde el chat; si pasa, escribir
> los bloques en un `.txt` con tabs reales. Si el paste tampoco funciona así, el camino alternativo es
> completar el `.docx` con `python-docx` (dejando los gráficos OLE intactos).

## Qué NO está incluido en la lista de 36 filas

Las 36 son sólo las filas **de datos**. La tabla que genera la skill las envuelve con tres partes
fijas más (ver "Qué tiene que traer la tabla generada" arriba):

- Fila de encabezado agrupado (`Deterioro significativo`, `Puntajes bajos`, `Puntajes promedio`,
  `Puntajes superiores`) — en el original, 8 celdas sobre una grilla de 13.
- Fila de encabezado de columnas (`ÁREA`, `PRUEBA`, `PB`, `Z` + los 8 rangos) — 12 celdas.
- Fila de leyenda al pie — 1 celda con `gridSpan=12`.

Ninguna de las tres varía por paciente.

## Pendiente

> Ver también `../preguntasParaLaProfesional.md` (§B.5 desempate de rangos, §C.1 la leyenda del
> trazado diagonal). El §A.5 (truncado del PB de AST) quedó **resuelto**: promedio de los 3 trials
> truncado a 2 decimales, por fórmula (`excel-unificado-spec.md` §A.6).

- **Desempate cuando el Z cae justo en un límite** entre dos columnas (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Propuesta: límite inferior inclusive, superior exclusivo. **Los dos informes no lo
  resuelven**: el caso más cercano es CE con Z −2,01 → `-3 a -2`, que es consistente con la propuesta
  pero no prueba nada porque no cae en el límite exacto. Confirmar con el profesional.
- **Probar los 3 bloques de paste en Word real** con datos ficticios.
