---
name: informe-neurocognitivo
description: >
  Genera el informe neurocognitivo completo en Word a partir de un Excel unificado con los puntajes
  ya calculados de un paciente. Ejecuta el script generar_informe.py incluido, que clona la plantilla
  plantilla-informe.docx y reemplaza sólo los datos variables. Usar cuando se adjunte un Excel de
  evaluación neurocognitiva (hoja TABLA DE FORMULAS o equivalente) y se pida armar un informe.
---

# Informe neurocognitivo — genera el informe completo en Word

Todo el output es **borrador para revisión del profesional**: nunca se envía nada al paciente y la
categoría diagnóstica es una propuesta, no un diagnóstico.

---

# ⛔ LO PRIMERO, ANTES DE CUALQUIER OTRA COSA

**El informe NO se escribe: se genera ejecutando el script de este paquete.**

```bash
python generar_informe.py datos.json informe.docx
```

El script, la plantilla (`plantilla-informe.docx`) y la carpeta **`recursos/`** (logos y firmas)
están **en esta misma carpeta**, junto a este `SKILL.md`. Localizarlos antes de empezar (`ls` sobre el
directorio de la skill) y **ejecutar el script en su lugar, por ruta absoluta, sin copiarlo**: el
script busca la plantilla y `recursos/` al lado suyo, y si se lo copia solo a otra carpeta aborta con
`Falta el recurso …`. El `datos.json` y el `.docx` de salida sí pueden ir en cualquier carpeta de
trabajo.

## 🚫 Prohibido construir el documento

**Está terminantemente prohibido crear el `.docx` con `python-docx`, `docx.Document()`,
`Document()`, o armando el XML a mano.** No importa lo razonable que parezca: el formato del informe
es irreproducible desde cero y el resultado va a estar mal aunque se vea prolijo. (Las únicas
excepciones son las tablas sueltas de los bloques 1 y 4, y sólo en el modo de respaldo.)

⚠️ **Fallo real observado (2026-09-17, primera corrida en claude.ai).** La skill ignoró el script y
escribió el documento con `python-docx`. Salió un archivo que *parecía* un informe y estaba mal en
todo: sin el encabezado institucional, sin los dos gráficos, con títulos inventados
(`I. Datos de identificación`, `IV. Resultados de la evaluación`, `V. Síntesis`), con el cuadro de
síntesis partido en seis tablas distintas, con una tabla de sintomatología que nadie pidió, sin la
leyenda al pie y con la anamnesis en viñetas en vez de prosa.

**Cómo darse cuenta de que se cayó en este error:** si el documento generado no tiene
`word/charts/chart1.xml`, o no tiene `word/header1.xml`, o los títulos no son exactamente los de la
plantilla, entonces **no se usó la plantilla** y hay que rehacerlo con el script.

## Lo que aporta cada parte

| Viene de la plantilla o de `recursos/` (no se toca) | Lo produce la skill (va en `datos.json`) |
|---|---|
| encabezado institucional: logo de **Breyna** o de **Xtend** | `protocolo` (de `B9`) — el script elige el logo |
| la firma: **Agustina** o **Josefina** | `evaluador` (de `B10`) — el script elige la firma |
| títulos de todas las secciones | los 6 datos personales y los párrafos de anamnesis |
| estructura de la tabla de síntesis (12 columnas, grises, celdas combinadas, 39 filas posibles) | PB, Z y la X **de cada fila con dato** (las demás las borra el script) |
| los dos gráficos | los 14 + 10 valores (`null` = prueba no tomada) |
| la leyenda al pie | la lista de pruebas administradas, el screening y los párrafos por área |
| el cierre | recap, frase de cierre y viñetas |

Si una de esas cosas falta o cambió de nombre en el resultado, **es que no se clonó la plantilla**.

## Excel V6 (2026-09-28) — lo que cambió, en una pantalla

1. **Protocolo (`B9`: `Breyna` / `Xtend`) → logo del encabezado.** Va en `datos.json` como
   `protocolo`, copiado tal cual. El script pone el logo de Breyna o el banner de Xtend.
2. **Evaluado por (`B10`) → firma.** Va como `evaluador`, tal cual. `Dra. María Agustina Aceiro` ⇒ la
   firma de siempre (imagen + nombre, título y M.N:67158). `Dra. Josefina González Aguilar` ⇒ su
   imagen, que ya trae nombre y M.N. 56.942 (el script borra las tres líneas de texto).
3. **`PRUEBAS ADMINISTRADAS` sale del listado `A73:B86`**: sólo los ítems con `Si`, texto literal de la
   columna `A`, en ese orden. Ya no hay lista fija.
4. **La tabla de síntesis muestra sólo las filas con dato.** Fila con PB vacío ⇒ no va (se omite su
   clave en `sintesis`). Tres filas nuevas, **sin Z ni X**, que van sólo si tienen valor:
   `Recuperación disejecutiva` (`C36`: `Sí`/`No`/`Parcial`) y `ROC estrategia` (`C37`: `Normal`/
   `Cuestionable`/`Inadecuada`) al final de Atención; `ROC copia` (`C55`: número o texto) al final de
   Visoconstrucción. Estas tres **no se narran** en la prosa: van sólo en la tabla.
5. 🚩 **El listado y el cuadro no se cruzan** (decisión del usuario, 2026-09-28). El listado decide la
   lista; el dato decide la tabla y los gráficos. Si `Figura de Rey` dice `No` pero ROC copia tiene
   valor, la lista no la nombra **y** la tabla muestra la fila. No es un faltante ni una duda.
6. **Prueba no tomada = no aparece en ningún lado**: ni tabla, ni gráfico (`null` en su posición de
   `grafico1`; `grafico2` = `null` si no hubo K-10), ni prosa (se omiten o adaptan las frases que la
   nombran). Un área sin ninguna fila ⇒ `areas.<área>` = `null`: el script borra la sección y el
   recap no la menciona.
7. **Todas las direcciones del Excel se corrieron.** Única fuente: `mapeo-excel-a-word.md` §1.

## 🚩 Antes de escribir `datos.json` — leer las reglas de contenido

Que el formato lo resuelva el script **no cambia una sola regla de qué dice el informe**. El JSON no
es un volcado del Excel: cada clave tiene reglas propias, y son las mismas que en el modo de bloques.
**Leerlas antes de redactar, no después:**

| Antes de escribir… | Leer |
|---|---|
| `anamnesis` | `mapeo-excel-a-word.md` §3 + la sección `MOTIVO DE CONSULTA` de `ejemplo-informe.md`. **Prosa, nunca viñetas rotuladas.** Las notas de protocolo no se redactan; de una nota truncada se conserva la afirmación y se descarta sólo el fragmento cortado. |
| `screening` | `mapeo-excel-a-word.md` §4.1 — el esqueleto de 6 frases está transcrito **literal**. Copiarlo, no reescribirlo. |
| `areas` | `mapeo-excel-a-word.md` §4.2 — léxico Z→palabra, sigla→función, y las dos prohibiciones duras: **ni siglas ni valores Z en la prosa**. `CE` no se narra nunca; `Sem` se dice como *bajo beneficio de la facilitación de claves semánticas*. |
| `sintesis` | `orden-filas-sintesis.md` — las 39 filas posibles con su **clave**, cuáles van (sólo las que tienen dato), el cap de ±3, y el **autochequeo obligatorio** contra las columnas `E:L` del Excel. |
| `pruebas` | el listado `A73:B86` de `mapeo-excel-a-word.md` §1 — sólo los `Si`, texto literal. |
| `grafico1` / `grafico2` | `orden-categorias-graficos.md` — orden de las categorías, redondeo y cap. |
| `recap`, `cierre`, `sugerencias` | `regla-diagnostica.md` — la categoría se **propone**, la decide el médico; el orden del recap; el paréntesis de hábitos se deriva de la anamnesis. |

