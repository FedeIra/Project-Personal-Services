# Revisión: salida de la IA vs. informe real del profesional

**Fecha:** 2026-09-08
**Qué se comparó:**

| | Archivo |
|---|---|
| Entrada (única) | `ejemplos/excelEvaluacionCompleto.xlsx`, hoja `TABLA DE FORMULAS` |
| Salida de la IA | `ejemplos/1. Tabla de datos personales.txt` (Claude Desktop + skill `informe-neurocognitivo`) |
| Referencia humana | `ejemplos/informeFinal2.docx` (mismo paciente, mismo Excel, redactado a mano) |

Los dos documentos nacen del mismo Excel, así que la comparación mide directamente si la skill y
sus documentos de mapeo llevan del Excel al informe correcto.

Método: se descomprimieron el `.xlsx` y el `.docx` y se leyeron los XML crudos
(`xl/worksheets/sheet1.xml`, `word/document.xml`, `word/charts/chart1.xml`, `chart2.xml`), así que
las comparaciones de abajo son contra los valores reales, no contra una lectura visual.

---

## Titular

**La mitad determinística salió perfecta. Los fallos están concentrados en los bloques narrativos,
más una regla de datos demasiado conservadora y un defecto mecánico en el formato de pegado.**

| Bloque | Resultado |
|---|---|
| 1 · Datos personales | ✅ exacto (incluidas las dos conversiones de serial de fecha) |
| 3 · Tabla de síntesis — **valores** | ✅ los 36 PB, los 15 Z, las 15 X y el cap `≤-3` coinciden 1:1 |
| 3 · Tabla de síntesis — **formato de pegado** | ❌ conteo de campos roto en los 3 bloques (§B1) — ✅ resuelto: la skill ahora genera la tabla entera |
| 4 · Gráfico 1 | ✅ los 14 valores coinciden byte a byte con `chart1.xml` |
| 5 · Gráfico 2 (K-10) | ✅ correctamente reportado como no generable |
| 10 · Categoría diagnóstica | ✅ categoría 2, con el razonamiento submedida-vs-índice que pedía la skill |
| 10 · Viñetas de sugerencias | ✅ las 4, en orden · ❌ el paréntesis de hábitos (§B8) |
| 11 · Reporte de faltantes | ✅ útil y honesto · ❌ un faltante era recuperable (§B2) |
| 2 · Anamnesis | ⚠️ fondo correcto, marcadores inline rompen el texto (§B9) |
| 6 · Screening | ❌ faltan 3 de las 4 frases invariantes (§B4) |
| 7 · Secciones por área | ❌ el fallo más serio — siglas, valores Z y una etiqueta de déficit inexistente (§B3, §B5, §B6) |
| 8 · Recap | ⚠️ orden de áreas distinto al de los dos informes reales (§B7) |
| 9 · Frase de cierre | ⚠️ demasiado larga, con siglas (§B10) |

---

## A. Lo que validó bien (no tocar)

### A1. Datos personales — exacto

`C48 = 23628` → `08/09/1964` y `C51 = 46265` → `31/08/2026`. Las seis filas coinciden con la tabla
del Word, sin filas de más ni de menos (`informeFinal2` no tiene `Deriva:`, y la IA no la agregó).

### A2. Tabla de síntesis — todos los valores correctos

Se verificaron las 36 filas contra el XML de la tabla del Word. Coinciden:

- los 15 PB con Z (`7`, `4`, `38`, `42`, `24`, `7,66`, `8`, `8`, `12`, `10`, `7`, `8`, `24`, `20`, `10`);
- los 15 Z, redondeados a 2 decimales **con el cero final** (`-0,90`, `-0,30`);
- el cap `≤-3` de BEM–MS Sem (Z crudo `-3.1067…`);
- la columna de la X en las 15 filas;
- los 8 subpuntajes del IFS, los 3 ensayos AS1/AS2/AS3 (`5`, `8`, `10`) y las filas cualitativas;
- las 2 filas especiales (AVD `8`/`Autónomo`, KPDS-10 `15`/`Normal`).

