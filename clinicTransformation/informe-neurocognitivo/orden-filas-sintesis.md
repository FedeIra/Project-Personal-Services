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

Celdas de `excelEvaluacionCompleto.xlsx`, hoja `TABLA DE FORMULAS` (esquema completo en
`mapeo-excel-a-word.md` §1).

| # | Área | Prueba | Tipo | PB desde | Z desde |
|---|------|--------|------|----------|---------|
| 1 | Screening cognitivo y psiquiátrico | MMSE | Cualitativa | `D25` | — |
| 2 | | TRO | Cualitativa | `D26` | — |
| 3 | | AVD | Cualitativa **con interpretación en Z** | `D27` | `E27` |
| 4 | | KPDS-10 | Cualitativa **con interpretación en Z** | `D28` | `E28` |
| 5 | Atención y funciones ejecutivas | DD | Con Z | `D8` | `E8` |
| 6 | | DI | Con Z | `D9` | `E9` |
| 7 | | TMT A | Con Z | `D10` | `E10` |
| 8 | | TMT B | Con Z | `D11` | `E11` |
| 9 | | FF | Con Z | `D12` | `E12` |
| 10 | | IFS Total | Cualitativa | `D30` | — |
| 11 | | IFS Índice MT | Cualitativa | `D31` ⚠️ | — |
| 12 | | IFS SM | Cualitativa | `D32` | — |
| 13 | | IFS IC | Cualitativa | `D33` | — |
| 14 | | IFS CIM | Cualitativa | `D34` | — |
| 15 | | IFS DA | Cualitativa | `D35` | — |
| 16 | | IFS MA | Cualitativa | `D36` | — |
| 17 | | IFS MTV | Cualitativa | `D37` | — |
| 18 | | IFS R | Cualitativa | `D38` | — |
| 19 | | IFS CIV | Cualitativa | `D39` | — |
| 20 | Memoria episódica | BEM–MS AS1 | Cualitativa (PB por ensayo) | `K14` | — |
| 21 | | BEM–MS AS2 | Cualitativa (PB por ensayo) | `K15` | — |
| 22 | | BEM–MS AS3 | Cualitativa (PB por ensayo) | `K16` | — |
| 23 | | BEM–MS AST | Con Z | `D13` | `E13` |
| 24 | | BEM–MS RSE | Con Z | `D14` | `E14` |
| 25 | | BEM–MS Sem | Con Z | `D15` | `E15` |
| 26 | | BEM–MS Rec | Con Z | `D16` | `E16` |
| 27 | | BEM–MS CE | Con Z | `D17` | `E17` |
| 28 | | BEM–ML Inm | Con Z | `D18` | `E18` |
| 29 | | BEM–ML Dif | Con Z | `D19` | `E19` |
| 30 | Lenguaje | FF | Con Z | `D20` | `E20` |
| 31 | | FS | Con Z | `D21` | `E21` |
| 32 | | TBA | Con Z | `D22` | `E22` |
| 33 | | Comprensión | Cualitativa | `D41` | — |
| 34 | | Expresión | Cualitativa | `D42` | — |
| 35 | Visoconstrucción | TRO | Cualitativa | `D43` | — |
| 36 | | MMSE copia | Cualitativa | `D44` | — |

⚠️ `D31` está corrompida en el Excel entregado (guarda un serial de fecha en vez de `7/10`). ✅
Aclarado (2026-09-07): el IFS Índice MT **deriva de Dígitos Atrás + Memoria de Trabajo Visual** — no
es una fecha; conviene fórmula o formato Texto. Ver `excel-unificado-spec.md` §A.1.

## Cómo se completa cada fila: PB, Z y la X de rango

**Corrección importante respecto de versiones anteriores de este archivo.** Se creía que las filas
cualitativas llevaban el texto de interpretación en la columna **Z**. Leyendo el XML de los dos
informes: **no es así en 32 de las 34 filas cualitativas.** El valor va en **PB** y Z queda vacía.

Los tres patrones reales, con ejemplos verbatim de `informeFinal2.docx`:

