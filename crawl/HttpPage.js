const Config = require('../config/crawl')
const Log = require('debug')('page');
const HTTP = require('http');
const HtmlParser = require('node-html-parser');
const ExtractHTMLLinks = require('./extract/HTMLLinks');
const ExtractText = require('./extract/Text');
const ExtractTitle = require('./extract/Title');

const MAX_REDIRECT = Config.maxRedirect;
const GET_TIMEOUT = Config.getTimeout * 1000;

class HttpPage {

  static ERROR_CODE = {
    ERROR: -1,
    BAD_PROTOCOL: -2,
    HOST_NOT_FOUND: -3,
    HOST_UNREACHABLE: -4,
  }

  constructor(config) {
    this.url = new URL(config.url);
    this.statusCode = 0;
    this.waiting = [];
    this.dns = config.dns;
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
      for (let i = MAX_REDIRECT; i > 0; i--) {
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
            this.url = new URL(this.headers['location'], this.url);
            continue;
          default:
            break;
        }
        break;
      }

      if (this.statusCode === 200) {
        const contentType = this.getContentType();
        if (contentType === 'text/html') {
          this.html = HtmlParser.parse(this.data);
        }
        else if (contentType === 'text/plain') {
          this.text = this.data;
        }
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
    this.data = '';
    return new Promise((resolve, reject) => {
      let req;
      const timeout = setTimeout(() => {
        if (req) {
          req.destroy(new Error('timeout'));
        }
      }, GET_TIMEOUT);
      req = HTTP.get(this.url, { lookup: this.dns }, res => {
        this.statusCode = res.statusCode;
        this.headers = res.headers;
        const contentType = this.getContentType();
        if (contentType === 'text/html' || contentType === 'text/plain') {
          res.setEncoding('utf8');
          res.on('data', chunk => this.data += chunk);
          res.on('end', () => {
            clearTimeout(timeout);
            req = null;
            resolve();
          });
        }
        else {
          clearTimeout(timeout);
          req.destroy();
          req = null;
          resolve();
        }
      });
      req.on('error', e => {
        clearTimeout(timeout);
        req = null;
        console.log(e);
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
      this.links = new ExtractHTMLLinks(this);
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

module.exports = HttpPage;
