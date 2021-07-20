const PDFJS = require('pdfjs-dist/legacy/build/pdf.js');

const PDF = {

  async parse(buffer) {
    let text = '';
    const pdf = await PDFJS.getDocument(Uint8Array.from(buffer)).promise;
    const nrPages = pdf.numPages;
    for (let i = 1; i <= nrPages; i++) {
      const page = await pdf.getPage(i);
      const pageText = await page.getTextContent();
      text += ' ' + pageText.items.map(item => item.str).join(' ');
    }
    return {
      pdf: pdf,
      text: text
    };
  }

};

module.exports = PDF;
