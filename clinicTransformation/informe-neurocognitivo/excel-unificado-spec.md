# Excel unificado — estado del archivo entregado y ajustes pendientes

> **Revisión de `excelEvaluacionCompletoV4.xlsx` (recibido 2026-09-15, verificado por código).** Este archivo no es una spec
> "a mandar": es el **veredicto sobre el Excel real** — qué quedó cubierto, qué falta y los ajustes
> mínimos que quedan.
>
> El esquema celda por celda está en `mapeo-excel-a-word.md` §1, que es la **única fuente de
> direcciones** del paquete. Acá va sólo el estado y los ajustes.

## Veredicto general

**V3 cierra todos los faltantes bloqueantes.** Con este archivo **no queda ningún bloque del informe
que no se pueda generar desde el Excel**: los 10 ítems del K-10 habilitan el gráfico 2, el flag de
riesgo de evolución habilita la categoría 5, la orientación temporal/espacial completa la frase 3 del
screening, el `IFS Índice MT` dejó de corromperse y el bloque demográfico quedó unificado con el de
parámetros.

**V4 (2026-09-15) aplicó §A.4, §A.6, §A.8 y casi todo §A.9**, y está **verificado por código**:
`C18`=`=B60`, `C34`=`=TRUNC(Q35,2)`, `C38`=`=TRUNC(P40,2)`, `B62`=`2`, validación de lista en `B10`
y en `B5`. Todos los valores cacheados están presentes y son coherentes con sus fórmulas, así que el
archivo se puede leer por código sin reabrirlo en Excel.

Queda **un error a corregir** (§A.9, la lista de `B6`), **dos validaciones que no se aplicaron**
(`C14`/`C15`) y **dos preguntas de criterio** (§A.10, §A.11). Ninguno impide generar el informe.

---

## Lo que V3 y V4 resolvieron

| Punto | Qué pedía | Cómo quedó en V3 |
|---|---|---|
| **A.1** Celdas `X/Y` formateadas como texto | evitar la autoconversión a serial de fecha del `IFS Índice MT` | ✅ `C25` es **texto** (`7/10`). Todas las celdas `X/Y` del cuadro son cadenas. |
| **A.2** Desglosar el K-10 en sus 10 ítems | habilitar el gráfico `Escala K-10` | ✅ `A50:A59` rótulos + `B50:B59` puntajes, **en el orden del cuestionario y del gráfico**, con `B60` = `=SUMA(B50:B59)`. |
| **A.3** Flag `Riesgo de evolución` Sí/No | habilitar la categoría 5 de `regla-diagnostica.md` | ✅ `B10`, con validación de lista `Si`/`No` desde V4. |
| **A.5** Unificar los dos bloques demográficos | que la edad/nivel educativo no vivan en dos lugares | ✅ **Resuelto de raíz.** V3 tiene **un solo** bloque (`A1:B10`) y es el que manejan los `VLOOKUP`. Ya no puede desincronizarse, y se completa un campo menos por paciente. |
| **A.7** Orientación temporal y espacial | completar la frase 3 del screening | ✅ `C14` y `C15`, `Si`/`No`, dentro del cuadro de pruebas. |
| **A.7** Campo de acompañamiento | primera frase de la anamnesis | ⚠️ **Parcial** — existe `B8` pero con otro rótulo y otro dominio (§A.10). |
| **B.1** Rótulos de área en los bloques cualitativos | hacer el archivo autoexplicativo | ✅ `A13`/`A19`/`A34`/`A41`/`A46` rotulan los 5 grupos. Además **no hay celdas combinadas** en toda la hoja, así que la lectura por código es directa. |
| **A.6** PB de AST por fórmula | que el PB no dependa de cómo se redondeó ese día | ✅ **Aplicado 2026-09-15**, y extendido al PB de CE. Ver §A.6 — falta reemplazar la copia del repo para verificarlo. |
| **A.8** Total del K-10 por fórmula | que el total de la tabla no se desincronice de los 10 ítems | ✅ **Aplicado 2026-09-15**: `C18` = `=B60`. Falta reemplazar la copia del repo para verificarlo. |
| *(nuevo)* Campo de derivante | la fila `Deriva:` que tiene `informeFinal.docx` | ✅ `B9` (`Derivado por`). El **dato** ya no hay que buscarlo fuera del Excel; la **presencia** de la fila la sigue decidiendo la plantilla del profesional (`informeFinal.docx` la trae con `-`, `informeFinal2.docx` no la trae). |

