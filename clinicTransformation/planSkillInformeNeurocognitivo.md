# Plan — Opción 1: Skill de informes neurocognitivos

> Documento único con todo el contenido de la Opción 1 (skill / paquete de contexto para LLM),
> consolidado desde `opcionesAutomatizacion.md` y los archivos de `informe-neurocognitivo/`. Sirve
> como referencia completa del plan sin tener que saltar entre archivos. Los archivos de
> `informe-neurocognitivo/` siguen siendo la fuente de verdad para lo que efectivamente se sube a
> claude.ai (son los que se comprimen en el `.zip`) — este documento es la foto completa del plan.

> **Actualizado con `excelEvaluacionCompleto.xlsx` + `informeFinal2.docx` (par entrada/salida real
> del mismo paciente).** Ese par permitió reconstruir el mapeo completo Excel → Word, que ahora vive
> en `informe-neurocognitivo/mapeo-excel-a-word.md`. Los cambios de fondo respecto de la versión
> anterior de este plan:
>
> - **El Excel unificado llegó, pero todavía no es autosuficiente**: faltan los 10 ítems del K-10, el
>   flag de riesgo de evolución y el C-QSM, y una celda vino corrompida (§9).
> - **La tabla de síntesis no se llena como se creía**: el texto cualitativo va en **PB**, no en Z
>   (§5).
> - **No hay trazado diagonal en ninguna plantilla**, y la causa real del desalineamiento del paste
>   son sólo 2 filas (§5).
> - **Los gráficos usan los valores redondeados y capados**, no el Z crudo (§7).
> - **Los templates de sugerencias se adaptan al paciente**, no se copian literalmente (§3, §6).
> - 🚩 **La regla diagnóstica no reproduce la decisión real del profesional**: aplicada al paciente de
>   `informeFinal2` da categoría 3 (DCL) donde el informe usó la 2 (normal con fallas aisladas). Es
>   el hallazgo de mayor impacto y no se arregla con el Excel (§12).
> - **Los bloques de salida son 11, no 7** (§3): faltaban la anamnesis, el screening y las líneas de
>   impresión diagnóstica por área.

---

## 1. Contexto — pipeline actual que la skill busca aliviar

1. **Historia clínica online** (ConsultorioMovil, SaaS de terceros): antecedentes, motivo de
   consulta, diagnóstico presuntivo.
2. **Evaluación en papel** (`evaluacion.pdf`): batería de tests (MMSE, memoria lógica Signoret,
   dígitos, TMT, Stroop, reloj, memoria seriada, fluencias, Boston, IFS, K-10) tomada en vivo con el
   paciente.
3. **Excel de fórmulas** (`formulasExcelEvaluacion.xlsx`, hoja `TABLA DE FORMULAS`): se cargan los
   Puntajes Brutos (PB) y el Excel calcula el Puntaje Z vía `VLOOKUP` contra tablas de normas por
   edad/nivel educativo.
4. **Dos Excel de gráficos** (`excelPrimerGrafico.xlsx`, `excelSegundoGrafico.xlsx`): se copian a
   mano los valores Z ya calculados para alimentar los gráficos embebidos en el Word.
5. **Informe final** (`informeFinal.docx`): tabla de paciente + tabla "SÍNTESIS DEL RENDIMIENTO" (PB,
   Z, X en columna de rango) cargada a mano, párrafos narrativos por función cognitiva, gráficos,
   conclusiones y sugerencias (`modeloDiagnosticoYSugerencias.docx`: 6 categorías diagnósticas según
   Z + AVD).
6. **Cierre**: conversión a PDF y envío por email.

### Qué automatiza esta opción (dentro de los niveles del brainstorm original)

- **Nivel 1 (determinístico, ya resuelto por el Excel, la skill solo transcribe):** marcar la X en
  la columna de rango correcta, poblar los dos Excel de gráficos (pass-through del Z), elegir
  categoría diagnóstica.
- **Nivel 2 (necesita LLM, con revisión humana obligatoria):** párrafos narrativos por función
  cognitiva, completar los "(…)" de conclusiones. Siempre "borrador para revisión", nunca auto-envío.
- **Fuera de alcance de esta opción (Nivel 3):** toma de la evaluación en vivo, carga en la historia
  clínica de terceros, juicio clínico final del profesional, generación automática del `.docx` final
  (los gráficos embebidos son objetos OLE — riesgo de corromperlos con generación por código).

---

## 2. Qué recibe la skill

- **Un único Excel "unificado"**: ya llegó, es `excelEvaluacionCompleto.xlsx` — evolución de
  `formulasExcelEvaluacion.xlsx`, misma hoja `TABLA DE FORMULAS`, con el cuadro de fórmulas original
  intacto y los bloques nuevos agregados debajo. Esquema celda por celda en
  `informe-neurocognitivo/mapeo-excel-a-word.md` §1. Lo que agregó respecto del Excel viejo (que
  terminaba en la fila 22):
  - Las **36 filas** de la tabla de síntesis, incluidos los 10 subpuntajes del IFS, TRO x2, MMSE
    copia, Comprensión, Expresión (`D25:D44`) y los 3 ensayos BEM-MS AS1/AS2/AS3 (`K14:K16`).
  - **AVD total** (`D27`) y su interpretación (`E27`).
  - **K-10 total** (`D28`) y su interpretación (`E28`).
  - **Bloque demográfico** (`C46:C51`) — resuelto: los datos ya no dependen de los jpegs de la
    historia clínica. Los campos reales son paciente, edad, fecha de nacimiento, nivel educativo,
    lateralidad y fecha de evaluación. **No hay DNI ni ocupación** (la tabla del Word tampoco los
    tiene).
  - **Notas de anamnesis** (`B56:B64`) — no estaba pedido y resultó clave: es la única fuente del
    bloque `MOTIVO DE CONSULTA Y ANTECEDENTES` del Word.

  **Todavía falta** (detalle y arreglos propuestos en §9): los 10 ítems del K-10 por separado, el
  flag manual "Riesgo de evolución" (Sí/No), y el C-QSM. Además `D31` vino corrompida por
  autoconversión a fecha.
