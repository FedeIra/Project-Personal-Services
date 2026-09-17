# Orden de categorías — Excel de gráficos

> Verificado en dos fuentes: los archivos sueltos `excelPrimerGrafico.xlsx` /
> `excelSegundoGrafico.xlsx`, y las **hojas de datos realmente embebidas** en `informeFinal2.docx`
> (`word/embeddings/Microsoft_Excel_Worksheet*.xlsx` + `word/charts/chart1.xml`, `chart2.xml`).
>
> La skill devuelve los valores en este orden exacto para que el copy/paste calce sin reordenar.
> 🚩 **Formato numérico: COMA decimal** (`-1,32`) — **igual que la tabla de síntesis** (decisión del
> 2026-09-17). Antes acá decía punto, con el argumento de que "Excel necesita reconocer el valor como
> número": **es al revés**. El Excel de los gráficos está en configuración regional española, donde el
> separador decimal **es la coma**; pegarle `0.45` no le entra como número — lo toma como texto o lo
> malinterpreta, y el gráfico se arma mal. El separador correcto es el del Excel que recibe el pegado.

---

## Gráfico 1 — perfil cognitivo (14 valores Z)

| # | Prueba | Z desde |
|---|---|---|
| 1 | DD | `D19` |
| 2 | DI | `D20` |
| 3 | TMT A | `D21` |
| 4 | TMT B | `D22` |
| 5 | BEM–MS AST | `D37` |
| 6 | BEM–MS RSE | `D38` |
| 7 | BEM–MS Sem | `D39` |
| 8 | BEM–MS Rec | `D40` |
| 9 | BEM–MS CE | `D41` |
| 10 | BEM–ML Inm | `D42` |
| 11 | BEM–ML Dif | `D43` |
| 12 | FF | `D44` |
| 13 | FS | `D45` |
| 14 | TBA | `D46` |

(Celdas de `excelEvaluacionCompletoV5.xlsx`, hoja `TABLA DE FORMULAS` — direcciones definidas en
`mapeo-excel-a-word.md` §1.)

> 🚩 **Ojo con las versiones:** en V3/V4 las 10 pruebas de memoria y lenguaje estaban 3 filas más
> arriba (`D34`–`D43`). V5 las corrió al convertir AS1/AS2/AS3 en filas propias.

No todas las pruebas de la batería se grafican: MMSE, Stroop, Test del Reloj e IFS no aparecen acá.
Devolver valores **sólo para estas 14, en este orden**.

### Los valores van redondeados y capados — igual que en la tabla

**Corrección respecto de versiones anteriores del plan, que asumían pass-through del Z crudo.** La
hoja embebida en `informeFinal2.docx` guarda los **mismos valores de display que la tabla de
síntesis**, no los crudos del Excel:

| Prueba | Z crudo en el Excel | En el gráfico | Regla |
|---|---|---|---|
| DD | `0.4482758620689658` | `0,45` | redondeo a 2 decimales |
| BEM–MS AST | `-0.89944134078212257` | `-0,9` | redondeo (sin cero final) |
| FS | `-0.29629629629629656` | `-0,3` | redondeo |
| BEM–MS CE | `-2.013888888888888` | `-2,01` | redondeo |
| **BEM–MS Sem** | `-3.1067961165048534` | **`-3`** | **cap en −3** |
| FF (en `informeFinal.docx`) | > +3 | **`3`** | **cap en +3** |

Regla: **redondear a 2 decimales y capar en ±3**, igual que en la tabla de síntesis, y **con coma**
también. Única diferencia de formato: acá es un número, así que **el cero final se cae** (`-0,3`, no
`-0,30`) y el cap es el número `-3` / `3`, no el texto `≤-3` / `≥3`.

> ⚠️ **El cap lo aplica la skill, no el Excel.** V5 muestra la columna `D` capada, pero eso es un
> **formato de número** (`[<=-3]"≤-3";[>=3]"≥3";0.00`): al leer el archivo por código sale el Z crudo.
> Vale para el gráfico igual que para la tabla — ver `mapeo-excel-a-word.md` §1.

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

### ✅ Los 10 valores salen del Excel

| # | Síntoma | Celda |
|---|---|---|
| 1 | Cansancio | `B53` |
| 2 | Nervios | `B54` |
| 3 | Nervios + | `B55` |
| 4 | Desesperanza | `B56` |
| 5 | Inquietud | `B57` |
| 6 | Inquietud + | `B58` |
| 7 | Depresión | `B59` |
| 8 | Esfuerzo | `B60` |
| 9 | Tristeza | `B61` |
| 10 | Inutilidad | `B62` |

Los rótulos están en `A53:A62` **en este mismo orden**, así que el paste es posicional y directo.
`B63` = `=SUMA(B53:B62)` es el total. *(En V3/V4 este bloque estaba 3 filas más arriba: `B50:B59` con
total en `B60`.)*

**Dos chequeos antes de emitir el bloque:**

1. La suma de los 10 valores tiene que dar `B63`.
2. `B63` tiene que coincidir con `C18`, el PB del K-10 de la tabla de síntesis. En V5 `C18` es `=B63`,
   así que coinciden por construcción; en archivos anteriores `C18` estaba tipeado. Si difieren,
   **decirlo en el bloque 12 y no elegir por cuenta propia**.

   ⚠️ **No es hipotético:** en una versión intermedia de V5 `C18` decía `30` con los ítems sumando
   `24` — cruzaba el corte ≥ 25 y cambiaba la categoría diagnóstica. Este chequeo lo detecta.

Versiones anteriores del Excel guardaban **sólo el total**, así que este gráfico se transcribía del
papel; era el faltante §A.2 de `excel-unificado-spec.md`. **Ya no aplica.** Si llegara un archivo
viejo sin el desglose, decir explícitamente que faltan en vez de inventar números que sumen el total.
