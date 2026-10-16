# Orden de filas — tabla "SÍNTESIS DEL RENDIMIENTO"

> Extraído del XML de las tablas reales de **`informeFinal.docx` e `informeFinal2.docx`** (36 filas,
> estructuralmente idénticas en los dos), más las **3 filas que agregó el Excel V6** (2026-09-28):
> `Recuperación disejecutiva`, `ROC estrategia` y `ROC copia`. La plantilla del paquete trae las
> **39 filas posibles** y el script borra las que no corresponden.
>
> Área y Prueba son fijas en la plantilla — la skill nunca las toca. Sólo genera PB / Z / columna-X
> por fila, identificada por su **clave**.

**IMPORTANTE — filas duplicadas por nombre:** TRO (`tro_screening` y `tro_viso`) y FF
(`ff_atencion` y `ff_lenguaje`) aparecen dos veces con Área distinta y, en el caso de FF, con el mismo
PB/Z. Por eso `sintesis` en el JSON usa **claves con el área**, nunca el nombre de la prueba.

## 🚩 Qué filas van al informe (desde V6)

**Una fila va a la tabla si y sólo si su celda de PB en el Excel tiene dato.** Si está vacía (la
prueba no se tomó), la clave **no se escribe** en `sintesis` y el script borra la fila. Vale igual
para las filas de siempre y para las 3 nuevas.

- 🚩 **No se cruza con el listado de pruebas administradas** (`A73:B86`). Ese listado decide sólo la
  lista `PRUEBAS ADMINISTRADAS`; esta tabla la decide el dato. Decisión del usuario, 2026-09-28.
- En `C36` (Recuperación disejecutiva) el valor `No` **es un resultado**: la fila va con `No`. Sólo
  la celda vacía la saca.
- Si se borra la fila que abría un área (p. ej. MMSE), el script pasa el rótulo combinado del área a
  la primera fila que queda. Si un área se queda sin filas, desaparece de la tabla y su sección de
  prosa se borra (en el JSON, `areas.<área>` = `null`).
- La fila `KPDS-10` sale si el K-10 no se tomó (los 10 ítems vacíos); en ese caso `grafico2` = `null`.

## Las 39 filas posibles, con su celda de origen en el Excel

Celdas de `excelEvaluacionCompletoV6.xlsx`, hoja `TABLA DE FORMULAS` (esquema completo y **única
fuente de direcciones** en `mapeo-excel-a-word.md` §1).

> 🚩 **Las dos filas de orientación (`C16`/`C17`) no son filas de esta tabla** — ninguno de los dos
> informes reales las tiene. La orientación alimenta la frase 3 del screening. **No agregar filas para
> "que coincida con el Excel"**, y ojo con la numeración: en este archivo `#` es la fila **de la
> plantilla**, no la del Excel.

