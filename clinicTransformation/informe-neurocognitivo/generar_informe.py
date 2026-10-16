#!/usr/bin/env python3
"""
Genera el informe neurocognitivo completo (.docx) a partir de `plantilla-informe.docx`
y un JSON con los datos variables del paciente.

    python generar_informe.py datos.json informe.docx

Principio: NO se construye el documento, se CLONA la plantilla y se reemplazan sólo las
partes variables. Todo el formato (tabla de 12 columnas con sus grises y merges, gráficos,
encabezado, estilos, leyenda, firma) viene de la plantilla y no se toca nunca.

La plantilla es el SUPERCONJUNTO del informe: trae las 39 filas posibles de la tabla de
síntesis, los dos gráficos y las cuatro secciones por área. El script sólo BORRA lo que no
corresponde (pruebas no tomadas, gráfico del K-10, un área sin pruebas) y cambia el logo del
encabezado y la firma según `protocolo` y `evaluador`.

Las secciones se ubican por el TEXTO de sus encabezados, no por posición: si la profesional
edita la plantilla, el script sigue encontrándolas. Si un ancla no aparece, aborta —
nunca entrega un informe a medio llenar.

Sólo biblioteca estándar.
"""

import io
import json
import os
import re
import struct
import sys
import unicodedata
import zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
PLANTILLA = "plantilla-informe.docx"
RECURSOS = os.path.join(AQUI, "recursos")

# Un elemento de primer nivel del cuerpo: un párrafo o una tabla.
ELEM = re.compile(r"<(w:p|w:tbl)\b[^>]*>.*?</\1>|<w:p\b[^>]*/>", re.S)
RUN = re.compile(r"<w:r\b(?![a-zA-Z]).*?</w:r>", re.S)
RPR = re.compile(r"<w:rPr>.*?</w:rPr>", re.S)
TEXTO = re.compile(r"<w:t[^>]*>(.*?)</w:t>", re.S)
FILA = re.compile(r"<w:tr[ >].*?</w:tr>", re.S)
CELDA = re.compile(r"<w:tc>.*?</w:tc>", re.S)
PARRAFO = re.compile(r"<w:p\b.*?</w:p>", re.S)

# Las 39 filas de datos de la tabla de síntesis, en el orden de la plantilla:
# (clave del JSON, rótulo de la columna PRUEBA en la plantilla, grupo de área).
# FF y TRO aparecen dos veces: por eso la clave lleva el área y nunca se busca por nombre.
FILAS_SINTESIS = [
    ("mmse", "MMSE", "screening"),
    ("tro_screening", "TRO", "screening"),
    ("avd", "AVD", "screening"),
    ("kpds10", "KPDS-10", "screening"),
    ("dd", "DD", "atencion"),
    ("di", "DI", "atencion"),
    ("tmt_a", "TMT A", "atencion"),
    ("tmt_b", "TMT B", "atencion"),
    ("ff_atencion", "FF", "atencion"),
    ("ifs_total", "IFS Total", "atencion"),
    ("ifs_mt", "IFS Índice MT", "atencion"),
    ("ifs_sm", "IFS SM", "atencion"),
    ("ifs_ic", "IFS IC", "atencion"),
    ("ifs_cim", "IFS CIM", "atencion"),
    ("ifs_da", "IFS DA", "atencion"),
    ("ifs_ma", "IFS MA", "atencion"),
    ("ifs_mtv", "IFS MTV", "atencion"),
    ("ifs_r", "IFS R", "atencion"),
    ("ifs_civ", "IFS CIV", "atencion"),
    ("recuperacion", "Recuperación disejecutiva", "atencion"),
    ("roc_estrategia", "ROC estrategia", "atencion"),
    ("bem_as1", "BEM – MS AS1", "memoria"),
    ("bem_as2", "BEM – MS AS2", "memoria"),
    ("bem_as3", "BEM – MS AS3", "memoria"),
    ("bem_ast", "BEM – MS AST", "memoria"),
    ("bem_rse", "BEM – MS RSE", "memoria"),
    ("bem_sem", "BEM – MS Sem", "memoria"),
    ("bem_rec", "BEM – MS Rec", "memoria"),
    ("bem_ce", "BEM – MS CE", "memoria"),
    ("bem_inm", "BEM – ML Inm", "memoria"),
    ("bem_dif", "BEM – ML Dif", "memoria"),
    ("ff_lenguaje", "FF", "lenguaje"),
    ("fs", "FS", "lenguaje"),
    ("tba", "TBA", "lenguaje"),
    ("comprension", "Comprensión", "lenguaje"),
    ("expresion", "Expresión", "lenguaje"),
    ("tro_viso", "TRO", "visoconstruccion"),
    ("mmse_copia", "MMSE copia", "visoconstruccion"),
    ("roc_copia", "ROC copia", "visoconstruccion"),
]

