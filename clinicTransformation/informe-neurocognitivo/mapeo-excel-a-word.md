# Mapeo Excel → Word — de dónde sale cada bloque del informe

> Direcciones de celda de **`excelEvaluacionCompletoV6.xlsx`** (2026-09-28). La lógica del Word está
> reconstruida comparando pares reales Excel → informe escrito por la profesional; **la plantilla de
> Word es estructuralmente idéntica en todos los informes**, así que lo de acá es la plantilla, no una
> particularidad de un paciente.
>
> 🚩 Todas las direcciones de este archivo son de V6. Una dirección de una versión anterior no falla:
> devuelve otro dato en silencio (en V6, `C37` es ROC estrategia y `B63` es un ítem del K-10).

Cada bloque está clasificado por **tipo de trabajo**, que es lo que decide qué puede automatizarse:

| Tipo | Significado |
|---|---|
| **FIJO** | Boilerplate idéntico en todos los informes. Ya está en la plantilla, nadie lo toca. |
| **PASS** | Transcripción determinística de una celda del Excel. Cero criterio. |
| **DERIV** | Cálculo determinístico a partir del Excel (redondeo, cap, elección de columna de rango). |
| **LLM** | Redacción. Borrador para revisión obligatoria del profesional. |
| **FUERA** | No está en el Excel. Hay que traerlo de otra parte (papel / historia clínica / criterio). |

---

## 1. Esquema real de `excelEvaluacionCompletoV6.xlsx`

> 📌 **Direcciones válidas para `excelEvaluacionCompletoV6.xlsx`** (recibido 2026-09-28), hoja
> `TABLA DE FORMULAS`. **Este bloque es la única fuente de direcciones del paquete**: el resto de los
> archivos las repite, no las define. Si llega una versión nueva del Excel, actualizar acá primero y
> propagar.
>
> 🚩 **V6 corrió las filas** respecto de V5: dos campos nuevos en los datos personales (`Protocolo` y
> `Evaluado por`) empujan todo 2 filas, y dos filas nuevas en Atención (`Recuperación disejecutiva` y
> `ROC estrategia`) empujan 2 más todo lo que viene desde Memoria.

Una sola hoja aporta datos del paciente: **`TABLA DE FORMULAS`**. Las otras seis (`Stroop`, `MMSE`,
`Puntajes Equivalentes`, `PRUEBAS`, `FLUENCIAS`, `BACK UP`) son tablas de normas/apoyo y **no se
leen** — son el backend de los `VLOOKUP`.

### 🚩 Qué cambió en V6

| Cambio | V5 | V6 |
|---|---|---|
| **Protocolo** (decide el logo del encabezado) | no existía | `B9`: `Breyna` / `Xtend` |
| **Evaluado por** (decide la firma) | no existía | `B10`: `Dra. Josefina González Aguilar` / `Dra. María Agustina Aceiro` |
| **Recuperación disejecutiva** | no existía | fila `36`, `C36`: `Sí` / `No` / `Parcial` — sin Z |
| **ROC estrategia** | no existía | fila `37`, `C37`: `Normal` / `Cuestionable` / `Inadecuada` — sin Z |
| **ROC copia** | no existía | fila `55`, `C55`: número o texto (`Normal`) — sin Z |
| **Listado de pruebas administradas** | no existía (la lista del informe era fija) | `A73:B86`, 14 ítems con `Si`/`No` |
| **Anamnesis** | una viñeta por celda (`A68:A76`) | **una sola celda** (`A89`), viñetas separadas por salto de línea |
| **`B8` Asiste acompañado** | texto libre | validación `Si`/`No` |

⚠️ **La hoja tiene celdas combinadas.** En un rango combinado el valor vive en la celda de arriba a
la izquierda y las demás se leen vacías.

| Rango combinado | Qué es |
|---|---|
| `A15:A20` · `A21:A37` · `A38:A47` · `A48:A52` · `A53:A55` | rótulos de las 5 áreas (una celda por grupo) |
| `E13:F13` · `H13:I13` · `J13:L13` | encabezado agrupado de los tramos de rango |
| `A88:L88` · `A89:L89` | rótulo y texto de la anamnesis |
| `A90:G113` (una por fila) | espacio reservado debajo de la anamnesis |
| `A1:B1` · `D11:L11` · `P31:W31` · `T41:U41` · `V42:V44` | rótulos y notas internas |

### 🚩 Las tres formas de leer el cuadro — **no son iguales**

| Rango | Qué tiene | Qué devuelve una lectura por código |
|---|---|---|
| `E:L` (los 8 tramos) | fórmula que pone la `X` en el tramo del Z | **el resultado cacheado: `"X"` o `""`.** Se lee directo — la skill **transcribe** la X en vez de decidir el tramo. |
| `D21:D50` (el Z) | número + **formato** `[<=-3]"≤-3";[>=3]"≥3";0.00` | **el Z crudo** (`-3.1067…`). El cap es sólo *display*: **nunca** se lee `"≤-3"`. |
| todo lo demás | valores y fórmulas normales | pass-through como siempre |

➡️ **El cap de ±3 sigue siendo trabajo de la skill**, tanto para la columna Z de la tabla como para el
gráfico 1. Lo que la skill no hace es **elegir la columna de rango**: eso ya viene resuelto en `E:L`.

### Bloque de datos personales (`A1:B12`) — es también el bloque de parámetros

