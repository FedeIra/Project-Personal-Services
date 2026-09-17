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

Los dos archivos están **en esta misma carpeta**, junto a este `SKILL.md`. Localizarlos antes de
empezar (`ls` sobre el directorio de la skill) y usar la ruta absoluta que corresponda.

## 🚫 Prohibido construir el documento

**Está terminantemente prohibido crear el `.docx` con `python-docx`, `docx.Document()`,
`Document()`, o armando el XML a mano.** No importa lo razonable que parezca: el formato del informe
es irreproducible desde cero y el resultado va a estar mal aunque se vea prolijo.

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

| Viene de la plantilla (no se toca) | Lo produce la skill (va en `datos.json`) |
|---|---|
| encabezado institucional con el logo | los 6 datos personales |
| títulos de todas las secciones | los párrafos de anamnesis |
| estructura de la tabla de síntesis (12 columnas, grises, celdas combinadas) | PB, Z y la X de cada una de las 36 filas |
| los dos gráficos | los 14 + 10 valores |
| la leyenda al pie | el screening y los 4 párrafos por área |
| la firma y el cierre | recap, frase de cierre y viñetas |

Si una de esas cosas falta o cambió de nombre en el resultado, **es que no se clonó la plantilla**.

## 🚩 Antes de escribir `datos.json` — leer las reglas de contenido

Que el formato lo resuelva el script **no cambia una sola regla de qué dice el informe**. El JSON no
es un volcado del Excel: cada clave tiene reglas propias, y son las mismas que en el modo de bloques.
**Leerlas antes de redactar, no después:**

| Antes de escribir… | Leer |
|---|---|
| `anamnesis` | `mapeo-excel-a-word.md` §3 + la sección `MOTIVO DE CONSULTA` de `ejemplo-informe.md`. **Prosa, nunca viñetas rotuladas.** Las notas de protocolo no se redactan; de una nota truncada se conserva la afirmación y se descarta sólo el fragmento cortado. |
| `screening` | `mapeo-excel-a-word.md` §4.1 — el esqueleto de 6 frases está transcrito **literal**. Copiarlo, no reescribirlo. |
| `areas` | `mapeo-excel-a-word.md` §4.2 — léxico Z→palabra, sigla→función, y las dos prohibiciones duras: **ni siglas ni valores Z en la prosa**. `CE` no se narra nunca; `Sem` se dice como *bajo beneficio de la facilitación de claves semánticas*. |
| `sintesis` | `orden-filas-sintesis.md` — las 36 filas en orden posicional, el cap de ±3, y el **autochequeo obligatorio** contra las columnas `E:L` del Excel. |
| `grafico1` / `grafico2` | `orden-categorias-graficos.md` — orden de las categorías, redondeo y cap. |
| `recap`, `cierre`, `sugerencias` | `regla-diagnostica.md` — la categoría se **propone**, la decide el médico; el orden del recap; el paréntesis de hábitos se deriva de la anamnesis. |

⚠️ El detalle de cada clave está en **«Contenido de los 12 bloques»**, más abajo en este archivo. Ese
apartado sigue vigente tal cual: lo único que cambió es cómo se entrega, no qué se escribe.

## Al terminar

1. Ofrecer el `.docx` para descargar.
2. **Pegar en el chat el resumen que imprime el script**, literal. Es la evidencia de que la corrida
   fue completa:
   ```
   datos personales: 6 filas, 2 sobrantes eliminadas
   anamnesis: N párrafos (la plantilla traía 6)
   pruebas administradas: 12 ítems (la plantilla traía 11)
   tabla de síntesis: 36 filas, N celdas escritas
   screening + 4 secciones por área: 9 párrafos
   conclusiones: recap + cierre · N viñetas (la plantilla traía 4)
   gráfico 1: 14 puntos + 14 celdas del libro embebido
   gráfico 2: 10 puntos + 10 celdas del libro embebido
   ```
3. Escribir el **bloque 12 (faltantes y dudas)** como texto en el chat.

Si el script **aborta**, no entregar nada: reportar el error tal cual y, si corresponde, caer al modo
de bloques de respaldo diciéndolo explícitamente.

## Qué recibe esta skill

Un único Excel adjunto en el chat (`excelEvaluacionCompletoV5.xlsx` o equivalente). **Sólo se lee la
hoja `TABLA DE FORMULAS`**; las otras seis (`Stroop`, `MMSE`, `Puntajes Equivalentes`, `PRUEBAS`,
`FLUENCIAS`, `BACK UP`) son tablas de normas que ya alimentaron los `VLOOKUP` y no se leen.

Esquema de la hoja (detalle completo, con las fórmulas, en `mapeo-excel-a-word.md` §1):

| Rango | Contenido |
|---|---|
| `B2:B10` | Demográficos **y** parámetros: nombre, edad, fecha de nacimiento, nivel educativo, lateralidad, fecha de evaluación, acompañamiento, derivante, riesgo de evolución. |
| `B3`, `B5` | Edad y nivel educativo — **drivers de todas las fórmulas**, y los mismos que van al Word: **un solo lugar, no hay duplicado**. |
| `A11:L50` | Cuadro de pruebas: `A`=Área `B`=Prueba `C`=PB `D`=Z `E:L`=los 8 tramos de rango. Filas 11 y 12 = encabezados. |
| `A13`, `A19`, `A34`, `A44`, `A49` | Rótulos de las 5 áreas, en celdas **combinadas** (`A13:A18`, `A19:A33`, `A34:A43`, `A44:A48`, `A49:A50`). |
| `C14`, `C15` | Orientación temporal / espacial (`Si`/`No`/`Medio`). **No son filas de la tabla de síntesis** — alimentan la frase 3 del screening. |
| `D17`, `D18` | Interpretación de AVD y de KPDS-10 (texto, pass-through). Ojo: van en la columna `Z`. **Las dos por fórmula** desde el 2026-09-17. |
| `C34`, `C35`, `C36` | Ensayos BEM–MS AS1 / AS2 / AS3 — **son filas del cuadro desde V5** (antes vivían en `P35:P37`). |
| `E:L` | Las 8 columnas de rango, **con la X ya calculada por fórmula** en las 15 filas con Z. |
| `Q32:R46` | Media y desvío por prueba (`VLOOKUP`). Sólo backend: no se lee para el informe. |
| `B53:B62` | Los 10 ítems del K-10, en orden del gráfico. `B63` = `SUMA`. |
| `B65` | Puntaje del C-QSM (vacío si no se tomó). |
| `A68:A76` | Notas crudas de la anamnesis, una viñeta por celda (filas combinadas `A:G`). |

