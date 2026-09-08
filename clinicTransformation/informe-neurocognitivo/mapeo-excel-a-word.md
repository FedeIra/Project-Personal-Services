# Mapeo Excel → Word — de dónde sale cada bloque del informe

> Reconstruido comparando **`excelEvaluacionCompleto.xlsx`** con **`informeFinal2.docx`**, que es el
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

## 1. Esquema real de `excelEvaluacionCompleto.xlsx`

Una sola hoja aporta datos del paciente: **`TABLA DE FORMULAS`**. Las otras seis (`Stroop`, `MMSE`,
`Puntajes Equivalentes`, `PRUEBAS`, `FLUENCIAS`, `BACK UP`) son tablas de normas/apoyo y **no se
leen** — son el backend de los `VLOOKUP`.

### Bloque de parámetros (celdas que manejan todas las fórmulas)

| Celda | Contenido | Rol |
|---|---|---|
| `C3` | *(vacía)* | rótulo "Nombre" en `B3`, sin valor cargado — ver §5.7 |
| `C4` | `61` | **Edad. Driver de todos los `VLOOKUP` a `PRUEBAS`/`FLUENCIAS`.** |
| `C5` | `Terciario` | **Nivel educativo. Driver del `MATCH` de `FLUENCIAS`.** |

### Cuadro de pruebas con Z (`C7:H22`) — columnas `C`=Prueba `D`=PB `E`=Z `G`=Media `H`=Desvío

`D` la carga la persona; `E`, `G` y `H` son fórmulas. Las áreas están en `B` con celdas combinadas:
`B8:B12` Atención y Funciones Ejecutivas · `B13:B19` Memoria episódica · `B20:B22` Lenguaje.

| Fila | Prueba | PB | Z (crudo) |
|---|---|---|---|
| 8 | DD | `D8` | `E8` |
| 9 | DI | `D9` | `E9` |
| 10 | TMT A | `D10` | `E10` (la fórmula invierte el signo: `*(-1)`) |
| 11 | TMT B | `D11` | `E11` (idem) |
| 12 | FF | `D12` | `E12` |
| 13 | BEM – MS AST | `D13` | `E13` |
| 14 | BEM – MS RSE | `D14` | `E14` |
| 15 | BEM – MS Sem | `D15` | `E15` |
| 16 | BEM – MS Rec | `D16` | `E16` |
| 17 | BEM – MS CE | `D17` | `E17` |
| 18 | BEM – ML Inm | `D18` | `E18` |
| 19 | BEM – ML Dif | `D19` | `E19` |
| 20 | FF *(2ª aparición)* | `D20` | `E20` |
| 21 | FS | `D21` | `E21` |
| 22 | TBA | `D22` | `E22` |

### Bloque auxiliar `J13:L16` — ensayos de memoria seriada

Rotulado `MS - Signoret` (`J13:K13` combinadas). **Es la única fuente de los 3 ensayos**, que en el
Word son 3 filas de la tabla de síntesis:

| Celda | Contenido |
|---|---|
| `K14` | AS1 |
| `K15` | AS2 |
| `K16` | AS3 |
| `L14` (comb. `L14:L16`) | `=(K14+K15+K16)/3` → alimenta el PB de AST (`D13`), **cargado a mano** |
| `K19` | `=(D15+D16)/2` → chequeo del PB de CE (`D17`) |

✅ **Confirmado (2026-09-07): `D13` = promedio de los 3 trials, truncado a 2 decimales.** Ensayos 5,
8 y 10 → `L14` = `7,6667`, y el PB correcto es **`7,66`** (truncado, no `7,67`). **No es cosmético:
mueve el Z** — con 7,66 el Z es `-0,90`; con 7,67 sería `-0,89`. La profesional prefiere que `D13`
**se calcule solo** (fórmula tipo `=TRUNCAR(L14; 2)`) en vez de cargarse a mano — ver
`excel-unificado-spec.md` §A.6. La skill **usa el PB tal como está en `D13`** y no lo recalcula.