| Celda | Campo | Rol |
|---|---|---|
| `B2` | Nombre del paciente (apellido, nombre) | → tabla de datos personales |
| `B3` | Edad (número) | **Driver de todos los `VLOOKUP` a `PRUEBAS`/`FLUENCIAS`** + tabla de datos personales |
| `B4` | Fecha de nacimiento (**fecha**) | → tabla |
| `B5` | Nivel educativo alcanzado | **Driver del `MATCH` de `FLUENCIAS`** + tabla |
| `B6` | Lateralidad | → tabla |
| `B7` | Fecha de evaluación (**fecha**) | → tabla |
| `B8` | `Asiste acompañado` (`Si`/`No`) | → primera frase de la anamnesis. `No` o vacío ⇒ `asiste solo/a`; `Si` ⇒ `asiste acompañado/a` (el Excel no dice por quién: si la anamnesis lo menciona, usarlo; si no, **ranura** `[acompañado por …]` y avisarlo en el bloque 12) |
| **`B9`** | **`Protocolo`** (`Breyna` / `Xtend`) | → clave `protocolo` del JSON: **logo del encabezado** |
| **`B10`** | **`Evaluado por`** | → clave `evaluador` del JSON: **firma del cierre** |
| `B11` | `Derivado por` | **no se usa** — no va a la tabla de datos personales (ver §2.1) |
| `B12` | `Riesgo de evolución` (`Si`/`No`) | → habilita la categoría 5 de `regla-diagnostica.md` |

`B3` es **número**, no texto: en el Word va como `<B3> años`. `B4` y `B7` son fechas: según la
librería llegan como fecha o como serial numérico; en el Word van siempre como `dd/mm/aaaa`.

`B9` y `B10` se copian **tal cual** al JSON: el script los reconoce tolerando tildes, mayúsculas y
espacios (las listas de validación tienen espacios después de la coma, así que el valor elegido
**puede** traer un espacio adelante). Si traen otra cosa, el script aborta.

### Cuadro de pruebas (`A13:L55`) — `A`=Área `B`=Prueba `C`=PB `D`=Z `E:L`=los 8 tramos

Dos filas de encabezado:

- **Fila 13** — agrupación de tramos, con celdas combinadas: `E13:F13` `Deterioro significativo` ·
  `G13` `Puntajes bajos` · `H13:I13` `Puntajes promedio` · `J13:L13` `Puntajes superiores`.
- **Fila 14** — `A14`=`Área`, `B14`=`Prueba`, `C14`=`PB`, `D14`=`Z`, y los 8 tramos en `E14:L14`.

**`C` la carga la persona; `D` es fórmula sólo en las filas con Z** — en las demás es texto de
interpretación o está vacía.

> 🚩 **Las filas del Excel y las del informe no son las mismas.** El cuadro va de la fila 15 a la 55 =
> **41 filas**, porque incluye las dos de orientación. La plantilla del informe tiene **39 filas
> posibles**, y el informe muestra sólo las que tienen dato (ver `orden-filas-sintesis.md`).

| Fila | Prueba | PB | Z | Clave del JSON | Nota |
|---|---|---|---|---|---|
| 15 | MMSE | `C15` | — | `mmse` | texto `29/30` |
| 16 | Orientación temporal | `C16` | — | — | `Si`/`No`/`Medio` — **no es fila de la tabla**, ver §2.2 |
| 17 | Orientación espacial | `C17` | — | — | ídem |
| 18 | TRO | `C18` | — | `tro_screening` | texto `10/10` |
| 19 | AVD | `C19` | `D19` | `avd` | `D19` = interpretación por fórmula (`Autónomo`…) |
| 20 | KPDS-10 | `C20` | `D20` | `kpds10` | `C20` = `=B68`; `D20` = interpretación por fórmula |
| 21 | DD | `C21` | `D21` | `dd` | |
| 22 | DI | `C22` | `D22` | `di` | |
| 23 | TMT A | `C23` | `D23` | `tmt_a` | signo invertido: `*-1` |
| 24 | TMT B | `C24` | `D24` | `tmt_b` | ídem |
| 25 | FF | `C25` | `D25` | `ff_atencion` | |
| 26 | IFS Total | `C26` | — | `ifs_total` | texto `27/30` |
| 27 | IFS Índice MT | `C27` | — | `ifs_mt` | texto `7/10` |
| 28–35 | IFS SM, IC, CIM, DA, MA, MTV, R, CIV | `C28`…`C35` | — | `ifs_sm` … `ifs_civ` | texto `3 normal` |
| **36** | **Recuperación disejecutiva** | `C36` | — | `recuperacion` | `Sí`/`No`/`Parcial`. **Sin Z ni X** |
| **37** | **ROC estrategia** | `C37` | — | `roc_estrategia` | `Normal`/`Cuestionable`/`Inadecuada`. **Sin Z ni X** |
| 38–40 | BEM – MS AS1, AS2, AS3 | `C38`…`C40` | — | `bem_as1` … `bem_as3` | PB por ensayo |
| 41 | BEM – MS AST | `C41` | `D41` | `bem_ast` | `C41` = `=TRUNCAR(V42;2)` |
| 42 | BEM – MS RSE | `C42` | `D42` | `bem_rse` | |
| 43 | BEM – MS Sem | `C43` | `D43` | `bem_sem` | |
| 44 | BEM – MS Rec | `C44` | `D44` | `bem_rec` | |
| 45 | BEM – MS CE | `C45` | `D45` | `bem_ce` | `C45` = `=TRUNCAR(U47;2)` |
| 46 | BEM – ML Inm | `C46` | `D46` | `bem_inm` | |
| 47 | BEM – ML Dif | `C47` | `D47` | `bem_dif` | |
| 48 | FF *(2ª aparición)* | `C48` | `D48` | `ff_lenguaje` | mismo valor que la fila 25 |
| 49 | FS | `C49` | `D49` | `fs` | |
| 50 | TBA | `C50` | `D50` | `tba` | |
| 51 | Comprensión | `C51` | — | `comprension` | texto `Normal` |
| 52 | Expresión | `C52` | — | `expresion` | texto `Normal` |
| 53 | TRO *(2ª aparición)* | `C53` | — | `tro_viso` | texto |
| 54 | MMSE copia | `C54` | — | `mmse_copia` | texto `Normal` |
| **55** | **ROC copia** | `C55` | — | `roc_copia` | número (`1`) o texto (`Normal`), tal cual. **Sin Z ni X** |

⚠️ **ROC copia tiene fórmulas en `E55:L55`, pero `D55` está vacía**, así que nunca dan `X`. No
tratarla como fila con Z.

