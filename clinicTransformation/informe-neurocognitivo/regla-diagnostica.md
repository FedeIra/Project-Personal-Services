# Regla diagnóstica y sugerencias

> Extraído de `modeloDiagnosticoYSugerencias.docx`. 6 categorías, elegidas por Z + AVD + K-10 +
> riesgo de evolución. La skill elige UNA categoría y devuelve su texto de sugerencias tal cual
> (con los "(…)" completados según el paciente) — no debe redactar sugerencias propias.

## Cortes de referencia

- **K-10 (sintomatología anímica):** suma de los 10 ítems ≥ **25** ⇒ "sintomatología anímica
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
- **Riesgo de evolución:** flag 100% manual, criterio clínico/observación en vivo durante la
  entrevista. La skill **nunca** debe intentar inferirlo — llega ya decidido en el Excel.

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