### Bloque cualitativo (`C25:F44`) — sin Z numérico

*(Valores de ejemplo ficticios en la columna PB — ver "Datos sensibles" al final de este archivo.)*

| Fila | Prueba | PB | Interpretación |
|---|---|---|---|
| 25 | MMSE | `D25` (`29/30`) | — |
| 26 | TRO | `D26` (`10/10`) | — |
| 27 | AVD | `D27` (`8`) | `E27` (comb. `E27:F27`) = `Autónomo` |
| 28 | KPDS-10 | `D28` (`12`) | `E28` (comb. `E28:F28`) = `Normal` |
| 30 | IFS Total | `D30` (`27,5/30`) | — |
| 31 | IFS Índice MT | `D31` | ⚠️ **puede venir corrupta** — ver §5.1 |
| 32–39 | IFS SM, IC, CIM, DA, MA, MTV, R, CIV | `D32`…`D39` (`3 normal`, …) | — |
| 41 | Comprensión | `D41` (`Normal`) | — |
| 42 | Expresión | `D42` (`Normal`) | — |
| 43 | TRO *(2ª aparición)* | `D43` (`10/10`) | — |
| 44 | MMSE copia | `D44` (`Normal`) | — |

### Bloque demográfico (`B46:C51`)

| Celda | Campo |
|---|---|
| `C46` | Paciente (apellido, nombre) |
| `C47` | Edad (texto: `61 años`) |
| `C48` | Fecha de nacimiento (**serial de fecha**) |
| `C49` | Nivel educativo alcanzado |
| `C50` | Lateralidad |
| `C51` | Fecha de evaluación (**serial de fecha**) |

### Bloque de anamnesis (`B55:B64`)

`B55` es el rótulo `MOTIVO DE CONSULTA Y ANTECEDENTES`; `B56`–`B64` son las notas crudas de la
entrevista, una viñeta por celda, en telegrama y con comillas textuales del paciente.

---

## 2. Estructura del Word y de dónde viene cada parte

En orden de aparición en `informeFinal2.docx`. ⚠️ **Esta numeración es el orden del documento Word y
no coincide con la de los bloques de salida de `SKILL.md`**, que agrupa distinto (11 bloques de
output, no 12 partes del documento). Cuando importe, referirse a los bloques por nombre.

| # | Bloque del Word | Tipo | Origen |
|---|---|---|---|
| 1 | Título `EVALUACIÓN NEUROCOGNITIVA` | FIJO | plantilla |
| 2 | `DATOS PERSONALES` + tabla de 6 filas | PASS | `C46:C51` |
| 3 | `MOTIVO DE CONSULTA Y ANTECEDENTES` (7–9 párrafos) | **LLM** | `B56:B64` — ver §3 |
| 4 | `PRUEBAS ADMINISTRADAS` (lista de 11–12 ítems) | FIJO/FUERA | plantilla; depende de la batería tomada |
| 5 | Tabla `SÍNTESIS DEL RENDIMIENTO` (36 filas) | PASS + DERIV | ver `orden-filas-sintesis.md` |
| 6 | Gráfico de líneas (14 valores Z) | DERIV | ver `orden-categorias-graficos.md` |
| 7 | Gráfico `Escala K-10` (10 valores) | **FUERA** | **no está en el Excel** — ver §5.2 |
| 8 | `SCREENING COGNITIVO, PSIQUIÁTRICO, FUNCIONALIDAD Y OBSERVACIONES CONDUCTUALES` | **LLM** | `D25`, `D26`, `D30`, `D27`/`E27`, `D28`/`E28` + observación en vivo |
| 9 | 4 secciones por área cognitiva | **LLM** | columna `E` del cuadro con Z — ver §4.2 |
| 10 | `CONCLUSIONES Y SUGERENCIAS` — párrafo de recap + frase de cierre | **LLM** | todas las Z + `regla-diagnostica.md` |
| 11 | `Se sugiere:` (4–6 viñetas) | template + LLM | `regla-diagnostica.md` — ver §4.3 |
| 12 | `Quedo a disposición…` + firma (`María Agustina Aceiro`, `Doctora en Psicología`, `M.N:67158`) | FIJO | plantilla |