`B4` y `B7` son **seriales de fecha** de Excel: convertir a `dd/mm/aaaa`, no imprimir el número.

### 🚩 V5 cambió las direcciones — y cambió qué tiene que calcular la skill

**Todas las direcciones del cuadro de pruebas se corrieron respecto de V3/V4** (AS1/AS2/AS3 pasaron a
ser filas propias y empujaron 3 filas todo lo de abajo; el K-10 quedó en `B53:B62`). Si una referencia
dice `C34` para AST, `D43` para TBA o `B60` como total del K-10, es de una versión vieja. (Ojo: esas
celdas **existen** en V5, con otro contenido — `C34` es AS1 y `B60` es el ítem 8 del K-10. Una
dirección vieja no falla: devuelve el dato equivocado en silencio.)

Y, sobre todo, **hay tres formas distintas de leer el cuadro**:

| Rango | Qué devuelve al leerlo por código | Qué hace la skill |
|---|---|---|
| `E:L` (los 8 tramos) | `"X"` o `""` — el resultado de la fórmula | **transcribe la X**; ya no decide el tramo |
| `D19:D46` (el Z) | el Z **crudo** (`-3.1067…`) | **aplica el cap** de ±3 ella misma (en el Excel el cap es sólo formato de número) |
| todo lo demás | valor normal | pass-through |

➡️ Esto **no elimina los autochequeos** del bloque 4: los vuelve más fuertes, porque pasan de
verificar un cálculo propio a **cruzar contra lo que ya calculó el Excel**. Si una X propia no coincide
con la del Excel, eso es un hallazgo: decirlo en el bloque 12.

### Chequeos de entrada — qué verificar y avisar, sin rellenar

✅ **`excelEvaluacionCompletoV5.xlsx` (2026-09-16) cierra los faltantes bloqueantes** que tenían las
versiones anteriores: los 10 ítems del K-10, el flag de riesgo de evolución, la orientación
temporal/espacial, el C-QSM, el `IFS Índice MT` como texto, la unificación del bloque demográfico y
las 8 columnas de rango por fórmula. **Ya no hay ningún bloque del informe que no se pueda generar
desde el Excel**, salvo lo que abajo se marca.

Lo que sí hay que chequear en cada archivo que llegue:

1. **`B65` (C-QSM) puede venir vacía.** El C-QSM **no se toma en toda evaluación**
   (`informeFinal.docx` no lo lista; `informeFinal2.docx` sí) y **su puntaje nunca aparece en el
   informe**: no es fila de la tabla, no está en los gráficos y no se cita en la prosa. Lo único que
   decide es media frase del screening. Sin puntaje, la observación de quejas subjetivas **se deriva
   de la anamnesis** y **hay que avisar en el bloque 12 que la línea del C-QSM se borra de
   `PRUEBAS ADMINISTRADAS`** del Word. Si hay puntaje, quejas presentes = **> 3**. Nunca inventar uno,
   y **nunca escribirlo en el informe** aunque exista.
2. **PB derivados: `C37` (AST) y `C41` (CE).** Salen por fórmula — `C37`=`=TRUNCAR(V38;2)` (promedio
   de los 3 ensayos) y `C41`=`=TRUNCAR(U43;2)` (promedio de Sem y Rec). En archivos anteriores están
   tipeados a mano: comparar cada uno con su fórmula y, si no coinciden, decirlo en el bloque 12.
   **Nunca recalcular el Z** — viene del Excel, incluso si el PB no cierra.
3. 🚩 **Total del K-10 — el chequeo de mayor impacto clínico.** `C18` tiene que ser `=B63`
   (`=SUMA(B53:B62)`), así que el PB de la tabla de síntesis, el gráfico 2 y el corte ≥ 25 salen del
   mismo lugar. Si `C18` está tipeado y difiere de `B63`, **señalarlo y no elegir por cuenta propia**:
   puede ser un override deliberado del corte anímico. **Caso real:** una versión intermedia de V5
   traía `C18`=`30` con los ítems sumando `24` — la tabla decía `Malestar severo` y correspondía
   `Normal`, cruzando el corte que decide la categoría diagnóstica.
4. 🚩 **`D17` (interpretación de AVD) tiene que venir por fórmula.** Desde el 2026-09-17 se calcula
   con `=SI(C17>=8;"Autónomo";…)` (ver `regla-diagnostica.md`). Si llega **tipeada a mano**, el valor
   igual se usa tal cual —es pass-through— pero **avisarlo en el bloque 12**: significa que ese archivo
   quedó con la versión vieja y la palabra puede no corresponder al puntaje. Chequeo barato: contrastar
   `D17` contra `C17` usando la tabla de tramos.