# Las 14 categorías del gráfico 1, en orden. Un valor `null` en el JSON borra la categoría.
GRAFICO1_CLAVES = ["dd", "di", "tmt_a", "tmt_b", "bem_ast", "bem_rse", "bem_sem", "bem_rec",
                   "bem_ce", "bem_inm", "bem_dif", "ff_lenguaje", "fs", "tba"]

# Logo del encabezado por protocolo: (archivo en recursos/, alto en EMU). El ancho sale de la
# proporción de la imagen, para que no se deforme.
ENCABEZADOS = {
    "breyna": ("encabezado-breyna.png", 760288),
    "xtend": ("encabezado-xtend.png", 806491),
}

# Firma por profesional: (archivo, ancho en EMU, ¿conservar las líneas de texto de la plantilla?).
# La imagen de Josefina ya trae nombre, título y matrícula: por eso se borran las 3 líneas.
# Su ancho está calculado para que ocupe el mismo alto que el bloque de Agustina (garabato + 3
# líneas): más grande, la firma se cae sola a una página nueva cuando el informe es corto.
FIRMAS = {
    "agustina": ("firma-agustina.png", 1286510, True),
    "josefina": ("firma-josefina.png", 1600000, False),
}
# Borde derecho de la firma en la plantilla (posOffset + ancho): coincide con el margen derecho.
BORDE_DERECHO_FIRMA = 5389880 + 1286510

AREAS = [
    ("ATENCIÓN, VELOCIDAD DE PROCESAMIENTO", "MEMORIA EPISÓDICA", "atencion"),
    ("MEMORIA EPISÓDICA", "LENGUAJE", "memoria"),
    ("LENGUAJE", "VISOCONSTRUCCIÓN", "lenguaje"),
    ("VISOCONSTRUCCIÓN", "CONCLUSIONES Y SUGERENCIAS", "visoconstruccion"),
]


class ErrorDePlantilla(Exception):
    """La plantilla no tiene la forma esperada. Aborta sin escribir nada."""