### Las 8 columnas de rango (`E:L`) — la X ya viene calculada

**Sólo dan X las 15 filas con Z** (`21`–`25` y `41`–`50`). Cada columna es un tramo, con **límite
inferior inclusive y superior exclusivo**:

```excel
E21  =SI(ESNUMERO($D21);SI($D21<-3;"X";"");"")
F21  =SI(ESNUMERO($D21);SI(Y($D21>=-3;$D21<-2);"X";"");"")   … y así hasta …
L21  =SI(ESNUMERO($D21);SI($D21>=3;"X";"");"")
```

Los 8 tramos son **mutuamente excluyentes y exhaustivos**. El `ESNUMERO` implementa *"la X se pone si
y sólo si Z es numérico"*.

➡️ **La skill lee la X de acá en vez de derivar el tramo.** Los autochequeos del bloque 4 de
`SKILL.md` pasan de *verificar mi propio cálculo* a **cruzar contra el Excel**.

### Bloques auxiliares (columnas `P` a `W`) — backend, no van al Word

Media y desvío de las 15 pruebas con Z (`Q`/`R`, por `VLOOKUP` según `B3` y `B5`), los tres ensayos
de la BEM (`T`/`U`), el promedio `V42` = `(AS1+AS2+AS3)/3` (**insumo** del PB de AST, `C41`) y
`U47` = `(Sem+Rec)/2` (**insumo** del PB de CE, `C45`). **La skill no los lee**, y no hay que
"corregir" su alineación: las fórmulas de `D` apuntan ahí.

✅ **Dos PB salen por fórmula:** `C41` (AST) = `=TRUNCAR(V42;2)` y `C45` (CE) = `=TRUNCAR(U47;2)`. El
truncado (no redondeo) **mueve el Z** en AST: un PB de `7,66` da Z `-0,90` y `7,67` daría `-0,89`.
**La skill usa el PB tal como viene y no lo recalcula.**

### Bloque K-10 desglosado (`A57:B68`)

`A57`/`B57` son los rótulos (`Sintomatología` / `Puntaje`). `A58:A67` son los 10 ítems y `B58:B67`
sus puntajes, **en el orden del cuestionario en papel y del gráfico** (`orden-categorias-graficos.md`
§Gráfico 2). `B68` es `=SUMA(B58:B67)` — el total. `C68` es una nota interna (`No completar`).

✅ `C20` (el PB del K-10 de la tabla de síntesis) es `=B68`, así que el total de la tabla, el del
gráfico y el que dispara el corte ≥ 25 salen del mismo lugar. Si `C20` ≠ `B68`, **señalarlo en el
bloque 12 y no elegir por cuenta propia** — puede ser un override deliberado del corte anímico.

> ⚠️ **Este desfasaje ya ocurrió de verdad.** En una versión intermedia de V5 el PB del K-10 había
> quedado tipeado en `30` mientras los 10 ítems sumaban `24`: la tabla decía `Malestar severo` y
> correspondía `Normal`, cruzando el corte que decide la categoría diagnóstica. **Es el chequeo más
> barato con mayor impacto clínico de todo el paquete.**

Si los 10 ítems están vacíos (el K-10 no se tomó), la fila `kpds10` no va a la tabla y `grafico2` va
`null`: el script borra el gráfico entero.

### C-QSM (`A70` / `B70`)

`A70` es el rótulo y **`B70` el puntaje** (número entero suelto, vacío si no se tomó). Corte `> 3` ⇒
quejas presentes; celda vacía ⇒ la observación de quejas subjetivas deriva de la anamnesis. **El
puntaje no aparece nunca en el informe.** Que el C-QSM figure o no en `PRUEBAS ADMINISTRADAS` lo
decide el listado (`B84`), no esta celda.

### Listado de pruebas administradas (`A72:B86`)

`A72`/`B72` son los rótulos (`Pruebas administradas` / `Si/No`). Cada fila de `A73:A86` es el nombre
de una prueba **escrito exactamente como va al informe**, y `B73:B86` dice si se tomó:

| Fila | Prueba |
|---|---|
| 73 | Actividades instrumentales de la vida diaria (AIVD de Lawton y Brody) |
| 74 | Mini mental state examination (MMSE) |
| 75 | Batería de eficiencia mnésica de Signoret – subtest memoria seriada (BEM-MS) |
| 76 | Batería de eficiencia mnésica de Signoret – subtest memoria lógica (BEM-ML) |
| 77 | Trail making test A (TMT A) y B (TMT B) |
| 78 | Fluencia verbal fonológica (FF) y semántica (FS) |
| 79 | Test de denominación de Boston abreviado (TBA) |
| 80 | Span de dígitos directos (DD) e inversos (DI) |
| 81 | Test del reloj a la orden (TRO) |
| 82 | Ineco frontal screening (IFS) |
| 83 | Escala de malestar psicológico (K-10) |
| 84 | Cuestionario de quejas subjetivas de memoria (C-QSM) |
| 85 | Test de Stroop |
| 86 | Figura de Rey |

➡️ **`PRUEBAS ADMINISTRADAS` del informe = los ítems con `Si`, en este orden, con el texto de la
columna `A` copiado literal.** Los que dicen `No` (o están vacíos) no van.

🚩 **El listado y el cuadro son independientes** (decisión del usuario, 2026-09-28). El listado decide
**sólo** la lista de `PRUEBAS ADMINISTRADAS`; el cuadro decide **sólo** qué filas van a la tabla y a
los gráficos (fila con dato ⇒ va; fila vacía ⇒ no va). **No se cruzan ni se corrigen entre sí**: si
`Figura de Rey` dice `No` pero ROC copia tiene valor, la lista no nombra la Figura de Rey **y** la
tabla muestra ROC copia. No es un faltante ni una duda para el bloque 12.

### Bloque de anamnesis (`A88:A113`)

