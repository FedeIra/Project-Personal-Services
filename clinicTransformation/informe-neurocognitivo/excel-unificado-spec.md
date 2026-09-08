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

## ✅ Confirmado con la profesional (2026-09-07) — cambios al Excel acordados

La profesional respondió las preguntas. Ajustes acordados para el Excel (detalle e implicancia de
cada uno abajo):

1. **10 ítems del K-10** por separado, con `D28 = SUMA(...)`. *("Pasemos cada ítem al Excel.")*
2. **AST por fórmula** = promedio de los 3 trials, **truncado a 2 decimales** (no redondeado). Deja
   de cargarse a mano.
3. **IFS Índice MT (`D31`)**: **no es una fecha**; deriva de la **suma de Dígitos Atrás + Memoria de
   Trabajo Visual**. Puede salir por fórmula; como mínimo, formato Texto.
4. **Riesgo de evolución** Sí/No — determina las sugerencias diagnósticas (habilita la categoría 5).
5. **Acompañado** Sí/No + **por quién** (familiar / amigo / hijo / esposa).
6. **Orientación temporal** y **espacial** — como subpuntaje del MMSE con puntuación, **o** dos
   celdas Sí/No (a elección de la profesional al armar el Excel).
7. **C-QSM** (opcional): a veces se toma, a veces no. Cuando se toma, **corte > 3 puntos = quejas
   presentes**; cuando no, la observación deriva de la entrevista/motivo. Celda de puntaje opcional.

Los puntos 1–4 ya estaban propuestos abajo (§A.1–§A.4) y quedan **confirmados**; los puntos 5–7 son
**campos nuevos** que surgieron de las respuestas (§A.6).

---

## A. Bloqueantes — ordenados por costo/beneficio

### A.1 Formatear como texto las celdas `X/Y` (⚠️ hoy hay datos perdidos)

**Problema:** `D31` (IFS Índice MT) guarda `46302` con formato de fecha = **07/10/2026**. Se tipeó
`7/10` y Excel lo convirtió a fecha. El valor original **ya no está en el archivo**; se sabe que era
`7/10` sólo por haber leído el Word.

✅ **Confirmado (2026-09-07): no es una fecha.** El IFS Índice MT **deriva de la suma de la puntuación
de los ítems Dígitos Atrás + Memoria de Trabajo Visual.** → Mejor aún que formato Texto: si esos dos
ítems están en el Excel, `D31` puede salir **por fórmula** (`= Dígitos Atrás + MTV`) y no vuelve a
corromperse ni depende de tipeo. Si se deja manual, va en formato Texto sí o sí.

Es el arreglo más urgente porque **falla en silencio**: nada en la pantalla avisa, y el próximo
paciente puede perder otra celda.

**Ajuste:** dar formato **Texto** a todo el bloque `D25:D44` (o al menos a las celdas que reciben
`X/Y`: `D25`, `D26`, `D30`, `D31`, `D43`), una vez, y queda para siempre.
*Cómo:* seleccionar el rango → `Inicio › Formato de número › Texto`.
*Alternativa por celda:* tipear `'7/10` (apóstrofo adelante), pero es fácil de olvidar.

**Impacto en la claridad:** ninguno. Se ve exactamente igual, y de hecho **mejor**: hoy `D31` muestra
una fecha donde debería haber un puntaje.

### A.2 Desglosar el K-10 en sus 10 ítems

✅ **Confirmado (2026-09-07): "pasemos cada ítem al Excel".**

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

✅ **Confirmado (2026-09-07): "agreguemos la celda… que eso determina las sugerencias diagnósticas".**

**Problema:** sin ese campo, la **categoría 5** de `regla-diagnostica.md` (DCL con mayor riesgo de
evolución) es inalcanzable. Es criterio clínico puro: no se deriva de ningún puntaje.

**Ajuste:** una celda, con validación de datos de lista `Sí` / `No` para que no queden variantes
(`SI`, `si`, `x`, vacío).

### A.4 Agregar el C-QSM

**Problema:** el `Cuestionario de quejas subjetivas de memoria (C-QSM)` figura en `PRUEBAS
ADMINISTRADAS` y su resultado se usa en la narrativa de screening del Word, pero no tiene ninguna
celda.

✅ **Aclarado (2026-09-07):** el C-QSM **a veces se toma y a veces no** (antes figuraba fijo en
PRUEBAS ADMINISTRADAS por error).
- **Cuando se toma:** la presencia/ausencia de quejas la determina un **corte > 3 puntos** (más de 3 =
  quejas presentes). → Conviene una **celda de puntaje opcional**; la skill deriva la frase de
  screening del corte.
- **Cuando no se toma:** la observación de quejas **deriva de la entrevista inicial / motivo de
  consulta** (las notas de anamnesis), no de un puntaje.

**Ajuste:** una celda de puntaje **opcional** (vacía si no se tomó). La skill: si hay puntaje, aplica
el corte > 3; si no, toma la observación de la anamnesis. No es fila obligatoria de la tabla de
síntesis.

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

### A.6 BEM–MS AST por fórmula (confirmado)

✅ **Confirmado (2026-09-07):** el PB de AST **es el promedio de los 3 trials** y la profesional
prefiere que **se calcule solo**, dejándolo **truncado a 2 decimales** (no redondeado). Hoy `L14`
(`=(K14+K15+K16)/3`) ya hace el promedio pero el PB `D13` se carga a mano y quedó `7,66` (truncado,
correcto).

**Ajuste:** `D13` → fórmula que trunca `L14` a 2 decimales, p. ej. `=TRUNCAR(L14; 2)`. Así el PB no
depende de cómo se redondeó ese día y el Z sale consistente. (Ver `mapeo-excel-a-word.md` §Bloque
auxiliar.)

### A.7 Campos nuevos que surgieron de las respuestas

Tres datos que hoy salen del papel / la historia clínica y la profesional acordó llevar al Excel:

- **Acompañado** Sí/No + **por quién** (familiar / amigo / hijo / esposa). Alimenta el primer párrafo
  de la anamnesis (`asiste solo/acompañado`). Validación de lista en ambas celdas.
- **Orientación temporal** y **espacial** — alimentan la frase de screening (`orientación temporal y
  espacial conservadas`). Dos opciones a elección de la profesional al armar el Excel: (a) subpuntaje
  del MMSE con puntuación, o (b) dos celdas Sí/No. Con cualquiera, la skill arma la frase y avisa si
  alguna **no** está conservada.
- **C-QSM** — celda de puntaje opcional (ver §A.4).

Ninguno bloquea el pipeline actual del mismo modo que §A.1–§A.4, pero sin ellos esas frases del
informe siguen dependiendo del papel / la historia clínica.

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
  ningún Z en un límite exacto, así que no lo resuelven. **(Sigue abierto.)**
- **Prioridad entre categorías** cuando aplican simultáneamente compromiso anímico (K-10 ≥ 25) y
  riesgo de evolución. `informeFinal2` es categoría 2, no toca el caso. **(Sigue abierto.)**

Resueltos el 2026-09-07 (ya no pendientes): el **léxico Z → palabra** quedó confirmado
(`mapeo-excel-a-word.md` §4.2), y el **C-QSM** no es fila obligatoria de la tabla de síntesis (§A.4).
