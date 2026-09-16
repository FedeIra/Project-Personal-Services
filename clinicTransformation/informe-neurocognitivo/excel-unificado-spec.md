# Excel unificado — estado del archivo entregado y ajustes pendientes

> **Revisión de `excelEvaluacionCompletoV5.xlsx` (recibido 2026-09-16, verificado por código).** Este archivo no es una spec
> "a mandar": es el **veredicto sobre el Excel real** — qué quedó cubierto, qué falta y los ajustes
> mínimos que quedan.
>
> El esquema celda por celda está en `mapeo-excel-a-word.md` §1, que es la **única fuente de
> direcciones** del paquete. Acá va sólo el estado y los ajustes.

## Veredicto general

**V5 cierra todos los faltantes bloqueantes y automatiza la elección del tramo.** No queda ningún
bloque del informe que no se pueda generar desde el Excel: los 10 ítems del K-10 habilitan el gráfico
2, el flag de riesgo de evolución habilita la categoría 5, la orientación temporal/espacial completa
la frase 3 del screening, el C-QSM tiene su celda, el `IFS Índice MT` no se corrompe y el bloque
demográfico está unificado con el de parámetros.

**Lo que V5 agregó sobre V4** (todo verificado por código, 2026-09-16):

| Cambio | Detalle |
|---|---|
| **8 columnas de rango `E:L`** | la `X` del tramo sale por fórmula en las 15 filas con Z; 8 tramos mutuamente excluyentes y exhaustivos, límite inferior inclusive |
| **Cap de ±3 en la columna Z** | formato de número `[<=-3]"≤-3";[>=3]"≥3";0.00` en `D19:D46` |
| **AS1/AS2/AS3 como filas del cuadro** | `C34:C36`; corre 3 filas todo lo que sigue |
| **Media/Desvío unificada** | bloque contiguo `Q31:R46`, sin filas vacías |
| **`C18` = `=B63`** | el total del K-10 dejó de estar tipeado (ver el recuadro de §A.8) |
| **Validaciones completas** | `B5`, `B6` (con formas femeninas), `B10`, `C14:C15` |

🚩 **Verificado en V5:** las 15 filas con Z tienen sus 8 fórmulas, cada una produce **exactamente una
X** y en la columna correcta, los 15 `VLOOKUP` apuntan a la norma de su prueba, y no hay ningún
`#REF!` en la hoja.

Quedan **dos preguntas de criterio** (§A.10, §A.11) y una errata menor (`B6` incluye un guion `-` como
opción válida de lateralidad). Ninguna impide generar el informe.

---

## Lo que V3, V4 y V5 resolvieron

| Punto | Qué pedía | Cómo quedó en V5 |
|---|---|---|
| **A.1** Celdas `X/Y` formateadas como texto | evitar la autoconversión a serial de fecha del `IFS Índice MT` | ✅ `C25` es **texto** (`7/10`). Todas las celdas `X/Y` del cuadro son cadenas. |
| **A.2** Desglosar el K-10 en sus 10 ítems | habilitar el gráfico `Escala K-10` | ✅ `A53:A62` rótulos + `B53:B62` puntajes, **en el orden del cuestionario y del gráfico**, con `B63` = `=SUMA(B53:B62)`. |
| **A.3** Flag `Riesgo de evolución` Sí/No | habilitar la categoría 5 de `regla-diagnostica.md` | ✅ `B10`, con validación de lista `Si`/`No`. |
| **A.4** Celda de puntaje del C-QSM | distinguir "no se tomó" de "se tomó y no se cargó" | ✅ `B65`, número entero suelto. |
| **A.5** Unificar los dos bloques demográficos | que la edad/nivel educativo no vivan en dos lugares | ✅ **Resuelto de raíz.** Un solo bloque (`A1:B10`), el que manejan los `VLOOKUP`. Ya no puede desincronizarse, y se completa un campo menos por paciente. |
| **A.7** Orientación temporal y espacial | completar la frase 3 del screening | ✅ `C14` y `C15`, con validación `Si,No,Medio`, dentro del cuadro de pruebas. |
| **A.7** Campo de acompañamiento | primera frase de la anamnesis | ⚠️ **Parcial** — existe `B8` pero con otro rótulo y otro dominio (§A.10). |
| **B.1** Rótulos de área en los bloques cualitativos | hacer el archivo autoexplicativo | ✅ `A13`/`A19`/`A34`/`A44`/`A49` rotulan los 5 grupos. ⚠️ **Desde V5 son celdas combinadas** (ver abajo). |
| **A.6** PB de AST por fórmula | que el PB no dependa de cómo se redondeó ese día | ✅ Aplicado y extendido al PB de CE: `C37` y `C41`. |
| **A.8** Total del K-10 por fórmula | que el total de la tabla no se desincronice de los 10 ítems | ✅ `C18` = `=B63`, verificado en V5. |
| **A.9** Validación de lista | evitar valores fuera de dominio | ✅ `B5`, `B6` (con formas femeninas), `B10`, `C14:C15`. |
| *(nuevo en V5)* La X del tramo por fórmula | que la elección de columna deje de ser trabajo de transcripción | ✅ 8 columnas `E:L` — ver §A.12. |
| *(nuevo)* Campo de derivante | la fila `Deriva:` que tiene `informeFinal.docx` | ✅ `B9` (`Derivado por`). El **dato** ya no hay que buscarlo fuera del Excel; la **presencia** de la fila la sigue decidiendo la plantilla del profesional (`informeFinal.docx` la trae con `-`, `informeFinal2.docx` no la trae). |

