# Orden de filas — tabla "SÍNTESIS DEL RENDIMIENTO"

> Extraído directamente del XML de `informeFinal.docx` (tabla real, no un resumen). 36 filas de
> datos, en este orden exacto. Área y Prueba son fijas en la plantilla — la skill nunca las toca,
> solo genera PB / Z / columna-X por fila, en este orden posicional.

**IMPORTANTE — filas duplicadas por nombre:** TRO (filas 2 y 35) y FF (filas 9 y 30) aparecen dos
veces con Área distinta y, en el caso de FF, el mismo PB/Z. Cualquier estructura de datos
para esta tabla (Excel unificado incluido) debe ser **posicional (índice de fila), nunca un
diccionario `prueba → valor`** — un lookup por nombre colisiona en TRO y FF.

| # | Área | Prueba | Tipo | Nota |
|---|------|--------|------|------|
| 1 | Screening cognitivo y psiquiátrico | MMSE | Cualitativa (sin Z) | |
| 2 | | TRO | Cualitativa (sin Z) | duplicada — ver fila 35 |
| 3 | | AVD | Cualitativa (sin Z) | interpretación tipo "Autónoma" |
| 4 | | KPDS-10 | Cualitativa (sin Z) | interpretación tipo "Normal" |
| 5 | Atención y funciones ejecutivas | DD | Con Z | |
| 6 | | DI | Con Z | |
| 7 | | TMT A | Con Z | |
| 8 | | TMT B | Con Z | |
| 9 | | FF | Con Z, capada | Z se expresa como "≥3" (cap superior) — duplicada, ver fila 30 |
| 10 | | IFS Total | Cualitativa (sin Z) | |
| 11 | | IFS Índice MT | Cualitativa (sin Z) | |
| 12 | | IFS SM | Cualitativa (sin Z) | |
| 13 | | IFS IC | Cualitativa (sin Z) | |
| 14 | | IFS CIM | Cualitativa (sin Z) | |
| 15 | | IFS DA | Cualitativa (sin Z) | |
| 16 | | IFS MA | Cualitativa (sin Z) | |
| 17 | | IFS MTV | Cualitativa (sin Z) | |
| 18 | | IFS R | Cualitativa (sin Z) | |
| 19 | | IFS CIV | Cualitativa (sin Z) | |
| 20 | Memoria episódica | BEM–MS AS1 | PB por ensayo, sin Z propio | |
| 21 | | BEM–MS AS2 | PB por ensayo, sin Z propio | |
| 22 | | BEM–MS AS3 | PB por ensayo, sin Z propio | |
| 23 | | BEM–MS AST | Con Z | |
| 24 | | BEM–MS RSE | Con Z | |
| 25 | | BEM–MS Sem | Con Z | |
| 26 | | BEM–MS Rec | Con Z | |
| 27 | | BEM–MS CE | Con Z | |
| 28 | | BEM–ML Inm | Con Z | |
| 29 | | BEM–ML Dif | Con Z | |
| 30 | Lenguaje | FF | Con Z, capada | duplicada de fila 9 — mismo PB/Z |
| 31 | | FS | Con Z | |
| 32 | | TBA | Con Z | |
| 33 | | Comprensión | Cualitativa (sin Z) | |
| 34 | | Expresión | Cualitativa (sin Z) | |
| 35 | Visoconstrucción | TRO | Cualitativa (sin Z) | duplicada de fila 2 |
| 36 | | MMSE copia | Cualitativa (sin Z) | nombre distinto de "MMSE" (fila 1), no es colisión real |

## Cómo se completa cada fila: PB, Z y la X de rango

Regla general **data-driven** — vale para las 36 filas por igual; la skill reacciona al contenido de
la celda Z de cada fila, sin lista fija de pruebas:

- **Z con valor numérico** → copiar el número en la columna Z **y** poner una X en la única columna
  de rango donde cae ese Z (ej. Z 1,14 → X en "Puntajes superiores", tramo +1 a +2).
- **Z con palabra(s)** (1 a 3) → copiar la(s) palabra(s) en la columna Z, **sin X**. Caso típico:
  AVD y KPDS-10, que siempre reciben palabra y nunca número.
