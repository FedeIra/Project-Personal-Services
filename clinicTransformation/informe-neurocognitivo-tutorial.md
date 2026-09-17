# Tutorial — cómo usar la skill `informe-neurocognitivo` con Claude

> Cómo subir el paquete a claude.ai, cómo pedirle un informe, qué devuelve y qué revisar siempre
> antes de pegarlo en el Word. La fuente de verdad operativa sigue siendo
> `informe-neurocognitivo/SKILL.md`; esto es el manual de uso.

---

## 0. Qué es y qué no es

La skill es un **paquete** (7 archivos `.md` + la plantilla del Word + un script) que le enseña a
Claude a leer el Excel unificado de la evaluación y **devolver el informe completo en Word**, listo
para revisar y firmar.

- **Todo lo que devuelve es borrador para revisión de la profesional.**
- **Sí** genera el `.docx`, desde el 2026-09-17. Antes no: se creía que los gráficos eran objetos OLE
  imposibles de tocar por código, y resultó falso. Clona la plantilla y reemplaza sólo lo variable.
- Si la cuenta no puede crear archivos, cae al modo viejo de **12 bloques para copy/paste** y lo avisa.
- **No** recalcula PB ni Z: el Excel ya los trae calculados; la skill transcribe.
- **No** envía nada al paciente ni decide sola el diagnóstico: propone categoría, el médico decide.

---

## 1. Requisitos

| Requisito | Detalle |
|---|---|
| Plan de claude.ai | **Pro, Max, Team o Enterprise** (las Skills no están en el plan gratuito) |
| Code execution | Hay que **habilitarlo** en Settings → Capabilities: la skill lee el Excel con código |
| El paquete | `clinicTransformation/informe-neurocognitivo.zip` (7 archivos `.md`, `SKILL.md` en la raíz del zip) |
| El input | El Excel unificado del paciente, **versión V5** (`excelEvaluacionCompletoV5.xlsx` o posterior) |

---

## 2. Subir la skill a claude.ai (una sola vez)

1. Entrar a **claude.ai → Settings → Capabilities → Skills**.
2. Activar **code execution** si todavía no lo está.
3. **Upload skill** y elegir `clinicTransformation/informe-neurocognitivo.zip`.
4. Confirmar que aparece listada como `informe-neurocognitivo` y **activada**.

El zip tiene hoy los `.md` en la **raíz**, con `SKILL.md` al mismo nivel (no dentro de una
subcarpeta). Si alguna vez la carga lo rechaza, rearmarlo con la carpeta adentro —
`Compress-Archive -Path .\informe-neurocognitivo -DestinationPath .\informe-neurocognitivo.zip -Force` —
y subirlo así. Ver §7 para regenerarlo cuando se editen los archivos.

> **Alternativa — Claude Code:** si en vez de claude.ai se la quiere usar desde la terminal, no hace
> falta el zip: copiar la carpeta a `~/.claude/skills/informe-neurocognitivo/` (global) o a
> `.claude/skills/informe-neurocognitivo/` del repo (por proyecto) y queda disponible como
> `/informe-neurocognitivo`. El zip es **sólo** para la carga web. Ojo con el prerequisito: ahí no hay
> "code execution" de claude.ai — el `.xlsx` se lee corriendo Python local (openpyxl/pandas) o Node,
> así que esas dependencias tienen que estar instaladas en la máquina.

---

## 3. Antes de cada corrida — el gotcha que más falla

**Abrir el Excel en Excel y guardarlo (Ctrl+S) justo antes de subirlo.**

La skill lee el archivo con código, y las celdas con fórmula (la columna `D` de los Z, las 8 columnas
de rango `E:L`, `B63`, `C18`, `C37`, `C41`, …) sólo traen el **valor calculado cacheado** si el
archivo fue guardado por Excel. Si se sube sin guardar, o editado con Google Sheets / LibreOffice /
un script, esas celdas pueden leerse **vacías** y el informe sale incompleto.