### 2.1 Tabla de datos personales (bloque 2)

Pass-through directo, con tres detalles:

- `C48` y `C51` son **seriales de fecha** de Excel. En el Word van como **`dd/mm/aaaa`** — ejemplo
  ficticio: `25642` → `15/03/1970`; `46162` → `20/05/2026`. Al leer el `.xlsx` por código hay que
  convertir, no imprimir el número.
- El **juego de campos varía**: `informeFinal.docx` tiene una 7ª fila `Deriva:` que
  `informeFinal2.docx` no tiene. Respetar la plantilla que traiga el profesional; no agregar ni
  quitar filas.
- **No hay DNI ni ocupación** en la tabla del Word de ninguno de los dos informes. La lista de campos
  reales es exactamente la de `C46:C51`, más `Deriva` opcional.

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
- Las **notas internas de protocolo no se redactan**: `B56` = `- PROTOCOLO XTEND` no aparece en el
  Word (es nota de trabajo, no del informe).
- **Antecedentes familiares → SÍ se incluyen.** ✅ Confirmado (2026-09-07): la omisión de `B57`
  (`mamá con EA`) en `informeFinal2` no es la regla — *"a veces se mencionan, a veces no, pero no
  estaría mal, más en este caso que hay antecedentes, mencionarlo"*. → La skill **incluye** el
  antecedente familiar en la anamnesis (antes este archivo decía que se omitía).
- En general: **la skill incluye todo y marca lo dudoso**, sin decidir sola qué dejar afuera; lo único
  que no se redacta son las notas internas de protocolo.
- `B58` está **truncada dentro del propio Excel** — ver §5.4. ✅ Aclarado: son notas en vivo con el
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
| 4 | `Rendimiento cognitivo general inicial (evaluado a partir de pruebas de screening) con puntajes conservados (MMSE=<D25>; TRO= <D26>; INECO=<D30>) para su edad y nivel educativo.` | VARIABLE |
| 5 | `El paciente / La paciente no reporta sintomatología vinculada al malestar psicológico ni quejas subjetivas de memoria significativas.` | CONDICIONAL — ver abajo |
| 6 | `Según autoreporte sobre funcionalidad e independencia, la autonomía en las actividades básicas de la vida diaria está conservada.` | CONDICIONAL — ver abajo |

Las frases 1 y 2 son observación conductual en vivo: van **siempre**, en su forma afirmativa, salvo
que el profesional anote lo contrario. No se derivan de ninguna celda y no se marcan como pendientes.

Sólo la frase 4 lleva puntajes: `MMSE` de `D25`, `TRO` de `D26`, `INECO` de `D30` (**el Word lo llama
INECO; el Excel y la tabla de síntesis lo llaman IFS Total**). Reproducir el espacio de más de
`TRO= ` (después del `=`) tal como está en la plantilla.

- **Frase 3** — se invierte si el subpuntaje de orientación del MMSE muestra alguna orientación no
  conservada (celdas nuevas del Excel, ver `excel-unificado-spec.md` §A.7). Si el dato falta, va la
  forma afirmativa y **el pendiente se lista en el bloque 11**, no dentro de la oración.
- **Frase 5** — la mitad de malestar psicológico sale de `D28`/`E28`; la de quejas subjetivas, del
  C-QSM si se tomó (corte `> 3`) o de la anamnesis si no. Si el paciente sí refiere quejas, la
  negación se recorta a `…no reporta sintomatología vinculada al malestar psicológico.` **Nunca poner
  el puntaje entre paréntesis acá** — el K-10 ya está en la tabla de síntesis.
