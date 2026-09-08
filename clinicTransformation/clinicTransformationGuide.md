# Guía de transformación — Informes neurocognitivos

> **Documento interno maestro (no se sube a claude.ai).** Reúne el contexto del proyecto: el proceso
> manual original, el análisis de automatización, la solución elegida (la skill) y el estado
> pendiente. **No duplica el detalle operativo**: para las reglas concretas (36 filas, categorías
> diagnósticas, gráficos, mapeo de celdas) la fuente de verdad son los archivos de
> `informe-neurocognitivo/`, que son los que efectivamente se empaquetan y suben. Acá se apunta a
> ellos, no se copian.
>
> Consolidado desde el (ya eliminado) `planSkillInformeNeurocognitivo.md`.

---

## 1. Proceso manual original (relato de la profesional)

**Formato que recibe:** dos documentos —un Excel (`formulasExcelEvaluacion.xlsx`) y un PDF
(`evaluacion.pdf`)— más la página web de historia clínica.

**Formato final:** un archivo de Word (informe), en Google Drive o Word normal, siempre modificable
(no PDF hasta el cierre).

**Proceso en general:** llega el paciente, se abre la historia clínica online (imágenes
`paginaWebHistoriaClinica 1–4`) y se toma la evaluación en un papel físico (`evaluacion.pdf`). El
motivo de consulta y otros datos van en la web. A medida que avanza la evaluación, hay un Excel
abierto con fórmulas donde se cargan los números y el Excel devuelve puntajes
(`formulasExcelEvaluacion.xlsx`). Se llenan sólo las columnas de **PB (puntaje bruto)**; el resto lo
convierte el Excel en **puntaje Z**. Algunas fórmulas usan otras pestañas, pero la pestaña donde se
carga es la primera: **`TABLA DE FORMULAS`**. El Z es una puntuación universal que permite comparar
individuos de distinta edad/nivel educativo contra un baremo local (media y desvío esperados).

Además del Excel se cargan otros detalles en la historia clínica online. Al final de la historia
clínica se pone el **diagnóstico presuntivo** que devuelve el baremo según edad
(`paginaWebHistoriaClinica3.jpeg`).

Luego se hace un **informe escrito** (modelo: `ejemplos/informeFinal.docx`). El objetivo es mostrar
cómo rindió en cada función cognitiva. Se completa con datos de la historia clínica online, de la
evaluación en papel y del Excel. La parte que **más se desea automatizar**: la tabla
`SÍNTESIS DEL RENDIMIENTO`, donde se pasan a mano PB y Z desde el Excel y se marca una **X** en la
columna de rango que corresponde al Z. Después vienen dos **gráficos** (perfil cognitivo y Escala
K-10) que se alimentan con "modificar datos en Excel", los **párrafos por función cognitiva** (se
ajustan desde un modelo según el Z), las **conclusiones** y el **diagnóstico + sugerencias** (de
`modeloDiagnosticoYSugerencias.docx`, 6 categorías según Z + AVD). Al final se convierte a PDF y se
envía por email.

> **Correcciones al relato original:**
> - Donde el relato decía que "`evaluacion.pdf` ya viene con un texto sobre cómo rindió que se usa de
>   modelo", debe decir **el informe modelo** (`ejemplos/informeFinal.docx` / `informeFinal2.docx`).
> - Los valores que se pegan en los gráficos no son el Z crudo, sino **redondeado a 2 decimales y
>   capado en ±3** (ver `informe-neurocognitivo/orden-categorias-graficos.md`).
> - En la tabla de síntesis, el texto cualitativo va en la columna **PB, no en Z**, y sólo las filas
>   con Z numérico llevan X (ver `informe-neurocognitivo/orden-filas-sintesis.md`).

---

## 2. Qué tan automatizable es cada parte

- **Nivel 1 — determinístico (ya lo resuelve el Excel; la skill sólo transcribe):** marcar la X en la
  columna de rango, poblar los dos gráficos (pass-through del Z redondeado), elegir categoría
  diagnóstica.