⚠️ El detalle de cada clave está en **«Contenido de los 12 bloques»**, más abajo en este archivo.

## Al terminar

1. Ofrecer el `.docx` para descargar.
2. **Pegar en el chat el resumen que imprime el script**, literal. Es la evidencia de que la corrida
   fue completa:
   ```
   encabezado: Breyna (encabezado-breyna.png)
   firma: Agustina (firma-agustina.png)
   datos personales: 6 filas, 2 sobrantes eliminadas
   anamnesis: N párrafos (la plantilla traía 6)
   pruebas administradas: N ítems (la plantilla traía 11)
   tabla de síntesis: N filas, N celdas escritas · N filas borradas (claves…)
   screening + 4 secciones por área: 9 párrafos
   conclusiones: recap + cierre · N viñetas (la plantilla traía 4)
   gráfico 1: N puntos + N celdas del libro embebido
   gráfico 2: 10 puntos + 10 celdas del libro embebido
   ```
   Chequear contra el Excel: el logo y la firma coinciden con `B9`/`B10`, los ítems de la lista son
   los `Si` del listado, y las filas borradas son exactamente las de PB vacío.
3. Escribir el **bloque 12 (faltantes y dudas)** como texto en el chat.

Si el script **aborta**, no entregar nada: leer el mensaje, corregir el `datos.json` y volver a
correr. Si el error es `protocolo` o `evaluador` no reconocido, **preguntar al usuario** (chequeo de
entrada 0) en vez de elegir por cuenta propia. Sólo si el error no es del JSON (falta la plantilla o
un recurso) o se repite, reportarlo tal cual y caer al **modo de respaldo** diciéndolo explícitamente.

## Qué recibe esta skill

Un único Excel adjunto en el chat (`excelEvaluacionCompletoV6.xlsx` o equivalente). **Sólo se lee la
hoja `TABLA DE FORMULAS`**; las otras seis (`Stroop`, `MMSE`, `Puntajes Equivalentes`, `PRUEBAS`,
`FLUENCIAS`, `BACK UP`) son tablas de normas que ya alimentaron los `VLOOKUP` y no se leen.

Esquema de la hoja V6 (detalle completo, con las fórmulas y la clave de cada fila, en
`mapeo-excel-a-word.md` §1):

| Rango | Contenido |
|---|---|
| `B2:B7` | Los 6 datos personales: nombre, edad, fecha de nacimiento, nivel educativo, lateralidad, fecha de evaluación. |
| `B8` | Asiste acompañado (`Si`/`No`) → primera frase de la anamnesis. |
| **`B9`** | **Protocolo** (`Breyna` / `Xtend`) → `protocolo` en el JSON (logo). |
| **`B10`** | **Evaluado por** (`Dra. Josefina González Aguilar` / `Dra. María Agustina Aceiro`) → `evaluador` en el JSON (firma). |
| `B11`, `B12` | Derivado por (no se usa) · Riesgo de evolución (`Si`/`No`). |
| `B3`, `B5` | Edad y nivel educativo — **drivers de todas las fórmulas**, y los mismos que van al Word. |
| `A13:L55` | Cuadro de pruebas: `A`=Área `B`=Prueba `C`=PB `D`=Z `E:L`=los 8 tramos de rango. Filas 13 y 14 = encabezados. |
| `C16`, `C17` | Orientación temporal / espacial (`Si`/`No`/`Medio`). **No son filas de la tabla de síntesis** — alimentan la frase 3 del screening. |
| `D19`, `D20` | Interpretación de AVD y de KPDS-10 (texto por fórmula, pass-through). Van en la columna `Z`. |
| **`C36`, `C37`** | Recuperación disejecutiva · ROC estrategia (sin Z). |
| **`C55`** | ROC copia (sin Z). |
| `E:L` | Las 8 columnas de rango, **con la X ya calculada por fórmula** en las 15 filas con Z. |
| `B58:B67` | Los 10 ítems del K-10, en orden del gráfico. `B68` = `SUMA`. |
| `B70` | Puntaje del C-QSM (vacío si no se tomó). |
| **`A73:B86`** | Listado de pruebas administradas: nombre literal + `Si`/`No`. |
| **`A89`** | Anamnesis: **todas las notas en una celda**, separadas por salto de línea (+ `A90:A113` si hubiera más). |

`B4` y `B7` son **fechas**: según cómo se lea el archivo llegan como fecha o como serial numérico de
Excel. En los dos casos van al Word como `dd/mm/aaaa`; nunca imprimir el número ni la hora.

🚩 **Usar sólo las direcciones de esta tabla y de `mapeo-excel-a-word.md` §1.** V6 corrió todo el
cuadro respecto de versiones anteriores, y una dirección vieja no falla: devuelve otro dato en
silencio (p. ej. `C37` hoy es ROC estrategia, no AST; `B63` es un ítem del K-10, no el total).

Y **hay tres formas distintas de leer el cuadro**:

| Rango | Qué devuelve al leerlo por código | Qué hace la skill |
|---|---|---|
| `E:L` (los 8 tramos) | `"X"` o `""` — el resultado de la fórmula | **transcribe la X**; ya no decide el tramo |
| `D21:D50` (el Z) | el Z **crudo** (`-3.1067…`) | **aplica el cap** de ±3 ella misma (en el Excel el cap es sólo formato de número) |
| todo lo demás | valor normal | pass-through |

➡️ Los autochequeos del bloque 4 **cruzan contra lo que ya calculó el Excel**: si una X no coincide
con la de `E:L`, eso es un hallazgo y va al bloque 12.

### Chequeos de entrada — qué verificar y avisar, sin rellenar

✅ **`excelEvaluacionCompletoV6.xlsx` (2026-09-28) trae todo lo que necesita el informe**, incluidos
el logo (`B9`), la firma (`B10`) y qué pruebas se administraron (`A73:B86`). **Ya no hay ningún bloque
del informe que no se pueda generar desde el Excel**, salvo lo que abajo se marca.

Lo que sí hay que chequear en cada archivo que llegue:

0. **`B9` (protocolo) y `B10` (evaluado por) tienen que estar cargados.** Se copian tal cual al JSON
   y el script los reconoce tolerando tildes y espacios. Si faltan o traen otra cosa, el script aborta:
   **preguntar al usuario** en vez de elegir un logo o una firma por cuenta propia.
1. **`B70` (C-QSM) puede venir vacía.** **Su puntaje nunca aparece en el informe**: no es fila de la
   tabla, no está en los gráficos y no se cita en la prosa. Lo único que decide es media frase del
   screening. Sin puntaje, la observación de quejas subjetivas **se deriva de la anamnesis**. Si hay
   puntaje, quejas presentes = **> 3**. Nunca inventar uno. (Que el C-QSM figure en `PRUEBAS
   ADMINISTRADAS` lo decide el listado, `B84`, no esta celda.)
