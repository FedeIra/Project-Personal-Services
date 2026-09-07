# Preguntas pendientes para la profesional

> Lista consolidada de todo lo que quedó sin confirmar, reunido de
> `planSkillInformeNeurocognitivo.md`, `opcionesAutomatizacion.md` y los archivos de
> `informe-neurocognitivo/`. Pensada para llevar a una sola conversación.
>
> Ordenada por **impacto**: el bloque A cambia lo que la skill puede producir, el B define cuánta
> libertad tiene al redactar, el C son detalles de la plantilla y el D es housekeeping. Si el tiempo
> alcanza sólo para una parte, **el bloque A es el que desbloquea trabajo**.
>
> Cada pregunta trae el hallazgo que la motiva, para no tener que explicar el contexto de nuevo.

---

## A. Bloqueantes — sin esto hay partes del informe que no se pueden generar

### A.0 ⚠️ La regla diagnóstica no reproduce su propia decisión — **la pregunta más importante de todas**

Aplicando la regla de `modeloDiagnosticoYSugerencias.docx` tal como está escrita al paciente de
`informeFinal2`, sale una categoría distinta de la que usted eligió.

Los datos: **AVD = 8** (conservadas), y dos puntajes **por debajo de −1,5** — BEM–MS Sem (`≤-3`, Z
crudo −3,11) y BEM–MS CE (`-2,01`). El resto entre −1,24 y +2,31.

| | |
|---|---|
| **Lo que dice la regla** | "DCL clásico: Z < −1,5 + AVD conservadas" → **categoría 3** |
| **Lo que dice su informe** | "rendimiento cognitivo normal con leves fallas aisladas en recuperación de la memoria", con las sugerencias de la **categoría 2** |

La diferencia no es menor: categoría 3 implica *"compatible con un deterioro cognitivo leve"*,
seguimiento por neurología y neuropsicología y reevaluación en 12 meses. Categoría 2 implica
*"dentro de parámetros normales"* y seguimiento clínico según evolución.

> **¿Qué le falta a la regla escrita?** Algunas hipótesis para descartar o confirmar:
>
> - **¿Cuántas pruebas tienen que estar bajas?** Dos puntajes bajos sobre 14 quizás cuenten como
>   "fallas aisladas" y no como perfil de DCL. Si es así: ¿cuántas, o qué proporción, marcan el
>   límite?
> - **¿Pesan distinto según la prueba?** Sem y CE son submedidas de memoria seriada (claves
>   semánticas y codificación). Quizás un puntaje bajo en una submedida no cuenta igual que en el
>   puntaje total del área (AST, que acá dio −0,90, normal).
> - **¿Importa que el resto del perfil esté conservado o alto?** Este paciente tiene FF en +2,31 y
>   TMT B en +1,02.
> - **¿O el criterio es "el área en conjunto"** más que prueba por prueba?
>
> **Por qué es la pregunta más importante:** las celdas que faltan en el Excel se agregan en diez
> minutos. Esto no. Es el único punto donde sabemos que **la lógica documentada da un resultado
> clínicamente distinto del suyo** — y es justo el paso que define el diagnóstico y las
> recomendaciones que lee el paciente. Mientras no se resuelva, la skill no puede elegir categoría
> con confianza, ni siquiera con el Excel perfecto.

### A.1 Los 10 ítems del K-10

El gráfico "Escala K-10" necesita los 10 puntajes por síntoma (en `informeFinal2` son
`2, 4, 1, 1, 2, 1, 1, 1, 1, 1`). El Excel guarda **sólo el total** (`D28` = 15), así que ese gráfico
no se puede armar desde el archivo.

> **¿Puede cargar los 10 ítems por separado en el Excel?** Serían 10 celdas nuevas y el total pasaría
> a calcularse solo (`=SUMA(...)`), así no puede quedar desincronizado. Hoy esos 10 valores se
> transcriben del papel al Word.

### A.2 El flag "Riesgo de evolución"

No existe como campo en el Excel. Es criterio clínico puro, no se deriva de ningún puntaje.