### A3. Gráfico 1 — exacto

Los 14 valores de la IA contra los de `word/charts/chart1.xml` de `informeFinal2`:

```
IA:    0.45  -0.35  -0.18  1.02  -0.9  -0.13  -3  0.57  -2.01  -1.24  -0.51  2.31  -0.3  -0.86
Word:  0.45  -0.35  -0.18  1.02  -0.9  -0.13  -3  0.57  -2.01  -1.24  -0.51  2.31  -0.3  -0.86
```

Orden, redondeo, cap en `-3` y punto decimal: todo correcto.

### A4. Decisiones de criterio que la skill quería y salieron

- **Categoría 2, no 3.** La IA aplicó el razonamiento de `regla-diagnostica.md`: Sem y CE disparan
  el umbral literal de DCL pero son submedidas derivadas, los índices principales (AST, RSE, Rec)
  están conservados → fallas aisladas. Dijo explícitamente que la decisión final es del médico.
  Es exactamente la lectura del informe real.
- **Antecedente familiar incluido.** `B57` (`mamá con EA`) va en la anamnesis, como pide la skill,
  aunque `informeFinal2` lo haya omitido.
- **`PROTOCOLO XTEND` omitido.** Correcto.
- **K-10 no inventado.** Reportó que faltan los 10 ítems en vez de fabricar un desglose que sumara 15.

---

## B. Los fallos, en orden de impacto

### B1. ❌ El conteo de campos del bloque 3 está roto — el pegado se desalinea

Es el único fallo que rompe el entregable de forma mecánica, y es el que
`orden-filas-sintesis.md` dedica una página entera a prevenir.

Conteo real de campos separados por tab en la salida de la IA:

| Bloque | Campos que debería tener por fila | Campos reales |
|---|---|---|
| 1 (MMSE, TRO) | 10 | **4 y 1** |
| 2 (AVD, KPDS-10) | 9 | **2 y 2** |
| 3, filas con Z | 10 | **9** |
| 3, filas cualitativas | 10 | **7** |
| 3, última fila (`MMSE copia`) | 10 | **1** |

Causa: **los tabs finales se pierden**. La IA los emite conceptualmente pero el texto plano del chat
los recorta al final de cada línea. Y como se recortan una cantidad distinta según la fila (9 vs 7),
el bloque 3 no sólo queda corto: queda **no uniforme**, así que al pegar en Word se desfasa a partir
de la segunda fila y arrastra el error por las 32 filas.

Es un problema de la salida, no del contenido: cada fila lleva el dato correcto en la posición
correcta; lo que falta es el relleno de la derecha.