Además:

- Subir **un solo Excel** por conversación. La skill lee únicamente la hoja `TABLA DE FORMULAS`.
- **No** hace falta adjuntar un informe modelo: la skill ya trae `ejemplo-informe.md` adentro (datos
  ficticios) como referencia de tono.
- El Excel del paciente tiene **datos reales**: es el input de cada pedido, nunca va dentro del zip.

---

## 4. Cómo pedirlo — el prompt

Conversación nueva, adjuntar el Excel y escribir algo así:

```
Adjunto el Excel V5 de la evaluación. Generá el informe neurocognitivo.
```

Claude detecta la skill sola al ver el Excel. Si no la levanta, forzarla nombrándola:

```
Usá la skill informe-neurocognitivo con este Excel y generá el informe en Word.
```

Variantes útiles:

| Quiero… | Pedir |
|---|---|
| Cambiar un párrafo y rehacer el Word | `Rehacé el bloque 8 y regenerá el informe.` |
| Los bloques sueltos, sin Word | `Dame los 12 bloques para copy/paste en vez del .docx.` |
| Sólo los gráficos | `Dame los bloques 5 y 6 (valores de los dos gráficos).` |
| Ver qué quedó dudoso | `Mostrame el bloque 12 otra vez, con las oraciones exactas a revisar.` |

---

## 5. Qué devuelve — los 12 bloques

| # | Bloque | Notas |
|---|---|---|
| 1 | Tabla de datos personales | **6 filas fijas** (`B2:B7`), fechas en `dd/mm/aaaa`, edad como `<n> años`; **`.docx`** |
| 2 | `MOTIVO DE CONSULTA Y ANTECEDENTES` | anamnesis (`A68:A76`) redactada en prosa, tercera persona |
| 3 | `PRUEBAS ADMINISTRADAS` | lista fija de la plantilla; **11 o 12 ítems** según `B65` |
| 4 | Tabla `SÍNTESIS DEL RENDIMIENTO` | **36 filas, se genera entera** (+ leyenda); **`.docx`** |
| 5 | Valores del gráfico 1 | 14 valores Z, **coma** decimal, cap ±3 — lista de valores, pegado posicional |
| 6 | Valores del gráfico 2 | los 10 ítems del K-10 (`B53:B62`), enteros sin cap |
| 7 | Sección de screening | esqueleto fijo de 6 frases con huecos |
| 8 | Cuatro secciones por área cognitiva | texto de plantilla, no redacción libre |
| 9 | Párrafo de recap de conclusiones | área por área, conectores del ejemplo |
| 10 | Frase de cierre | una sola oración, arranca con `En conclusión,` |
| 11 | Categoría diagnóstica + `Se sugiere:` | según `regla-diagnostica.md` — **propuesta**, decide el médico |
| 12 | **Reporte de faltantes y dudas** | el bloque que hay que leer siempre (ver §6) |

**El bloque 1 llega como un `.docx` para descargar.** Se abre, `Ctrl+A`, `Ctrl+C`, y `Ctrl+V` en
el informe. Word contra Word, así que entra fiel siempre. Requiere que la cuenta tenga habilitada la
creación de archivos de claude.ai; si no la tiene, la skill lo avisa y manda la tabla dibujada en el
chat, que se selecciona con el mouse y se pega igual (ese camino depende del cliente: si aparecen
`|` y rayas, se copió el texto y no la tabla).

**El bloque 4 también llega como `.docx`**, con el formato exacto de la tabla que ya está en el
informe: 12 columnas, sólo líneas horizontales, los dos grises, y la leyenda al pie incluida como
última fila. Se abre, `Ctrl+A`, `Ctrl+C`, y reemplaza la tabla vieja. **Ya no hace falta** el viejo
ajuste de "Autoajustar al contenido + ancho 130 %": la tabla trae la sangría negativa que la hace
entrar en la página.