| # | Clave | Área | Prueba | Tipo | PB desde | Z desde |
|---|---|------|--------|------|----------|---------|
| 1 | `mmse` | Screening cognitivo y psiquiátrico | MMSE | Cualitativa | `C15` | — |
| 2 | `tro_screening` | | TRO | Cualitativa | `C18` | — |
| 3 | `avd` | | AVD | Cualitativa **con interpretación en Z** | `C19` | `D19` |
| 4 | `kpds10` | | KPDS-10 | Cualitativa **con interpretación en Z** | `C20` | `D20` |
| 5 | `dd` | Atención y funciones ejecutivas | DD | Con Z | `C21` | `D21` |
| 6 | `di` | | DI | Con Z | `C22` | `D22` |
| 7 | `tmt_a` | | TMT A | Con Z | `C23` | `D23` |
| 8 | `tmt_b` | | TMT B | Con Z | `C24` | `D24` |
| 9 | `ff_atencion` | | FF | Con Z | `C25` | `D25` |
| 10 | `ifs_total` | | IFS Total | Cualitativa | `C26` | — |
| 11 | `ifs_mt` | | IFS Índice MT | Cualitativa | `C27` | — |
| 12 | `ifs_sm` | | IFS SM | Cualitativa | `C28` | — |
| 13 | `ifs_ic` | | IFS IC | Cualitativa | `C29` | — |
| 14 | `ifs_cim` | | IFS CIM | Cualitativa | `C30` | — |
| 15 | `ifs_da` | | IFS DA | Cualitativa | `C31` | — |
| 16 | `ifs_ma` | | IFS MA | Cualitativa | `C32` | — |
| 17 | `ifs_mtv` | | IFS MTV | Cualitativa | `C33` | — |
| 18 | `ifs_r` | | IFS R | Cualitativa | `C34` | — |
| 19 | `ifs_civ` | | IFS CIV | Cualitativa | `C35` | — |
| **20** | **`recuperacion`** | | **Recuperación disejecutiva** | Cualitativa (`Sí`/`No`/`Parcial`) | `C36` | — |
| **21** | **`roc_estrategia`** | | **ROC estrategia** | Cualitativa (`Normal`/`Cuestionable`/`Inadecuada`) | `C37` | — |
| 22 | `bem_as1` | Memoria episódica | BEM–MS AS1 | Cualitativa (PB por ensayo) | `C38` | — |
| 23 | `bem_as2` | | BEM–MS AS2 | Cualitativa (PB por ensayo) | `C39` | — |
| 24 | `bem_as3` | | BEM–MS AS3 | Cualitativa (PB por ensayo) | `C40` | — |
| 25 | `bem_ast` | | BEM–MS AST | Con Z | `C41` | `D41` |
| 26 | `bem_rse` | | BEM–MS RSE | Con Z | `C42` | `D42` |
| 27 | `bem_sem` | | BEM–MS Sem | Con Z | `C43` | `D43` |
| 28 | `bem_rec` | | BEM–MS Rec | Con Z | `C44` | `D44` |
| 29 | `bem_ce` | | BEM–MS CE | Con Z | `C45` | `D45` |
| 30 | `bem_inm` | | BEM–ML Inm | Con Z | `C46` | `D46` |
| 31 | `bem_dif` | | BEM–ML Dif | Con Z | `C47` | `D47` |
| 32 | `ff_lenguaje` | Lenguaje | FF | Con Z | `C48` | `D48` |
| 33 | `fs` | | FS | Con Z | `C49` | `D49` |
| 34 | `tba` | | TBA | Con Z | `C50` | `D50` |
| 35 | `comprension` | | Comprensión | Cualitativa | `C51` | — |
| 36 | `expresion` | | Expresión | Cualitativa | `C52` | — |
| 37 | `tro_viso` | Visoconstrucción | TRO | Cualitativa | `C53` | — |
| 38 | `mmse_copia` | | MMSE copia | Cualitativa | `C54` | — |
| **39** | **`roc_copia`** | | **ROC copia** | Cualitativa (número o texto, tal cual) | `C55` | — |

Forma en el JSON — sólo las filas con dato, cada una con `pb`, `z` (si la lleva) y `x` (tramo `1`–`8`,
sólo en las filas con Z):

```json
"sintesis": {
  "mmse": {"pb": "30/30"},
  "avd": {"pb": "8", "z": "Autónomo"},
  "dd": {"pb": "7", "z": "0,75", "x": 5},
  "recuperacion": {"pb": "No"},
  "roc_copia": {"pb": "1"}
}
```

El orden de las claves en el JSON no importa (el script usa el de la plantilla). Una clave que no
está en la tabla de arriba **aborta** la corrida.

### La X de cada tramo ya viene calculada en el Excel

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

⚠️ **ROC copia (`C55`) tiene fórmulas en `E55:L55` pero `D55` vacía**: nunca da X. Es cualitativa.

✅ **`C27` (IFS Índice MT) es texto** (`7/10`) y se copia tal cual. El valor deriva de Dígitos Atrás +
Memoria de Trabajo Visual.

