# Mapeo Excel → Word — de dónde sale cada bloque del informe

> Direcciones de celda **actualizadas a `excelEvaluacionCompletoV5.xlsx`** (2026-09-16). La lógica del
> Word está reconstruida comparando el Excel V1 con **`informeFinal2.docx`**, que es el
> informe generado a partir de ese mismo Excel (par entrada/salida real, mismo paciente). Verificado
> además contra `informeFinal.docx` (otro paciente): **la plantilla de Word es estructuralmente
> idéntica en los dos informes**, así que lo de acá es la plantilla, no una particularidad.

Cada bloque está clasificado por **tipo de trabajo**, que es lo que decide qué puede automatizarse:

| Tipo | Significado |
|---|---|
| **FIJO** | Boilerplate idéntico en todos los informes. Ya está en la plantilla, nadie lo toca. |
| **PASS** | Transcripción determinística de una celda del Excel. Cero criterio. |
| **DERIV** | Cálculo determinístico a partir del Excel (redondeo, cap, elección de columna de rango). |
| **LLM** | Redacción. Borrador para revisión obligatoria del profesional. |
| **FUERA** | No está en el Excel. Hay que traerlo de otra parte (papel / historia clínica / criterio). |

---

## 1. Esquema real de `excelEvaluacionCompletoV5.xlsx`

> 📌 **Direcciones válidas para `excelEvaluacionCompletoV5.xlsx`** (recibido 2026-09-16), hoja
> `TABLA DE FORMULAS`. **Este bloque es la única fuente de direcciones del paquete**: el resto de los
> archivos las repite, no las define. Si llega una versión nueva del Excel, actualizar acá primero y
> propagar.
>
> 🚩 **V5 movió filas y columnas: todas las direcciones del cuadro de pruebas cambiaron respecto de
> V3/V4.** Lo que se movió y por qué está abajo. Las versiones V1/V2 tenían además otro layout
> (cuadro con Z en `C8:H22`, demográficos en `C46:C51`): **cualquier referencia con esas formas que
> sobreviva en el paquete está desactualizada.**

Una sola hoja aporta datos del paciente: **`TABLA DE FORMULAS`**. Las otras seis (`Stroop`, `MMSE`,
`Puntajes Equivalentes`, `PRUEBAS`, `FLUENCIAS`, `BACK UP`) son tablas de normas/apoyo y **no se
leen** — son el backend de los `VLOOKUP`.

### 🚩 Qué cambió en V5 (y qué implica para leer el archivo por código)

| Cambio | V3/V4 | V5 |
|---|---|---|
| **8 columnas de rango con la X por fórmula** | no existían | `E:L`, con encabezado agrupado en la fila 11 |
| **AS1/AS2/AS3 son filas del cuadro** | vivían sueltos en `P35:P37` | filas `34`–`36` (`C34`/`C35`/`C36`) |
| **Corrimiento de filas** | AST en la 34, TBA en la 43 | **+3**: AST en la `37`, TBA en la `46` |
| **Corrimiento de columnas auxiliares** | `L29:M43`, `O34:Q40` | **+1 columna**: `Q31:R46`, `T37:V43` |
| **K-10 y lo de abajo** | ítems `B50:B59`, total `B60` | ítems `B53:B62`, total `B63` |
| **Celdas combinadas** | ninguna | sí — ver abajo |
| **Validaciones de datos** | sólo `B5`/`B10` | `B5`, `B6`, `B10`, `C14:C15` |

⚠️ **La hoja ahora SÍ tiene celdas combinadas** (las versiones anteriores de este archivo decían lo
contrario). Importa para la lectura por código: **en un rango combinado el valor vive en la celda de
arriba a la izquierda y las demás se leen vacías.**

| Rango combinado | Qué es |
|---|---|
| `A13:A18` · `A19:A33` · `A34:A43` · `A44:A48` · `A49:A50` | rótulos de las 5 áreas (una celda por grupo) |
| `E11:F11` · `H11:I11` · `J11:L11` | encabezado agrupado de los tramos de rango |
| `A67:G92` (una por fila) | cada viñeta de la anamnesis ocupa el ancho de la hoja |
| `T37:U37` · `V38:V40` · `E9:L9` · `P29:W29` | rótulos y notas internas del área auxiliar |

En la práctica no molesta: el área se lee de `A13`/`A19`/`A34`/`A44`/`A49` (y la skill no la necesita,
porque los nombres de área son fijos en la plantilla) y la anamnesis se lee de la columna `A`.

### 🚩 Las tres formas de leer el cuadro — **no son iguales**

V5 automatizó dos cosas en el Excel, y cada una se comporta distinto al leer el archivo por código:

