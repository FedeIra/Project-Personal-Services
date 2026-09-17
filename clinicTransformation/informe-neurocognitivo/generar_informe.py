#!/usr/bin/env python3
"""
Genera el informe neurocognitivo completo (.docx) a partir de `plantilla-informe.docx`
y un JSON con los datos variables del paciente.

    python generar_informe.py datos.json informe.docx

Principio: NO se construye el documento, se CLONA la plantilla y se reemplazan sólo las
partes variables. Todo el formato (tabla de 12 columnas con sus grises y merges, gráficos,
encabezado, estilos, leyenda, firma) viene de la plantilla y no se toca nunca.

Las secciones se ubican por el TEXTO de sus encabezados, no por posición: si la profesional
edita la plantilla, el script sigue encontrándolas. Si un ancla no aparece, aborta —
nunca entrega un informe a medio llenar.

Sólo biblioteca estándar.
"""

import io
import json
import re
import sys
import zipfile

PLANTILLA = "plantilla-informe.docx"

# Un elemento de primer nivel del cuerpo: un párrafo o una tabla.
ELEM = re.compile(r"<(w:p|w:tbl)\b[^>]*>.*?</\1>|<w:p\b[^>]*/>", re.S)
RUN = re.compile(r"<w:r\b(?![a-zA-Z]).*?</w:r>", re.S)
RPR = re.compile(r"<w:rPr>.*?</w:rPr>", re.S)
TEXTO = re.compile(r"<w:t[^>]*>(.*?)</w:t>", re.S)
FILA = re.compile(r"<w:tr[ >].*?</w:tr>", re.S)
CELDA = re.compile(r"<w:tc>.*?</w:tc>", re.S)
PARRAFO = re.compile(r"<w:p\b.*?</w:p>", re.S)


class ErrorDePlantilla(Exception):
    """La plantilla no tiene la forma esperada. Aborta sin escribir nada."""