5. **`B8` (`Asiste acompañado con`) tiene rótulo y dominio ambiguos.** Leerlo así: `No` o vacío ⇒
   `asiste solo/a`; cualquier otro texto ⇒ `asiste acompañado/a por <texto>`. Anotarlo en el bloque 12.
6. **Campos Sí/No.** V5 tiene validación de lista en `B5`, `B6`, `B10` y `C14:C15`. Igual normalizar
   tolerantemente (`Sí`/`si`/`SI`/`No`/`no`) por si llega un archivo viejo. **`C14`/`C15` admiten un
   tercer valor, `Medio`**: no colapsarlo a `Si` — redactar la frase 3 en consecuencia o señalarlo. Si
   un valor no es interpretable, **señalarlo** en vez de asumir. **Nunca inferir el riesgo de
   evolución de los puntajes.**
7. **Las dos filas de TRO pueden traer valores distintos** (`C16` screening vs `C49`
   visoconstrucción). **Copiar cada celda en su fila, no reconciliarlas**, y anotar la diferencia en
   el bloque 12 si existe.
8. **Celdas `X/Y` con pinta de fecha.** V3 las guarda como texto, pero si alguna vez llega un número
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
  ⚠️ La versión anterior de esta línea decía *"no generar el `.docx` final porque los gráficos son
  objetos OLE"*. **Eso era falso y quedó sin efecto (2026-09-17):** se verificó en `informeFinal.docx`
  que no hay ningún objeto OLE — son gráficos nativos cuyos valores se reescriben en el caché del
  propio gráfico. Generar el `.docx` es ahora el comportamiento por default.
- **No "corregir" las inconsistencias de la plantilla.** La leyenda que menciona trazado diagonal, y
  el `del área` / `por área` de las secciones, se reproducen tal cual.

## Gotcha técnico — guardar el Excel antes de subirlo

El Excel se lee con código, y las celdas con fórmula (la columna `D` de las filas con Z, **las 8
columnas `E:L`**, `Q32:R46`, `V38`, `U43`, `B63`, `C18`, **`D17`**, `D18`, `C37`, `C41`) sólo tienen el
valor calculado cacheado si el archivo fue **guardado en Excel**. Si se sube sin guardar, o fue
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

En los dos casos, el bloque 12 lo repite con el detalle. ⚠️ Fallo observado en la revisión
2026-09-08 (`../ejemplos/revision-salida-ia-vs-informeFinal2.md` §B9).

---

## 🚩 Cómo se entrega: **un `.docx` completo** (desde el 2026-09-17)

La skill **no devuelve 12 bloques para pegar a mano**. Genera **el informe entero en Word**, listo
para que la profesional lo revise, edite y firme.

El procedimiento es siempre el mismo y **no admite improvisar**:

1. Leer el Excel y **producir un `datos.json`** con las partes variables (esquema abajo).
2. Ejecutar `python generar_informe.py datos.json informe.docx` — el script está en este paquete.
3. **Ofrecer el `.docx` para descargar** + pegar en el chat el resumen que imprime el script.
4. Escribir el **bloque 12 (faltantes y dudas) como texto en el chat**. Ése es el único que no va al
   documento.

⚠️ **No construir el documento con `python-docx` ni armar el XML a mano.** El script **clona
`plantilla-informe.docx`** y reemplaza sólo lo variable; todo el formato —tabla de 12 columnas con
sus grises y celdas combinadas, los dos gráficos, el encabezado, la leyenda, la firma— viene de la
plantilla. Reconstruirlo es exactamente lo que no hay que hacer.

⚠️ **Si el script aborta, NO entregar un informe parcial.** Aborta a propósito cuando no encuentra una
sección o cuando un conteo no cierra (36 filas, 14 y 10 valores de gráfico). Reportar el error en el
bloque 12 y, si hace falta, caer al modo de bloques.

### Esquema de `datos.json`

| Clave | Contenido | Bloque |
|---|---|---|
| `personales` | 6 strings: paciente, edad (`61 años`), nacimiento, nivel educativo, lateralidad, evaluación | 1 |
| `anamnesis` | lista de párrafos (cantidad variable) | 2 |
| `pruebas` | los 12 ítems de la lista canónica | 3 |
| `sintesis` | **36** objetos `{"pb":…, "z":…, "x": 0-8}` en el orden de `orden-filas-sintesis.md` (`x` = en qué tramo va la X, `0` = ninguno) | 4 |
| `grafico1` | **14** números | 5 |
| `grafico2` | **10** enteros | 6 |
| `screening` | un párrafo | 7 |
| `areas` | `atencion`/`memoria`/`lenguaje`/`visoconstruccion`, cada una `[impresión, párrafo]` | 8 |
| `recap`, `cierre` | un párrafo y una oración | 9 y 10 |
| `sugerencias` | lista de viñetas (cantidad variable) | 11 |

Ejemplo completo: `../pruebas/ejemplo-datos.json` (fuera del paquete).

🚩 **En el JSON los números van con punto** (`-0.9`) — es formato de archivo. La **coma** es para los
valores que se pegan a mano en el Excel de un gráfico, que es otra cosa. No confundirlos.

### Lo que el `.docx` resuelve solo

- La fila `Deriva:` de la plantilla **se borra**, no se deja vacía.
- La leyenda al pie y la firma **ya vienen**: no hay nada que copiar de un informe anterior.
- La tabla entra en la página sin el viejo ajuste de ancho al 130 %.
- La cantidad de párrafos de anamnesis, de ítems de pruebas y de viñetas de sugerencias **se adapta**
  a cada paciente, aunque difiera de la plantilla.

### Modo de respaldo: los 12 bloques para copy/paste