| Rango | Qué tiene | Qué devuelve una lectura por código |
|---|---|---|
| `E:L` (los 8 tramos) | fórmula que pone la `X` en el tramo del Z | **el resultado cacheado: `"X"` o `""`.** Se lee directo — la skill **transcribe** la X en vez de decidir el tramo. |
| `D19:D46` (el Z) | número + **formato** `[<=-3]"≤-3";[>=3]"≥3";0.00` | **el Z crudo** (`-3.1067…`). El cap es sólo *display*: **nunca** se lee `"≤-3"`. |
| todo lo demás | valores y fórmulas normales | pass-through como siempre |

➡️ **Consecuencia operativa:** el **cap de ±3 sigue siendo trabajo de la skill**, tanto para la
columna Z de la tabla como para el gráfico 1. Lo que la skill deja de hacer es **elegir la columna de
rango**: eso ya viene resuelto en `E:L`.

### Bloque demográfico (`A1:B10`) — es también el bloque de parámetros

V3 unificó los dos bloques demográficos que V1 tenía duplicados (`C4`/`C5` para las fórmulas y
`C46:C51` para el Word). **Ahora hay uno solo y es el mismo que manejan los `VLOOKUP`**, así que ya
no puede desincronizarse.

| Celda | Campo | Rol |
|---|---|---|
| `B2` | Nombre del paciente (apellido, nombre) | → tabla de datos personales |
| `B3` | Edad (número) | **Driver de todos los `VLOOKUP` a `PRUEBAS`/`FLUENCIAS`** + tabla de datos personales |
| `B4` | Fecha de nacimiento (**serial de fecha**) | → tabla |
| `B5` | Nivel educativo alcanzado | **Driver del `MATCH` de `FLUENCIAS`** + tabla |
| `B6` | Lateralidad | → tabla |
| `B7` | Fecha de evaluación (**serial de fecha**) | → tabla |
| `B8` | `Asiste acompañado con` | → primera frase de la anamnesis (`asiste solo/acompañado por …`) |
| `B9` | `Derivado por` | → fila `Deriva:` de la tabla de datos personales (ver §2.1) |
| `B10` | `Riesgo de evolución` (`Sí`/`No`) | → habilita la categoría 5 de `regla-diagnostica.md` |

`B3` es **número**, no texto: en el Word va como `<B3> años`. `B4` y `B7` son seriales de fecha.

### Cuadro de pruebas (`A11:L50`) — `A`=Área `B`=Prueba `C`=PB `D`=Z `E:L`=los 8 tramos

Dos filas de encabezado:

- **Fila 11** — agrupación de tramos, con celdas combinadas: `E11:F11` `Deterioro significativo` ·
  `G11` `Puntajes bajos` · `H11:I11` `Puntajes promedio` · `J11:L11` `Puntajes superiores`.
- **Fila 12** — `A12`=`Área`, `B12`=`Prueba`, `C12`=`PB`, `D12`=`Z`, y los 8 tramos en `E12:L12`:
  `< - 3` · `- 3 a -2` · `-2 a -1` · `-1 a 0` · `0 a +1` · `+1 a +2` · `+2 a +3` · `> +3`.

**`C` la carga la persona; `D` es fórmula sólo en las filas con Z** — en las demás es texto de
interpretación o está vacía. Rótulos de área (celdas **combinadas**): `A13:A18` Screening cognitivo y
psiquiátrico · `A19:A33` Atención y funciones ejecutivas · `A34:A43` Memoria episódica · `A44:A48`
Lenguaje · `A49:A50` Visoconstrucción.

> 🚩 **Las filas del Excel y las del informe no son las mismas, y los merges tampoco.** El cuadro va
> de la fila 13 a la 50 = **38 filas**, porque incluye las dos de orientación. La tabla del informe
> tiene **36**. Por eso el merge de Screening abarca 6 filas acá (`A13:A18`) y `rowspan=4` en el
> informe. **No unificar los dos sistemas de numeración**: cuando este paquete dice "fila 5" a secas
> se refiere a la del informe (ver `orden-filas-sintesis.md`), y con `C19` a la del Excel.

