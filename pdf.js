function openPDF() {
  var dd = {
      pageSize: 'A4',
      /* [esquerda, cima, direita, baixo] */
      pageMargins: [50, 30, 50, 30],
      styles: {
    		table: {
    		  alignment: 'center',
    			fontSize: 10,
    			bold: true,
    		},
    	}
  };
  let sem, period, dow, block, hasContent;
  let content = [{text: 'Horários Ciência da Computação\n', fontSize: 12, bold: true, alignment: 'center'}];
  for (sem = 0; sem < 10; sem++)
    for (period = 1; period <= 3; period++) {
      let week = [
        ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
        ['1º', '', '', '', '', '', ''],
        ['2º', '', '', '', '', '', ''],
        ['3º', '', '', '', '', '', ''],
        ['4º', '', '', '', '', '', '']
      ];
      if (period < 3) week.push(['5º', '', '', '', '', '', '']);
      let captions = new Map();
      for (hasContent = false, dow = 2; dow <= 7; dow++)
        for (block = 1; block <= 5; block++) {
            let selector = "td.putable[sem="+ sem + "][period="+ period + "][dow="+ dow + "][block="+ block +"] > div.draggable";
            let $elems = $(selector);
            if ($elems.length > 0 && hasContent === false) {
              hasContent = true;
              content.push({ text: '\n' + sem + 'ª fase - ' + periodName(period) + '\n', fontSize: 12, bold: true});
            }
            $.each($($elems), (i, elem) => {
              week[block][dow - 1] += attr(elem, 'code') + '\n';
              captions.set(attr(elem, 'code'), attr(elem, 'ccr') + ' - ' + attr(elem, 'professor'));
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
          layout: {
            hLineWidth: function(i, node) {
              if (i === 0 || i === node.table.body.length) return 0;
              return 1;
            },
            vLineWidth: function(i, node) {
              if (i === 0 || i === node.table.widths.length) return 0;
              return 1;
            },
            hLineColor: function(i, node) {
              return i === 1 ? 'black' : 'gray';
            },
            vLineColor: function(i, node) {
              return i === 1 ? 'black' : 'gray';
            }
          }});
        for (let [code, label] of captions) {
          content.push({ text: code + ': ' + label + '\n', fontSize: 8});
        }
      }
    }
  dd['content'] = content;
  pdfMake.createPdf(dd).download('Horários.pdf');
}