- Los 6 templates + regla de decisión de `modeloDiagnosticoYSugerencias.docx` (ver §7 — ya extraída
  completa, no hace falta digitalizar de nuevo).
- `informeFinal.docx` (ejemplo con **datos ficticios**, confirmado) como referencia de estilo/tono.
- Instrucción explícita de **no** recalcular PB/Z (eso ya lo hizo el Excel) y **no** inferir "riesgo
  de evolución" por su cuenta — es un flag que llega ya decidido por el profesional.

---

## 3. Qué devuelve la skill en el chat (11 bloques, listos para copy/paste)

Antes eran 7. Leer `informeFinal2.docx` completo mostró que faltaban cuatro partes del informe que
nadie había inventariado: la anamnesis, la sección de screening, las líneas de impresión diagnóstica
por área y el reporte de faltantes. Mapeo completo en `informe-neurocognitivo/mapeo-excel-a-word.md`
§2.

1. **Tabla de datos del paciente** — pass-through de `C46:C51`, con las fechas convertidas de serial
   de Excel a `dd/mm/aaaa`.
2. **`MOTIVO DE CONSULTA Y ANTECEDENTES`** — redacción de las viñetas de `B56:B64` a prosa.
   ⚠️ **Bloque de mayor riesgo del pipeline**: la transformación observada no es fiel (el Excel dice
   `"cierto estrés cerebral y financiero"` y el Word `"con poco estrés o sobrecarga
   laboral/finaciera"`, cambiando el contenido de una comilla presentada como textual del paciente).
   Ver §5bis.
3. **Filas de la tabla "SÍNTESIS DEL RENDIMIENTO"** (PB, Z, y la X en la columna de rango) — formato
   exacto y los tres patrones de llenado en §5.
4. **Valores del gráfico 1** (14 valores Z, **punto** decimal) — ya redondeados y capados, ver §7.
5. **Valores del gráfico 2** (10 ítems del K-10) — **hoy imposible de generar**: el Excel sólo trae
   el total. La skill debe decirlo, no inventar un desglose que sume el total.
6. **Sección de screening** — esqueleto casi fijo con los puntajes de `D25`/`D26`/`D30` intercalados
   en el formato `(MMSE=30/30; TRO= 9,5/10; INECO=26,5/30)`. El Word lo llama **INECO**; el Excel,
   IFS Total.
7. **Párrafos narrativos por función cognitiva** (4 secciones), cada uno precedido por la línea
   `Impresión diagnóstica del área: rendimiento cognitivo <calificación>`. ⚠️ Los dos informes dicen
   `del área` en las dos primeras secciones y `por área` en las dos últimas: es una inconsistencia de
   la plantilla, **se reproduce tal cual**.
8. **Párrafo de recap de conclusiones** — área por área, en orden inverso al de la tabla.
9. **Frase de cierre** — del template de la categoría elegida, **adaptada** al perfil real.
10. **Categoría diagnóstica** (1 de 6, regla en §6) **+ viñetas de sugerencias** del template, con la
    localización específica del paciente en la viñeta de hábitos.
11. **Reporte de faltantes y dudas** — bloque final, no se pega en el Word: faltantes detectados en
    el Excel, celdas sospechosas y todo lo marcado como dudoso.

**Corrección respecto de la versión anterior de este plan**, que decía que las sugerencias se
devuelven "tal cual — sin redactar sugerencias propias": los dos informes muestran
**template + localización del paciente** de forma consistente (ver §6).

El profesional pega cada bloque en su lugar y revisa/edita antes de cerrar el informe — **nunca se
genera el `.docx` final automáticamente**, porque los gráficos embebidos de Word son objetos OLE que
una herramienta de generación de archivos (python-docx u otra) no puede editar de forma confiable sin
riesgo de corromperlos. Tampoco se auto-envía nada al paciente.

---

## 4. Cómo se arma y se usa la skill (confirmado)

Es una **carpeta**, no un único archivo markdown. Ya existe en `clinicTransformation/informe-neurocognitivo/`:

```
informe-neurocognitivo/
├── SKILL.md                       ← instrucciones: qué recibe (schema real del Excel), los 11
│                                     bloques de salida, reglas de formato, prohibiciones
├── mapeo-excel-a-word.md          ← esquema del Excel celda por celda + de dónde sale cada bloque
│                                     del Word, con la clasificación fijo/pass/deriv/LLM
├── regla-diagnostica.md           ← las 6 categorías + sugerencias completas + cortes K-10/AVD
├── orden-categorias-graficos.md   ← los dos gráficos: orden, redondeo/cap, celdas destino
├── orden-filas-sintesis.md        ← las 36 filas: celda de origen, patrones de llenado, paste
├── excel-unificado-spec.md        ← estado del Excel entregado y ajustes propuestos (ver §9)
└── ejemplo-informeFinal.docx      ← referencia de tono/estilo
```

El Excel unificado con los datos del paciente **no** va dentro de la skill — es el input que se
adjunta en el chat cada vez que se pide un informe.

**Funciona igual desde Claude Desktop y Claude Web (no es exclusivo de Claude Code/VS Code):**

1. Comprimir la carpeta en un `.zip` (debe contener el `SKILL.md` adentro).
2. En Claude.ai: **Settings → Capabilities → Skills** (sección "Customize"), habilitar **code
   execution**, y subir el `.zip`.