2. **PB derivados: `C41` (AST) y `C45` (CE).** Salen por fórmula — `C41`=`=TRUNCAR(V42;2)` (promedio
   de los 3 ensayos) y `C45`=`=TRUNCAR(U47;2)` (promedio de Sem y Rec). Si llegan tipeados a mano,
   comparar cada uno con su fórmula y, si no coinciden, decirlo en el bloque 12. **Nunca recalcular el
   Z** — viene del Excel, incluso si el PB no cierra.
3. 🚩 **Total del K-10 — el chequeo de mayor impacto clínico.** `C20` tiene que ser `=B68`
   (`=SUMA(B58:B67)`), así que el PB de la tabla de síntesis, el gráfico 2 y el corte ≥ 25 salen del
   mismo lugar. Si `C20` está tipeado y difiere de `B68`, **señalarlo y no elegir por cuenta propia**:
   puede ser un override deliberado del corte anímico. **Caso real:** un archivo traía el PB en `30`
   con los ítems sumando `24` — la tabla decía `Malestar severo` y correspondía `Normal`, cruzando el
   corte que decide la categoría diagnóstica.
4. 🚩 **`D19` (interpretación de AVD) tiene que venir por fórmula** (`=SI(C19>=8;"Autónomo";…)`, ver
   `regla-diagnostica.md`). Si llega **tipeada a mano**, el valor igual se usa tal cual —es
   pass-through— pero **avisarlo en el bloque 12**. Chequeo barato: contrastar `D19` contra `C19`
   usando la tabla de tramos.
5. **Espacios de más.** Los valores elegidos de una lista desplegable pueden traer un espacio adelante
   (las listas de `B9`, `B10`, `C36` y `C37` tienen espacios después de la coma). **Recortarlos** antes
   de escribirlos en la tabla o en la prosa; `protocolo` y `evaluador` el script los tolera igual.
   **`B8` (`Asiste acompañado`) es `Si`/`No` desde V6.** `No` o vacío ⇒ `asiste solo/a`; `Si` ⇒
   `asiste acompañado/a`. El Excel no dice por quién: si la anamnesis lo menciona se usa; si no, va la
   ranura `[acompañado por …]` y se anota en el bloque 12. ⚠️ La regla vieja (`acompañado/a por
   <texto>`) escribiría `acompañado por Si`.
6. **Campos Sí/No.** V6 valida `B8`, `B12`, `B73:B86`, `C16:C17`, `C36` y `C37`. Igual normalizar
   tolerantemente (`Sí`/`si`/`SI`/`No`/`no`). **`C16`/`C17` admiten un tercer valor, `Medio`**: no
   colapsarlo a `Si` — redactar la frase 3 en consecuencia o señalarlo. En **`C36`, `No` es un
   resultado** (la fila va con `No`), no "no se tomó". Si un valor no es interpretable,
   **señalarlo** en vez de asumir. **Nunca inferir el riesgo de evolución de los puntajes.**
7. **Las dos filas de TRO pueden traer valores distintos** (`C18` screening vs `C53`
   visoconstrucción). **Copiar cada celda en su fila, no reconciliarlas**, y anotar la diferencia en
   el bloque 12 si existe.
8. **Celdas `X/Y` con pinta de fecha.** Hoy vienen como texto, pero si alguna vez llega un número
   entre ~45000 y ~48000 en una celda que debería decir `7/10`, es una autoconversión de Excel y **es
   reversible**: formatear el serial como `d/m` devuelve lo tipeado. Chequeo obligatorio: el
   denominador recuperado tiene que ser el máximo del subtest. Si pasa → usar el valor y anotarlo en
   el bloque 12 como recuperado a confirmar; si no pasa → celda vacía y pedir el valor. Nunca escribir
   un marcador de pendiente dentro de una celda.

## Qué NO debe hacer esta skill

- **No recalcular PB ni Z.** Ya vienen calculados en el Excel.
- **No inferir "riesgo de evolución".** Es un flag manual que llega decidido.
- **No inventar recomendaciones clínicas.** Partir del template de `regla-diagnostica.md`, con las
  mismas viñetas y en el mismo orden (ver ahí qué sí se localiza).
- **No reinterpretar la anamnesis.** Ver el bloque 4 abajo — es el bloque de mayor riesgo.
- **No auto-enviar nada.** El informe se entrega a la profesional para que lo revise y lo firme.
- **No "corregir" las inconsistencias de la plantilla.** La leyenda que menciona trazado diagonal, y
  el `del área` / `por área` de las secciones, se reproducen tal cual.

## Gotcha técnico — guardar el Excel antes de subirlo

El Excel se lee con código, y las celdas con fórmula (la columna `D` de las filas con Z, **las 8
columnas `E:L`**, las medias y desvíos de `Q`/`R`, `V42`, `U47`, `B68`, `C20`, **`D19`**, `D20`, `C41`,
`C45`) sólo tienen el valor calculado cacheado si el archivo fue **guardado en Excel**. Si se sube sin guardar, o fue
editado con otro programa, pueden leerse vacías. Avisar al usuario si se detecta ese patrón.

---

## 🚩 Convención de marcado de pendientes — vale para todos los bloques

Lo que va al Word tiene que ser **pegable tal cual**. Un pendiente nunca se escribe en el medio de
una oración ni dentro de una celda de tabla.

> ❌ `El Sr. X asiste [PENDIENTE: falta el dato de "Acompañado" — no está en el Excel] a la consulta…`
> ❌ una celda de la tabla de síntesis con `[PENDIENTE - dato corrupto]`
> ❌ `...menciona que olvida cosas puntuales — "fue a un partido y por ahí…" (nota incompleta en el
> registro original, sin continuación).` — **el paciente puede leer este informe**; comentar el estado
> del dato de origen (que la nota esté truncada, mal tipeada, etc.) es tan inapropiado ahí como un
> `[PENDIENTE]` explícito, aunque no use esa palabra.
>
> ❌ `En cuanto a las quejas subjetivas de memoria, menciona que olvida cosas puntuales: "fue a un
> partido y por ahí…"` — el problema es **arrastrar la cita cortada**, que no significa nada. La
> afirmación sí va: `Refiere quejas subjetivas de memoria, con olvidos puntuales.` (ver bloque 2).
>
> ✅ prosa completa y gramatical, sin el fragmento inutilizable + **el pendiente enumerado en el
> bloque 12**, citando la nota cruda completa que hay que revisar.

Dos excepciones acotadas, y sólo esas:

- **Una ranura de opción** cuando el Excel no puede resolver un dato binario y el resto de la oración
  no cambia: `asiste [solo / acompañado por …] a la consulta`. Una por oración, sin explicación
  adentro.
- **Celda de tabla sin dato → celda vacía.** Nunca texto.

En los dos casos, el bloque 12 lo repite con el detalle.

---

## 🚩 Cómo se entrega: **un `.docx` completo**

La skill **no devuelve 12 bloques para pegar a mano**: genera **el informe entero en Word** con el
script (ver «Lo primero» y «Al terminar», arriba). Los 12 bloques de abajo son las **partes de
contenido** del informe; en el modo normal, los bloques 1 a 11 son claves de `datos.json` y sólo el
**bloque 12 (faltantes y dudas)** va como texto en el chat.

