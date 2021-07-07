const Log = require('debug')('q');
const EventEmitter = require('events');

class UrlQ extends EventEmitter {

  constructor() {
    super();
    this.seen = {};
    this.pending = [];
    this.active = {};
  }

  addURL(url) {
    url = url.toLowerCase();
    if (!this.seen[url]) {
      this.seen[url] = { status: 'pending' };
      this.pending.push(url);
      this.emit('add', this.status());
    }
  }

  getNextUrl() {
    if (!this.pending.length) {
      return null;
    }
    const next = this.pending.shift();
    this.seen[next].status = 'active';
    this.active[next] = this.seen[next];
    this.emit('active', this.status());
    return next;
  }

  completeUrl(url, status) {
    url = url.toLowerCase();
    delete this.active[url];
    this.seen[url].status = status || 'done';
    this.emit('complete', this.status());
  }

  status() {
    return {
      seen: Object.keys(this.seen).length,
      pending: this.pending.length,
      active: Object.keys(this.active).length
    };
  }

}

module.exports = UrlQ;
