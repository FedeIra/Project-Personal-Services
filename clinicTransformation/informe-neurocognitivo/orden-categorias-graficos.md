# Orden de categorías — Excel de gráficos

> Verificado en dos fuentes: los archivos sueltos `excelPrimerGrafico.xlsx` /
> `excelSegundoGrafico.xlsx`, y las **hojas de datos realmente embebidas** en `informeFinal2.docx`
> (`word/embeddings/Microsoft_Excel_Worksheet*.xlsx` + `word/charts/chart1.xml`, `chart2.xml`).
>
> La skill devuelve los valores en este orden exacto para que el copy/paste calce sin reordenar.
> **Formato numérico: punto decimal** (`-1.32`, no `-1,32`) — a diferencia de la tabla de síntesis
> (que usa coma), acá Excel necesita reconocer el valor como número.

---

## Gráfico 1 — perfil cognitivo (14 valores Z)

| # | Prueba | Z desde |
|---|---|---|
| 1 | DD | `E8` |
| 2 | DI | `E9` |
| 3 | TMT A | `E10` |
| 4 | TMT B | `E11` |
| 5 | BEM–MS AST | `E13` |
| 6 | BEM–MS RSE | `E14` |
| 7 | BEM–MS Sem | `E15` |
| 8 | BEM–MS Rec | `E16` |
| 9 | BEM–MS CE | `E17` |
| 10 | BEM–ML Inm | `E18` |
| 11 | BEM–ML Dif | `E19` |
| 12 | FF | `E20` |
| 13 | FS | `E21` |
| 14 | TBA | `E22` |

(Celdas de `excelEvaluacionCompleto.xlsx`, hoja `TABLA DE FORMULAS`.)

No todas las pruebas de la batería se grafican: MMSE, Stroop, Test del Reloj e IFS no aparecen acá.
Devolver valores **sólo para estas 14, en este orden**.

### Los valores van redondeados y capados — igual que en la tabla

**Corrección respecto de versiones anteriores del plan, que asumían pass-through del Z crudo.** La
hoja embebida en `informeFinal2.docx` guarda los **mismos valores de display que la tabla de
síntesis**, no los crudos del Excel:

| Prueba | Z crudo en el Excel | En el gráfico | Regla |
|---|---|---|---|
| DD | `0.4482758620689658` | `0.45` | redondeo a 2 decimales |
| BEM–MS AST | `-0.89944134078212257` | `-0.9` | redondeo (sin cero final) |
| FS | `-0.29629629629629656` | `-0.3` | redondeo |
| BEM–MS CE | `-2.013888888888888` | `-2.01` | redondeo |
| **BEM–MS Sem** | `-3.1067961165048534` | **`-3`** | **cap en −3** |
| FF (en `informeFinal.docx`) | > +3 | **`3`** | **cap en +3** |

Regla: **redondear a 2 decimales y capar en ±3**, igual que en la tabla de síntesis. Única diferencia
de formato: acá es un número, así que el cero final se cae (`-0.3`, no `-0,30`) y el cap es el número
`-3` / `3`, no el texto `≤-3` / `≥3`.

Las 14 categorías son exactamente las mismas 14 filas con Z de la tabla de síntesis (filas 5–9 y
23–32 de `orden-filas-sintesis.md`), salvo FF, que en la tabla aparece dos veces y acá una sola.
→ **Los 14 valores del gráfico se derivan del mismo cálculo que la columna Z de la tabla.** No hay
un segundo redondeo ni una segunda regla que mantener.

### ⚠️ La columna de destino cambia según el archivo

Los dos archivos usan un layout distinto, así que **no hay que hardcodear las celdas destino**:

| Fuente | Etiquetas | Valores | Encabezado de la serie |
|---|---|---|---|
| `excelPrimerGrafico.xlsx` (suelto) | `A2:A15` | **`B2:B15`** | `B1` |
| Hoja embebida en `informeFinal2.docx` | `B2:B15` | **`C2:C15`** | `C1` |

La instrucción robusta para el profesional es **posicional, no por letra de columna**:

> Pegar los 14 valores empezando en la celda que está **inmediatamente debajo del encabezado de la
> serie** — la celda que contiene el año (`2026`), a la derecha de la columna de nombres de prueba.

El encabezado de la serie es el **año de la evaluación** (`2026`), y en la hoja embebida la columna
`A` quedó vacía. Queda **por confirmar** si eso es un desplazamiento accidental o si `A`/`B` se
reservan para la serie de una evaluación anterior (el gráfico soportaría comparación longitudinal).
Mientras no se confirme, la instrucción posicional funciona en los dos casos.

---

## Gráfico 2 — Escala K-10 (10 valores)

Coincide con el orden 1–10 del cuestionario en papel. **Layout idéntico en los dos archivos:**
etiquetas en `A2:A11`, valores en **`B2:B11`**, encabezado `Puntaje` en `B1`.

| # | Síntoma | # | Síntoma |
|---|---|---|---|
| 1 | Cansancio | 6 | Inquietud + |
| 2 | Nervios | 7 | Depresión |
| 3 | Nervios + | 8 | Esfuerzo |
| 4 | Desesperanza | 9 | Tristeza |
| 5 | Inquietud | 10 | Inutilidad |

Son enteros (1 a 5 por ítem), sin decimales ni cap.

> Nota: las etiquetas de la hoja real tienen dos erratas — `Inquitud +` (sin la `e`) e `Inutilidad `
> (con espacio final). Están así en los dos archivos. Sólo importa si algún día se hace lookup por
> nombre; para el paste de valores es irrelevante, porque es posicional.

### ⚠️ Estos 10 valores hoy NO salen del Excel

`excelEvaluacionCompleto.xlsx` guarda **sólo el total** del K-10 (`D28` = `15`), no el desglose. Los
10 valores del gráfico de `informeFinal2.docx` (`2, 4, 1, 1, 2, 1, 1, 1, 1, 1`, que suman 15) se
transcriben del papel.

→ **La skill no puede generar este bloque desde el Excel.** Debe decirlo explícitamente en vez de
inventar un desglose que sume el total. Arreglo propuesto en `excel-unificado-spec.md` §A.2.