`A88` es el rótulo `Motivo de consulta y antecedentes`. 🚩 **Todas las notas viven en una sola
celda, `A89`** (combinada `A89:L89`): la primera línea es el motivo de consulta y las siguientes son
viñetas separadas por salto de línea (`\n`, a veces `\r\n`) y que empiezan con `- `. Puede haber
espacios duros (`\xa0`) al final de una línea: descartarlos. Partir el texto por los saltos de línea,
quitar el `- ` inicial y tratar cada línea como una nota: **una nota ≈ un párrafo**,
en el mismo orden. `A90:A113` están combinadas `A:G` y vacías en el ejemplo: si alguna trae texto,
son notas adicionales y se leen a continuación.

---

## 2. Estructura del Word y de dónde viene cada parte

En orden de aparición en el informe. ⚠️ **Esta numeración es el orden del documento Word,
no la de los bloques de salida de `SKILL.md`.** Para no confundirlas, en este archivo lo del Word se
llama **`parte N del Word`** y lo de la skill, **`bloque N`**.

Desde el renumerado del 2026-09-17 los **bloques 1–4 sí coinciden** con las partes 2–5 del Word
(datos personales, anamnesis, pruebas administradas, tabla de síntesis). La numeración se separa de
ahí en adelante, porque el Word incluye dos partes que nunca son bloques de salida (el título y la
firma) y la skill parte en dos lo que el Word junta. Cuando importe, referirse por nombre.

| # | Bloque del Word | Tipo | Origen |
|---|---|---|---|
| 0 | Encabezado con el logo de la clínica | PASS | `B9` (`Breyna` / `Xtend`) → el script cambia el logo |
| 1 | Título `EVALUACIÓN NEUROCOGNITIVA` | FIJO | plantilla |
| 2 | `DATOS PERSONALES` + tabla de **6 filas fijas** | PASS | `B2:B7` |
| 3 | `MOTIVO DE CONSULTA Y ANTECEDENTES` (7–9 párrafos) | **LLM** | `A89` (+ `A90:A113`) + `B8` — ver §3 |
| 4 | `PRUEBAS ADMINISTRADAS` (lista variable) | PASS | `A73:A86` con `Si` en `B73:B86` |
| 5 | Tabla `SÍNTESIS DEL RENDIMIENTO` (hasta 39 filas; sólo las que tienen dato) | PASS + DERIV | ver `orden-filas-sintesis.md` |
| 6 | Gráfico de líneas (hasta 14 valores Z; se borran las pruebas no tomadas) | DERIV | ver `orden-categorias-graficos.md` |
| 7 | Gráfico `Escala K-10` (10 valores, o se borra si no se tomó) | DERIV | `B58:B67` |
| 8 | `SCREENING COGNITIVO, PSIQUIÁTRICO, FUNCIONALIDAD Y OBSERVACIONES CONDUCTUALES` | **LLM** | `C15`, `C18`, `C26`, `C19`/`D19`, `C20`/`D20`, `C16`/`C17` + observación en vivo |
| 9 | 4 secciones por área cognitiva (un área sin ninguna fila se borra) | **LLM** | columna `D` del cuadro de pruebas — ver §4.2 |
| 10 | `CONCLUSIONES Y SUGERENCIAS` — párrafo de recap + frase de cierre | **LLM** | todas las Z + `regla-diagnostica.md` |
| 11 | `Se sugiere:` (4–6 viñetas) | template + LLM | `regla-diagnostica.md` — ver §4.3 |
| 12 | `Quedo a disposición…` + firma | PASS | `B10` → el script pone la firma de Agustina (imagen + `María Agustina Aceiro` / `Doctora en Psicología` / `M.N:67158`) o la de Josefina (una imagen que ya trae nombre y matrícula) |

🚩 **Pruebas no administradas (2026-09-28).** Lo que no se tomó **no aparece en ningún lado del
informe**: ni en la lista, ni en la tabla, ni en los gráficos, ni en la prosa. La lista sale del
listado `A73:B86`; la tabla y los gráficos, de qué filas del cuadro tienen dato. En la prosa, las
frases que nombran una prueba no tomada **se omiten o se adaptan** — p. ej. si no hubo TMT, el
párrafo de Atención no habla de rastreo visual ni de flexibilidad cognitiva; si no hubo MMSE, el
paréntesis de puntajes del screening no lo incluye.

### 2.1 Tabla de datos personales (parte 2 del Word)

Pass-through directo, con tres detalles:

- `B4` y `B7` son **fechas**. En el Word van como **`dd/mm/aaaa`**, sin hora. Si llegan como serial
  numérico, convertirlas — ejemplo ficticio: `25642` → `15/03/1970`; `46162` → `20/05/2026`. Nunca
  imprimir el número.
- 🚩 **El juego de campos es fijo: exactamente `B2:B7`, seis filas, siempre** (decisión del
  2026-09-17). Antes la regla era "respetar la plantilla" y llenar una fila `Deriva:` desde el
  derivante (hoy `B11`) cuando la plantilla la traía. **Eso quedó sin efecto.** El derivante no va a
  esta tabla: el script borra la fila `Deriva:` y la skill **no la reporta** en el bloque 12.
- **No hay DNI ni ocupación**, ni ningún otro campo. La lista de campos reales es exactamente `B2:B7`.
- `B8` (`Asiste acompañado`), `B9` (`Protocolo`), `B10` (`Evaluado por`) y `B12` (`Riesgo de
  evolución`) **no** van a esta tabla: `B8` alimenta la primera frase de la anamnesis, `B9` el logo,
  `B10` la firma y `B12` la categoría diagnóstica.

### 2.2 Las filas 16–17 del Excel no son filas del informe

`Orientación temporal` (`C16`) y `Orientación espacial` (`C17`) viven dentro del cuadro de pruebas,
entre MMSE y TRO. **No son filas de la tabla de síntesis**: ninguno de los dos informes reales las
tiene. Son insumo exclusivo de la **frase 3 del screening** (§4.1). 🚩 **No agregar dos filas a la
tabla para "que coincida con el Excel".**

✅ **Decisión (2026-09-16): se quedan donde están** en el Excel, junto al MMSE del que salen. La skill
simplemente no las emite como filas.