> **¿Agregamos una celda Sí/No?** Sin ella, la categoría diagnóstica 5 ("DCL con mayor riesgo de
> evolución") es inalcanzable — la skill nunca podría elegirla.

### A.3 El valor real de `D31` (IFS Índice MT) del paciente actual

La celda guarda `46302` con formato de fecha, o sea **07/10/2026**. Se tipeó `7/10` y Excel lo
convirtió a fecha. **El valor original ya no está en el archivo**; sabemos que era `7/10` sólo porque
figura en el Word.

> **Confirmar que era `7/10`.** Y aviso: conviene poner esas celdas en formato Texto, porque esto
> vuelve a pasar solo y no avisa.

### A.4 El C-QSM

"Cuestionario de quejas subjetivas de memoria (C-QSM)" figura en PRUEBAS ADMINISTRADAS y su resultado
se usa en la narrativa de screening ("…ni quejas subjetivas de memoria significativas"), pero **no
tiene ninguna celda en el Excel ni fila en la tabla de síntesis**. Es el único test administrado sin
lugar en el archivo.

> **¿Cómo se registra el C-QSM?** ¿Puntaje, interpretación, o las dos cosas? ¿Y debería ser también
> una fila de la tabla de síntesis, o queda sólo como insumo del párrafo de screening?

### A.5 El PB de BEM–MS AST: ¿se trunca o se redondea?

El Excel calcula el promedio de los 3 ensayos en una celda auxiliar, pero el PB de AST se carga **a
mano**. En `informeFinal2`: ensayos 5, 8 y 10 → promedio `7,6667`, y el PB cargado fue **`7,66`**
(truncado), no `7,67` (redondeado).

**No es cosmético: mueve el Z.** Con 7,66 el Z es `-0,90`; con 7,67 sería `-0,89`.

> **¿Es a propósito truncar?** (En el informe anterior el promedio dio `5,3333` y no distingue, así
> que este es el único caso que lo muestra.) Y si siempre es el promedio: **¿conviene que el PB salga
> por fórmula** en vez de cargarse a mano, para que no dependa de cómo se redondeó ese día?

---

## B. Definen cuánta libertad tiene la skill al redactar

### B.1 La anamnesis: ¿cuánto puede reformular? ⚠️ la más importante de este bloque

Comparando las notas del Excel con el párrafo del Word del mismo paciente:

| Excel (`B63`) | Word |
|---|---|
| `- Animicamente: "bárbaro", "cierto estrés cerebral y financiero".` | `Anímicamente, se encuentra bien, "con poco estrés o sobrecarga laboral/finaciera".` |

La nota dice *"cierto estrés"* y el informe dice *"poco estrés"* — y el cambio está **dentro de una
comilla que se presenta como cita textual del paciente**.

> **¿Fue criterio clínico (matizar según lo que observó en la entrevista) o un desliz de tipeo?**
>
> La respuesta define la regla: por ahora la skill **transcribe la nota sin suavizarla ni
> reinterpretarla**, y marca lo ambiguo para que usted lo revise. Si en realidad espera que ajuste el
> tono según criterio clínico, hay que decirlo explícitamente — pero conviene saber que ese es el
> punto del pipeline donde un error de la IA sería más difícil de detectar leyendo el informe final.

### B.2 Qué se omite de la anamnesis

Dos viñetas del Excel no aparecen en el Word: `- PROTOCOLO XTEND` (nota interna) y
`- Antecedentes mamá con EA (temprano - a los 65 aprox)`.

> **¿Los antecedentes familiares se omiten siempre del informe, o fue una decisión de este caso?**
> Hoy la skill incluye todo y marca lo dudoso, en vez de decidir sola qué dejar afuera.

### B.3 El léxico Z → palabra

Los párrafos por área traducen cada Z a vocabulario clínico (`alto`, `conservado`, `normal`,
`bajo no deficitario`, `deficitario`). Deducimos los cortes leyendo los dos informes, **no es una
tabla que nos haya pasado**.

> **¿Cuáles son los cortes reales?** Nuestra inferencia: `alto` para Z ≳ +1 · `conservado`/`normal`
> entre −1 y +1 · `bajo (no deficitario)` entre −1 y −2 · `deficitario` por debajo de −2.
> ¿Y `conservado` y `normal` son intercambiables o significan cosas distintas?

### B.4 Las sugerencias: ¿cuánto se adapta el template?

Los dos informes agregan un paréntesis específico del paciente a la viñeta de hábitos
(`(estrategias de compensación, no multitarea)` / `(mejorar calidad del sueño y técnicas de
relajación)`), y `informeFinal2` reescribió la frase de cierre de la categoría 2 (el template dice
`fallas atencionales/ejecutivas aisladas`, el informe dice `leves fallas aisladas en recuperación de
la memoria`).

> **¿Está bien que la skill proponga ese paréntesis y adapte la frase de cierre**, manteniendo las
> viñetas del template sin agregar ni quitar recomendaciones clínicas? Es lo que hace hoy.

### B.5 Desempate cuando el Z cae justo en un límite de rango

Las 8 columnas de rango comparten bordes (`-2 a -1` y `-1 a 0` ambos tocan el −1).

> **Si un Z da exactamente −1,00, ¿la X va en `-1 a 0` o en `-2 a -1`?** Propuesta: límite inferior
> inclusive, superior exclusivo (−1,00 → `-1 a 0`). Ninguno de los dos informes tiene un Z en un
> borde exacto, así que no lo resuelven.

### B.6 Prioridad entre categorías diagnósticas

> **Si Z < −1,5 con AVD conservadas y aplican al mismo tiempo compromiso anímico (K-10 ≥ 25) Y riesgo
> de evolución, ¿qué categoría gana?** ¿O el informe debería mencionar las dos? No está resuelto en
> `modeloDiagnosticoYSugerencias.docx`. Hoy la skill lo señala en vez de elegir en silencio.

### B.7 Sobrescribir el corte de K-10

La regla acordada es que "sintomatología anímica relevante" se derive de K-10 ≥ 25, con opción de que
usted lo sobrescriba.

> **¿Alguna vez discrepa del corte automático?** Si sí, ¿dónde lo marcaría — una celda aparte en el
> Excel?

---

## C. Detalles de la plantilla de Word

### C.1 La leyenda menciona un trazado diagonal que no existe

La leyenda al pie de la tabla dice "las áreas con trazado diagonal indican que el puntaje no lleva
puntaje Z", pero **ninguna de las dos plantillas tiene trazado diagonal**: esas celdas van con
relleno gris claro. Parece texto que quedó de una versión anterior.

> **¿Quiere corregir la leyenda** (cambiar "trazado diagonal" por "sombreado gris") o la dejamos como
> está? Hoy la skill la reproduce tal cual, sin tocarla.

### C.2 "Impresión diagnóstica **del** área" vs "**por** área"

En los dos informes, las secciones de Atención y Memoria dicen `del área` y las de Lenguaje y
Visoconstrucción dicen `por área`.

> **¿Unificamos a una de las dos formas, o lo dejamos así?** Hoy se reproduce la inconsistencia tal
> cual, para no cambiar nada sin que nos lo pida.

### C.3 El campo "Deriva:" de la tabla de datos personales

`informeFinal.docx` tiene una 7ª fila `Deriva:` (con valor `-`) que `informeFinal2.docx` no tiene.

> **¿Es un campo opcional, o se dejó de usar?** ¿Lo agregamos al Excel?

### C.4 "INECO" vs "IFS Total"

El Word llama **INECO** al puntaje en el párrafo de screening (`INECO=26,5/30`) y **IFS Total** en la
tabla de síntesis, para el mismo dato.

> **¿Es deliberado** (un nombre para el cuerpo del texto y otro para la tabla) o conviene unificar?

### C.5 TRO aparece con dos separadores decimales distintos

En la misma tabla de `informeFinal2`: fila de Screening `9,5/10` (coma) y fila de Visoconstrucción
`9.5/10` (punto). En el Excel las dos celdas dicen `9.5/10`, así que una se editó a mano en el Word.

> Cosmético, sólo para saber si le importa: **¿unificamos a coma en el informe?**

### C.6 PRUEBAS ADMINISTRADAS: ¿lista fija?

`informeFinal2` incluye el C-QSM y ordena el TBA antes del DD; `informeFinal` no tiene C-QSM y pone
el TBA después del TRO.

> **¿La lista varía según lo que se le tomó a cada paciente**, o es fija y las diferencias son
> accidentales? Si varía, la skill necesita saber de dónde sacar qué se administró.

---

## D. Housekeeping

### D.1 Un ejemplo anonimizado para el paquete de la skill

`excelEvaluacionCompleto.xlsx` e `informeFinal2.docx` son de un **paciente real** (nombre, fecha de
nacimiento, antecedente familiar, citas de la entrevista). `informeFinal.docx` era ficticio.

El Excel de cada paciente se adjunta en el chat y eso es inevitable — es el flujo de trabajo. Pero el
**paquete de la skill** se sube una vez y queda ahí de forma persistente, y `informeFinal2` es la
mejor referencia de tono que tenemos porque es la única de la que además tenemos el Excel de entrada.

> **¿Nos pasa una copia de `informeFinal2` con nombre, fecha de nacimiento y anamnesis ficticios?**
> La estructura y el tono quedan intactos — es lo único que la skill necesita de ese archivo.

### D.2 Las hojas `Stroop`, `MMSE` y `Puntajes Equivalentes`

Ninguna fórmula de `TABLA DE FORMULAS` las referencia (las que sí se usan son `PRUEBAS` y
`FLUENCIAS`). Y el Stroop y el Test del Reloj están en la batería descrita, pero **el Stroop no
aparece ni en la tabla de síntesis ni en los gráficos**.

> **¿Esas hojas son calculadoras auxiliares que usa a mano?** ¿Y el Stroop se sigue tomando? Si su
> resultado tiene que entrar al informe, hoy no hay ni fila ni celda para él.

### D.3 La nota truncada de `B58`

La celda termina cortada: `- QSM: olvida cosas puntuales (fue a un partido y por ahi ` (paréntesis sin
cerrar). Está así en el archivo, no es un problema de lectura.

> **¿Se acuerda cómo seguía?** Nada que arreglar en el diseño; sólo para no perder la nota de este
> paciente.

### D.4 La columna vacía de la hoja del gráfico

En la hoja de datos embebida del gráfico de perfil cognitivo, la columna A quedó vacía y los datos
arrancan en B/C; en el archivo suelto arrancan en A/B. El encabezado de la serie es el año (`2026`).

> **¿Esa columna se reserva para la evaluación anterior del paciente** (para comparar dos años en el
> mismo gráfico), o es un corrimiento accidental? Cambia si conviene dejarla libre.

---

## Resueltas revisando los otros documentos (2026-09-07)

Antes de mandar la consulta se cruzaron las preguntas contra `evaluacion.pdf`, las capturas de
`paginaWebHistoriaClinica*.jpeg` y el texto completo de `modeloDiagnosticoYSugerencias.docx`. Estas
dejaron de ser "¿de dónde sale?" y pasaron a ser "¿lo pasamos al Excel?":

| Pregunta | Qué se encontró |
|---|---|
| **A.1** — los 10 ítems del K-10 | `clinicTransformationGuide.md` ya lo decía: salen de la **Escala de Malestar Psicológico de `evaluacion.pdf`** y van del papel directo al gráfico. No hay que preguntar de dónde vienen, sólo si conviene cargarlos en el Excel. |
| **A.4** — el C-QSM | Aparece nombrado en las **notas de anamnesis del Excel** (`B58` arranca con `- QSM:`), en forma descriptiva. Queda por saber si además da un puntaje numérico. |
| §4 de la consulta — "asiste solo" | `evaluacion.pdf` tiene el campo **`Acompañado: NO/SI`** en la cabecera. |
| §4 de la consulta — motivo "por control" | La historia clínica online tiene el campo **`MOTIVO DE CONSULTA / EVOLUCIÓN`** (visible en `paginaWebHistoriaClinica1.jpeg`). |
| §C.3 — el campo `Deriva:` | `evaluacion.pdf` lo tiene en la cabecera, junto con **`Ocupación`**. Ocupación no aparece en ninguno de los dos informes de Word. |
| Observaciones de conducta (screening) | El MMSE del papel tiene su propia sección **`ORIENTACIÓN (10 puntos)`**, de donde sale "orientación temporal y espacial conservadas". El Excel guarda sólo el MMSE total. El resto del párrafo (discurso, nivel de alerta, fatiga) es **texto idéntico en los dos informes** → boilerplate para paciente normal. |

### Confirmado que NO están respondidas en ningún documento

- **§A.0 / §7 de la consulta — el criterio "fallas aisladas vs. perfil".** Se leyó el texto completo
  de `modeloDiagnosticoYSugerencias.docx`: define las 6 categorías sólo por umbral de Z + AVD
  (`Z entre -1 y -1,5 en pruebas aisladas` vs `Z < -1,5`), **sin ninguna noción de cuántas pruebas ni
  de qué peso**. La contradicción con `informeFinal2` sigue en pie.
- **§A.5 — el truncado del PB de AST**, **§B.3 — el léxico Z → palabra**, **§B.1 — la frase del
  ánimo** y **§B.2 — los antecedentes familiares omitidos**: no aparecen en ningún documento.

### Nota sobre `evaluacion.pdf`

El PDF usa fuentes subset con encodings propios por fuente, así que **la extracción de texto es
parcial**: los encabezados de sección decodifican bien, los valores cargados a mano no. Se
confirmaron por presencia las secciones de MMSE (con Orientación, Fijación, Atención, Memoria,
Repetición, Comprensión, Lectura, Escritura, Denominación, Copia), Memoria Lógica (Signoret),
Fluencia, Reloj, Boston, Stroop, Trail y Dígitos.

⚠️ **La ausencia de un término en esa extracción no prueba que no esté en el formulario** (no se
encontraron `MALESTAR`, `LAWTON` ni `QUEJAS`, pero el plan ya daba por sentado que el AVD está en la
página 1 del papel). No usar esa extracción como evidencia negativa.