> ✅ **RESUELTO por cambio de enfoque (2026-09-08).** La profesional confirmó que **no hace falta
> conservar la tabla que ya está en el Word**: alcanza con que la tabla nueva cumpla con lo que
> informa la original (mismas columnas, mismas filas y orden, mismos valores, rangos agrupados,
> celdas sin puntaje marcadas). Entonces **la skill genera la tabla entera** en vez de pegar valores
> sueltos sobre la existente.
>
> Eso elimina los dos riesgos de raíz, no sólo el medido:
>
> - **No hay conteo de campos invisibles.** Una tabla markdown/HTML tiene celdas estructurales, no
>   delimitadas por tabs que se recortan. El fallo de las filas de 9 y 7 campos no puede repetirse.
> - **No hay navegación de cursor entre celdas preexistentes.** El riesgo sin verificar —que Word
>   bajara a la columna `Área` y sobrescribiera los rótulos en 32 filas— desaparece: no se escribe
>   dentro de celdas, se inserta una tabla nueva.
>
> Cambios de forma que trae el enfoque nuevo: la columna `ÁREA` **repite el nombre en cada fila** (en
> vez de celdas combinadas verticalmente), todas las filas tienen **12 columnas** (se cae el
> `gridSpan` de AVD/KPDS-10, que era el origen del split en 3 bloques), y el **sombreado gris se
> reemplaza por `N/A`** en las celdas que no llevan puntaje — salvo que se use la variante HTML, que sí
> conserva el gris.
>
> ✅ **Probado en Word real (2026-09-08)** con `ejemplo-tabla-sintesis.html`: entra como tabla de Word,
> conserva el sombreado gris, las 15 X caen en la columna correcta y la tabla entra a lo ancho de la
> página con los `N/A`. En esa prueba apareció y se corrigió un bug del generador: la fila de
> agrupación salía **sin `colspan`**, así que los cuatro rótulos ocupaban una columna cada uno y los
> cuatro tramos de la derecha quedaban sin rótulo. Los `colspan` tienen que sumar 8 (2·1·2·3) — quedó
> como autochequeo en `SKILL.md` y `orden-filas-sintesis.md`.
>
> Falta probar el camino de **markdown renderizado** (copiar la tabla directo del chat), que es el que
> va a usar la profesional a diario; el de HTML ya sirve de respaldo. Especificación completa en
> `orden-filas-sintesis.md`; el enfoque viejo quedó ahí documentado como alternativa.

### B2. ❌ `D31` (IFS Índice MT) se declaró irrecuperable y **es recuperable de forma determinística**

La IA escribió `[PENDIENTE - dato corrupto]` en la fila 11 de la tabla — un texto literal que se
pegaría al Word — y lo listó como faltante. Pero el dato se reconstruye sin adivinar nada:

```
D31 = 46302  (serial de fecha de Excel)
46265 = 31/08/2026  (C51, fecha de evaluación, referencia conocida)
46302 − 46265 = 37 días  →  07/10/2026  →  "7/10"
```

Y `informeFinal2` dice, efectivamente, **`7/10`**. La autoconversión de Excel es **reversible**: el
serial formateado como `d/m` devuelve exactamente lo que se tipeó.

La skill hoy dice lo contrario (`SKILL.md`: *"reportarlo y pedir el valor; no adivinar"*), así que la
IA hizo lo que se le pidió. La instrucción es la que estaba mal calibrada: recuperar y **proponer**
el valor no es adivinar, es deshacer una conversión conocida.

Chequeo que hay que exigir — y que además **desempata**: con los dos números ≤ 12 el serial es
ambiguo (`07/10/2026` pudo tipearse `7/10` o `10/7`). Lo que decide es el máximo del subtest: el IFS
Índice MT es sobre **10**, así que `7/10` pasa y `10/7` no. Si ninguna lectura pasa, o pasan las dos,
ahí sí es irrecuperable.

### B3. ❌ Sem se tradujo como "falla en memoria semántica" — es una etiqueta de déficit que el informe real no hace

El fallo clínicamente más serio de toda la salida.

| | Texto |
|---|---|
| IA | *"Se observaron fallas aisladas en submedidas derivadas: **memoria semántica** (BEM–MS Sem ≤-3) y el índice compuesto CE (-2,01…)"* |
| Real | *"…con **bajo beneficio de la facilitación de claves semánticas** y mejorando cuando se le dan de opción múltiple; dejando en evidencia una capacidad de reconocimiento conservada."* |

`BEM–MS Sem` **no mide memoria semántica**: mide cuánto mejora el recuerdo cuando se dan claves
semánticas. Un Sem bajo se lee como *bajo beneficio de la facilitación*, no como una función
deteriorada. La IA convirtió una medida de facilitación en un déficit nombrado, dentro de un
documento clínico.

Nada en la skill traduce las siglas de BEM a lenguaje de proceso, así que la IA improvisó desde el
nombre de la sigla. Falta la tabla sigla → prosa.

