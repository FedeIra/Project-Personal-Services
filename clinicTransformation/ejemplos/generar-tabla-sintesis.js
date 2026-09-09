const A='Screening cognitivo y psiquiátrico', B='Atención y funciones ejecutivas',
      C='Memoria episódica', D='Lenguaje', E='Visoconstrucción';
const rows=[
 [A,'MMSE','30/30','qual'],[A,'TRO','9.5/10','qual'],
 [A,'AVD','8','interp','Autónomo'],[A,'KPDS-10','15','interp','Normal'],
 [B,'DD','7','z','0,45',5],[B,'DI','4','z','-0,35',4],[B,'TMT A','38','z','-0,18',4],
 [B,'TMT B','42','z','1,02',6],[B,'FF','24','z','2,31',7],
 [B,'IFS Total','26,5/30','qual'],[B,'IFS Índice MT','7/10','qual'],
 [B,'IFS SM','3 normal','qual'],[B,'IFS IC','3 normal','qual'],[B,'IFS CIM','3 normal','qual'],
 [B,'IFS DA','4 normal','qual'],[B,'IFS MA','2 normal','qual'],[B,'IFS MTV','3 normal','qual'],
 [B,'IFS R','2,5 normal','qual'],[B,'IFS CIV','6 normal','qual'],
 [C,'BEM – MS AS1','5','qual'],[C,'BEM – MS AS2','8','qual'],[C,'BEM – MS AS3','10','qual'],
 [C,'BEM – MS AST','7,66','z','-0,90',4],[C,'BEM – MS RSE','8','z','-0,13',4],
 [C,'BEM – MS Sem','8','z','≤-3',1],[C,'BEM – MS Rec','12','z','0,57',5],
 [C,'BEM – MS CE','10','z','-2,01',2],[C,'BEM – ML Inm','7','z','-1,24',3],
 [C,'BEM – ML Dif','8','z','-0,51',4],
 [D,'FF','24','z','2,31',7],[D,'FS','20','z','-0,30',4],[D,'TBA','10','z','-0,86',4],
 [D,'Comprensión','Normal','qual'],[D,'Expresión','Normal','qual'],
 [E,'TRO','9.5/10','qual'],[E,'MMSE copia','Normal','qual'],
];
const GD='#A6A6A6', GC='#D9D9D9';
const zoneBg=[GD,GD,GC,'','','','',''];   // sombreado de severidad por columna de rango
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const td=(txt,bg,center)=>`<td style="border:1px solid #000;padding:2px 4px;`
  +(bg?`background:${bg};`:'')+(center?'text-align:center;':'')+`">${esc(txt)}</td>`;
const tdArea=(txt,rowspan)=>`<td rowspan="${rowspan}" style="border:1px solid #000;padding:2px 4px;`
  +`vertical-align:middle;">${esc(txt)}</td>`;

// 2026-09-08: la columna ÁREA se fusiona verticalmente (rowspan) en vez de repetir el nombre en
// cada fila, como en la plantilla original. Sólo la primera fila de cada grupo emite la celda.
function spanOf(i){ let n=1; while(rows[i+n] && rows[i+n][0]===rows[i][0]) n++; return n; }

let body='';
rows.forEach(([area,prueba,pb,tipo,z,xc], i) => {
  const areaCell = (i===0 || area!==rows[i-1][0]) ? tdArea(area, spanOf(i)) : '';
  let cells=areaCell+td(prueba)+td(pb,'',true);
  if(tipo==='qual'){
    // 2026-09-08: ya no se escribe "N/A" — la celda queda vacía, sólo con el fondo gris.
    cells+=td('',GC,true);
    for(let k=0;k<8;k++) cells+=td('',GC,true);
  } else if(tipo==='interp'){
    cells+=td(z,'',true);
    for(let k=0;k<8;k++) cells+=td('',GC,true);
  } else {
    cells+=td(z,'',true);
    for(let k=0;k<8;k++) cells+=td(k+1===xc?'X':'',zoneBg[k],true);
  }
  body+=`  <tr>${cells}</tr>\n`;
});
const th=(t,extra='')=>`<th style="border:1px solid #000;padding:3px 5px;${extra}">${t}</th>`;
const thspan=(t,n,extra='')=>`<th colspan="${n}" style="border:1px solid #000;padding:3px 5px;text-align:center;${extra}">${t}</th>`;
const html=`<!doctype html>
<meta charset="utf-8">
<title>Síntesis del rendimiento — tabla de prueba</title>
<body style="font-family:Arial,sans-serif;font-size:10pt;margin:24px">

<p style="background:#fffbe6;border:1px solid #e0c000;padding:10px;max-width:900px;font-size:10pt">
<b>Cómo probar el pegado en Word:</b> seleccioná la tabla de abajo (clic antes del borde superior
izquierdo y arrastrá hasta el final, o <b>Ctrl+A</b> para toda la página) → <b>Ctrl+C</b> → abrí Word
y <b>Ctrl+V</b>. Debería entrar como <b>tabla de Word</b>, con el sombreado gris incluido y la columna
ÁREA fusionada por grupo (no repetida en cada fila).<br>
<b>Copiá el título y la tabla</b> — los recuadros de instrucciones no son parte del informe; si usás
Ctrl+A también se copian, borralos en Word.<br><br>
⚠️ <b>La fila de leyenda al pie no está acá</b> (es idéntica en todos los informes, así que se
conserva la de la plantilla). Pero en el Word esa leyenda es la <b>última fila de la propia tabla</b>,
no un párrafo suelto: si borrás la tabla vieja entera, se va con ella. Lo más simple es
<b>pegar la tabla nueva y después volver a pegar la fila de leyenda</b> de cualquier informe anterior
—o tenerla guardada aparte, porque nunca cambia.
</p>

<p style="text-align:center;font-weight:bold;text-decoration:underline">SÍNTESIS DEL RENDIMIENTO – PERFIL COGNITIVO</p>

<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:9pt">
  <tr>
    ${th('',  'border:none')}${th('','border:none')}${th('','border:none')}${th('','border:none')}
    ${thspan('Deterioro significativo',2,'background:'+GD)}
    ${thspan('Puntajes bajos',1,'background:'+GC)}
    ${thspan('Puntajes promedio',2)}
    ${thspan('Puntajes superiores',3)}
  </tr>
  <tr>
    ${th('ÁREA')}${th('PRUEBA')}${th('PB')}${th('Z')}
    ${th('&lt; -3','background:'+GD)}${th('-3 a -2','background:'+GD)}
    ${th('-2 a -1','background:'+GC)}
    ${th('-1 a 0')}${th('0 a +1')}${th('+1 a +2')}${th('+2 a +3')}${th('&gt; +3')}
  </tr>
${body}</table>

<p style="font-size:8pt;color:#888;max-width:1000px;margin-top:10px">
(La fila de leyenda al pie no se genera: es idéntica en todos los informes y se conserva la de la
plantilla. Ver la nota del recuadro de arriba.)
</p>

</body>`;
require('fs').writeFileSync(process.argv[2],html,'utf8');
console.error('filas='+rows.length);