---

## 3. Parte 3 del Word — anamnesis: el bloque de mayor riesgo del pipeline

El Excel trae las notas crudas y el Word trae prosa en tercera persona, en presente, con las citas
textuales conservadas entre comillas. La transformación es sistemática (una viñeta ≈ un párrafo,
mismo orden) **pero no siempre es fiel**. Un par real (datos ficticios — ver "Datos sensibles" al
final de este archivo), ilustrando el tipo de desliz que puede ocurrir:

| Excel | Word |
|---|---|
| `- Animicamente: "bien", "cierto estrés laboral".` | `Anímicamente, se encuentra bien, "con poco estrés laboral".` |

El Excel dice *"cierto estrés"*; el Word dice *"poco estrés"*, y le cambia el contenido a una comilla
que se presenta como textual del paciente. Sea criterio clínico o error de tipeo, la conclusión
operativa es la misma:

> **Este bloque se entrega siempre como borrador y el profesional lo revisa frase por frase.** La
> skill no debe suavizar, reinterpretar ni reencuadrar el contenido anímico: transcribe lo que dice
> la nota. Si una nota es ambigua, la deja ambigua y lo señala; no elige una lectura.

✅ **Confirmado (2026-09-07):** la profesional pidió **que NO matice** — *"que lo ponga tal cual yo lo
tipié"* — y asume el trabajo de tomar notas más claras. Un cambio como `"cierto estrés"` →
`"poco estrés"` sería un desliz de tipeo, no un criterio a replicar.

**Matiz importante (no contradice lo anterior):** las notas son un **punteo en vivo**, en telegrama,
que ella luego pasa "a texto más completo y coherente". Entonces la skill **sí expande** el punteo a
prosa (gramática, conectores, tercera persona), pero **preserva el contenido y las citas textuales
verbatim** — expande la *forma*, nunca cambia el *fondo* ni suaviza una comilla del paciente.

Convenciones observadas en los dos informes:

- Primer párrafo, forma fija: `El Sr./La Sra. <Apellido> asiste solo/a a la consulta para la
  realización de una evaluación cognitiva por control.`
  🚩 **`cognitiva`, no `neurocognitiva`** (verificado contra un informe real el 2026-09-17). El
  título del documento sí es `EVALUACIÓN NEUROCOGNITIVA`, pero esta frase no. (El párrafo de muestra
  de la plantilla dice `neurocognitiva de control`: se reemplaza siempre, no copiarlo.)
  🚩 **`por control`, literal y sin alternativa** (decisión del 2026-09-17): no es una ranura, es texto
  fijo. La única variable de la frase es `solo/a` vs `acompañado/a …`, que sale de `B8`.
- Último párrafo, forma fija: `Vive <situación> y, según autoreporte, es autónomo/a en las
  actividades de la vida diaria.`
- Verbos de reporte rotados: `Refiere` · `Relata` · `Reporta` · `Menciona` · `En lo que concierne a`.
- 🚩 **Comillas tipográficas `“ ”`, no rectas `" "`** (los informes reales usan sólo curvas). Las
  citas del paciente van entre `“ ”`. El Excel las trae rectas — convertirlas al escribir el informe.
- Género y concordancia salen del paciente (`autónomo`/`autónoma`, `solo`/`sola`).
- Las **notas internas de protocolo no se redactan**: una nota como `PROTOCOLO XTEND` no aparece en el
  Word (es nota de trabajo, no del informe).
- **Antecedentes familiares → SÍ se incluyen.** ✅ Confirmado (2026-09-07): *"a veces se mencionan, a
  veces no, pero no estaría mal, más en este caso que hay antecedentes, mencionarlo"*. → La skill
  **incluye** el antecedente familiar (p. ej. `mamá con EA`) en la anamnesis.
- En general: **la skill incluye todo y marca lo dudoso**, sin decidir sola qué dejar afuera. No se
  redactan dos cosas, y sólo dos: las notas internas de protocolo, y las notas **truncadas o
  ininteligibles** (ver abajo).
- 🚩 **Nota truncada → se conserva la afirmación y se descarta sólo el fragmento cortado** (regla
  afinada el 2026-09-17). Lo habitual es que lo truncado sea el **ejemplo**, no el hecho: en la nota
  `QSM: olvida cosas puntuales (fue a un partido y por ahi `, `olvida cosas puntuales` está completo y
  va al informe; `(fue a un partido y por ahi ` se descarta. Son notas en vivo y a veces quedan a
  medias en el propio Excel: no es un problema de lectura. **Nunca completar ni adivinar** el
  fragmento. Si al sacarlo lo que queda no se entiende solo, ahí sí se omite la viñeta entera. En los
  dos casos la nota cruda va al bloque 12. Se descarta **por estar inutilizable, nunca por su
  contenido**. ⚠️ Si se rescata una queja de memoria, **recortar la frase 5 del screening** (§4.1) —
  si no, el informe se contradice.

---

## 4. Partes 8–11 del Word — narrativa clínica

### 4.1 Sección de screening (parte 8 del Word)

Esqueleto casi fijo entre informes. **Lo único que se mueve son los puntajes intercalados** — el
resto son frases invariantes que van tal cual.

> ⚠️ **Fallo observado (revisión 2026-09-08):** una versión anterior de este archivo decía "frases invariantes: discurso, nivel de alerta,
> orientación, autonomía" sin transcribirlas, y la IA emitió **sólo la frase de puntajes**, tirando
> las otras tres. Enumerar qué partes son variables se lee como especificación completa. Por eso
> ahora el esqueleto va **literal**.

#### El esqueleto, frase por frase

En este orden, como **un solo párrafo corrido** (no viñetas):

