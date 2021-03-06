const Config = require('../../config/crawl');
const Crypto = require('crypto');
const MeiliSearch = require('meilisearch');
const Log = require('debug')('search');

const MAX_PENDING = 16;
const WORD_LIMIT = 500;

class Page {
  constructor(page) {
    this.url = page.url.toString();
    this.title = page.getTitle().title;
    this.content_type = page.getContentType();
    this.main = page.getSignificantText().text;
    if (this.main) {
      const words = this.main.split(' ');
      if (words.length >= WORD_LIMIT) {
        // Split main into multiple attributes
        let idx = 0;
        for (let i = 0; i < words.length; i += WORD_LIMIT) {
          this[`main${idx === 0 ? '' : idx}`] = words.slice(i, i + WORD_LIMIT).join(' ');
          idx++;
        }
      }
    }
    this.links = page.getLinks().links.map(url => url.toString());
    const callsign = page.url.hostname.split('-')[0];
    if (/^(A[A-L]|K[A-Z]|N[A-Z]|W[A-Z]|K|N|W){1}\d{1}[A-Z]{1,3}$/i.exec(callsign)) {
      this.callsign = callsign.toUpperCase();
    }
    // Id needs to be unique but url contains invalid id characters - so hash it
    const hash = Crypto.createHash('sha1');
    hash.update(this.url);
    this.id = hash.digest('hex');
    this.last_index_time = Date.now();
  }
}

class SearchPageUpdate {

  constructor() {
    this.client = new MeiliSearch.MeiliSearch({
      host: Config.engineHost,
      apiKey: Config.key,
    });
    this.client.createIndex(Config.index, { primaryKey: 'id' }).catch(() => {});
    this.index = this.client.index(Config.index);
    this.pending = [];
  }

  addDoc(doc) {
    Log('addDoc:', doc.url.toString());
    this.pending.push(new Page(doc));
    if (this.pending.length >= MAX_PENDING) {
      this.flush();
    }
  }

  flush() {
    Log('Flush', this.pending.map(p => [ p.url, p.content_type ]));
    const p = this.pending;
    this.pending = [];
    this.index.addDocuments(p);
  }

}

module.exports = SearchPageUpdate;