| Fila | Prueba | PB | Z | Nota |
|---|---|---|---|---|
| 13 | MMSE | `C13` | — | texto `29/30` |
| 14 | Orientación temporal | `C14` | — | `Si`/`No` — **no es fila de la tabla de síntesis**, ver §2.2 |
| 15 | Orientación espacial | `C15` | — | ídem |
| 16 | TRO | `C16` | — | texto `10/10` |
| 17 | AVD | `C17` | `D17` | `D17` = interpretación (`Autónomo`), **no** un número |
| 18 | KPDS-10 | `C18` | `D18` | `C18` = `=B63`; `D18` = fórmula de interpretación (`Normal`) |
| 19 | DD | `C19` | `D19` | `=(C19-Q32)/R32` |
| 20 | DI | `C20` | `D20` | `=(C20-Q33)/R33` |
| 21 | TMT A | `C21` | `D21` | signo invertido: `*-1` |
| 22 | TMT B | `C22` | `D22` | ídem |
| 23 | FF | `C23` | `D23` | |
| 24 | IFS Total | `C24` | — | texto `27/30` |
| 25 | IFS Índice MT | `C25` | — | texto `7/10` (era la celda que se corrompía en V1) |
| 26–33 | IFS SM, IC, CIM, DA, MA, MTV, R, CIV | `C26`…`C33` | — | texto `3 normal` |
| **34** | **BEM – MS AS1** | `C34` | — | 🆕 **fila propia en V5** (antes `P35`) |
| **35** | **BEM – MS AS2** | `C35` | — | 🆕 antes `P36` |
| **36** | **BEM – MS AS3** | `C36` | — | 🆕 antes `P37` |
| 37 | BEM – MS AST | `C37` | `D37` | `C37` = `=TRUNCAR(V38;2)` |
| 38 | BEM – MS RSE | `C38` | `D38` | |
| 39 | BEM – MS Sem | `C39` | `D39` | |
| 40 | BEM – MS Rec | `C40` | `D40` | |
| 41 | BEM – MS CE | `C41` | `D41` | `C41` = `=TRUNCAR(U43;2)` |
| 42 | BEM – ML Inm | `C42` | `D42` | |
| 43 | BEM – ML Dif | `C43` | `D43` | |
| 44 | FF *(2ª aparición)* | `C44` | `D44` | mismo valor que la fila 23 |
| 45 | FS | `C45` | `D45` | |
| 46 | TBA | `C46` | `D46` | |
| 47 | Comprensión | `C47` | — | texto `Normal` |
| 48 | Expresión | `C48` | — | texto `Normal` |
| 49 | TRO *(2ª aparición)* | `C49` | — | texto |
| 50 | MMSE copia | `C50` | — | texto `Normal` |

⚠️ **Las filas 14 y 15 (orientación) NO son filas de la tabla de síntesis.** La tabla del Word sigue
teniendo **36 filas** y no incluye orientación (verificado en el XML de los dos informes). Alimentan
la **frase 3 del screening** (§4.1). Ver §2.2.

### Las 8 columnas de rango (`E:L`) — la X ya viene calculada

Nuevas en V5. **Sólo tienen fórmula las 15 filas con Z** (`19`–`23` y `37`–`46`); en las otras 23 las
celdas están vacías, con el gris de "no aplica" puesto como formato.

Cada columna es un tramo, con **límite inferior inclusive y superior exclusivo**:

```excel
E19  =SI(ESNUMERO($D19);SI($D19<-3;"X";"");"")
F19  =SI(ESNUMERO($D19);SI(Y($D19>=-3;$D19<-2);"X";"");"")   … y así hasta …
L19  =SI(ESNUMERO($D19);SI($D19>=3;"X";"");"")
```

Los 8 tramos son **mutuamente excluyentes y exhaustivos**: ningún Z puede quedar sin X ni con dos.
El `ESNUMERO` implementa *"la X se pone si y sólo si Z es numérico"*.

➡️ **La skill lee la X de acá en vez de derivar el tramo.** Los autochequeos del bloque 3 de
`SKILL.md` siguen valiendo, pero pasan de *verificar mi propio cálculo* a **cruzar contra el Excel**,
que es más fuerte.

### Bloques auxiliares (columnas `P` a `W`) — backend, no van al Word

| Rango | Contenido |
|---|---|
| `Q31`/`R31` | rótulos `Media` / `Desvio` |
| `Q32:R46` | media y desvío de las 15 pruebas con Z, por `VLOOKUP` a `PRUEBAS`/`FLUENCIAS` según `B3` y `B5` |
| `T37` | rótulo `MS - Signoret` |
| `T38:T40` / `U38:U40` | rótulos `AS1`/`AS2`/`AS3` y sus valores (`=C34`, `=C35`, `=C36`) |
| `V38` | `=(U38+U39+U40)/3` → promedio de los 3 ensayos, **insumo** del PB de AST (`C37`) |
| `T43` / `U43` | rótulo `BEM – MS CE` y `=(C39+C40)/2`, **insumo** del PB de CE (`C41`) |
| `E9`, `P29`, `C63` | notas internas (`No completar`) — no son datos |