- **Frase 6** — sale de `D27`/`E27`. Si las AVD están comprometidas, se redacta en consecuencia.

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
  anamnesis / motivo de consulta** (§5.3).

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
| Lenguaje | `Capacidad de comprensión y expresión conservadas.` (de `D41`/`D42`) | **abre** el párrafo |
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

## 5. Hallazgos que impiden que el Excel sea autosuficiente

Ordenados por impacto. La corrección propuesta para cada uno está en `excel-unificado-spec.md`.

### 5.1 `D31` (IFS Índice MT) está corrompida por autoconversión a fecha

`D31` puede guardar un número con formato de fecha en vez del valor real. Ejemplo ilustrativo (fecha y
valor ficticios, no los del paciente real): `D31 = 45936` con formato de fecha es **06/10/2025** — lo
que pasó es que se tipeó `6/10` y Excel lo interpretó como fecha.

✅ **Aclarado (2026-09-07): no es una fecha.** El IFS Índice MT **deriva de la suma de la puntuación
de Dígitos Atrás + Memoria de Trabajo Visual.** → Si esos ítems están en el Excel, `D31` puede salir
**por fórmula** y no depende de tipeo; si se deja manual, va en formato **Texto**. Ver
`excel-unificado-spec.md` §A.1.

### 5.1.b ✅ La corrupción es **reversible** — recuperar el valor, no declararlo perdido

⚠️ **Corrección (revisión 2026-09-08, §B2).** Este archivo y `SKILL.md` decían "reportarlo y pedir el
valor; no adivinar", y la IA escribió `[PENDIENTE - dato corrupto]` en una celda de la tabla del Word
— perdiendo un dato que estaba ahí.

La autoconversión de Excel es **determinística y reversible**: `n/m` tipeado se guarda como el serial
de la fecha `día n, mes m` del año en curso. Formatear el serial como `d/m` devuelve exactamente lo
que se tipeó.

```
D31 = 45936 (serial)  →  06/10/2025  →  "6/10"     (ejemplo ficticio)
```

Esto es un procedimiento **verificado con un caso real** (paciente y fecha reales, no reproducidos
acá): el valor recuperado coincidió exactamente con lo que decía el informe del profesional.
Deshacer una conversión conocida **no es adivinar**.

**Procedimiento:**

1. Si `D31` es un número entre ~45000 y ~48000 con formato de fecha → convertir el serial a fecha y
   leerla como `d/m`.
2. **El máximo del subtest es el desempate, no sólo una validación.** Cuando los dos números son
   ≤ 12 el serial es **ambiguo**: una fecha como `06/10/2025` pudo haberse tipeado como `6/10` **o**
   como `10/6`, porque las dos son fechas válidas. Lo que rompe el empate es el máximo del subtest —
   el IFS Índice MT es sobre **10**, así que `6/10` es posible y `10/6` no (denominador 6 ≠ máximo
   10). El numerador, además, tiene que estar entre 0 y ese máximo.
   Si un número es > 12 no hay ambigüedad (sólo puede ser el día), pero el chequeo del máximo se hace
   igual. Si **las dos** lecturas pasan el chequeo, es irrecuperable → ir al paso 4.
3. Si el chequeo pasa → usar el valor en la fila 11 de la tabla y **listarlo en el bloque 11 como
   valor recuperado a confirmar**.
4. Si el chequeo **no** pasa (mes > 12 en el serial original, denominador imposible) → ahí sí es
   irrecuperable: dejar la celda vacía y pedir el valor. **Nunca** escribir un marcador de pendiente
   dentro de una celda de la tabla.

La misma lógica aplica a cualquier otra celda `n/m` que Excel haya convertido (p. ej. `9/10` en un
`D26` mal formateado).

### 5.2 Los 10 ítems del K-10 no están — el gráfico 2 es imposible

El gráfico `Escala K-10` necesita 10 valores por síntoma. La hoja de datos embebida en
`informeFinal2.docx` tiene `2, 4, 1, 1, 2, 1, 1, 1, 1, 1` (suma **15**). El Excel guarda **sólo el
total**, en `D28` = `15`.