3. Requiere plan **Pro, Max, Team o Enterprise** (no disponible en el plan free).
4. Una vez subida y habilitada, Claude la detecta sola cuando el pedido calza con lo descripto en
   `SKILL.md` — no hace falta invocarla con un comando especial. Alcanza con adjuntar el Excel del
   paciente en el chat.

**Gotcha técnico a documentar/recordar:** guardar el Excel en Excel (no solo cerrarlo, ni editarlo
con otro programa) antes de subirlo. La skill lee el `.xlsx` con código y necesita los valores ya
calculados de las fórmulas (VLOOKUP), que Excel cachea solo al guardar — si se sube sin guardar, esas
celdas pueden leerse vacías.

---

## 5. Detalle de la tabla "SÍNTESIS DEL RENDIMIENTO" (confirmado leyendo los dos `.docx` reales)

> Verificado en `informeFinal.docx` **e** `informeFinal2.docx`. Las dos plantillas son
> **estructuralmente idénticas** (mismas 36 filas, mismo orden, mismos conteos de celda), así que
> esto es la plantilla y no un caso particular. Fuente de verdad operativa:
> `informe-neurocognitivo/orden-filas-sintesis.md`, que ahora incluye la celda de origen en el Excel
> para cada una de las 36 filas.

### ⚠️ Tres correcciones respecto de la versión anterior de este plan

**1. El texto cualitativo va en PB, no en Z.** Se creía que las filas sin Z numérico llevaban la
interpretación en la columna Z. En 32 de las 34 filas cualitativas **no es así**: el valor va en
**PB** y Z queda vacía (`[MMSE][30/30][]`, `[Comprensión][Normal][]`, `[IFS SM][3 normal][]`). Las
**únicas dos excepciones** son AVD y KPDS-10, que ponen el número en PB y la palabra en una celda Z
con `gridSpan=2`.

Los tres patrones reales:

| Patrón | Filas | PB | Z | X |
|---|---|---|---|---|
| Con Z | 5–9, 23–32 (15) | número | número a 2 decimales o cap | **1 X** |
| Cualitativa simple | 1–2, 10–22, 33–36 (19) | el texto entero | **vacía** | ninguna |
| AVD y KPDS-10 | 3–4 (2) | número | la palabra (`Autónomo`, `Normal`) | ninguna |

**2. No hay trazado diagonal en ninguna de las dos plantillas.** La búsqueda de `w:tl2br`/`w:tr2bl`
da **cero resultados**. El efecto se logra con relleno gris (`D9D9D9`) sobre Z + las 8 celdas de
rango. La leyenda al pie **sigue diciendo** "las áreas con trazado diagonal indican que el puntaje no
lleva puntaje Z": es una inconsistencia de la plantilla que quedó de una versión anterior.
**Reproducirla tal cual, no "corregirla".**

**3. La causa del desalineamiento del paste eran sólo 2 filas, no todas las cualitativas.** Una nota
anterior registraba que el paste único había fallado en Word y atribuía la causa a que las 8 columnas
de rango estaban "fusionadas en un solo bloque gris" en las filas cualitativas, dejándolas con ~3
celdas reales. El XML de los dos informes **desmiente esa explicación**: las filas cualitativas
tienen las 8 celdas de rango separadas, igual que las filas con Z. Los conteos reales son:

| Filas | Celdas reales (`w:tc`) | Valores a pegar (sin Área ni Prueba) |
|---|---|---|
| 34 de las 36 | **12** | **10** |
| **3 (AVD) y 4 (KPDS-10)** | **11** (Z con `gridSpan=2`) | **9** |

Un bloque uniforme de 36 × 10 **no puede** funcionar, pero se desfasa **a partir de la fila 3**, no
en todas las cualitativas. Mecánica propuesta: **3 bloques** — filas 1–2 (2 × 10) · **filas 3–4
aparte** (2 × 9, o a mano: son 4 celdas) · filas 5–36 (32 × 10). **Sin probar en Word todavía**: lo
confirmado es la causa, no que este esquema pegue bien.

### Cap de Z fuera de ±3 — confirmado en los archivos reales

- `Z ≥ +3` → **`≥3`** — FF en `informeFinal.docx`, X en `> +3`.
- `Z ≤ −3` → **`≤-3`** — BEM–MS Sem en `informeFinal2.docx` (Z crudo −3,1068), X en `< - 3`.

Los dos extremos aparecen, uno en cada informe, así que la regla es de dos lados y **ya no es una
convención "definida por lógica"**: está observada. (La versión anterior de este plan la describía
como una particularidad de FF.)

### Redondeo

El Z va **siempre a 2 decimales con coma, incluyendo el cero final**: `-0.29629…` → **`-0,30`**;
`-0.8994…` → **`-0,90`**.

### Detalle original de la tabla

Tabla con columnas **Área | Prueba | PB | Z** + 8 columnas de rango agrupadas en 4 categorías
(Deterioro significativo: `<-3`, `-3 a -2` · Puntajes bajos: `-2 a -1` · Puntajes promedio: `-1 a 0`,
`0 a +1` · Puntajes superiores: `+1 a +2`, `+2 a +3`, `>+3`), donde se marca una X en la columna que
corresponde al Z de esa fila. Algunas filas no tienen Z (interpretación cualitativa: "Normal",
"Autónomo", etc.) — ~~y en la plantilla esas celdas de rango tienen trazado diagonal en vez de X~~
**(falso: no hay trazado diagonal en ninguna plantilla; esas celdas van con relleno gris `D9D9D9`, y
el texto cualitativo va en PB, no en Z — ver las correcciones al inicio de esta sección).**

**A diferencia de los Excel de gráficos, una celda de tabla de Word acepta cualquier texto sin
problema de parseo numérico** — el separador decimal no es un tema acá (se usa **coma**: `1,14`).

**Área y Prueba son fijas** (misma batería, mismo orden, en todos los informes) — la skill no toca
esas dos columnas, solo genera PB / Z / columna-X por fila.