def escapar(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def texto_de(el):
    return "".join(re.sub(r"<[^>]+>", "", m) for m in TEXTO.findall(el))


def poner_texto(parrafo, txt):
    """Reemplaza el contenido de un <w:p> conservando su formato (pPr y el rPr del texto)."""
    rprs = RPR.findall(parrafo)
    rpr = rprs[-1] if len(rprs) > 1 else (rprs[0] if rprs else "")
    vacio = RUN.sub("", parrafo)
    if txt == "":
        return vacio
    run = '<w:r>%s<w:t xml:space="preserve">%s</w:t></w:r>' % (rpr, escapar(txt))
    # Reemplazo por función: si el texto del paciente trae una barra invertida, `re.sub`
    # la interpretaría como escape y corrompería el XML.
    return re.sub(r"</w:p>$", lambda _m: run + "</w:p>", vacio)


def poner_texto_celda(celda, txt):
    m = PARRAFO.search(celda)
    if not m:
        return celda
    return celda.replace(m.group(0), poner_texto(m.group(0), txt))


def indice_de(els, ancla, desde=0):
    """Índice del elemento cuyo texto contiene `ancla`. Aborta si no está."""
    for i in range(desde, len(els)):
        if ancla.lower() in texto_de(els[i]).lower():
            return i
    raise ErrorDePlantilla(
        "No se encontró el encabezado %r en la plantilla. "
        "Si se renombró una sección, hay que actualizar el ancla." % ancla
    )


def reemplazar_rango(els, salida, desde, hasta, textos):
    """
    Reemplaza los párrafos CON TEXTO que hay entre `desde` y `hasta` (exclusivos) por
    `len(textos)` párrafos nuevos, clonando el formato del primero. Los párrafos vacíos
    (separadores) se conservan. Permite que la cantidad cambie respecto de la plantilla.
    """
    ocupados = [i for i in range(desde + 1, hasta) if texto_de(els[i]).strip()]
    if not ocupados:
        raise ErrorDePlantilla(
            "No hay párrafos para reemplazar entre los elementos %d y %d." % (desde, hasta)
        )
    # 🚩 Un molde POR POSICIÓN, no uno solo para todos.
    # Dentro de un mismo rango los párrafos pueden tener formatos distintos: en las secciones por
    # área, el 1º es la línea "Impresión diagnóstica" (centrada, cursiva) y el 2º es el cuerpo
    # (justificado, sin cursiva). Con un molde único el cuerpo salía en cursiva y centrado.
    # Si llegan más textos que párrafos traía la plantilla, los sobrantes usan el último molde.
    moldes = [els[i] for i in ocupados]
    nuevos = [poner_texto(moldes[min(n, len(moldes) - 1)], t) for n, t in enumerate(textos)]
    salida[ocupados[0]] = "".join(nuevos)
    for i in ocupados[1:]:
        salida[i] = ""
    return len(ocupados)


def escribir_grafico(partes, nombre_chart, embebido, valores):
    """Reescribe el caché del gráfico y el libro de Excel embebido que lo respalda."""
    ruta = "word/charts/%s" % nombre_chart
    xml = partes[ruta].decode("utf-8")

    cache = re.search(r"<c:numCache>.*?</c:numCache>", xml, re.S)
    if not cache:
        raise ErrorDePlantilla("%s no tiene <c:numCache>." % nombre_chart)
    puntos = re.findall(r'<c:pt idx="(\d+)"><c:v>', cache.group(0))
    if len(puntos) != len(valores):
        raise ErrorDePlantilla(
            "%s espera %d valores y se recibieron %d."
            % (nombre_chart, len(puntos), len(valores))
        )

    def sustituir(m):
        return m.group(1) + repr(valores[int(m.group(2))]) + m.group(4)

    nuevo = re.sub(
        r'(<c:pt idx="(\d+)"><c:v>)([^<]*)(</c:v>)',
        sustituir,
        cache.group(0),
    )
    xml = xml.replace(cache.group(0), nuevo)
    partes[ruta] = xml.encode("utf-8")

    # El libro embebido: la columna y las filas salen de la referencia del propio gráfico.
    ref = re.search(
        r"<c:val>.*?<c:f>[^!]*!\$([A-Z]+)\$(\d+):\$[A-Z]+\$(\d+)</c:f>", xml, re.S
    )
    if not ref:
        return len(valores), 0
    col, primera, ultima = ref.group(1), int(ref.group(2)), int(ref.group(3))

    libro = zipfile.ZipFile(io.BytesIO(partes[embebido]))
    interno = {n: libro.read(n) for n in libro.namelist()}
    libro.close()
    hoja = "xl/worksheets/sheet1.xml"
    s = interno[hoja].decode("utf-8")
    contador = [0]

    def celda(m):
        fila = int(m.group(1))
        if fila < primera or fila > ultima:
            return m.group(0)
        contador[0] += 1
        attrs = re.sub(r' t="[^"]*"', "", m.group(2))
        return '<c r="%s%d"%s><v>%s</v></c>' % (col, fila, attrs, repr(valores[fila - primera]))

    s = re.sub(r'<c r="%s(\d+)"([^>]*?)(/>|>.*?</c>)' % col, celda, s, flags=re.S)
    interno[hoja] = s.encode("utf-8")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for n, b in interno.items():
            z.writestr(n, b)
    partes[embebido] = buf.getvalue()
    return len(valores), contador[0]


def generar(datos, plantilla=PLANTILLA, salida_path="informe.docx"):
    with zipfile.ZipFile(plantilla) as z:
        partes = {n: z.read(n) for n in z.namelist()}

    doc = partes["word/document.xml"].decode("utf-8")
    cuerpo = re.search(r"<w:body>(.*)</w:body>", doc, re.S)
    if not cuerpo:
        raise ErrorDePlantilla("La plantilla no tiene <w:body>.")
    els = [m.group(0) for m in ELEM.finditer(cuerpo.group(1))]
    sect = re.search(r"<w:sectPr.*?</w:sectPr>", cuerpo.group(1), re.S)
    if not sect:
        raise ErrorDePlantilla("La plantilla no tiene <w:sectPr>.")
    salida = list(els)
    resumen = []

    tablas = [i for i, e in enumerate(els) if e.startswith("<w:tbl")]
    if len(tablas) != 2:
        raise ErrorDePlantilla("Se esperaban 2 tablas en la plantilla y hay %d." % len(tablas))
    i_personales, i_sintesis = tablas

    # ---- 1. Datos personales: 6 filas fijas; las sobrantes (p. ej. "Deriva:") se borran.
    campos = datos["personales"]
    if len(campos) != 6:
        raise ErrorDePlantilla("Se esperaban 6 datos personales y llegaron %d." % len(campos))
    tabla = els[i_personales]
    filas = FILA.findall(tabla)
    if len(filas) < 6:
        raise ErrorDePlantilla("La tabla de datos personales tiene %d filas." % len(filas))
    nueva = tabla
    for n, valor in enumerate(campos):
        celdas = CELDA.findall(filas[n])
        if len(celdas) < 2:
            raise ErrorDePlantilla("Fila %d de datos personales sin celda de valor." % n)
        nueva = nueva.replace(filas[n], filas[n].replace(celdas[1], poner_texto_celda(celdas[1], valor)))
    for sobrante in filas[6:]:
        nueva = nueva.replace(sobrante, "")
    salida[i_personales] = nueva
    resumen.append("datos personales: 6 filas, %d sobrantes eliminadas" % (len(filas) - 6))

    # ---- 2. Anamnesis
    a = indice_de(els, "MOTIVO DE CONSULTA Y ANTECEDENTES")
    b = indice_de(els, "PRUEBAS ADMINISTRADAS", a)
    previos = reemplazar_rango(els, salida, a, b, datos["anamnesis"])
    resumen.append("anamnesis: %d párrafos (la plantilla traía %d)" % (len(datos["anamnesis"]), previos))

    # ---- 3. Pruebas administradas
    c = indice_de(els, "SÍNTESIS DEL RENDIMIENTO", b)
    previos = reemplazar_rango(els, salida, b, c, datos["pruebas"])
    resumen.append("pruebas administradas: %d ítems (la plantilla traía %d)" % (len(datos["pruebas"]), previos))

    # ---- 4. Tabla de síntesis
    filas_datos = datos["sintesis"]
    if len(filas_datos) != 36:
        raise ErrorDePlantilla("La tabla de síntesis necesita 36 filas y llegaron %d." % len(filas_datos))
    tabla = els[i_sintesis]
    filas = FILA.findall(tabla)
    if len(filas) < 38:
        raise ErrorDePlantilla("La tabla de síntesis tiene %d filas (se esperaban 39)." % len(filas))
    nueva, escritas = tabla, 0
    for n, fila_datos in enumerate(filas_datos):
        fila = filas[n + 2]  # 2 filas de encabezado
        celdas = CELDA.findall(fila)
        nueva_fila = fila
        pb, z_val, col_x = fila_datos["pb"], fila_datos["z"], fila_datos["x"]

        def poner(idx, txt):
            nonlocal nueva_fila, escritas
            actual = celdas[idx]
            cambiada = poner_texto_celda(actual, txt)
            if cambiada != actual:
                nueva_fila = nueva_fila.replace(actual, cambiada)
                celdas[idx] = cambiada
                escritas += 1

        poner(2, pb)
        poner(3, z_val)
        if len(celdas) >= 12:
            for k in range(8):
                poner(len(celdas) - 8 + k, "X" if col_x == k + 1 else "")
        nueva = nueva.replace(fila, nueva_fila)
    salida[i_sintesis] = nueva
    resumen.append("tabla de síntesis: 36 filas, %d celdas escritas" % escritas)

    # ---- 5. Screening y secciones por área (una línea de impresión + un párrafo)
    d = indice_de(els, "SCREENING COGNITIVO", c)
    e = indice_de(els, "ATENCIÓN, VELOCIDAD DE PROCESAMIENTO", d)
    reemplazar_rango(els, salida, d, e, [datos["screening"]])

    areas = [
        ("ATENCIÓN, VELOCIDAD DE PROCESAMIENTO", "MEMORIA EPISÓDICA", "atencion"),
        ("MEMORIA EPISÓDICA", "LENGUAJE", "memoria"),
        ("LENGUAJE", "VISOCONSTRUCCIÓN", "lenguaje"),
        ("VISOCONSTRUCCIÓN", "CONCLUSIONES Y SUGERENCIAS", "visoconstruccion"),
    ]
    desde = d
    for titulo, siguiente, clave in areas:
        i = indice_de(els, titulo, desde)
        j = indice_de(els, siguiente, i + 1)
        par = datos["areas"][clave]
        if len(par) != 2:
            raise ErrorDePlantilla("El área %r necesita [impresión, párrafo]." % clave)
        reemplazar_rango(els, salida, i, j, par)
        desde = i + 1
    resumen.append("screening + 4 secciones por área: 9 párrafos")

    # ---- 6. Conclusiones (recap + cierre) y sugerencias
    f = indice_de(els, "CONCLUSIONES Y SUGERENCIAS", desde)
    g = indice_de(els, "Se sugiere:", f)
    reemplazar_rango(els, salida, f, g, [datos["recap"], datos["cierre"]])
    h = indice_de(els, "Quedo a disposición", g)
    previos = reemplazar_rango(els, salida, g, h, datos["sugerencias"])
    resumen.append("conclusiones: recap + cierre · %d viñetas (la plantilla traía %d)"
                   % (len(datos["sugerencias"]), previos))

    # ---- 7. Cuerpo rearmado
    doc = doc[: cuerpo.start()] + "<w:body>" + "".join(salida) + sect.group(0) + "</w:body>" + doc[cuerpo.end():]
    partes["word/document.xml"] = doc.encode("utf-8")

    # ---- 8. Gráficos
    p, celdas_lib = escribir_grafico(
        partes, "chart1.xml", "word/embeddings/Microsoft_Excel_Worksheet.xlsx", datos["grafico1"]
    )
    resumen.append("gráfico 1: %d puntos + %d celdas del libro embebido" % (p, celdas_lib))
    p, celdas_lib = escribir_grafico(
        partes, "chart2.xml", "word/embeddings/Microsoft_Excel_Worksheet1.xlsx", datos["grafico2"]
    )
    resumen.append("gráfico 2: %d puntos + %d celdas del libro embebido" % (p, celdas_lib))

    with zipfile.ZipFile(salida_path, "w", zipfile.ZIP_DEFLATED) as z:
        for nombre, contenido in partes.items():
            z.writestr(nombre, contenido)

    return resumen


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    datos_path = sys.argv[1]
    salida_path = sys.argv[2] if len(sys.argv) > 2 else "informe.docx"
    plantilla = sys.argv[3] if len(sys.argv) > 3 else PLANTILLA
    with open(datos_path, encoding="utf-8") as fh:
        datos = json.load(fh)
    try:
        resumen = generar(datos, plantilla, salida_path)
    except ErrorDePlantilla as err:
        print("ABORTADO: %s" % err)
        print("No se generó ningún archivo. Avisar en el bloque 12 y no entregar un informe parcial.")
        return 2
    print("Informe generado: %s" % salida_path)
    for linea in resumen:
        print("  " + linea)
    return 0


if __name__ == "__main__":
    sys.exit(main())