El script aborta a propósito —sin escribir nada— cuando no encuentra una sección, cuando un conteo no
cierra (14 y 10 valores de gráfico), cuando `protocolo` o `evaluador` no se reconocen, cuando una
clave de `sintesis` no existe, o cuando `grafico1`/`areas` no coinciden con las filas de la tabla.

### Esquema de `datos.json`

| Clave | Contenido | Bloque |
|---|---|---|
| `protocolo` | `B9` tal cual (`Breyna` / `Xtend`) — elige el logo del encabezado | — |
| `evaluador` | `B10` tal cual — elige la firma (Agustina / Josefina) | — |
| `personales` | 6 strings: paciente, edad (`61 años`), nacimiento, nivel educativo, lateralidad, evaluación | 1 |
| `anamnesis` | lista de párrafos (cantidad variable) | 2 |
| `pruebas` | los ítems del listado `A73:A86` que dicen `Si`, texto literal y en ese orden | 3 |
| `sintesis` | **objeto** `{clave: {"pb":…, "z":…, "x": 1-8}}` **sólo con las filas que tienen dato**. Las claves (`mmse`, `tro_screening`, `dd`, `ff_atencion`, `recuperacion`, `roc_copia`…) están en `orden-filas-sintesis.md`. `z` y `x` se omiten donde no aplican. Fila omitida = fila borrada | 4 |
| `grafico1` | **14** números en el orden de `orden-categorias-graficos.md`, con **`null`** en las pruebas no tomadas | 5 |
| `grafico2` | **10** enteros, o **`null`** si el K-10 no se tomó | 6 |
| `screening` | un párrafo | 7 |
| `areas` | `atencion`/`memoria`/`lenguaje`/`visoconstruccion`, cada una `[impresión, párrafo]`, o **`null`** si el área no tiene ninguna fila en la tabla | 8 |
| `recap`, `cierre` | un párrafo y una oración | 9 y 10 |
| `sugerencias` | lista de viñetas (cantidad variable) | 11 |

Forma de `sintesis`: ver el ejemplo de `orden-filas-sintesis.md`. Esqueleto del resto:

```json
{
  "protocolo": "Breyna",
  "evaluador": "Dra. María Agustina Aceiro",
  "personales": ["Bertagni, Paula", "62 años", "02/04/1964", "Universitario", "Diestra", "14/08/2026"],
  "anamnesis": ["La Sra. Bertagni asiste sola a la consulta …", "…"],
  "pruebas": ["Actividades instrumentales de la vida diaria (AIVD de Lawton y Brody)", "…"],
  "sintesis": {"mmse": {"pb": "29/30"}, "dd": {"pb": "8", "z": "1,14", "x": 6}},
  "grafico1": [1.14, -0.35, 1.33, 1.25, -0.34, -0.13, -1.17, -1.32, -1.32, -0.27, 0.72, 3, 1.37, 0.86],
  "grafico2": [2, 3, 2, 1, 3, 2, 1, 2, 3, 2],
  "screening": "Discurso fluido y organizado, …",
  "areas": {"atencion": ["Impresión diagnóstica del área: rendimiento cognitivo conservado-alto", "…"],
            "memoria": ["…", "…"], "lenguaje": ["…", "…"], "visoconstruccion": ["…", "…"]},
  "recap": "La Sra. Bertagni presentó …",
  "cierre": "En conclusión, …",
  "sugerencias": ["Interpretar estos resultados …", "…"]
}
```

Es un esqueleto: en un caso real `sintesis` lleva una clave por cada fila con dato, y `grafico1`
tiene que coincidir con ella (`null` justo donde falta la fila).

🚩 **Dos formatos de número distintos, no confundirlos:**
- En **`sintesis`** los valores son **texto tal como se ven en la tabla**: coma decimal y cero final
  (`"-0,90"`, `"≤-3"`).
- En **`grafico1`/`grafico2`** los valores son **números JSON**, con punto y sin comillas (`-0.9`,
  `3`). Si llega texto (`"0,45"`), el script aborta.

### Lo que el `.docx` resuelve solo

- El **logo del encabezado** (Breyna o Xtend) y la **firma** (Agustina o Josefina) se cambian solos
  según `protocolo` y `evaluador`. Las imágenes están en `recursos/`.
- Las **filas de la tabla sin dato se borran**, y si se borra la fila que abría un área, el rótulo del
  área pasa a la siguiente. Un área con `null` se borra entera (título, impresión y párrafo).
- Las **categorías del gráfico 1 con `null` se borran**, y el gráfico 2 desaparece si va `null`.
- La fila `Deriva:` de la plantilla **se borra**, no se deja vacía.
- La leyenda al pie **ya viene**: no hay nada que copiar de un informe anterior.
- La tabla entra en la página sin el viejo ajuste de ancho al 130 %.
- La cantidad de párrafos de anamnesis, de ítems de pruebas y de viñetas de sugerencias **se adapta**
  a cada paciente, aunque difiera de la plantilla.

### Modo de respaldo: los bloques sueltos para copy/paste

**Sólo** en dos casos: el script abortó por algo que no se arregla corrigiendo el JSON (ver «Al
terminar»), o la profesional pide explícitamente los bloques sueltos. Entonces se emiten los bloques
1 a 11 con los formatos de respaldo que se describen en los bloques 1 y 4, y el resto como texto en el
chat. **Decirlo en el bloque 12.** Las reglas de contenido son las mismas en los dos modos.

---

## Contenido de los 12 bloques

Lo de abajo define **qué dice cada parte del informe**, y vale igual para el `.docx` y para el modo de
respaldo. En el modo `.docx` cada bloque es una clave de `datos.json`; los títulos de sección los pone
la plantilla y **no se inventan ni se renumeran**. Las subsecciones marcadas «sólo para el modo de
respaldo» no aplican en el modo normal.

El mapeo completo de qué sale de dónde está en `mapeo-excel-a-word.md` §2, y las direcciones de celda
en §1 (**única fuente**; este archivo las repite). Para el **tono y el fraseo** de los bloques
narrativos (2, 7, 8, 9, 10), seguir el registro de `ejemplo-informe.md` (informe modelo completo,
ficticio).

🚩 **Comillas tipográficas.** Las citas textuales del paciente van entre `“ ”`, no entre `" "`. El
Excel las trae rectas; el informe las lleva curvas. Vale para todos los bloques narrativos.

🚩 **La anamnesis (bloque 2) va en PROSA, nunca en viñetas.** Cada nota del Excel se expande a un
párrafo corrido en tercera persona, con los verbos de reporte rotados (`Refiere` · `Relata` ·
`Menciona` · `Reporta` · `En lo que concierne a`). **Prohibido el formato `Rótulo: contenido`**
(`Sueño: …`, `Rutina: …`, `Actividad física: …`): eso es el punteo crudo del Excel, no el informe.
⚠️ Fallo observado (2026-09-17): la salida vino como lista de viñetas rotuladas. Comparar contra la
sección `MOTIVO DE CONSULTA Y ANTECEDENTES` de `ejemplo-informe.md` antes de redactar.

