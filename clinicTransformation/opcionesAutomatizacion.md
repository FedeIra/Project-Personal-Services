# Opciones de Automatización — Informes Neurocognitivos

> Brainstorm inicial (sin plan todavía). Retomar desde acá.

## El pipeline actual (resumen)

1. **Historia clínica online** (ConsultorioMovil, SaaS de terceros): antecedentes, motivo de
   consulta, diagnóstico presuntivo.
2. **Evaluación en papel** (`evaluacion.pdf`): batería de tests (MMSE, memoria lógica Signoret,
   dígitos, TMT, Stroop, reloj, memoria seriada, fluencias, Boston, IFS, K-10) tomada en vivo con
   el paciente.
3. **Excel de fórmulas** (`formulasExcelEvaluacion.xlsx`, hoja `TABLA DE FORMULAS`): se cargan los
   Puntajes Brutos (PB) y el Excel calcula el Puntaje Z vía `VLOOKUP` contra tablas de normas por
   edad/nivel educativo (hojas `PRUEBAS`, `FLUENCIAS`, `MMSE`, `Stroop`, `Puntajes Equivalentes`).
4. **Dos Excel de gráficos** (`excelPrimerGrafico.xlsx`, `excelSegundoGrafico.xlsx`): se copian a
   mano los valores Z ya calculados para alimentar los gráficos embebidos en el Word.
5. **Informe final** (`informeFinal.docx`): tabla de paciente + tabla "SÍNTESIS DEL RENDIMIENTO"
   (PB, Z, y una X en la columna de rango correspondiente) cargada a mano, párrafos narrativos por
   función cognitiva ajustados desde un modelo, gráficos, conclusiones y sugerencias
   (`modeloDiagnosticoYSugerencias.docx`: 6 categorías diagnósticas según Z + AVD).
6. **Cierre**: conversión a PDF y envío por email.

## Qué tan automatizable es cada parte

**Nivel 1 — determinístico, sin LLM, sin riesgo clínico:**

- Cálculo de Z = `(PB - media) / desvío` vía lookup de normas por edad/nivel educativo.
- Marcar la X en la columna de rango correcta de la tabla de síntesis.
- Poblar los Excel de gráficos (pass-through del Z ya calculado).
- Elegir categoría diagnóstica de `modeloDiagnosticoYSugerencias.docx` (regla: Z + AVD + síntomas
  anímicos → 1 de 6 categorías).
- Armado del `.docx`, conversión a PDF, envío por mail.

**Nivel 2 — necesita LLM, con revisión humana obligatoria:**

- Párrafos narrativos por función cognitiva ("cómo rindió en...").
- Completar los "(…)" del párrafo de conclusiones (qué áreas nombrar).
- Siempre "borrador para revisión", nunca auto-envío directo al paciente.

**Nivel 3 — no automatizable / fuera de alcance razonable:**

- Toma de la evaluación en papel en vivo.
- Carga en la historia clínica de terceros (ConsultorioMovil no tiene API documentada; automatizar
  sería scraping/RPA frágil).
- Juicio clínico final del profesional.

## Opción 1 — Skill / paquete de contexto para cualquier LLM

### Qué recibe el LLM

- **Un único Excel "unificado"**: evolución de `formulasExcelEvaluacion.xlsx` (hoja
  `TABLA DE FORMULAS`) que además de los PB/Z ya calculados incorpora los pocos datos que hoy solo
  viven en el papel:
  - AVD total (checklist de actividades de vida diaria, página 1 de `evaluacion.pdf`)
  - K-10 total (escala de malestar psicológico)
  - Flag manual "Sintomatología anímica relevante" (Sí/No) — criterio clínico, no una fórmula
  - Flag manual "Riesgo de evolución" (Sí/No) — criterio clínico
  - Mantiene el mismo orden de pruebas que ya usan `excelPrimerGrafico.xlsx` y
    `excelSegundoGrafico.xlsx`, para que los valores calcen al copiar/pegar.
- Los 6 templates + regla de decisión de `modeloDiagnosticoYSugerencias.docx` (ver tabla abajo —
  ya extraída, no hace falta digitalizar de nuevo).
