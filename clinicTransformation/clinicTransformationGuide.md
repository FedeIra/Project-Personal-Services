formato que recibe: dos documentos. uno es un excel (formulasExcelEvaluacion.xlsx) y otro pdf (evaluacion.pdf) y la página web de historia clinica

formato final: archivo de word (evaluacion.pdf), puede ser en google drive o un word normal que siempre sea modificable, no en pdf

PROCESO en general: llega el paciente, abre historia clinica que es una pagina online (imagenes paginaWebHistoricaClinica 1, 2, 3 y 4). Toma la evaluacion del paciente en un papel fisico (evaluacion.pdf). Toma el motivo de la consulta en una página web y otros datos más (imagenes paginaWebHistoricaClinica 1, 2, 3 y 4) y toma la evaluacion en un papel (evaluacion.pdf). A medida que va avanzando la evaluacion tiene un excel abierto que tiene formulas donde va cargando los números y el excel le va tirando puntajes (formulasExcelEvaluacion.xlsx). LLena solo las columnas de PB que es puntaje bruto, el resto de las columnas el excel automatizado las convierte en puntaje Z. Algunas de las formulas utilizan otras de las pestañas del excel, pero la pestaña en que se llenan los valores es la primer pestaña del excel que se llama "TABLA DE FORMULAS". El puntaje Z es una puntuacion universal que permite comparar un indivduo con el otro. "Yo federico le digo tantas palabras y otra persona 5 palabras. No pueden tener la misma puntuacion de los dos, porque uno de los pacientes tiene q ser distinto porque es mas viejo q el otro. Está hecho con varemos locales que dicen cuál es la media y el desvío entre el cual debería rendir. Una especie de varemo segun edad.

Además de cargar el excel carga otros detalles del paciente en la página web de la historria clinica. Al final de la historia clinica pone algo que es el diagnostico presuntivo que es lo que devuelve el varemo segun edad (paginaWebHistoriaClinica3.jpeg).

Luego, hay que hacer un informe escrito (informeFinal.docx). El objetivo del informe es ver cómo rindió en cada función cognitiva. Para eso abre un archivo de word (informeFinal.docx) en el que va completando los distintos datos que los saca de aquellos cargados en la pagina web historia clinica y de la evaluacion en papel escrito que iba completando con el paciente en vivo (evaluacion.pdf) y el excel que también fue completando en la evaluacion (formulasExcelEvaluacion.xlsx).

Lo que más se desea es una automatización para la siguiente parte que explico, sin perjuicio de que el resto estaría bueno automatizar de alguna forma: En el informe que se hace para el paciente y el médico se debe mostrar cómo rindió cognitivamente y tiene que quedar constancia por escrito de todas las pruebas que se le tomó al paciente y cómo rindió en cada una. El documento de word que tiene que entregar al paciente (informeFinal.docx) tiene una especie de cuadro que dice SINTESIS DEL RENDIMIENTO donde tiene que pasar los valores a mano desde el excel (formulasExcelEvaluacion.xlsx) al word (informeFinal.docx), poniendo a mano el valor de la columna PB y Z respecto a cada PB (puntaje bruto) esto según el excel que se realizó durante la evaluación (formulasExcelEvaluacion.xlsx), y ademas agrega una X en la columna que corresponde luego de la columna Z (Deterioro significativo con sus dos opciones, Puntajes bajos con una sola opcion, puntajes promedio con 2 opciones y puntajes superiores con 3 opciones) dependiente del valor de la columna Z ya según ese valor es que le tenes que poner la X a los distintos rangos de las columnas que le siguen.

Se carga a mano todos estos puntajes al word (informeFinal.docx) que vienen desde el excel (formulasExcelEvaluacion.xlsx).

Luego aparece un gráfico de line donde selecciona el grafico y selecciona "modificar datos en excel" y ahí aparece un excel de dos columnas donde solo se introduce el valor Z reflejando el mismo excel en sus columnas PB y Z (excelPrimerGrafico.xlsx).

