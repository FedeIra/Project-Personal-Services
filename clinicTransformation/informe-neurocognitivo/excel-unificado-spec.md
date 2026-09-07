# Excel unificado — estado del archivo entregado y ajustes propuestos

> **Actualizado tras recibir `excelEvaluacionCompleto.xlsx`.** Este archivo dejó de ser una spec "a
> mandar" y pasó a ser la **revisión del Excel real**: qué quedó cubierto, qué falta, y los ajustes
> mínimos para que la IA pueda leerlo sin perder claridad para quien lo completa.
>
> El esquema celda por celda está en `mapeo-excel-a-word.md` §1. Acá va sólo el veredicto y los
> ajustes.

## Veredicto general

El archivo es **un salto grande**: incorporó las 36 filas de la tabla de síntesis, el bloque
demográfico, la interpretación de AVD y K-10, y — algo que no estaba pedido y resultó muy útil — las
**notas de anamnesis** (`B55:B64`), que son la única fuente del bloque `MOTIVO DE CONSULTA Y
ANTECEDENTES` del Word.

Está claro y bien organizado para la persona que lo completa: mantiene el cuadro de fórmulas
original intacto y agrega los bloques nuevos debajo, con la misma lógica visual.

**Pero todavía no alcanza para generar la evaluación final sin otros archivos.** Hay tres faltantes
que bloquean partes concretas del informe (§A.2, §A.3, §A.4) y una celda con datos corrompidos
(§A.1). Con esos cuatro arreglos — todos de una a diez celdas — el objetivo de "un solo archivo" se
cumple.

---

## A. Bloqueantes — ordenados por costo/beneficio

### A.1 Formatear como texto las celdas `X/Y` (⚠️ hoy hay datos perdidos)

**Problema:** `D31` (IFS Índice MT) guarda `46302` con formato de fecha = **07/10/2026**. Se tipeó
`7/10` y Excel lo convirtió a fecha. El valor original **ya no está en el archivo**; se sabe que era
`7/10` sólo por haber leído el Word.

Es el arreglo más urgente porque **falla en silencio**: nada en la pantalla avisa, y el próximo
paciente puede perder otra celda.

**Ajuste:** dar formato **Texto** a todo el bloque `D25:D44` (o al menos a las celdas que reciben
`X/Y`: `D25`, `D26`, `D30`, `D31`, `D43`), una vez, y queda para siempre.
*Cómo:* seleccionar el rango → `Inicio › Formato de número › Texto`.
*Alternativa por celda:* tipear `'7/10` (apóstrofo adelante), pero es fácil de olvidar.

**Impacto en la claridad:** ninguno. Se ve exactamente igual, y de hecho **mejor**: hoy `D31` muestra
una fecha donde debería haber un puntaje.

### A.2 Desglosar el K-10 en sus 10 ítems

**Problema:** el gráfico `Escala K-10` del Word necesita los 10 puntajes por síntoma. El Excel guarda
sólo el total (`D28` = `15`). Ese bloque del informe **no se puede generar desde el Excel**.

**Ajuste:** 10 celdas nuevas, en este orden exacto (el del cuestionario en papel y el del gráfico,
ver `orden-categorias-graficos.md`):

| # | Síntoma | | # | Síntoma |
|---|---|---|---|---|
| 1 | Cansancio | | 6 | Inquietud + |
| 2 | Nervios | | 7 | Depresión |
| 3 | Nervios + | | 8 | Esfuerzo |
| 4 | Desesperanza | | 9 | Tristeza |
| 5 | Inquietud | | 10 | Inutilidad |

Y que **`D28` pase a ser `=SUMA(...)` de esas 10 celdas** en vez de un número tipeado. Así el total
no puede quedar desincronizado de los ítems.

**Impacto en la claridad:** positivo. Hoy los 10 ítems se transcriben del papel directo al gráfico
del Word; con esto se cargan una sola vez, en el mismo lugar que todo el resto, y el total se calcula
solo.

### A.3 Agregar el flag "Riesgo de evolución" (Sí/No)

**Problema:** sin ese campo, la **categoría 5** de `regla-diagnostica.md` (DCL con mayor riesgo de
evolución) es inalcanzable. Es criterio clínico puro: no se deriva de ningún puntaje.

**Ajuste:** una celda, con validación de datos de lista `Sí` / `No` para que no queden variantes
(`SI`, `si`, `x`, vacío).

### A.4 Agregar el C-QSM

**Problema:** el `Cuestionario de quejas subjetivas de memoria (C-QSM)` figura en `PRUEBAS
ADMINISTRADAS` y su resultado se usa en la narrativa de screening del Word, pero no tiene ninguna
celda. Es el único test administrado sin lugar en el archivo.

**Ajuste:** una fila (puntaje y/o interpretación), en el bloque cualitativo. **A confirmar** si va
además como fila de la tabla de síntesis del Word — hoy no está ahí.

### A.5 Unificar los dos bloques demográficos

**Problema:** la edad y el nivel educativo están cargados **dos veces**, y ya divergieron:

| Dato | Celda que maneja las fórmulas | Celda que va al Word | Estado |
|---|---|---|---|
| Edad | `C4` = `61` | `C47` = `61 años` | duplicado |
| Nivel educativo | `C5` = `Terciario` | `C49` = `Terciario ` | **ya divergen** (espacio final) |