### Las 36 filas exactas, en orden (extraídas del XML real de `informeFinal.docx`)

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
| 9 | | FF | Con Z, capada | Z se expresa como "≥3" — duplicada, ver fila 30 |
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
| 36 | | MMSE copia | Cualitativa (sin Z) | nombre distinto de "MMSE" (fila 1), no colisiona |

No incluye: fila de encabezado agrupado (categorías de rango), fila de encabezado de columnas, ni la
fila de leyenda al pie de la tabla.

**Filas duplicadas por nombre — implicancia de diseño:** TRO (filas 2 y 35) y FF (filas 9 y 30)
aparecen dos veces con el mismo nombre (FF con el mismo PB/Z en ambas). MMSE **no** colisiona en
sentido estricto porque la segunda aparición se llama "MMSE copia". → Cualquier estructura de datos
para esta tabla (Excel unificado incluido) debe ser **posicional (índice de fila), nunca un
diccionario `prueba → valor`** — un lookup por nombre colisiona en TRO y FF.

### Cómo se pega en Word — 3 bloques (⚠️ sin testear en Word todavía)

Se excluyen Área y Prueba del bloque (son fijas y Área tiene celdas verticalmente combinadas).
Parado en la celda **PB** de la primera fila de cada bloque, `Pegado especial → Texto sin formato`:

| Bloque | Filas | Forma | Contenido |
|---|---|---|---|
| 1 | 1–2 (MMSE, TRO) | 2 × 10 | PB, Z vacía, 8 vacías |
| 2 | **3–4 (AVD, KPDS-10)** | 2 × **9** | PB, Z con la palabra, 7 vacías |
| 3 | 5–36 (DD → MMSE copia) | 32 × 10 | PB, Z (número/cap/vacía), 8 columnas con la X donde va |

El bloque 3 cubre de un saque las 15 filas con Z y las 17 cualitativas intercaladas, porque todas
tienen 12 celdas reales. Las filas 3 y 4 son las **únicas** que necesitan trato aparte.

**Estado:** la **causa** del problema está confirmada por los conteos de celda del XML de los dos
informes (ver corrección 3 arriba), y queda descartado el bloque único de 36 × 10. Que este esquema
de 3 bloques efectivamente pegue bien **requiere abrir Word** — no se valida por código. Riesgo
secundario: que los tabs no sobrevivan al copiar desde el chat; si pasa, escribir los bloques en un
`.txt` con tabs reales. Si tampoco funciona, el camino alternativo sigue siendo completar el `.docx`
con `python-docx` (dejando los gráficos OLE intactos) y que el profesional pegue a mano sólo los 2
datasets de los gráficos.

---

## 5bis. La anamnesis — el bloque nuevo de mayor riesgo

`informeFinal2.docx` reveló un bloque que el plan no tenía inventariado: `MOTIVO DE CONSULTA Y
ANTECEDENTES`. Su fuente son las notas crudas de la entrevista en `B56:B64` del Excel, y el Word
tiene prosa en tercera persona y presente, una viñeta ≈ un párrafo, mismo orden, con las citas
textuales conservadas entre comillas.

La transformación es sistemática **pero no es fiel**:

| `B63` (Excel) | Word |
|---|---|
| `- Animicamente: "bárbaro", "cierto estrés cerebral y financiero".` | `Anímicamente, se encuentra bien, "con poco estrés o sobrecarga laboral/finaciera".` |

El Excel dice *"cierto estrés"* y el Word *"poco estrés"*, cambiando el contenido de una comilla que
se presenta como textual del paciente. Además, dos viñetas se **omitieron** por completo en el Word
(`B56` = `- PROTOCOLO XTEND`, nota interna; y `B57`, el antecedente de madre con EA).

Sea criterio clínico o error de tipeo, la conclusión operativa es la misma: **la skill transcribe lo
que dice la nota, no la reinterpreta**; incluye todo y **marca lo dudoso** en vez de decidir sola qué
omitir; y el bloque se entrega siempre como borrador para revisión frase por frase. Convenciones de
redacción observadas (formas fijas del primer y último párrafo, verbos de reporte, concordancia de
género) en `informe-neurocognitivo/mapeo-excel-a-word.md` §3.

Detalle aparte: `B58` está **truncada dentro del propio Excel**
(`- QSM: olvida cosas puntuales (fue a un partido y por ahi `, paréntesis sin cerrar). Verificado en
la cadena compartida del `.xlsx`: no es un problema de lectura.

---

## 6. Regla diagnóstica completa (extraída de `modeloDiagnosticoYSugerencias.docx`)

### Cortes de referencia

- **K-10 (sintomatología anímica):** suma de los 10 ítems ≥ **25** ⇒ "sintomatología anímica
  relevante" presente. (No 24,5: el K-10 es suma de 10 enteros, un resultado exacto de 24,5 es
  imposible — 25 es el mismo corte sin la falsa precisión decimal.) **Se deriva del K-10 por
  default; el profesional puede sobrescribirlo manualmente en el Excel.** No hace falta un flag
  manual aparte de "sintomatología anímica" — era redundante con el corte de K-10.
- **AVD (actividades de vida diaria):**

  | Puntaje | Interpretación | Categoría |
  |--------:|----------------|-----------|
  | 0–1 | Dependencia total | Comprometidas |
  | 2–3 | Dependencia severa | Comprometidas |
  | 4–5 | Dependencia moderada | Comprometidas |
  | 6–7 | Dependencia leve | Conservadas |
  | 8 | Independencia | Conservadas |

  Corte 0–5 = comprometidas / 6–8 = conservadas: es criterio diagnóstico del profesional (la escala
  original no distingue conservadas/comprometidas).