| Patrón | Filas | PB | Z | X de rango |
|---|---|---|---|---|
| **Con Z** | 5–9, 23–32 (15 filas) | número (`7`, `7,66`) | número a 2 decimales (`0,45`, `-0,90`) o cap (`≤-3`) | **1 X** en el tramo que corresponde |
| **Cualitativa simple** | 1–2, 10–22, 33–36 (19 filas) | el texto entero (`30/30`, `9,5/10`, `3 normal`, `Normal`, `5`) | **vacía** | ninguna |
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
decimal no importa para el parseo — se usa **coma** por estilo. (En los gráficos es distinto: ver
`orden-categorias-graficos.md`.)

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

### Mecánica de paste propuesta — 3 bloques

Dado el conteo real, el paste puede hacerse en **3 bloques contiguos** en vez de "sólo los segmentos
con Z", parándose en la celda **PB** de la primera fila de cada bloque y usando
`Pegado especial › Texto sin formato`:

| Bloque | Filas | Forma | Contenido |
|---|---|---|---|
| 1 | 1–2 (MMSE, TRO) | 2 × 10 | PB, Z vacía, 8 vacías |
| 2 | **3–4 (AVD, KPDS-10)** | 2 × **9** | PB, Z con la palabra, 7 vacías |
| 3 | 5–36 (DD → MMSE copia) | 32 × 10 | PB, Z (número/cap/vacía), 8 columnas con la X donde va |

El bloque 3 cubre de un saque las 15 filas con Z y las 17 cualitativas intercaladas, porque todas
tienen 12 celdas. Las filas 3 y 4 son las únicas que necesitan trato aparte — o se pegan como bloque
de 9 columnas, o se completan a mano (son 4 celdas en total).

> ⚠️ **Sin probar en Word todavía.** Lo que está confirmado es la **causa** (los conteos de celda del
> XML) y que un bloque uniforme de 36 × 10 **no puede** funcionar. Que este esquema de 3 bloques
> efectivamente pegue bien requiere abrir Word — no se puede validar por código.
>
> **Supuesto crítico a verificar primero:** que al terminar los 10 valores de una fila, Word baje a la
> celda **PB** de la fila siguiente (la columna donde arrancó el paste) y **no** a la primera columna
> de la tabla (Área). Si baja a la columna 1, el bloque 3 **sobreescribe Área y Prueba en 32 filas** y
> el camino de copy/paste queda descartado, no sólo desalineado. → **Probar el bloque 3 con 2 filas
> antes de las 32.**
>
> Riesgo secundario conocido: que los tabs no sobrevivan al copiar desde el chat; si pasa, escribir
> los bloques en un `.txt` con tabs reales. Si el paste tampoco funciona así, el camino alternativo es
> completar el `.docx` con `python-docx` (dejando los gráficos OLE intactos).

## Qué NO está incluido en la lista de 36 filas

- Fila de encabezado agrupado (`Deterioro significativo`, `Puntajes bajos`, `Puntajes promedio`,
  `Puntajes superiores`) — 8 celdas, grilla de 13.
- Fila de encabezado de columnas (`ÁREA`, `PRUEBA`, `PB`, `Z` + los 8 rangos) — 12 celdas.
- Fila de leyenda al pie — 1 celda con `gridSpan=12`.

## Pendiente

> Ver también `../preguntasParaLaProfesional.md` (§B.5 desempate de rangos, §C.1 la leyenda del
> trazado diagonal). El §A.5 (truncado del PB de AST) quedó **resuelto**: promedio de los 3 trials
> truncado a 2 decimales, por fórmula (`excel-unificado-spec.md` §A.6).

- **Desempate cuando el Z cae justo en un límite** entre dos columnas (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Propuesta: límite inferior inclusive, superior exclusivo. **Los dos informes no lo
  resuelven**: el caso más cercano es CE con Z −2,01 → `-3 a -2`, que es consistente con la propuesta
  pero no prueba nada porque no cae en el límite exacto. Confirmar con el profesional.
- **Probar los 3 bloques de paste en Word real** con datos ficticios.