`C4` es lo que decide **contra qué norma de edad se compara todo el informe**. Si alguna vez se
actualiza `C47` y no `C4`, el informe sale con las normas del paciente anterior y nada lo señala.

**Ajuste:** elegir un bloque como canónico y que el otro lo referencie por fórmula. Concretamente:
`C47` → `=C4 & " años"` y `C49` → `=C5`. Se carga en un solo lugar y no puede desincronizarse.

**Impacto en la claridad:** positivo — se completa un campo menos por paciente.

Bonus del mismo arreglo: `C3` ("Nombre") está vacía y el nombre real vive en `C46`. O se borra el
rótulo `B3`/`C3`, o `C3` → `=C46`.

---

## B. Ajustes opcionales — no bloquean nada

### B.1 Rótulos de área en los bloques cualitativos

En el cuadro con Z las áreas están en la columna `B` con celdas combinadas (`B8:B12`, `B13:B19`,
`B20:B22`). En los bloques cualitativos (`C25:C28`, `C30:C39`, `C41:C44`) **no hay rótulo de área**,
aunque en el Word esas filas sí pertenecen a un área (Screening, Atención, Memoria, Lenguaje,
Visoconstrucción).

No es bloqueante: el orden de las 36 filas es fijo y está documentado en `orden-filas-sintesis.md`,
así que la asignación de área es posicional. Agregar los rótulos haría al archivo autoexplicativo y
más robusto si alguna vez se reordena algo.

### B.2 Cerrar la nota truncada de `B58`

`B58` termina en `- QSM: olvida cosas puntuales (fue a un partido y por ahi ` — paréntesis sin
cerrar, frase cortada. **La celda está así en el archivo**, no es un problema de lectura: se perdió
parte de la nota de la entrevista. Nada que "arreglar" en el diseño; sólo vale saber que puede pasar
al tipear notas largas.

### B.3 Separador decimal en los textos `X/Y` — cosmético, prioridad baja

Hoy conviven `26,5/30` (coma) y `9.5/10` (punto) en el Excel, y el Word tiene `9,5/10` en la fila 2 y
`9.5/10` en la fila 35 — o sea, se editó una a mano.

**No afecta el procesamiento por IA**: son cadenas de texto que se copian tal cual al Word, no se
parsean como número. Es una inconsistencia estética del informe entregado. Se menciona sólo para que
no compita en prioridad con §A.1, que sí destruye datos.

⚠️ Ojo: unificar a coma **no** sería obligatorio, pero unificar a punto tampoco resuelve nada, y
tocar el formato de estas celdas sin haber hecho §A.1 primero es lo que causó la corrupción de `D31`.
**Hacer §A.1 antes que esto.**

### B.4 Lo que expresamente NO conviene hacer

- **No agregar las 8 columnas de rango** ("Deterioro significativo / Puntajes bajos / promedio /
  superiores") al Excel. Se derivan del Z de forma determinística al armar el bloque de Word (ver
  `orden-filas-sintesis.md`). Ponerlas en el Excel es trabajo manual duplicado.
- **No hacer una hoja paralela "para la IA"** con los mismos datos en formato máquina. Duplica el
  mantenimiento del profesional y crea una segunda fuente que puede divergir — el mismo problema de
  §A.5, a mayor escala. Los ajustes de §A alcanzan.
- **No mover las 15 filas del cuadro de fórmulas** (`C8:H22`). Están referenciadas por las fórmulas y
  por los rangos `PRUEBAS`/`FLUENCIAS`.
- **No agregar DNI ni ocupación.** La tabla de datos personales del Word no los tiene en ninguno de
  los dos informes; los campos reales son los de `C46:C51` (+ `Deriva` opcional).

---

## C. Recordatorio operativo (sigue vigente)

Guardar el archivo **en Excel** antes de mandarlo — no sólo cerrarlo, ni editarlo con otro programa.
Las celdas con fórmula (`E`, `G`, `H`, `L14`, `K19`) sólo tienen el valor calculado cacheado si Excel
lo guardó; si no, pueden leerse vacías al procesarlas por código.

---

## D. Sigue pendiente de confirmar con el profesional

> Lista completa y redactada para llevar a una conversación: `../preguntasParaLaProfesional.md`.
> Lo de abajo es sólo lo que toca a este archivo.

- **Desempate en los rangos de la X** cuando el Z cae justo en un límite (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Propuesta: límite inferior inclusive, superior exclusivo. No afecta el diseño del
  Excel, sí a quien complete la tabla de síntesis. Los dos informes disponibles **no** contienen
  ningún Z en un límite exacto, así que no lo resuelven.
- **Prioridad entre categorías** cuando aplican simultáneamente compromiso anímico (K-10 ≥ 25) y
  riesgo de evolución. `informeFinal2` es categoría 2, no toca el caso.
- **Léxico Z → palabra** de los párrafos narrativos (`alto` / `conservado` / `bajo no deficitario` /
  `deficitario`): hoy está **inferido** de los dos informes, no entregado. Ver
  `mapeo-excel-a-word.md` §4.2.
- **Si el C-QSM debe ser además una fila de la tabla de síntesis** (§A.4).
