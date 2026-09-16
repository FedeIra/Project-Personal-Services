# Regla diagnóstica y sugerencias

> Extraído de `modeloDiagnosticoYSugerencias.docx`. 6 categorías, elegidas por Z + AVD + K-10 +
> riesgo de evolución. La skill elige UNA categoría y parte de su texto, completando los "(…)" según
> el paciente.

## 🚩 ANTES DE USAR ESTA REGLA: no basta el umbral de Z (aclarado por la profesional, 2026-09-07)

Aplicada **literalmente**, la regla sobre-diagnostica. En `informeFinal2.docx`: **AVD = 8**
(conservadas) y dos Z por debajo de −1,5 (BEM–MS Sem `≤-3`, crudo −3,11; y BEM–MS CE `-2,01`), el
resto entre −1,24 y +2,31. La regla literal ("Z < −1,5 + AVD conservadas") da **categoría 3 (DCL
clásico)**, pero el informe real es **categoría 2 (normal con fallas aisladas)**.

**Criterio de la profesional (por qué acá es fallas aisladas y no DCL):**

- **El valor CE es una submedida derivada** — es el promedio de Sem y Rec (`(Sem+Rec)/2`) — y **"no
  pesa/vale tanto"**; además la profesional lo considera **muy exigente**. Un CE bajo por sí solo
  **no configura un perfil de DCL**.
- **La memoria se lee como un proceso de tres etapas:** codificar (**AST**), evocar (**RSE**) y
  almacenar (**Rec**). Lo que gobierna el perfil del área son esos índices, no las submedidas. Acá
  el AST dio **−0,90 (conservado)**, así que la memoria como área está conservada.
- Bajo esa lectura, **estrictamente este paciente tiene fallas aisladas, no DCL.**

> **Implicancia para la skill:** **no elegir categoría en silencio.**
> 1. No tratar las submedidas derivadas (en especial **CE**, y en menor medida sus insumos Sem/Rec)
>    como disparador independiente de DCL. Pesar los **índices de área / principales** (para memoria:
>    AST, RSE, Rec); si esos están conservados y sólo caen submedidas, la lectura es **fallas
>    aisladas (categoría 2)**.
> 2. Proponer la categoría, mostrar los Z que la disparan y **cuáles son submedidas**, y dejar
>    explícito que **la decisión final es del médico** — la profesional avaló tanto la lectura clínica
>    (fallas aisladas) como quedarse con la literal (DCL) "y modificarla según criterio del médico".
>
> Sigue **sin cerrarse un umbral numérico** de "cuántas pruebas principales bajas = perfil"; para el
> caso submedida-vs-índice, el criterio de arriba alcanza.
>
> 3. **CE tampoco se narra.** Que no dispare la categoría ya estaba dicho; lo que faltaba es que en
>    los dos informes reales **CE no aparece en ningún párrafo** — ni en el de memoria, ni en el
>    recap, ni en la frase de cierre. Es valor de tabla y de gráfico, nada más. Lo mismo vale para
>    `Sem` como etiqueta: un Sem bajo se redacta como `bajo beneficio de la facilitación de claves
>    semánticas`, **nunca** como una falla de memoria semántica. Ver `mapeo-excel-a-word.md` §4.2.
>    ⚠️ La IA nombró CE en los tres lugares y etiquetó Sem como déficit (revisión 2026-09-08, §B3/§B6).

## ⚠️ Los templates se adaptan, no se copian literalmente

La versión anterior de este archivo decía que las sugerencias se devuelven "tal cual, sin redactar
nada propio". **Los dos informes reales lo contradicen**, de forma consistente:

- **La viñeta de hábitos siempre lleva un paréntesis específico del paciente:**
  - `informeFinal2.docx`: `Promover hábitos de vida saludables (estrategias de compensación, no multitarea)`
  - `informeFinal.docx`: `Promover hábitos de vida saludables (mejorar calidad del sueño y técnicas de relajación)`
  - Template (categorías 1 y 2): `Promover hábitos de vida saludables`, sin paréntesis.