Bonus no pedido: `C3` (el rótulo "Nombre" que quedaba vacío en V1) desapareció — el nombre vive sólo
en `B2`.

---

## A. Ajustes pendientes

### A.4 ✅ `C-QSM`: celda de puntaje opcional (aplicada en V4; no hay fórmula posible)

`A62` dice `C-QSM` y **no hay nada debajo**. Lo acordado era una **celda de puntaje opcional**
(vacía si no se tomó).

**No se puede derivar por fórmula.** A diferencia del `IFS Índice MT` (= Dígitos Atrás + MTV) o del
`BEM–MS CE` (= `(Sem+Rec)/2`), el C-QSM es un **cuestionario autoinformado aparte**: no hay ningún
insumo en la hoja del que pueda salir. Si se toma, el puntaje se tipea; si no, la celda queda vacía.

**Es un número, pero nunca aparece en el informe.** Verificado en los dos Word:

- **No** es fila de la tabla de síntesis (36 filas, ninguna es C-QSM).
- **No** está en ninguno de los dos gráficos.
- **No** aparece como puntaje en ningún párrafo.

Lo único que produce es un **binario** que decide media frase del screening (frase 5, §4.1 de
`mapeo-excel-a-word.md`): con **corte > 3** hay quejas presentes, y la negación se recorta a
`…no reporta sintomatología vinculada al malestar psicológico.`. Si no se tomó, esa observación
**deriva de la anamnesis / motivo de consulta**, que es lo que hacen hoy los dos informes reales.

**Y efectivamente no va en toda evaluación** — está a la vista en los archivos:

| Informe | `PRUEBAS ADMINISTRADAS` | C-QSM |
|---|---|---|
| `informeFinal.docx` | 11 ítems | **no lo lista** |
| `informeFinal2.docx` | 12 ítems | sí lo lista |

✅ **Aplicado en V4: `B62` = `2`** (número entero, sin denominador — el formato recomendado). Para
esta paciente eso es **≤ 3 ⇒ sin quejas subjetivas significativas**, así que la frase 5 del screening
va completa.

**Por qué la celda vale la pena aunque el campo sea opcional:** una celda de puntaje en
`B62`, con el rótulo aclarando que va vacía si no se tomó. El valor no es que aporte un dato al
informe — es que **distingue "no se tomó" de "se tomó y no se cargó"**, que hoy son
indistinguibles. Con la celda vacía la skill sabe que tiene que avisar que **la línea del C-QSM se
borra de `PRUEBAS ADMINISTRADAS`**; sin la celda, sólo puede suponerlo.

#### Qué valor va y en qué celda

El puntaje va en **`B62`**, al lado del rótulo — mismo patrón que el bloque de arriba
(`A50:A59` rótulos / `B50:B59` valores) y que `A49`/`B49`.

Va como **número entero suelto**, no como `X/Y`. Es el mismo criterio que ya usan las otras dos
celdas cuyo valor sólo sirve para cruzar un corte:

| Celda | Prueba | Formato | Por qué |
|---|---|---|---|
| `C17` | AVD | `8` — número | el corte (0–5 / 6–8) decide la interpretación |
| `C18` | KPDS-10 | `24` — número | el corte (≥ 25) decide la categoría |
| **`B62`** | **C-QSM** | **número** | **el corte (> 3) decide si hay quejas** |

(Las que sí van como texto `X/Y` — `C13` MMSE, `C16` TRO, `C24` IFS Total, `C25` Índice MT — son las
que se **muestran** en el informe con esa forma. El C-QSM no se muestra nunca, así que no necesita
el denominador.)

Ejemplos, con la única regla confirmada (corte > 3):

| `B62` | Lectura | Efecto en la frase 5 del screening |
|---|---|---|
| *(vacía)* | no se tomó | la observación deriva de la anamnesis · **avisar que la línea del C-QSM se borra de `PRUEBAS ADMINISTRADAS`** |
| `2` | ≤ 3 → sin quejas significativas | frase completa: `…no reporta sintomatología vinculada al malestar psicológico ni quejas subjetivas de memoria significativas.` |
| `5` | > 3 → quejas presentes | la negación se recorta a `…no reporta sintomatología vinculada al malestar psicológico.` |

