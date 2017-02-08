function periodName(number) {
  return ['', 'Matutino', 'Vespertino', 'Noturno'][number];
}

function openPDF() {
  var dd = {
      pageSize: 'A4',
      //pageOrientation: 'landscape',
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 50, 30, 50, 30 ],
      styles: {
    		table: {
    		    alignment: 'center',
    			fontSize: 10,
    			bold: true,
    		},
    	}
  };
  let sem, period, dow, block, hasContent;
  let content = [{ text: 'Horários Ciência da Computação:\n', fontSize: 12, bold: true }];
  for (sem = 0; sem < 10; sem++)
    for (period = 1; period <= 3; period++) {
      let week = [
        ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        ['1º', '', '', '', '', '', ''],
        ['2º', '', '', '', '', '', ''],
        ['3º', '', '', '', '', '', ''],
        ['4º', '', '', '', '', '', ''],
        ['5º', '', '', '', '', '', '']
      ];
      let map = {};
      for (hasContent = false, dow = 2; dow <= 7; dow++)
        for (block = 1; block <= 5; block++) {
            let selector = "td.putable[sem="+ sem + "][period="+ period + "][dow="+ dow + "][block="+ block +"] > div.draggable";
            let $elems = $(selector);
            if ($elems.length > 0 && hasContent === false) {
              hasContent = true;
              content.push({ text: '\n' + sem + 'º semestre - ' + periodName(period) + '\n', fontSize: 12, bold: true});
            }
            $.each($($elems), (i, elem) => {
              week[block][dow - 1] += attr(elem, 'code') + '\n';
              map[attr(elem, 'code')] = attr(elem, 'code') + ': ' + attr(elem, 'ccr') + ' - ' + attr(elem, 'professor');
            });
        }
      if (hasContent === true) {
        content.push({
          style: 'table',
          table: {
            headerRows: 1,
            widths: [13, '*', '*', '*', '*', '*', '*'],
            body: week
          },
          //layout: 'lightHorizontalLines'
          layout: {
            hLineWidth: function(i, node) {
              return (i === 1) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 2 : 1;
            },
            hLineColor: function(i, node) {
              if ( i === 1) return 'black';
              if ( i > 1 && i < node.table.body.length ) return 'gray';
              if ( i === 0 || i === node.table.body.length) return 'white';
            },
            vLineColor: function(i, node) {
              return (i < 2 || i === node.table.widths.length) ? 'white' : 'gray';
            }}});
        for (let key in map) {
          content.push({ text:  map[key] + '\n', fontSize: 8});
        }

      }
    }
  dd['content'] = content;
  pdfMake.createPdf(dd).download('Horario.pdf');
}