→ El **gráfico K-10** del informe **no puede generarse desde el Excel** todavía. ✅ Confirmado
(2026-09-07): la profesional **agrega los 10 ítems al Excel** (total `D28` = `SUMA(...)`). Una vez
actualizado el archivo, el gráfico sale del Excel; hasta entonces, esos 10 valores se transcriben del
papel.

### 5.3 El C-QSM no está en el Excel

`Cuestionario de quejas subjetivas de memoria (C-QSM)` figura en `PRUEBAS ADMINISTRADAS` y su
resultado se usa en la narrativa de screening (`…ni quejas subjetivas de memoria significativas`),
pero no aparece ni en el Excel ni en la tabla de síntesis.

✅ **Aclarado (2026-09-07):** el C-QSM **a veces se toma y a veces no** (aparecía fijo en PRUEBAS
ADMINISTRADAS por error). **Cuando se toma:** presencia de quejas = **puntaje > 3**. **Cuando no:** la
observación deriva de la anamnesis / motivo de consulta. Se agrega una **celda de puntaje opcional**
(ver `excel-unificado-spec.md` §A.4); no es fila obligatoria de la tabla de síntesis.

### 5.4 `B58` está truncada dentro del Excel

El texto de la celda termina en `- QSM: olvida cosas puntuales (fue a un partido y por ahi ` —
paréntesis sin cerrar, frase cortada. Verificado en la cadena compartida del `.xlsx`: **no es un
problema de lectura, la celda está así**. Se perdió parte de la nota de la entrevista.

### 5.5 No hay flag de "Riesgo de evolución"

Sin ese campo, la **categoría 5** de `regla-diagnostica.md` (DCL con mayor riesgo de evolución) es
inalcanzable. Es criterio clínico puro: no se puede derivar de ninguna celda.

### 5.6 Dos bloques demográficos que ya divergen

`C4`/`C5` (que manejan los `VLOOKUP`) y `C47`/`C49` (que van al Word) guardan lo mismo dos veces, y
ya no coinciden: `C5` = `Terciario`, `C49` = `Terciario ` (con espacio al final). `C47` además
duplica la edad como texto (`61 años`). Nadie se enteraría si `C4` y `C47` quedaran desincronizadas,
y `C4` es lo que decide contra qué norma se compara **todo** el informe.

### 5.7 `C3` ("Nombre") quedó vacía

El rótulo existe pero el valor no se carga; el nombre real vive en `C46`. Redundancia sin usar.

---

## 6. Datos sensibles

`../ejemplos/excelEvaluacionCompleto.xlsx` e `../ejemplos/informeFinal2.docx` son de un **paciente
real**: nombre y apellido, fecha de nacimiento, nivel educativo, lateralidad, antecedente familiar de
Alzheimer, notas de sueño y estado de ánimo, y citas textuales de la entrevista.

Eso es inevitable en el **Excel de entrada** (es el archivo de trabajo del profesional, se adjunta
por paciente). No es inevitable en el **paquete de la skill**: lo que se sube a Claude Desktop queda
publicado ahí de forma persistente. Por eso el modelo de tono del paquete es `ejemplo-informe.md`
(datos ficticios), no `informeFinal2`. Ver la sección "Datos sensibles del paquete de la skill" en
`SKILL.md`.

✅ **Anonimizado (2026-09-08).** Este archivo (`mapeo-excel-a-word.md`) citaba, sin querer, datos del
paciente real usado en la revisión del 2026-09-08: una comilla textual de la entrevista, los PB de
`D25`/`D26`/`D30`/`D43`, y la fecha de nacimiento/evaluación y el valor de `D31` usados como ejemplos
de conversión de serial. Se reemplazaron por ejemplos ficticios (los PB, por los del paciente de
`ejemplo-informe.md`; las fechas y seriales, verificados con la fórmula de conversión pero con
valores inventados) que ilustran exactamente lo mismo sin identificar a nadie.
