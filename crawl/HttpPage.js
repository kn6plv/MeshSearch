const Config = require('../config/crawl')
const Log = require('debug')('page');
const HTTP = require('http');
const HtmlParser = require('node-html-parser');
const ExtractLinks = require('./extract/Links');
const ExtractText = require('./extract/Text');
const ExtractTitle = require('./extract/Title');
const PDF = require('./extract/PDF');

const USER_AGENT = Config.userAgent;
const GET_TIMEOUT = Config.getProgressTimeout * 1000;
const GET_OVER_TIMEOUT = Config.getTimeout * 1000;

let dnsLookup;

class HttpPage {

  static ERROR_CODE = {
    ERROR: -1,
    BAD_PROTOCOL: -2,
    HOST_NOT_FOUND: -3,
    HOST_UNREACHABLE: -4,
    TIMEOUT: -5
  }

  constructor(config) {
    this.url = new URL(config.url);
    this.statusCode = 0;
    this.waiting = [];
    setTimeout(async () => {
      try {
        await this.run();
      }
      catch (e) {
        Log(e);
      }
      this.waiting.forEach(wait => wait(this.statusCode));
      this.waiting = null;
    }, 0);
  }

  async getStatus() {
    if (this.statusCode !== 0) {
      return this.statusCode;
    }
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  async run() {
    try {
      if (this.url.protocol !== 'http:') {
        this.statusCode = HttpPage.ERROR_CODE.BAD_PROTOCOL;
        throw new Error(`bad protocol`);
      }
      // Fetch the page
      await this.fetch();
      // Handle status code redirects
      switch (this.statusCode) {
        case 301:
        case 302:
        case 303:
        case 307:
        case 308:
          this.redirect = this.headers['location'];
          break;
        case 200:
          switch (this.getContentType()) {
            case 'text/html':
              this.html = HtmlParser.parse(this.data.toString('utf8'));
              break;
            case 'text/plain':
              this.text = this.data.toString('utf8');
              break;
            case 'application/pdf':
              this.pdf = await PDF.parse(this.data);
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
    catch (e) {
      if (this.statusCode === 0) {
        this.statusCode = HttpPage.ERROR_CODE.ERROR;
      }
      throw new Error(`fetch error: ${this.statusCode}`);
    }
  }

  async fetch() {
    this.statusCode = 0;
    this.headers = [];
    this.data = null;
    return new Promise((resolve, reject) => {
      let req = null;
      let res = null;
      let timeout = null;
      let otimeout = null;
      const timeoutfn = () => {
        Log('timeout:', this.url.toString());
        this.data = null;
        this.statusCode = HttpPage.ERROR_CODE.TIMEOUT;
        if (req) {
          req.destroy(new Error('timeout'));
        }
        if (res) {
          res.destroy(new Error('timeout'));
        }
      };
      const restartTimeout = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(timeoutfn, GET_TIMEOUT);
        if (!otimeout) {
          otimeout = setTimeout(timeoutfn, GET_OVER_TIMEOUT);
        }
      }
      restartTimeout();
      Log('get:', this.url.toString());
      req = HTTP.get(this.url, { lookup: dnsLookup, headers: { 'User-Agent': USER_AGENT } }, r => {
        res = r;
        this.statusCode = res.statusCode;
        this.headers = res.headers;
        switch (this.getContentType()) {
          case 'text/html':
          case 'text/plain':
          case 'application/pdf':
            this.data = Buffer.alloc(0);
            res.on('data', chunk => {
              restartTimeout();
              this.data = Buffer.concat([this.data, chunk]);
            });
            res.on('end', () => {
              clearTimeout(timeout);
              clearTimeout(otimeout);
              resolve();
            });
            break;
          default:
            clearTimeout(timeout);
            clearTimeout(otimeout);
            res.destroy();
            req.destroy();
            resolve();
            break;
        }
      });
      req.on('error', e => {
        clearTimeout(timeout);
        clearTimeout(otimeout);
        if (res) {
          res.destroy(e);
        }
        Log(`get error: ${e}`);
        switch (e.code) {
          case 'EHOSTUNREACH':
            this.statusCode = HttpPage.ERROR_CODE.HOST_UNREACHABLE;
            break;
          case 'ENOTFOUND':
            this.statusCode = HttpPage.ERROR_CODE.HOST_NOT_FOUND;
            break;
          case 'ECONNRESET':
          default:
            this.statusCode = HttpPage.ERROR_CODE.ERROR;
            break;
        }
        reject(e);
      });
      req.end();
    });
  }

  getLinks() {
    if (!this.links) {
      this.links = new ExtractLinks(this);
    }
    return this.links;
  }

  getTitle() {
    if (!this.title) {
      this.title = new ExtractTitle(this);
    }
    return this.title;
  }

  getSignificantText() {
    if (!this.text) {
      this.text = new ExtractText(this);
    }
    return this.text;
  }

  getContentType() {
    return (this.headers['content-type'] || '').split(';')[0];
  }

}

HttpPage.setDNS = function(lookup) {
  dnsLookup = lookup;
}

module.exports = HttpPage;