def escapar(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def texto_de(el):
    return "".join(re.sub(r"<[^>]+>", "", m) for m in TEXTO.findall(el))


def normalizar(s):
    """Minúsculas, sin tildes ni espacios sobrantes: para comparar valores tipeados en el Excel."""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode("ascii")
    return " ".join(s.lower().split())


def rotulo(s):
    """Rótulo de prueba comparable: sin espacios y con los guiones unificados."""
    return re.sub(r"\s+", "", s.replace("–", "-").replace("—", "-"))


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


def tamano_png(datos_png):
    """(ancho, alto) en píxeles, leídos del bloque IHDR."""
    if datos_png[:8] != b"\x89PNG\r\n\x1a\n":
        raise ErrorDePlantilla("El recurso no es un PNG válido.")
    return struct.unpack(">II", datos_png[16:24])


def leer_recurso(nombre):
    ruta = os.path.join(RECURSOS, nombre)
    if not os.path.exists(ruta):
        raise ErrorDePlantilla("Falta el recurso %s junto al script." % ruta)
    with open(ruta, "rb") as fh:
        return fh.read()


def poner_extension(xml, cx, cy):
    """Ajusta el tamaño de un <w:drawing>: `wp:extent` y `a:ext` tienen que coincidir."""
    return re.sub(r'(<wp:extent|<a:ext) cx="\d+" cy="\d+"', r'\1 cx="%d" cy="%d"' % (cx, cy), xml)


def destino_de_imagen(rels_xml, rid):
    m = re.search(r'<Relationship [^>]*Id="%s"[^>]*/>' % rid, rels_xml)
    if not m:
        raise ErrorDePlantilla("No se encontró la relación %s de la imagen." % rid)
    return re.search(r'Target="([^"]+)"', m.group(0)).group(1)


def elegir(valor, opciones, campo):
    """Resuelve un valor tipeado del Excel contra las claves conocidas, tolerando tildes y espacios."""
    v = normalizar(valor or "")
    encontradas = [k for k in opciones if k in v]
    if len(encontradas) != 1:
        raise ErrorDePlantilla(
            "%s = %r no se reconoce. Valores válidos: %s." % (campo, valor, ", ".join(opciones))
        )
    return encontradas[0]


def cambiar_encabezado(partes, protocolo):
    archivo, alto = ENCABEZADOS[protocolo]
    png = leer_recurso(archivo)
    ancho_px, alto_px = tamano_png(png)
    ancho = int(round(alto * ancho_px / alto_px))

    doc_rels = partes["word/_rels/document.xml.rels"].decode("utf-8")
    headers = re.findall(r'Target="(header\d+\.xml)"', doc_rels)
    if len(headers) != 1:
        raise ErrorDePlantilla("Se esperaba un único encabezado y hay %d." % len(headers))
    hdr_path = "word/" + headers[0]
    hdr = partes[hdr_path].decode("utf-8")
    dibujos = re.findall(r"<w:drawing>.*?</w:drawing>", hdr, re.S)
    if len(dibujos) != 1:
        raise ErrorDePlantilla("El encabezado debería tener un solo logo y tiene %d." % len(dibujos))
    rid = re.search(r'r:embed="([^"]+)"', dibujos[0]).group(1)
    rels = partes["word/_rels/%s.rels" % headers[0]].decode("utf-8")
    media = "word/" + destino_de_imagen(rels, rid)

    partes[media] = png
    partes[hdr_path] = hdr.replace(dibujos[0], poner_extension(dibujos[0], ancho, alto)).encode("utf-8")
    return "encabezado: %s (%s)" % (protocolo.capitalize(), archivo)


def cambiar_firma(partes, els, salida, evaluador):
    archivo, ancho, conservar_texto = FIRMAS[evaluador]
    png = leer_recurso(archivo)
    ancho_px, alto_px = tamano_png(png)
    alto = int(round(ancho * alto_px / ancho_px))

    cierre = indice_de(els, "Quedo a disposición")
    firma = next((i for i in range(cierre + 1, len(els)) if "r:embed=" in els[i]), None)
    if firma is None:
        raise ErrorDePlantilla("No se encontró la imagen de la firma después de 'Quedo a disposición'.")
    rid = re.search(r'r:embed="([^"]+)"', els[firma]).group(1)
    rels = partes["word/_rels/document.xml.rels"].decode("utf-8")
    media = "word/" + destino_de_imagen(rels, rid)

    partes[media] = png
    parrafo = poner_extension(els[firma], ancho, alto)
    # La firma está anclada por su borde izquierdo: se corre para que el derecho quede donde estaba.
    parrafo = re.sub(
        r'(<wp:positionH relativeFrom="column"><wp:posOffset>)-?\d+(</wp:posOffset>)',
        lambda m: m.group(1) + str(BORDE_DERECHO_FIRMA - ancho) + m.group(2),
        parrafo,
    )
    salida[firma] = parrafo

    borradas = 0
    if not conservar_texto:
        for i in range(firma + 1, len(els)):
            if texto_de(els[i]).strip():
                salida[i] = ""
                borradas += 1
    return "firma: %s (%s)%s" % (
        evaluador.capitalize(), archivo,
        "" if conservar_texto else ", %d líneas de texto de la plantilla eliminadas" % borradas,
    )


def escribir_grafico(partes, nombre_chart, embebido, valores):
    """
    Reescribe el caché del gráfico y el libro de Excel embebido que lo respalda.
    Un valor `None` borra esa categoría: se renumeran los puntos, se acortan los rangos y se
    reescribe el libro embebido, para que "Editar datos" en Word no la resucite.
    """
    ruta = "word/charts/%s" % nombre_chart
    xml = partes[ruta].decode("utf-8")

    cat = re.search(r"<c:cat>.*?</c:cat>", xml, re.S)
    val = re.search(r"<c:val>.*?</c:val>", xml, re.S)
    if not cat or not val:
        raise ErrorDePlantilla("%s no tiene <c:cat> y <c:val>." % nombre_chart)
    etiquetas = re.findall(r'<c:pt idx="\d+"><c:v>([^<]*)</c:v></c:pt>', cat.group(0))
    puntos = re.findall(r'<c:pt idx="\d+"><c:v>', val.group(0))
    if len(puntos) != len(valores) or len(etiquetas) != len(valores):
        raise ErrorDePlantilla(
            "%s espera %d valores y se recibieron %d."
            % (nombre_chart, len(puntos), len(valores))
        )
    quedan = [i for i, v in enumerate(valores) if v is not None]
    n = len(quedan)

    def rearmar(bloque, textos):
        pts = "".join('<c:pt idx="%d"><c:v>%s</c:v></c:pt>' % (k, t) for k, t in enumerate(textos))
        bloque = re.sub(r'<c:pt idx="\d+"><c:v>[^<]*</c:v></c:pt>', "", bloque)
        bloque = re.sub(r'<c:ptCount val="\d+"/>', lambda _m: '<c:ptCount val="%d"/>%s' % (n, pts), bloque)
        # Rango `Hoja1!$B$2:$B$15` → termina en la última fila que queda.
        return re.sub(
            r"(<c:f>[^!]*!\$[A-Z]+\$)(\d+)(:\$[A-Z]+\$)\d+(</c:f>)",
            lambda m: "%s%s%s%d%s" % (m.group(1), m.group(2), m.group(3), int(m.group(2)) + n - 1, m.group(4)),
            bloque,
        )

    ref_cat = re.search(r"<c:f>[^!]*!\$([A-Z]+)\$(\d+):\$[A-Z]+\$(\d+)</c:f>", cat.group(0))
    ref_val = re.search(r"<c:f>[^!]*!\$([A-Z]+)\$(\d+):\$[A-Z]+\$(\d+)</c:f>", val.group(0))
    xml = xml.replace(cat.group(0), rearmar(cat.group(0), [etiquetas[i] for i in quedan]))
    xml = xml.replace(val.group(0), rearmar(val.group(0), [repr(valores[i]) for i in quedan]))
    partes[ruta] = xml.encode("utf-8")

    if not ref_val:
        return n, 0
    col_val, primera, ultima = ref_val.group(1), int(ref_val.group(2)), int(ref_val.group(3))
    col_cat = ref_cat.group(1) if ref_cat else None

    libro = zipfile.ZipFile(io.BytesIO(partes[embebido]))
    nombres = libro.namelist()
    interno = {nm: libro.read(nm) for nm in nombres}
    libro.close()
    hoja = "xl/worksheets/sheet1.xml"
    s = interno[hoja].decode("utf-8")

    # Celdas originales de cada fila del rango, por columna.
    filas_hoja = {}
    for m in re.finditer(r'<row r="(\d+)"([^>]*?)(?:/>|>(.*?)</row>)', s, re.S):
        r = int(m.group(1))
        if primera <= r <= ultima:
            celdas = {}
            for c in re.finditer(r'<c r="([A-Z]+)\d+"([^>]*?)(?:/>|>.*?</c>)', m.group(3) or "", re.S):
                celdas[c.group(1)] = c.group(0)
            filas_hoja[r] = (m.group(0), m.group(2), celdas)

    escritas = 0
    for r in range(primera, ultima + 1):
        if r not in filas_hoja:
            continue
        original, attrs_fila, celdas = filas_hoja[r]
        k = r - primera
        if k < n:
            origen = primera + quedan[k]
            contenido = ""
            if col_cat and col_cat in filas_hoja.get(origen, ("", "", {}))[2]:
                etiqueta = filas_hoja[origen][2][col_cat]
                contenido += re.sub(r'<c r="%s\d+"' % col_cat, '<c r="%s%d"' % (col_cat, r), etiqueta, count=1)
            attrs = ""
            if col_val in celdas:
                attrs = re.sub(r' t="[^"]*"', "", re.match(r'<c r="[A-Z]+\d+"([^>]*?)/?>', celdas[col_val]).group(1))
            contenido += '<c r="%s%d"%s><v>%s</v></c>' % (col_val, r, attrs, repr(valores[quedan[k]]))
            escritas += 1
        else:
            contenido = ""
        s = s.replace(original, '<row r="%d"%s>%s</row>' % (r, attrs_fila, contenido), 1)
    interno[hoja] = s.encode("utf-8")

    # La tabla de Excel que envuelve el rango también se acorta.
    for nm in nombres:
        if nm.startswith("xl/tables/") and nm.endswith(".xml"):
            t = interno[nm].decode("utf-8")
            t = re.sub(r'ref="([A-Z]+\d+):([A-Z]+)%d"' % ultima,
                       lambda m: 'ref="%s:%s%d"' % (m.group(1), m.group(2), primera + n - 1), t)
            t = re.sub(r'(<autoFilter ref="[A-Z]+\d+:[A-Z]+)%d"' % ultima,
                       lambda m: '%s%d"' % (m.group(1), primera + n - 1), t)
            interno[nm] = t.encode("utf-8")

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for nm in nombres:
            z.writestr(nm, interno[nm])
    partes[embebido] = buf.getvalue()
    return n, escritas


def validar_numeros(valores, nombre):
    """Los valores de un gráfico van como números JSON. Un string ("0,45") no aborta en
    `escribir_grafico`: terminaría escrito con comillas dentro del XML y el gráfico se rompería."""
    malos = [v for v in valores
             if v is not None and (isinstance(v, bool) or not isinstance(v, (int, float)))]
    if malos:
        raise ErrorDePlantilla(
            "%s lleva números JSON con punto (-0.9), no texto: %s." % (nombre, ", ".join(map(repr, malos)))
        )


def indice_grafico(els, partes, nombre_chart):
    """Índice del párrafo que contiene el gráfico `nombre_chart`."""
    rels = partes["word/_rels/document.xml.rels"].decode("utf-8")
    m = re.search(r'<Relationship [^>]*Target="charts/%s"[^>]*/>' % nombre_chart, rels)
    if not m:
        raise ErrorDePlantilla("La plantilla no referencia charts/%s." % nombre_chart)
    rid = re.search(r'Id="([^"]+)"', m.group(0)).group(1)
    for i, e in enumerate(els):
        if re.search(r'<c:chart [^>]*r:id="%s"' % rid, e):
            return i
    raise ErrorDePlantilla("No se encontró el párrafo del gráfico %s." % nombre_chart)


def generar(datos, plantilla=PLANTILLA, salida_path="informe.docx"):
    if not os.path.exists(plantilla):
        plantilla = os.path.join(AQUI, os.path.basename(plantilla))
    with zipfile.ZipFile(plantilla) as z:
        orden = z.namelist()
        partes = {n: z.read(n) for n in orden}

    protocolo = elegir(datos.get("protocolo"), list(ENCABEZADOS), "protocolo")
    evaluador = elegir(datos.get("evaluador"), list(FIRMAS), "evaluador")

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

    # ---- 0. Encabezado (logo por protocolo) y firma (por profesional)
    resumen.append(cambiar_encabezado(partes, protocolo))
    resumen.append(cambiar_firma(partes, els, salida, evaluador))

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

    # ---- 3. Pruebas administradas (sólo las marcadas "Si" en el Excel)
    c = indice_de(els, "SÍNTESIS DEL RENDIMIENTO", b)
    if not datos["pruebas"]:
        raise ErrorDePlantilla("La lista de pruebas administradas llegó vacía.")
    previos = reemplazar_rango(els, salida, b, c, datos["pruebas"])
    resumen.append("pruebas administradas: %d ítems (la plantilla traía %d)" % (len(datos["pruebas"]), previos))

    # ---- 4. Tabla de síntesis: se escriben las filas presentes en el JSON y se borran las demás.
    sintesis = datos["sintesis"]
    if not isinstance(sintesis, dict):
        raise ErrorDePlantilla("`sintesis` tiene que ser un objeto {clave: {pb, z, x}}.")
    claves = [k for k, _, _ in FILAS_SINTESIS]
    desconocidas = [k for k in sintesis if k not in claves]
    if desconocidas:
        raise ErrorDePlantilla("Claves de síntesis desconocidas: %s." % ", ".join(desconocidas))

    tabla = els[i_sintesis]
    spans = [m.span() for m in FILA.finditer(tabla)]
    filas = [tabla[x:y] for x, y in spans]
    if len(filas) != len(FILAS_SINTESIS) + 3:
        raise ErrorDePlantilla(
            "La tabla de síntesis tiene %d filas (se esperaban %d: 2 de encabezado + %d de datos + leyenda)."
            % (len(filas), len(FILAS_SINTESIS) + 3, len(FILAS_SINTESIS))
        )
    nuevas = list(filas)
    escritas = 0
    borradas = []
    primera_de_grupo = {}  # grupo → celda ÁREA con vMerge restart y el rótulo
    sobrevivientes = {}    # grupo → índices de fila que quedan
    for n, (clave, nombre, grupo) in enumerate(FILAS_SINTESIS):
        fila = filas[n + 2]  # 2 filas de encabezado
        celdas = CELDA.findall(fila)
        if rotulo(texto_de(celdas[1])) != rotulo(nombre):
            raise ErrorDePlantilla(
                "La fila %d de la síntesis dice %r y se esperaba %r: la plantilla cambió."
                % (n + 1, texto_de(celdas[1]), nombre)
            )
        if grupo not in primera_de_grupo:
            primera_de_grupo[grupo] = celdas[0]
        if clave not in sintesis:
            nuevas[n + 2] = ""
            borradas.append(clave)
            continue
        sobrevivientes.setdefault(grupo, []).append(n + 2)

        fila_datos = sintesis[clave]
        # Los valores de las listas desplegables del Excel pueden traer un espacio adelante.
        pb = str(fila_datos.get("pb", "")).strip()
        z_val = str(fila_datos.get("z", "")).strip()
        col_x = fila_datos.get("x", 0)
        nueva_fila = fila

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
        nuevas[n + 2] = nueva_fila

    # Si se borró la fila que abría un grupo, la celda ÁREA combinada (con el rótulo y el
    # `vMerge restart`) pasa a la primera fila que queda. Si no, el rótulo desaparece.
    for grupo, indices in sobrevivientes.items():
        primera = nuevas[indices[0]]
        area = CELDA.findall(primera)[0]
        if area != primera_de_grupo[grupo]:
            nuevas[indices[0]] = primera.replace(area, primera_de_grupo[grupo], 1)

    nueva = tabla[: spans[0][0]]
    for k, (x, y) in enumerate(spans):
        nueva += nuevas[k] + tabla[y: spans[k + 1][0] if k + 1 < len(spans) else len(tabla)]
    salida[i_sintesis] = nueva
    resumen.append(
        "tabla de síntesis: %d filas, %d celdas escritas · %d filas borradas%s"
        % (len(FILAS_SINTESIS) - len(borradas), escritas, len(borradas),
           (" (%s)" % ", ".join(borradas)) if borradas else "")
    )

    # ---- 5. Screening y secciones por área (una línea de impresión + un párrafo).
    # Un área sin ninguna fila en la tabla se borra entera: título, impresión y párrafo.
    d = indice_de(els, "SCREENING COGNITIVO", c)
    e = indice_de(els, "ATENCIÓN, VELOCIDAD DE PROCESAMIENTO", d)
    reemplazar_rango(els, salida, d, e, [datos["screening"]])

    areas_json = datos.get("areas") or {}
    desde = d
    escritas_areas, borradas_areas = 0, []
    for titulo, siguiente, clave in AREAS:
        i = indice_de(els, titulo, desde)
        j = indice_de(els, siguiente, i + 1)
        tiene_filas = clave in sobrevivientes
        par = areas_json.get(clave)
        if not tiene_filas:
            if par:
                raise ErrorDePlantilla(
                    "El área %r no tiene ninguna fila en la tabla y llegó con texto: "
                    "si no se evaluó, va `null`." % clave
                )
            for k in range(i, j):
                salida[k] = ""
            borradas_areas.append(clave)
        else:
            if not par or len(par) != 2:
                raise ErrorDePlantilla("El área %r necesita [impresión, párrafo]." % clave)
            reemplazar_rango(els, salida, i, j, par)
            escritas_areas += 1
        desde = i + 1
    resumen.append(
        "screening + %d secciones por área: %d párrafos%s"
        % (escritas_areas, 1 + 2 * escritas_areas,
           (" · áreas borradas: %s" % ", ".join(borradas_areas)) if borradas_areas else "")
    )

    # ---- 6. Conclusiones (recap + cierre) y sugerencias
    f = indice_de(els, "CONCLUSIONES Y SUGERENCIAS", desde)
    g = indice_de(els, "Se sugiere:", f)
    reemplazar_rango(els, salida, f, g, [datos["recap"], datos["cierre"]])
    h = indice_de(els, "Quedo a disposición", g)
    previos = reemplazar_rango(els, salida, g, h, datos["sugerencias"])
    resumen.append("conclusiones: recap + cierre · %d viñetas (la plantilla traía %d)"
                   % (len(datos["sugerencias"]), previos))

    # ---- 7. Gráficos. Gráfico 1: `null` borra la categoría, y tiene que coincidir con la tabla.
    g1 = datos["grafico1"]
    if len(g1) != len(GRAFICO1_CLAVES):
        raise ErrorDePlantilla("grafico1 necesita %d valores (null = no se tomó) y llegaron %d."
                               % (len(GRAFICO1_CLAVES), len(g1)))
    validar_numeros(g1, "grafico1")
    for clave, v in zip(GRAFICO1_CLAVES, g1):
        if (v is None) != (clave not in sintesis):
            raise ErrorDePlantilla(
                "grafico1 y la tabla no coinciden en %r: %s." % (
                    clave, "la fila está en la tabla pero el gráfico trae null" if v is None
                    else "el gráfico trae valor pero la fila no está en la tabla")
            )
    i_g1 = indice_grafico(els, partes, "chart1.xml")
    if all(v is None for v in g1):
        salida[i_g1] = ""
        resumen.append("gráfico 1: eliminado (ninguna prueba con Z)")
    else:
        p, celdas_lib = escribir_grafico(
            partes, "chart1.xml", "word/embeddings/Microsoft_Excel_Worksheet.xlsx", g1
        )
        resumen.append("gráfico 1: %d puntos + %d celdas del libro embebido%s"
                       % (p, celdas_lib, (" · %d categorías borradas" % (len(g1) - p)) if p < len(g1) else ""))

    # Gráfico 2 (K-10): `null` si la escala no se tomó → se borra el gráfico entero.
    g2 = datos.get("grafico2")
    i_g2 = indice_grafico(els, partes, "chart2.xml")
    if g2 is None:
        salida[i_g2] = ""
        resumen.append("gráfico 2: eliminado (K-10 no administrado)")
    else:
        if any(v is None for v in g2):
            raise ErrorDePlantilla("grafico2 va completo (10 enteros) o `null` entero, no por ítem.")
        validar_numeros(g2, "grafico2")
        p, celdas_lib = escribir_grafico(
            partes, "chart2.xml", "word/embeddings/Microsoft_Excel_Worksheet1.xlsx", g2
        )
        resumen.append("gráfico 2: %d puntos + %d celdas del libro embebido" % (p, celdas_lib))

    # ---- 8. Cuerpo rearmado
    doc = doc[: cuerpo.start()] + "<w:body>" + "".join(salida) + sect.group(0) + "</w:body>" + doc[cuerpo.end():]
    partes["word/document.xml"] = doc.encode("utf-8")

    with zipfile.ZipFile(salida_path, "w", zipfile.ZIP_DEFLATED) as z:
        for nombre in orden:
            z.writestr(nombre, partes[nombre])

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
        print("No se generó ningún archivo. Corregir el JSON y volver a correr; no entregar un informe parcial.")
        return 2
    print("Informe generado: %s" % salida_path)
    for linea in resumen:
        print("  " + linea)
    return 0


if __name__ == "__main__":
    sys.exit(main())