Si no está disponible la creación de archivos de claude.ai (ver el requisito de plan en el bloque 1),
o si la profesional pide los bloques sueltos, emitirlos como antes — con los formatos que describe cada
bloque abajo — y **decirlo en el bloque 12**. Las reglas de contenido son las mismas en los dos modos.

---

## Contenido de los 12 bloques

> Esto define **qué dice** cada parte. En el modo `.docx` cada bloque es una clave de `datos.json`;
> los títulos de sección los pone la plantilla y **no se inventan ni se renumeran**.

Lo de abajo define **qué dice cada parte del informe**, y vale igual para el `.docx` y para el modo de
respaldo. En el modo `.docx`, cada bloque es una clave del JSON; los formatos de pegado que se
mencionan (`.docx` suelto, HTML, tabla en el chat) **sólo aplican al modo de respaldo**.

El mapeo completo de qué sale de dónde está en `mapeo-excel-a-word.md` §2, y las direcciones de celda
en §1 (**única fuente**; este archivo las repite). Para el **tono y el fraseo** de los bloques
narrativos (2, 7, 8, 9, 10), seguir el registro de `ejemplo-informe.md` (informe modelo completo,
ficticio).

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
| `Fecha de nacimiento` | `B4` | `dd/mm/aaaa` (es un serial de Excel) |
| `Nivel educativo alcanzado` | `B5` | tal cual |
| `Lateralidad` | `B6` | tal cual |
| `Fecha de evaluación` | `B7` | `dd/mm/aaaa` (es un serial de Excel) |

🚩 **Ninguna fila más, nunca** (decisión del 2026-09-17). `B8` (acompañamiento), `B9` (derivante) y
`B10` (riesgo de evolución) **no van en esta tabla**, aunque el Excel los traiga cargados y aunque la
plantilla de Word tenga una fila `Deriva:` — esa fila se deja vacía o la borra la profesional; la
skill no la completa. Tampoco se inventan DNI ni ocupación. El dato de `B8` no se pierde: alimenta la
frase de acompañamiento del bloque 7.

⛔ **Y tampoco se pregunta por ella en el bloque 12.** Aunque `B9` traiga un derivante cargado, **no**
escribir nada del tipo *"confirmar si la plantilla tiene la fila `Deriva:`"*: la profesional ya
confirmó los 6 campos el 2026-09-17 y no quiere que se le vuelva a preguntar. `B9` cargado **no es**
un faltante ni una duda — es un dato del Excel que este informe no usa.

### Formato — **sólo para el modo de respaldo**: `.docx` descargable

> En el modo normal esta tabla va dentro del informe completo y no se entrega suelta. Lo de abajo
> aplica únicamente si se cayó al modo de bloques.

✅ **Éste es el default.** Generar con code execution (`python-docx`) un `.docx` que contenga **sólo
esta tabla**, y ofrecerlo para descargar. La profesional lo abre, `Ctrl+A`, `Ctrl+C`, y pega en su
informe. Word contra Word: el pegado es fiel siempre, sin depender de cómo renderice el chat.

**No es el informe final** — es sólo este bloque. La prohibición de generar el `.docx` completo sigue
en pie (ver "Qué NO debe hacer esta skill").

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

⚠️ **Requiere la creación de archivos de claude.ai** (preview en Max/Team/Enterprise; Pro se fue
incorporando después). **Si no está disponible**, caer a la alternativa de abajo y **decirlo en el
bloque 12** — no fallar en silencio.

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
`PacienteBunader, José AlbertoEdad61 años…` (observado el 2026-09-08 y de nuevo el 2026-09-17), con
los `|` a la vista y las líneas `|---|` convertidas en rayas por el autoformato de Word. Si pasa, se
corrige con **Pegar → Mantener formato de origen**.

**2. `MOTIVO DE CONSULTA Y ANTECEDENTES`** — redacción de las viñetas de `A68:A76` a prosa en tercera
persona y presente, una viñeta ≈ un párrafo, mismo orden, conservando las citas textuales entre
comillas. Formas fijas del primer y último párrafo, verbos de reporte y concordancia de género: ver
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
> **Caso de referencia, `A70`:** `QSM: olvida cosas puntuales (fue a un partido y por ahi `
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

⚠️ **Este bloque NO se deriva del Excel.** Es el boilerplate de la plantilla (clasificado `FIJO/FUERA`
en `mapeo-excel-a-word.md` §2). La skill lo reproduce literal, en este orden:

```
Actividades instrumentales de la vida diaria (AIVD de Lawton y Brody)
Mini mental state examination (MMSE)
Batería de eficiencia mnésica de Signoret – subtest memoria seriada (BEM-MS)
Batería de eficiencia mnésica de Signoret – subtest memoria lógica (BEM-ML)
Trail making test A (TMT A) y B (TMT B)
Fluencia verbal fonológica (FF) y semántica (FS)
Test de denominación de Boston abreviado (TBA)
Span de dígitos directos (DD) e inversos (DI)
Test del reloj a la orden (TRO)
Ineco frontal screening (IFS)
Escala de malestar psicológico (K-10)
Cuestionario de quejas subjetivas de memoria (C-QSM)
```