- `informeFinal.docx` (ejemplo ficticio) como referencia de estilo/tono.
- Instrucción explícita de **no** recalcular PB/Z (eso ya lo hizo el Excel) y **no** inferir
  "riesgo de evolución" ni "sintomatología anímica" por su cuenta — son flags que le llegan ya
  decididos por el profesional.

### Qué devuelve el LLM en el chat (bloques separados, listos para copy/paste)

1. Tabla de datos del paciente.
2. Filas de la tabla "SÍNTESIS DEL RENDIMIENTO" (PB, Z, y la X en la columna de rango correcta) —
   ver detalle de formato y orden de filas más abajo.
3. Valores para pegar en la hoja de datos embebida de `excelPrimerGrafico.xlsx` (mismo orden de
   categorías que el gráfico ya tiene, números con **punto** decimal para que Excel los reconozca
   como número y no como texto).
4. Valores para pegar en la hoja de datos embebida de `excelSegundoGrafico.xlsx` (K-10 por síntoma,
   mismo formato).
5. Párrafos narrativos por función cognitiva.
6. Párrafo de conclusiones.
7. Categoría diagnóstica (1 de 6, aplicando la regla de abajo) + sugerencias correspondientes del
   template.

El profesional pega cada bloque en su lugar (tabla de síntesis, las dos hojitas de Excel de los
gráficos, y los párrafos) y revisa/edita antes de cerrar el informe — nunca se genera el `.docx`
final automáticamente, porque los gráficos embebidos de Word son objetos OLE que una herramienta de
generación de archivos (python-docx u otra) no puede editar de forma confiable sin riesgo de
corromperlos.

### Detalle de la tabla "SÍNTESIS DEL RENDIMIENTO" (confirmado con ejemplo real)

Es una tabla con columnas **Área | Prueba | PB | Z** + 8 columnas de rango agrupadas en 4 categorías
(Deterioro significativo: `<-3`, `-3 a -2` · Puntajes bajos: `-2 a -1` · Puntajes promedio: `-1 a 0`,
`0 a +1` · Puntajes superiores: `+1 a +2`, `+2 a +3`, `>+3`), donde se marca una X en la columna que
corresponde al Z de esa fila. Algunas filas no tienen Z (interpretación cualitativa: "Normal",
"Autónoma", etc.) y en la plantilla esas celdas de rango tienen trazado diagonal en vez de X.

**A diferencia de los Excel de gráficos, una celda de tabla de Word acepta cualquier texto sin
problema de parseo numérico** — el separador decimal no es un tema acá.

**Área y Prueba son fijas** (misma batería, mismo orden, en todos los informes) — la skill no
necesita tocarlas, solo generar PB / Z / columna-X por fila. Orden confirmado de filas (de un
ejemplo real):

- **Screening cognitivo y psiquiátrico:** MMSE, TRO, AVD, KPDS-10 (estas 4, cualitativas — sin Z)
- **Atención y funciones ejecutivas:** DD, DI, TMT A, TMT B, FF (con Z) · IFS Total, IFS Índice MT,
  IFS SM, IFS IC, IFS CIM, IFS DA, IFS MA, IFS MTV, IFS R, IFS CIV (cualitativas — sin Z)
- **Memoria episódica:** BEM–MS AS1/AS2/AS3 (puntajes brutos por ensayo, sin Z propio) · BEM–MS AST,
  RSE, Sem, Rec, CE, BEM–ML Inm, BEM–ML Dif (con Z)
- **Lenguaje:** FF, FS, TBA (con Z) · Comprensión, Expresión (cualitativas — sin Z)
- **Visoconstrucción:** TRO, MMSE copia (cualitativas — sin Z)

**Cómo se pega en Word — en un solo paste (a validar con una prueba real, todavía no testeado):** el
LLM devuelve un bloque de texto con **10 valores separados por tabulación por fila** (PB, Z, y las 8
columnas de rango —
vacío en 7, "X" en la que corresponde), un salto de línea por fila, en el orden fijo de las ~35
filas de la batería. Se excluyen **Área y Prueba** del bloque a pegar (son fijas, ya están en la
plantilla, y "Área" tiene celdas combinadas que romperían el conteo de columnas si se incluyeran).