### B4. ❌ Faltan 3 de las 4 frases invariantes del bloque de screening

| Frase | ¿La emitió la IA? |
|---|---|
| `Discurso fluido y organizado, con conservada capacidad de comprensión y expresión.` | ❌ |
| `Nivel de alerta conservado a lo largo de toda la consulta, sin presencia de fatiga que pudo haber interferido negativamente.` | ❌ |
| `Orientación temporal y espacial conservadas.` | ❌ (la marcó pendiente) |
| `Rendimiento cognitivo general inicial … (MMSE=…; TRO=…; INECO=…) para su edad y nivel educativo.` | ✅ |
| `Según autoreporte sobre funcionalidad e independencia, la autonomía en las actividades básicas de la vida diaria está conservada.` | ⚠️ reescrita como `Autónomo en las actividades de la vida diaria (AVD=8).` |

Causa raíz, común con B5: `SKILL.md` describe el bloque y después enumera **sólo las partes
variables** (orientación, C-QSM, los puntajes). Eso se lee como una especificación completa, así que
la IA llenó los huecos y descartó todo lo demás. La instrucción *"seguir el registro de
`ejemplo-informe.md`"* ya estaba y no alcanzó: una referencia de tono no compite con una lista.

### B5. ❌ Siglas y valores Z dentro de los párrafos clínicos

| | Texto |
|---|---|
| IA | *"Presentó un span atencional conservado (**DD=0,45**) y adecuada memoria de trabajo (**DI=-0,35**)…"* |
| Real | *"Puntaje conservado en span atencional, **logrando retener 7 dígitos de manera directa**. En retrogresión, logra retener 4 dígitos…"* |

Ningún informe real pone siglas ni valores Z en la prosa: el Z ya está en la tabla y en el gráfico,
y el párrafo lo traduce a lenguaje clínico (opcionalmente citando el PB **en palabras**).

`mapeo-excel-a-word.md` §4.2 ya prohibía las siglas y la IA igual las usó; los valores Z no estaban
prohibidos en ningún lado. Hacen falta las dos prohibiciones juntas, con un par de ejemplos
contrastados.

También faltan frases fijas dentro de las secciones por área:

- Atención: falta el arranque `Nivel de alerta conservado a lo largo de toda la consulta.`
- Atención: la IA enumeró los 8 subtests del IFS por sigla (`SM, IC, CIM, DA, MA, MTV, R y CIV`);
  el informe real dice sólo `Puntaje conservado en la prueba ejecutiva.`
- Lenguaje: falta `La entonación y articulación del lenguaje impresionaron conservadas a lo largo de
  toda la entrevista.`, y `Comprensión y expresión normales` debería ser
  `Capacidad de comprensión y expresión conservadas.`

### B6. ❌ `CE` no aparece narrado en ningún informe real, y la IA lo nombró tres veces

En `informeFinal2` (y en `informeFinal`) el índice CE **no figura en la prosa**: ni en el párrafo de
memoria, ni en el recap, ni en la frase de cierre. Aparece sólo como fila de la tabla y punto del
gráfico. La IA lo nombró en los tres lugares (`el índice compuesto CE (-2,01, promedio de Sem y
Rec)`).

Es coherente con el criterio ya documentado en `regla-diagnostica.md` (CE es una submedida derivada
que "no pesa tanto"), pero de ahí sólo se dedujo que CE no dispara la categoría — nunca se dijo que
tampoco se narra.

### B7. ⚠️ El orden del recap no es el "orden inverso" que documenta la skill

| Fuente | Orden |
|---|---|
| Skill (`mapeo` §4.3) | orden inverso al de la tabla → visoconstrucción, lenguaje, **memoria**, atención |
| IA | visoconstrucción, lenguaje, **memoria**, atención (siguió la skill al pie de la letra) |
| `informeFinal2` | visoconstrucción+orientación, lenguaje, atención, **memoria seriada, memoria lógica** |
| `informeFinal` | orientación+visoconstrucción, lenguaje, atención+memoria lógica, screening ejecutivo, **memoria seriada** |

