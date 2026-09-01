# Opciones de Automatización — Informes Neurocognitivos

> Brainstorm inicial (sin plan todavía). Retomar desde acá.

## Aviso de privacidad

Las capturas (`paginaWebHistoriaClinica*.jpeg`) y `informeFinal.docx` contienen datos reales de
pacientes (nombre, DNI, teléfono, email, diagnóstico — casos "Bertagni, Paula" y "Barneda, Carlos").
Antes de usarlos como ejemplo con un LLM externo o de subirlos a cualquier lado fuera de este repo
privado, anonimizarlos. Aplica tanto por buena práctica como por la Ley 25.326 de protección de
datos personales.

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

Carpeta tipo skill con: tablas de normas extraídas del Excel en formato legible, los 6 templates de
`modeloDiagnosticoYSugerencias.docx`, un ejemplo anonimizado de `informeFinal.docx` como referencia
de estilo/tono, e instrucciones de qué debe producir el LLM (los párrafos Nivel 2, pasándole los
PB/Z ya calculados por Excel — no se le pide que haga la aritmética).

- **Pros:** esfuerzo mínimo, funciona con cualquier LLM, no toca infraestructura, iteración rápida
  del tono de los párrafos.
- **Contras:** sigue siendo manual por paciente (subir archivos, copiar la respuesta al Word), no
  resuelve la transcripción Excel→Word de los puntajes salvo que también se le pida armar la tabla,
  sin historial ni persistencia, calidad 100% dependiente del prompt.

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
  conversión docx→pdf en Lambda, diseñar el modelo de datos de pacientes con el mismo cuidado que
  `ENCRYPTION_KEY` en `account-services` (acá es PHI real, no solo credenciales).

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