Luego viene una escala sobre algo animico ("Escala K-10") que se trata también de un gráfico que se saca de la evaluacion pen la parte de Escala de Malestar Psicologico qe también se selecciona "modificar datos en excel" y ahí aparece un excel de dos columnas (excelSegundoGrafico.xlsx) donde se completa el Puntaje de cada Sintomatología s según los datos de la evaluación (evaluacion.pdf).

Luego en cada función cognitiva se debe explicar cómo rindió en palabras que se hace sobre una plantilla o informe anterior donde se va modificando según el rango de z. El archivo de evaluación.pdf ya viene con un texto sobre cómo rindio que se usa de modelo y se ajusta según los datos Z.

Luego de las funciones cognitivas viene una parte de conclusiones donde se resume lo anterior respecto a las funciones cognitivas donde dice qué función está conservada, cuál tiene un rendimiento alto, normal, bajo o deficitario que también ya viene con un texto sobre cómo rindio que se usa de modelo y se ajusta. Y concluye con un diagnóstico y sugerencias. Las sugerencias según los datos Z vienen de un archivo de word con cada tipo de diagnostico y qué sugiere en cada caso (modeloDiagnosticoYSugerencias.docx).

Una vez finalizado el archivo de word se convierte en pdf y manda por email.

---

## Actualización — el pipeline cambió (2026-09-07)

Este documento describe el flujo **original**, con dos archivos de entrada
(`formulasExcelEvaluacion.xlsx` + `evaluacion.pdf`) más la historia clínica online. Sigue siendo
válido como descripción del proceso manual, con estas correcciones:

1. **Ya existe un Excel unificado: `excelEvaluacionCompleto.xlsx`.** Mantiene la hoja
   `TABLA DE FORMULAS` con el cuadro de fórmulas original intacto y agrega debajo lo que antes sólo
   vivía en el papel o en la historia clínica online: las 36 filas de la tabla de síntesis, AVD,
   K-10, el bloque demográfico del paciente y las notas de la anamnesis. El objetivo es que sea la
   **única** entrada necesaria. Todavía no lo es — ver los faltantes en
   `planSkillInformeNeurocognitivo.md` §9.

2. **Ejemplo de informe generado desde ese Excel: `informeFinal2.docx`.** Es el par entrada/salida
   real del mismo paciente, y de ahí se reconstruyó el mapeo completo de qué celda alimenta qué
   bloque del Word: `informe-neurocognitivo/mapeo-excel-a-word.md`.

3. **Corrección de tipeo de este documento:** donde dice "el archivo de `evaluacion.pdf` ya viene con
   un texto sobre cómo rindió que se usa de modelo" debería decir **`informeFinal.docx`**. Ése es el
   archivo que se usa como referencia de tono/estilo para los párrafos por función cognitiva.

4. **Precisión sobre la tabla SÍNTESIS DEL RENDIMIENTO:** este documento dice que se pasan a mano PB
   y Z "y además agrega una X en la columna que corresponde". Correcto para las 15 pruebas con Z. Las
   otras 21 filas son cualitativas: **el valor va en la columna PB y no llevan X** (salvo AVD y
   KPDS-10, que ponen el número en PB y la palabra de interpretación en Z). Detalle en
   `informe-neurocognitivo/orden-filas-sintesis.md`.

5. **Precisión sobre los gráficos:** los valores que se pegan en "modificar datos en Excel" no son el
   Z crudo, sino el **redondeado a 2 decimales y capado en ±3**, igual que en la tabla. El segundo
   gráfico (K-10 por síntoma) todavía se transcribe del papel, porque el Excel guarda sólo el total.

6. ⚠️ **`excelEvaluacionCompleto.xlsx` e `informeFinal2.docx` contienen datos de un paciente real**
   (a diferencia de `informeFinal.docx`, que se había confirmado como ficticio). Tenerlo en cuenta
   antes de compartirlos o de incluirlos en un paquete que se sube a un servicio externo.
