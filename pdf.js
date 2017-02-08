function openPDF() {
  let selector = "td.putable[sem=6][period=1][dow=2][block=2]";
  let $elems = $(selector);
  console.log($elems[0]);
  var dd = {
      pageSize: 'A4',
      //pageOrientation: 'landscape',
      // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
      pageMargins: [ 50, 30, 50, 30 ],
  	content: [
  				{ text: '\nHorários Ciência da Computação (1ª fase - matutino):\n\n', fontSize: 12, bold: true },

  				{
  						style: 'table',
  						table: {
  								headerRows: 1,
  								widths: [13, '*', '*', '*', '*', '*', '*'],
  								body: [
  									['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  									['1º', '', '', '', '', '', ''],
  									['2º','','','','','',''],
  									['3º','','','','','',''],
  									['4º','','','','','',''],
  									['5º','','','','','','']
  								]
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
  														},
  						},
  				},
  	],
  	styles: {
  		table: {
  		    alignment: 'center',
  			fontSize: 10,
  			bold: true,
  		},
  	},
  };
  //pdfMake.createPdf(dd).download('Horario.pdf');
}
