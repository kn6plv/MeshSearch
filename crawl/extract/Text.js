const HTML2Text = require('html-to-text');

class ExtractText {

  constructor(page) {
    this.page = page;
    this.run();
  }

  run() {
    if (this.page.html) {
      this.text = HTML2Text.convert(this.page.html, {
        wordwrap: false,
        selectors: [
          { selector: 'a', options: { ignoreHref: true } },
          { selector: 'img', format: 'skip' }
        ]
      });
    }
    else if (this.page.text) {
      this.text = this.page.text;
    }
    else if (this.page.pdf) {
      this.text = this.page.pdf.text;
    }
  }
}

module.exports = ExtractText;
