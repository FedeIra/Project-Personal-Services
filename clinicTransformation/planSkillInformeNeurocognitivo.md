# Plan — Opción 1: Skill de informes neurocognitivos

> Documento único con todo el contenido de la Opción 1 (skill / paquete de contexto para LLM),
> consolidado desde `opcionesAutomatizacion.md` y los archivos de `informe-neurocognitivo/`. Sirve
> como referencia completa del plan sin tener que saltar entre archivos. Los archivos de
> `informe-neurocognitivo/` siguen siendo la fuente de verdad para lo que efectivamente se sube a
> claude.ai (son los que se comprimen en el `.zip`) — este documento es la foto completa del plan.

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

- **Un único Excel "unificado"**: evolución de `formulasExcelEvaluacion.xlsx` (hoja
  `TABLA DE FORMULAS`) que además de los PB/Z ya calculados incorpora los datos que hoy solo viven en
  el papel:
  - AVD total (checklist de actividades de vida diaria, página 1 de `evaluacion.pdf`).
  - K-10 total (o desglosado en sus 10 ítems).
  - Flag manual **"Riesgo de evolución"** (Sí/No) — el único flag realmente manual/criterio clínico
    (ver §6 — "Sintomatología anímica relevante" se deriva del K-10, no hace falta un flag aparte).
  - Datos demográficos del paciente (nombre, DNI, fecha de evaluación, fecha de nacimiento, edad,
    nivel educativo, ocupación) — hoy solo en la historia clínica online (jpegs), pendiente decidir
    si se agregan al Excel o se completan a mano (ver §9, punto 2).
  - Una fila por cada una de las **36 filas** de la tabla de síntesis (no solo las 14 pruebas
    graficadas + AVD + K-10) — ver detalle completo en §5.
  - Mismo orden de pruebas que ya usan `excelPrimerGrafico.xlsx` y `excelSegundoGrafico.xlsx`.
- Los 6 templates + regla de decisión de `modeloDiagnosticoYSugerencias.docx` (ver §7 — ya extraída
  completa, no hace falta digitalizar de nuevo).
- `informeFinal.docx` (ejemplo con **datos ficticios**, confirmado) como referencia de estilo/tono.
- Instrucción explícita de **no** recalcular PB/Z (eso ya lo hizo el Excel) y **no** inferir "riesgo
  de evolución" por su cuenta — es un flag que llega ya decidido por el profesional.

---

## 3. Qué devuelve la skill en el chat (7 bloques, listos para copy/paste)

1. Tabla de datos del paciente.
2. Filas de la tabla "SÍNTESIS DEL RENDIMIENTO" (PB, Z, y la X en la columna de rango correcta) —
   ver formato exacto en §5.
3. Valores para pegar en la hoja de datos embebida de `excelPrimerGrafico.xlsx` (14 valores, mismo
   orden de categorías que el gráfico ya tiene, **punto** decimal para que Excel los reconozca como
   número).
4. Valores para pegar en la hoja de datos embebida de `excelSegundoGrafico.xlsx` (10 valores, K-10
   por síntoma, mismo formato de punto decimal).
5. Párrafos narrativos por función cognitiva.
6. Párrafo de conclusiones (completando los "(…)" con las áreas relevantes del paciente).
7. Categoría diagnóstica (1 de 6, aplicando la regla de §7) + sugerencias correspondientes del
   template, tal cual — sin redactar sugerencias propias.

El profesional pega cada bloque en su lugar y revisa/edita antes de cerrar el informe — **nunca se
genera el `.docx` final automáticamente**, porque los gráficos embebidos de Word son objetos OLE que
una herramienta de generación de archivos (python-docx u otra) no puede editar de forma confiable sin
riesgo de corromperlos. Tampoco se auto-envía nada al paciente.

---

## 4. Cómo se arma y se usa la skill (confirmado)

Es una **carpeta**, no un único archivo markdown. Ya existe en `clinicTransformation/informe-neurocognitivo/`:

