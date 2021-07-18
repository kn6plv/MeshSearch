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
    const key = url.toLowerCase();
    if (!this.seen[key]) {
      this.seen[key] = { status: 'pending', url: url };
      this.pending.push(url);
      this.emit('add', this.status());
    }
  }

  getNextUrl() {
    if (!this.pending.length) {
      return null;
    }
    const url = this.pending.shift();
    const key = url.toLowerCase();
    this.seen[key].status = 'active';
    this.active[key] = this.seen[key];
    this.emit('active', this.status());
    return url;
  }

  completeUrl(url, status) {
    const key = url.toLowerCase();
    delete this.active[key];
    this.seen[key].status = status || 'done';
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