🚩 **Lista canónica indicada por el usuario el 2026-09-17: siempre estos 12 ítems, en este orden y con
estas mayúsculas.** Copiar literal, sin \"corregir\" la capitalización (va `Mini mental state
examination`, `Trail making test`, `Ineco frontal screening`, `Test de denominación de Boston
abreviado` — en minúsculas después de la primera palabra).

⚠️ **Difiere de `informeFinal.docx`** en el orden (ahí `TBA` va después de `TRO`) y en las mayúsculas.
**Manda esta lista, no la de la plantilla.**

⚠️ **El C-QSM va siempre, aunque `B65` esté vacía** — esto reemplaza la regla anterior, que lo hacía
condicional y mandaba borrar la línea cuando el cuestionario no se había tomado.

🚩 **Límite conocido, decirlo en el bloque 12 en cada informe:** si alguna de las otras 11 pruebas no
se tomó, **la skill igual la va a listar** — el Excel no registra qué batería se administró, sólo los
puntajes. Que una celda de PB esté vacía no es evidencia suficiente de que la prueba no se tomó.
**La profesional tiene que cotejar esta lista contra lo que realmente administró.** Hacerlo derivable
requiere un campo por prueba en el Excel → pendiente en `../preguntasParaLaProfesional.md`.

No lleva `.docx`: son 11–12 líneas de texto plano que se pegan directo.

**4. Tabla `SÍNTESIS DEL RENDIMIENTO` — se genera ENTERA, no como valores sueltos.**

✅ **Decisión de la profesional (2026-09-08): no hace falta conservar la tabla que ya está en el
Word.** La skill entrega una **tabla nueva y completa** que la reemplaza. No tiene que ser
visualmente idéntica; tiene que **cumplir con lo que informa** la original.

### Formato — **sólo para el modo de respaldo**: `.docx` clonando la tabla real

> En el modo normal el script ya arma esta tabla dentro del informe. Lo de abajo aplica únicamente si
> se cayó al modo de bloques.

✅ **Éste es el default.** Generar con code execution un `.docx` que contenga **sólo esta tabla**, con
el formato exacto de la que ya está en el informe. Ella lo abre, `Ctrl+A`, `Ctrl+C`, y reemplaza la
tabla vieja. Nada de guardar `.html` ni pasar por el navegador.

🚩 **Método recomendado: clonar, no reconstruir.** El formato de esta tabla es demasiado específico
para rehacerlo de memoria (12 columnas, sin bordes verticales, sangría negativa, dos niveles de
sombreado, celdas verticalmente combinadas por área). Si se dispone del XML de una tabla previa,
**copiarla y reemplazar sólo tres cosas por fila**: el texto de `PB`, el texto de `Z`, y en qué celda
va la `X`. Nunca tocar `tcPr` (anchos, sombreados, `vMerge`, `gridSpan`): ahí vive el formato.

Especificación, extraída de `../ejemplos/informeFinal.docx` el 2026-09-17:

| Parámetro | Valor |
|---|---|
| Filas | **39**: 1 de agrupación + 1 de encabezados + **36 de datos** + 1 de leyenda |
| Columnas | 13 en la grilla: `1727` `1701` `1034` `708` `581` `684` `941` `667` `677` `650` `645` `572` `64` twips |
| Ancho / sangría | `tblW` = `10651` dxa · `tblInd` = **`-714`** · layout `fixed` |
| Bordes | todos `nil` **salvo `insideH` = `single sz=4` negro**. Sin líneas verticales ni marco exterior. |
| Fuente | Arial en todo |
| Fila de agrupación | 7 pt (`sz=14`) negrita, centrada |
| Encabezados `ÁREA`/`PRUEBA`/`PB`/`Z` y rótulos de área | 9 pt (`sz=18`) negrita, centrados |
| Nombre de prueba | 9 pt regular, **alineado a la derecha** |
| `PB` y `Z` | 8 pt (`sz=16`) centrados |
| Sombreado de tramos (filas con Z) | cols 1–2 = `A6A6A6` (gris oscuro) · col 3 = `D9D9D9` (gris claro) · cols 4–8 sin sombrear |
| Filas sin Z (cualitativas) | las 9 celdas (`Z` + los 8 tramos) en `D9D9D9` |
| Rótulo de área | celda con `vMerge restart` + `vMerge` en las filas siguientes del grupo |
| Interlineado | `line=276 auto` |

⚠️ **La sangría negativa `tblInd = -714` es lo que hace entrar las 12 columnas en la página.** Con
ella, la tabla entra bien y **ya no hace falta el viejo ajuste de "Autoajustar al contenido + ancho
130 %"** que se usaba con el paste desde HTML.

✅ **La leyenda al pie es la fila 39 de la tabla**, no un párrafo aparte: viene incluida y no hay que
copiarla de ningún lado. (Versiones anteriores de este archivo decían lo contrario.)

⚠️ **No validar las X contra la tabla de un informe viejo:** `informeFinal.docx` tiene al menos una
fila mal (Lenguaje `FF`, sin X). La referencia son **las columnas `E:L` del Excel**, como dice el
autochequeo de abajo.

### Alternativa: HTML

Sólo si no se puede generar el `.docx` (ver el requisito de plan en el bloque 1). Bloque de código
HTML, que ella guarda como `.html`, abre en el navegador, selecciona y copia a Word — camino
verificado el 2026-09-08, pero con 5 pasos manuales. En ese caso **sí** hace falta el ajuste de ancho
post-paste (clic derecho → **Autoajustar → Autoajustar al contenido** → **Propiedades de tabla →
Tabla → Ancho preferido → 130 %**) y la leyenda hay que copiarla de un informe anterior. Si se cae a
este camino, **decirlo en el bloque 12**.

### Partes de la tabla

Un solo bloque, con:

1. Título `SÍNTESIS DEL RENDIMIENTO – PERFIL COGNITIVO`.
2. Fila de agrupación de rangos, **con `colspan`**: `Deterioro significativo`=2 (`< -3`, `-3 a -2`) ·
   `Puntajes bajos`=1 (`-2 a -1`) · `Puntajes promedio`=2 (`-1 a 0`, `0 a +1`) ·
   `Puntajes superiores`=3 (`+1 a +2`, `+2 a +3`, `> +3`).
3. Encabezado de **12 columnas**: `ÁREA` · `PRUEBA` · `PB` · `Z` + los 8 tramos de rango.
4. Las **36 filas de datos**, en el orden exacto de `orden-filas-sintesis.md`.

**La leyenda al pie NO se genera.** ✅ Decisión de la profesional (2026-09-08): es **idéntica en todos
los informes**, así que se conserva la de su plantilla y la skill no la emite.

> ⚠️ **Avisar esto en el bloque 12:** en el Word, la leyenda es la **última fila de la propia tabla**
> (39 filas = 2 de encabezado + 36 de datos + 1 de leyenda), no un párrafo suelto. Si se borra la
> tabla vieja entera para pegar la nueva, **la leyenda se va con ella**. Hay que volver a ponerla —
> como nunca cambia, alcanza con copiarla de cualquier informe anterior.
>
> Corolario: la discusión sobre el `trazado diagonal` que la leyenda menciona y no existe deja de
> afectar la salida de la skill. Sigue abierta como decisión de ella sobre su propia plantilla
> (`../preguntasParaLaProfesional.md` §C.1), pero la skill ya no la toca ni la reproduce.

**Columna `ÁREA`: celdas fusionadas verticalmente (`rowspan`), como en la plantilla original.**
✅ Decisión 2026-09-08 — revierte la uniformidad anterior (que repetía el nombre en cada fila para
simplificar la generación). Sólo la **primera fila de cada uno de los 5 grupos** lleva la celda
`ÁREA` (con su `rowspan`); las demás filas del grupo **omiten esa celda por completo** — por eso
tienen **11** `<td>` en vez de 12. Esto sólo es posible en HTML (Markdown no soporta `rowspan`), otra
razón por la que la tabla se entrega siempre en HTML. Los 5 grupos y su `rowspan`:

| Área | Filas | `rowspan` |
|---|---|---|
| `Screening cognitivo y psiquiátrico` | 1–4 | 4 |
| `Atención y funciones ejecutivas` | 5–19 | 15 |
| `Memoria episódica` | 20–29 | 10 |
| `Lenguaje` | 30–34 | 5 |
| `Visoconstrucción` | 35–36 | 2 |

Los tres patrones de llenado siguen igual:

- **Con Z** (15 filas): PB numérico · Z a **2 decimales con coma, con el cero final** (`-0,90`, no
  `-0,9`) o el cap · **1 X** en la columna de rango que corresponde · las otras 7 **vacías**.
- **Cualitativa simple** (19 filas): el texto entero va en **PB** (`29/30`, `3 normal`, `Normal`) ·
  **celda vacía, sin texto**, con fondo gris `#D9D9D9` en Z y en las 8 columnas de rango.