⚠️ **El puntaje máximo del cuestionario no está confirmado** — `../evaluacion.pdf` usa codificación de
fuente propia y no se puede leer por código. Los ejemplos de arriba sólo respetan el corte > 3, que sí
está confirmado (2026-09-07). Si el formulario en papel puntúa sobre un máximo y la profesional
prefiere anotarlo como `X/Y`, la celda va en **formato Texto** — pero conviene el número suelto: la
skill tendría que parsear el numerador para aplicar el corte, y eso es una fuente de error extra por
un dato que no se imprime.

### A.6 ✅ PB por fórmula — `BEM–MS AST` y `BEM–MS CE` (aplicado y verificado en V4)

✅ Confirmado (2026-09-07): el PB de AST **es el promedio de los 3 trials**, **truncado a 2
decimales** (no redondeado), y la profesional prefiere que se calcule solo.

**Aplicado por la profesional (2026-09-15)**, extendiendo la misma lógica al CE:

| Celda | Fórmula | Insumo |
|---|---|---|
| `C34` (PB de AST) | `=TRUNCAR(Q35;2)` | `Q35` = `(P35+P36+P37)/3`, el promedio de los 3 ensayos |
| `C38` (PB de CE) | `=TRUNCAR(P40;2)` | `P40` = `(C36+C37)/2`, el promedio de Sem y Rec |

**Por qué en AST no era cosmético:** truncar y redondear dan PB distintos y **el PB mueve el Z**. Con
un promedio de `7,6667`, el PB correcto es `7,66` (Z `-0,90`); `7,67` daría Z `-0,89`. Con la
fórmula el PB deja de depender de cómo se redondeó ese día.

ℹ️ **En CE el truncado es inocuo pero el cambio igual suma.** `(Sem+Rec)/2` sobre dos enteros da
siempre `,0` o `,5`: nunca hay un tercer decimal que truncar, así que `TRUNCAR` no puede cambiar el
número (`10,5` sigue siendo `10,5`). Lo que sí gana es lo mismo que en AST y en §A.8: **elimina la
doble carga manual** — antes `C38` se tipeaba y `P40` sólo lo chequeaba; ahora hay una sola fuente y
no pueden divergir. `P40` pasó de celda de control a **insumo**.

✅ **Verificado en V4:** `C34` = `=TRUNC(Q35,2)` → `10` (ensayos 7, 11, 12 → `Q35` = 10) y `C38` =
`=TRUNC(P40,2)` → `12` (Sem 12, Rec 12 → `P40` = 12). Los dos con el valor cacheado coherente.
(Excel guarda `TRUNCAR` como `TRUNC` en el XML; es lo mismo.)

**La skill sigue usando el PB tal como viene** y no recalcula el Z. Como guarda para archivos
viejos, compara `C34` con `TRUNCAR(Q35;2)` y `C38` con `TRUNCAR(P40;2)`; si no coinciden, lo señala
en el bloque 11.

### A.8 ✅ Total del K-10 por fórmula (aplicado y verificado en V4)

`C18` (el PB del K-10 que va a la tabla de síntesis) era un número tipeado mientras `B60` ya era
`=SUMA(B50:B59)`: el mismo modo de falla de §A.5 a menor escala — dos celdas con el mismo dato,
cargadas por separado, sin nada que avise si divergen.

**Aplicado:** `C18` → `=B60`. Los 10 ítems se cargan una sola vez y el total de la tabla de síntesis,
el del gráfico y el que dispara el corte ≥ 25 **no pueden desincronizarse**.

✅ **Verificado en V4:** `C18` = `=B60` → `24`, coherente con `B60` = `=SUM(B50:B59)` = `24`.

ℹ️ Nota para `regla-diagnostica.md`: el corte de sintomatología anímica se deriva del K-10 por
default, pero la profesional puede sobrescribirlo. Ahora eso implica **pisar una fórmula** en `C18`,
no editar un número suelto — si algún archivo llega con `C18` tipeado y distinto de `B60`, puede ser
un override deliberado: **señalarlo, no corregirlo**.

### A.9 Validación de lista en los campos Sí/No y en lateralidad

**Estado en V4 (verificado por código):**