Si alguna vez vuelve a llegar como número (~45000–48000), la conversión **es reversible**: formatear
el serial como `d/m` devuelve lo tipeado. Chequear que el denominador coincida con el máximo del
subtest (`/10`), usar el valor en esta fila y anotarlo en el bloque 12 como recuperado a confirmar.
**Nunca** dejar `[PENDIENTE …]` escrito dentro de la celda — celda sin dato = celda vacía.

⚠️ **Fila 2 vs fila 37 (TRO):** `C18` y `C53` pueden traer valores distintos. **Copiar cada celda en
su fila**, no reconciliarlas, y anotar la diferencia en el bloque 12 (`mapeo-excel-a-word.md` §5.f).

## Cómo se completa cada fila: PB, Z y la X de rango

En las filas cualitativas el texto va en **PB** y Z queda vacía (salvo AVD y KPDS-10). Los tres
patrones, con ejemplos verbatim de informes reales:

| Patrón | Filas | PB | Z | X de rango |
|---|---|---|---|---|
| **Con Z** | 5–9, 25–34 (15 filas) | número (`7`, `7,66`) | número a 2 decimales (`0,45`, `-0,90`) o cap (`≤-3`) | **1 X** en el tramo que corresponde |
| **Cualitativa simple** | 1–2, 10–24, 35–39 (22 filas) | el texto entero (`29/30`, `10/10`, `3 normal`, `Normal`, `5`, `No`, `Cuestionable`) | **vacía** | ninguna |
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
decimal no importa para el parseo — se usa **coma** por estilo. En `grafico1` del JSON, en cambio,
el mismo valor va como **número JSON** (`-0.3`) — ver `orden-categorias-graficos.md`.

## Estructura de celdas de la tabla de la plantilla

La tabla tiene **42 filas**: 1 de agrupación de tramos + 1 de encabezados + **39 de datos posibles** +
1 de leyenda. La grilla es de **13 columnas**; la última columna de rango tiene `gridSpan=2`.

| Filas de datos | Celdas reales | Composición |
|---|---|---|
| todas salvo AVD y KPDS-10 | **12** | Área · Prueba · PB · Z · 8 celdas de rango |
| **AVD y KPDS-10** | **11** | Área · Prueba · PB · **Z con `gridSpan=2`** · 7 celdas de rango |

El script ya lo resuelve (escribe siempre PB, Z y las últimas 8 celdas). Importa sólo si hay que
clonar la tabla a mano en el modo de respaldo (`SKILL.md`, bloque 4).

**Las celdas cualitativas no están fusionadas ni tienen trazado diagonal:** tienen las 8 celdas de
rango separadas, igual que las filas con Z; lo que las distingue es sólo el relleno gris. La leyenda
al pie dice "las áreas con trazado diagonal indican que el puntaje no lleva puntaje Z", que es una
**inconsistencia de la plantilla**: se reproduce tal cual, no se "corrige".

**Mapa de sombreado** (ya está en la plantilla; no se escribe nada):

| Tipo de fila | Z | `< -3` | `-3 a -2` | `-2 a -1` | resto |
|---|---|---|---|---|---|
| Con Z | sin relleno | `A6A6A6` gris oscuro | `A6A6A6` | `D9D9D9` gris claro | sin relleno |
| Cualitativa simple | `D9D9D9` | `D9D9D9` | `D9D9D9` | `D9D9D9` | `D9D9D9` |

Gris oscuro = puntaje significativamente bajo, gris claro = bajo pero sin déficit significativo (así
lo explica la leyenda). En una fila **con Z**, las columnas de rango sin `X` van vacías: esos tramos
aplican, el puntaje simplemente no cae ahí. El gris uniforme de las filas cualitativas dice otra cosa:
"esta prueba no tiene puntaje Z". **Ninguna de las dos lleva texto** (ni `N/A`, ni `—`).

## Pendiente de confirmar con la profesional

- **Desempate cuando el Z cae justo en un límite** entre dos columnas (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Las fórmulas de `E:L` ya implementan límite inferior inclusive, superior exclusivo; la
  skill transcribe esa `X`, pero si un Z cae exactamente en un borde, lo señala en el bloque 12.