> ⚠️ **Los bloques narrativos son texto de plantilla con huecos, no redacción libre.** El fallo
> repetido de la primera corrida real fue que la skill emitió **sólo las partes variables** que estos
> bloques enumeran y descartó el boilerplate clínico que las rodea. Las frases invariantes están
> transcritas literalmente en `mapeo-excel-a-word.md` §4.1 (screening) y §4.2 (secciones por área):
> **leerlas antes de redactar los bloques 7 y 8**, no después.

**1. Tabla de datos personales** — **exactamente 6 filas, siempre las mismas, en este orden:**

| Fila | Celda | Formato |
|---|---|---|
| `Paciente` | `B2` | tal cual |
| `Edad` | `B3` | `<B3> años` |
| `Fecha de nacimiento` | `B4` | `dd/mm/aaaa` (fecha o serial de Excel) |
| `Nivel educativo alcanzado` | `B5` | tal cual |
| `Lateralidad` | `B6` | tal cual |
| `Fecha de evaluación` | `B7` | `dd/mm/aaaa` (fecha o serial de Excel) |

🚩 **Ninguna fila más, nunca** (decisión del 2026-09-17). `B8` (acompañamiento), `B9` (protocolo),
`B10` (evaluado por), `B11` (derivante) y `B12` (riesgo de evolución) **no van en esta tabla**,
aunque el Excel los traiga cargados y aunque la plantilla de Word tenga una fila `Deriva:` — el
script la borra. Tampoco se inventan DNI ni ocupación. `B8` alimenta la frase de acompañamiento de la
anamnesis; `B9` y `B10` van al JSON como `protocolo` y `evaluador`.

⛔ **Y tampoco se pregunta por ella en el bloque 12.** Aunque `B11` traiga un derivante cargado,
**no** escribir nada del tipo *"confirmar si la plantilla tiene la fila `Deriva:`"*: la profesional ya
confirmó los 6 campos el 2026-09-17 y no quiere que se le vuelva a preguntar. `B11` cargado **no es**
un faltante ni una duda — es un dato del Excel que este informe no usa.

### Formato — **sólo para el modo de respaldo**: `.docx` con esta tabla sola

En el modo normal esta tabla va dentro del informe completo y no se entrega suelta. En el modo de
respaldo, primera opción: generar con code execution (`python-docx`) un `.docx` que contenga **sólo
esta tabla**, y ofrecerlo para descargar. La profesional lo abre, `Ctrl+A`, `Ctrl+C`, y pega en su
informe. Las únicas excepciones a la prohibición de `python-docx` son las tablas sueltas de los
bloques 1 y 4, y sólo en el modo de respaldo: nunca para armar el informe entero.

Receta exacta del archivo, aprobada por el usuario en la prueba del 2026-09-17:

| Parámetro | Valor |
|---|---|
| Tabla | 6 filas × 2 columnas, sin fila de encabezado |
| Anchos | col. 1 = 3600 twips · col. 2 = 5000 twips |
| Bordes | `single`, `sz=4`, negro, incluidos los interiores |
| Fuente | Arial 10 pt |
| Columna 1 | **negrita** (las etiquetas) |
| Columna 2 | normal (los valores) |
| Interlineado | simple, sin espacio posterior |

### Alternativa: tabla Markdown en el chat

Sólo si no se puede generar el `.docx`. Emitirla **suelta en el mensaje, NUNCA dentro de un bloque de
código**, con encabezado vacío para que no aparezca una fila de títulos:

```
|   |   |
|---|---|
| Paciente | … |
```

Se selecciona con el mouse sobre la tabla ya dibujada y se pega. ⚠️ **Advertirle que este camino
depende del cliente:** copiar el código fuente en vez de la tabla renderizada produce el fallo
`PacienteBertagni, PaulaEdad62 años…` (observado el 2026-09-08 y de nuevo el 2026-09-17), con
los `|` a la vista y las líneas `|---|` convertidas en rayas por el autoformato de Word. Si pasa, se
corrige con **Pegar → Mantener formato de origen**.

**2. `MOTIVO DE CONSULTA Y ANTECEDENTES`** — redacción de las notas de `A89` a prosa en tercera
persona y presente, una nota ≈ un párrafo, mismo orden, conservando las citas textuales entre
comillas. 🚩 **Todas las notas vienen en esa única celda**: partir el texto por los saltos de línea,
quitar el `- ` inicial de cada viñeta (y los espacios duros sobrantes), y sumar `A90:A113` si alguna
trae texto. La primera línea (sin guion) suele ser el motivo de consulta. Formas fijas del primer y
último párrafo, verbos de reporte y concordancia de género: ver
`mapeo-excel-a-word.md` §3.

> ⚠️ **Bloque de mayor riesgo del pipeline.** No suavizar, reinterpretar ni reencuadrar el contenido
> anímico: transcribir lo que dice la nota. Si una nota es **ambigua pero está completa**, dejarla
> ambigua en la prosa tal cual llega, **sin agregar ninguna aclaración sobre el estado del dato** — el
> paciente puede leer este texto. Señalarlo **sólo en el bloque 12**. Incluir todo y **marcar lo
> dudoso ahí** en vez de decidir sola qué omitir.

> 🚩 **Nota truncada → se conserva lo completo y se descarta sólo lo cortado**
> (regla afinada el 2026-09-17, **reemplaza a la primera versión de ese mismo día**).
>
> Una nota truncada casi nunca lo está entera: lo habitual es que **la afirmación esté completa y lo
> que se corte sea el ejemplo**. En ese caso **el hecho clínico SÍ va al informe** y lo único que se
> omite es el fragmento inutilizable.
>
> **Caso de referencia** (una nota real de un archivo anterior): `QSM: olvida cosas puntuales (fue a un
> partido y por ahi `
>
> | | |
> |---|---|
> | ✅ se conserva | `olvida cosas puntuales` — afirmación completa, es el dato clínico |
> | ❌ se descarta | `(fue a un partido y por ahi ` — ejemplo cortado, no significa nada |
>
> ✅ `Refiere quejas subjetivas de memoria, con olvidos puntuales.`
> ❌ `...olvida cosas puntuales: "fue a un partido y por ahí…"` (arrastra el fragmento)
> ❌ omitir la viñeta entera (pierde el hallazgo)
>
> **Nunca completar ni adivinar** lo que decía el ejemplo. Si lo que queda al sacar el fragmento no se
> entiende por sí solo, ahí sí se omite la viñeta entera. En los dos casos, **la nota cruda completa va
> al bloque 12** para que la profesional la complete o la descarte.
>
> 🚩 **Cascada obligatoria al screening.** Si de una nota truncada se rescata una queja de memoria, el
> paciente **sí reporta quejas subjetivas**: la frase 5 del bloque 7 se recorta a
> `…no reporta sintomatología vinculada al malestar psicológico.` (ver `mapeo-excel-a-word.md` §4.1).
> Dejar la forma larga afirmaría lo contrario de lo que dice la anamnesis, **en el mismo informe**.
>
> **Alcance estricto — se descarta sólo por estar incompleto o ser ilegible, nunca por su contenido.**
> Una nota completa y entendible se incluye siempre, aunque sea incómoda, negativa o breve. La skill
> **no decide qué es relevante**; sólo detecta qué es inutilizable.
>
> **Confirmado (2026-09-07):**
> - **No matizar** — poner el contenido tal cual está tipeado (la profesional escribe notas más
>   claras si hace falta). Las notas son un **punteo en vivo**: la skill **sí expande** el telegrama a
>   prosa coherente, pero **preserva el fondo y las citas textuales verbatim** — cambia la forma,
>   nunca el contenido.
> - **Incluir los antecedentes familiares** (p. ej. `mamá con EA`). No se omiten.
> - Lo único que **no** se redacta son las notas internas de protocolo (p. ej. `PROTOCOLO XTEND`).