⚠️ **Corrección a una afirmación repetida en versiones anteriores de este archivo:** la hoja **sí
tiene celdas combinadas** desde V5 (los 5 rótulos de área, el encabezado agrupado de tramos, cada fila
de la anamnesis, y algunos rótulos del área auxiliar) y **sí tiene validaciones de datos**. Para la
lectura por código importa una sola cosa: **en un rango combinado el valor vive en la celda de arriba
a la izquierda y el resto se lee vacío.** El detalle está en `mapeo-excel-a-word.md` §1.

Bonus no pedido: `C3` (el rótulo "Nombre" que quedaba vacío en V1) desapareció — el nombre vive sólo
en `B2`.

---

## A. Ajustes pendientes

### A.4 ✅ `C-QSM`: celda de puntaje opcional (aplicada; no hay fórmula posible)

`A65` dice `C-QSM` y `B65` tiene el puntaje. Lo acordado era una **celda de puntaje opcional**
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

✅ **Aplicado: `B65` = `2`** (número entero, sin denominador — el formato recomendado). Para
esta paciente eso es **≤ 3 ⇒ sin quejas subjetivas significativas**, así que la frase 5 del screening
va completa.

**Por qué la celda vale la pena aunque el campo sea opcional:** una celda de puntaje en
`B65`, con el rótulo aclarando que va vacía si no se tomó. El valor no es que aporte un dato al
informe — es que **distingue "no se tomó" de "se tomó y no se cargó"**, que hoy son
indistinguibles. Con la celda vacía la skill sabe que tiene que avisar que **la línea del C-QSM se
borra de `PRUEBAS ADMINISTRADAS`**; sin la celda, sólo puede suponerlo.

#### Qué valor va y en qué celda

El puntaje va en **`B65`**, al lado del rótulo — mismo patrón que el bloque de arriba
(`A53:A62` rótulos / `B53:B62` valores) y que `A52`/`B52`.

Va como **número entero suelto**, no como `X/Y`. Es el mismo criterio que ya usan las otras dos
celdas cuyo valor sólo sirve para cruzar un corte:

| Celda | Prueba | Formato | Por qué |
|---|---|---|---|
| `C17` | AVD | `8` — número | el corte (0–5 / 6–8) decide la interpretación |
| `C18` | KPDS-10 | `24` — número | el corte (≥ 25) decide la categoría |
| **`B65`** | **C-QSM** | **número** | **el corte (> 3) decide si hay quejas** |

(Las que sí van como texto `X/Y` — `C13` MMSE, `C16` TRO, `C24` IFS Total, `C25` Índice MT — son las
que se **muestran** en el informe con esa forma. El C-QSM no se muestra nunca, así que no necesita
el denominador.)

Ejemplos, con la única regla confirmada (corte > 3):

| `B65` | Lectura | Efecto en la frase 5 del screening |
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

### A.6 ✅ PB por fórmula — `BEM–MS AST` y `BEM–MS CE` (aplicado y verificado en V5)

✅ Confirmado (2026-09-07): el PB de AST **es el promedio de los 3 trials**, **truncado a 2
decimales** (no redondeado), y la profesional prefiere que se calcule solo.

**Aplicado por la profesional (2026-09-15)**, extendiendo la misma lógica al CE:

| Celda | Fórmula | Insumo |
|---|---|---|
| `C37` (PB de AST) | `=TRUNCAR(V38;2)` | `V38` = `(U38+U39+U40)/3`, el promedio de los 3 ensayos |
| `C41` (PB de CE) | `=TRUNCAR(U43;2)` | `U43` = `(C39+C40)/2`, el promedio de Sem y Rec |

