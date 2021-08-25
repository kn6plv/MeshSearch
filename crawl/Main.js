#! /usr/bin/env node

const Log = require('debug')('main');
const Config = require('../config/crawl');
const DNS = require('dns');
const HttpPage = require('./HttpPage');
const UrlQ = require('./UrlQ');
const SearchPageUpdate = require('./search/PageUpdate');
const SearchSelector = require('./search/Selector');
const Robots = require('./search/Robots');

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const u = new SearchPageUpdate();

if (Config.dns) {
  const resolver = new DNS.Resolver();
  resolver.setServers(Config.dns);
  const lookup = (hostname, _, callback) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err) {
        callback(err);
      }
      else {
        callback(null, addresses[0], 4);
      }
    });
  }
  HttpPage.setDNS(lookup);
}

function crawl() {
  const q = new UrlQ();
  let running = 0;
  q.on('add', async _ => {
    if (running < Config.threads) {
      running++;
      try {
        for (;;) {
          const url = q.getNextUrl();
          if (!url) {
            break;
          }
          const page = new HttpPage({ url: url });
          Log(url);
          switch (await page.getStatus()) {
            case 200:
            case 301:
            case 302:
            case 303:
            case 307:
            case 308:
              if (SearchSelector.includePageLinks(page)) {
                const urls = page.getLinks().links;
                urls.forEach(url => {
                  if (SearchSelector.includeUrl(url, page.url)) {
                    const nurl = `${url.origin}${url.pathname}${url.search}`;
                    if (!q.visited(nurl)) {
                      Robots.canCrawl(nurl).then(okay => okay && q.addURL(nurl));
                    }
                  }
                });
              }
              q.completeUrl(url);
              if (SearchSelector.includePageInSearch(page)) {
                u.addDoc(page);
              }
              break;
            default:
              q.completeUrl(url, 'error');
              break;
          }
        }
      }
      finally {
        running--;
        if (running === 0) {
          u.flush();
        }
      }
    }
  });
  q.addURL(Config.root);
}

setInterval(crawl, Config.crawlFrequency * 1000);
crawl();