Los dos informes reales **cierran con memoria**; la regla "orden inverso" la pone tercera. La IA no
se equivocó: la regla documentada está mal. (n=2, así que es una observación fuerte pero no una ley.)

### B8. ⚠️ El paréntesis de hábitos es un comentario, no una recomendación

| | Texto |
|---|---|
| IA | `Promover hábitos de vida saludables (ya realiza actividad física regular —yoga y gimnasio—, por lo que no se sugiere incorporarla; podría orientarse a mejorar la calidad del sueño y a estrategias de manejo del estrés laboral/financiero referido)` |
| `informeFinal2` | `Promover hábitos de vida saludables (estrategias de compensación, no multitarea)` |
| `informeFinal` | `Promover hábitos de vida saludables (mejorar calidad del sueño y técnicas de relajación)` |

El contenido que eligió la IA es razonable (leyó bien la anamnesis: ya hace actividad física, duerme
mal, refiere estrés). El problema es la **forma**: el paréntesis real es un sintagma nominal corto
—3 a 8 palabras— y nunca explica su propio razonamiento. El *"por lo que no se sugiere incorporarla"*
es metacomentario dirigido al profesional dentro de una viñeta que va al paciente.

### B9. ⚠️ Los marcadores de pendiente rompen el texto pegable

`El Sr. Bunader asiste [PENDIENTE: falta el dato de "Acompañado" — no está en el Excel] a la
consulta…` — la frase deja de ser pegable y el marcador ya está, además, en el bloque 11.

Mismo caso en la anamnesis (`[NOTA: la frase queda cortada… celda B58 truncada, irrecuperable]`) y
en screening (`Orientación temporal y espacial: [PENDIENTE — no está desglosado en el Excel]`).

No hay que sacar la advertencia — hay que sacarla del medio de la oración. Falta una convención de
marcado.

> **Sobre "Acompañado" concretamente:** no conviene asumir `solo` por ausencia de nota en contrario.
> Es un dato clínico que el Excel no trae; deducirlo del silencio es inventarlo. La salida debería
> emitir una oración gramatical con **una** ranura acotada (`asiste [solo / acompañado por …] a la
> consulta`) y listarlo en el bloque 11. Si la profesional prefiere que se asuma `solo` por default,
> es decisión suya → queda anotado en `preguntasParaLaProfesional.md`.

### B10. ⚠️ La frase de cierre es larga y trae siglas

| | Texto |
|---|---|
| IA | dos oraciones: la del template + *"Se observaron fallas aisladas en submedidas de memoria episódica (memoria semántica y el índice compuesto CE) que, a la fecha, no impresionarían…"* |
| Real | **una** oración: *"**En conclusión,** el Sr. Bunader presentó un rendimiento cognitivo normal con leves fallas aisladas en recuperación de la memoria."* |

El cierre real arranca con `En conclusión,`, es una sola oración, y nombra la función afectada en
palabras (`recuperación de la memoria`), sin siglas ni índices.

### B11. ⚠️ El C-QSM figura en `PRUEBAS ADMINISTRADAS` pero no se tomó

La IA detectó bien que no hay puntaje de C-QSM. Lo que nadie le dijo es que `C-QSM` es una **línea
fija de la lista `PRUEBAS ADMINISTRADAS` del Word**: si no se tomó, esa línea hay que borrarla del
informe. Es una acción concreta que debería salir en el bloque 11.

---

## C. Observación aparte — dato de paciente real dentro del paquete de la skill

`SKILL.md` advierte que `informeFinal2.docx` es de un paciente real y que **no** debe subirse al
paquete sin anonimizar. Pero `mapeo-excel-a-word.md` §3 ya cita textualmente una nota de la
entrevista de ese paciente (el par `"cierto estrés cerebral y financiero"` → `"poco estrés o
sobrecarga laboral/finaciera"`), y `mapeo` está listado como archivo del paquete.