- **Nivel 2 — necesita LLM, con revisión humana obligatoria:** párrafos por función cognitiva,
  completar los "(…)" de conclusiones. Siempre borrador para revisión, nunca auto-envío.
- **Nivel 3 — fuera de alcance:** toma de la evaluación en vivo, carga en la historia clínica de
  terceros, juicio clínico final, y **generación automática del `.docx`** (los gráficos embebidos son
  objetos OLE — riesgo de corromperlos generando el archivo por código).

---

## 3. Solución elegida — la skill `informe-neurocognitivo/`

Un **paquete de contexto para cualquier LLM** (se sube a claude.ai). Recibe el Excel unificado del
paciente y devuelve, en bloques listos para copy/paste, todo lo que hoy se transcribe a mano. **No**
genera el `.docx` final ni envía nada: es siempre borrador para revisión del profesional.

- **Qué recibe:** un único Excel unificado (`ejemplos/excelEvaluacionCompleto.xlsx` es el ejemplo),
  hoja `TABLA DE FORMULAS`. Esquema celda por celda → `informe-neurocognitivo/mapeo-excel-a-word.md`.
- **Qué devuelve:** 11 bloques (datos personales, anamnesis, tabla de síntesis, los 2 gráficos,
  screening, párrafos por área, conclusiones, categoría + sugerencias, y un reporte de faltantes).
  Detalle → `informe-neurocognitivo/SKILL.md`.
- **Cómo se arma y sube:** comprimir la carpeta `informe-neurocognitivo/` en `.zip` (con el `SKILL.md`
  adentro) → en claude.ai **Settings → Capabilities → Skills**, habilitar *code execution* y subir el
  zip. Requiere plan **Pro/Max/Team/Enterprise**. Claude la detecta sola al adjuntar el Excel.
- **Gotcha:** guardar el Excel **en Excel** antes de subirlo, para que las fórmulas (VLOOKUP) queden
  cacheadas; si no, esas celdas pueden leerse vacías.

**Pros:** esfuerzo mínimo, cualquier LLM, cero infraestructura, iteración rápida del tono, resuelve
también los dos gráficos. **Contras:** sigue siendo manual por paciente (pegar cada bloque), sin
historial ni persistencia, calidad dependiente del prompt.

### Archivos de la skill (fuente de verdad operativa)

| Archivo | Contenido |
|---|---|
| `informe-neurocognitivo/SKILL.md` | Instrucciones: qué recibe, los 11 bloques de salida, prohibiciones. |
| `informe-neurocognitivo/mapeo-excel-a-word.md` | Esquema del Excel + de dónde sale cada bloque del Word (FIJO/PASS/DERIV/LLM). |
| `informe-neurocognitivo/orden-filas-sintesis.md` | Las 36 filas de la tabla de síntesis, celda de origen, patrones de llenado, paste. |
| `informe-neurocognitivo/orden-categorias-graficos.md` | Los 2 gráficos: orden, redondeo/cap, celdas destino. |
| `informe-neurocognitivo/regla-diagnostica.md` | Las 6 categorías + sugerencias + cortes K-10/AVD. |
| `informe-neurocognitivo/excel-unificado-spec.md` | Estado del Excel entregado y ajustes propuestos. |

---

## 4. Opción alternativa (2) y camino híbrido

> No es trabajo de la skill; queda como referencia del camino paralelo.

**Opción 2 — endpoint + UI en este repo.** El patrón ya existe: `report-services` (HTTP, sube algo +
dispara proceso) + `report-processor` (SQS async: parsear → calcular → generar doc → guardar →
mail). Forma propuesta (`clinic-report-services` + `clinic-report-processor`):

