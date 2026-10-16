# Orden de categorías — Excel de gráficos

> Verificado contra las **hojas de datos embebidas** en los gráficos de informes reales
> (`word/embeddings/Microsoft_Excel_Worksheet*.xlsx` + `word/charts/chart1.xml`, `chart2.xml`), que
> son las mismas de `plantilla-informe.docx`.
>
> 🚩 **Formato numérico — depende de adónde va el valor:**
> - **En `datos.json`** (`grafico1`, `grafico2`): **números JSON**, con punto y sin comillas (`-1.32`).
>   El script los escribe en el gráfico y en su libro embebido; si llega texto, aborta.
> - **Sólo en el modo de respaldo**, pegando a mano en el Excel del gráfico: **coma decimal**
>   (`-1,32`), porque ese Excel está en configuración regional española y `0.45` no le entra como
>   número (decisión del 2026-09-17).

---

## Gráfico 1 — perfil cognitivo (14 valores Z)

| # | Prueba | Z desde | Clave de la tabla |
|---|---|---|---|
| 1 | DD | `D21` | `dd` |
| 2 | DI | `D22` | `di` |
| 3 | TMT A | `D23` | `tmt_a` |
| 4 | TMT B | `D24` | `tmt_b` |
| 5 | BEM–MS AST | `D41` | `bem_ast` |
| 6 | BEM–MS RSE | `D42` | `bem_rse` |
| 7 | BEM–MS Sem | `D43` | `bem_sem` |
| 8 | BEM–MS Rec | `D44` | `bem_rec` |
| 9 | BEM–MS CE | `D45` | `bem_ce` |
| 10 | BEM–ML Inm | `D46` | `bem_inm` |
| 11 | BEM–ML Dif | `D47` | `bem_dif` |
| 12 | FF | `D48` | `ff_lenguaje` |
| 13 | FS | `D49` | `fs` |
| 14 | TBA | `D50` | `tba` |

(Celdas de `excelEvaluacionCompletoV6.xlsx`, hoja `TABLA DE FORMULAS` — direcciones definidas en
`mapeo-excel-a-word.md` §1.)

No todas las pruebas de la batería se grafican: MMSE, Stroop, Test del Reloj, IFS y ROC no aparecen
acá. `grafico1` en el JSON lleva **siempre 14 posiciones, en este orden**.

### 🚩 Pruebas no tomadas → `null`

Si una de estas 14 pruebas no se tomó (su fila no está en `sintesis`), su posición va **`null`** y el
script **borra esa categoría** del gráfico: renumera los puntos, acorta los rangos y reescribe el libro
de Excel embebido, para que "Editar datos" en Word no la resucite.

- El script **aborta** si `grafico1` y `sintesis` no coinciden: un valor para una fila que no está en
  la tabla, o `null` para una fila que sí está.
- Si las 14 son `null`, se borra el gráfico entero.

### Los valores van redondeados y capados — igual que en la tabla

El gráfico **no** lleva el Z crudo: los informes reales guardan los **mismos valores de display que
la tabla de síntesis**:

| Prueba | Z crudo en el Excel | En `grafico1` (JSON) | Regla |
|---|---|---|---|
| DD | `0.4482758620689658` | `0.45` | redondeo a 2 decimales |
| BEM–MS AST | `-0.89944134078212257` | `-0.9` | redondeo (sin cero final) |
| FS | `-0.29629629629629656` | `-0.3` | redondeo |
| BEM–MS CE | `-2.013888888888888` | `-2.01` | redondeo |
| **BEM–MS Sem** | `-3.1067961165048534` | **`-3`** | **cap en −3** |
| FF | > +3 | **`3`** | **cap en +3** |

Regla: **redondear a 2 decimales y capar en ±3**, igual que en la tabla de síntesis. Única
diferencia: acá es un **número**, así que el cero final se cae (`-0.3`, no `-0,30`) y el cap es el
número `-3` / `3`, no el texto `≤-3` / `≥3`.

> ⚠️ **El cap lo aplica la skill, no el Excel.** El Excel muestra la columna `D` capada, pero eso es un
> **formato de número** (`[<=-3]"≤-3";[>=3]"≥3";0.00`): al leer el archivo por código sale el Z crudo.
> Vale para el gráfico igual que para la tabla — ver `mapeo-excel-a-word.md` §1.

Las 14 categorías son exactamente las mismas filas con Z de la tabla de síntesis (filas 5–9 y
25–34 de `orden-filas-sintesis.md`), salvo FF, que en la tabla aparece dos veces y acá una sola.
→ **Los 14 valores del gráfico se derivan del mismo cálculo que la columna Z de la tabla.** No hay
un segundo redondeo ni una segunda regla que mantener.

### Sólo en el modo de respaldo: dónde se pegan a mano

En la hoja embebida del gráfico las etiquetas están en `B2:B15` y los valores en **`C2:C15`**, bajo
el encabezado de la serie (`C1`, el año de la evaluación). La instrucción para la profesional es
**posicional**: pegar los 14 valores empezando en la celda **inmediatamente debajo del encabezado con
el año**, a la derecha de la columna de nombres de prueba.

---

## Gráfico 2 — Escala K-10 (10 valores)

Coincide con el orden 1–10 del cuestionario en papel. En la hoja embebida del gráfico:
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

### Los 10 valores salen del Excel

| # | Síntoma | Celda |
|---|---|---|
| 1 | Cansancio | `B58` |
| 2 | Nervios | `B59` |
| 3 | Nervios + | `B60` |
| 4 | Desesperanza | `B61` |
| 5 | Inquietud | `B62` |
| 6 | Inquietud + | `B63` |
| 7 | Depresión | `B64` |
| 8 | Esfuerzo | `B65` |
| 9 | Tristeza | `B66` |
| 10 | Inutilidad | `B67` |

Los rótulos están en `A58:A67` **en este mismo orden**, así que el paste es posicional y directo.
`B68` = `=SUMA(B58:B67)` es el total.

🚩 **K-10 no tomado → `grafico2` = `null`**. Si los 10 ítems están vacíos, `grafico2` va
`null` entero y el script borra el gráfico. No se admiten `null` sueltos: o van los 10 enteros, o
ninguno.

**Dos chequeos antes de emitir el bloque:**

1. La suma de los 10 valores tiene que dar `B68`.
2. `B68` tiene que coincidir con `C20`, el PB del K-10 de la tabla de síntesis. `C20` es `=B68`, así
   que coinciden por construcción; si un archivo lo trae tipeado y difieren, **decirlo en el bloque 12
   y no elegir por cuenta propia**.

   ⚠️ **No es hipotético:** en un archivo real el PB del K-10 decía `30` con los ítems
   sumando `24` — cruzaba el corte ≥ 25 y cambiaba la categoría diagnóstica. Este chequeo lo detecta.

Si llegara un archivo con el total pero sin los 10 ítems, decir explícitamente que faltan en vez de
inventar números que sumen el total.