Mecánica: parado en la celda **PB de la primera fila (MMSE)** de la tabla real, `Pegado especial →
Texto sin formato` una sola vez — Word interpreta cada tab como "celda siguiente a la derecha" y
cada salto de línea como "bajar una fila", igual que Excel, completando las ~35 filas × 10 columnas
en un solo paste. Para las filas cualitativas, el campo "Z" lleva el texto (p. ej. "Normal") y las 8
columnas de rango quedan vacías (no se toca el trazado diagonal). Conviene probarlo una vez con
datos de prueba antes de confiarlo para un paciente real.

**Formato numérico en este bloque: coma decimal** (`1,14`, no `1.14`) — a diferencia de los Excel de
gráficos, acá es texto libre en una celda de Word sin parseo numérico, así que se usa la notación
clínica habitual.

### Cómo se arma y se usa (confirmado)

La skill es una **carpeta**, no un único archivo markdown:

```
informe-neurocognitivo/
├── SKILL.md                          ← instrucciones: qué recibe, qué debe devolver,
│                                        reglas de formato (punto decimal, orden de categorías,
│                                        "no recalcules Z", "no infieras riesgo de evolución")
├── regla-diagnostica.md              ← tabla de las 6 categorías + cortes de K-10/AVD (ya extraída)
├── ejemplo-informeFinal.docx         ← referencia de tono/estilo (datos ficticios, tal cual)
└── orden-categorias-graficos.md      ← orden exacto de pruebas de los dos Excel de gráficos
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

### Regla diagnóstica (extraída de `modeloDiagnosticoYSugerencias.docx`)

| Categoría                                 | Regla                                                      |
| ----------------------------------------- | ---------------------------------------------------------- |
| Rendimiento dentro de parámetros normales | Z > -1 + AVD conservadas                                   |
| Rendimiento normal con fallas aisladas    | Z entre -1 y -1,5 en pruebas aisladas + AVD conservadas    |
| DCL clásico (sin alertas)                 | Z < -1,5 + AVD conservadas                                 |
| DCL con compromiso anímico relevante      | Z < -1,5 + AVD conservadas + sintomatología anímica        |
| DCL con mayor riesgo de evolución         | Z < -1,5 + AVD conservadas + perfil de riesgo de evolución |
| Deterioro cognitivo mayor                 | Z < -1,5 + AVD comprometidas                               |

**Corte de sintomatología anímica (K-10) — confirmado:** puntaje total (suma de las 10 preguntas)
≥ 24,5 ⇒ "sintomatología anímica relevante" presente.

**Escala de AVD:**

| Puntaje | Interpretación        |
| ------: | --------------------- |
|     0–1 | Dependencia total      |
|     2–3 | Dependencia severa     |
|     4–5 | Dependencia moderada   |
|     6–7 | Dependencia leve       |
|       8 | Independencia          |

**Corte AVD conservadas/comprometidas — confirmado:** no hay un punto de corte "oficial" de la
escala original (que no distingue conservadas/comprometidas); es criterio diagnóstico del
profesional. Definido así: **0–5 = AVD comprometidas** (dependencia moderada, severa o total — el
paciente necesita supervisión en actividades diarias), **6–8 = AVD conservadas** (dependencia leve o
independencia).

- **Pros:** esfuerzo mínimo, funciona con cualquier LLM, no toca infraestructura, iteración rápida
  del tono de los párrafos, resuelve también la transcripción a los dos gráficos (no solo el texto).
- **Contras:** sigue siendo manual por paciente (pegar cada bloque en su lugar), sin historial ni
  persistencia, calidad 100% dependiente del prompt.

### Pendiente de tu parte antes de armar la skill

1. [ ] Mandar el diseño del Excel "unificado" (mockup de cómo quedarían los campos nuevos agregados
   a la hoja `TABLA DE FORMULAS`).
2. [x] Corte de K-10 → ≥ 24,5 = sintomatología anímica relevante. **Confirmado.**
3. [x] Corte de AVD → 0–5 = comprometidas, 6–8 = conservadas (criterio diagnóstico del profesional,
   no hay corte "oficial" de la escala original). **Confirmado.**
4. [x] "Riesgo de evolución" — confirmado que es puro criterio clínico/observación en vivo durante
   la entrevista (ojo clínico, intuición), no se deriva de ningún puntaje ni de la combinación de
   pruebas/DCL. Queda como flag manual (Sí/No) que el profesional carga directamente en el Excel
   unificado; el LLM nunca debe intentar inferirlo.
5. [x] Orden/nombres de categorías — **confirmado**, leído directamente de los `.xlsx`:

   `excelPrimerGrafico.xlsx` (columna Prueba → Z), en este orden:
   DD, DI, TMT A, TMT B, BEM–MS AST, BEM–MS RSE, BEM–MS Sem, BEM–MS Rec, BEM–MS CE, BEM–ML Inm,
   BEM–ML Dif, FF, FS, TBA.

   `excelSegundoGrafico.xlsx` (columna Sintomatología → Puntaje), en este orden (coincide con el
   orden 1–10 del cuestionario K-10 en papel):
   Cansancio, Nervios, Nervios+, Desesperanza, Inquietud, Inquietud+, Depresión, Esfuerzo, Tristeza,
   Inutilidad.

   Nota: no todas las pruebas de la batería se grafican (ej. MMSE, Stroop y Test del Reloj no
   aparecen en `excelPrimerGrafico.xlsx`) — la skill debe devolver valores solo para estas 14
   categorías, en este orden exacto, para que el copy/paste calce sin reordenar.
6. [x] Aclarado — error de tipeo en `clinicTransformationGuide.md`: donde dice "el archivo de
   evaluación.pdf ya viene con un texto sobre cómo rindió que se usa de modelo" debería decir
   **`informeFinal.docx`**. Ese es el archivo que se usa como referencia de tono/estilo para
   redactar los párrafos por función cognitiva y ajustarlos según los datos Z de cada paciente
   nuevo (es un ejemplo con datos ficticios, se usa tal cual).
7. [x] Separador decimal — **confirmado con prueba real**: se escribió `1,5` (coma) en una celda
   vacía del Excel y quedó alineado a la izquierda (Excel lo tomó como texto, no como número). Esto
   significa que el Excel de trabajo usa **punto** como separador decimal, no coma. La skill debe
   devolver los valores con punto (`-1.32`, no `-1,32`) para que el copy/paste a los gráficos
   funcione correctamente.

### Revisión del plan — puntos a resolver la próxima sesión

> Hallazgos de la revisión del plan de la Opción 1 (antes de recibir el Excel unificado y armar la
> skill). Ordenados por impacto.

**Impactan el diseño del Excel unificado (decidir antes de mandarlo):**

1. [ ] **El Excel debe contener TODAS las filas de la tabla de síntesis**, no solo las 14 pruebas
   graficadas + AVD + K-10. En el ejemplo real la tabla tiene ~35 filas, muchas cualitativas que hoy
   NO están en `formulasExcelEvaluacion.xlsx`: subpuntajes del IFS (Total, Índice MT, SM, IC, CIM,
   DA, MA, MTV, R, CIV), TRO, MMSE copia, Comprensión, Expresión, y los ensayos BEM-MS AS1/AS2/AS3.
   Si no están en el Excel, el LLM no las puede completar y el "paste único" queda incompleto. → El
   mockup debería tener una fila por cada fila de la tabla de síntesis.

2. [ ] **¿De dónde salen los datos demográficos del paciente (bloque 1)?** Nombre, DNI, fecha, fecha
   de nacimiento, ocupación, etc. viven en la historia clínica online (jpegs), que NO se le pasa al
   LLM. Decidir: o se agregan como campos al Excel unificado, o esa cabecera se completa a mano (~6
   campos). Afecta el mockup.

3. [ ] **Regla de desempate en los rangos de la X + caso especial FF.** Las 8 columnas de rango
   tienen bordes que se solapan (`-2 a -1` y `-1 a 0` ambos tocan el -1). Fijar convención para
   cuando el Z cae justo en un límite (ej. "el límite superior pertenece a la columna de la
   derecha"). Además: FF aparece capado como `≥3` y sale DOS veces en la tabla (Atención y Lenguaje)
   con el mismo PB/Z — la skill tiene que conocer el cap y la duplicación.

**Inconsistencia lógica del plan:**

4. [ ] **El flag manual "Sintomatología anímica relevante" es redundante con el corte de K-10.** Hay
   corte duro (K-10 ≥ 24,5 = malestar presente), así que se puede DERIVAR del K-10 en vez de ser flag
   manual "criterio clínico". Propuesta: la skill lo deriva por default (≥24,5 → presente) pero el
   profesional puede sobrescribirlo. Así queda un solo flag realmente manual: "riesgo de evolución".
   Confirmar este enfoque.

**Confiabilidad técnica (gotcha a documentar en el `SKILL.md`):**

5. [ ] **Guardar el Excel en Excel antes de subirlo.** La skill lee el `.xlsx` con código
   (openpyxl/pandas) y necesita los valores ya calculados de las fórmulas (VLOOKUP), que Excel cachea
   solo al guardar. Si se sube sin guardar, o abierto con otro programa, las celdas con fórmula
   pueden leerse vacías.

**Mejora opcional a evaluar:**

6. [ ] **Camino intermedio: que Claude complete el `.docx` casi entero automáticamente.** Como
   Claude.ai tiene ejecución de código, podría abrir una copia de la plantilla `informeFinal.docx`
   con `python-docx` y rellenar el texto + la tabla de síntesis completa, dejando los gráficos
   embebidos intactos (python-docx no los toca). El profesional solo pegaría a mano los 2 datasets de
   los gráficos. Elimina el paste de 35 filas y el pegado de párrafos. Sigue sin auto-enviar (se
   revisa igual). Decidir: ¿evaluarlo como variante, o mantener copy/paste puro por control/simpleza?

## Opción 2 — Endpoint + UI en este repo

El patrón ya existe en el repo: `report-services` (HTTP, sube algo + dispara proceso) +
`report-processor` (SQS async: parsear → calcular → generar doc → guardar → mandar mail) es casi
exactamente este flujo, cambiando liquidaciones laborales por informes neurocognitivos.

Forma propuesta (`clinic-report-services` + `clinic-report-processor`):

1. UI/form donde el profesional carga datos del paciente + PB de cada prueba (potencialmente
   reemplazando el Excel de carga).
2. Backend calcula Z de forma determinística (Nivel 1: migrar tablas de normas del Excel a
   JSON/DynamoDB, reimplementar las fórmulas).
3. Generación del `.docx` por template (`docxtemplater` / `python-docx-template`) rellenando tabla
   de paciente, tabla de síntesis con X automática, y datos de los 2 gráficos.
4. Llamada a un LLM (API, ej. Claude) solo para los párrafos Nivel 2, con la data ya calculada — el
   profesional los revisa/edita en la UI antes de cerrar.
5. Conversión a PDF (LibreOffice headless o Gotenberg — no trivial en Lambda) + envío por SES (ya
   existe el patrón en `portfolio-services`/`report-processor`).

- **Pros:** elimina toda transcripción manual, persiste historial de pacientes/informes, reusa
  auth/S3/SES existentes, encaja con la arquitectura y con `/new-services`.
- **Contras:** esfuerzo real de desarrollo — digitalizar tablas de normas (una sola vez), resolver
  conversión docx→pdf en Lambda, diseñar el modelo de datos de pacientes (similar en cuidado a
  `ENCRYPTION_KEY` en `account-services`).

## Camino híbrido (sugerido)

Arrancar con la Opción 1 ahora (valor inmediato, cero infraestructura) mientras se diseña la Opción
2 en paralelo, usando lo aprendido del tono/prompts de la skill como insumo directo para el paso 4
del servicio real. La digitalización de las tablas de normas (`PRUEBAS`/`FLUENCIAS`) conviene
hacerla una sola vez sea cual sea el camino, porque es el activo clínico central.

## Próximos pasos / preguntas abiertas para retomar

- [ ] ¿Priorizar Opción 1, Opción 2, o arrancar el híbrido?
- [ ] Volumen esperado (pacientes/mes) para justificar el esfuerzo de la Opción 2.
- [ ] Si se sigue Opción 2: definir modelo de datos de pacientes y cómo se resuelve la conversión
      docx→pdf en Lambda.
- [ ] Digitalizar las tablas de normas (`PRUEBAS`, `FLUENCIAS`, `MMSE`, `Stroop`,
      `Puntajes Equivalentes`) a un formato estructurado (JSON/CSV), independiente del camino elegido.