1. UI/form donde el profesional carga datos + PB de cada prueba.
2. Backend calcula Z de forma determinística (migrar tablas de normas del Excel a JSON/DynamoDB).
3. Generación del `.docx` por template (`docxtemplater`) con tabla de síntesis y gráficos.
4. LLM (API) sólo para los párrafos Nivel 2; el profesional revisa en la UI.
5. docx→pdf (LibreOffice headless / Gotenberg — no trivial en Lambda) + envío por SES.

**Pros:** elimina toda transcripción, persiste historial, reusa auth/S3/SES. **Contras:** esfuerzo
real de desarrollo (digitalizar normas, resolver docx→pdf en Lambda, modelo de datos de pacientes).

**Camino híbrido (sugerido):** arrancar con la skill ahora, y diseñar la Opción 2 en paralelo usando
lo aprendido del tono/prompts como insumo del paso 4.

**Preguntas abiertas del camino:**
- [ ] ¿Priorizar Opción 1, Opción 2 o el híbrido?
- [ ] Volumen esperado (pacientes/mes) para justificar la Opción 2.
- [ ] Si se sigue Opción 2: modelo de datos de pacientes y cómo se resuelve docx→pdf en Lambda.
- [ ] Digitalizar las tablas de normas (`PRUEBAS`, `FLUENCIAS`, `MMSE`, `Stroop`,
      `Puntajes Equivalentes`) a JSON/CSV — conviene sea cual sea el camino.

---

## 5. Estado consolidado

### Confirmado
- Cortes: K-10 ≥ 25 = sintomatología anímica relevante (derivado por default, sobrescribible); AVD
  0–5 = comprometidas / 6–8 = conservadas.
- "Riesgo de evolución" es criterio clínico manual — la skill nunca lo infiere.
- Orden/nombres de las categorías de los dos gráficos, leído directo de los `.xlsx`.
- La tabla de síntesis tiene 36 filas, orden confirmado, duplicados TRO/FF identificados.
- Cap de ±3 confirmado de los dos lados; los gráficos usan el Z redondeado y capado, no el crudo.
- La plantilla no tiene trazado diagonal; el texto cualitativo va en PB.
- Los templates de sugerencias se adaptan al paciente (no se copian literalmente).
- El Excel unificado llegó (`ejemplos/excelEvaluacionCompleto.xlsx`) y está mapeado celda por celda.

### Respondido por la profesional (2026-09-07)
La profesional contestó las 11 preguntas (resumen en `preguntasParaLaProfesional.md`, detalle volcado
a los `.md` de la skill). Quedó definido:
- **Diagnóstico:** las submedidas derivadas (en especial **CE** = promedio Sem+Rec) no disparan DCL
  por sí solas; se pesan los índices de área (AST/RSE/Rec). Con eso, el caso de `informeFinal2` es
  fallas aisladas; la skill propone y el médico decide.
- **Léxico Z → palabra**, corte de C-QSM (> 3), AST = promedio de 3 trials truncado, IFS Índice MT =
  Dígitos Atrás + MTV, anamnesis sin matizar + con antecedentes familiares, sugerencias localizadas
  desde la anamnesis.
- **Cambios al Excel acordados:** 10 ítems del K-10, riesgo de evolución Sí/No, Acompañado + por
  quién, orientación temporal/espacial, C-QSM opcional, AST e IFS Índice MT por fórmula → detalle en
  `informe-neurocognitivo/excel-unificado-spec.md`.

### Pendiente
- **Que la profesional aplique los cambios acordados al Excel** y reenvíe el archivo actualizado.
- **Probar en Word real el paste en 3 bloques** de la tabla de síntesis (sin validar todavía).
- **Anonimizar un informe modelo** para incluirlo dentro del paquete de la skill (ver §7).
- Confirmar los puntos aún abiertos: desempate de rangos (B.5), prioridad entre categorías (B.6),
  sobrescribir el corte de K-10 (B.7), detalles de plantilla (C.1–C.6) y housekeeping (D.2, D.4).
- Definir un **umbral numérico** general de "cuántas pruebas principales bajas = perfil" (el criterio
  de submedidas ya está; el umbral general sigue abierto).

---