**Por qué en AST no era cosmético:** truncar y redondear dan PB distintos y **el PB mueve el Z**. Con
un promedio de `7,6667`, el PB correcto es `7,66` (Z `-0,90`); `7,67` daría Z `-0,89`. Con la
fórmula el PB deja de depender de cómo se redondeó ese día.

ℹ️ **En CE el truncado es inocuo pero el cambio igual suma.** `(Sem+Rec)/2` sobre dos enteros da
siempre `,0` o `,5`: nunca hay un tercer decimal que truncar, así que `TRUNCAR` no puede cambiar el
número (`10,5` sigue siendo `10,5`). Lo que sí gana es lo mismo que en AST y en §A.8: **elimina la
doble carga manual** — antes `C41` se tipeaba y su insumo sólo lo chequeaba; ahora hay una sola fuente
y no pueden divergir.

✅ **Verificado en V5:** `C37` = `=TRUNC(V38,2)` → `10` (ensayos 7, 11, 12 → `V38` = 10) y `C41` =
`=TRUNC(U43,2)` → `12` (Sem 12, Rec 12 → `U43` = 12). Los dos con el valor cacheado coherente.
(Excel guarda `TRUNCAR` como `TRUNC` en el XML; es lo mismo.)

ℹ️ **Los insumos se mudaron en V5.** Los ensayos ya no viven en `P35:P37`: son las filas `C34:C36` del
cuadro, y `U38:U40` los referencia (`=C34`, `=C35`, `=C36`) para alimentar el promedio de `V38`.

**La skill sigue usando el PB tal como viene** y no recalcula el Z. Como guarda para archivos
viejos, compara `C37` con `TRUNCAR(V38;2)` y `C41` con `TRUNCAR(U43;2)`; si no coinciden, lo señala
en el bloque 11.

### A.8 ✅ Total del K-10 por fórmula (aplicado y verificado en V5)

`C18` (el PB del K-10 que va a la tabla de síntesis) era un número tipeado mientras el total ya salía
de `=SUMA(...)`: el mismo modo de falla de §A.5 a menor escala — dos celdas con el mismo dato,
cargadas por separado, sin nada que avise si divergen.

**Aplicado:** `C18` → `=B63`. Los 10 ítems se cargan una sola vez y el total de la tabla de síntesis,
el del gráfico y el que dispara el corte ≥ 25 **no pueden desincronizarse**.

✅ **Verificado en V5:** `C18` = `=B63` → `24`, coherente con `B63` = `=SUM(B53:B62)` = `24`.

> 🚩 **Este modo de falla se materializó, y con consecuencia clínica.** Durante la construcción de V5
> el vínculo se perdió al mover filas: `C18` quedó tipeado en `30` mientras los 10 ítems sumaban `24`.
> La fórmula de interpretación devolvía **`Malestar severo`** cuando correspondía **`Normal`** — es
> decir, cruzaba el corte ≥ 25 que **decide la categoría diagnóstica**. Se detectó leyendo el archivo
> por código, no a ojo.
>
> **Moraleja para la skill:** este chequeo es barato y es el de mayor impacto de todo el paquete.
> Hacerlo siempre, aunque `C18` "parezca" bien.

ℹ️ Nota para `regla-diagnostica.md`: el corte de sintomatología anímica se deriva del K-10 por
default, pero la profesional puede sobrescribirlo. Ahora eso implica **pisar una fórmula** en `C18`,
no editar un número suelto — si algún archivo llega con `C18` tipeado y distinto de `B63`, puede ser
un override deliberado: **señalarlo, no corregirlo**.

### A.9 ✅ Validación de lista en los campos Sí/No y en lateralidad (completa en V5)

**Estado en V5 (verificado por código):**

| Celda | Validación | Estado |
|---|---|---|
| `B10` Riesgo de evolución | lista `"Si,No"` | ✅ correcta |
| `B5` Nivel educativo | lista → `FLUENCIAS!$B$2:$D$2` | ✅ **la mejor implementación posible** — apunta a los encabezados reales, así que no puede desfasarse de la hoja de normas |
| `B6` Lateralidad | lista `"Diestro,Diestra,Zurdo,Zurda,Ambidiestro,Ambidiestra,-"` | ✅ corregida en V5 |
| `C14`/`C15` Orientación | lista `"Si,No,Medio"` | ✅ aplicada en V5 |