- **La frase de cierre también se adapta.** `informeFinal2` es categoría 2 y cerró con
  `rendimiento cognitivo normal con leves fallas aisladas en recuperación de la memoria`, donde el
  template dice `fallas atencionales/ejecutivas aisladas` — porque en ese paciente las fallas eran
  mnésicas, no ejecutivas. `informeFinal` usó la primera oración del template de categoría 2 y
  **omitió** la segunda.

**Regla operativa:** el template es el punto de partida y la lista de viñetas se respeta (mismas
viñetas, mismo orden, sin agregar ni quitar recomendaciones clínicas). Lo que se localiza es el
paréntesis de hábitos y la redacción de la frase de cierre, para que describan a **este** paciente.
La skill no inventa recomendaciones clínicas nuevas ni cambia el sentido de una viñeta; sí ajusta la
localización, y entrega todo como borrador para revisión.

✅ **Confirmado (2026-09-07):** la profesional avaló que la skill **proponga** el paréntesis y ella lo
edite. El paréntesis se **deriva de lo que el paciente dijo en la entrevista**: si ya usa estrategias
de compensación (p. ej. anota) o ya hace actividad física, **no** se le sugiere incorporarlas. Es
decir, la localización debe leer la anamnesis, no ser genérica.

### Forma del paréntesis: sintagma nominal corto, sin explicar el razonamiento

⚠️ **Fallo observado (revisión 2026-09-08, §B8).** La IA eligió bien **qué** poner (leyó la anamnesis:
ya hace actividad física, duerme mal, refiere estrés) y mal **cómo**:

> ❌ `Promover hábitos de vida saludables (ya realiza actividad física regular —yoga y gimnasio—, por
> lo que no se sugiere incorporarla; podría orientarse a mejorar la calidad del sueño y a estrategias
> de manejo del estrés laboral/financiero referido)`
>
> ✅ `Promover hábitos de vida saludables (mejorar calidad del sueño, técnicas de manejo del estrés)`

Reglas:

- **3 a 8 palabras**, sintagma nominal o infinitivo, ítems separados por coma.
- **Sólo lo que se sugiere.** Lo que el paciente ya hace no se nombra: se omite en silencio.
- **Cero metacomentario.** `por lo que no se sugiere incorporarla` está dirigido al profesional, no
  al paciente, y la viñeta va al informe. El razonamiento —qué se descartó y por qué— va al
  **bloque 11**, donde el profesional lo lee y decide.
- Referencia de largo: los dos informes reales usan `(estrategias de compensación, no multitarea)` y
  `(mejorar calidad del sueño y técnicas de relajación)`.

## Cortes de referencia

- **K-10 (sintomatología anímica):** suma de los 10 ítems (`B53:B62`, total en `B63`) ≥ **25** ⇒ "sintomatología anímica
  relevante" presente. (No 24,5: el K-10 es una suma de 10 enteros, un resultado exacto de 24,5 es
  imposible — 25 es el mismo corte sin la falsa precisión decimal.) **Se deriva del K-10 por
  default; el profesional puede sobrescribirlo manualmente en el Excel.**
- **AVD (actividades de vida diaria):**

  | Puntaje | Interpretación | Categoría |
  |--------:|----------------|-----------|
  | 0–1 | Dependencia total | Comprometidas |
  | 2–3 | Dependencia severa | Comprometidas |
  | 4–5 | Dependencia moderada | Comprometidas |
  | 6–7 | Dependencia leve | Conservadas |
  | 8 | Independencia | Conservadas |

  Corte 0–5 = comprometidas / 6–8 = conservadas: es criterio diagnóstico del profesional (la escala
  original no distingue conservadas/comprometidas), ya confirmado.

  ⚠️ **Esta tabla clasifica; no dicta el texto del informe.** La palabra que va en la columna Z de la
  tabla de síntesis la escribe el profesional en el Excel (`D17`, columna `Z` de la fila 17) y **se copia tal cual**. Los dos
  informes usan `Autónomo` / `Autónoma` (según el género del paciente) donde esta tabla dice
  `Independencia`. No "corregir" el Excel contra esta tabla: `D17` es pass-through.
- **K-10:** la interpretación que va al Word sale de `D18` del Excel (columna `Z` de la fila 18) (`Normal` en `informeFinal2`,
  con total 15). El corte ≥ 25 se usa para **elegir categoría diagnóstica**, no para redactar esa
  celda.