Si la cuenta no tiene creación de archivos, este bloque cae a HTML (guardar `.html` → navegador →
seleccionar → copiar), y ahí sí vuelve a hacer falta el ajuste de ancho y copiar la leyenda aparte.
La skill avisa en el bloque 12 cuando cae a ese camino.

Los bloques **4 y 5 no son HTML**: son listas de valores para pegar en la hoja de datos de cada
gráfico, de forma **posicional** (empezando en la celda debajo del encabezado con el año, porque la
columna destino cambia según el archivo). Los gráficos se actualizan a mano.

---

## 6. Qué revisar siempre antes de pegar

1. **El bloque 12 primero.** Ahí van todos los faltantes, dudas y hallazgos — citando la oración
   exacta a revisar. Los bloques narrativos salen en prosa completa y pegable, *sin* marcas
   `[PENDIENTE]` en el medio (el paciente puede leer el informe), así que el único lugar donde
   aparecen los problemas es el bloque 12.
2. **El autochequeo del bloque 4.** La skill cruza su propio cálculo contra las X que ya trae el
   Excel y declara el resultado. Si reporta una discrepancia, es un hallazgo real: revisar esa fila.
3. **Las ranuras de opción**, del tipo `asiste [solo / acompañado por …] a la consulta`: hay que
   elegir una antes de pegar.
4. **El bloque 11.** La regla diagnóstica literal **sobre-diagnostica**; es una propuesta, no un
   diagnóstico.
5. **Riesgo de evolución** (`B10`) es criterio clínico manual: llega decidido desde el Excel, la
   skill nunca lo infiere.

---

## 7. Actualizar el paquete cuando se edita algo

El zip es una **copia congelada** de la carpeta: editar los archivos no lo actualiza. Después de
tocar cualquier archivo, regenerarlo y volver a subirlo a claude.ai (Settings → Capabilities → Skills →
reemplazar la skill existente).

PowerShell, desde `clinicTransformation/`:

```powershell
Compress-Archive -Path .\informe-neurocognitivo\* `
                 -DestinationPath .\informe-neurocognitivo.zip `
                 -CompressionLevel Optimal -Force
```

⚠️ Es `\*` y **no** `\*.md`: el paquete también lleva la plantilla `.docx` y el script `.py`.

Verificar que quedaron los 9 archivos **en la raíz** del zip (sin prefijo de carpeta):

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::OpenRead((Resolve-Path .\informe-neurocognitivo.zip)).Entries |
  Select-Object FullName, Length
```

⚠️ **No agregar al zip** `preguntasParaLaProfesional.md`, `clinicTransformationGuide.md`, la carpeta
`ejemplos/` ni `informeFinal2.docx` / los Excels de pacientes: son documentación interna o datos
reales. Lo que se sube a claude.ai queda publicado de forma persistente.

---

## 8. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Claude no usa la skill | no se adjuntó el Excel, o la skill está desactivada | nombrarla en el prompt; revisar Settings → Skills |
| Columnas de Z o de rango vacías | el Excel se subió sin guardar en Excel | abrir en Excel, Ctrl+S, volver a subir |
| Devuelve sólo las partes variables de los bloques 7 y 8 | se salteó el boilerplate de `mapeo-excel-a-word.md` §4.1/§4.2 | pedir: `Rehacé el bloque 8 con las frases invariantes de mapeo-excel-a-word.md §4.2` |
| Datos que no cuadran con las celdas | referencias de V3/V4 (`C34` para AST, `D43` para TBA, `B60` como total del K-10) | confirmar que el Excel es **V5**; esas direcciones existen en V5 con **otro contenido** y fallan en silencio |
| La tabla sale con 38 filas | se colaron orientación (`C14`/`C15`) o riesgo de evolución (`B10`) | la tabla de síntesis tiene **36 filas**; esas tres no son filas |
| No hay code execution | plan o setting | habilitarlo en Settings → Capabilities |