El valor de `B6` se copia **verbatim** a la tabla de datos personales del Word, así que tiene que
concordar en género con el paciente (`informeFinal.docx`: `Diestra`; Excel V1: `Diestro`). La lista de
V4 sólo tenía las formas masculinas y la celda incumplía su propia lista; **V5 lo corrigió.**

ℹ️ Dos detalles menores de la lista actual, ninguno bloqueante:
- Incluye un **`-`** como opción. Si se elige, va a parar tal cual a la tabla del Word — mismo criterio
  que la fila `Deriva: -` de `informeFinal.docx`, así que es plausible que sea deliberado.
- **`C14`/`C15` admiten `Medio`**, un tercer valor que no es sí ni no. La skill no puede colapsarlo a
  `Si`: redacta la frase 3 del screening en consecuencia o lo señala.

Para detectar valores fuera de lista: **Datos** → flecha de **Validación de datos** → **Rodear con un
círculo los datos no válidos**.

#### Cómo aplicar una validación (referencia, por si hay que agregar otra)

1. Seleccionar la celda. Para las dos juntas: clic en `C14`, **Ctrl** + clic en `C15`.
2. Pestaña **Datos** → *Herramientas de datos* → **Validación de datos** → **Validación de datos…**
3. Pestaña **Configuración**: *Permitir* = **Lista**; *Origen* = `Si;No`; dejar tildado **Celda con
   lista desplegable**.
4. Pestaña **Mensaje de error**: *Estilo* = **Detener** (con *Advertencia* o *Información* el valor
   entra igual).
5. **Aceptar.**

ℹ️ El separador que se tipea depende de la configuración regional (`;` acá, el mismo de
`=TRUNCAR(V38;2)`), pero Excel lo **guarda siempre con coma** en el XML — por eso `B10` figura como
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

`C16` (TRO en screening) = `10/10` y `C49` (TRO en visoconstrucción) = `9.5/10`. En V1 y en los dos
informes reales, las dos apariciones de TRO llevan **el mismo** valor.

Puede ser una distinción real (dos criterios de puntuación sobre la misma prueba) o una celda que
quedó vieja. **La skill no las reconcilia**: copia cada celda en su fila y anota la diferencia en el
bloque 11.

**Pregunta para la profesional:** ¿son dos puntuaciones distintas a propósito?

---

### A.12 ✅ Las 8 columnas de rango por fórmula (nuevo en V5)

El paso más grande de V5: la **`X` del tramo dejó de ser trabajo de transcripción**. Las columnas
`E:L` del cuadro corresponden a los 8 tramos y traen la X calculada, **sólo en las 15 filas con Z**
(`19`–`23` y `37`–`46`); en las otras 23 las celdas están vacías con el gris de "no aplica".

```excel
E19  =SI(ESNUMERO($D19);SI($D19<-3;"X";"");"")
F19  =SI(ESNUMERO($D19);SI(Y($D19>=-3;$D19<-2);"X";"");"")   … hasta …
L19  =SI(ESNUMERO($D19);SI($D19>=3;"X";"");"")
```

- **Límite inferior inclusive, superior exclusivo** — la convención propuesta en §D, que sigue
  pendiente de confirmación formal pero ya quedó implementada.
- Los 8 tramos son **mutuamente excluyentes y exhaustivos**: ningún Z puede quedar sin X ni con dos.
- El `ESNUMERO` implementa *"la X se pone si y sólo si Z es numérico"*, así que las filas cualitativas
  se blanquean solas.

**Verificado en V5:** las 15 filas producen exactamente una X, y en la columna correcta.

#### El cap de ±3 es formato, no valor — y eso importa

`D19:D46` tiene el formato de número `[<=-3]"≤-3";[>=3]"≥3";0.00`. En pantalla (y en un screenshot, y
en un copy/paste a Word) se ve `≤-3`; **al leer el archivo por código sale el Z crudo** (`-3.1067…`).

➡️ **El cap sigue siendo trabajo de la skill**, tanto para la columna Z de la tabla como para el
gráfico 1. Lo que la skill dejó de hacer es elegir la columna de rango.

ℹ️ Se evaluó y **se descartó** poner el cap por fórmula en una columna de texto aparte: rompería el
gráfico 1, que necesita que `D` siga siendo numérica. El formato de número resuelve los dos usos con
una sola celda.

## B. Ajustes opcionales — no bloquean nada

### B.2 La nota truncada de `A70`

`A70` termina en `QSM: olvida cosas puntuales (fue a un partido y por ahi ` — paréntesis sin cerrar,
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