## 6. Preguntas para la profesional

> **Ya respondidas (2026-09-07)** — ver la tabla de respuestas y lo que sigue abierto en
> **`preguntasParaLaProfesional.md`**. La tabla de abajo es el temario original que se envió.

| Bloque | Contenido | Por qué importa |
|---|---|---|
| **A. Bloqueantes** | 10 ítems del K-10 · flag de riesgo de evolución · valor real de `D31` · registro del C-QSM · truncado/redondeo del PB de AST · 🚩 criterio "fallas aisladas vs. perfil" (§A.0) | Sin esto hay partes del informe que **no se pueden generar** |
| **B. Libertad de redacción** | reformulación de la anamnesis · qué se omite · léxico Z → palabra · adaptación del template de sugerencias · desempate en límites de rango · prioridad entre categorías · sobrescribir el corte de K-10 | Definen **qué puede decidir la skill sola** |
| **C. Plantilla de Word** | leyenda del trazado diagonal inexistente · `del área`/`por área` · campo `Deriva:` · `INECO` vs `IFS Total` · separador decimal del TRO · si PRUEBAS ADMINISTRADAS es lista fija | Detalles a mantener o corregir |
| **D. Housekeeping** | ejemplo anonimizado para el paquete · hojas `Stroop`/`MMSE`/`Puntajes Equivalentes` · nota truncada de `B58` · columna vacía de la hoja del gráfico | No bloquean, pero conviene cerrarlos |

**Las de mayor impacto:** 🚩 A.0 (la regla no reproduce la decisión real del profesional), A.1 (los
10 ítems del K-10) y B.1 (la reformulación de la anamnesis: el Excel dice `"cierto estrés"` y el
informe `"poco estrés"`, dentro de una comilla presentada como textual del paciente).

---

## 7. Datos sensibles

`ejemplos/excelEvaluacionCompleto.xlsx` e `ejemplos/informeFinal2.docx` son de un **paciente real**
(nombre, fecha de nacimiento, antecedente familiar, notas de ánimo/sueño, citas de la entrevista).
`informeFinal.docx` es ficticio.

`informeFinal2.docx` **no es "el" informe final**, sino un **modelo que varía según los resultados**
de cada paciente — se usa como referencia de estructura y tono. Es la mejor referencia disponible
porque es el único informe del que además se tiene el Excel de entrada.

Dos perfiles de riesgo:
- **El Excel de entrada** lleva datos reales inevitablemente — es el archivo de trabajo, se adjunta
  por paciente en el chat. Es decisión del profesional.
- **El paquete de la skill** no necesita datos reales. Antes de incluir un informe modelo dentro de
  `informe-neurocognitivo/`, hay que subir una **copia anonimizada** (nombre, fecha de nacimiento y
  anamnesis ficticios), dejando estructura y tono intactos.

---

## 8. Mapa de archivos de `clinicTransformation/`

| Carpeta / archivo | Rol |
|---|---|
| `clinicTransformationGuide.md` | **Este documento** — hub interno del proyecto. |
| `informe-neurocognitivo/` | **La skill** (se zippea y sube). Fuente de verdad operativa. |
| `preguntasParaLaProfesional.md` | Preguntas pendientes, versión detallada (interno). |
| `ejemplos/` | Informes modelo y Excel de ejemplo (`informeFinal.docx`, `informeFinal2.docx`, `excelEvaluacionCompleto.xlsx`). |
| `evaluacion.pdf` | Batería de tests en papel (fuente). |
| `formulasExcelEvaluacion.xlsx` | Excel de fórmulas original (predecesor del unificado). |
| `excelPrimerGrafico.xlsx` / `excelSegundoGrafico.xlsx` | Plantillas de los dos gráficos. |
| `modeloDiagnosticoYSugerencias.docx` | Fuente de las 6 categorías diagnósticas + sugerencias. |
| `paginaWebHistoriaClinica1–4.jpeg` | Capturas de la historia clínica online (fuente). |