- **Z vacío** → celda en gris, sin texto y **sin X**. Caso típico de las filas cualitativas (MMSE,
  TRO, IFS, Comprensión, Expresión) cuando no traen valor.

En una frase: **la X se completa si y solo si Z es numérico.**

### Cap de Z fuera de ±3

Cuando el Z excede ±3, en el Word no se escribe el número crudo sino el tope:

- **Z ≥ +3** (3.1, 9999, …) → **"≥3"**
- **Z ≤ −3** (−3.1, −12, −99999, …) → **"≤−3"**

El Z capado **sigue siendo numérico**, así que igual lleva X en la columna de rango del extremo
correspondiente (superior para ≥3, deterioro para ≤−3). Coherente con FF, ya documentada arriba como
cap superior "≥3".

> Convención definida por lógica ante una inconsistencia en el pedido original (un Z de 3.1 no puede
> mostrarse como "≤3"). **A confirmar con el profesional**; si resulta al revés se cambia una sola
> línea.

## Qué NO está incluido en este archivo (fuera de la tabla de datos)

- Fila de encabezado agrupado (categorías de rango: "Deterioro significativo", "Puntajes bajos",
  "Puntajes promedio", "Puntajes superiores").
- Fila de encabezado de columnas (ÁREA, PRUEBA, PB, Z, y los 8 rangos numéricos).
- Fila de leyenda al pie (explica qué son PB/Z, trazado diagonal, gris claro/oscuro).

## Validado en Word real (2026-09-03): el paste único NO funciona — usar segmentos

Se probó pegar el bloque completo de 36 filas en la tabla real de Word y **falló**, confirmando el
riesgo que estaba pendiente (antes descrito en `opcionesAutomatizacion.md`, punto 6): en las
secciones cualitativas (Screening: MMSE, TRO, AVD, KPDS-10; y demás filas sin Z) las **8 columnas de
rango están fusionadas en un solo bloque gris**, así que esas filas tienen ~3 celdas reales (PB, Z,
bloque fusionado), no 10. Al pegar un bloque uniforme de 10 columnas ahí, los tabs sobrantes se
apilan como saltos de línea dentro de PB/Z y se desarma toda la tabla.

**Solución confirmada: pegar por segmentos contiguos "Con Z"** (los únicos con las 10 celdas
reales), parándose en la celda PB de la primera fila de cada segmento:

- **Segmento 1:** filas 5–9 (DD, DI, TMT A, TMT B, FF)
- **Segmento 2:** filas 23–29 (BEM–MS AST → BEM–ML Dif)
- **Segmento 3:** filas 30–32 (FF, FS, TBA)

Los segmentos 2 y 3 son filas contiguas (23–32, todas Con Z), así que pueden pegarse juntas como un
solo bloque de 10 filas si el mecanismo anda. Las filas cualitativas (MMSE, TRO, AVD, KPDS-10, IFS,
Comprensión, Expresión, MMSE copia) se completan **aparte a mano** (pocas celdas: PB, y palabra en Z
solo en AVD/KPDS-10); no se pegan en bloque.

**Encabezados reales de las 8 columnas de rango** (confirmados leyendo la tabla en Word):
`< -3 · -3 a -2 · -2 a -1 · -1 a 0 · 0 a +1 · +1 a +2 · +2 a +3 · > +3`. Agrupadas como Deterioro
significativo (2 col) · Puntajes bajos (1 col) · Puntajes promedio (2 col) · Puntajes superiores
(3 col).

**PB de las filas cualitativas (no van vacías):** MMSE `29/30`, TRO `10/10`, AVD `8` (+ "Autónoma" en
Z), KPDS-10 `21` (+ "Normal" en Z), IFS Total `27,5/30`.

**Pendiente de probar la próxima sesión:** retestear el Segmento 1 con el bloque segmentado. Si los
tabs no sobreviven el copy desde el chat, escribir los segmentos en un `.txt` con tabs reales.
Todavía sin confirmar: convención de desempate cuando Z cae justo en un límite entre dos columnas.