- **AVD y KPDS-10** (2 filas): PB numérico · la palabra de `D17`/`D18` en Z · **celda vacía, sin
  texto**, con fondo gris `#D9D9D9` en las 8 de rango.

En una frase: **la X se completa si y solo si Z es numérico**, el texto cualitativo va en PB salvo en
AVD y KPDS-10, y **el fondo gris `#D9D9D9` marca las celdas donde la prueba no lleva puntaje Z** — sin
ningún texto adentro.

✅ **Cambio 2026-09-08: ya no se escribe `N/A`.** La celda queda **vacía, sólo con el fondo gris** —
así lo hacía el Word original antes de que la skill agregara el texto como sustituto del color en
Markdown. En HTML el color sobrevive el paste (verificado en Word real), así que el texto ya no hace
falta y sólo agrandaba las columnas. Las columnas de severidad de las filas con Z llevan `#A6A6A6`
(`< -3`, `-3 a -2`) y `#D9D9D9` (`-2 a -1`), **vacías**, igual que antes.

> 🚩 **El gris de "no aplica" no es lo mismo que una celda vacía sin sombrear.** En una fila **con Z**,
> las 7 columnas de rango sin `X` **van vacías y sin sombreado propio** (salvo las bandas de severidad,
> que llevan su color fijo en todas las filas): esos tramos sí aplican, el puntaje simplemente no cae
> ahí. El gris `#D9D9D9` uniforme en Z + las 8 de rango de las filas cualitativas/AVD/KPDS-10 significa
> algo distinto: "esta prueba no tiene puntaje Z". Ninguna de las dos lleva texto — la diferencia la
> hace sólo el patrón de sombreado.
> Control: **187 celdas vacías por no llevar puntaje Z** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10
> × 8, todas con fondo `#D9D9D9`) y **15 filas con una `X`**.

Cap: `Z ≥ +3` → `≥3`, `Z ≤ −3` → `≤-3`; el valor capado igual lleva X en la columna del extremo.
⚠️ **El cap lo aplica la skill.** El Excel lo muestra capado, pero eso es un formato de número: al leer
el archivo por código sale el Z crudo (`-3.1067…`), nunca `≤-3`.

> ✅ **La X ya viene calculada en el Excel (V5).** Las 8 columnas `E:L` traen `"X"` o `""` por fórmula
> en las 15 filas con Z. **Leerlas y transcribirlas** en vez de decidir el tramo. La regla de tramos de
> `orden-filas-sintesis.md` sigue documentada porque es lo que hay que **verificar**, no lo que hay que
> derivar. La skill **sigue armando la tabla entera** — lo que cambia es de dónde sale la X.

### 🚩 Autochequeo obligatorio — declararlo en la salida

Son 36 filas escritas a mano: los errores de transcripción son el riesgo principal y **todos estos
números son verificables antes de entregar**. Contarlos y decir el resultado:

| Chequeo | Valor esperado |
|---|---|
| **X contra el Excel** | cada `X` emitida coincide con la de `E:L` de esa fila. **Si alguna no coincide, es un hallazgo: no "corregir" el Excel en silencio — decirlo en el bloque 12.** |
| Filas de datos | **36**, en el orden de `orden-filas-sintesis.md` |
| Celdas por fila | **12** en las **5** filas que abren grupo de área (llevan el `rowspan`) · **11** en las **31** filas restantes (sin celda `ÁREA`, fusionada hacia arriba) |
| Celdas `ÁREA` emitidas | **5** (una por grupo, no 36) — suma de sus `rowspan` = **36** (4+15+10+5+2) |
| Suma de los `colspan` de la fila de agrupación | **8** (2+1+2+3) |
| Celdas vacías sin puntaje Z (fondo `#D9D9D9`) | **187** (19 filas cualitativas × 9 + 2 de AVD/KPDS-10 × 8) |
| Filas con `X` | **15**, una `X` por fila, sólo donde Z es numérico |
| Leyenda al pie | **ausente** |

El conteo de celdas vacías y el de `X` sólo valen para una batería completa; si falta alguna prueba,
recalcular y decir de dónde sale la diferencia.

⚠️ **El chequeo del `colspan` nació de un error real** (prueba en Word del 2026-09-08): sin los
`colspan`, cada rótulo ocupaba una sola columna, los cuatro tramos de la derecha quedaban sin rótulo
y los anchos se deformaban. Se detectó recién al mirar la tabla ya armada en Word.

Hay un generador de referencia en `../ejemplos/generar-tabla-sintesis.js` con el HTML exacto que se
validó (estructura, colores, colspan). **Usarlo como plantilla de la que se copia la forma**,
cambiando los datos — no reinventar el markup en cada corrida.

> ⚠️ **Por qué cambió el enfoque:** antes se pegaban sólo los valores, con tabs, dentro de la tabla
> existente. En la primera corrida real los valores eran **todos correctos** y el pegado se habría
> desalineado igual, porque los tabs finales se pierden en el chat y se perdían distinto según la fila
> (filas de 9 y de 7 campos donde todas debían tener 10) — revisión 2026-09-08, §B1. Además nunca se
> probó si el cursor de Word baja a la celda `PB` de la fila siguiente o a la primera columna. Al
> generar la tabla entera, **los dos riesgos desaparecen**. El enfoque viejo queda documentado como
> alternativa en `orden-filas-sintesis.md`.

**5. Valores del gráfico 1** (14 valores Z) — `orden-categorias-graficos.md`. 🚩 **Coma decimal**
(`0,45`), igual que la tabla de síntesis — el Excel de los gráficos está en configuración regional
española. **Sin** el cero final, eso sí (`-0,9`, no `-0,90`).
Mismos valores redondeados y capados que la columna Z de la tabla (el cap va como número `-3`/`3`, no
como texto). Instrucción de pegado **posicional**: empezar en la celda inmediatamente debajo del
encabezado con el año, porque la columna destino cambia según el archivo.

**6. Valores del gráfico 2** (10 ítems del K-10) — ✅ **sale del Excel**: `B53:B62`, en ese orden,
enteros sin decimales ni cap. Etiquetas y celdas destino en `orden-categorias-graficos.md`. Chequeo:
la suma de los 10 tiene que dar `B63`, y `B63` debería coincidir con `C18` (el PB de la tabla de
síntesis); si no coincide, decirlo.

**7. Sección de screening** — **esqueleto de 6 frases, transcrito literal en
`mapeo-excel-a-word.md` §4.1: copiarlo de ahí.** Sólo una de las seis lleva puntajes
(`(MMSE=29/30; TRO= 10/10; INECO=27,5/30)`, de `C13`, `C16` y `C24`); las otras cinco son
observación conductual invariante y **van siempre** — discurso, nivel de alerta y fatiga,
orientación, malestar psicológico + quejas subjetivas, autonomía en AVD. **El Word lo llama INECO; el
Excel, IFS Total.** Va como un solo párrafo corrido, sin puntajes entre paréntesis fuera de la frase
4. ⚠️ En la primera corrida real se emitió sólo la frase de puntajes y se perdieron tres frases fijas
(revisión 2026-09-08, §B4). Además:
- **Orientación temporal/espacial:** sale de `C14` y `C15` (`Si`/`No`). Con las dos en `Si` va el
  boilerplate `Orientación temporal y espacial conservadas.`; si alguna dice `No`, **invertir la
  frase para esa orientación** en vez de emitir el boilerplate. Si las celdas están vacías, va la
  forma afirmativa y el pendiente se lista en el bloque 12, nunca dentro de la oración.
- **Quejas subjetivas de memoria (C-QSM):** sale de `B65`. Con puntaje, quejas presentes = **> 3**.
  Si la celda está **vacía** (no se tomó), la observación deriva de la anamnesis / motivo de consulta
  y hay que avisar en el bloque 12 que se borra esa línea de `PRUEBAS ADMINISTRADAS`. No inventar un
  puntaje ni escribirlo en el informe.

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

- **Los valores recuperados** (p. ej. `C25` reconstruida desde el serial), para que los confirme.
- **Las oraciones con ranura** (`[solo / acompañado por …]`), citadas textualmente.
- **El razonamiento del paréntesis de hábitos**: qué se descartó de la anamnesis y por qué.
- **Los conteos de campos** de los 3 bloques de pegado.
- **Sólo si el bloque 4 cayó al camino HTML**: avisar que hay que ajustar el ancho de la tabla después
  de pegarla (Autoajustar al contenido + Ancho preferido 130 %) y recuperar la leyenda al pie de un
  informe anterior. Con el `.docx` **no hace falta ninguna de las dos cosas** — no mencionarlas.
