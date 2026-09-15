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
| 1 | DD | `D19` |
| 2 | DI | `D20` |
| 3 | TMT A | `D21` |
| 4 | TMT B | `D22` |
| 5 | BEM–MS AST | `D34` |
| 6 | BEM–MS RSE | `D35` |
| 7 | BEM–MS Sem | `D36` |
| 8 | BEM–MS Rec | `D37` |
| 9 | BEM–MS CE | `D38` |
| 10 | BEM–ML Inm | `D39` |
| 11 | BEM–ML Dif | `D40` |
| 12 | FF | `D41` |
| 13 | FS | `D42` |
| 14 | TBA | `D43` |

(Celdas de `excelEvaluacionCompletoV4.xlsx`, hoja `TABLA DE FORMULAS` — direcciones definidas en
`mapeo-excel-a-word.md` §1.)

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

### ✅ Los 10 valores ya salen del Excel (desde V3, 2026-09-15)

| # | Síntoma | Celda |
|---|---|---|
| 1 | Cansancio | `B50` |
| 2 | Nervios | `B51` |
| 3 | Nervios + | `B52` |
| 4 | Desesperanza | `B53` |
| 5 | Inquietud | `B54` |
| 6 | Inquietud + | `B55` |
| 7 | Depresión | `B56` |
| 8 | Esfuerzo | `B57` |
| 9 | Tristeza | `B58` |
| 10 | Inutilidad | `B59` |

Los rótulos están en `A50:A59` **en este mismo orden**, así que el paste es posicional y directo.
`B60` = `=SUMA(B50:B59)` es el total.

**Dos chequeos antes de emitir el bloque:**

1. La suma de los 10 valores tiene que dar `B60`.
2. `B60` tiene que coincidir con `C18`, el PB del K-10 de la tabla de síntesis. Desde 2026-09-15
   `C18` es `=B60`, así que coinciden por construcción; en archivos anteriores `C18` estaba tipeado.
   Si difieren, **decirlo en el bloque 11 y no elegir por cuenta propia**.

Versiones anteriores del Excel guardaban **sólo el total**, así que este gráfico se transcribía del
papel; era el faltante §A.2 de `excel-unificado-spec.md`. **Ya no aplica.** Si llegara un archivo
viejo sin el desglose, decir explícitamente que faltan en vez de inventar números que sumen el total.