> ⚠️ **`Q32:R46` es un bloque contiguo de 15 filas que NO está alineado con la fila de su prueba.**
> Las 5 primeras (`Q32:R36`) son las normas de DD, DI, TMT A, TMT B y FF, que viven en las filas
> `19`–`23`; de `Q37` en adelante sí coinciden con su fila. Es backend de los `VLOOKUP`: **la skill no
> lo lee**, pero conviene no "corregir" la alineación, porque las fórmulas de `D` apuntan ahí.

✅ **Dos PB salen por fórmula:** `C37` (AST) = `=TRUNCAR(V38;2)` y `C41` (CE) = `=TRUNCAR(U43;2)`. El
truncado (no redondeo) **mueve el Z** en AST: un PB de `7,66` da Z `-0,90` y `7,67` daría `-0,89`. En
CE el truncado es inocuo — `(Sem+Rec)/2` sobre enteros nunca pasa de un decimal — pero elimina la
doble carga. Ver `excel-unificado-spec.md` §A.6. **La skill usa el PB tal como viene y no lo
recalcula.**

### Bloque K-10 desglosado (`A52:B63`)

`A52`/`B52` son los rótulos (`Sintomatología` / `Puntaje`). `A53:A62` son los 10 ítems y `B53:B62`
sus puntajes, **en el orden del cuestionario en papel y del gráfico** (`orden-categorias-graficos.md`
§Gráfico 2). `B63` es `=SUMA(B53:B62)` — el total.

→ **El gráfico K-10 se genera desde el Excel.** Era un faltante bloqueante hasta V2.

✅ `C18` (el PB del K-10 de la tabla de síntesis) es `=B63`, así que el total de la tabla, el del
gráfico y el que dispara el corte ≥ 25 salen del mismo lugar. En archivos anteriores estaba tipeado:
si `C18` ≠ `B63`, **señalarlo en el bloque 11 y no elegir por cuenta propia** — puede ser un override
deliberado del corte anímico. Ver `excel-unificado-spec.md` §A.8.

> ⚠️ **Este desfasaje ya ocurrió de verdad.** En una versión intermedia de V5 `C18` había quedado
> tipeado en `30` mientras los 10 ítems sumaban `24`: la tabla decía `Malestar severo` y correspondía
> `Normal` — o sea, cruzaba el corte ≥ 25 y cambiaba la categoría diagnóstica. Se detectó leyendo el
> archivo por código. **Es el chequeo más barato con mayor impacto clínico de todo el paquete.**

### C-QSM (`A65` / `B65`)

`A65` es el rótulo y **`B65` el puntaje** (número entero suelto, vacío si no se tomó). Ver
`excel-unificado-spec.md` §A.4: corte `> 3` ⇒ quejas presentes; celda vacía ⇒ la observación deriva
de la anamnesis **y hay que avisar que la línea del C-QSM se borra de `PRUEBAS ADMINISTRADAS`**.

### Bloque de anamnesis (`A67:A76`)

`A67` es el rótulo `Motivo de consulta y antecedentes`; `A68`–`A76` son las notas crudas de la
entrevista, una viñeta por celda, en telegrama y con comillas textuales del paciente. Cada fila está
**combinada `A:G`**, así que el texto se lee de la columna `A`. Las filas siguientes (hasta `A92`)
están combinadas pero vacías: es espacio reservado, no datos. **Desde V3 las viñetas ya no llevan el
guion inicial** que tenían en V1 (`- PROTOCOLO XTEND` → `PROTOCOLO XTEND`); es sólo cosmético.

---

## 2. Estructura del Word y de dónde viene cada parte

En orden de aparición en `informeFinal2.docx`. ⚠️ **Esta numeración es el orden del documento Word y
no coincide con la de los bloques de salida de `SKILL.md`**, que agrupa distinto (11 bloques de
output, no 12 partes del documento). Cuando importe, referirse a los bloques por nombre.