| Celda | Validación | Estado |
|---|---|---|
| `B10` Riesgo de evolución | lista `"Si,No"` | ✅ correcta |
| `B5` Nivel educativo | lista → `FLUENCIAS!$B$2:$D$2` | ✅ **la mejor implementación posible** — apunta a los encabezados reales, así que no puede desfasarse de la hoja de normas |
| `B6` Lateralidad | lista `"Diestro,Zurdo,Ambidiestro"` | 🚩 **incompleta — corregir** |
| `C14`/`C15` Orientación | *(sin validación)* | pendiente |

#### 🚩 `B6`: la lista sólo tiene las formas masculinas

El origen cargado es `Diestro,Zurdo,Ambidiestro`, pero **el valor actual de la celda es `Diestra`** —
o sea, la celda incumple su propia lista. Excel no lo marca porque la validación sólo controla lo que
se tipea **después** de crearla; el valor que ya estaba queda intacto y en silencio.

El valor se copia **verbatim** a la tabla de datos personales del Word, así que tiene que concordar
en género con el paciente (`informeFinal.docx`: `Diestra`; Excel V1: `Diestro`). Con esta lista, el
próximo paciente varón se carga bien pero **una paciente mujer no tiene opción válida**.

**Corrección — reemplazar el origen por:**

```
Diestro;Diestra;Zurdo;Zurda;Ambidiestro;Ambidiestra
```

Después, volver a elegir `Diestra` en `B6` desde el desplegable para que la celda quede consistente.
Para detectar casos así: **Datos** → flecha de **Validación de datos** → **Rodear con un círculo los
datos no válidos**.

#### Cómo aplicar una validación (por si hace falta para `C14`/`C15`)

1. Seleccionar la celda. Para las dos juntas: clic en `C14`, **Ctrl** + clic en `C15`.
2. Pestaña **Datos** → *Herramientas de datos* → **Validación de datos** → **Validación de datos…**
3. Pestaña **Configuración**: *Permitir* = **Lista**; *Origen* = `Si;No`; dejar tildado **Celda con
   lista desplegable**.
4. Pestaña **Mensaje de error**: *Estilo* = **Detener** (con *Advertencia* o *Información* el valor
   entra igual).
5. **Aceptar.**

ℹ️ El separador que se tipea depende de la configuración regional (`;` acá, el mismo de
`=TRUNCAR(Q35;2)`), pero Excel lo **guarda siempre con coma** en el XML — por eso `B10` figura como
`"Si,No"` aunque se haya escrito con punto y coma. No es un error.

🚩 **Usar `Si` sin tilde.** Los valores ya cargados en `B10`, `C14` y `C15` son `Si`/`No` sin tilde, y
la lista de `B10` ya quedó definida así. Mantener la coherencia.

Sin validación la skill normaliza tolerantemente (mayúsculas/minúsculas, con y sin tilde), pero un
valor no interpretable se queda en "señalarlo y no asumir", que es un ida y vuelta evitable.

### A.10 `B8` quedó como `Asiste acompañado con`, no como `Atiende: Solo / Pareja`

Lo acordado era un campo con dominio **`Solo` / `Pareja`**. El rótulo de V3 termina en "con", que pide
un nombre o un vínculo, pero el valor cargado es `No`.

Las dos lecturas son plausibles y la frase de apertura de la anamnesis depende de esto
(`asiste sola a la consulta` vs `asiste acompañada por su …`).

**Pregunta para la profesional:** ¿el campo es Sí/No, o es "con quién"? Mientras tanto la skill lee
`No` o vacío ⇒ `asiste solo/a`; cualquier otro texto ⇒ `asiste acompañado/a por <texto>` — y lo deja
anotado en el bloque 11.

### A.11 Las dos filas de TRO traen valores distintos

`C16` (TRO en screening) = `10/10` y `C46` (TRO en visoconstrucción) = `9.5/10`. En V1 y en los dos
informes reales, las dos apariciones de TRO llevan **el mismo** valor.

Puede ser una distinción real (dos criterios de puntuación sobre la misma prueba) o una celda que
quedó vieja. **La skill no las reconcilia**: copia cada celda en su fila y anota la diferencia en el
bloque 11.

**Pregunta para la profesional:** ¿son dos puntuaciones distintas a propósito?

---

## B. Ajustes opcionales — no bloquean nada

### B.2 La nota truncada de `A67`

