const Config = require('../../config/crawl');
const Crypto = require('crypto');
const MeiliSearch = require('meilisearch');

class Page {
  constructor(page) {
    this.url = page.url.toString();
    this.title = page.getTitle().title;
    this.content_type = page.getContentType();
    this.main = page.getSignificantText().text;
    this.links = page.getLinks().links.map(url => url.toString());
    const callsign = page.url.hostname.split('-')[0];
    if (/^(A[A-L]|K[A-Z]|N[A-Z]|W[A-Z]|K|N|W){1}\d{1}[A-Z]{1,3}$/i.exec(callsign)) {
      this.callsign = callsign.toUpperCase();
    }
    // Id needs to be unique but url contains invalid id characters - so hash it
    const hash = Crypto.createHash('sha1');
    hash.update(this.url);
    this.id = hash.digest('hex');
  }
}

class SearchPageUpdate {

  constructor() {
    this.client = new MeiliSearch.MeiliSearch({
      host: Config.engineHost,
      apiKey: Config.privateKey,
    });
    this.client.createIndex(Config.index, { primaryKey: 'id' }).catch(() => {});
    this.index = this.client.index(Config.index);
  }

  addDoc(doc) {
    this.index.addDocuments([ new Page(doc) ]);
  }

}

module.exports = SearchPageUpdate;