| # | Bloque del Word | Tipo | Origen |
|---|---|---|---|
| 1 | Título `EVALUACIÓN NEUROCOGNITIVA` | FIJO | plantilla |
| 2 | `DATOS PERSONALES` + tabla de 6–7 filas | PASS | `B2:B7` (+ `B9` si hay derivante) |
| 3 | `MOTIVO DE CONSULTA Y ANTECEDENTES` (7–9 párrafos) | **LLM** | `A68:A76` + `B8` — ver §3 |
| 4 | `PRUEBAS ADMINISTRADAS` (lista de 11–12 ítems) | FIJO/FUERA | plantilla; depende de la batería tomada |
| 5 | Tabla `SÍNTESIS DEL RENDIMIENTO` (36 filas) | PASS + DERIV | ver `orden-filas-sintesis.md` |
| 6 | Gráfico de líneas (14 valores Z) | DERIV | ver `orden-categorias-graficos.md` |
| 7 | Gráfico `Escala K-10` (10 valores) | DERIV | `B53:B62` — ✅ sale del Excel |
| 8 | `SCREENING COGNITIVO, PSIQUIÁTRICO, FUNCIONALIDAD Y OBSERVACIONES CONDUCTUALES` | **LLM** | `C13`, `C16`, `C24`, `C17`/`D17`, `C18`/`D18`, `C14`/`C15` + observación en vivo |
| 9 | 4 secciones por área cognitiva | **LLM** | columna `D` del cuadro de pruebas — ver §4.2 |
| 10 | `CONCLUSIONES Y SUGERENCIAS` — párrafo de recap + frase de cierre | **LLM** | todas las Z + `regla-diagnostica.md` |
| 11 | `Se sugiere:` (4–6 viñetas) | template + LLM | `regla-diagnostica.md` — ver §4.3 |
| 12 | `Quedo a disposición…` + firma (`María Agustina Aceiro`, `Doctora en Psicología`, `M.N:67158`) | FIJO | plantilla |

### 2.1 Tabla de datos personales (bloque 2)

Pass-through directo, con tres detalles:

- `B4` y `B7` son **seriales de fecha** de Excel. En el Word van como **`dd/mm/aaaa`** — ejemplo
  ficticio: `25642` → `15/03/1970`; `46162` → `20/05/2026`. Al leer el `.xlsx` por código hay que
  convertir, no imprimir el número.
- El **juego de campos varía**: `informeFinal.docx` tiene una 7ª fila `Deriva:` que
  `informeFinal2.docx` no tiene. ✅ **V3 da el dato en `B9` (`Derivado por`)**, que antes había que
  buscar fuera del Excel. **`B9` llena la fila, no decide si existe:** `informeFinal.docx` la trae
  con un guion (`Deriva: -`) aunque no haya derivante, e `informeFinal2.docx` no la trae. En V4 `B9`
  trae por primera vez un derivante real, así que la fila sale con ese nombre en vez del guion. Regla:
  **respetar la plantilla que traiga el profesional** y, si la fila está, volcar `B9` tal cual
  (incluido el `-`). Si la plantilla no la tiene pero `B9` nombra a un derivante, señalarlo en el
  bloque 11 en vez de agregar la fila por cuenta propia.
- **No hay DNI ni ocupación** en la tabla del Word de ninguno de los dos informes. La lista de campos
  reales es exactamente la de `B2:B7`, más `Deriva` (`B9`) opcional.
- `B10` (`Riesgo de evolución`) y `B8` (`Asiste acompañado con`) **no** van a esta tabla: el
  primero alimenta la categoría diagnóstica, el segundo la primera frase de la anamnesis.

### 2.2 Las filas 14–15 del Excel no son filas del informe

`Orientación temporal` (`C14`) y `Orientación espacial` (`C15`) viven dentro del cuadro de pruebas,
entre MMSE y TRO. **No son filas de la tabla de síntesis**: esa tabla tiene 36 filas en los dos
informes reales y ninguna de las dos aparece. Son insumo exclusivo de la **frase 3 del screening**
(§4.1). 🚩 **No agregar dos filas a la tabla para "que coincida con el Excel".**

✅ **Decisión (2026-09-16): se quedan donde están.** Se evaluó moverlas fuera del cuadro para que el
bloque quedara en 36 filas contiguas y el copy/paste fuera de un solo paso. La profesional prefiere
tenerlas ahí, junto al MMSE del que salen. Las dos vías de trabajo previstas lo absorben sin
problema: si **la IA arma la tabla** (el camino vigente) simplemente no las emite; si se hace un
**screenshot del Excel**, se ocultan las dos filas antes de capturar.

---