Criterio aplicado en los ajustes de esta revisión: **el boilerplate clínico invariante y el
vocabulario de proceso de BEM son texto de plantilla, no dato de paciente** — se pueden documentar.
Lo específico del paciente (nombres, fechas, PB, Z, la anécdota del partido) no entra. Los ejemplos
✅/❌ que se agregaron usan los números ficticios de `ejemplo-informe.md` o placeholders (`<D25>`).

**Pendiente de anonimizar antes de subir el paquete** — dos lugares, los dos preexistentes a esta
revisión, los dos en `mapeo-excel-a-word.md`:

| Dónde | Qué |
|---|---|
| §3 | El par de comillas de la entrevista (`"cierto estrés cerebral y financiero"` → `"poco estrés o sobrecarga laboral/finaciera"`), que ilustra que la skill no debe suavizar una cita del paciente |
| §1 | Los PB reales en la tabla de esquema del bloque cualitativo (`30/30`, `26,5/30`, etc.) |

Ninguno lleva nombre, pero en conjunto son el perfil de puntajes de una persona identificable por
otras vías. Se resuelve reemplazándolos por valores inventados que ilustren lo mismo: ninguno de los
dos ejemplos depende de que los números sean los reales.

---

## D. Ajustes aplicados a la skill

| # | Fallo | Archivo tocado |
|---|---|---|
| B1 | Conteo de campos del pegado → **la skill genera la tabla entera** | `orden-filas-sintesis.md` · `SKILL.md` · `preguntasParaLaProfesional.md` §C.1/§C.1.b |
| B2 | Recuperación de `D31` | `SKILL.md` · `mapeo-excel-a-word.md` §5.1 · `orden-filas-sintesis.md` |
| B3 | Tabla sigla BEM → prosa | `mapeo-excel-a-word.md` §4.2 |
| B4 | Frases invariantes del screening | `mapeo-excel-a-word.md` §4.1 · `SKILL.md` |
| B5 | Prohibición de siglas y Z en prosa + frases fijas por área | `mapeo-excel-a-word.md` §4.2 |
| B6 | CE no se narra | `mapeo-excel-a-word.md` §4.2 · `regla-diagnostica.md` |
| B7 | Orden real del recap | `mapeo-excel-a-word.md` §4.3 · `ejemplo-informe.md` |
| B8 | Forma del paréntesis de hábitos | `regla-diagnostica.md` |
| B9 | Convención de marcado de pendientes | `SKILL.md` |
| B10 | Forma de la frase de cierre | `mapeo-excel-a-word.md` §4.3 |
| B11 | Reconciliar `PRUEBAS ADMINISTRADAS` | `SKILL.md` bloque 11 |
| B9 | Decisión sobre "Acompañado" | `preguntasParaLaProfesional.md` |

---

## E. Cómo repetir esta verificación

Los dos archivos son ZIP. Sin dependencias externas:

```bash
unzip -o -q ejemplos/excelEvaluacionCompleto.xlsx -d /tmp/xlsx   # xl/worksheets/sheet1.xml + xl/sharedStrings.xml
unzip -o -q ejemplos/informeFinal2.docx          -d /tmp/docx   # word/document.xml + word/charts/chart*.xml
```

- Valores del gráfico: `grep -o '<c:v>[^<]*</c:v>' /tmp/docx/word/charts/chart1.xml`
- Texto del informe: extraer `<w:t>` agrupando por `<w:p>`
- Celdas del Excel: resolver los índices `t="s"` contra `sharedStrings.xml`
- Conteo de campos de los bloques de pegado:
  `awk -F'\t' '{print NR": "NF}' "ejemplos/1. Tabla de datos personales.txt"`