| # | Frase | Tipo |
|---|---|---|
| 1 | `Discurso fluido y organizado, con conservada capacidad de comprensión y expresión.` | FIJA |
| 2 | `Nivel de alerta conservado a lo largo de toda la consulta, sin presencia de fatiga que pudo haber interferido negativamente.` | FIJA |
| 3 | `Orientación temporal y espacial conservadas.` | CONDICIONAL — ver abajo |
| 4 | `Rendimiento cognitivo general inicial (evaluado a partir de pruebas de screening) con puntajes conservados (MMSE=<C15>; TRO= <C18>; INECO=<C26>) para su edad y nivel educativo.` | VARIABLE |
| 5 | `El paciente / La paciente no reporta sintomatología vinculada al malestar psicológico ni quejas subjetivas de memoria significativas.` | CONDICIONAL — ver abajo |
| 6 | `Según autoreporte sobre funcionalidad e independencia, la autonomía en las actividades básicas de la vida diaria está conservada.` | CONDICIONAL — ver abajo |

Las frases 1 y 2 son observación conductual en vivo: van **siempre**, en su forma afirmativa, salvo
que el profesional anote lo contrario. No se derivan de ninguna celda y no se marcan como pendientes.

Sólo la frase 4 lleva puntajes: `MMSE` de `C15`, `TRO` de `C18`, `INECO` de `C26` (**el Word lo llama
INECO; el Excel y la tabla de síntesis lo llaman IFS Total**). Reproducir el espacio de más de
`TRO= ` (después del `=`) tal como está en la plantilla. 🚩 **Una prueba no tomada sale del
paréntesis** (sin MMSE: `(TRO= 10/10; INECO=27/30)`); si no se tomó ninguna de las tres, la frase 4
entera se omite.

- **Frase 3** — sale de `C16`/`C17`. Si alguna orientación **no** está conservada, se invierte para
  esa orientación. Si el dato falta, va la forma afirmativa y **el pendiente se lista en el bloque
  12**, no dentro de la oración.
- **Frase 5** — la mitad de malestar psicológico sale de `C20`/`D20` (si el K-10 no se tomó, se
  deriva de la anamnesis igual que las quejas); la de quejas subjetivas, de `B70` (C-QSM) si tiene
  puntaje (corte `> 3`) o de la anamnesis si la celda está vacía. Si el paciente sí refiere quejas, la
  negación se recorta a `…no reporta sintomatología vinculada al malestar psicológico.` **Nunca poner
  el puntaje entre paréntesis acá** — el K-10 ya está en la tabla de síntesis.
- **Frase 6** — sale de `C19`/`D19`. Si las AVD están comprometidas, se redacta en consecuencia.

> ❌ `No se observan elementos que sugieran malestar psicológico significativo (KPDS-10=<C20>,
> interpretación: <D20>). Autónomo en las actividades de la vida diaria (AVD=<C19>).`
> ✅ Las frases 5 y 6 de la tabla, tal cual, sin puntajes intercalados.

✅ **Aclarado (2026-09-07):**
- **Orientación temporal y espacial:** es el subpuntaje de orientación del MMSE, cargado en el Excel
  como `C16`/`C17` (`Si`/`No`/`Medio`). `Medio` no se colapsa a `Si`: la frase 3 se redacta en
  consecuencia o se señala en el bloque 12.
- **Quejas subjetivas de memoria (C-QSM):** el C-QSM **a veces se toma y a veces no**. Si se tomó
  (`B70` con puntaje), la presencia de quejas la determina un **corte > 3 puntos**; si no, la
  observación **deriva de la anamnesis / motivo de consulta**.

### 4.2 Secciones por área (parte 9 del Word)

Cuatro secciones, siempre en este orden y con esta forma de tres partes:

1. Título en mayúsculas: `ATENCIÓN, VELOCIDAD DE PROCESAMIENTO Y FUNCIONES EJECUTIVAS` ·
   `MEMORIA EPISÓDICA` · `LENGUAJE` · `VISOCONSTRUCCIÓN`.
2. Una línea: `Impresión diagnóstica del área: rendimiento cognitivo <calificación>`.
   ⚠️ **En los dos informes dice `del área` en las dos primeras secciones y `por área` en las dos
   últimas.** Es una inconsistencia de la plantilla: **reproducirla tal cual**, no "corregirla".
   Calificaciones observadas: `conservado`, `conservado-alto`.
3. Un párrafo que recorre las pruebas del área traduciendo cada Z a vocabulario clínico.

Léxico Z → palabra ✅ **confirmado por la profesional (2026-09-07)** — cortes exactos:

| Palabra | Z |
|---|---|
| `alto` | > 1 |
| `conservado` / `normal` (**son lo mismo**) | −1,49 a 1 |
| `bajo` (no deficitario) | −1,99 a −1,5 |
| `deficitario` | ≤ −2 |

Nótese que el corte `conservado`/`bajo` cae en **−1,5**, el mismo umbral que separa "normal" de
"DCL" en la regla diagnóstica.

#### 🚫 Dos prohibiciones duras en la prosa: **ni siglas, ni valores Z**

El Z ya está en la tabla de síntesis y en el gráfico. El párrafo lo **traduce**; no lo repite.
Ningún informe real trae una sigla ni un número Z dentro de un párrafo clínico.

*(Ejemplo con los datos ficticios de `ejemplo-informe.md`, no de un paciente real.)*

> ❌ `Presentó un span atencional conservado (DD=0,52) y adecuada memoria de trabajo (DI=-0,41). El
> rastreo visual y velocidad de procesamiento se mantuvieron conservados (TMT A=-0,20)…`
>
> ✅ `Puntaje normal en span atencional, logrando retener 8 dígitos de manera directa. En
> retrogresión, logra retener 4 dígitos, evidenciando un rendimiento conservado en memoria de
> trabajo. Habilidad de rastreo visual y velocidad de procesamiento conservadas-altas.`

Lo único numérico admitido es el **PB expresado en palabras** cuando la prueba lo permite naturalmente
(`logrando retener 8 dígitos de manera directa`). Nunca `PB=8`, nunca `Z=0,52`, nunca `(DD=…)`.

⚠️ **Fallo observado (revisión 2026-09-08):** la prohibición de siglas ya estaba escrita acá y la
IA igual las usó; la de valores Z no estaba en ningún lado. Van juntas y con el par contrastado de
arriba — la regla suelta no alcanzó.