## 3. Bloque 3 — anamnesis: el bloque de mayor riesgo del pipeline

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
  realización de una evaluación (neuro)cognitiva (de control / por control).`
- Último párrafo, forma fija: `Vive <situación> y, según autoreporte, es autónomo/a en las
  actividades de la vida diaria.`
- Verbos de reporte rotados: `Refiere` · `Relata` · `Reporta` · `Menciona` · `En lo que concierne a`.
- Género y concordancia salen del paciente (`autónomo`/`autónoma`, `solo`/`sola`).
- Las **notas internas de protocolo no se redactan**: `A68` = `PROTOCOLO XTEND` no aparece en el
  Word (es nota de trabajo, no del informe).
- **Antecedentes familiares → SÍ se incluyen.** ✅ Confirmado (2026-09-07): la omisión de `A69`
  (`mamá con EA`) en `informeFinal2` no es la regla — *"a veces se mencionan, a veces no, pero no
  estaría mal, más en este caso que hay antecedentes, mencionarlo"*. → La skill **incluye** el
  antecedente familiar en la anamnesis (antes este archivo decía que se omitía).
- En general: **la skill incluye todo y marca lo dudoso**, sin decidir sola qué dejar afuera; lo único
  que no se redacta son las notas internas de protocolo.
- `A70` está **truncada dentro del propio Excel** — ver §5.g. ✅ Aclarado: son notas en vivo con el
  paciente enfrente y a veces quedan a medias; es error de tipeo de la profesional, no un problema de
  lectura. **Irrecuperable** — la skill la deja como está y lo señala.

---

## 4. Bloques 8–11 — narrativa clínica

### 4.1 Sección de screening (bloque 8)

Esqueleto casi fijo entre informes. **Lo único que se mueve son los puntajes intercalados** — el
resto son frases invariantes que van tal cual.

> ⚠️ **Fallo observado (revisión 2026-09-08, ver `../ejemplos/revision-salida-ia-vs-informeFinal2.md`
> §B4):** una versión anterior de este archivo decía "frases invariantes: discurso, nivel de alerta,
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
| 4 | `Rendimiento cognitivo general inicial (evaluado a partir de pruebas de screening) con puntajes conservados (MMSE=<C13>; TRO= <C16>; INECO=<C24>) para su edad y nivel educativo.` | VARIABLE |
| 5 | `El paciente / La paciente no reporta sintomatología vinculada al malestar psicológico ni quejas subjetivas de memoria significativas.` | CONDICIONAL — ver abajo |
| 6 | `Según autoreporte sobre funcionalidad e independencia, la autonomía en las actividades básicas de la vida diaria está conservada.` | CONDICIONAL — ver abajo |

Las frases 1 y 2 son observación conductual en vivo: van **siempre**, en su forma afirmativa, salvo
que el profesional anote lo contrario. No se derivan de ninguna celda y no se marcan como pendientes.

Sólo la frase 4 lleva puntajes: `MMSE` de `C13`, `TRO` de `C16`, `INECO` de `C24` (**el Word lo llama
INECO; el Excel y la tabla de síntesis lo llaman IFS Total**). Reproducir el espacio de más de
`TRO= ` (después del `=`) tal como está en la plantilla.

- **Frase 3** — se invierte si el subpuntaje de orientación del MMSE muestra alguna orientación no
  conservada (celdas nuevas del Excel, ver `excel-unificado-spec.md` §A.7). Si el dato falta, va la
  forma afirmativa y **el pendiente se lista en el bloque 11**, no dentro de la oración.
- **Frase 5** — la mitad de malestar psicológico sale de `C18`/`D18`; la de quejas subjetivas, de
  `B65` (C-QSM) si se tomó (corte `> 3`) o de la anamnesis si la celda está vacía. Si el paciente sí refiere quejas, la
  negación se recorta a `…no reporta sintomatología vinculada al malestar psicológico.` **Nunca poner
  el puntaje entre paréntesis acá** — el K-10 ya está en la tabla de síntesis.
- **Frase 6** — sale de `C17`/`D17`. Si las AVD están comprometidas, se redacta en consecuencia.

> ❌ `No se observan elementos que sugieran malestar psicológico significativo (KPDS-10=<total>,
> interpretación: <E28>). Autónomo en las actividades de la vida diaria (AVD=<D27>).`
> ✅ Las frases 5 y 6 de la tabla, tal cual, sin puntajes intercalados.

✅ **Aclarado (2026-09-07):**
- **Orientación temporal y espacial:** sale del subpuntaje de orientación del MMSE (sección
  `ORIENTACIÓN (10 puntos)` del papel), que hoy no está desglosado en el Excel. La profesional agrega
  celdas para esto (subpuntaje o dos Sí/No — ver `excel-unificado-spec.md` §A.7). La frase pasa a
  ser condicional: si alguna orientación **no** está conservada, la skill lo refleja en vez de dar el
  boilerplate `orientación temporal y espacial conservadas`.
- **Quejas subjetivas de memoria (C-QSM):** el C-QSM **a veces se toma y a veces no**. Si se tomó, la
  presencia de quejas la determina un **corte > 3 puntos**; si no, la observación **deriva de la
  anamnesis / motivo de consulta** (§5.a).

### 4.2 Secciones por área (bloque 9)

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

⚠️ **Fallo observado (revisión 2026-09-08, §B5):** la prohibición de siglas ya estaba escrita acá y la
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

⚠️ **Fallo observado (§B6):** la IA nombró `CE` en el párrafo de memoria, en el recap y en el cierre,
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
> ⚠️ **Fallo observado (§B3), el más serio de toda la salida:** la IA escribió *"fallas aisladas en
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
| Lenguaje | `Capacidad de comprensión y expresión conservadas.` (de `C44`/`C45`) | **abre** el párrafo |
| Lenguaje | `La entonación y articulación del lenguaje impresionaron conservadas a lo largo de toda la entrevista.` | segunda |
| Visoconstrucción | `La capacidad de visoconstrucción se encuentra conservada: el/la paciente logra copiar una figura simple (MMSE) y dibujar un reloj de memoria (TRO) adecuadamente.` | párrafo entero |

Si algo de eso **no** está conservado, la frase se invierte; no se omite.

### 4.3 Conclusiones y sugerencias (bloques 10–11)

- Párrafo de recap: enumera área por área con conectores (`A su vez` · `En adición` · `También` ·
  `Por último`). **Orden corregido — ver el recuadro de abajo.**
- Frase de cierre: **una sola oración**, que arranca con `En conclusión,`. Parte del template de
  `regla-diagnostica.md` **pero adaptada**: `informeFinal2` cerró con
  `En conclusión, el Sr. X presentó un rendimiento cognitivo normal con leves fallas aisladas en
  recuperación de la memoria.`, donde el template de la categoría 2 dice
  `fallas atencionales/ejecutivas aisladas` — porque en ese paciente las fallas eran mnésicas.
  Nombra la función afectada **en palabras clínicas**, sin siglas ni índices (`recuperación de la
  memoria`, no `memoria semántica y el índice compuesto CE`). Ver §B10 de la revisión.

> ⚠️ **Corrección al orden del recap (revisión 2026-09-08, §B7).** Este archivo decía "orden inverso
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

## 5. Estado del Excel — qué está cerrado y qué queda abierto

Ordenados por impacto. El detalle y los ajustes propuestos están en `excel-unificado-spec.md`.

### ✅ Cerrados a `excelEvaluacionCompletoV5.xlsx` (2026-09-16)

| Hallazgo anterior | Estado en V5 |
|---|---|
| **5.1 `IFS Índice MT` corrompida por autoconversión a fecha** | ✅ **Resuelto.** `C25` es **texto** (`7/10`). La celda ya no se autoconvierte. |
| **5.2 Los 10 ítems del K-10 no están** | ✅ **Resuelto.** `B53:B62` + total `B63` = `SUMA(...)`. El gráfico 2 **se genera desde el Excel**. |
| **5.5 No hay flag de "Riesgo de evolución"** | ✅ **Resuelto.** `B10`, `Si`/`No`, con validación de lista. Habilita la categoría 5. |
| **5.6 Dos bloques demográficos que divergen** | ✅ **Resuelto.** Un solo bloque (`A1:B10`), el mismo que manejan los `VLOOKUP`. Imposible desincronizar. |
| **5.7 `C3` ("Nombre") vacía** | ✅ **Resuelto.** El nombre vive en `B2` y no hay celda duplicada. |
| **Orientación temporal/espacial fuera del Excel** | ✅ **Resuelto.** `C14`/`C15`, `Si`/`No`, con validación (`Si,No,Medio`). |
| **`Atiende` / acompañamiento fuera del Excel** | ⚠️ **Parcial.** Existe `B8` pero con otro rótulo y otro dominio de valores — ver abajo. |
| **Rótulos de área ausentes en los bloques cualitativos** | ✅ **Resuelto.** `A13`/`A19`/`A34`/`A44`/`A49` rotulan los 5 grupos (ahora en celdas **combinadas**). |
| **C-QSM sin celda de puntaje** | ✅ **Resuelto.** `B65`, número entero suelto. |
| **La X del tramo se elegía a mano/por IA** | ✅ **Resuelto.** 8 columnas `E:L` por fórmula — ver §1. |
| **Lateralidad sin formas femeninas** | ✅ **Resuelto.** La lista de `B6` es `Diestro,Diestra,Zurdo,Zurda,Ambidiestro,Ambidiestra,-`. |

### ⚠️ Lo que sigue abierto

#### 5.a ✅ `C-QSM`: ya tiene celda de puntaje

`A65` es el rótulo y `B65` el puntaje (número entero suelto). Si la celda está **vacía** = no se tomó:
la observación de quejas subjetivas se deriva de la anamnesis y hay que avisar que **la línea
correspondiente de `PRUEBAS ADMINISTRADAS` se borra del Word** (en `informeFinal.docx` esa lista tiene
11 ítems y no incluye el C-QSM).

#### 5.b ✅ Los PB derivados pasaron a fórmula

`C37` (AST) = `=TRUNCAR(V38;2)` y `C41` (CE) = `=TRUNCAR(U43;2)`. **Chequeo barato para archivos
anteriores:** comparar cada PB contra su fórmula; si no coinciden, señalarlo en el bloque 11 — **sin
recalcular el Z**, que ya viene del Excel.

#### 5.c ✅ El total del K-10 pasó a fórmula

`C18` = `=B63` (antes era un número tipeado en paralelo a `=SUMA(B53:B62)`). Si un archivo trae `C18`
tipeado y distinto de `B63`, **señalarlo y no elegir por cuenta propia** — ver el recuadro de §1, donde
está el caso real en que ese desfasaje cambiaba la categoría diagnóstica.

#### 5.d `B8` quedó como `Asiste acompañado con`, no como `Atiende: Solo / Pareja`

Lo acordado era un campo con dominio `Solo` / `Pareja`. El rótulo de V3 (`… con`) pide un nombre o
vínculo, pero el valor cargado es `No`. Las dos lecturas son plausibles y la frase de apertura de la
anamnesis depende de esto (`asiste solo/a` vs `asiste acompañado/a por su …`). **Tratarlo así:**
`No` / vacío ⇒ `asiste solo/a`; cualquier otro texto ⇒ `asiste acompañado/a por <texto>`. Y dejarlo
anotado en el bloque 11 hasta que la profesional confirme el formato.

#### 5.e ✅ Los campos Sí/No ya tienen validación de lista

V5 tiene cuatro validaciones: `B5` (nivel educativo, apuntando a `FLUENCIAS!$B$2:$D$2`), `B6`
(lateralidad), `B10` (`Si,No`) y `C14:C15` (`Si,No,Medio`). Igual la skill **normaliza
tolerantemente** (mayúsculas/minúsculas, con y sin tilde) por si llega un archivo viejo y, si un valor
no es interpretable, lo **señala** en vez de asumir `No`.

ℹ️ `C14`/`C15` admiten un tercer valor, **`Medio`**: no es sí ni no. Tratarlo como "no conservada del
todo" y redactar la frase 3 en consecuencia, o señalarlo si el caso no es claro — nunca colapsarlo a
`Si`.

#### 5.f Las dos filas de TRO tienen valores distintos

`C16` (screening) = `10/10` y `C49` (visoconstrucción) = `9.5/10`. En V1 y en los dos informes reales
las dos apariciones de TRO llevan **el mismo** valor. Puede ser una distinción real (puntuación
distinta para dos criterios) o una celda que quedó vieja. **La skill copia cada celda en su fila y no
las reconcilia**; lo anota en el bloque 11 para que la profesional confirme.

#### 5.g `A70` sigue truncada dentro del Excel

El texto termina en `QSM: olvida cosas puntuales (fue a un partido y por ahi ` — paréntesis sin
cerrar, frase cortada. **La celda está así en el archivo**, no es un problema de lectura: son notas
tomadas en vivo y a veces quedan a medias. Irrecuperable; la skill la deja como está y lo señala
**sólo en el bloque 11** — nunca comentando el estado del dato dentro del informe.

#### 5.h Separador decimal mixto en los textos `X/Y`

Conviven valores con coma y con punto (`27/30`, `9.5/10`). **No afecta el procesamiento**: son
cadenas que se copian tal cual al Word. Es cosmético y de prioridad baja.

---

## 6. Datos sensibles

`../ejemplos/excelEvaluacionCompletoV5.xlsx` (y sus versiones anteriores) e
`../ejemplos/informeFinal2.docx` son de **pacientes reales**: nombre y apellido, fecha de nacimiento, nivel educativo, lateralidad, antecedente familiar de
Alzheimer, notas de sueño y estado de ánimo, y citas textuales de la entrevista.

Eso es inevitable en el **Excel de entrada** (es el archivo de trabajo del profesional, se adjunta
por paciente). No es inevitable en el **paquete de la skill**: lo que se sube a Claude Desktop queda
publicado ahí de forma persistente. Por eso el modelo de tono del paquete es `ejemplo-informe.md`
(datos ficticios), no `informeFinal2`. Ver la sección "Datos sensibles del paquete de la skill" en
`SKILL.md`.

✅ **Anonimizado (2026-09-08).** Este archivo (`mapeo-excel-a-word.md`) citaba, sin querer, datos del
paciente real usado en la revisión del 2026-09-08: una comilla textual de la entrevista, los PB de
`C13`/`C16`/`C24`/`C46`, y la fecha de nacimiento/evaluación y el valor de `C25` usados como ejemplos
de conversión de serial. Se reemplazaron por ejemplos ficticios (los PB, por los del paciente de
`ejemplo-informe.md`; las fechas y seriales, verificados con la fórmula de conversión pero con
valores inventados) que ilustran exactamente lo mismo sin identificar a nadie.