- **Riesgo de evolución:** flag 100% manual, criterio clínico/observación en vivo durante la
  entrevista. La skill **nunca** debe intentar inferirlo — llega ya decidido en el Excel.
  ✅ **Ya está en el Excel: `B10` (`Riesgo de evolución`, `Si`/`No`)**, desde V3 (2026-09-15), **con
  validación de lista desde V4**. Habilita la **categoría 5**. En archivos viejos puede llegar como
  `Sí`/`si`/`SI`/`No`/`no`: normalizar tolerantemente y, si el valor no es interpretable como sí/no,
  **señalarlo** en vez de asumir "No". Ver `mapeo-excel-a-word.md` §5.e.

## Las 6 categorías

### 1. Rendimiento dentro de parámetros normales
**Regla:** Z > -1 + AVD conservadas

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en las áreas
> evaluadas, acorde a su edad y nivel educativo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico según evolución
- Promover hábitos de vida saludables
- Reevaluación en caso de cambios clínicos o persistencia de quejas

### 2. Rendimiento dentro de parámetros normales con fallas aisladas
**Regla:** Z entre -1 y -1,5 en pruebas aisladas + AVD conservadas

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en la mayoría de las
> áreas evaluadas, acorde a su edad y nivel educativo. Se observaron fallas atencionales/ejecutivas
> aisladas que, a la fecha, no impresionarían configurar un perfil cognitivo significativo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico según evolución
- Promover hábitos de vida saludables
- Reevaluación en caso de cambios clínicos o persistencia de quejas

### 3. DCL clásico (sin alertas especiales)
**Regla:** Z < -1,5 + AVD conservadas

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

### 4. DCL con compromiso anímico relevante
**Regla:** Z < -1,5 + AVD conservadas + sintomatología anímica (K-10 ≥ 25, o flag manual)

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

### 5. DCL con mayor riesgo de evolución
**Regla:** Z < -1,5 + AVD conservadas + perfil de riesgo de evolución (flag manual)

> El Sr/Sra X presentó un rendimiento cognitivo dentro de parámetros normales en (…); presentó
> puntajes más bajos a los esperados en (…). Las quejas cognitivas impresionarían no interferir
> significativamente sus actividades de la vida diaria, por lo que el perfil observado resultaría
> compatible con un deterioro cognitivo leve (…) de probable curso evolutivo.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento clínico estrecho por neurología y neuropsicología para monitoreo evolutivo
- Reevaluación en 6 a 12 meses
- Valoración cercana del impacto de las quejas cognitivas sobre las actividades de la vida
  cotidiana
- Sesiones de estimulación cognitiva orientadas a (…)

### 6. Deterioro cognitivo mayor
**Regla:** Z < -1,5 + AVD comprometidas

> El Sr/Sra X presentó un rendimiento cognitivo descendido en (…); con compromiso significativo en
> (…). Las dificultades observadas impresionarían interferir en su funcionamiento en actividades de
> la vida diaria. En este contexto, el perfil observado resultaría compatible con un deterioro
> cognitivo mayor (…) con impacto en la autonomía.

Se sugiere:
- Interpretar estos resultados considerando la clínica del paciente y el resultado en estudios
  complementarios que se consideren pertinentes
- Seguimiento por neurología y neuropsicología
- Se recomienda supervisión continua por parte del entorno familiar y/o cuidadores en actividades
  de la vida diaria
- Se sugiere evitar situaciones de riesgo asociadas a la pérdida de autonomía (ej. manejo de
  vehículos, administración de medicación)
- Orientación familiar para el manejo conductual en la vida cotidiana y posibles cambios
  comportamentales
- Considerar intervenciones de estimulación cognitiva adaptadas al perfil

## Orden de prioridad cuando varias reglas podrían aplicar

Si Z < -1,5 + AVD conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución,
**falta definir cuál prevalece** (o si el informe debe mencionar ambas). No está resuelto en
`modeloDiagnosticoYSugerencias.docx` — a confirmar con el profesional antes de cerrar el `SKILL.md`.