#### Sigla → función, para nombrarla en prosa

| Sigla | Cómo se nombra en el párrafo |
|---|---|
| DD | `span atencional` (`logrando retener N dígitos de manera directa`) |
| DI | `retrogresión` / `memoria de trabajo` (`logra retener N dígitos`) |
| TMT A | `habilidad de rastreo visual y velocidad de procesamiento` |
| TMT B | `flexibilidad cognitiva` |
| FF | `fluencia fonológica` |
| FS | `fluencia semántica` |
| TBA | `denominación` / `capacidad de denominación de imágenes` |
| IFS Total | `la prueba ejecutiva` / `screening ejecutivo` |
| IFS SM…CIV | **no se narran** — ver abajo |
| MMSE copia + TRO | `copiar una figura simple (MMSE) y dibujar un reloj de memoria (TRO)` |

#### 🚫 Lo que **no** se narra nunca

Aparece en la tabla y en el gráfico, pero **no** en ningún párrafo, ni en el recap, ni en la frase de
cierre. Verificado en los dos informes reales:

- **`BEM–MS CE`.** Es una submedida derivada (`(Sem+Rec)/2`) y funciona como valor de chequeo, no
  como ítem narrativo. Ya se sabía que no dispara la categoría diagnóstica
  (`regla-diagnostica.md`); acá se agrega que **tampoco se menciona**.
- **Los 8 subpuntajes del IFS** (`SM`, `IC`, `CIM`, `DA`, `MA`, `MTV`, `R`, `CIV`) y el `Índice MT`.
  El párrafo de atención los resume en una sola frase: `Puntaje conservado en la prueba ejecutiva.`
- **Los ensayos sueltos `AS1`/`AS2`/`AS3`.** Se narran como *forma de la curva*
  (`curva de aprendizaje ascendente y productiva`), no como tres números.

⚠️ **Fallo observado:** la IA nombró `CE` en el párrafo de memoria, en el recap y en el cierre,
y enumeró los 8 subtests del IFS por sigla.

#### BEM (memoria episódica) → lenguaje de proceso

El párrafo de memoria **no** es una lista de pruebas: describe el proceso mnésico. Cada sigla tiene
una traducción fija y **no es la expansión literal de su nombre**:

| Sigla | Qué mide realmente | Cómo se dice |
|---|---|---|
| AS1/AS2/AS3 | los 3 ensayos de aprendizaje | `curva de aprendizaje ascendente y productiva en el recuerdo de un listado de 12 palabras sin relación lógica entre sí`; `beneficio en la repetición de información a recordar no contextualizada` |
| AST | codificación / aprendizaje | `capacidad de aprendizaje y codificación de material episódico verbal seriado` |
| RSE | evocación diferida libre | `recuperación diferida libre` |
| **Sem** | **cuánto mejora el recuerdo al dar claves semánticas** | `alto` / `bajo beneficio de la facilitación de claves semánticas` |
| Rec | reconocimiento con opción múltiple | `mejorando cuando se le dan de opción múltiple` → `capacidad de reconocimiento / almacenamiento conservada` |
| CE | — | **no se narra** |
| ML Inm | recuerdo inmediato de material contextualizado | `recuperación inmediata (de la prueba de memoria lógica)` |
| ML Dif | recuerdo diferido de material contextualizado | `recuperación diferida (de la prueba de memoria lógica)` |

> 🚩 **`BEM–MS Sem` no mide "memoria semántica".** Mide el **beneficio de la facilitación por claves
> semánticas**. Un Sem bajo se redacta como `bajo beneficio de la facilitación de claves semánticas`,
> **nunca** como `falla en memoria semántica` ni como ninguna otra etiqueta de déficit de una función.
>
> ⚠️ **Fallo observado, el más serio de toda la salida:** la IA escribió *"fallas aisladas en
> submedidas derivadas: memoria semántica (BEM–MS Sem ≤-3)"* — convirtió una medida de facilitación en
> un déficit nombrado, dentro de un documento clínico. El informe real dice *"con bajo beneficio de la
> facilitación de claves semánticas y mejorando cuando se le dan de opción múltiple; dejando en
> evidencia una capacidad de reconocimiento conservada."*

#### Frases fijas dentro de las secciones por área

Igual que en screening (§4.1), cada sección tiene arranques y cierres invariantes:

| Área | Frase | Posición |
|---|---|---|
| Atención | `Nivel de alerta conservado a lo largo de toda la consulta.` | **abre** el párrafo |
| Atención | `Puntaje conservado en la prueba ejecutiva.` (IFS) | dentro |
| Lenguaje | `Capacidad de comprensión y expresión conservadas.` (de `C51`/`C52`) | **abre** el párrafo |
| Lenguaje | `La entonación y articulación del lenguaje impresionaron conservadas a lo largo de toda la entrevista.` | segunda |
| Visoconstrucción | `La capacidad de visoconstrucción se encuentra conservada: el/la paciente logra copiar una figura simple (MMSE) y dibujar un reloj de memoria (TRO) adecuadamente.` | párrafo entero |

Si algo de eso **no** está conservado, la frase se invierte; no se omite.

### 4.3 Conclusiones y sugerencias (partes 10–11 del Word)

- Párrafo de recap: enumera área por área con conectores (`A su vez` · `En adición` · `También` ·
  `Por último`). **Orden corregido — ver el recuadro de abajo.**
- Frase de cierre: **una sola oración**, que arranca con `En conclusión,`. Parte del template de
  `regla-diagnostica.md` **pero adaptada**: `informeFinal2` cerró con
  `En conclusión, el Sr. X presentó un rendimiento cognitivo normal con leves fallas aisladas en
  recuperación de la memoria.`, donde el template de la categoría 2 dice
  `fallas atencionales/ejecutivas aisladas` — porque en ese paciente las fallas eran mnésicas.
  Nombra la función afectada **en palabras clínicas**, sin siglas ni índices (`recuperación de la
  memoria`, no `memoria semántica y el índice compuesto CE`).