- **Riesgo de evolución:** flag 100% manual, criterio clínico/observación en vivo durante la
  entrevista (ojo clínico, intuición) — no se deriva de ningún puntaje ni combinación de
  pruebas/DCL. La skill **nunca** debe intentar inferirlo, llega ya decidido en el Excel.

### Las 6 categorías

| Categoría | Regla |
| --- | --- |
| Rendimiento dentro de parámetros normales | Z > -1 + AVD conservadas |
| Rendimiento normal con fallas aisladas | Z entre -1 y -1,5 en pruebas aisladas + AVD conservadas |
| DCL clásico (sin alertas) | Z < -1,5 + AVD conservadas |
| DCL con compromiso anímico relevante | Z < -1,5 + AVD conservadas + sintomatología anímica |
| DCL con mayor riesgo de evolución | Z < -1,5 + AVD conservadas + perfil de riesgo de evolución |
| Deterioro cognitivo mayor | Z < -1,5 + AVD comprometidas |

#### 1. Rendimiento dentro de parámetros normales

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en las áreas
> evaluadas, acorde a su edad y nivel educativo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico según evolución
- Promover hábitos de vida saludables
- Reevaluación en caso de cambios clínicos o persistencia de quejas

#### 2. Rendimiento dentro de parámetros normales con fallas aisladas

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en la mayoría de las
> áreas evaluadas, acorde a su edad y nivel educativo. Se observaron fallas atencionales/ejecutivas
> aisladas que, a la fecha, no impresionarían configurar un perfil cognitivo significativo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico según evolución
- Promover hábitos de vida saludables
- Reevaluación en caso de cambios clínicos o persistencia de quejas

#### 3. DCL clásico (sin alertas especiales)

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en (…); presentó
> puntajes más bajos a los esperados en (…). Las quejas cognitivas impresionarían no interferir
> significativamente sus actividades de la vida diaria, por lo que el perfil observado resultaría
> compatible con un deterioro cognitivo leve (…).

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento por neurología y neuropsicología
- Reevaluación en 12 meses
- Sesiones de estimulación cognitiva orientadas a (…)
- Promover hábitos de vida saludables (actividad física, estimulación cognitiva, socialización)

#### 4. DCL con compromiso anímico relevante

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en (…); presentó
> puntajes más bajos a los esperados en (…). Las quejas cognitivas impresionarían no interferir
> significativamente sus actividades de la vida diaria; no obstante, se observan elementos
> compatibles con compromiso en el estado de ánimo que podrían estar incidiendo en el rendimiento
> cognitivo y deberían ser considerados en la interpretación del perfil. En este contexto, el perfil
> observado resultaría compatible con un deterioro cognitivo leve (…) en contexto de sintomatología
> anímica.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Evaluación y seguimiento por salud mental (psicología/psiquiatría)
- Reevaluación en 12 meses
- Valoración del impacto de variables emocionales sobre el funcionamiento cognitivo
- Considerar estimulación cognitiva una vez estabilizado el cuadro anímico

#### 5. DCL con mayor riesgo de evolución

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en (…); presentó
> puntajes más bajos a los esperados en (…). Las quejas cognitivas impresionarían no interferir
> significativamente sus actividades de la vida diaria, por lo que el perfil observado resultaría
> compatible con un deterioro cognitivo leve (…) de probable curso evolutivo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico estrecho por neurología y neuropsicología para monitoreo evolutivo
- Reevaluación en 6 a 12 meses
- Valoración cercana del impacto de las quejas cognitivas sobre las actividades de la vida cotidiana
- Sesiones de estimulación cognitiva orientadas a (…)

#### 6. Deterioro cognitivo mayor

> El Sr/Sra X presentó un rendimiento cognitivo descendido en (…); con compromiso significativo en
> (…). Las dificultades observadas impresionarían interferir en su funcionamiento en actividades de
> la vida diaria. En este contexto, el perfil observado resultaría compatible con un deterioro
> cognitivo mayor (…) con impacto en la autonomía.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento por neurología y neuropsicología
- Se recomienda supervisión continua por parte del entorno familiar y/o cuidadores en actividades de
  la vida diaria
- Se sugiere evitar situaciones de riesgo asociadas a la pérdida de autonomía (ej. manejo de
  vehículos, administración de medicación)
- Orientación familiar para el manejo conductual en la vida cotidiana y posibles cambios
  comportamentales
- Considerar intervenciones de estimulación cognitiva adaptadas al perfil

### ⚠️ Caso no contemplado — pendiente de confirmar

