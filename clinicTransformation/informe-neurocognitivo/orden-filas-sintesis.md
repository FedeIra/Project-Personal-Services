# Orden de filas — tabla "SÍNTESIS DEL RENDIMIENTO"

> Extraído directamente del XML de `informeFinal.docx` (tabla real, no un resumen). 36 filas de
> datos, en este orden exacto. Área y Prueba son fijas en la plantilla — la skill nunca las toca,
> solo genera PB / Z / columna-X por fila, en este orden posicional.

**IMPORTANTE — filas duplicadas por nombre:** TRO (filas 2 y 33) y FF (filas 9 y 25) aparecen dos
veces con el mismo Área distinta y, en el caso de FF, el mismo PB/Z. Cualquier estructura de datos
para esta tabla (Excel unificado incluido) debe ser **posicional (índice de fila), nunca un
diccionario `prueba → valor`** — un lookup por nombre colisiona en TRO y FF.

| # | Área | Prueba | Tipo | Nota |
|---|------|--------|------|------|
| 1 | Screening cognitivo y psiquiátrico | MMSE | Cualitativa (sin Z) | |
| 2 | | TRO | Cualitativa (sin Z) | duplicada — ver fila 33 |
| 3 | | AVD | Cualitativa (sin Z) | interpretación tipo "Autónoma" |
| 4 | | KPDS-10 | Cualitativa (sin Z) | interpretación tipo "Normal" |
| 5 | Atención y funciones ejecutivas | DD | Con Z | |
| 6 | | DI | Con Z | |
| 7 | | TMT A | Con Z | |
| 8 | | TMT B | Con Z | |
| 9 | | FF | Con Z, capada | Z se expresa como "≥3" (cap superior) — duplicada, ver fila 25 |
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

## Qué NO está incluido en este archivo (fuera de la tabla de datos)

- Fila de encabezado agrupado (categorías de rango: "Deterioro significativo", "Puntajes bajos",
  "Puntajes promedio", "Puntajes superiores").
- Fila de encabezado de columnas (ÁREA, PRUEBA, PB, Z, y los 8 rangos numéricos).
- Fila de leyenda al pie (explica qué son PB/Z, trazado diagonal, gris claro/oscuro).

## Riesgo técnico pendiente de validar (ver `opcionesAutomatizacion.md`, punto 6)

El XML de `informeFinal.docx` muestra que las celdas de rango **no tienen siempre el mismo patrón
de fusión** entre filas (algunas filas cualitativas tienen una celda de rango extra fusionada
respecto a filas como MMSE/TRO). Esto pone en duda que "10 valores por tab, mismo conteo en las 36
filas" sea seguro para el paste único en Word. **Falta la prueba real en Word con datos de prueba**
antes de confiar en el mecanismo de bloque 2 descripto en `opcionesAutomatizacion.md` (líneas
111-123 del doc original).