> ⚠️ **Corrección al orden del recap (revisión 2026-09-08).** Este archivo decía "orden inverso
> al de la tabla", lo que pone memoria en tercer lugar. **Los dos informes reales cierran con
> memoria.** El orden observado es:
>
> | # | Área | Conector típico |
> |---|---|---|
> | 1 | Visoconstrucción (+ orientación) | — (abre) |
> | 2 | Lenguaje | `A su vez` |
> | 3 | Atención, velocidad de procesamiento y funciones ejecutivas | `En adición` / `También` |
> | 4 | Memoria episódica — **seriada primero, lógica después** | `Por último` |
>
> Es inverso al de la tabla en las tres primeras áreas y **excepción en la última**: memoria va al
> final, no tercera.
>
> **Fuerza de la evidencia, para no repetir el error de esta regla** (la versión anterior se enunció
> con más confianza de la que aguantaba):
>
> - `visoconstrucción primero` y `memoria última` → **n=2**, los dos informes. Observación fuerte.
> - `seriada antes que lógica` dentro de memoria → **n=1**, sólo `informeFinal2`. En `informeFinal` la
>   memoria lógica va junta con atención en tercer lugar y el screening ejecutivo queda entre esa
>   posición y la memoria seriada. Es una preferencia razonable, no una regla observada.
> - Los conectores exactos (`A su vez` · `En adición` · `También` · `Por último`) varían entre los dos
>   informes: se usan los del conjunto, no en un orden fijo.
- Viñetas de sugerencias: las del template, **con un paréntesis específico del paciente agregado a la
  viñeta de hábitos**:
  - `informeFinal2`: `Promover hábitos de vida saludables (estrategias de compensación, no multitarea)`
  - `informeFinal`: `Promover hábitos de vida saludables (mejorar calidad del sueño y técnicas de relajación)`

→ **Corrección respecto de la versión anterior del plan**, que decía que las sugerencias se devuelven
"tal cual, sin redactar nada propio": la evidencia de los dos informes es **template + localización
específica del paciente**. Ver `regla-diagnostica.md`.

---

## 5. Casos del Excel a tener en cuenta

Ordenados por impacto. Los chequeos operativos están en `SKILL.md` («Chequeos de entrada»); acá va el
porqué.

#### 5.a `C-QSM`: celda de puntaje + ítem del listado

`A70` es el rótulo y `B70` el puntaje (número entero suelto). Si la celda está **vacía**, la
observación de quejas subjetivas se deriva de la anamnesis. La línea del C-QSM en `PRUEBAS
ADMINISTRADAS` la decide el listado (`B84`), no esta celda.

#### 5.b Los PB derivados salen por fórmula

`C41` (AST) = `=TRUNCAR(V42;2)` y `C45` (CE) = `=TRUNCAR(U47;2)`. Si alguno llega tipeado a mano,
compararlo con su fórmula; si no coinciden, señalarlo en el bloque 12 — **sin recalcular el Z**, que
ya viene del Excel.

#### 5.c El total del K-10 sale por fórmula

`C20` = `=B68` (`=SUMA(B58:B67)`). Si un archivo trae `C20` tipeado y distinto de `B68`,
**señalarlo y no elegir por cuenta propia** — ver el recuadro de §1, donde está el caso real en que
ese desfasaje cambiaba la categoría diagnóstica.

#### 5.d `B8` es `Si`/`No`

`No` / vacío ⇒ `asiste solo/a`; `Si` ⇒ `asiste acompañado/a`. El Excel no dice por quién: si la
anamnesis lo menciona se usa; si no, va la ranura `[acompañado por …]` y se anota en el bloque 12.
(Una regla del tipo `acompañado/a por <B8>` escribiría `acompañado por Si`.)

#### 5.e Validaciones de lista

V6 valida `B6` (lateralidad), `B8`, `B12` y `B73:B86` (`Si,No`), `C16:C17` (`Si,No,Medio`), `B9`
(protocolo), `B10` (evaluador), `C36` (`Sí,No,Parcial`) y `C37` (`Normal,Cuestionable,Inadecuada`).
Igual la skill **normaliza tolerantemente** (mayúsculas/minúsculas, con y sin tilde, espacios) y, si
un valor no es interpretable, lo **señala** en vez de asumir `No`.

ℹ️ `C16`/`C17` admiten un tercer valor, **`Medio`**: no es sí ni no. Tratarlo como "no conservada del
todo" y redactar la frase 3 en consecuencia, o señalarlo si el caso no es claro — nunca colapsarlo a
`Si`.

ℹ️ En `C36` el valor `No` es un **resultado** (no hubo recuperación disejecutiva), no "no se tomó":
la fila va a la tabla con `No`. Sólo una celda **vacía** saca la fila.

#### 5.f Las dos filas de TRO pueden tener valores distintos

`C18` (screening) y `C53` (visoconstrucción) ya llegaron distintas en un archivo (`10/10` y
`9.5/10`), mientras que en los informes reales las dos apariciones llevan **el mismo** valor. Puede
ser una distinción real o una celda que quedó vieja. **La skill copia cada celda en su fila y no las
reconcilia**; lo anota en el bloque 12 para que la profesional confirme.

#### 5.g Separador decimal mixto en los textos `X/Y`

Conviven valores con coma y con punto (`27/30`, `9.5/10`). **No afecta el procesamiento**: son
cadenas que se copian tal cual al Word.

---

## 6. Datos sensibles

Los Excel de entrada y los informes reales son de **pacientes reales**. Eso es inevitable en el
**Excel de entrada** (se adjunta por paciente), pero no en el **paquete de la skill**, que queda
publicado de forma persistente. Por eso todos los ejemplos de este paquete usan datos ficticios o
anónimos, y el modelo de tono es `ejemplo-informe.md`. **No agregar al paquete datos de un paciente
real** (nombre, fechas, citas textuales) sin anonimizarlos antes.