> ⚠️ **Reescrito para V5.** Las versiones anteriores de esta lista decían "no agregar las 8 columnas
> de rango" y "no mover el cuadro de pruebas (`A12:D47`) ni los bloques auxiliares (`L29:M43`,
> `O34:Q40`)". **V5 hizo las tres cosas, deliberadamente y bien.** Lo que sigue describe el layout de
> V5 como la nueva línea de base.

- **No agregar filas de orientación a la tabla de síntesis.** `C14`/`C15` están en el cuadro del Excel
  pero **no** son filas del informe: la tabla del Word tiene **36 filas** en los dos informes reales y
  la orientación no está en ninguno. Alimentan la frase 3 del screening y nada más. (El cuadro del
  Excel tiene 38 filas justamente por eso.)
- **No cargar la X a mano.** Las 8 columnas `E:L` salen por fórmula desde V5 (§A.12). Tipearlas
  reintroduce exactamente el trabajo que esa fórmula eliminó.
- **No "arreglar" la alineación del bloque `Q32:R46`.** Es un bloque contiguo de 15 filas y las 5
  primeras corresponden a pruebas que viven 13 filas más arriba. Se ve raro pero es correcto: las
  fórmulas de `D` apuntan ahí. Fue elegido así a propósito, para que la tabla de Media/Desvío quedara
  unificada y sin filas vacías.
- **No hacer una hoja paralela "para la IA"** con los mismos datos en formato máquina. Duplica el
  mantenimiento y crea una segunda fuente que puede divergir — el mismo problema que V3 eliminó en los
  demográficos, a mayor escala.
- **No mover el cuadro de pruebas** (`A11:L50`) ni los bloques auxiliares (`Q31:R46`, `T37:V43`) sin
  volver a verificar las fórmulas. **Mover filas es exactamente lo que rompió `C18` durante la
  construcción de V5** (§A.8): si hay que moverlas, hacerlo con cortar-pegar (Excel reapunta las
  referencias solo) y después releer el archivo por código para confirmar.
- **No agregar DNI ni ocupación.** La tabla de datos personales del Word no los tiene en ninguno de
  los dos informes; los campos reales son `B2:B7` + `Deriva` (`B9`) opcional.

---

## C. Recordatorio operativo (sigue vigente)

Guardar el archivo **en Excel** antes de mandarlo — no sólo cerrarlo, ni editarlo con otro programa.
Las celdas con fórmula (la columna `D` de las filas con Z, **las 8 columnas `E:L`**, `Q32:R46`, `V38`,
`U43`, `B63`, `C18`, `C37`, `C41`) sólo tienen el valor calculado cacheado si Excel lo guardó; si no,
pueden leerse vacías al procesarlas por código.

⚠️ **Con V5 esto pesa más que antes:** si `E:L` se lee vacío, la tabla sale **sin ninguna X** y el
error es silencioso (una tabla sin X se ve plausible). Chequeo: deben ser **15 X**, una por fila con Z.

---

## D. Sigue pendiente de confirmar con la profesional

> Las dos primeras (§A.10 y §A.11) **nacieron con V3 y todavía no están** en
> `../preguntasParaLaProfesional.md`: agregarlas ahí antes de la próxima conversación. El resto de
> las preguntas abiertas del proyecto sí está en ese archivo.

- **El formato de `B8`** (§A.10): Sí/No o "con quién".
- **Las dos puntuaciones de TRO** (§A.11): ¿distinción real o celda vieja?
- **Desempate en los rangos de la X** cuando el Z cae justo en un límite (`-2 a -1` y `-1 a 0` ambos
  tocan el −1). Propuesta: límite inferior inclusive, superior exclusivo. Los informes disponibles
  **no** contienen ningún Z en un límite exacto, así que no lo resuelven.
  ⚠️ **Cambió de estado con V5:** ya **está implementado** en las fórmulas de `E:L` (§A.12), así que
  dejó de ser una convención de quien completa la tabla y pasó a ser el comportamiento del archivo.
  Sigue faltando que la profesional lo confirme — pero ahora confirmarlo es barato y desmentirlo
  implica editar 8 fórmulas. **(Abierto, con la implementación ya tomada.)**
- **Prioridad entre categorías** cuando aplican simultáneamente compromiso anímico (K-10 ≥ 25) y
  riesgo de evolución. Ahora que `B10` existe, el caso **es alcanzable** y la prioridad importa.
  **(Sigue abierto.)**

Resueltos el 2026-09-07 (ya no pendientes): el **léxico Z → palabra** quedó confirmado
(`mapeo-excel-a-word.md` §4.2), y el **C-QSM** no es fila obligatoria de la tabla de síntesis (§A.4).