Cuando Z < -1,5 + AVD conservadas y aplican **simultáneamente** compromiso anímico relevante (K-10 ≥
25) Y riesgo de evolución (flag manual), no está definido qué categoría prevalece ("DCL con
compromiso anímico relevante" vs. "DCL con mayor riesgo de evolución") ni si el informe debe señalar
ambas. Chequeado en `opcionesAutomatizacion.md`, `clinicTransformationGuide.md` y el texto completo
de `modeloDiagnosticoYSugerencias.docx` — no aparece en ningún lado. Confirmar con el profesional.

### Regla de desempate en los rangos de la tabla de síntesis — pendiente de confirmar

Las 8 columnas de rango tienen bordes que se solapan (`-2 a -1` y `-1 a 0` ambos tocan el -1).
Propuesta a confirmar: **límite inferior inclusive, límite superior exclusivo** (Z = -1,0 exacto →
cae en "-1 a 0", no en "-2 a -1").

---

## 7. Orden de categorías — Excel de gráficos (leído directamente de los `.xlsx`)

**Formato numérico: punto decimal** (`-1.32`, no `-1,32`) — a diferencia del bloque de la tabla de
síntesis (que usa coma), acá Excel necesita reconocer el valor como número.

### `excelPrimerGrafico.xlsx` (columna Prueba → Z) — 14 valores, en este orden

DD, DI, TMT A, TMT B, BEM–MS AST, BEM–MS RSE, BEM–MS Sem, BEM–MS Rec, BEM–MS CE, BEM–ML Inm, BEM–ML
Dif, FF, FS, TBA.

Nota: no todas las pruebas de la batería se grafican (MMSE, Stroop, Test del Reloj e IFS no aparecen
acá).

### ⚠️ Corrección: los valores van redondeados y capados, no crudos

Este plan asumía pass-through del Z crudo. La hoja de datos **realmente embebida** en
`informeFinal2.docx` guarda los mismos valores de display que la tabla de síntesis:

| Prueba | Z crudo en el Excel | En el gráfico |
|---|---|---|
| DD | `0.4482758620689658` | `0.45` |
| BEM–MS AST | `-0.89944134078212257` | `-0.9` |
| FS | `-0.29629629629629656` | `-0.3` |
| **BEM–MS Sem** | `-3.1067961165048534` | **`-3`** (cap) |

Regla: **redondear a 2 decimales y capar en ±3**, igual que en la tabla. Única diferencia de formato:
acá es un número, así que el cero final se cae (`-0.3`, no `-0,30`) y el cap es el número `-3`/`3`, no
el texto `≤-3`/`≥3`. → **Los 14 valores se derivan del mismo cálculo que la columna Z de la tabla**;
no hay una segunda regla de redondeo que mantener.

### ⚠️ La columna de destino cambia según el archivo

| Fuente | Etiquetas | Valores | Encabezado de serie |
|---|---|---|---|
| `excelPrimerGrafico.xlsx` (suelto) | `A2:A15` | **`B2:B15`** | `B1` |
| Hoja embebida en `informeFinal2.docx` | `B2:B15` | **`C2:C15`** | `C1` |

No hardcodear celdas destino. La instrucción robusta es **posicional**: pegar los 14 valores
empezando en la celda inmediatamente **debajo del encabezado de la serie** (la que contiene el año,
`2026`), a la derecha de la columna de nombres de prueba. Queda **por confirmar** si la columna `A`
vacía de la hoja embebida es un desplazamiento accidental o si `A`/`B` se reservan para una
evaluación anterior (el gráfico soportaría comparación longitudinal).

### `excelSegundoGrafico.xlsx` (columna Sintomatología → Puntaje) — 10 valores, en este orden

Coincide con el orden 1–10 del cuestionario K-10 en papel: Cansancio, Nervios, Nervios+,
Desesperanza, Inquietud, Inquietud+, Depresión, Esfuerzo, Tristeza, Inutilidad. Layout **idéntico en
los dos archivos**: etiquetas `A2:A11`, valores `B2:B11`. Enteros, sin decimales ni cap.

⚠️ **Estos 10 valores hoy NO salen del Excel**: `excelEvaluacionCompleto.xlsx` guarda sólo el total
(`D28` = `15`). Los del informe (`2, 4, 1, 1, 2, 1, 1, 1, 1, 1`, que suman 15) se transcriben del
papel. Arreglo propuesto en §9.

---

## 8. Aclaración de referencia (error de tipeo corregido)

Donde `clinicTransformationGuide.md` dice "el archivo de `evaluacion.pdf` ya viene con un texto
sobre cómo rindió que se usa de modelo" debería decir **`informeFinal.docx`**. Ese es el archivo que
se usa como referencia de tono/estilo para redactar los párrafos por función cognitiva de cada
paciente nuevo.

⚠️ **`informeFinal2.docx` NO tiene datos ficticios** — es un paciente real, igual que
`excelEvaluacionCompleto.xlsx` (ver la nota de datos sensibles en §11). Es la mejor referencia de tono
disponible, porque es el único informe del que además se tiene el Excel de entrada, pero **hay que
anonimizarlo antes de subirlo dentro del paquete de la skill**.

---

## 9. Excel unificado — estado del archivo entregado y ajustes propuestos

> Esta sección era una spec "a mandar". El Excel **ya llegó** (`excelEvaluacionCompleto.xlsx`), así
> que pasó a ser la revisión del archivo real. Detalle completo, con el "cómo" de cada arreglo, en
> `informe-neurocognitivo/excel-unificado-spec.md`.

### Veredicto

El archivo es un salto grande y está claro para quien lo completa: mantiene el cuadro de fórmulas
original intacto y agrega los bloques nuevos debajo con la misma lógica visual. Cubrió las 36 filas
de la tabla de síntesis, el bloque demográfico, la interpretación de AVD y K-10, y — sin que estuviera
pedido — las notas de anamnesis.

**Pero todavía no alcanza para generar la evaluación final sin otros archivos.** Tres faltantes
bloquean bloques concretos del informe, y una celda vino con datos perdidos.

### Ajustes bloqueantes, por costo/beneficio

1. **Formatear como texto las celdas `X/Y` (⚠️ hoy hay datos perdidos).** `D31` (IFS Índice MT)
   guarda `46302` con formato de fecha = **07/10/2026**: se tipeó `7/10` y Excel lo convirtió. **El
   valor original ya no está en el archivo** (se sabe que era `7/10` sólo por haber leído el Word).
   Es lo más urgente porque **falla en silencio**. Arreglo: dar formato **Texto** a `D25:D44`, una
   vez. Costo en claridad: **ninguno** — de hecho hoy `D31` muestra una fecha donde debería haber un
   puntaje.
2. **Desglosar el K-10 en sus 10 ítems** (orden de §7), y que `D28` pase a ser `=SUMA(...)`. Sin
   esto, el gráfico 2 **no se puede generar** desde el Excel. Costo en claridad: **positivo** — hoy
   esos 10 valores se transcriben del papel directo al Word.
3. **Agregar el flag "Riesgo de evolución" (Sí/No)**, con validación de lista. Sin esto la
   **categoría 5** de §6 es inalcanzable. Una celda.
4. **Agregar el C-QSM.** Figura en `PRUEBAS ADMINISTRADAS` y se usa en la narrativa de screening,
   pero no tiene ninguna celda. Es el único test administrado sin lugar en el archivo. **A confirmar**
   si además debe ser fila de la tabla de síntesis (hoy no lo es).
5. **Unificar los dos bloques demográficos.** Edad y nivel educativo están cargados dos veces y **ya
   divergieron**: `C5` = `Terciario`, `C49` = `Terciario ` (espacio final). `C4` es lo que decide
   contra qué norma de edad se compara **todo** el informe. Arreglo: `C47` → `=C4 & " años"`,
   `C49` → `=C5`. Costo en claridad: **positivo**, un campo menos por paciente. (Ídem `C3`, hoy
   vacía, con el nombre real en `C46`.)

### Ajustes opcionales

- Rótulos de área en los bloques cualitativos (hoy sólo el cuadro con Z los tiene). No bloquea: el
  orden de las 36 filas es fijo y posicional.
- Separador decimal de los textos `X/Y` (`26,5/30` vs `9.5/10`): **cosmético, prioridad baja**. Son
  cadenas de texto que se copian tal cual, no se parsean como número. **Hacer el punto 1 antes de
  tocar el formato de estas celdas** — cambiarlo sin eso es lo que corrompió `D31`.

### Lo que expresamente NO conviene hacer

- **No agregar las 8 columnas de rango al Excel**: se derivan del Z de forma determinística (§5).
- **No hacer una hoja paralela "para la IA"**: duplica el mantenimiento del profesional y crea una
  segunda fuente que puede divergir — el mismo problema del punto 5, a mayor escala.
- **No mover las 15 filas del cuadro de fórmulas** (`C8:H22`): están referenciadas por las fórmulas.
- **No agregar DNI ni ocupación**: la tabla del Word no los tiene en ninguno de los dos informes.

### Recordatorio operativo

Guardar el archivo en Excel antes de mandarlo (ver gotcha en §4).

---

## 10. Pros y contras de esta opción

- **Pros:** esfuerzo mínimo, funciona con cualquier LLM, no toca infraestructura, iteración rápida
  del tono de los párrafos, resuelve también la transcripción a los dos gráficos (no solo el texto).
- **Contras:** sigue siendo manual por paciente (pegar cada bloque en su lugar), sin historial ni
  persistencia, calidad 100% dependiente del prompt.

---

## 11. Estado consolidado — qué está confirmado y qué falta

### Confirmado

- [x] Corte de K-10 → ≥ 25 = sintomatología anímica relevante (ajustado de 24,5, ver §6).
- [x] Corte de AVD → 0–5 = comprometidas, 6–8 = conservadas.
- [x] "Riesgo de evolución" es puro criterio clínico manual, la skill nunca lo infiere.
- [x] Orden/nombres de categorías de ambos Excel de gráficos, leído directo de los `.xlsx` (§7).
- [x] `informeFinal.docx` es el archivo de referencia de tono (no `evaluacion.pdf`) y tiene datos
      ficticios (§8).
- [x] Separador decimal: coma en la tabla de síntesis de Word, punto en los Excel de gráficos.
- [x] "Sintomatología anímica relevante" ya no es un flag manual aparte — se deriva del K-10 por
      default, con opción de sobrescribirlo.
- [x] La tabla de síntesis tiene exactamente 36 filas de datos, orden confirmado, duplicados TRO/FF
      identificados (§5).
- [x] Gotcha de guardar el Excel antes de subirlo, documentado en `SKILL.md`.
- [x] **El Excel unificado llegó** (`excelEvaluacionCompleto.xlsx`) y su esquema está mapeado celda
      por celda (`informe-neurocognitivo/mapeo-excel-a-word.md` §1).
- [x] **Datos demográficos resueltos:** están en el Excel, en `C46:C51`. Los campos reales son
      paciente, edad, fecha de nacimiento, nivel educativo, lateralidad y fecha de evaluación —
      **no** hay DNI ni ocupación, y la tabla del Word tampoco los tiene.
- [x] **Mapeo completo Excel → Word**, bloque por bloque, con la clasificación
      fijo/pass-through/derivado/LLM (`mapeo-excel-a-word.md` §2).
- [x] **Cap de ±3 confirmado en los dos lados** por archivos reales: `≥3` (FF en `informeFinal.docx`)
      y `≤-3` (BEM–MS Sem en `informeFinal2.docx`). Ya no es una convención supuesta (§5).
- [x] **Los gráficos usan los valores redondeados y capados**, no el Z crudo (§7).
- [x] **La plantilla no tiene trazado diagonal** y el texto cualitativo va en **PB**, no en Z (§5).
- [x] **Causa del desalineamiento del paste identificada:** son sólo 2 filas de 11 celdas (AVD y
      KPDS-10), no todas las cualitativas (§5).
- [x] **Los templates de sugerencias se adaptan al paciente** — confirmado en los dos informes (§6).

### Pendiente

- [ ] 🚩 **Definir el criterio de "fallas aisladas vs. perfil" de la regla diagnóstica** — aplicada
      literalmente da categoría 3 donde el profesional eligió la 2. Es el único punto donde la lógica
      documentada da un resultado clínicamente distinto del suyo, y no se resuelve agregando celdas
      al Excel (`preguntasParaLaProfesional.md` §A.0).
- [ ] **Aplicar los 5 ajustes bloqueantes al Excel** (§9): formato texto en `D25:D44`, 10 ítems del
      K-10, flag de riesgo de evolución, C-QSM, unificar bloques demográficos.
- [ ] **Recuperar el valor real de `D31`** (IFS Índice MT) del paciente actual — está perdido en el
      Excel; en el Word figura `7/10`.
- [ ] Confirmar regla de desempate en los rangos de la tabla de síntesis (§6, límite
      inclusive/exclusive). **Los dos informes no lo resuelven**: ningún Z cae en un límite exacto
      (el caso más cercano, CE con −2,01 → `-3 a -2`, es consistente con la propuesta pero no la
      prueba).
- [ ] Confirmar prioridad entre categorías cuando compromiso anímico y riesgo de evolución aplican
      simultáneamente (§6). `informeFinal2` es categoría 2, no toca el caso.
- [ ] **Probar en Word real el paste en 3 bloques** de la tabla de síntesis con datos ficticios
      (§5). La causa del fallo anterior ya está identificada y el bloque único de 36 × 10 está
      descartado, pero que el esquema de 3 bloques pegue bien requiere abrir la app. Decide si el
      copy/paste alcanza o si hace falta `python-docx` como camino primario para esa tabla.
- [ ] Confirmar el **léxico Z → palabra** de los párrafos narrativos (`alto` / `conservado` / `bajo
      no deficitario` / `deficitario`): hoy está **inferido** de los dos informes, no entregado
      (`mapeo-excel-a-word.md` §4.2).
- [ ] Confirmar si la columna `A` vacía de la hoja de gráfico embebida es accidental o si se reserva
      para una evaluación anterior (§7).
- [ ] **Anonimizar `informeFinal2.docx` antes de usarlo como `ejemplo-informeFinal.docx`** en el
      paquete de la skill — ver la nota de datos sensibles abajo.

### ⚠️ Datos sensibles

`excelEvaluacionCompleto.xlsx` e `informeFinal2.docx` son de un **paciente real**: nombre y apellido,
fecha de nacimiento, nivel educativo, lateralidad, antecedente familiar de Alzheimer, notas de sueño
y ánimo, y citas textuales de la entrevista. (Los ejemplos anteriores del plan se habían confirmado
como ficticios; **estos dos no lo son**.)

Dos perfiles de riesgo distintos, que conviene no mezclar:

- **El Excel de entrada** inevitablemente lleva datos reales — es el archivo de trabajo del
  profesional y se adjunta por paciente en el chat. Es el flujo, y es decisión del profesional.
- **El paquete de la skill** no necesita llevarlos. Lo que se sube a claude.ai queda publicado ahí de
  forma persistente. `informeFinal2` es la mejor referencia de tono disponible, pero conviene subir
  una **copia anonimizada** (nombre, fecha de nacimiento y anamnesis ficticios), dejando estructura y
  tono intactos — que es lo único que la skill necesita de ese archivo.

---

## 12. Preguntas para la profesional

Todo lo que quedó sin confirmar está consolidado en **`preguntasParaLaProfesional.md`**, redactado
para llevar a una sola conversación (con el hallazgo que motiva cada pregunta, así no hay que
reexplicar el contexto). Resumen de los bloques:

| Bloque | Contenido | Por qué importa |
|---|---|---|
| **A. Bloqueantes** (5) | 10 ítems del K-10 · flag de riesgo de evolución · valor real de `D31` · cómo se registra el C-QSM · si el PB de AST se trunca o se redondea | Sin esto hay partes del informe que **no se pueden generar** |
| **B. Libertad de redacción** (7) | ⚠️ la reformulación de la anamnesis · qué se omite de ella · léxico Z → palabra · cuánto se adapta el template de sugerencias · desempate en los límites de rango · prioridad entre categorías · sobrescribir el corte de K-10 | Definen **qué puede decidir la skill sola** |
| **C. Plantilla de Word** (6) | leyenda que menciona un trazado diagonal inexistente · `del área`/`por área` · campo `Deriva:` · `INECO` vs `IFS Total` · separador decimal del TRO · si PRUEBAS ADMINISTRADAS es lista fija | Detalles a mantener o corregir — hoy se reproducen tal cual |
| **D. Housekeeping** (4) | ejemplo anonimizado para el paquete · hojas `Stroop`/`MMSE`/`Puntajes Equivalentes` y si el Stroop se sigue tomando · nota truncada de `B58` · columna vacía de la hoja del gráfico | No bloquean, pero conviene resolverlos antes de cerrar la skill |

**Las de mayor impacto**, si el tiempo alcanza sólo para unas pocas:

0. 🚩 **A.0 — la regla diagnóstica no reproduce su propia decisión.** Aplicada al paciente de
   `informeFinal2` da categoría 3 (DCL clásico) donde el informe real usó la 2 (normal con fallas
   aisladas). Falta la noción de "cuántas pruebas bajas configuran un perfil". **Es el único punto
   donde la lógica documentada da un resultado clínicamente distinto del suyo**, y no se arregla
   agregando celdas al Excel.
1. **A.1 — los 10 ítems del K-10**: es lo único que hace que un bloque entero del informe (el gráfico
   K-10) siga dependiendo del papel.
2. **B.1 — la reformulación de la anamnesis**: el Excel dice `"cierto estrés"` y el informe
   `"poco estrés"`, dentro de una comilla presentada como textual del paciente. La respuesta define
   la regla del bloque donde un error de la IA sería más difícil de detectar leyendo el informe
   final.

---

## 13. Relación con la Opción 2 y el camino híbrido

Arrancar con esta opción ahora (valor inmediato, cero infraestructura) mientras se diseña la Opción 2
(`clinic-report-services` + `clinic-report-processor`, endpoint/UI en este repo) en paralelo, usando
lo aprendido del tono/prompts de la skill como insumo directo para la generación de párrafos del
servicio real. La digitalización de las tablas de normas (`PRUEBAS`/`FLUENCIAS`) conviene hacerla una
sola vez sea cual sea el camino, porque es el activo clínico central — pero es trabajo de Opción 2,
no de esta skill (la skill nunca recalcula Z). Detalle completo de la Opción 2 en
`opcionesAutomatizacion.md`.