- **Ediciones a hacer sobre la plantilla del Word**, no sólo datos faltantes. La más frecuente:
  **`PRUEBAS ADMINISTRADAS` es una lista fija que incluye `Cuestionario de quejas subjetivas de
  memoria (C-QSM)`, y el C-QSM a veces no se toma** — si no se tomó, avisar que **hay que borrar esa
  línea** del informe. Mismo criterio para cualquier prueba de la lista sin dato en el Excel.

#### ⛔ Qué NO va nunca en el bloque 12

Este bloque es para **faltantes y dudas reales**, no para reconfirmar decisiones ya tomadas. No
reabrir nada de esto, aunque el Excel traiga el dato cargado:

| No preguntar por… | Porque… |
|---|---|
| la fila `Deriva:` / `B9` | los 6 campos del bloque 1 quedaron fijos el 2026-09-17 |
| `B8` (acompañamiento) o `B10` (riesgo) como filas de la tabla | ídem — `B8` va a la prosa, `B10` a la categoría |
| `de control` vs `por control` | fijado en `por control` el 2026-09-17 |
| el ajuste de ancho al 130 % o la leyenda al pie | ya no aplican con el `.docx` |
| el separador decimal de los gráficos | fijado en **coma** el 2026-09-17 |

Regla general: **si una decisión está marcada con 🚩 y fecha en este paquete, está cerrada.** Si algo
de eso parece mal para un caso puntual, decirlo **una vez** y en una línea, no como pregunta abierta.

## Reglas de negocio a aplicar

- Sintomatología anímica: derivar de K-10 ≥ 25 por default; usar el flag manual del Excel si el
  profesional lo sobrescribió.
- AVD conservadas/comprometidas: 0–5 = comprometidas, 6–8 = conservadas. **La palabra que va al Word
  sale de `D17`, no de esta tabla.**
- Desempate en rangos cuando el Z cae justo en un límite: **pendiente de confirmar**. Propuesta:
  límite inferior inclusive, superior exclusivo. Si un Z cae exactamente en un borde, señalarlo.
- FF y TRO aparecen dos veces en la tabla de síntesis — completar ambas filas, no omitir ninguna.
- BEM–MS AST: el PB es el **promedio de los 3 trials truncado a 2 decimales** (idealmente ya sale por
  fórmula del Excel). La skill lo usa tal como viene en `C37`, no lo recalcula.
- IFS Índice MT (`C25`): deriva de **Dígitos Atrás + Memoria de Trabajo Visual**. Desde V3 es **texto**
  (`7/10`) y se copia tal cual; sólo aplica el rescate del chequeo 8 si alguna vez vuelve como número.
- Orientación (`C14`/`C15`) y riesgo de evolución (`B10`) **no** son filas de la tabla de síntesis:
  la tabla tiene 36 filas aunque el cuadro del Excel tenga 38.

## Archivos de esta skill

- `plantilla-informe.docx` — **la plantilla del Word.** Se clona y se le reemplaza lo variable. Trae el
  encabezado vigente (el de `informeFinal2.docx`), los dos gráficos, la leyenda y la firma. 87 KB: se le
  quitaron las fuentes embebidas, que pesaban 6,5 MB y no hacen falta (la fuente es Arial).
- `generar_informe.py` — **el generador.** Sólo biblioteca estándar. Ubica las secciones por el texto
  de sus encabezados, no por posición, así sobrevive a que se edite la plantilla. Aborta si falta un
  ancla o si un conteo no cierra.

- `mapeo-excel-a-word.md` — **esquema del Excel + de dónde sale cada bloque del Word.** El mapa
  principal.
- `orden-filas-sintesis.md` — las 36 filas, celda de origen, patrones de llenado, mecánica de paste.
- `orden-categorias-graficos.md` — los dos gráficos: orden, redondeo/cap, celdas destino.
- `regla-diagnostica.md` — las 6 categorías + cortes de K-10/AVD + qué se adapta de los templates.
- `excel-unificado-spec.md` — estado del Excel entregado y ajustes propuestos.
- `../preguntasParaLaProfesional.md` — todo lo que falta confirmar con la profesional (fuera del
  paquete de la skill; es documentación interna, no se sube).
- `../ejemplos/revision-salida-ia-vs-informeFinal2.md` — **comparación de una corrida real de la
  skill contra el informe que la profesional escribió a mano desde el mismo Excel** (2026-09-08).
  Es de dónde salen las advertencias `⚠️ Fallo observado` de estos archivos: qué validó bien (todos
  los PB/Z/X y los 14 valores del gráfico) y los 11 fallos corregidos. Fuera del paquete, no se sube.
- `ejemplo-informe.md` — **informe modelo completo (datos ficticios)**, referencia de tono, estructura
  y fraseo. **Está dentro del paquete**: no hay que adjuntar ningún informe modelo al chat, la skill
  ya lo tiene. Para los bloques narrativos, seguir el registro de este archivo.

## ⚠️ Datos sensibles del paquete de la skill

El informe modelo del paquete (`ejemplo-informe.md`) usa **datos ficticios** — es seguro para subir a
claude.ai. Se derivó de `../ejemplos/informeFinal.docx`, que ya era ficticio.

⚠️ **No reemplazarlo por `../ejemplos/informeFinal2.docx` sin anonimizar:** ese informe (y su Excel
`../ejemplos/excelEvaluacionCompletoV5.xlsx` y sus versiones anteriores) son de **pacientes reales** (nombre, fecha de nacimiento,
antecedente familiar, citas de la entrevista). Lo que se sube al paquete queda publicado de forma
persistente. Si algún día se quiere el tono exacto de `informeFinal2`, primero anonimizarlo.

El Excel del paciente **no** va dentro de la skill: es el input que se adjunta en cada pedido.