```
informe-neurocognitivo/
├── SKILL.md                       ← instrucciones: qué recibe, qué debe devolver, reglas de
│                                     formato, prohibiciones (stub — falta el schema del Excel real)
├── regla-diagnostica.md           ← las 6 categorías + sugerencias completas + cortes K-10/AVD
├── orden-categorias-graficos.md   ← orden exacto de pruebas de los dos Excel de gráficos
├── orden-filas-sintesis.md        ← orden exacto de las 36 filas de la tabla de síntesis
├── excel-unificado-spec.md        ← spec para mandarle a quien arma el Excel (ver §9)
└── ejemplo-informeFinal.docx      ← referencia de tono/estilo (datos ficticios, confirmado)
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

## 5. Detalle de la tabla "SÍNTESIS DEL RENDIMIENTO" (confirmado leyendo `informeFinal.docx` real)

Tabla con columnas **Área | Prueba | PB | Z** + 8 columnas de rango agrupadas en 4 categorías
(Deterioro significativo: `<-3`, `-3 a -2` · Puntajes bajos: `-2 a -1` · Puntajes promedio: `-1 a 0`,
`0 a +1` · Puntajes superiores: `+1 a +2`, `+2 a +3`, `>+3`), donde se marca una X en la columna que
corresponde al Z de esa fila. Algunas filas no tienen Z (interpretación cualitativa: "Normal",
"Autónoma", etc.) y en la plantilla esas celdas de rango tienen trazado diagonal en vez de X.

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

### Cómo se pega en Word — mecánica de un solo paste (⚠️ no testeada aún con Word real)

El bloque de salida trae **10 valores separados por tabulación por fila** (PB, Z, y las 8 columnas de
rango — vacío en 7, "X" en la que corresponde), un salto de línea por fila, en las 36 filas en orden.
Se excluyen Área y Prueba del bloque (son fijas, ya están en la plantilla, y Área tiene celdas
combinadas que romperían el conteo de columnas si se incluyeran).

Mecánica: parado en la celda **PB de la primera fila (MMSE)**, `Pegado especial → Texto sin formato`
una sola vez — Word interpreta cada tab como "celda siguiente a la derecha" y cada salto de línea
como "bajar una fila", completando las 36 filas × 10 columnas en un solo paste. Para filas
cualitativas, el campo "Z" lleva el texto (p. ej. "Normal") y las 8 columnas de rango quedan vacías
(no se toca el trazado diagonal).

**⚠️ Riesgo técnico encontrado, sin validar todavía:** el XML de `informeFinal.docx` muestra que las
celdas de rango **no tienen el mismo patrón de fusión (`gridSpan`) en todas las filas** — filas
cualitativas como AVD/KPDS-10 tienen una celda extra fusionada respecto a filas como MMSE/TRO. Esto
pone en duda que "10 valores por tab, mismo conteo en las 36 filas" sea seguro para el paste único.
**Falta la prueba real en Word con datos ficticios antes de confiar en este mecanismo** — no se puede
validar por código, requiere abrir la app. Si falla o es inconsistente entre filas, el camino
alternativo es que Claude complete el `.docx` con `python-docx` (dejando los gráficos OLE intactos) y
el profesional solo pegue a mano los 2 datasets de los gráficos — pasaría de "variante opcional" a
"camino primario" para esta tabla.

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

Nota: no todas las pruebas de la batería se grafican (MMSE, Stroop y Test del Reloj no aparecen
acá).

### `excelSegundoGrafico.xlsx` (columna Sintomatología → Puntaje) — 10 valores, en este orden

Coincide con el orden 1–10 del cuestionario K-10 en papel: Cansancio, Nervios, Nervios+,
Desesperanza, Inquietud, Inquietud+, Depresión, Esfuerzo, Tristeza, Inutilidad.

---

## 8. Aclaración de referencia (error de tipeo corregido)

Donde `clinicTransformationGuide.md` dice "el archivo de `evaluacion.pdf` ya viene con un texto
sobre cómo rindió que se usa de modelo" debería decir **`informeFinal.docx`**. Ese es el archivo que
se usa como referencia de tono/estilo para redactar los párrafos por función cognitiva de cada
paciente nuevo — es un ejemplo con **datos ficticios**, confirmado, se usa tal cual.

---

## 9. Spec del Excel unificado — a mandar antes de recibirlo

> Objetivo: que la primera versión que llegue ya sirva, sin ida y vuelta.

1. **Debe tener una fila por cada una de las 36 filas de la tabla de síntesis** (§5), no solo las 14
   pruebas graficadas + AVD + K-10. Layout recomendado por fila: `Área | Prueba | PB | Z` (mismas 4
   columnas que ya tiene `TABLA DE FORMULAS`, con las filas faltantes agregadas: subpuntajes del IFS,
   TRO x2, MMSE copia, Comprensión, Expresión, ensayos BEM-MS AS1/AS2/AS3). Como TRO y FF se repiten
   con el mismo nombre en dos secciones, el Excel necesita **dos filas separadas para cada una**.

2. **Agregar bloque de datos demográficos del paciente.** Hoy viven solo en la historia clínica
   online (capturas de pantalla), que no se le pasa al LLM. Propuesta: agregarlos como bloque de
   cabecera en la misma hoja o en una aparte — costo marginal nulo si el archivo de todos modos se
   edita por paciente. Campos mínimos a confirmar: nombre, DNI, fecha de evaluación, fecha de
   nacimiento, edad, nivel educativo, ocupación. **Pendiente de decidir** (o esa cabecera se completa
   a mano, ~6 campos).

3. **Campos nuevos fuera de la tabla de síntesis:**
   - AVD total (0–8) — hoy solo en papel.
   - K-10 total, idealmente desglosado en los 10 ítems por separado en el mismo orden de §7 (así
     alimenta directo `excelSegundoGrafico.xlsx` sin transcripción adicional).
   - Flag "Riesgo de evolución" (Sí/No) — el único campo realmente manual.

4. **Mantener el mismo orden de categorías** que ya usan los Excel de gráficos (§7) — no hace falta
   reordenar, solo asegurarse de que las 14 + 10 categorías existan con esos mismos nombres.

5. **Recordatorio operativo:** guardar el archivo en Excel antes de mandarlo (ver gotcha en §4).

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

### Pendiente

- [ ] Mandar el diseño real del Excel "unificado" (mockup) — spec ya armada para mandar en §9.
- [ ] De dónde salen los datos demográficos del paciente — agregarlos al Excel o completar a mano
      (§9, punto 2).
- [ ] Confirmar regla de desempate en los rangos de la tabla de síntesis (§6, límite
      inclusive/exclusive).
- [ ] Confirmar prioridad entre categorías cuando compromiso anímico y riesgo de evolución aplican
      simultáneamente (§6).
- [ ] **Probar en Word real el paste único de la tabla de síntesis** con datos ficticios — no se
      puede validar por código, decide si el camino de copy/paste puro alcanza o si hace falta pasar
      a `python-docx` como camino primario para esa tabla (§5).

---

## 12. Relación con la Opción 2 y el camino híbrido

Arrancar con esta opción ahora (valor inmediato, cero infraestructura) mientras se diseña la Opción 2
(`clinic-report-services` + `clinic-report-processor`, endpoint/UI en este repo) en paralelo, usando
lo aprendido del tono/prompts de la skill como insumo directo para la generación de párrafos del
servicio real. La digitalización de las tablas de normas (`PRUEBAS`/`FLUENCIAS`) conviene hacerla una
sola vez sea cual sea el camino, porque es el activo clínico central — pero es trabajo de Opción 2,
no de esta skill (la skill nunca recalcula Z). Detalle completo de la Opción 2 en
`opcionesAutomatizacion.md`.
