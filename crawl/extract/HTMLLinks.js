const Log = require('debug')('links');

class ExtractHTMLLinks {

  constructor(page) {
    this.page = page;
    this.links = [];
    this.run();
  }

  run() {
    if (this.page.html) {
      this.extractAnchors();
      this.extractWindowLocations();
      this.extractMetas();
      this.extractImages();
    }
  }

  extractAnchors() {
    this.page.html.querySelectorAll('a').forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (href) {
        this.links.push(this.fixUrl(href));
      }
    });
  }

  extractWindowLocations() {
    this.page.html.querySelectorAll('[onclick]').forEach(elem => {
      const location = /^.*window.location\s*=\s*['"]([-a-z0-9@:%._\\+~#?&//=]+).*$/i.exec(elem.getAttribute('onclick'));
      if (location) {
        this.links.push(this.fixUrl(location[1]));
      }
    })
  }

  extractMetas() {
    this.page.html.querySelectorAll('meta[http-equiv="refresh"]').forEach(elem => {
      const url = elem.getAttribute('url');
      if (url) {
        this.links.push(this.fixUrl(url));
      }
    });
  }

  extractImages() {
    this.page.html.querySelectorAll('img').forEach(anchor => {
      const src = anchor.getAttribute('src');
      if (src) {
        this.links.push(this.fixUrl(src));
      }
    });
  }

  fixUrl(url) {
    return new URL(url, this.page.url);
  }

}

module.exports = ExtractHTMLLinks;