**3. `PRUEBAS ADMINISTRADAS`** — la lista de la batería tomada.

🚩 **Desde V6 este bloque SE DERIVA del Excel** (decisión del usuario, 2026-09-28 — **reemplaza** la
lista canónica fija de 12 ítems del 2026-09-17, la regla "el C-QSM va siempre" y el "límite
conocido" que obligaba a avisar en cada informe). Sale del listado **`A73:B86`**:

- Van **sólo los ítems con `Si`** en la columna `B`, **en el orden del Excel**.
- El texto se copia **literal de la columna `A`**, sin "corregir" mayúsculas (va `Mini mental state
  examination`, `Trail making test`, `Test de Stroop`, `Figura de Rey`).
- Los que dicen `No` (o están vacíos) **no van**, aunque sus puntajes estén cargados en el cuadro. El
  listado no se cruza con el cuadro: ni se agrega una prueba porque tenga puntaje, ni se saca porque
  no lo tenga.

Los 14 ítems posibles (`A73:A86`): AIVD · MMSE · BEM-MS · BEM-ML · TMT A y B · Fluencias · TBA · Span de
dígitos · TRO · IFS · K-10 · C-QSM · Test de Stroop · Figura de Rey.

Si el listado viene **entero vacío** (archivo anterior a V6), no inventar la lista: decirlo en el
bloque 12 y pedirla.

No lleva `.docx` en el modo de respaldo: son líneas de texto plano que se pegan directo.

**4. Tabla `SÍNTESIS DEL RENDIMIENTO`** — `orden-filas-sintesis.md`.

🚩 **La cantidad de filas varía por paciente.** La plantilla trae las **39 filas posibles** y en el
informe van **sólo las que tienen dato en el Excel**: en `sintesis` se escribe una clave por fila con
PB, y el script borra las demás y reubica el rótulo del área si hace falta. `Recuperación
disejecutiva`, `ROC estrategia` y `ROC copia` son **cualitativas** (PB con el texto, sin Z ni X).

Los tres patrones de llenado:

- **Con Z**: PB numérico · Z a **2 decimales con coma, con el cero final** (`-0,90`, no `-0,9`) o el
  cap · **1 X** en la columna de rango que corresponde.
- **Cualitativa simple**: el texto entero va en **PB** (`29/30`, `3 normal`, `Normal`, `No`) · Z
  vacía · sin X.
- **AVD y KPDS-10**: PB numérico · la palabra de `D19`/`D20` en Z · sin X.

En una frase: **la X se completa si y solo si Z es numérico**, y el texto cualitativo va en PB salvo
en AVD y KPDS-10. Nunca se escribe texto en una celda que no lleva dato (ni `N/A`, ni `—`, ni un
pendiente): el sombreado gris de la plantilla ya marca "no aplica".

Cap: `Z ≥ +3` → `≥3`, `Z ≤ −3` → `≤-3`; el valor capado igual lleva X en la columna del extremo.
⚠️ **El cap lo aplica la skill.** El Excel lo muestra capado, pero eso es un formato de número: al leer
el archivo por código sale el Z crudo (`-3.1067…`), nunca `≤-3`.

> ✅ **La X ya viene calculada en el Excel.** Las 8 columnas `E:L` traen `"X"` o `""` por fórmula en
> las filas con Z. **Leerlas y transcribirlas** (`x` = 1 a 8, de `E` a `L`) en vez de decidir el
> tramo. La regla de tramos de `orden-filas-sintesis.md` está para **verificar**, no para derivar.

### 🚩 Autochequeo obligatorio — declararlo en la salida

Son filas escritas a mano: los errores de transcripción son el riesgo principal y **todos estos
números son verificables antes de entregar**. Contarlos y decir el resultado:

| Chequeo | Valor esperado |
|---|---|
| **X contra el Excel** | cada `X` emitida coincide con la de `E:L` de esa fila. **Si alguna no coincide, es un hallazgo: no "corregir" el Excel en silencio — decirlo en el bloque 12.** |
| **Filas presentes** | una clave en `sintesis` por **cada fila del cuadro con PB cargado** (de las 39 de `orden-filas-sintesis.md`), y ninguna por las vacías. La línea `tabla de síntesis: N filas · … borradas (…)` del script tiene que listar exactamente las de PB vacío. |
| Filas cualitativas nuevas | `recuperacion` / `roc_estrategia` / `roc_copia` presentes **si y sólo si** `C36` / `C37` / `C55` tienen valor (`No` en `C36` cuenta como valor) |
| `grafico1` vs tabla | `null` exactamente en las posiciones cuya fila no está (el script aborta si no coincide) |
| Filas con `X` | una `X` por cada fila con Z numérico (15 en una batería completa), ninguna en el resto |

### Formato — **sólo para el modo de respaldo**: `.docx` clonando la tabla de la plantilla

En el modo normal el script arma esta tabla dentro del informe. En el modo de respaldo, primera
opción: un `.docx` que contenga **sólo esta tabla**, clonada de `plantilla-informe.docx` (es la
segunda tabla del documento). **Clonar, no reconstruir:** copiar el XML de la tabla, borrar las filas
sin dato y reemplazar sólo tres cosas por fila: el texto de `PB`, el texto de `Z` y en qué celda va la
`X`. Nunca tocar `tcPr` (anchos, sombreados, `vMerge`, `gridSpan`): ahí vive el formato. Si se borra
la fila que abre un área, pasar la celda `ÁREA` (con `vMerge restart` y el rótulo) a la primera fila
que queda del grupo. La profesional lo abre, `Ctrl+A`, `Ctrl+C`, y reemplaza la tabla vieja.

Referencia de la tabla de la plantilla, para verificar que el clon no se deformó:

| Parámetro | Valor |
|---|---|
| Filas | **42**: 1 de agrupación + 1 de encabezados + **39 de datos posibles** + 1 de leyenda |
| Columnas | 13 en la grilla: `1727` `1701` `1034` `708` `581` `684` `941` `667` `677` `650` `645` `572` `64` twips |
| Ancho / sangría | `tblW` = `10651` dxa · `tblInd` = **`-714`** (lo que hace entrar las 12 columnas en la página) · layout `fixed` |
| Bordes | todos `nil` **salvo `insideH` = `single sz=4` negro** |
| Sombreado de tramos (filas con Z) | cols 1–2 = `A6A6A6` (gris oscuro) · col 3 = `D9D9D9` (gris claro) · cols 4–8 sin sombrear |
| Filas sin Z (cualitativas) | `Z` + los 8 tramos en `D9D9D9` |
| Leyenda | última fila de la tabla: viene con el clon, no hay que copiarla de otro lado |

### Alternativa: HTML

Sólo si tampoco se puede generar ese `.docx`. Bloque de código HTML que ella guarda como `.html`, abre
en el navegador, selecciona y copia a Word. Controles de forma:

- Fila de agrupación **con `colspan`** que suma **8**: `Deterioro significativo`=2 (`< -3`,
  `-3 a -2`) · `Puntajes bajos`=1 (`-2 a -1`) · `Puntajes promedio`=2 (`-1 a 0`, `0 a +1`) ·
  `Puntajes superiores`=3 (`+1 a +2`, `+2 a +3`, `> +3`). Sin `colspan`, los rótulos se corren y los
  anchos se deforman (error real del 2026-09-08).
- Encabezado de **12 columnas**: `ÁREA` · `PRUEBA` · `PB` · `Z` + los 8 tramos.
- Columna `ÁREA` fusionada con **`rowspan` = cantidad de filas presentes del grupo**; las demás filas
  del grupo omiten esa celda.
- Gris con `style="background-color:#D9D9D9"` en las celdas que no llevan puntaje Z y `#A6A6A6` en
  las columnas de deterioro significativo; celdas vacías, sin texto.
- La leyenda **no** va en el HTML: después de pegar hay que recuperarla de un informe anterior, y
  ajustar el ancho (clic derecho → **Autoajustar → Autoajustar al contenido** → **Propiedades de
  tabla → Tabla → Ancho preferido → 130 %**). Avisar las dos cosas en el bloque 12.

**5. Valores del gráfico 1** (14 valores Z) — `orden-categorias-graficos.md`. Mismos valores
redondeados y capados que la columna Z de la tabla, pero **como números JSON** (`-0.9`, `0.45`, cap
`-3`/`3`), y **`null` en la posición de cada prueba no tomada** — el script borra esa categoría (y
aborta si no coincide con la tabla).
Sólo en el modo de respaldo, cuando se pegan a mano en el Excel del gráfico: **coma decimal** y sin
el cero final (`-0,9`), empezando en la celda inmediatamente debajo del encabezado con el año.

**6. Valores del gráfico 2** (10 ítems del K-10) — ✅ **sale del Excel**: `B58:B67`, en ese orden,
enteros sin decimales ni cap. Etiquetas y celdas destino en `orden-categorias-graficos.md`. Chequeo:
la suma de los 10 tiene que dar `B68`, y `B68` debería coincidir con `C20` (el PB de la tabla de
síntesis); si no coincide, decirlo. 🚩 **Si el K-10 no se tomó** (ítems vacíos), `grafico2` = `null`
y el script borra el gráfico.

**7. Sección de screening** — **esqueleto de 6 frases, transcrito literal en
`mapeo-excel-a-word.md` §4.1: copiarlo de ahí.** Sólo una de las seis lleva puntajes
(`(MMSE=29/30; TRO= 10/10; INECO=27,5/30)`, de `C15`, `C18` y `C26`; **la prueba que no se tomó sale
del paréntesis**); las otras cinco **van siempre** — discurso, nivel de alerta y fatiga,
orientación, malestar psicológico + quejas subjetivas, autonomía en AVD. **El Word lo llama INECO; el
Excel, IFS Total.** Va como un solo párrafo corrido, sin puntajes entre paréntesis fuera de la frase
4. ⚠️ En la primera corrida real se emitió sólo la frase de puntajes y se perdieron tres frases
fijas. Además:
- **Orientación temporal/espacial:** sale de `C16` y `C17` (`Si`/`No`/`Medio`). Con las dos en `Si`
  va el boilerplate `Orientación temporal y espacial conservadas.`; si alguna dice `No`, **invertir la
  frase para esa orientación** en vez de emitir el boilerplate. Si las celdas están vacías, va la
  forma afirmativa y el pendiente se lista en el bloque 12, nunca dentro de la oración.
- **Quejas subjetivas de memoria (C-QSM):** sale de `B70`. Con puntaje, quejas presentes = **> 3**.
  Si la celda está **vacía**, la observación deriva de la anamnesis / motivo de consulta. No inventar
  un puntaje ni escribirlo en el informe. (Que el C-QSM figure en la lista lo decide el listado,
  `B84`, no esta celda.)
- **Malestar psicológico sin K-10:** si el K-10 no se tomó, esa mitad de la frase 5 también se deriva
  de la anamnesis, y el bloque 12 avisa que la categoría diagnóstica se propuso sin el corte ≥ 25.

**Pruebas no tomadas en la prosa (bloques 7–10).** Lo que no se tomó no se narra: se omiten o se
adaptan las frases que lo nombran (sin TMT no hay rastreo visual ni flexibilidad cognitiva; sin BEM-ML
no hay material contextualizado; etc.). Un área **sin ninguna fila** en la tabla va `null` en `areas`
y **tampoco aparece en el recap**. Las frases fijas de apertura de cada sección que sí se imprime
(nivel de alerta, comprensión/expresión…) se mantienen. **`Recuperación disejecutiva`, `ROC
estrategia` y `ROC copia` no se narran nunca**: van sólo en la tabla (decisión del usuario,
2026-09-28).

**8. Cuatro secciones por área cognitiva** — cada una con título, la línea
`Impresión diagnóstica del área: rendimiento cognitivo <calificación>` y un párrafo. Reproducir la
inconsistencia `del área` (secciones 1 y 2) / `por área` (secciones 3 y 4). Léxico Z → palabra
**confirmado** (2026-09-07): `alto` Z > 1 · `conservado`/`normal` (son lo mismo) −1,49 a 1 · `bajo`
−1,99 a −1,5 · `deficitario` ≤ −2.

**`mapeo-excel-a-word.md` §4.2 es de lectura obligatoria antes de escribir estos cuatro párrafos.**
Lo esencial:

- 🚫 **Ni siglas ni valores Z en la prosa.** El Z ya está en la tabla y en el gráfico; el párrafo lo
  traduce. `(DD=0,45)` está prohibido. Lo único numérico admitido es el PB en palabras
  (`logrando retener 7 dígitos de manera directa`).
- 🚫 **No se narran nunca:** `BEM–MS CE`, los 8 subpuntajes del IFS + `Índice MT`, ni los ensayos
  `AS1/AS2/AS3` sueltos. El IFS se resume en `Puntaje conservado en la prueba ejecutiva.`
- 🚩 **`BEM–MS Sem` no es "memoria semántica":** mide el beneficio de la facilitación por claves
  semánticas. Un Sem bajo se dice `bajo beneficio de la facilitación de claves semánticas`, **nunca**
  como una falla de una función. Tabla completa sigla BEM → prosa en §4.2.
- Cada sección tiene **frases fijas de apertura** (nivel de alerta, comprensión/expresión, entonación
  y articulación, el párrafo entero de visoconstrucción): están literales en §4.2.

**9. Párrafo de recap de conclusiones** — área por área con los conectores del ejemplo, en este
orden: **visoconstrucción (+ orientación) → lenguaje → atención/ejecutivas → memoria (seriada, luego
lógica)**. Es el inverso de la tabla **salvo memoria, que va última** — observado en los dos informes
reales (`mapeo-excel-a-word.md` §4.3).

**10. Frase de cierre** — **una sola oración**, que arranca con `En conclusión,`. Del template de la
categoría elegida, adaptada al perfil real del paciente, nombrando la función afectada en palabras
clínicas (`recuperación de la memoria`) y **sin siglas ni índices**.

**11. Categoría diagnóstica + viñetas de `Se sugiere:`** — aplicar `regla-diagnostica.md`.
⚠️ **Nunca elegir categoría en silencio.** No basta el umbral de Z (ver el recuadro al inicio de
`regla-diagnostica.md`):
- **No tratar las submedidas derivadas como disparador de DCL.** En especial **CE** (= promedio de
  Sem y Rec, "no pesa tanto" y muy exigente). Pesar los **índices principales de área** — para
  memoria: AST (codificación), RSE (evocación), Rec (almacenamiento). Si esos están conservados y sólo
  caen submedidas → la lectura es **fallas aisladas (categoría 2)**, no DCL.
- **Proponer** la categoría, mostrar los Z que la disparan **marcando cuáles son submedidas**, y dejar
  claro que **la decisión final es del médico**.
- Mismas viñetas y orden del template; **localizar el paréntesis de hábitos leyendo la anamnesis** (si
  el paciente ya usa estrategias de compensación o ya hace actividad física, no sugerirlas).
  El paréntesis es un **sintagma nominal de 3 a 8 palabras** con lo que **sí** se sugiere
  (`(mejorar calidad del sueño, técnicas de manejo del estrés)`). Nada de metacomentario del tipo
  `ya realiza actividad física, por lo que no se sugiere incorporarla`: eso va al bloque 12.
- Si Z < -1,5 + AVD conservadas y aplican simultáneamente compromiso anímico Y riesgo de evolución,
  **señalarlo explícitamente** — la prioridad entre esas dos categorías todavía no está confirmada.

**12. Reporte de faltantes y dudas** — bloque final con los faltantes detectados (ver arriba), las
celdas sospechosas y todo lo que quedó marcado como dudoso. Este bloque no se pega en el Word: es
para el profesional. Incluye además:

- **Los valores recuperados** (p. ej. `C27` reconstruida desde el serial), para que los confirme.
- **Las oraciones con ranura** (`[solo / acompañado por …]`), citadas textualmente.
- **El razonamiento del paréntesis de hábitos**: qué se descartó de la anamnesis y por qué.
- **La categoría diagnóstica propuesta**, con los Z que la disparan y cuáles son submedidas.
- **Sólo si se cayó al modo de respaldo**: que se cayó y por qué; y si el bloque 4 salió en HTML,
  que hay que ajustar el ancho y recuperar la leyenda. En el modo normal **no mencionar nada de esto**.
- **Ediciones a hacer sobre el Word**, si quedó alguna a mano. La lista de pruebas, las filas de la
  tabla y los gráficos se ajustan solos: **no hay que avisar que se borre ninguna línea**.

#### ⛔ Qué NO va nunca en el bloque 12

Este bloque es para **faltantes y dudas reales**, no para reconfirmar decisiones ya tomadas. No
reabrir nada de esto, aunque el Excel traiga el dato cargado:

| No preguntar por… | Porque… |
|---|---|
| la fila `Deriva:` / `B11` | los 6 campos del bloque 1 quedaron fijos el 2026-09-17 |
| `B8` (acompañamiento) o `B12` (riesgo) como filas de la tabla | ídem — `B8` va a la prosa, `B12` a la categoría |
| una prueba con puntaje que el listado marca `No` (o al revés) | listado y cuadro son independientes por decisión del usuario (2026-09-28) |
| si las filas ROC / Recuperación deberían narrarse | van sólo en la tabla (2026-09-28) |
| `de control` vs `por control` | fijado en `por control` el 2026-09-17 |
| el ajuste de ancho al 130 % o la leyenda al pie | no aplican con el `.docx` |
| el separador decimal | fijado: **coma** en la tabla y en el pegado manual (2026-09-17); **punto** sólo dentro del JSON de los gráficos |

Regla general: **si una decisión está marcada con 🚩 y fecha en este paquete, está cerrada.** Si algo
de eso parece mal para un caso puntual, decirlo **una vez** y en una línea, no como pregunta abierta.

## Reglas de negocio a aplicar

- Sintomatología anímica: se deriva de K-10 ≥ 25 (`C20`). No hay una celda de flag aparte: si la
  profesional quiso sobrescribirlo, lo hizo pisando `C20` a mano — ver el chequeo de entrada 3.
- AVD conservadas/comprometidas: 0–5 = comprometidas, 6–8 = conservadas. **La palabra que va al Word
  sale de `D19`, no de esta tabla.**
- Desempate en rangos cuando el Z cae justo en un límite: **pendiente de confirmar**. Propuesta:
  límite inferior inclusive, superior exclusivo. Si un Z cae exactamente en un borde, señalarlo.
- FF y TRO aparecen dos veces en la tabla de síntesis — completar ambas filas (`ff_atencion` y
  `ff_lenguaje`, `tro_screening` y `tro_viso`) si tienen dato.
- BEM–MS AST: el PB es el **promedio de los 3 trials truncado a 2 decimales** (ya sale por fórmula del
  Excel). La skill lo usa tal como viene en `C41`, no lo recalcula.
- IFS Índice MT (`C27`): deriva de **Dígitos Atrás + Memoria de Trabajo Visual**. Es **texto**
  (`7/10`) y se copia tal cual; sólo aplica el rescate del chequeo 8 si alguna vez vuelve como número.
- Orientación (`C16`/`C17`) y riesgo de evolución (`B12`) **no** son filas de la tabla de síntesis:
  la plantilla tiene 39 filas posibles aunque el cuadro del Excel tenga 41.

## Archivos de esta skill

- `plantilla-informe.docx` — **la plantilla del Word.** Se clona y se le reemplaza lo variable. Es el
  **superconjunto** del informe: trae las 39 filas posibles de la tabla, los dos gráficos, las cuatro
  secciones por área, la leyenda y la firma; el script borra lo que no corresponde. El logo que trae
  adentro no importa: el script siempre lo reemplaza según `protocolo`. 88 KB: se le quitaron las
  fuentes embebidas, que pesaban 6,5 MB y no hacen falta (la fuente es Arial).
- `generar_informe.py` — **el generador.** Sólo biblioteca estándar. Ubica las secciones por el texto
  de sus encabezados, no por posición, así sobrevive a que se edite la plantilla. Aborta si falta un
  ancla, si un conteo no cierra o si el JSON no es coherente (claves, gráficos y áreas contra la tabla).
- `recursos/` — las imágenes que elige el script: `encabezado-breyna.png`, `encabezado-xtend.png`,
  `firma-agustina.png`, `firma-josefina.png`.
- `mapeo-excel-a-word.md` — **esquema del Excel + de dónde sale cada bloque del Word.** El mapa
  principal y la única fuente de direcciones de celda.
- `orden-filas-sintesis.md` — las 39 filas posibles con su clave, celda de origen, patrones de llenado.
- `orden-categorias-graficos.md` — los dos gráficos: orden, redondeo/cap, valores `null`.
- `regla-diagnostica.md` — las 6 categorías + cortes de K-10/AVD + qué se adapta de los templates.
- `ejemplo-informe.md` — **informe modelo completo (datos ficticios)**, referencia de tono, estructura
  y fraseo para los bloques narrativos. No hay que adjuntar ningún informe modelo al chat.

Nombres, fechas y citas de paciente del paquete son **ficticios** o anónimos. El Excel del paciente **no** va dentro de
la skill: es el input que se adjunta en cada pedido.