`A67` termina en `QSM: olvida cosas puntuales (fue a un partido y por ahi ` — paréntesis sin cerrar,
frase cortada. **La celda está así en el archivo**, no es un problema de lectura: son notas tomadas en
vivo con el paciente enfrente y a veces quedan a medias. Irrecuperable; la skill la deja como está y
lo señala **sólo en el bloque 11**, nunca comentando el estado del dato dentro del informe.

### B.3 Separador decimal en los textos `X/Y` — cosmético, prioridad baja

Conviven valores con coma y con punto (`27/30`, `9.5/10`). **No afecta el procesamiento por IA**: son
cadenas de texto que se copian tal cual al Word, no se parsean como número. Es una inconsistencia
estética del informe entregado.

⚠️ Ojo: en V1 fue justamente tocar el formato de estas celdas lo que corrompió el `IFS Índice MT`.
Ahora están en Texto y el riesgo desapareció, pero **unificar el separador no aporta nada
funcional** — no vale el riesgo de reformatear el bloque.

### B.4 Lo que expresamente NO conviene hacer

- **No agregar filas de orientación a la tabla de síntesis.** `C14`/`C15` son nuevas en el Excel pero
  **no** son filas del informe: la tabla del Word tiene **36 filas** en los dos informes reales y la
  orientación no está en ninguno. Alimentan la frase 3 del screening y nada más.
- **No agregar las 8 columnas de rango cargadas a mano.** Se derivan del Z de forma determinística
  (ver `orden-filas-sintesis.md`), así que tipearlas es trabajo duplicado.
  🔜 **Ojo: esto no vale si se agregan por fórmula.** Hay una propuesta abierta de que el Excel arme
  la tabla entera en una hoja derivada (`TABLA INFORME`) y el paso al Word sea un copy/paste, con lo
  que la IA dejaría de transcribir números. Ahí las 8 columnas **sí** van, calculadas. Detalle,
  fórmulas y la prueba que falta hacer: `../clinicTransformationGuide.md` §5, "Para retomar".
- **No hacer una hoja paralela "para la IA"** con los mismos datos en formato máquina. Duplica el
  mantenimiento y crea una segunda fuente que puede divergir — el mismo problema que V3 acaba de
  eliminar en los demográficos, a mayor escala.
- **No mover el cuadro de pruebas** (`A12:D47`) ni los bloques auxiliares (`L29:M43`, `O34:Q40`).
  Están referenciados por las fórmulas y por los rangos de `PRUEBAS`/`FLUENCIAS`.
- **No agregar DNI ni ocupación.** La tabla de datos personales del Word no los tiene en ninguno de
  los dos informes; los campos reales son `B2:B7` + `Deriva` (`B9`) opcional.

---

## C. Recordatorio operativo (sigue vigente)

Guardar el archivo **en Excel** antes de mandarlo — no sólo cerrarlo, ni editarlo con otro programa.
Las celdas con fórmula (la columna `D` de las filas con Z, `L29:M43`, `Q35`, `P40`, `B60`) sólo tienen
el valor calculado cacheado si Excel lo guardó; si no, pueden leerse vacías al procesarlas por código.

---

## D. Sigue pendiente de confirmar con la profesional

> Las dos primeras (§A.10 y §A.11) **nacieron con V3 y todavía no están** en
> `../preguntasParaLaProfesional.md`: agregarlas ahí antes de la próxima conversación. El resto de
> las preguntas abiertas del proyecto sí está en ese archivo.

- **El formato de `B8`** (§A.10): Sí/No o "con quién".
- **Las dos puntuaciones de TRO** (§A.11): ¿distinción real o celda vieja?
- **Desempate en los rangos de la X** cuando el Z cae justo en un límite (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Propuesta: límite inferior inclusive, superior exclusivo. No afecta el diseño del
  Excel, sí a quien complete la tabla de síntesis. Los informes disponibles **no** contienen ningún Z
  en un límite exacto, así que no lo resuelven. **(Sigue abierto.)**
- **Prioridad entre categorías** cuando aplican simultáneamente compromiso anímico (K-10 ≥ 25) y
  riesgo de evolución. Ahora que `B10` existe, el caso **es alcanzable** y la prioridad importa.
  **(Sigue abierto.)**

Resueltos el 2026-09-07 (ya no pendientes): el **léxico Z → palabra** quedó confirmado
(`mapeo-excel-a-word.md` §4.2), y el **C-QSM** no es fila obligatoria de la tabla de síntesis (§A.4).
